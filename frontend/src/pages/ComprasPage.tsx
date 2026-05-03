import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { getProductos } from "@/api/inventario";
import { createCompra } from "@/api/compras";
import { Plus, Trash2, AlertCircle, Check } from "lucide-react";

interface CompraItem {
  producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export default function ComprasPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [items, setItems] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProductos()
      .then((res) => setProductos(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    if (productos.length === 0) return;
    const p = productos[0];
    setItems((prev) => [...prev, { producto: p.id, nombre: p.nombre || p.name, cantidad: 1, precio_unitario: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "producto") {
          const p = productos.find((pr: any) => pr.id === Number(value));
          return { ...item, producto: Number(value), nombre: p?.nombre || p?.name || "" };
        }
        return { ...item, [field]: Number(value) };
      })
    );
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0);

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createCompra({
        productos: items.map((i) => ({
          producto: i.producto,
          producto_id: i.producto,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        })),
      });
      setSuccess("Compra registrada exitosamente");
      setItems([]);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "Error al registrar compra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Nueva Compra</h1>
          <button
            onClick={addItem}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Agregar producto
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            <Check className="h-4 w-4" /> {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">No hay productos agregados. Hacé clic en "Agregar producto".</p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <select
                    value={item.producto}
                    onChange={(e) => updateItem(index, "producto", e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {productos.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nombre || p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                    placeholder="Cant."
                    className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.precio_unitario}
                    onChange={(e) => updateItem(index, "precio_unitario", e.target.value)}
                    placeholder="Precio"
                    className="w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button onClick={() => removeItem(index)} className="rounded p-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {items.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <span className="text-lg font-bold text-card-foreground">Total: <span className="font-mono text-primary">${total.toLocaleString()}</span></span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : "Registrar Compra"}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
