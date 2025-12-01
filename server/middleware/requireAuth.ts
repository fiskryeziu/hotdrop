import { fromNodeHeaders } from 'better-auth/node';
import type { Request, Response, NextFunction } from 'express';
import { auth } from '../auth.ts';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach session/user to request object for later use
    (req as any).user = session.user;

    next(); // allow route to continue
  } catch (error: any) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
