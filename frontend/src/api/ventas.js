// Importamos axios configurado (baseURL + token JWT + interceptores)
import client from "./clients";


/* =========================
   💰 VENTAS
========================= */

// 🔹 Obtener todas las ventas (GET)
export async function getVentas() {

  // Hace una petición GET al endpoint de ventas
  const res = await client.get("api/v1/ventas/ventas/");

  // Si hay paginación usamos results, sino devolvemos todo
  return res.data.results ?? res.data;
}


// 🔹 Crear una venta (POST)
export async function postVenta(data) {
  // Enviamos los datos al backend
  const res = await client.post("api/v1/ventas/ventas/", data);

  // Devuelve la venta creada
  return res.data;
}


/* =========================
   📦 DETALLES DE VENTA
========================= */

// 🔹 Obtener todos los detalles (solo lectura)
export async function getDetallesVenta() {

  // GET → consulta detalles individuales
  const res = await client.get("api/v1/ventas/detalles/");

  return res.data.results ?? res.data;
}


/* =========================
   🧾 COMPROBANTES
========================= */

// 🔹 Obtener comprobantes generados
export async function getComprobantes() {

  // GET → lista tickets/comprobantes
  const res = await client.get("api/v1/ventas/comprobantes/");

  return res.data.results ?? res.data;
}