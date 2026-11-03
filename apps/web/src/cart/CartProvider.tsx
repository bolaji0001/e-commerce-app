import { useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { CartContext } from "./CartContext";
import { cartReducer, cartTotals } from "./cartReducer";
import type { CartItem, CartState } from "./cartReducer";

const STORAGE_KEY = "my-store-cart";

function isCartItem(x: unknown): x is CartItem {
  if (typeof x !== "object" || x === null) return false;
  const i = x as Record<string, unknown>;
  return (
    typeof i.productId === "string" &&
    typeof i.name === "string" &&
    typeof i.price_cents === "number" &&
    typeof i.stock === "number" &&
    typeof i.quantity === "number" &&
    i.quantity > 0
  );
}

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed: unknown = JSON.parse(raw);
    return { items: Array.isArray(parsed) ? parsed.filter(isCartItem) : [] };
  } catch {
    return { items: [] };
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // storage unavailable (private mode, etc.): the cart still works in memory
    }
  }, [state.items]);

  const value = useMemo(() => {
    const { count, subtotal_cents } = cartTotals(state.items);
    return {
      items: state.items,
      count,
      subtotal_cents,
      addItem: (item: Omit<CartItem, "quantity">, quantity?: number) =>
        dispatch({ type: "add", item, quantity }),
      setQuantity: (productId: string, quantity: number) =>
        dispatch({ type: "setQuantity", productId, quantity }),
      removeItem: (productId: string) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}