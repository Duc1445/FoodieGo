import { api } from '../api/api';

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'customer' | 'merchant' | 'admin' | 'shipper';
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'customer' | 'merchant' | 'admin' | 'shipper';
  restaurant_name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'customer' | 'merchant' | 'admin' | 'shipper';
    name?: string;
    full_name?: string;
    phone?: string | null;
    address?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
}

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

export interface Address {
  id: string;
  userId: string;
  address: string;
  phone: string;
  isDefault: boolean;
  isActive: boolean;
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
    const res = await api.get<{ success: boolean; data: ProfileData }>('/auth/profile');
    return res.data.data;
  },

  updateProfile: async (data: Partial<ProfileData>) => {
    const res = await api.put<{ success: boolean; data: ProfileData }>('/auth/profile', data);
    return res.data.data;
  },

  getAddresses: async (userId: string) => {
    const res = await api.get<{ success: boolean; data: Address[] }>(`/users/${userId}/addresses`);
    return res.data.data;
  },

  addAddress: async (userId: string, data: Omit<Partial<Address>, 'id' | 'userId'>) => {
    const res = await api.post<{ success: boolean; data: Address }>(`/users/${userId}/addresses`, data);
    return res.data.data;
  },

  updateAddress: async (userId: string, addressId: string, data: Partial<Address>) => {
    const res = await api.put<{ success: boolean; data: Address }>(`/users/${userId}/addresses/${addressId}`, data);
    return res.data.data;
  },

  deleteAddress: async (userId: string, addressId: string) => {
    const res = await api.delete<{ success: boolean }>(`/users/${userId}/addresses/${addressId}`);
    return res.data;
  }
};
