import React from 'react';
import api from '../api/client';
import { USER_PREFIX } from '../config/api';

const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`${USER_PREFIX}/user/`);
      setCurrentUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('No se pudieron obtener los datos del usuario.', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    }
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // Authorization header handled by api interceptor
        await fetchUserData();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post(`${USER_PREFIX}/login/`, { email, password });
      if (response.data.access) {
        const { access, refresh } = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        // Authorization header handled by api interceptor
        await fetchUserData();
      }
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Email o contrasena incorrectos.');
    }
  };

  const registerAdmin = async (name, email, username, password, password2, business) => {
    try {
      await api.post(`${USER_PREFIX}/register-admin/`, {
        name, email, password, password2, business,
      });
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Error al configurar el sistema.';
      if (errorData) {
        const messages = Object.values(errorData).flat().join(' ');
        if (messages) errorMessage = messages;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post(`${USER_PREFIX}/logout/`, { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Error al cerrar sesion en el backend:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete(`${USER_PREFIX}/user/delete/`);
      logout();
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'No se pudo eliminar la cuenta.');
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    registerAdmin,
    logout,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


