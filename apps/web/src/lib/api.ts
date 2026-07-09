import axios from 'axios';

// The gateway runs on port 3000 locally
const baseURL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodiego-auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling, e.g., redirect to login on 401
    return Promise.reject(error);
  }
);
