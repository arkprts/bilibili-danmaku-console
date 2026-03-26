'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore, type DanmakuItem } from '@/store';
import { db, type Danmaku } from '@/lib/db';

interface UseDanmakuConnectionOptions {
  roomId: string;
  enabled?: boolean;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface BilibiliDanmaku {
  cmd: string;
  data?: {
    uname?: string;
    uid?: number;
    msg?: string;
    content?: string;
    giftName?: string;
    num?: number;
    total_coin?: number;
    coin_type?: string;
    face?: string;
    guard_level?: number;
    fans_medal?: {
      medal_name?: string;
      anchor_roomid?: number;
    };
    title?: string[];
    badge?: {
      badge_name?: string;
      special?: string;
    };
  };
}

interface RoomInfoData {
  room_id: number;
  short_id: number;
  uid: number;
  live_status: number;
  title: string;
  anchor_name: string;
  online: number;
  face: string;
  area_name: string;
}

interface DanmuConf {
  code: number;
  data: {
    token: string;
    host_list: Array<{
      host: string;
      port: number;
    }>;
  };
}

function decodeMessage(buffer: ArrayBuffer): string[] {
  const messages: string[] = [];
  const view = new DataView(buffer);
  const packetLength = view.getUint32(0, true);

  if (packetLength === 0) return messages;

  const protocolVersion = view.getUint16(6, true);
  const operation = view.getUint32(8, true);

  if (operation === 5 || operation === 3 || operation === 8) {
    if (protocolVersion === 2) {
      try {
        const pako = require('pako');
        const decompressed = pako.inflate(new Uint8Array(buffer.slice(16)));
        return decodeMessage(decompressed.buffer);
      } catch {}
    } else {
      try {
        const data = new TextDecoder().decode(buffer.slice(16));
        if (data) messages.push(data);
      } catch {}
    }
  }

  return messages;
}

function createPacket(body: Uint8Array, operation: number): Uint8Array {
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

function createHeartbeat(): Uint8Array {
  const header = new ArrayBuffer(16);
  const view = new DataView(header);

  view.setUint32(0, 16, true);
  view.setUint16(4, 16, true);
  view.setUint16(6, 1, true);
  view.setUint32(8, 2, true);
  view.setUint32(12, 1, true);

  return new Uint8Array(header);
}

export function useDanmakuConnection({ roomId, enabled = true }: UseDanmakuConnectionOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isUnmountedRef = useRef(false);
  const currentRoomIdRef = useRef<string>(roomId);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    addDanmaku,
    addGift,
    addSC,
    setConnected,
    setConnecting,
    setConnectionError,
    setCurrentRoom,
  } = useAppStore();

  const processDanmaku = useCallback((item: BilibiliDanmaku) => {
    const id = generateId();
    const timestamp = Date.now();
    const roomId = currentRoomIdRef.current;

    switch (item.cmd) {
      case 'DANMU_MSG': {
        const baseItem: DanmakuItem = {
          id,
          roomId,
          userId: String(item.data?.uid || 'unknown'),
          username: item.data?.uname || '匿名用户',
          content: item.data?.msg || item.data?.content || '',
          timestamp,
          type: 'danmaku',
          userAvatar: item.data?.face,
        };

        if (item.data?.title && item.data.title.length > 0) {
          baseItem.userTitle = item.data.title[0];
        }

        addDanmaku(baseItem);

        db.danmaku.add({
          roomId,
          userId: baseItem.userId,
          username: baseItem.username,
          content: baseItem.content,
          timestamp,
          type: 'danmaku',
          userAvatar: baseItem.userAvatar,
          userTitle: baseItem.userTitle,
        } as Danmaku);
        break;
      }

      case 'SEND_GIFT':
      case 'GIFT_TOP':
      case 'GIFT_STAR_CLOCK_TIME': {
        if (item.data) {
          const giftItem: DanmakuItem = {
            id,
            roomId,
            userId: String(item.data.uid || 'unknown'),
            username: item.data.uname || '匿名用户',
            content: `赠送了 ${item.data.giftName || '礼物'} x${item.data.num || 1}`,
            timestamp,
            type: 'gift',
            giftName: item.data.giftName,
            giftCount: item.data.num,
            userAvatar: item.data.face,
          };

          addGift(giftItem);

          db.danmaku.add({
            roomId,
            userId: giftItem.userId,
            username: giftItem.username,
            content: giftItem.content,
            timestamp,
            type: 'gift',
            giftName: giftItem.giftName,
            giftCount: giftItem.giftCount,
            userAvatar: giftItem.userAvatar,
          } as Danmaku);
        }
        break;
      }

      case 'SUPER_CHAT_MESSAGE':
      case 'SUPER_CHAT_MESSAGE_JP': {
        if (item.data) {
          const scItem: DanmakuItem = {
            id,
            roomId,
            userId: String(item.data.uid || 'unknown'),
            username: item.data.uname || '匿名用户',
            content: item.data.msg || item.data.content || '',
            timestamp,
            type: 'sc',
            scAmount: item.data.total_coin ? Math.floor(item.data.total_coin / 100) : 0,
            userAvatar: item.data.face,
          };

          addSC(scItem);

          db.danmaku.add({
            roomId,
            userId: scItem.userId,
            username: scItem.username,
            content: scItem.content,
            timestamp,
            type: 'sc',
            scAmount: scItem.scAmount,
            userAvatar: scItem.userAvatar,
          } as Danmaku);
        }
        break;
      }

      case 'USER_TOAST_MSG': {
        if (item.data) {
          const giftItem: DanmakuItem = {
            id,
            roomId,
            userId: String(item.data.uid || 'unknown'),
            username: item.data.uname || '匿名用户',
            content: `上舰了！`,
            timestamp,
            type: 'gift',
            giftName: '舰长',
            giftCount: 1,
            userAvatar: item.data.face,
          };

          addGift(giftItem);
        }
        break;
      }

      case 'LIVE':
      case 'PREPARING': {
        break;
      }

      default:
        break;
    }
  }, [addDanmaku, addGift, addSC]);

  const connect = useCallback(async () => {
    if (!enabled) return;

    const roomIdNum = parseInt(roomId);
    if (isNaN(roomIdNum)) {
      setConnectionError('无效的直播间ID');
      return;
    }

    currentRoomIdRef.current = roomId;
    isUnmountedRef.current = false;
    setConnecting(true);
    setConnectionError(null);

    try {
      const apiResponse = await fetch(`/api/room/${roomIdNum}`);
      const apiData = await apiResponse.json();

      if (!apiData.roomInfo || apiData.roomInfo.code !== 0) {
        setConnectionError('获取房间信息失败，请检查直播间ID');
        setConnecting(false);
        return;
      }

      const roomData: RoomInfoData = apiData.roomInfo.data;
      const realRoomId = apiData.realRoomId;

      setCurrentRoom({
        roomId: String(roomData.room_id),
        roomName: roomData.title,
        anchorName: roomData.anchor_name,
        anchorAvatar: roomData.face,
        onlineCount: roomData.online,
      });

      const danmuConf = apiData.danmuConf;

      if (danmuConf.code !== 0 || !danmuConf.data?.host_list?.length) {
        setConnectionError('弹幕服务暂时不可用，请稍后重试');
        setConnecting(false);
        setCurrentRoom({
          roomId: String(roomData.room_id),
          roomName: roomData.title,
          anchorName: roomData.anchor_name,
          anchorAvatar: roomData.face,
          onlineCount: roomData.online,
        });
        return;
      }

      const { token, host_list } = danmuConf.data;
      const host = host_list[0];
      const wsUrl = `wss://${host}/sub`;

      console.log('[Danmaku] Connecting to Bilibili WS:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Danmaku] Connected to Bilibili');

        const joinBody = JSON.stringify({
          roomid: realRoomId,
          uid: 0,
          protover: 3,
          platform: 'web',
          clientver: '2.6.35',
          token: token,
        });

        const joinPacket = createPacket(new TextEncoder().encode(joinBody), 7);
        ws.send(joinPacket);
        console.log('[Danmaku] Join packet sent');

        setConnecting(false);
        setConnected(true);

        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(createHeartbeat());
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') return;

        try {
          const messages = decodeMessage(event.data);

          for (const msg of messages) {
            try {
              const parsed = JSON.parse(msg);
              if (parsed.cmd) {
                processDanmaku(parsed);
              }
            } catch {}
          }
        } catch {}
      };

      ws.onerror = (error) => {
        console.error('[Danmaku] Error:', error);
        setConnectionError('WebSocket连接失败');
      };

      ws.onclose = () => {
        console.log('[Danmaku] Disconnected');
        setConnected(false);

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        if (!isUnmountedRef.current && enabled) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountedRef.current) {
              connect();
            }
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[Danmaku] Connection error:', error);
      setConnectionError('连接失败，请检查网络');
      setConnecting(false);
    }
  }, [enabled, roomId, setConnected, setConnecting, setConnectionError, setCurrentRoom, processDanmaku]);

  const disconnect = useCallback(() => {
    isUnmountedRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
  }, [setConnected, setConnecting]);

  const sendDanmaku = useCallback((content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, roomId, connect, disconnect]);

  return {
    disconnect,
    sendDanmaku,
  };
}
