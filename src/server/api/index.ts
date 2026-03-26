import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from '@/server/db';
import { rooms, danmaku } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/api/rooms/:roomId', async (c) => {
  const roomId = c.req.param('roomId');

  try {
    const room = await db.query.rooms.findFirst({
      where: eq(rooms.roomId, roomId),
    });

    if (!room) {
      const newRoom = await db.insert(rooms).values({
        roomId,
        roomName: `直播间 ${roomId}`,
        anchorName: '未知主播',
      }).returning();

      return c.json(newRoom[0]);
    }

    return c.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return c.json({ error: 'Failed to fetch room' }, 500);
  }
});

app.get('/api/rooms/:roomId/danmaku', async (c) => {
  const roomId = c.req.param('roomId');
  const limit = parseInt(c.req.query('limit') || '100');

  try {
    const danmakuList = await db.query.danmaku.findMany({
      where: eq(danmaku.roomId, roomId),
      orderBy: [desc(danmaku.timestamp)],
      limit,
    });

    return c.json(danmakuList);
  } catch (error) {
    console.error('Error fetching danmaku:', error);
    return c.json({ error: 'Failed to fetch danmaku' }, 500);
  }
});

app.post('/api/rooms/:roomId/danmaku', async (c) => {
  const roomId = c.req.param('roomId');

  try {
    const body = await c.req.json();

    const newDanmaku = await db.insert(danmaku).values({
      roomId,
      userId: body.userId,
      username: body.username,
      content: body.content,
      type: body.type || 'danmaku',
      giftName: body.giftName,
      giftCount: body.giftCount,
      scAmount: body.scAmount,
      userAvatar: body.userAvatar,
      isVerified: body.isVerified,
      userTitle: body.userTitle,
    }).returning();

    return c.json(newDanmaku[0]);
  } catch (error) {
    console.error('Error creating danmaku:', error);
    return c.json({ error: 'Failed to create danmaku' }, 500);
  }
});

app.patch('/api/rooms/:roomId', async (c) => {
  const roomId = c.req.param('roomId');

  try {
    const body = await c.req.json();

    const updatedRoom = await db.update(rooms)
      .set({
        roomName: body.roomName,
        anchorName: body.anchorName,
        anchorAvatar: body.anchorAvatar,
        onlineCount: body.onlineCount,
        fansCount: body.fansCount,
        updatedAt: new Date(),
      })
      .where(eq(rooms.roomId, roomId))
      .returning();

    return c.json(updatedRoom[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    return c.json({ error: 'Failed to update room' }, 500);
  }
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

export default app;
