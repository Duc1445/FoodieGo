import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthRole } from '../auth/session';

export interface User {
  id: string;
  role: AuthRole;
  email?: string;
  name?: string;
  full_name?: string;
  restaurantId?: string; // For merchant
}

interface AuthState {
  users: Partial<Record<AuthRole, User>>;
  tokens: Partial<Record<AuthRole, string>>;
  login: (user: User, token: string) => void;
  logout: (role: AuthRole) => void;
  isAuthenticated: (role: AuthRole) => boolean;
  getToken: (role: AuthRole) => string | undefined;
  getUser: (role: AuthRole) => User | undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      tokens: {},
      login: (user, token) => set((state) => ({
        users: { ...state.users, [user.role]: user },
        tokens: { ...state.tokens, [user.role]: token },
      })),
      logout: (role) => set((state) => {
        const newUsers = { ...state.users };
        const newTokens = { ...state.tokens };
        delete newUsers[role];
        delete newTokens[role];
        return { users: newUsers, tokens: newTokens };
      }),
      isAuthenticated: (role) => !!get().tokens[role],
      getToken: (role) => get().tokens[role],
      getUser: (role) => get().users[role],
    }),
    {
      name: 'foodiego-auth',
    }
  )
);
