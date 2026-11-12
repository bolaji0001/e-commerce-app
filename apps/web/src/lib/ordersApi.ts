import { request } from "./authApi";

export type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
};

export type Order = {
  id: string;
  status: "pending" | "paid" | "cancelled";
  total_cents: number;
  created_at: string;
  items: OrderItem[];
};

export const createOrder = (token: string, items: { productId: string; quantity: number }[]) =>
  request<Order>("/orders", { method: "POST", body: { items }, token });

export const getOrders = (token: string) => request<Order[]>("/orders", { token });