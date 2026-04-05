
const envBaseUrl = process.env.REACT_APP_RUTA_WEB;
const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';

// Prioriza .env; si no existe, usa el mismo origen para no romper cookies de sesion.
const baseURL = (envBaseUrl || runtimeOrigin || 'http://localhost:8081').replace(/\/$/, '');

export default baseURL;
