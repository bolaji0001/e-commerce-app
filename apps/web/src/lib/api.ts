const API = import.meta.env.VITE_API_URL;

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
};

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
}

export async function getProducts(q: string, signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(`${API}/products?q=${encodeURIComponent(q)}`, { signal });
  if (!res.ok) throw new Error("request_failed");
  return res.json();
}

export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  const res = await fetch(`${API}/products/${id}`, { signal });
  if (res.status === 404 || res.status === 400) throw new Error("not_found");
  if (!res.ok) throw new Error("request_failed");
  return res.json();
}