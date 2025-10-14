import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage: <RoleGuard allowedRoles={['admin']} requiredPermissions={['productos:read']}>{children}</RoleGuard>
const RoleGuard = ({
  allowedRoles = [],
  requiredPermissions = [],
  anyPermissions = [],
  children,
  message = 'No tienes los permisos necesarios para acceder a esta seccion.',
}) => {
  const { currentUser, hasPermission } = useAuth();
  const location = useLocation();

  if (!currentUser) return null; // Already handled by ProtectedRoute

  const roleAllowed = allowedRoles.length === 0 || allowedRoles.includes(currentUser.role);
  const requiredAllowed = requiredPermissions.every((code) => hasPermission(code));
  const anyAllowed = anyPermissions.length === 0 || anyPermissions.some((code) => hasPermission(code));
  const isAllowed = roleAllowed && requiredAllowed && anyAllowed;
  if (!isAllowed) {
    return (
      <Navigate to="/" state={{ deniedMessage: message, from: location.pathname }} replace />
    );
  }
  return children;
};

export default RoleGuard;


