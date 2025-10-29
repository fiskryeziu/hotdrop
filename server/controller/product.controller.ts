import type { Request, Response } from 'express';
import { products as productSchema } from '../db/schema.ts';
import { db } from '../index.ts';

export const getProducts = async (req: Request, res: Response) => {
  const products = await db.select().from(productSchema);
  return res.json(products);
};
