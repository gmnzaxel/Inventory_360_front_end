import React from 'react';
import api from '../api/client';
import { USER_PREFIX } from '../config/api';
import { parseApiError } from '../utils/errors';

const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const normalizeUser = React.useCallback((user) => {
    if (!user) return null;
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    const branchId = user.branch?.id ?? user.branch_id ?? user.branchId ?? null;
    return {
      ...user,
      permissions,
      branchId,
    };
  }, []);

  const logout = React.useCallback(async () => {
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
  }, []);

  const fetchUserData = React.useCallback(async () => {
    try {
      const response = await api.get(`${USER_PREFIX}/user/`);
      setCurrentUser(normalizeUser(response.data));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('No se pudieron obtener los datos del usuario.', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    }
  }, [logout, normalizeUser]);

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
  }, [fetchUserData]);

  const login = React.useCallback(async (email, password) => {
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
      const apiError = parseApiError(error, 'Email o contraseña incorrectos.', 'Credenciales invalidas');
      throw new Error(apiError.message);
    }
  }, [fetchUserData]);

  const registerAdmin = React.useCallback(async (name, email, username, password, password2, business) => {
    try {
      await api.post(`${USER_PREFIX}/register-admin/`, {
        name, email, password, password2, business,
      });
    } catch (error) {
      const apiError = parseApiError(error, 'Error al configurar el sistema.', 'Registro');
      throw new Error(apiError.message);
    }
  }, []);

  const deleteAccount = React.useCallback(async () => {
    try {
      await api.delete(`${USER_PREFIX}/user/delete/`);
      await logout();
    } catch (error) {
      const apiError = parseApiError(error, 'No se pudo eliminar la cuenta.', 'Eliminar cuenta');
      console.error('Error al eliminar la cuenta:', error.response?.data);
      throw new Error(apiError.message);
    }
  }, [logout]);

  const hasPermission = React.useCallback(
    (code) => (code ? currentUser?.permissions?.includes(code) ?? false : true),
    [currentUser]
  );

  const value = React.useMemo(() => ({
    currentUser,
    isAuthenticated,
    loading,
    permissions: currentUser?.permissions || [],
    branchId: currentUser?.branchId ?? null,
    hasPermission,
    login,
    registerAdmin,
    logout,
    deleteAccount,
  }), [currentUser, isAuthenticated, loading, hasPermission, login, registerAdmin, logout, deleteAccount]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

