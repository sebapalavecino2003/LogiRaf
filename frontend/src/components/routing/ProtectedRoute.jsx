import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * Guarda el acceso a una ruta verificando autenticación y rol.
 *
 * Props:
 *   children   — componente a renderizar si el acceso es válido
 *   rolesPermitidos — array de strings con los nombres de rol autorizados
 *                     (si está vacío, solo verifica autenticación)
 */
export default function ProtectedRoute({ children, rolesPermitidos = [] }) {
  const { autenticado, cargando, nombreRol } = useAuth();

  // Mientras se verifica la sesión inicial, mostrar pantalla neutra
  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1117",
          color: "#6b7280",
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
        }}
      >
        Verificando sesión…
      </div>
    );
  }

  // Sin autenticar → redirigir al login
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Con rol requerido → verificar que el usuario tenga el rol correcto
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(nombreRol)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
}
