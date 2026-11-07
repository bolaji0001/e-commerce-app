import { Link, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { useCart } from "./cart/useCart";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import ProductPage from "./pages/ProductPage";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
  const { count } = useCart();
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold">
            My Store
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/cart" className="hover:underline">
              Cart ({count})
            </Link>
            {!loading && user && (
              <>
                <Link to="/account" className="hover:underline">
                  Account
                </Link>
                <button onClick={logout} className="hover:underline">
                  Log out
                </button>
              </>
            )}
            {!loading && !user && (
              <>
                <Link to="/login" className="hover:underline">
                  Log in
                </Link>
                <Link to="/register" className="hover:underline">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
          </Route>
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}