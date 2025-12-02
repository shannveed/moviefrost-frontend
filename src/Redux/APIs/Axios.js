import axios from "axios";

function getApiBaseUrl() {
  const envUrl = process.env.REACT_APP_API_URL;

  // In development, prefer localhost so new backend changes are always used
  if (process.env.NODE_ENV === "development") {
    if (envUrl && envUrl.includes("localhost")) {
      return envUrl; // e.g. http://localhost:5000/api
    }
    return "http://localhost:5000/api";
  }

  // In production / preview environments, use the env URL if provided
  if (envUrl) {
    return envUrl;
  }

  // Fallback production API URL
  return "https://moviefrost-backend-pi.vercel.app/api";
}

const Axios = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10s timeout for global reliability
});

// Simple retry on network/5xx with backoff
const shouldRetry = (error) => {
  if (!error || !error.config) return false;
  if (error.code === 'ECONNABORTED') return true; // timeout
  if (!error.response) return true; // network down/DNS fail
  const status = error.response.status;
  return status >= 500 || status === 429; // server errors or rate limits
};

const wait = (ms) => new Promise(res => setTimeout(res, ms));

Axios.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    if (config.method === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() };
    }
    // add retry meta
    config.__retryCount = config.__retryCount || 0;
    config.__maxRetries = 2;              // up to 2 retries
    config.__retryDelayBase = 400;        // base backoff ms
    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (shouldRetry(error) && config && config.__retryCount < config.__maxRetries) {
      config.__retryCount += 1;
      const delayMs = config.__retryDelayBase * Math.pow(2, config.__retryCount - 1);
      await wait(delayMs);
      return Axios(config);
    }
    return Promise.reject(error);
  }
);

export default Axios;
