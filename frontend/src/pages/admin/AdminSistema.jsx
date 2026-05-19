import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../services/api";

// ── Componente principal ────────────────────────────────────────
export default function AdminSistema() {
  const [pestanaActiva, setPestanaActiva] = useState("usuarios");

  return (
    <div className="modulo">
      <div className="modulo__cabecera">
        <h2 className="modulo__titulo">Administración del Sistema</h2>
        <p className="modulo__subtitulo">Gestión de usuarios y control de accesos</p>
      </div>

      <div className="pestanas">
        <button
          className={`pestanas__tab ${pestanaActiva === "usuarios" ? "pestanas__tab--activo" : ""}`}
          onClick={() => setPestanaActiva("usuarios")}
        >
          👤 Usuarios
        </button>
        <button
          className={`pestanas__tab ${pestanaActiva === "roles" ? "pestanas__tab--activo" : ""}`}
          onClick={() => setPestanaActiva("roles")}
        >
          🛡️ Roles
        </button>
      </div>

      {pestanaActiva === "usuarios" && <TablaUsuarios />}
      {pestanaActiva === "roles" && <TablaRoles />}
    </div>
  );
}

// ── Tabla de Usuarios ───────────────────────────────────────────
function TablaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [dataUsuarios, dataRoles] = await Promise.all([
        apiGet("/api/usuarios/usuarios/"),
        apiGet("/api/usuarios/roles/"),
      ]);
      setUsuarios(dataUsuarios?.results ?? dataUsuarios ?? []);
      setRoles(dataRoles?.results ?? dataRoles ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleEliminar = async (id) => {
    try {
      await apiDelete(`/api/usuarios/usuarios/${id}/`);
      setConfirmandoEliminar(null);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuardado = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    cargarDatos();
  };

  return (
    <>
      <div className="tabla-seccion">
        <div className="tabla-seccion__barra">
          <h3 className="tabla-seccion__titulo">Usuarios registrados</h3>
          <button
            className="btn btn--primario"
            onClick={() => { setUsuarioEditando(null); setModalAbierto(true); }}
          >
            + Nuevo usuario
          </button>
        </div>

        {cargando && <EstadoCarga mensaje="Cargando usuarios…" />}
        {error && <div className="alerta alerta--error">{error}</div>}

        {!cargando && !error && (
          <div className="tabla-wrapper">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="tabla__vacia">No se encontraron usuarios registrados.</td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id}>
                      <td><span className="tabla__codigo">{u.username}</span></td>
                      <td>{u.first_name} {u.last_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge--info">
                          {u.rol?.nombre_rol ?? "Sin rol"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? "badge--exito" : "badge--error"}`}>
                          {u.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="tabla__acciones">
                          <button
                            className="btn btn--chico btn--secundario"
                            onClick={() => { setUsuarioEditando(u); setModalAbierto(true); }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn--chico btn--peligro"
                            onClick={() => setConfirmandoEliminar(u)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      {modalAbierto && (
        <ModalUsuario
          usuario={usuarioEditando}
          roles={roles}
          onGuardado={handleGuardado}
          onCerrar={() => { setModalAbierto(false); setUsuarioEditando(null); }}
        />
      )}

      {/* Confirmación de eliminación */}
      {confirmandoEliminar && (
        <ModalConfirmacion
          mensaje={`¿Eliminar al usuario "${confirmandoEliminar.username}"? Esta acción no puede deshacerse.`}
          onConfirmar={() => handleEliminar(confirmandoEliminar.id)}
          onCancelar={() => setConfirmandoEliminar(null)}
        />
      )}
    </>
  );
}

// ── Modal de usuario (crear / editar) ──────────────────────────
function ModalUsuario({ usuario, roles, onGuardado, onCerrar }) {
  const esEdicion = !!usuario;
  const [campos, setCampos] = useState({
    username: usuario?.username ?? "",
    first_name: usuario?.first_name ?? "",
    last_name: usuario?.last_name ?? "",
    email: usuario?.email ?? "",
    rol: usuario?.rol?.id ?? "",
    password: "",
    confirmar_password: "",
    is_active: usuario?.is_active ?? true,
  });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const handleCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setCampos((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!campos.username) nuevosErrores.username = "El usuario es obligatorio.";
    if (!campos.rol) nuevosErrores.rol = "Debe seleccionar un rol.";
    if (!esEdicion) {
      if (!campos.password) nuevosErrores.password = "La contraseña es obligatoria.";
      else if (campos.password.length < 8) nuevosErrores.password = "Mínimo 8 caracteres.";
      if (campos.password !== campos.confirmar_password)
        nuevosErrores.confirmar_password = "Las contraseñas no coinciden.";
    } else if (campos.password) {
      if (campos.password.length < 8) nuevosErrores.password = "Mínimo 8 caracteres.";
      if (campos.password !== campos.confirmar_password)
        nuevosErrores.confirmar_password = "Las contraseñas no coinciden.";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      const payload = {
        username: campos.username,
        first_name: campos.first_name,
        last_name: campos.last_name,
        email: campos.email,
        rol: Number(campos.rol),
        is_active: campos.is_active,
      };
      if (campos.password) payload.password = campos.password;

      if (esEdicion) {
        await apiPut(`/api/usuarios/usuarios/${usuario.id}/`, payload);
      } else {
        await apiPost("/api/usuarios/usuarios/", payload);
      }
      onGuardado();
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__cabecera">
          <h3 className="modal__titulo">{esEdicion ? "Editar usuario" : "Nuevo usuario"}</h3>
          <button className="modal__cerrar" onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal__cuerpo">
            {errores.general && (
              <div className="alerta alerta--error">{errores.general}</div>
            )}
            <div className="form-grid">
              <CampoTexto label="Usuario *" name="username" valor={campos.username} onChange={handleCambio} error={errores.username} />
              <CampoTexto label="Nombre" name="first_name" valor={campos.first_name} onChange={handleCambio} />
              <CampoTexto label="Apellido" name="last_name" valor={campos.last_name} onChange={handleCambio} />
              <CampoTexto label="Email" name="email" type="email" valor={campos.email} onChange={handleCambio} />
              <div className="form-campo">
                <label className="form-campo__label">Rol *</label>
                <select
                  name="rol"
                  value={campos.rol}
                  onChange={handleCambio}
                  className={`form-campo__input ${errores.rol ? "form-campo__input--error" : ""}`}
                >
                  <option value="">Seleccione un rol…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                  ))}
                </select>
                {errores.rol && <p className="form-campo__error">{errores.rol}</p>}
              </div>
              <CampoTexto label={esEdicion ? "Nueva contraseña (opcional)" : "Contraseña *"} name="password" type="password" valor={campos.password} onChange={handleCambio} error={errores.password} />
              <CampoTexto label="Confirmar contraseña" name="confirmar_password" type="password" valor={campos.confirmar_password} onChange={handleCambio} error={errores.confirmar_password} />
              <div className="form-campo form-campo--checkbox">
                <label className="form-campo__label">
                  <input type="checkbox" name="is_active" checked={campos.is_active} onChange={handleCambio} />
                  &nbsp;Usuario activo
                </label>
              </div>
            </div>
          </div>
          <div className="modal__pie">
            <button type="button" className="btn btn--secundario" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn--primario" disabled={guardando}>
              {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla de Roles ──────────────────────────────────────────────
function TablaRoles() {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await apiGet("/api/usuarios/roles/");
        setRoles(data?.results ?? data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="tabla-seccion">
      <div className="tabla-seccion__barra">
        <h3 className="tabla-seccion__titulo">Roles del sistema</h3>
      </div>
      {cargando && <EstadoCarga mensaje="Cargando roles…" />}
      {error && <div className="alerta alerta--error">{error}</div>}
      {!cargando && !error && (
        <div className="tabla-wrapper">
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del rol</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr><td colSpan={3} className="tabla__vacia">No se encontraron roles.</td></tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td><span className="badge badge--info">{r.nombre_rol}</span></td>
                    <td>{r.descripcion ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Componentes auxiliares ──────────────────────────────────────
function CampoTexto({ label, name, type = "text", valor, onChange, error }) {
  return (
    <div className="form-campo">
      <label className="form-campo__label">{label}</label>
      <input
        type={type}
        name={name}
        value={valor}
        onChange={onChange}
        className={`form-campo__input ${error ? "form-campo__input--error" : ""}`}
      />
      {error && <p className="form-campo__error">{error}</p>}
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

function ModalConfirmacion({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal--chico">
        <div className="modal__cuerpo">
          <p style={{ marginBottom: "1.5rem", fontSize: "15px" }}>{mensaje}</p>
          <div className="modal__pie">
            <button className="btn btn--secundario" onClick={onCancelar}>Cancelar</button>
            <button className="btn btn--peligro" onClick={onConfirmar}>Sí, eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
