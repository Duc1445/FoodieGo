import { Navigate, Outlet } from 'react-router-dom';
import { getDashboardPath, readAuthSession, type AuthRole } from '../../shared/auth/session';
import { useAuthStore } from '../../shared/stores/useAuthStore';

export function AuthLayout({ role }: { role: AuthRole }) {
  const token = useAuthStore((state) => state.getToken(role));
  const session = readAuthSession(token);

  if (session.status === 'valid') {
    return <Navigate to={getDashboardPath(session.role)} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">FoodieGo</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
