import { useState, useEffect, useMemo, useCallback } from "react";
import { apiGet, apiPost } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SECTOR_SALON = "SALON";

export default function ModuloCaja() {
  const { usuario } = useAuth();

  // ── Productos con stock en el salón ───────────
  const [stockSalon, setStockSalon] = useState([]);
  const [cargandoStock, setCargandoStock] = useState(true);
  const [errorStock, setErrorStock] = useState(null);

  // ── Carrito de compras ────────────────────────
  const [carrito, setCarrito] = useState([]);

  // ── Búsqueda ──────────────────────────────────
  const [busqueda, setBusqueda] = useState("");

  // ── Modal de ticket exitoso ───────────────────
  const [ticketExitoso, setTicketExitoso] = useState(null);

  // ── Estado del proceso de venta ───────────────
  const [procesando, setProcesando] = useState(false);
  const [errorVenta, setErrorVenta] = useState(null);

  // ── Cargar stock del salón ────────────────────
  const cargarStock = useCallback(async () => {
    setCargandoStock(true);
    setErrorStock(null);
    try {
      const data = await apiGet("/api/inventario/stockporsector/", { sector: SECTOR_SALON });
      setStockSalon(data?.results ?? data ?? []);
    } catch (err) {
      setErrorStock(err.message);
    } finally {
      setCargandoStock(false);
    }
  }, []);

  useEffect(() => { cargarStock(); }, [cargarStock]);

  // ── Productos filtrados por búsqueda ──────────
  const productosFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
    return stockSalon.filter(
      (item) =>
        (item.producto?.nombre ?? "").toLowerCase().includes(termino) ||
        (item.producto?.codigo ?? "").toLowerCase().includes(termino)
    );
  }, [stockSalon, busqueda]);

  // ── Total del carrito ────────────────────────
  const totalCarrito = useMemo(() =>
    carrito.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0),
    [carrito]
  );

  // ── Agregar al carrito ─────────────────────────
  const handleAgregarAlCarrito = (stockItem) => {
    const productoId = stockItem.producto?.id ?? stockItem.producto;
    const stockDisponible = stockItem.cantidad;

    // Verificar disponibilidad contra el stock real del salón
    const enCarrito = carrito.find((c) => String(c.producto) === String(productoId));
    const cantidadActualEnCarrito = enCarrito?.cantidad ?? 0;

    if (cantidadActualEnCarrito >= stockDisponible) {
      alert(`Sin stock suficiente. Disponible en Salón: ${stockDisponible} unidades.`);
      return;
    }

    if (enCarrito) {
      setCarrito((prev) =>
        prev.map((c) =>
          String(c.producto) === String(productoId)
            ? { ...c, cantidad: c.cantidad + 1 }
            : c
        )
      );
    } else {
      setCarrito((prev) => [
        ...prev,
        {
          producto: productoId,
          nombre: stockItem.producto?.nombre ?? "Producto",
          codigo: stockItem.producto?.codigo ?? "",
          precio_unitario: stockItem.producto?.precio_venta ?? 0,
          cantidad: 1,
          stock_disponible: stockDisponible,
        },
      ]);
    }
  };

  const handleCambiarCantidad = (productoId, nuevaCantidad) => {
    const item = carrito.find((c) => String(c.producto) === String(productoId));
    if (!item) return;
    if (nuevaCantidad <= 0) {
      handleEliminarDeCarrito(productoId);
      return;
    }
    if (nuevaCantidad > item.stock_disponible) return;
    setCarrito((prev) =>
      prev.map((c) =>
        String(c.producto) === String(productoId)
          ? { ...c, cantidad: nuevaCantidad }
          : c
      )
    );
  };

  const handleEliminarDeCarrito = (productoId) => {
    setCarrito((prev) =>
      prev.filter((c) => String(c.producto) !== String(productoId))
    );
  };

  const handleVaciarCarrito = () => setCarrito([]);

  // ── Procesar venta ────────────────────────────
  const handleProcesarVenta = async () => {
    if (carrito.length === 0) return;
    setProcesando(true);
    setErrorVenta(null);
    try {
      const payload = {
        vendedor: usuario?.id,
        items: carrito.map((item) => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        })),
      };
      const respuesta = await apiPost("/api/ventas/ventas/", payload);
      setTicketExitoso(respuesta?.numero_ticket ?? respuesta?.id);
      setCarrito([]);
      cargarStock();
    } catch (err) {
      setErrorVenta(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="modulo">
      <div className="modulo__cabecera">
        <h2 className="modulo__titulo">Punto de Venta — Caja</h2>
        <p className="modulo__subtitulo">Facturación rápida desde el salón</p>
      </div>

      <div className="pos-layout">
        {/* ── Panel izquierdo: Catálogo ──────── */}
        <div className="pos-catalogo">
          <div className="pos-busqueda">
            <span className="pos-busqueda__icono">🔍</span>
            <input
              type="text"
              className="pos-busqueda__input"
              placeholder="Buscar producto por nombre o código…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {cargandoStock && <EstadoCarga mensaje="Cargando catálogo…" />}
          {errorStock && <div className="alerta alerta--error">{errorStock}</div>}

          {!cargandoStock && !errorStock && (
            <div className="pos-grid-productos">
              {productosFiltrados.length === 0 ? (
                <div className="pos-sin-resultados">
                  No se encontraron productos con stock disponible.
                </div>
              ) : (
                productosFiltrados.map((item, i) => {
                  const productoId = item.producto?.id ?? item.producto;
                  const enCarrito = carrito.find((c) => String(c.producto) === String(productoId));
                  const sinStock = item.cantidad <= 0;

                  return (
                    <button
                      key={item.id ?? i}
                      className={`pos-producto-card ${sinStock ? "pos-producto-card--agotado" : ""}`}
                      onClick={() => !sinStock && handleAgregarAlCarrito(item)}
                      disabled={sinStock}
                    >
                      <p className="pos-producto-card__nombre">
                        {item.producto?.nombre ?? "Sin nombre"}
                      </p>
                      <p className="pos-producto-card__codigo">
                        {item.producto?.codigo ?? ""}
                      </p>
                      <p className="pos-producto-card__precio">
                        ${Number(item.producto?.precio_venta ?? 0).toFixed(2)}
                      </p>
                      <p className={`pos-producto-card__stock ${sinStock ? "pos-producto-card__stock--agotado" : ""}`}>
                        {sinStock ? "Sin stock" : `Stock: ${item.cantidad}`}
                        {enCarrito ? ` · En carrito: ${enCarrito.cantidad}` : ""}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Panel derecho: Carrito ─────────── */}
        <div className="pos-carrito">
          <div className="pos-carrito__cabecera">
            <h3>Carrito</h3>
            {carrito.length > 0 && (
              <button className="btn btn--chico btn--peligro" onClick={handleVaciarCarrito}>
                Vaciar
              </button>
            )}
          </div>

          <div className="pos-carrito__lista">
            {carrito.length === 0 ? (
              <div className="pos-carrito__vacio">
                <p>🛒</p>
                <p>El carrito está vacío</p>
                <p className="pos-carrito__vacio-hint">Toque un producto para agregarlo</p>
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.producto} className="pos-carrito__item">
                  <div className="pos-carrito__item-info">
                    <p className="pos-carrito__item-nombre">{item.nombre}</p>
                    <p className="pos-carrito__item-precio">
                      ${item.precio_unitario.toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="pos-carrito__item-controles">
                    <button
                      className="pos-qty-btn"
                      onClick={() => handleCambiarCantidad(item.producto, item.cantidad - 1)}
                    >
                      −
                    </button>
                    <span className="pos-qty-valor">{item.cantidad}</span>
                    <button
                      className="pos-qty-btn"
                      onClick={() => handleCambiarCantidad(item.producto, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock_disponible}
                    >
                      +
                    </button>
                  </div>
                  <p className="pos-carrito__item-subtotal">
                    ${(item.precio_unitario * item.cantidad).toFixed(2)}
                  </p>
                  <button
                    className="pos-carrito__eliminar"
                    onClick={() => handleEliminarDeCarrito(item.producto)}
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pos-carrito__pie">
            <div className="pos-carrito__total">
              <span>Total</span>
              <span className="pos-carrito__total-monto">${totalCarrito.toFixed(2)}</span>
            </div>
            {errorVenta && <div className="alerta alerta--error">{errorVenta}</div>}
            <button
              className="btn btn--primario btn--bloque btn--grande"
              onClick={handleProcesarVenta}
              disabled={carrito.length === 0 || procesando}
            >
              {procesando ? "Procesando…" : "💳 Cobrar"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal de ticket exitoso ───────────── */}
      {ticketExitoso !== null && (
        <div className="modal-overlay">
          <div className="modal modal--chico comprobante-modal">
            <div className="comprobante-exito">
              <div className="comprobante-exito__icono">🧾</div>
              <h2 className="comprobante-exito__titulo">¡Venta registrada!</h2>
              <p className="comprobante-exito__subtitulo">Número de ticket</p>
              <div className="comprobante-exito__codigo">
                {String(ticketExitoso).startsWith("TKT")
                  ? ticketExitoso
                  : `TKT-${String(ticketExitoso).padStart(6, "0")}`}
              </div>
              <button
                className="btn btn--primario"
                onClick={() => setTicketExitoso(null)}
              >
                Nueva venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EstadoCarga({ mensaje }) {
  return (
    <div className="estado-carga">
      <div className="estado-carga__spinner" />
      <p>{mensaje}</p>
    </div>
  );
}
