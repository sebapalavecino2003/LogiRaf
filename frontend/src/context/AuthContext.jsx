import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, setTokens, clearTokens, getAccessToken } from "../services/api";

// Contexto de autenticación global
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Al montar la app, verificar si hay sesión activa
  useEffect(() => {
    const inicializarSesion = async () => {
      const tokenExistente = getAccessToken();
      if (!tokenExistente) {
        setCargando(false);
        return;
      }
      try {
        const datos = await apiGet("/api/usuarios/me/");
        setUsuario(datos);
      } catch {
        // Token inválido o expirado — limpiar sesión
        clearTokens();
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };
    inicializarSesion();
  }, []);

  const iniciarSesion = useCallback(async (nombreUsuario, contrasena) => {
    setError(null);
    try {
      const { access, refresh } = await apiPost("/api/auth/login/", {
        username: nombreUsuario,
        password: contrasena,
      });
      setTokens(access, refresh);
      const datosUsuario = await apiGet("/api/usuarios/me/");
      setUsuario(datosUsuario);
      return datosUsuario;
    } catch (err) {
      const mensaje = err?.message || "Credenciales incorrectas. Intente nuevamente.";
      setError(mensaje);
      throw new Error(mensaje);
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    clearTokens();
    setUsuario(null);
  }, []);

  const valor = {
    usuario,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
    autenticado: !!usuario,
    nombreRol: usuario?.rol?.nombre_rol ?? null,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook de acceso rápido al contexto
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export default AuthContext;
