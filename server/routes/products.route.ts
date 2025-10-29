import { Router } from 'express';
import { getProducts } from '../controller/product.controller.ts';

const router = Router();

router.get('/', getProducts);

export default router;
