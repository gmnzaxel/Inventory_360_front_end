import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Si el usuario no esta autenticado, lo redirigimos a /login.
    // Guardamos la ubicacion a la que intentaba ir para poder redirigirlo de vuelta despues del login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si esta autenticado, renderizamos el componente hijo que protege esta ruta.
  return children;
};

export default ProtectedRoute;

