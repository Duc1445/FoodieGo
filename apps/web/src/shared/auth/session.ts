import { jwtDecode } from 'jwt-decode';

export type AuthRole = 'customer' | 'merchant' | 'admin';

export interface AuthTokenPayload {
  id: string;
  role: AuthRole;
  exp: number;
}

export type AuthValidationResult =
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'expired'; token: string; role?: AuthRole }
  | { status: 'valid'; token: string; role: AuthRole; exp: number };

export const AUTH_TOKEN_KEY = 'foodiego-auth-token';
export const AUTH_PERSIST_KEY = 'foodiego-auth';

export const getLoginPath = (role: AuthRole) => (role === 'customer' ? '/login' : `/${role}/login`);

export const getDashboardPath = (role: AuthRole) => (role === 'customer' ? '/' : `/${role}`);

export const clearAuthStorage = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PERSIST_KEY);
};

export const readAuthSession = (): AuthValidationResult => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return { status: 'missing' };
  }

  try {
    const decoded = jwtDecode<AuthTokenPayload>(token);
    const currentTime = Date.now() / 1000;

    if (!decoded.exp || decoded.exp < currentTime) {
      return { status: 'expired', token, role: decoded.role };
    }

    return { status: 'valid', token, role: decoded.role, exp: decoded.exp };
  } catch {
    return { status: 'invalid' };
  }
};
