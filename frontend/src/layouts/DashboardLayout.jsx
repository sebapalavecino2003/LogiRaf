import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Configuración de navegación por rol
const NAVEGACION_POR_ROL = {
  ADMINISTRADOR_SISTEMA: [
    { ruta: "/admin/usuarios", etiqueta: "Usuarios", icono: "👤" },
    { ruta: "/admin/roles", etiqueta: "Roles", icono: "🛡️" },
  ],
  RESPONSABLE_ABASTECIMIENTO: [
    { ruta: "/compras", etiqueta: "Registrar Compra", icono: "📦" },
  ],
  OPERADOR_DEPOSITO: [
    { ruta: "/deposito", etiqueta: "Stock Depósito", icono: "🏭" },
  ],
  ENCARGADO_DEPOSITO: [
    { ruta: "/deposito", etiqueta: "Stock Depósito", icono: "🏭" },
  ],
  ENCARGADO_CAJA: [
    { ruta: "/caja", etiqueta: "Punto de Venta", icono: "🛒" },
  ],
  ENCARGADO_SALON: [
    { ruta: "/salon", etiqueta: "Monitor Salón", icono: "🏪" },
  ],
  REPOSITOR: [
    { ruta: "/salon", etiqueta: "Reposición", icono: "🔄" },
  ],
};

// Etiquetas legibles para cada rol
const ETIQUETA_ROL = {
  ADMINISTRADOR_SISTEMA: "Administrador",
  RESPONSABLE_ABASTECIMIENTO: "Abastecimiento",
  OPERADOR_DEPOSITO: "Operador Depósito",
  ENCARGADO_DEPOSITO: "Encargado Depósito",
  ENCARGADO_CAJA: "Caja / POS",
  ENCARGADO_SALON: "Salón",
  REPOSITOR: "Repositor",
};

export default function DashboardLayout() {
  const { usuario, nombreRol, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [menuMovil, setMenuMovil] = useState(false);

  const enlaces = NAVEGACION_POR_ROL[nombreRol] ?? [];

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <div className="dashboard-root">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={`sidebar ${menuMovil ? "sidebar--abierto" : ""}`}>
        {/* Logo / Marca */}
        <div className="sidebar__marca">
          <span className="sidebar__logo">LR</span>
          <div>
            <p className="sidebar__nombre-app">LogiRaf</p>
            <p className="sidebar__subtitulo">Sistema ERP</p>
          </div>
        </div>

        {/* Módulo activo del usuario */}
        <div className="sidebar__modulo-label">
          <span className="sidebar__rol-badge">{ETIQUETA_ROL[nombreRol] ?? nombreRol}</span>
        </div>

        {/* Navegación */}
        <nav className="sidebar__nav">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--activo" : ""}`
              }
              onClick={() => setMenuMovil(false)}
            >
              <span className="sidebar__link-icono">{enlace.icono}</span>
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="sidebar__footer">
          <div className="sidebar__usuario-info">
            <div className="sidebar__avatar">
              {usuario?.first_name?.[0] ?? usuario?.username?.[0] ?? "U"}
            </div>
            <div>
              <p className="sidebar__usuario-nombre">
                {usuario?.first_name
                  ? `${usuario.first_name} ${usuario.last_name ?? ""}`
                  : usuario?.username}
              </p>
              <p className="sidebar__usuario-email">{usuario?.email}</p>
            </div>
          </div>
          <button className="sidebar__btn-salir" onClick={handleCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido Principal ──────────────────── */}
      <div className="contenido-principal">
        {/* Barra superior móvil */}
        <header className="topbar">
          <button
            className="topbar__menu-btn"
            onClick={() => setMenuMovil((v) => !v)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <p className="topbar__titulo">LogiRaf ERP</p>
        </header>

        {/* Área de renderizado de módulos */}
        <main className="main-area">
          <Outlet />
        </main>
      </div>

      {/* Overlay móvil */}
      {menuMovil && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuMovil(false)}
        />
      )}
    </div>
  );
}
