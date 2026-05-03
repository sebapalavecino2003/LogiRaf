import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { getProductos } from "@/api/inventario";
import { createVenta } from "@/api/ventas";
import { ShoppingCart, Plus, Minus, Trash2, AlertCircle, Check } from "lucide-react";

interface CartItem {
  producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export default function VentasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getProductos()
      .then((res) => setProductos(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (p: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.producto === p.id);
      if (existing) {
        return prev.map((i) => i.producto === p.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { producto: p.id, nombre: p.nombre || p.name, precio: Number(p.precio || p.price || 0), cantidad: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((i) => (i.producto === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i))
    );
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.producto !== id));

  const total = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createVenta({
        productos: cart.map((i) => ({
          producto: i.producto,
          producto_id: i.producto,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
        })),
      });
      setSuccess("Venta registrada exitosamente");
      setCart([]);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "Error al registrar venta");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = search
    ? productos.filter((p: any) => (p.nombre || p.name || "").toLowerCase().includes(search.toLowerCase()))
    : productos;

  return (
    <AppLayout>
      <div className="grid h-[calc(100vh-4rem)] gap-6 lg:grid-cols-5">
        {/* Products */}
        <div className="lg:col-span-3 space-y-4 overflow-hidden flex flex-col">
          <h1 className="text-2xl font-bold text-foreground">Punto de Venta</h1>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 overflow-y-auto flex-1 pb-4">
              {filtered.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex flex-col items-start rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <span className="font-medium text-card-foreground">{p.nombre || p.name}</span>
                  <span className="mt-1 text-lg font-bold font-mono text-primary">
                    ${Number(p.precio || p.price || 0).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-card-foreground">Carrito ({cart.length})</h2>
          </div>

          {error && (
            <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <Check className="h-4 w-4" /> {success}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Carrito vacío</p>
            ) : (
              cart.map((item) => (
                <div key={item.producto} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{item.nombre}</p>
                    <p className="text-xs text-muted-foreground font-mono">${item.precio.toLocaleString()} c/u</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.producto, -1)} className="rounded p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm font-semibold font-mono">{item.cantidad}</span>
                    <button onClick={() => updateQty(item.producto, 1)} className="rounded p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    <button onClick={() => removeFromCart(item.producto)} className="ml-1 rounded p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-card-foreground">Total</span>
              <span className="font-mono text-primary">${total.toLocaleString()}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={cart.length === 0 || submitting}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : "Confirmar Venta"}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
