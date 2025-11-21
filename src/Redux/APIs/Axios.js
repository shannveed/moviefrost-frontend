import axios from "axios";

const Axios = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000, // Q4: 10s timeout for global reliability
});

function getApiBaseUrl() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return "http://localhost:5000/api";
  }
  return "https://moviefrost-backend-pi.vercel.app/api";
}

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
      const delay = config.__retryDelayBase * Math.pow(2, config.__retryCount - 1);
      await wait(delay);
      return Axios(config);
    }
    if (error.message === 'Network Error' && !error.response) {
      console.error('Network error - please check your connection');
    }
    return Promise.reject(error);
  }
);

export default Axios;
