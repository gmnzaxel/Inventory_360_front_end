import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaUser, FaCog, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar className="header px-4" expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          {currentUser && (
            <Dropdown align="end">
              <Dropdown.Toggle variant="transparent" id="dropdown-user" className="d-flex align-items-center text-decoration-none">
                <div className="avatar bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="d-none d-sm-inline">{currentUser.name}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <div className="px-3 py-2">
                  <div className="fw-bold">{currentUser.name}</div>
                  <div className="text-muted small">{currentUser.email}</div>
                </div>
                <Dropdown.Divider />
                {/* --- CORRECCIÓN AQUÍ --- */}
                <Dropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2" /> Perfil
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings">
                  <FaCog className="me-2" /> Configuraciones
                </Dropdown.Item>
                <Dropdown.Item onClick={toggleTheme}>
                  {theme === 'light' ? <FaMoon className="me-2" /> : <FaSun className="me-2" />}
                  Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" /> Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;