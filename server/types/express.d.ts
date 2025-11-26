import 'express';
import type { Session } from 'better-auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: Session;
  }
}
