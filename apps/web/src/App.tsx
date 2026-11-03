import { Link, Route, Routes } from "react-router-dom";
import { useCart } from "./cart/useCart";
import CartPage from "./pages/CartPage";
import ProductPage from "./pages/ProductPage";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
  const { count } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">
            My Store
          </Link>
          <Link to="/cart" className="font-medium hover:underline">
            Cart ({count})
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
