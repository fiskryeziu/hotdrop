// controller/order.controller.ts
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../index.ts';
import { orderItems, orders } from '../db/schema.ts';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = 'someid';
    const { items, total, deliveryAddress, notes } = req.body;

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        total,
        deliveryAddress,
        notes,
      })
      .returning();

    if (newOrder) {
      for (const item of items) {
        await db.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions ?? [],
          subtotal: item.subtotal,
        });
      }
    }

    // Emit real-time update to admin dashboard
    // req.io.emit('admin:new-order', newOrder);

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = 'someid';

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));

    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    res.json({ order, items });
  } catch {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

//admin
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;

    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();

    // emit real-time update to the user
    // req.io.to(`user:${updated.userId}`).emit('order:status-update', updated);

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// delete order (user)
export const deleteOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    await db.delete(orders).where(eq(orders.id, orderId));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
