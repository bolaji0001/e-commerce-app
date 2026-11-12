import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { formatPrice } from "../lib/api";
import { getOrders } from "../lib/ordersApi";
import type { Order } from "../lib/ordersApi";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getOrders(token)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Your orders</h1>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-4 text-gray-600">
          You have no orders yet.{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Start shopping
          </Link>
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-lg border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="text-xs text-gray-400">Order {order.id.slice(0, 8)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>

            <ul className="mt-3 divide-y text-sm">
              {order.items.map((item) => (
                <li key={item.product_id} className="flex justify-between py-1">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-right font-bold">Total: {formatPrice(order.total_cents)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}