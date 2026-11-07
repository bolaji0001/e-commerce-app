import { useAuth } from "../auth/useAuth";

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Your account</h1>
      <p className="mt-4 text-gray-700">Signed in as {user?.email}</p>
      <p className="text-sm text-gray-500">Role: {user?.role}</p>
      <p className="mt-6 text-gray-600">Your orders will appear here (Day 6–7).</p>
      <button onClick={logout} className="mt-6 rounded-lg border px-4 py-2 hover:bg-gray-100">
        Log out
      </button>
    </div>
  );
}