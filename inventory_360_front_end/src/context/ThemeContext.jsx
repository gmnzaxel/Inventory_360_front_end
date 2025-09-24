import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    const authPaths = ['/login', '/register'];
    const isAuthPage = authPaths.includes(location.pathname);
    
    const effectiveTheme = isAuthPage ? 'light' : theme;

    document.body.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme, location.pathname]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
