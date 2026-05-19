import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SECTOR_DEPOSITO = "DEPOSITO";
const SECTOR_SALON = "SALON";

export default function ModuloDeposito() {
  const { usuario } = useAuth();

  // ── Stock del depósito ─────────────────────────
  const [stockDeposito, setStockDeposito] = useState([]);
  const [cargandoStock, setCargandoStock] = useState(true);
  const [errorStock, setErrorStock] = useState(null);

  // ── Formulario de movimiento ───────────────────
  const [formMov, setFormMov] = useState({
    producto: "",
    tipo: "entrada",
    cantidad: "",
    observaciones: "",
  });
  const [erroresMov, setErroresMov] = useState({});
  const [guardandoMov, setGuardandoMov] = useState(false);
  const [exitoMov, setExitoMov] = useState(null);
  const [errorMov, setErrorMov] = useState(null);

  // ── Cargar stock del depósito ──────────────────
  const cargarStock = useCallback(async () => {
    setCargandoStock(true);
    setErrorStock(null);
    try {
      const data = await apiGet("/api/inventario/stockporsector/", { sector: SECTOR_DEPOSITO });
      setStockDeposito(data?.results ?? data ?? []);
    } catch (err) {
      setErrorStock(err.message);
    } finally {
      setCargandoStock(false);
    }
  }, []);

  useEffect(() => { cargarStock(); }, [cargarStock]);

  // ── Stock disponible del producto seleccionado ─
  const stockDisponible = stockDeposito.find(
    (s) => String(s.producto?.id ?? s.producto) === String(formMov.producto)
  )?.cantidad ?? null;

  // ── Lógica de campos según tipo de movimiento ──
  const sectorOrigen =
    formMov.tipo === "entrada" ? null
    : formMov.tipo === "salida" ? SECTOR_DEPOSITO
    : SECTOR_DEPOSITO; // transferencia

  const sectorDestino =
    formMov.tipo === "entrada" ? SECTOR_DEPOSITO
    : formMov.tipo === "salida" ? null
    : SECTOR_SALON; // transferencia

  const handleCambioCampo = (e) => {
    const { name, value } = e.target;
    setFormMov((prev) => ({ ...prev, [name]: value }));
    setErroresMov((prev) => ({ ...prev, [name]: null }));
    setErrorMov(null);
    setExitoMov(null);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formMov.producto) nuevosErrores.producto = "Seleccione un producto.";
    if (!formMov.cantidad || Number(formMov.cantidad) <= 0)
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0.";
    if (
      formMov.tipo === "salida" &&
      stockDisponible !== null &&
      Number(formMov.cantidad) > stockDisponible
    ) {
      nuevosErrores.cantidad = `Stock insuficiente. Disponible: ${stockDisponible} unidades.`;
    }
    setErroresMov(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleRegistrarMovimiento = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setGuardandoMov(true);
    setErrorMov(null);
    setExitoMov(null);
    try {
      const payload = {
        producto: formMov.producto,
        tipo: formMov.tipo,
        cantidad: Number(formMov.cantidad),
        sector_origen: sectorOrigen,
        sector_destino: sectorDestino,
        observaciones: formMov.observaciones,
        usuario: usuario?.id,
      };
      const respuesta = await apiPost("/api/inventario/stockmovimiento/", payload);
      setExitoMov(`Movimiento registrado correctamente. ID: ${respuesta?.id ?? "—"}`);
      setFormMov({ producto: "", tipo: "entrada", cantidad: "", observaciones: "" });
      cargarStock();
    } catch (err) {
      setErrorMov(err.message);
    } finally {
      setGuardandoMov(false);
    }
  };

  return (
    <div className="modulo">
      <div className="modulo__cabecera">
        <h2 className="modulo__titulo">Gestión de Depósito</h2>
        <p className="modulo__subtitulo">Control físico y auditoría del almacén principal</p>
      </div>

      <div className="layout-dos-columnas">
        {/* ── Panel izquierdo: Stock ─────────── */}
        <div className="card card--alto">
          <div className="card__cabecera-flex">
            <h3 className="card__titulo">Stock en Depósito</h3>
            <button className="btn btn--chico btn--secundario" onClick={cargarStock}>
              ↻ Actualizar
            </button>
          </div>

          {cargandoStock && <EstadoCarga mensaje="Cargando stock…" />}
          {errorStock && <div className="alerta alerta--error">{errorStock}</div>}
          {!cargandoStock && !errorStock && (
            <div className="tabla-wrapper">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stockDeposito.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="tabla__vacia">
                        No se encontraron registros de stock en Depósito.
                      </td>
                    </tr>
                  ) : (
                    stockDeposito.map((item, i) => (
                      <tr key={item.id ?? i}>
                        <td>{item.producto?.nombre ?? item.nombre_producto ?? "—"}</td>
                        <td><span className="tabla__codigo">{item.producto?.codigo ?? "—"}</span></td>
                        <td><strong>{item.cantidad}</strong></td>
                        <td>
                          <span className={`badge ${item.cantidad > 0 ? "badge--exito" : "badge--error"}`}>
                            {item.cantidad > 0 ? "Disponible" : "Sin stock"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Panel derecho: Movimiento ──────── */}
        <div className="card">
          <h3 className="card__titulo">Registrar movimiento</h3>
          <form onSubmit={handleRegistrarMovimiento} noValidate>
            <div className="form-campo">
              <label className="form-campo__label">Tipo de movimiento *</label>
              <select
                name="tipo"
                value={formMov.tipo}
                onChange={handleCambioCampo}
                className="form-campo__input"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="transferencia">Transferencia a Salón</option>
              </select>
            </div>

            {/* Indicadores automáticos de sectores */}
            <div className="sectores-indicador">
              {sectorOrigen && (
                <span className="sector-chip sector-chip--origen">
                  Origen: {sectorOrigen}
                </span>
              )}
              {sectorDestino && (
                <span className="sector-chip sector-chip--destino">
                  Destino: {sectorDestino}
                </span>
              )}
            </div>

            <div className="form-campo">
              <label className="form-campo__label">Producto *</label>
              <select
                name="producto"
                value={formMov.producto}
                onChange={handleCambioCampo}
                className={`form-campo__input ${erroresMov.producto ? "form-campo__input--error" : ""}`}
                disabled={cargandoStock}
              >
                <option value="">
                  {cargandoStock ? "Cargando…" : "Seleccione un producto…"}
                </option>
                {stockDeposito.map((item, i) => (
                  <option
                    key={item.id ?? i}
                    value={item.producto?.id ?? item.producto}
                  >
                    {item.producto?.nombre ?? item.nombre_producto}
                    {item.cantidad !== undefined ? ` (stock: ${item.cantidad})` : ""}
                  </option>
                ))}
              </select>
              {erroresMov.producto && (
                <p className="form-campo__error">{erroresMov.producto}</p>
              )}
            </div>

            {/* Mostrar stock disponible para salida/transferencia */}
            {(formMov.tipo === "salida" || formMov.tipo === "transferencia") &&
              formMov.producto &&
              stockDisponible !== null && (
                <div className="info-stock">
                  Stock disponible: <strong>{stockDisponible} unidades</strong>
                </div>
              )}

            <div className="form-campo">
              <label className="form-campo__label">Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formMov.cantidad}
                onChange={handleCambioCampo}
                className={`form-campo__input ${erroresMov.cantidad ? "form-campo__input--error" : ""}`}
                placeholder="0"
              />
              {erroresMov.cantidad && (
                <p className="form-campo__error">{erroresMov.cantidad}</p>
              )}
            </div>

            <div className="form-campo">
              <label className="form-campo__label">Observaciones</label>
              <textarea
                name="observaciones"
                value={formMov.observaciones}
                onChange={handleCambioCampo}
                className="form-campo__input form-campo__textarea"
                placeholder="Notas opcionales…"
                rows={3}
              />
            </div>

            {exitoMov && <div className="alerta alerta--exito">{exitoMov}</div>}
            {errorMov && <div className="alerta alerta--error">{errorMov}</div>}

            <button
              type="submit"
              className="btn btn--primario btn--bloque"
              disabled={guardandoMov}
            >
              {guardandoMov ? "Registrando…" : "Registrar movimiento"}
            </button>
          </form>
        </div>
      </div>
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
