// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  // La baseURL DEBE terminar aquí, en /api
  baseURL: 'https://apibookingsaccomodations-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token en todas las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;