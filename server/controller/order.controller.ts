import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../index.ts';
import { orderItems, orders } from '../db/schema.ts';
import { io } from '../app.ts';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
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

    // admin
    io.emit('order-created', newOrder);

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

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

    if (!updated) return res.status(404).json({ error: 'Order not found' });

    //user
    io.to(`user-${updated.userId}`).emit(
      'order-status-updated',
      updated.status,
    );

    //delivery
    if (status === 'ready' && req.user?.role === 'delivery') {
      io.to(`driver-${updated.userId}`).emit('order-ready', updated.status);
    }

    //admin
    if (status === 'delivered' && req.user?.role === 'admin') {
      io.to(`admin-${updated.userId}`).emit(`order-delivered`, updated.status);
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// delete order (user)
// TODO: or get deleted in 2 days
export const deleteOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    await db.delete(orders).where(eq(orders.id, orderId));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
