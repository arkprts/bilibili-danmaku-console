import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/bilibili_danmaku',
  },
} satisfies Config;
