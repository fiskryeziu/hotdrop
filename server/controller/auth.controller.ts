import type { Request, Response } from 'express';
import { auth } from '../auth.ts';
import { fromNodeHeaders } from 'better-auth/node';

export const getUserSession = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  // if (!session) return res.status(401).json({ msg: 'nuk ka user te loguar' });
  return res.json(session);
};
