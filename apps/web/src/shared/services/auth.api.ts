import { api } from '../api/api';
import { clearAuthStorage } from '../auth/session';

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'customer' | 'merchant' | 'admin';
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'customer' | 'merchant' | 'admin';
  restaurant_name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'customer' | 'merchant' | 'admin';
    name?: string;
    full_name?: string;
    phone?: string | null;
    address?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

export interface ProfileResponse {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'merchant' | 'admin';
}

export const AuthAPI = {
  login: async (credentials: LoginRequest) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return res.data.data;
  },

  register: async (data: RegisterRequest) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
    return res.data.data;
  },

  getProfile: async () => {
    const res = await api.get<{ success: boolean; data: ProfileResponse }>('/auth/profile');
    return res.data.data;
  },

  updateProfile: async (data: Partial<RegisterRequest>) => {
    const res = await api.put<{ success: boolean; data: ProfileResponse }>('/auth/profile', data);
    return res.data.data;
  },

  logout: () => {
    clearAuthStorage();
  }
};
