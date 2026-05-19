import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SECTOR_SALON = "SALON";
const SECTOR_DEPOSITO = "DEPOSITO";

export default function ModuloSalon() {
  const { usuario, nombreRol } = useAuth();
  const esRepositor = nombreRol === "REPOSITOR";

  // ── Stock del salón ────────────────────────────
  const [stockSalon, setStockSalon] = useState([]);
  const [cargandoStock, setCargandoStock] = useState(true);
  const [errorStock, setErrorStock] = useState(null);

  // ── Formulario de solicitud de reposición ──────
  const [formRepo, setFormRepo] = useState({
    producto: "",
    cantidad: "",
    observaciones: "",
  });
  const [erroresRepo, setErroresRepo] = useState({});
  const [guardandoRepo, setGuardandoRepo] = useState(false);
  const [exitoRepo, setExitoRepo] = useState(null);
  const [errorRepo, setErrorRepo] = useState(null);

  // ── Cargar stock del salón ─────────────────────
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

  const handleCambioCampo = (e) => {
    const { name, value } = e.target;
    setFormRepo((prev) => ({ ...prev, [name]: value }));
    setErroresRepo((prev) => ({ ...prev, [name]: null }));
    setErrorRepo(null);
    setExitoRepo(null);
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!formRepo.producto) nuevosErrores.producto = "Seleccione un producto.";
    if (!formRepo.cantidad || Number(formRepo.cantidad) <= 0)
      nuevosErrores.cantidad = "La cantidad debe ser mayor a 0.";
    setErroresRepo(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSolicitarReposicion = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardandoRepo(true);
    setErrorRepo(null);
    setExitoRepo(null);
    try {
      // Transferencia desde DEPOSITO hacia SALON
      const payload = {
        producto: formRepo.producto,
        tipo: "transferencia",
        cantidad: Number(formRepo.cantidad),
        sector_origen: SECTOR_DEPOSITO,
        sector_destino: SECTOR_SALON,
        observaciones: formRepo.observaciones || `Reposición solicitada por ${usuario?.username}`,
        usuario: usuario?.id,
      };
      const respuesta = await apiPost("/api/inventario/stockmovimiento/", payload);
      setExitoRepo(`Reposición registrada. Movimiento ID: ${respuesta?.id ?? "—"}`);
      setFormRepo({ producto: "", cantidad: "", observaciones: "" });
      cargarStock();
    } catch (err) {
      setErrorRepo(err.message);
    } finally {
      setGuardandoRepo(false);
    }
  };

  // ── Clasificación del stock por nivel ──────────
  const clasificarNivel = (cantidad) => {
    if (cantidad <= 0) return "agotado";
    if (cantidad <= 5) return "bajo";
    if (cantidad <= 20) return "medio";
    return "alto";
  };

  const etiquetaNivel = {
    agotado: { texto: "Agotado", clase: "badge--error" },
    bajo: { texto: "Stock bajo", clase: "badge--advertencia" },
    medio: { texto: "Normal", clase: "badge--info" },
    alto: { texto: "Óptimo", clase: "badge--exito" },
  };

  return (
    <div className="modulo">
      <div className="modulo__cabecera">
        <h2 className="modulo__titulo">
          {esRepositor ? "Reposición de Salón" : "Monitor del Salón"}
        </h2>
        <p className="modulo__subtitulo">
          Stock en tiempo real del área de ventas
        </p>
      </div>

      {/* ── Resumen rápido ─────────────────────── */}
      {!cargandoStock && !errorStock && (
        <div className="metricas-grid">
          <TarjetaMetrica
            titulo="Productos en salón"
            valor={stockSalon.length}
          />
          <TarjetaMetrica
            titulo="Sin stock"
            valor={stockSalon.filter((s) => s.cantidad <= 0).length}
            alerta
          />
          <TarjetaMetrica
            titulo="Stock bajo (≤5)"
            valor={stockSalon.filter((s) => s.cantidad > 0 && s.cantidad <= 5).length}
            advertencia
          />
          <TarjetaMetrica
            titulo="Total unidades"
            valor={stockSalon.reduce((acc, s) => acc + (s.cantidad ?? 0), 0)}
          />
        </div>
      )}

      <div className="layout-dos-columnas">
        {/* ── Monitor de stock ──────────────── */}
        <div className="card card--alto">
          <div className="card__cabecera-flex">
            <h3 className="card__titulo">Stock del Salón</h3>
            <button className="btn btn--chico btn--secundario" onClick={cargarStock}>
              ↻ Actualizar
            </button>
          </div>

          {cargandoStock && <EstadoCarga mensaje="Cargando monitor…" />}
          {errorStock && <div className="alerta alerta--error">{errorStock}</div>}

          {!cargandoStock && !errorStock && (
            <div className="tabla-wrapper">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Cantidad</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {stockSalon.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="tabla__vacia">
                        No se encontraron registros de stock en Salón.
                      </td>
                    </tr>
                  ) : (
                    [...stockSalon]
                      .sort((a, b) => (a.cantidad ?? 0) - (b.cantidad ?? 0))
                      .map((item, i) => {
                        const nivel = clasificarNivel(item.cantidad ?? 0);
                        const { texto, clase } = etiquetaNivel[nivel];
                        return (
                          <tr key={item.id ?? i} className={nivel === "agotado" ? "tabla__fila--alerta" : ""}>
                            <td>{item.producto?.nombre ?? item.nombre_producto ?? "—"}</td>
                            <td><span className="tabla__codigo">{item.producto?.codigo ?? "—"}</span></td>
                            <td><strong>{item.cantidad ?? 0}</strong></td>
                            <td><span className={`badge ${clase}`}>{texto}</span></td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Solicitar reposición ──────────── */}
        <div className="card">
          <h3 className="card__titulo">Solicitar reposición desde Depósito</h3>
          <div className="sectores-indicador">
            <span className="sector-chip sector-chip--origen">Origen: DEPÓSITO</span>
            <span className="sector-chip">→</span>
            <span className="sector-chip sector-chip--destino">Destino: SALÓN</span>
          </div>

          <form onSubmit={handleSolicitarReposicion} noValidate>
            <div className="form-campo">
              <label className="form-campo__label">Producto *</label>
              <select
                name="producto"
                value={formRepo.producto}
                onChange={handleCambioCampo}
                className={`form-campo__input ${erroresRepo.producto ? "form-campo__input--error" : ""}`}
                disabled={cargandoStock}
              >
                <option value="">
                  {cargandoStock ? "Cargando…" : "Seleccione un producto…"}
                </option>
                {stockSalon.map((item, i) => (
                  <option
                    key={item.id ?? i}
                    value={item.producto?.id ?? item.producto}
                  >
                    {item.producto?.nombre ?? item.nombre_producto}
                    {item.cantidad !== undefined ? ` (en salón: ${item.cantidad})` : ""}
                  </option>
                ))}
              </select>
              {erroresRepo.producto && (
                <p className="form-campo__error">{erroresRepo.producto}</p>
              )}
            </div>

            <div className="form-campo">
              <label className="form-campo__label">Cantidad a reponer *</label>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={formRepo.cantidad}
                onChange={handleCambioCampo}
                className={`form-campo__input ${erroresRepo.cantidad ? "form-campo__input--error" : ""}`}
                placeholder="0"
              />
              {erroresRepo.cantidad && (
                <p className="form-campo__error">{erroresRepo.cantidad}</p>
              )}
            </div>

            <div className="form-campo">
              <label className="form-campo__label">Observaciones</label>
              <textarea
                name="observaciones"
                value={formRepo.observaciones}
                onChange={handleCambioCampo}
                className="form-campo__input form-campo__textarea"
                placeholder="Motivo de la reposición…"
                rows={3}
              />
            </div>

            {exitoRepo && <div className="alerta alerta--exito">{exitoRepo}</div>}
            {errorRepo && <div className="alerta alerta--error">{errorRepo}</div>}

            <button
              type="submit"
              className="btn btn--primario btn--bloque"
              disabled={guardandoRepo}
            >
              {guardandoRepo ? "Solicitando…" : "🔄 Solicitar reposición"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TarjetaMetrica({ titulo, valor, alerta, advertencia }) {
  return (
    <div className={`tarjeta-metrica ${alerta ? "tarjeta-metrica--alerta" : advertencia ? "tarjeta-metrica--advertencia" : ""}`}>
      <p className="tarjeta-metrica__titulo">{titulo}</p>
      <p className="tarjeta-metrica__valor">{valor}</p>
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
