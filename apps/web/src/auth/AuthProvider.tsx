import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { getMe, loginRequest, registerRequest } from "../lib/authApi";
import type { User } from "../lib/authApi";

const TOKEN_KEY = "my-store-token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable: the session just won't survive a refresh
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => readToken() !== null);

  // On first load: check a stored token with the API
  useEffect(() => {
    const stored = readToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getMe(stored)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          saveToken(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login: async (email: string, password: string) => {
        const res = await loginRequest(email, password);
        saveToken(res.token);
        setToken(res.token);
        setUser(res.user);
      },
      register: async (email: string, password: string) => {
        const res = await registerRequest(email, password);
        saveToken(res.token);
        setToken(res.token);
        setUser(res.user);
      },
      logout: () => {
        saveToken(null);
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}