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
export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const user = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const session = await auth.api.signInEmail({
      body: { email, password },
    });

    res.json(session);
  } catch (error: any) {
    console.log(error);

    res.status(400).json({ error: 'gabimmmm' });
  }
};
