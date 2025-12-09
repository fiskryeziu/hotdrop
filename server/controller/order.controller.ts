import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../index.ts';
import { orderItems, orders } from '../db/schema.ts';
import { io } from '../app.ts';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { items, total, deliveryAddress, deliveryLat, deliveryLng, notes } =
      req.body;

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        total,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
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
    const userRole = req.user!.role;

    let userOrders;

    // Admins and delivery drivers see all orders
    if (userRole === 'admin' || userRole === 'delivery') {
      userOrders = await db.select().from(orders);
    } else {
      // Regular users only see their own orders
      userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));
    }

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

    // Broadcast to all connected clients
    io.emit('order-status-updated', {
      orderId: updated.id,
      status: updated.status,
    });

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
