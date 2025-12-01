import { Router } from 'express';
import {
  getProductById,
  getProducts,
  getProductsByCategory,
} from '../controller/product.controller.ts';
import { requireAuth, requireRole } from '../middleware/requireAuth.ts';
import {
  createOrder,
  deleteOrderById,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controller/order.controller.ts';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get(
  '/',
  requireAuth,
  requireRole('user', 'delivery', 'admin'),
  getOrders,
);
router.get(
  '/:orderId',
  requireAuth,
  requireRole('user', 'delivery', 'admin'),
  getOrderById,
);
router.put(
  '/:orderId',
  requireAuth,
  requireRole('delivery', 'admin'),
  updateOrderStatus,
);
router.delete('/:orderId', requireAuth, requireRole('admin'), deleteOrderById);

export default router;
