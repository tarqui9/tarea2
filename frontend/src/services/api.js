import axios from 'axios';

export const TOKEN_KEY = 'finanzapro_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // 60 s: el plan gratuito de Render "duerme" el backend y tarda ~50 s en despertar
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Sesión expirada: limpiar token y avisar al contexto de autenticación
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('finanzapro:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
  if (error.request) return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  return error.message || 'Ocurrió un error inesperado.';
};

export default api;
