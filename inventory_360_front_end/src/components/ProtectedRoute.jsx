import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo redirigimos a /login.
    // Guardamos la ubicación a la que intentaba ir para poder redirigirlo de vuelta después del login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderizamos el componente hijo que protege esta ruta.
  return children;
};

export default ProtectedRoute;
