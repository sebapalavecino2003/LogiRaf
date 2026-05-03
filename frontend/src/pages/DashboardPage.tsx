import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Package, DollarSign, ShoppingCart, Users } from "lucide-react";

const moduleCards = [
  { label: "Depósito", icon: Package, desc: "Gestión de inventario y stock", color: "bg-primary" },
  { label: "Ventas", icon: DollarSign, desc: "Punto de venta y facturación", color: "bg-success" },
  { label: "Compras", icon: ShoppingCart, desc: "Órdenes de compra y abastecimiento", color: "bg-warning" },
  { label: "Admin", icon: Users, desc: "Usuarios y configuración", color: "bg-destructive" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bienvenido, {user?.username}
          </h1>
          <p className="text-muted-foreground mt-1">
            Rol: <span className="font-medium text-foreground">{user?.rol?.nombre_rol}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {moduleCards.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.color}`}>
                <m.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground">{m.label}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
