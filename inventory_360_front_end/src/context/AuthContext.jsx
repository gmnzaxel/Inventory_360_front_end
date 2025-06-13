import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  
  const getInitialState = (key, defaultValue) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  // Añadimos 'username' al usuario hardcodeado
  const [users, setUsers] = useState(() => getInitialState('users', [
    { email: 'user@test.com', password: 'password123', name: 'Usuario de Prueba', username: 'testuser' }
  ]));
  
  const [currentUser, setCurrentUser] = useState(() => getInitialState('currentUser', null));

  useEffect(() => {
    window.localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Actualizamos register para que acepte y valide el username
  const register = (email, password, name, username) => {
    if (users.find(user => user.email === email)) {
      throw new Error('El correo electrónico ya está registrado.');
    }
    if (users.find(user => user.username === username)) {
        throw new Error('El nombre de usuario ya existe.');
    }
    const newUser = { email, password, name, username };
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  // Actualizamos login para que acepte un 'identifier'
  const login = (identifier, password) => {
    // Buscamos si el identifier coincide con un email O con un username
    const user = users.find(
      u => (u.email === identifier || u.username === identifier) && u.password === password
    );

    if (user) {
      setCurrentUser(user);
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
