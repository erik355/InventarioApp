// src/api/api.ts
import axios from 'axios';

const api = axios.create({
    // ACÁ VA LA URL DE TU BACKEND .NET (revisá qué puerto te asignó .NET al correr la API, ej: 5001, 7254, etc.)
    baseURL: 'http://localhost:5133/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Este bloque intercepta las peticiones y les pega el Token JWT automáticamente si el usuario está logueado
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;