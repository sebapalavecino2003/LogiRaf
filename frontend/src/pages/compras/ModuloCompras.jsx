import { useState, useEffect, useMemo, useCallback } from "react";
import { apiGet, apiPost } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ModuloCompras() {
  const { usuario } = useAuth();

  // ── Estado del formulario ─────────────────────
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState(null);

  // Línea de detalle actual (selector)
  const [lineaActual, setLineaActual] = useState({
    producto: "",
    cantidad: "",
    precio_unitario: "",
  });
  const [errorLinea, setErrorLinea] = useState(null);

  // Array acumulado de detalles
  const [detalles, setDetalles] = useState([]);

  // Estado del envío
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);
  const [comprobanteExitoso, setComprobanteExitoso] = useState(null);

  // ── Cargar productos desde la API ─────────────
  useEffect(() => {
    const cargar = async () => {
      setCargandoProductos(true);
      setErrorProductos(null);
      try {
        const data = await apiGet("/api/inventario/productos/");
        setProductos(data?.results ?? data ?? []);
      } catch (err) {
        setErrorProductos(err.message);
      } finally {
        setCargandoProductos(false);
      }
    };
    cargar();
  }, []);

  // ── Total calculado automáticamente ──────────
  const totalCompra = useMemo(() =>
    detalles.reduce((acc, d) => acc + d.subtotal, 0),
    [detalles]
  );

  // ── Handlers ──────────────────────────────────
  const handleCambioLinea = (e) => {
    setLineaActual((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorLinea(null);
  };

  const handleAgregarLinea = () => {
    if (!lineaActual.producto) {
      setErrorLinea("Seleccione un producto.");
      return;
    }
    if (!lineaActual.cantidad || Number(lineaActual.cantidad) <= 0) {
      setErrorLinea("La cantidad debe ser mayor a 0.");
      return;
    }
    if (!lineaActual.precio_unitario || Number(lineaActual.precio_unitario) <= 0) {
      setErrorLinea("Ingrese un precio unitario válido.");
      return;
    }

    const productoSeleccionado = productos.find(
      (p) => String(p.id) === String(lineaActual.producto)
    );
    const cantidad = Number(lineaActual.cantidad);
    const precio = parseFloat(lineaActual.precio_unitario);
    const subtotal = cantidad * precio;

    setDetalles((prev) => [
      ...prev,
      {
        producto: lineaActual.producto,
        nombre_producto: productoSeleccionado?.nombre ?? `Producto #${lineaActual.producto}`,
        cantidad,
        precio_unitario: precio,
        subtotal,
      },
    ]);
    setLineaActual({ producto: "", cantidad: "", precio_unitario: "" });
  };

  const handleEliminarLinea = (indice) => {
    setDetalles((prev) => prev.filter((_, i) => i !== indice));
  };

  const handleRegistrarCompra = async () => {
    if (detalles.length === 0) {
      setErrorEnvio("Agregue al menos un producto a la compra.");
      return;
    }
    setGuardando(true);
    setErrorEnvio(null);
    try {
      const payload = {
        total_compra: totalCompra,
        responsable_abastecimiento: usuario?.id,
        detalles: detalles.map((d) => ({
          producto: d.producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
      };
      const respuesta = await apiPost("/api/compras/compras/", payload);
      setComprobanteExitoso(respuesta?.numero_comprobante ?? respuesta?.id);
      setDetalles([]);
      setLineaActual({ producto: "", cantidad: "", precio_unitario: "" });
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleNuevaCompra = () => setComprobanteExitoso(null);

  // ── Render ────────────────────────────────────
  if (comprobanteExitoso !== null) {
    return (
      <div className="modulo">
        <div className="comprobante-exito">
          <div className="comprobante-exito__icono">✅</div>
          <h2 className="comprobante-exito__titulo">¡Compra registrada exitosamente!</h2>
          <p className="comprobante-exito__subtitulo">Número de comprobante</p>
          <div className="comprobante-exito__codigo">
            {String(comprobanteExitoso).startsWith("CMP")
              ? comprobanteExitoso
              : `CMP-${String(comprobanteExitoso).padStart(6, "0")}`}
          </div>
          <button className="btn btn--primario" onClick={handleNuevaCompra}>
            Registrar otra compra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modulo">
      <div className="modulo__cabecera">
        <h2 className="modulo__titulo">Compras y Abastecimiento</h2>
        <p className="modulo__subtitulo">Ingreso masivo de mercadería al sistema</p>
      </div>

      {/* ── Selector de línea ─────────────────── */}
      <div className="card">
        <h3 className="card__titulo">Agregar producto a la compra</h3>
        {errorProductos && <div className="alerta alerta--error">{errorProductos}</div>}
        <div className="form-row">
          <div className="form-campo form-campo--flex">
            <label className="form-campo__label">Producto *</label>
            <select
              name="producto"
              value={lineaActual.producto}
              onChange={handleCambioLinea}
              className="form-campo__input"
              disabled={cargandoProductos}
            >
              <option value="">
                {cargandoProductos ? "Cargando productos…" : "Seleccione un producto…"}
              </option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.codigo ? `(${p.codigo})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-campo form-campo--chico">
            <label className="form-campo__label">Cantidad *</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              value={lineaActual.cantidad}
              onChange={handleCambioLinea}
              className="form-campo__input"
              placeholder="0"
            />
          </div>

          <div className="form-campo form-campo--chico">
            <label className="form-campo__label">Precio unitario *</label>
            <input
              type="number"
              name="precio_unitario"
              min="0.01"
              step="0.01"
              value={lineaActual.precio_unitario}
              onChange={handleCambioLinea}
              className="form-campo__input"
              placeholder="0.00"
            />
          </div>

          <div className="form-campo form-campo--accion">
            <label className="form-campo__label">&nbsp;</label>
            <button className="btn btn--primario" onClick={handleAgregarLinea}>
              + Agregar
            </button>
          </div>
        </div>
        {errorLinea && <div className="alerta alerta--error">{errorLinea}</div>}
      </div>

      {/* ── Tabla de detalles ─────────────────── */}
      <div className="card">
        <h3 className="card__titulo">Detalle de la compra</h3>
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="tabla__vacia">
                    Agregue productos usando el formulario de arriba.
                  </td>
                </tr>
              ) : (
                detalles.map((d, i) => (
                  <tr key={i}>
                    <td>{d.nombre_producto}</td>
                    <td>{d.cantidad}</td>
                    <td>${d.precio_unitario.toFixed(2)}</td>
                    <td><strong>${d.subtotal.toFixed(2)}</strong></td>
                    <td>
                      <button
                        className="btn btn--chico btn--peligro"
                        onClick={() => handleEliminarLinea(i)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total y acción principal */}
        <div className="compra-pie">
          <div className="compra-pie__total">
            <span>Total de la compra:</span>
            <span className="compra-pie__monto">${totalCompra.toFixed(2)}</span>
          </div>
          {errorEnvio && <div className="alerta alerta--error">{errorEnvio}</div>}
          <button
            className="btn btn--primario btn--grande"
            onClick={handleRegistrarCompra}
            disabled={guardando || detalles.length === 0}
          >
            {guardando ? "Registrando…" : "Registrar compra"}
          </button>
        </div>
      </div>
    </div>
  );
}
