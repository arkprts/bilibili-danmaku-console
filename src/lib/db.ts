import Dexie, { type EntityTable } from 'dexie';

export interface Danmaku {
  id?: number;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'danmaku' | 'gift' | 'sc' | 'superchat';
  giftName?: string;
  giftCount?: number;
  scAmount?: number;
  userAvatar?: string;
  isVerified?: boolean;
  userTitle?: string;
}

export interface Room {
  id?: number;
  roomId: string;
  roomName: string;
  anchorName: string;
  anchorAvatar?: string;
  createdAt: number;
  lastVisitAt: number;
}

export interface UserSettings {
  id?: number;
  key: string;
  value: unknown;
}

const db = new Dexie('BilibiliDanmakuDB') as Dexie & {
  danmaku: EntityTable<Danmaku, 'id'>;
  rooms: EntityTable<Room, 'id'>;
  settings: EntityTable<UserSettings, 'id'>;
};

db.version(1).stores({
  danmaku: '++id, roomId, timestamp, type',
  rooms: '++id, roomId, lastVisitAt',
  settings: '++id, key',
});

export { db };
