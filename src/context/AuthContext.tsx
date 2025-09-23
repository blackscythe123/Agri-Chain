import { createContext, useContext, useMemo, useState } from "react";

export type Role = "farmer" | "distributor" | "retailer" | "consumer" | "verifier" | "admin";
export type AuthUser = { role: Role; email?: string; address?: string } | null;

type AuthCtx = {
  user: AuthUser;
  login: (u: AuthUser) => void;
  logout: () => void;
  requireLogin: (role?: Role) => boolean; // returns true if logged in and (optional) role matches
  isRole: (role: Role) => boolean;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage synchronously so ProtectedRoute sees a user on first render
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const raw = localStorage.getItem("auth:user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const value = useMemo<AuthCtx>(() => ({
    user,
    login: (u) => {
      setUser(u);
      localStorage.setItem("auth:user", JSON.stringify(u));
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem("auth:user");
    },
    requireLogin: (role) => {
      if (!user) return false;
      if (role && user.role !== role) return false;
      return true;
    },
    isRole: (role) => !!user && user.role === role
  }), [user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
