import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { getLoginPath, type AuthRole } from '../auth/session';

export function RoleGuard({ role, children }: { role: AuthRole; children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={[role]} loginPath={getLoginPath(role)}>{children}</ProtectedRoute>;
}
