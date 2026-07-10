import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export function RoleGuard({ role, children }: { role: 'customer' | 'merchant' | 'admin'; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated() || !user) {
    // Redirect to the respective login page based on the required role
    const loginPath = role === 'customer' ? '/login' : `/${role}/login`;
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // If logged in but wrong role, redirect to unauthorized or home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
