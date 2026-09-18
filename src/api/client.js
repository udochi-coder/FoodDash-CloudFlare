import axios from 'axios';

const defaultApiUrl = import.meta.env.PROD
    ? 'https://fooddash-backend-wcl8.onrender.com/api/v1'
    : 'http://localhost:8080/api/v1';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '')
    .trim()
    .replace(/^VITE_API_URL\s*=\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl)
    .trim()
    .replace(/\/+$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
});

// The WebSocket endpoint lives outside the /api/v1 prefix. Keep the backend
// location derived from the same VITE_API_URL used for HTTP requests.
export function orderWebSocketURL(orderId, token) {
    const url = new URL(API_BASE_URL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `/ws/orders/${encodeURIComponent(orderId)}`;
    url.search = new URLSearchParams({ token }).toString();
    return url.toString();
}

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
