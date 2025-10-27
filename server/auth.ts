import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './index.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
});
