import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Loading } from './Loading';
import { getLoginPath, readAuthSession, type AuthRole } from '../auth/session';

export function ProtectedRoute({
  children,
  allowedRoles,
  loginPath = getLoginPath('customer'),
}: {
  children: React.ReactNode;
  allowedRoles?: AuthRole[];
  loginPath?: string;
}) {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Determine which role we are protecting for this route
  const primaryRole = allowedRoles?.[0] || 'customer';
  const token = useAuthStore((state) => state.getToken(primaryRole));

  useEffect(() => {
    const session = readAuthSession(token);

    if (session.status === 'missing') {
      setRedirectPath(loginPath);
      setIsValidating(false);
      return;
    }

    if (session.status === 'invalid' || session.status === 'expired') {
      logout(primaryRole);
      setRedirectPath(loginPath);
      setIsValidating(false);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      logout(primaryRole);
      setRedirectPath('/login');
      setIsValidating(false);
      return;
    }

    setRedirectPath(null);
    setIsValidating(false);
  }, [allowedRoles, loginPath, logout, token, primaryRole]);

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
