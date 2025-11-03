import axios from "axios";

// Create axios instance with dynamic base URL
const Axios = axios.create({
  baseURL: getApiBaseUrl(),
});

// Decide API base URL with safe fallbacks
function getApiBaseUrl() {
  // 1) Prefer environment variable (set at build time on Vercel)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2) Local dev
  if (process.env.NODE_ENV === 'development') {
    return "http://localhost:5000/api";
  }

  // 3) Production fallback (match your Vercel project domain)
  return "https://moviefrost-backend-pi.vercel.app/api";
}

// Interceptors
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
