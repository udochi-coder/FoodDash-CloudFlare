import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'VITE_API_URL=https://fooddash-api.onrender.com/api/v1')
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
