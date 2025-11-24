import { Router } from 'express';
import {
  getProductById,
  getProducts,
  getProductsByCategory,
} from '../controller/product.controller.ts';
import { requireAuth } from '../middleware/requireAuth.ts';
import {
  createOrder,
  deleteOrderById,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controller/order.controller.ts';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrders);
router.get('/:orderId', requireAuth, getOrderById);
router.put('/:orderId', requireAuth, updateOrderStatus);
router.delete('/:orderId', requireAuth, deleteOrderById);

export default router;
