// ─────────────────────────────────────────────
// Capa de abstracción de red — LogiRaf API
// Base URL configurable por variable de entorno
// ─────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Gestión de tokens en localStorage ──────────
export function getAccessToken() {
  return localStorage.getItem("logiraf_access") ?? null;
}

export function getRefreshToken() {
  return localStorage.getItem("logiraf_refresh") ?? null;
}

export function setTokens(access, refresh) {
  localStorage.setItem("logiraf_access", access);
  localStorage.setItem("logiraf_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("logiraf_access");
  localStorage.removeItem("logiraf_refresh");
}

// ── Intento de renovar el access token ─────────
async function renovarToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("Sin token de refresco.");

  const res = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Sesión expirada. Por favor inicie sesión nuevamente.");
  }

  const { access } = await res.json();
  localStorage.setItem("logiraf_access", access);
  return access;
}

// ── Función central de peticiones ──────────────
async function peticion(ruta, opciones = {}) {
  const url = `${BASE_URL}${ruta}`;
  let token = getAccessToken();

  const construirCabeceras = (tkn) => ({
    "Content-Type": "application/json",
    ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
    ...opciones.headers,
  });

  let respuesta = await fetch(url, {
    ...opciones,
    headers: construirCabeceras(token),
  });

  // Si el token expiró, intentar renovar y reintentar una vez
  if (respuesta.status === 401 && getRefreshToken()) {
    try {
      token = await renovarToken();
      respuesta = await fetch(url, {
        ...opciones,
        headers: construirCabeceras(token),
      });
    } catch {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Sesión expirada.");
    }
  }

  // Respuestas sin cuerpo (204 No Content)
  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const mensaje =
      datos?.detail ||
      datos?.non_field_errors?.[0] ||
      Object.values(datos ?? {})[0]?.[0] ||
      `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }

  return datos;
}

// ── Métodos públicos de la API ──────────────────
export const apiGet = (ruta, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const rutaConParams = queryString ? `${ruta}?${queryString}` : ruta;
  return peticion(rutaConParams, { method: "GET" });
};

export const apiPost = (ruta, cuerpo) =>
  peticion(ruta, { method: "POST", body: JSON.stringify(cuerpo) });

export const apiPut = (ruta, cuerpo) =>
  peticion(ruta, { method: "PUT", body: JSON.stringify(cuerpo) });

export const apiPatch = (ruta, cuerpo) =>
  peticion(ruta, { method: "PATCH", body: JSON.stringify(cuerpo) });

export const apiDelete = (ruta) =>
  peticion(ruta, { method: "DELETE" });
