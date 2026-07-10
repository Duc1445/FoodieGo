import axios from 'axios';
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('foodiego-auth-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodiego-auth-token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
