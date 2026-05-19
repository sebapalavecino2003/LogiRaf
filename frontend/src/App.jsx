import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import AdminSistema from "./pages/admin/AdminSistema";
import ModuloCompras from "./pages/compras/ModuloCompras";
import ModuloDeposito from "./pages/deposito/ModuloDeposito";
import ModuloCaja from "./pages/caja/ModuloCaja";
import ModuloSalon from "./pages/salon/ModuloSalon";

// Ruta raíz que redirige al módulo según el rol del usuario autenticado
function RedirectorRaiz() {
  const { autenticado, nombreRol } = useAuth();

  if (!autenticado) return <Navigate to="/login" replace />;

  const DESTINO_POR_ROL = {
    ADMINISTRADOR_SISTEMA: "/admin/usuarios",
    RESPONSABLE_ABASTECIMIENTO: "/compras",
    OPERADOR_DEPOSITO: "/deposito",
    ENCARGADO_DEPOSITO: "/deposito",
    ENCARGADO_CAJA: "/caja",
    ENCARGADO_SALON: "/salon",
    REPOSITOR: "/salon",
  };

  return <Navigate to={DESTINO_POR_ROL[nombreRol] ?? "/acceso-denegado"} replace />;
}

// Página de acceso denegado
function AccesoDenegado() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        color: "#6b7280",
      }}
    >
      <p style={{ fontSize: "3rem" }}>🔒</p>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 500 }}>Acceso denegado</h2>
      <p style={{ fontSize: "14px" }}>
        No tiene permisos para acceder a esta sección.
      </p>
    </div>
  );
}

// Árbol de rutas principal
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas dentro del layout del ERP */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirección raíz */}
            <Route index element={<RedirectorRaiz />} />

            {/* Módulo Administrador */}
            <Route
              path="admin/usuarios"
              element={
                <ProtectedRoute rolesPermitidos={["ADMINISTRADOR_SISTEMA"]}>
                  <AdminSistema />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/roles"
              element={
                <ProtectedRoute rolesPermitidos={["ADMINISTRADOR_SISTEMA"]}>
                  <AdminSistema />
                </ProtectedRoute>
              }
            />

            {/* Módulo Compras */}
            <Route
              path="compras"
              element={
                <ProtectedRoute rolesPermitidos={["RESPONSABLE_ABASTECIMIENTO"]}>
                  <ModuloCompras />
                </ProtectedRoute>
              }
            />

            {/* Módulo Depósito */}
            <Route
              path="deposito"
              element={
                <ProtectedRoute rolesPermitidos={["OPERADOR_DEPOSITO", "ENCARGADO_DEPOSITO"]}>
                  <ModuloDeposito />
                </ProtectedRoute>
              }
            />

            {/* Módulo Caja / POS */}
            <Route
              path="caja"
              element={
                <ProtectedRoute rolesPermitidos={["ENCARGADO_CAJA"]}>
                  <ModuloCaja />
                </ProtectedRoute>
              }
            />

            {/* Módulo Salón */}
            <Route
              path="salon"
              element={
                <ProtectedRoute rolesPermitidos={["ENCARGADO_SALON", "REPOSITOR"]}>
                  <ModuloSalon />
                </ProtectedRoute>
              }
            />

            {/* Acceso denegado */}
            <Route path="acceso-denegado" element={<AccesoDenegado />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
