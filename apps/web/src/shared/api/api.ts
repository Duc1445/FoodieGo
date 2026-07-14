import axios from 'axios';
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getLoginPath } from '../auth/session';
import { useAuthStore } from '../stores/useAuthStore';

const baseURL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const currentPath = window.location.pathname;
  let role: 'customer' | 'admin' | 'merchant' | 'shipper' = 'customer';
  if (currentPath.startsWith('/admin')) role = 'admin';
  else if (currentPath.startsWith('/merchant')) role = 'merchant';
  else if (currentPath.startsWith('/driver')) role = 'shipper';

  const token = useAuthStore.getState().getToken(role);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const userId: string | undefined = useAuthStore.getState().getUser(role)?.id;
  if (userId && config.headers) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      if (!isAuthPage) {
        let role: 'customer' | 'admin' | 'merchant' | 'shipper' = 'customer';
        if (currentPath.startsWith('/admin')) role = 'admin';
        else if (currentPath.startsWith('/merchant')) role = 'merchant';
        else if (currentPath.startsWith('/driver')) role = 'shipper';

        useAuthStore.getState().logout(role);
        window.location.href = getLoginPath(role);
      }
    }
    return Promise.reject(error);
  }
);
