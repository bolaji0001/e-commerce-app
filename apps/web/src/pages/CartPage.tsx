import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/useCart";
import { formatPrice } from "../lib/api";
import { createOrder } from "../lib/ordersApi";

export default function CartPage() {
  const { items, subtotal_cents, setQuantity, removeItem, clear } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function placeOrder() {
    if (!token) return;
    setPlacing(true);
    setError("");
    try {
      await createOrder(
        token,
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      clear();
      navigate("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

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
                -
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

            <button onClick={() => removeItem(item.productId)} className="text-sm text-red-600 hover:underline">
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <button onClick={clear} className="text-sm text-gray-600 hover:underline">
          Clear cart
        </button>
        <div className="text-right">
          <p className="text-lg">
            Subtotal: <span className="font-bold">{formatPrice(subtotal_cents)}</span>
          </p>
          <p className="text-sm text-gray-500">The final total is calculated by the server.</p>

          {user ? (
            <button
              onClick={placeOrder}
              disabled={placing}
              className="mt-3 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {placing ? "Placing order..." : "Place order (test)"}
            </button>
          ) : (
            <Link
              to="/login"
              state={{ from: "/cart" }}
              className="mt-3 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Log in to place your order
            </Link>
          )}

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}