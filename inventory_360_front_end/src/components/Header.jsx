import React from 'react';
import { Dropdown, Image } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // 1. Importamos el hook del tema
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // 2. Obtenemos el tema y la función para cambiarlo
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div></div> {/* Espacio para alinear */}
      
      <div className="d-flex align-items-center">
        <Dropdown align="end">
          <Dropdown.Toggle as="a" className="user-menu-dropdown">
            <Image 
              src={`https://ui-avatars.com/api/?name=${currentUser?.name?.charAt(0) || 'A'}&background=0d6efd&color=fff`} 
              roundedCircle 
              width="40" 
              height="40" 
              className="me-2"
            />
            <span className="d-none d-lg-inline">{currentUser?.name || 'Admin'}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Header>
              <div className="fw-bold">{currentUser?.name || 'Admin'}</div>
              <div className="text-muted small">{currentUser?.email}</div>
            </Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item href="#/profile"><FaUserCircle className="me-2" /> Perfil</Dropdown.Item>
            <Dropdown.Item href="#/settings"><FaCog className="me-2" /> Configuraciones</Dropdown.Item>
            {/* 3. Añadimos el botón para cambiar el tema */}
            <Dropdown.Item onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon className="me-2" /> : <FaSun className="me-2" />}
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <FaSignOutAlt className="me-2" /> Cerrar Sesión
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;