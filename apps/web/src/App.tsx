import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setStatus(`API: ${d.status}, DB: ${d.db}`))
      .catch(() => setStatus("API unreachable"));
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">My Store</h1>
      <p className="mt-4 text-gray-600">{status}</p>
    </main>
  );
}