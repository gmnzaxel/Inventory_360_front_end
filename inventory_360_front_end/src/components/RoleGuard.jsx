import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage: <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
const RoleGuard = ({ allowedRoles = [], children, message = 'No tienes los permisos necesarios para acceder a esta seccion.' }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return null; // Already handled by ProtectedRoute

  const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(currentUser.role);
  if (!isAllowed) {
    return (
      <Navigate to="/" state={{ deniedMessage: message, from: location.pathname }} replace />
    );
  }
  return children;
};

export default RoleGuard;


