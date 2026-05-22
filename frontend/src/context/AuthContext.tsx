import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { StoredUser } from "../types";
import { tokenKey } from "../services/api";

type AuthContextValue = {
  user: StoredUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: StoredUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser() {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) as StoredUser : null;
  } catch {
    return null;
  }
}

export function isTokenValid() {
  const token = localStorage.getItem(tokenKey);
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => readUser());
  const [valid, setValid] = useState(() => isTokenValid());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: valid,
    login(token, nextUser) {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
      setValid(true);
    },
    logout() {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem("user");
      setUser(null);
      setValid(false);
    },
  }), [user, valid]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
