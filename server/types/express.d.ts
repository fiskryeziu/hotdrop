import 'express';
import type { AdminOptions } from 'better-auth/plugins';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null | undefined;
      createdAt: Date;
      updatedAt: Date;
      role: string | string[];
      banned?: boolean;
      banReason?: string;
      banExpires?: number;
    };
  }
}
