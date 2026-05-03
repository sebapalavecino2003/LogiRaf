import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const allLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [] },
  { to: "/deposito", label: "Depósito", icon: Package, roles: ["DEPOSITO", "OPERADOR"] },
  { to: "/ventas", label: "Ventas", icon: DollarSign, roles: ["CAJA", "VENTA"] },
  { to: "/compras", label: "Compras", icon: ShoppingCart, roles: ["ABASTECIMIENTO", "COMPRA"] },
  { to: "/admin", label: "Admin", icon: Users, roles: ["ADMIN"] },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = user?.rol?.nombre_rol?.toUpperCase() || "";
  const isAdmin = userRole.includes("ADMIN");

  const visibleLinks = allLinks.filter(
    (l) => l.roles.length === 0 || isAdmin || l.roles.some((r) => userRole.includes(r))
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Package className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-primary-foreground">Gestión Comercial</p>
          <p className="text-xs text-sidebar-foreground/60">{user?.username}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
