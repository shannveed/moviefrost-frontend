import axios from "axios";

// Create axios instance with dynamic base URL
const Axios = axios.create({
    baseURL: getApiBaseUrl(),
});

// Function to determine the correct API URL
function getApiBaseUrl() {
    // Use environment variable if available
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // In development, use localhost
    if (window.location.hostname === 'localhost') {
        return "http://localhost:5000/api";
    }
    
    // In production, use the backend Vercel URL
    return "https://moviefrost-backend.vercel.app/api";
}

// Add request interceptor to handle CORS and ensure correct URL
Axios.interceptors.request.use(
    (config) => {
        // Ensure we're always hitting the correct domain
        if (config.url && !config.url.startsWith('http')) {
            config.url = config.url.startsWith('/') ? config.url : `/${config.url}`;
        }
        
        // Add timestamp to prevent caching issues
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }
        
        // Add credentials for CORS
        config.withCredentials = true;
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
Axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // If it's a CORS error, provide a more helpful message
        if (error.message === 'Network Error' && !error.response) {
            console.error('CORS or Network error detected:', error);
            // You might want to redirect or handle this differently
        }
        return Promise.reject(error);
    }
);

export default Axios;
