import axios from "axios";

// Creamos instancia de axios
const client = axios.create({
  // 🔥 IMPORTANTE: sacamos /api porque ya lo usás en los endpoints
  baseURL: "http://127.0.0.1:8000/",

  // Headers por defecto
  headers: {
    "Content-Type": "application/json",
  },
});


/* =========================
   🔐 INTERCEPTOR REQUEST
   (agrega JWT automáticamente)
========================= */
client.interceptors.request.use(
  (config) => {
    // Buscamos el token guardado (ej: en localStorage)
    const token = localStorage.getItem("access");

    // Si existe, lo agregamos al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/* =========================
   🔁 INTERCEPTOR RESPONSE
   (manejo de errores / refresh token)
========================= */
client.interceptors.response.use(
  (response) => response, // si todo ok, devuelve respuesta

  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no reintentamos todavía
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Obtener refresh token
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          throw new Error("No hay refresh token");
        }

        // Pedimos nuevo access token
        const res = await axios.post(
          "http://127.0.0.1:8000/api/auth/refresh/",
          { refresh }
        );

        // Guardamos nuevo token
        localStorage.setItem("access", res.data.access);

        // Reintentamos la request original
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        return client(originalRequest);

      } catch (err) {
        // Si falla refresh → logout
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        // Redirigir login (opcional)
        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default client;