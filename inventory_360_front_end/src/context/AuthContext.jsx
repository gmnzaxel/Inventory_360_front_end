import React from 'react';
import axios from 'axios';

const AuthContext = React.createContext();

const API_URL = 'http://localhost:8000'; 

export const useAuth = () => {
  return React.useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-control/user/`);
      setCurrentUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("No se pudieron obtener los datos del usuario.", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    }
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        await fetchUserData();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/user-control/login/`, { email, password });
      if (response.data.access) {
        const { access, refresh } = response.data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        await fetchUserData();
      }
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Email o contraseña incorrectos.');
    }
  };

  const registerAdmin = async (name, email, username, password, password2, business) => {
    try {
      await axios.post(`${API_URL}/user-control/register-admin/`, {
        name, email, username, password, password2, business
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
        await axios.post(`${API_URL}/user-control/logout/`, { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/user-control/user/delete/`);
      logout();
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error.response?.data);
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