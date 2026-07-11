import axios from 'axios';
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearAuthStorage, getLoginPath } from '../auth/session';
import { useAuthStore } from '../stores/useAuthStore';

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
  // user.id is in the persisted Zustand auth store — no JWT decoding needed.
  // useAuthStore.getState() is safe outside React (module-level singleton).
  const userId: string | undefined = useAuthStore.getState().user?.id;
  if (userId && config.headers) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect if we're on an authenticated page (not a login/register page)
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      if (!isAuthPage) {
        clearAuthStorage();
        // Redirect to appropriate login page based on current path
        if (currentPath.startsWith('/admin')) {
          window.location.href = getLoginPath('admin');
        } else if (currentPath.startsWith('/merchant')) {
          window.location.href = getLoginPath('merchant');
        } else {
          window.location.href = getLoginPath('customer');
        }
      }
    }
    return Promise.reject(error);
  }
);
