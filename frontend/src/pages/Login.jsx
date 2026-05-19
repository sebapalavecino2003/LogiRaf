import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Mapa de redirección por rol
const RUTA_POR_ROL = {
  ADMINISTRADOR_SISTEMA: "/admin/usuarios",
  RESPONSABLE_ABASTECIMIENTO: "/compras",
  OPERADOR_DEPOSITO: "/deposito",
  ENCARGADO_DEPOSITO: "/deposito",
  ENCARGADO_CAJA: "/caja",
  ENCARGADO_SALON: "/salon",
  REPOSITOR: "/salon",
};

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [campos, setCampos] = useState({ usuario: "", contrasena: "" });
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  const handleCambio = (e) => {
    setCampos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorLocal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campos.usuario || !campos.contrasena) {
      setErrorLocal("Complete todos los campos.");
      return;
    }
    setCargando(true);
    try {
      const datosUsuario = await iniciarSesion(campos.usuario, campos.contrasena);
      const ruta = RUTA_POR_ROL[datosUsuario?.rol?.nombre_rol] ?? "/";
      navigate(ruta, { replace: true });
    } catch (err) {
      setErrorLocal(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Encabezado */}
        <div className="login-card__header">
          <div className="login-card__logo">LR</div>
          <h1 className="login-card__titulo">LogiRaf</h1>
          <p className="login-card__subtitulo">Sistema de Gestión Logística</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-campo">
            <label htmlFor="usuario" className="form-campo__label">
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              autoComplete="username"
              value={campos.usuario}
              onChange={handleCambio}
              className="form-campo__input"
              placeholder="Ingrese su usuario"
              disabled={cargando}
            />
          </div>

          <div className="form-campo">
            <label htmlFor="contrasena" className="form-campo__label">
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              autoComplete="current-password"
              value={campos.contrasena}
              onChange={handleCambio}
              className="form-campo__input"
              placeholder="Ingrese su contraseña"
              disabled={cargando}
            />
          </div>

          {errorLocal && (
            <div className="alerta alerta--error" role="alert">
              {errorLocal}
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primario btn--bloque"
            disabled={cargando}
          >
            {cargando ? "Verificando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-card__footer-text">
          LogiRaf ERP &mdash; Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  );
}
