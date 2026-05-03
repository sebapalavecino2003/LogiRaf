// Importamos la instancia de axios ya configurada (baseURL, headers, token, etc.)
import client from "./clients";


/* =========================
   📦 PRODUCTOS
========================= */

// Función para OBTENER todos los productos (GET)
export async function getProductos() {

  // Hace una petición HTTP GET al endpoint de productos
  const res = await client.get("api/v1/inventario/productos/");

  // DRF puede devolver datos paginados (con "results")
  // Si existe results lo usamos, sino devolvemos todo
  return res.data.results ?? res.data;
}


// Función para CREAR un producto (POST)
export async function postProducto(data) {

  // POST envía datos al backend para crear un recurso
  const res = await client.post("api/v1/inventario/productos/", data);

  // Devolvemos la respuesta del backend (producto creado)
  return res.data;
}


/* =========================
   🗂️ CATEGORIAS
========================= */

// Obtener todas las categorías
export async function getCategorias() {

  // GET → solo consulta datos (no modifica nada)
  const res = await client.get("api/v1/inventario/categorias/");

  return res.data.results ?? res.data;
}


/* =========================
   🏬 STOCK POR SECTOR
========================= */

// Obtener el stock (depósito / salón)
export async function getStock() {

  // Endpoint del backend para stock por sector
  const res = await client.get("api/v1/inventario/stockporsector/");

  return res.data.results ?? res.data;
}


/* =========================
   🔄 MOVIMIENTOS DE STOCK
========================= */

// Crear un movimiento (entrada, salida o transferencia)
export async function postMovimiento(data) {

  // POST → crea un movimiento en el backend
  const res = await client.post("api/v1/inventario/stockmovimiento/", data);

  return res.data;
}


/* =========================
   🛒 COMPRAS
========================= */

// Registrar una compra (esto dispara ingreso de stock)
export async function postCompra(data) {

  // Llamamos al endpoint de compras
  const res = await client.post("api/v1/compras/compras/", data);

  return res.data;
}