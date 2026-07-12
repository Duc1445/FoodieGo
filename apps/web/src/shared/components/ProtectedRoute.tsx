import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Loading } from './Loading';
import { clearAuthStorage, getLoginPath, readAuthSession, type AuthRole } from '../auth/session';

export function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = getLoginPath('customer'),
}: {
  children: React.ReactNode;
  allowedRoles?: AuthRole[];
  loginPath?: string;
}) {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const session = readAuthSession();

    if (session.status === 'missing') {
      setRedirectPath(loginPath);
      setIsValidating(false);
      return;
    }

    if (session.status === 'invalid') {
      clearAuthStorage();
      logout();
      setRedirectPath(loginPath);
      setIsValidating(false);
      return;
    }

    if (session.status === 'expired') {
      clearAuthStorage();
      logout();
      setRedirectPath(loginPath);
      setIsValidating(false);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      clearAuthStorage();
      logout();
      setRedirectPath('/login');
      setIsValidating(false);
      return;
    }

    setRedirectPath(null);
    setIsValidating(false);
  }, [allowedRoles, loginPath, logout]);

  if (isValidating) {
    return <Loading fullScreen />;
  }

  if (redirectPath) {
    if (redirectPath === getLoginPath('customer')) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
