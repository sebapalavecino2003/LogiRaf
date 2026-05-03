import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { login as apiLogin } from "@/api/auth";
import client from "@/api/client";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  username: string;
  rol: { nombre_rol: string };
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await client.get("/api/v1/usuarios/me/");
      setUser(data);
    } catch {
      // If /me/ doesn't exist, try to decode token
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUser({
            id: decoded.user_id,
            username: decoded.username || "usuario",
            rol: { nombre_rol: decoded.rol || decoded.role || "USUARIO" },
          });
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await apiLogin(username, password);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
