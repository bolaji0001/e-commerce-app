import { Link } from "react-router-dom";
import { useCart } from "../cart/useCart";
import { formatPrice } from "../lib/api";

export default function CartPage() {
  const { items, subtotal_cents, setQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="mt-4 text-gray-600">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Your cart</h1>

      <ul className="mt-6 divide-y rounded-lg border bg-white">
        {items.map((item) => (
          <li key={item.productId} className="flex flex-wrap items-center gap-4 p-4">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="h-20 w-20 rounded object-cover" />
            )}
            <div className="min-w-40 flex-1">
              <Link to={`/products/${item.productId}`} className="font-semibold hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-gray-600">{formatPrice(item.price_cents)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                aria-label={`Decrease quantity of ${item.name}`}
                className="h-8 w-8 rounded border"
              >
                −
              </button>
              <span className="w-6 text-center" aria-live="polite">
                {item.quantity}
              </span>
              <button
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                aria-label={`Increase quantity of ${item.name}`}
                className="h-8 w-8 rounded border disabled:opacity-40"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-semibold">{formatPrice(item.price_cents * item.quantity)}</p>

            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button onClick={clear} className="text-sm text-gray-600 hover:underline">
          Clear cart
        </button>
        <div className="text-right">
          <p className="text-lg">
            Subtotal: <span className="font-bold">{formatPrice(subtotal_cents)}</span>
          </p>
          <p className="text-sm text-gray-500">Taxes and shipping are added at checkout.</p>
          <button
            disabled
            className="mt-3 rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-600"
            title="Checkout comes on Day 8"
          >
            Checkout (coming Day 8)
          </button>
        </div>
      </div>
    </div>
  );
}