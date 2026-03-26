import { pgTable, text, timestamp, integer, boolean, serial } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull().unique(),
  roomName: text('room_name').notNull(),
  anchorName: text('anchor_name').notNull(),
  anchorAvatar: text('anchor_avatar'),
  onlineCount: integer('online_count').default(0),
  fansCount: integer('fans_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const danmaku = pgTable('danmaku', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  type: text('type').notNull(),
  giftName: text('gift_name'),
  giftCount: integer('gift_count'),
  scAmount: integer('sc_amount'),
  userAvatar: text('user_avatar'),
  isVerified: boolean('is_verified').default(false),
  userTitle: text('user_title'),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  username: text('username').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Room = typeof rooms.$inferSelect;
export type Danmaku = typeof danmaku.$inferSelect;
export type User = typeof users.$inferSelect;
