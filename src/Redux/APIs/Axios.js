import axios from 'axios';

/*
 * ONE single place decides where requests go:
 *   • local dev            →  http://localhost:5000/api
 *   • Vercel production    →  /api   (handled by the rewrite above)
 *   • explicit env-var     →  whatever REACT_APP_API_URL says
 */
const API_BASE = (() => {
  /* 1️⃣ explicit env-var (e.g. CI preview deployments) */
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  
  /* 2️⃣ production build served by Vercel – the /api proxy is active */
  if (process.env.NODE_ENV === 'production') return '/api';
  
  /* 3️⃣ local development – Express runs on :5000 */
  return 'http://localhost:5000/api';
})();

const Axios = axios.create({ baseURL: API_BASE });

/* ------------------------------------------------------------------ */
/* Interceptors                                                       */
/* ------------------------------------------------------------------ */
Axios.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    if (config.method === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' && !error.response) {
      console.error('Network error - please check your connection');
    }
    return Promise.reject(error);
  }
);

export default Axios;
