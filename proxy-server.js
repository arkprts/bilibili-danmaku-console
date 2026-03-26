const WebSocket = require('ws');
const http = require('http');
const pako = require('pako');

const PROXY_PORT = 3002;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const connections = new Map();

function decodeMessage(buffer) {
  const messages = [];
  const view = new DataView(buffer);
  const packetLength = view.getUint32(0, true);

  if (packetLength === 0) return messages;

  const protocolVersion = view.getUint16(6, true);
  const operation = view.getUint32(8, true);

  if (operation === 5 || operation === 3 || operation === 8) {
    if (protocolVersion === 2) {
      try {
        const decompressed = pako.inflate(new Uint8Array(buffer.slice(16)));
        const decompressedMessages = decodeMessage(decompressed.buffer);
        messages.push(...decompressedMessages);
      } catch (e) {
        console.error('[Proxy] Decompress error:', e.message);
      }
    } else {
      try {
        const data = new TextDecoder().decode(buffer.slice(16));
        if (data) messages.push(data);
      } catch (e) {
        console.error('[Proxy] Decode error:', e.message);
      }
    }
  }

  return messages;
}

function createPacket(body, operation) {
  const header = new ArrayBuffer(16);
  const view = new DataView(header);

  view.setUint32(0, 16 + body.length, true);
  view.setUint16(4, 16, true);
  view.setUint16(6, 1, true);
  view.setUint32(8, operation, true);
  view.setUint32(12, 1, true);

  const packet = new Uint8Array(16 + body.length);
  packet.set(new Uint8Array(header), 0);
  packet.set(body, 16);

  return packet;
}

function createHeartbeat() {
  const header = new ArrayBuffer(16);
  const view = new DataView(header);

  view.setUint32(0, 16, true);
  view.setUint16(4, 16, true);
  view.setUint16(6, 1, true);
  view.setUint32(8, 2, true);
  view.setUint32(12, 1, true);

  return new Uint8Array(header);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PROXY_PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  if (url.pathname === '/api/room-info') {
    const roomId = url.searchParams.get('room_id');
    if (!roomId) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...CORS_HEADERS });
      res.end(JSON.stringify({ error: 'Missing room_id' }));
      return;
    }

    fetch(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`)
      .then(response => response.json())
      .then(data => {
        res.writeHead(200, { 'Content-Type': 'application/json', ...CORS_HEADERS });
        res.end(JSON.stringify(data));
      })
      .catch(error => {
        console.error('[Proxy] API error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json', ...CORS_HEADERS });
        res.end(JSON.stringify({ error: 'Failed to fetch room info' }));
      });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain', ...CORS_HEADERS });
  res.end('WebSocket Proxy Server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('[Proxy] Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'join') {
        const roomId = data.roomId;
        console.log('[Proxy] Client wants to join room:', roomId);

        if (connections.has(ws)) {
          const oldConn = connections.get(ws);
          oldConn.ws.close();
          clearInterval(oldConn.heartbeatInterval);
        }

        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://live.bilibili.com/',
          'Origin': 'https://live.bilibili.com',
        };

        fetch(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${roomId}`, { headers })
          .then(r => r.json())
          .then(roomInit => {
            const realRoomId = roomInit.data?.room_id || roomId;
            console.log('[Proxy] Real room ID:', realRoomId);

            return fetch(`https://api.live.bilibili.com/api/room/v1/Danmu/getConf?room_id=${realRoomId}`, { headers });
          })
          .then(r => r.json())
          .then(conf => {
            if (conf.code !== 0) {
              console.error('[Proxy] Failed to get conf:', conf);
              ws.send(JSON.stringify({ type: 'error', message: 'Failed to get room config' }));
              return;
            }

            const { token, host_list } = conf.data;
            if (!host_list || host_list.length === 0) {
              console.error('[Proxy] No hosts available');
              ws.send(JSON.stringify({ type: 'error', message: 'No hosts available' }));
              return;
            }

            const host = host_list[0];
            const wsUrl = `wss://${host}/sub`;
            console.log('[Proxy] Connecting to:', wsUrl);

            const bilibiliWs = new WebSocket(wsUrl);

            bilibiliWs.onopen = () => {
              console.log('[Proxy] Connected to Bilibili, sending join packet');

              const joinBody = JSON.stringify({
                roomid: parseInt(roomId),
                uid: 0,
                protover: 3,
                platform: 'web',
                clientver: '2.6.35',
                token: token,
              });

              const joinPacket = createPacket(new TextEncoder().encode(joinBody), 7);
              bilibiliWs.send(joinPacket);
              console.log('[Proxy] Join packet sent');

              const heartbeatInterval = setInterval(() => {
                if (bilibiliWs.readyState === WebSocket.OPEN) {
                  bilibiliWs.send(createHeartbeat());
                }
              }, 30000);

              connections.set(ws, { ws: bilibiliWs, heartbeatInterval });
            };

            bilibiliWs.onmessage = (event) => {
              if (typeof event.data === 'string') {
                return;
              }

              try {
                const messages = decodeMessage(event.data);

                for (const msg of messages) {
                  try {
                    const parsed = JSON.parse(msg);
                    if (parsed.cmd) {
                      ws.send(JSON.stringify({ type: 'danmaku', data: parsed }));
                    }
                  } catch (e) {
                  }
                }
              } catch (e) {
                console.error('[Proxy] Message decode error:', e.message);
              }
            };

            bilibiliWs.onerror = () => {
              console.error('[Proxy] Bilibili WS error');
              ws.send(JSON.stringify({ type: 'error', message: 'Connection failed' }));
            };

            bilibiliWs.onclose = (event) => {
              console.log('[Proxy] Bilibili WS closed, code:', event.code);
              const conn = connections.get(ws);
              if (conn) {
                clearInterval(conn.heartbeatInterval);
                connections.delete(ws);
              }
              ws.send(JSON.stringify({ type: 'closed' }));
            };
          })
          .catch(error => {
            console.error('[Proxy] Failed to fetch conf:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to connect' }));
          });
      }

      if (data.type === 'heartbeat') {
        const conn = connections.get(ws);
        if (conn && conn.ws.readyState === WebSocket.OPEN) {
          conn.ws.send(createHeartbeat());
        }
      }
    } catch (error) {
      console.error('[Proxy] Message error:', error.message);
    }
  });

  ws.on('close', () => {
    console.log('[Proxy] Client disconnected');
    const conn = connections.get(ws);
    if (conn) {
      clearInterval(conn.heartbeatInterval);
      conn.ws.close();
      connections.delete(ws);
    }
  });
});

server.listen(PROXY_PORT, () => {
  console.log(`[Proxy] WebSocket proxy server running on ws://localhost:${PROXY_PORT}/ws`);
  console.log(`[Proxy] Room info API: http://localhost:${PROXY_PORT}/api/room-info?room_id=xxx`);
});
