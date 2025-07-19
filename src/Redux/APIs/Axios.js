// src/Redux/APIs/Axios.js
import axios from "axios";

// Create axios instance with dynamic base URL
const Axios = axios.create({
    baseURL: getApiBaseUrl(),
});

// Function to determine the correct API URL
function getApiBaseUrl() {
    // Check if we have an environment variable
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // Fallback for local development
    if (window.location.hostname === 'localhost') {
        return "http://localhost:5000/api";
    }
    
    // Default to production backend
    return "https://moviefrost-backend.vercel.app/api";
}

// Add request interceptor
Axios.interceptors.request.use(
    (config) => {
        // Ensure proper headers
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        
        // Add timestamp to prevent caching on GET requests
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
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
