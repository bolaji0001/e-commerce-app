import { useEffect, useState } from "react";
import { getProducts } from "../lib/api";
import type { Product } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getProducts(q, controller.signal)
      .then(setProducts)
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Could not load products.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products"
        className="w-full rounded-lg border px-3 py-2"
      />
      {loading && <p className="mt-6 text-gray-500">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}