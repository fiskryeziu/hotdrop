import { Router } from 'express';
import {
  getProductById,
  getProducts,
  getProductsByCategory,
} from '../controller/product.controller.ts';

const router = Router();

router.get('/', getProducts);
router.get('/product/:productId', getProductById);
router.get('/product/category/:categoryId', getProductsByCategory);

export default router;
