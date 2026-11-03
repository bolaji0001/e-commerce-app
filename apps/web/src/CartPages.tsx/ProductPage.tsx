import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, getProduct } from "../lib/api";
import type { Product } from "../lib/api";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getProduct(id, controller.signal)
      .then(setProduct)
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message === "not_found" ? "Product not found." : "Could not load this product.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <div>
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← Back to products
      </Link>

      {loading && <p className="mt-6 text-gray-500">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {product && (
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full rounded-lg object-cover" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-4 text-gray-700">{product.description}</p>
            <p className="mt-6 text-2xl font-bold">{formatPrice(product.price_cents)}</p>
            <p className="mt-2 text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
            <button
              disabled
              className="mt-6 rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-600"
              title="Cart comes on Day 4"
            >
              Add to cart (coming on Day 4)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}