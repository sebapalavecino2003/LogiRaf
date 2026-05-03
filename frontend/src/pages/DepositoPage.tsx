import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { getCategorias, getProductos, getStockPorSector } from "@/api/inventario";
import { AlertCircle } from "lucide-react";

export default function DepositoPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, stockRes] = await Promise.all([
          getCategorias(),
          getProductos(),
          getStockPorSector(),
        ]);
        setCategorias(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
        setProductos(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.results || []);
        setStock(Array.isArray(stockRes.data) ? stockRes.data : stockRes.data.results || []);
      } catch (e: any) {
        setError(e.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProductos = selectedCat
    ? productos.filter((p: any) => p.categoria === selectedCat || p.categoria_id === selectedCat)
    : productos;

  const getStockForProduct = (prodId: number) =>
    stock.filter((s: any) => s.producto === prodId || s.producto_id === prodId);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Depósito</h1>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCat(null)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !selectedCat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Todas
          </button>
          {categorias.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCat === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {c.nombre || c.name}
            </button>
          ))}
        </div>

        {/* Products table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Producto</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Stock Total</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Stock por Sector</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No hay productos
                  </td>
                </tr>
              ) : (
                filteredProductos.map((p: any) => {
                  const pStock = getStockForProduct(p.id);
                  const total = pStock.reduce((sum: number, s: any) => sum + (s.cantidad || 0), 0);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-card-foreground">{p.nombre || p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {categorias.find((c: any) => c.id === (p.categoria || p.categoria_id))?.nombre || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-card-foreground">{total}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {pStock.map((s: any, i: number) => (
                            <span key={i} className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {s.sector_nombre || s.sector?.nombre || `Sector ${s.sector || s.sector_id}`}: {s.cantidad}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
