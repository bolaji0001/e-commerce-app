const API = import.meta.env.VITE_API_URL;

export type User = { id: string; email: string; role: "customer" | "admin" };
export type AuthResponse = { token: string; user: User };

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Something went wrong");
  }
  return data as T;
}

export const registerRequest = (email: string, password: string) =>
  request<AuthResponse>("/auth/register", { method: "POST", body: { email, password } });

export const loginRequest = (email: string, password: string) =>
  request<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });

export const getMe = (token: string) => request<User>("/auth/me", { token });