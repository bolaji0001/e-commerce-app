export type CartItem = {
  productId: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const qty = action.quantity ?? 1;
      if (action.item.stock <= 0 || qty <= 0) return state;
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === existing.productId
              ? { ...i, stock: action.item.stock, quantity: Math.min(i.quantity + qty, action.item.stock) }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, quantity: Math.min(qty, action.item.stock) }] };
    }
    case "setQuantity": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.productId !== action.productId) };
      }
      return {
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: Math.min(action.quantity, i.stock) } : i
        ),
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

export function cartTotals(items: CartItem[]) {
  return {
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal_cents: items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0),
  };
}