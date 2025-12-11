import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  numeric,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { user } from '../auth-schema.ts';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  options: jsonb('options')
    .$type<
      {
        name: string;
        type: 'single' | 'multiple';
        required: boolean;
        choices: { label: string; price: number }[];
      }[]
    >()
    .default([]),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text('delivery_address'),
  deliveryLat: numeric('delivery_lat', { precision: 10, scale: 7 }),
  deliveryLng: numeric('delivery_lng', { precision: 10, scale: 7 }),
  notes: text('notes'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  selectedOptions: jsonb('selected_options')
    .$type<{ name: string; choice: string; price: number }[]>()
    .default([]),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});
