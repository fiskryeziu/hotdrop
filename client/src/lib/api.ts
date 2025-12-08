import axios from "axios";
import type {
  Product,
  Category,
  Order,
  OrderWithItems,
  Session,
} from "../types";

const API_BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Products
export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/products");
  return data;
};

export const getProductById = async (productId: number): Promise<Product> => {
  const { data } = await api.get(`/products/product/${productId}`);
  return data;
};

export const getProductsByCategory = async (
  categoryId: number
): Promise<Product[]> => {
  const { data } = await api.get(`/products/product/category/${categoryId}`);
  return data;
};

// Orders
export const createOrder = async (orderData: {
  items: Array<{
    productId: number;
    quantity: number;
    selectedOptions: Array<{ name: string; choice: string; price: number }>;
    subtotal: number;
  }>;
  total: number;
  deliveryAddress: string;
  notes?: string;
}): Promise<{ success: boolean; order: Order }> => {
  const { data } = await api.post("/orders", orderData);
  return data;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/orders");
  return data;
};

export const getOrderById = async (
  orderId: number
): Promise<OrderWithItems> => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
};

export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<Order> => {
  const { data } = await api.put(`/orders/${orderId}`, { status });
  return data;
};

// User
export const getUserSession = async (): Promise<Session | null> => {
  try {
    const { data } = await api.get("/users/me");
    return data;
  } catch {
    return null;
  }
};
