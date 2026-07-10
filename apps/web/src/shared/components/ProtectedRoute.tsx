import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { jwtDecode } from 'jwt-decode';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('foodiego-auth-token');
      
      if (!token) {
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          logout();
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        logout();
        setIsAuthorized(false);
      }
      setIsValidating(false);
    };

    validateToken();
  }, [logout]);

  if (isValidating) {
    return null;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
