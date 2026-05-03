// Importamos axios configurado (baseURL, JWT, interceptores)
import client from "./clients";


/* =========================
   🛒 COMPRAS
========================= */

// 🔹 Obtener todas las compras (GET)
export async function getCompras() {

  // GET → consulta todas las compras registradas
  const res = await client.get("api/v1/compras/compras/");

  // Soporte para paginación de DRF
  return res.data.results ?? res.data;
}


// 🔹 Crear una compra (POST)
export async function postCompra(data) {
  // POST → envía datos al backend
  const res = await client.post("api/v1/compras/compras/", data);

  // Devuelve la compra creada
  return res.data;
}


/* =========================
   📦 DETALLES DE COMPRA
========================= */

// 🔹 Obtener detalles individuales (solo lectura)
export async function getDetallesCompra() {

  // GET → consulta detalles de compras
  const res = await client.get("api/v1/compras/detalles/");

  return res.data.results ?? res.data;
}


/* =========================
   🧾 COMPROBANTES DE COMPRA
========================= */

// 🔹 Obtener comprobantes generados
export async function getComprobantesCompra() {

  // GET → lista comprobantes de compras
  const res = await client.get("api/v1/compras/comprobantes/");

  return res.data.results ?? res.data;
}