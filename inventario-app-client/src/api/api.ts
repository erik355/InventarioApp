import axios from 'axios';

// Creamos la instancia con una configuración base
const api = axios.create({
    baseURL: 'http://localhost:5133/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 segundos de espera máxima antes de cancelar (profesional)
});

// Interceptor de REQUEST: Agrega el token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de RESPONSE: Maneja errores globalmente (ej: Token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            console.error("Acceso denegado: No tienes permisos suficientes.");
        } else if (!error.response) {
            console.error("Error de red: El servidor no responde.");
        }
        return Promise.reject(error);
    }
);

export default api;