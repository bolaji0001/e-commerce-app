import { createContext } from "react";
import type { CartItem } from "./cartReducer";

export type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal_cents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);