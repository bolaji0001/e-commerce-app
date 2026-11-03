import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../cart/useCart";
import { formatPrice, getProduct } from "../lib/api";
import type { Product } from "../lib/api";

export default function ProductPage() {
  const { id } = useParams();
  const { items, addItem } = useCart();
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

  const inCart = product ? (items.find((i) => i.productId === product.id)?.quantity ?? 0) : 0;
  const atMax = product ? inCart >= product.stock : false;

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
              onClick={() =>
                addItem({
                  productId: product.id,
                  name: product.name,
                  price_cents: product.price_cents,
                  image_url: product.image_url,
                  stock: product.stock,
                })
              }
              disabled={product.stock <= 0 || atMax}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
            >
              {product.stock <= 0 ? "Out of stock" : atMax ? "Maximum in cart" : "Add to cart"}
            </button>

            {inCart > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                {inCart} in your cart.{" "}
                <Link to="/cart" className="text-blue-600 hover:underline">
                  View cart
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}