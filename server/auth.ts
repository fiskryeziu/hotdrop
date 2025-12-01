import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './index.ts';
import { user, account, session, verification } from './auth-schema.ts';
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      account,
      session,
      verification,
    },
  }),
  plugins: [admin()],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    // useSecureCookies: true,
    disableCSRFCheck: true,
    // disableOriginCheck:true
  },
  // trustedOrigins: [
  //   'http://localhost:3000', // Your primary app URL
  //   'http://127.0.0.1:3000', // Common localhost variant
  //   // ⚠️ MUST INCLUDE 'null' to support tools like Postman/cURL
  //   'null',
  // ],
});
