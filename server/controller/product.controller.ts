import type { Request, Response } from 'express';
import { products as productSchema } from '../db/schema.ts';
import { db } from '../index.ts';
import { eq } from 'drizzle-orm';

export const getProducts = async (req: Request, res: Response) => {
  const products = await db.select().from(productSchema);
  return res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;

  if (!productId || isNaN(Number(productId))) {
    return res.status(400).json({ error: 'Invalid product ID provided.' });
  }

  const idAsNumber = Number(productId);

  const product = await db
    .select()
    .from(productSchema)
    .where(eq(productSchema.id, idAsNumber));

  if (product.length === 0) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  return res.json(product[0]);
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.categoryId;

  if (!categoryId || isNaN(Number(categoryId))) {
    return res.status(400).json({ error: 'Invalid category ID provided.' });
  }

  const idAsNumber = Number(categoryId);

  const products = await db
    .select()
    .from(productSchema)
    // TODO: add field categoryId and table category
    .where(eq(productSchema.categoryId, idAsNumber));

  return res.json(products);
};
