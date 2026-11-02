import { Link } from "react-router-dom";
import { formatPrice } from "../lib/api";
import type { Product } from "../lib/api";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="block rounded-lg border bg-white p-4">
      {product.image_url && (
        <img src={product.image_url} alt="" className="h-40 w-full rounded object-cover" />
      )}
      <h2 className="mt-3 font-semibold">{product.name}</h2>
      <p className="mt-1 text-sm text-gray-600">{formatPrice(product.price_cents)}</p>
    </Link>
  );
}