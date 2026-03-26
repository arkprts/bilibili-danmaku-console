import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { room_id: string } }
) {
  const roomId = params.room_id;

  if (!roomId) {
    return NextResponse.json({ error: 'Missing room_id' }, { status: 400 });
  }

  try {
    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://live.bilibili.com/',
      'Origin': 'https://live.bilibili.com',
      'Cookie': 'SESSDATA=; bili_jct=;',
    };

    const [roomInfo, roomInit] = await Promise.all([
      fetch(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`, {
        headers: browserHeaders,
      }).then(async r => {
        const text = await r.text();
        try { return JSON.parse(text); } catch { return { code: -1, error: text }; }
      }),
      fetch(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${roomId}`, {
        headers: browserHeaders,
      }).then(async r => {
        const text = await r.text();
        try { return JSON.parse(text); } catch { return { code: -1, error: text }; }
      }),
    ]);

    const realRoomId = roomInit.data?.room_id || roomId;

    let danmuConf = { code: -1, data: null };
    try {
      const danmuResponse = await fetch(`https://api.live.bilibili.com/api/room/v1/Danmu/getConf?room_id=${realRoomId}`, {
        headers: browserHeaders,
      });
      const danmuText = await danmuResponse.text();
      console.log('[API] Danmu conf response:', danmuText.substring(0, 200));
      try {
        danmuConf = JSON.parse(danmuText);
      } catch {
        danmuConf = { code: -1, data: null };
      }
    } catch (e) {
      console.error('[API] Danmu conf error:', e);
    }

    return NextResponse.json({
      roomInfo,
      roomInit,
      danmuConf,
      realRoomId,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
