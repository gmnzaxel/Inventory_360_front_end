import React from 'react';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaBox, FaExchangeAlt, FaShoppingCart, 
  FaHandHoldingUsd, FaWarehouse, FaBoxes, FaUserShield, FaTruck, FaTag, FaTruckLoading
} from 'react-icons/fa';
import './Sidebar.css';

const NavItem = ({ to, icon, text, isSidebarOpen }) => {
  const navLink = (
    <Nav.Link as={NavLink} to={to} end={to === "/"} className="d-flex align-items-center">
      {icon} <span>{text}</span>
    </Nav.Link>
  );

  if (!isSidebarOpen) {
    return (
      <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>{text}</Tooltip>}>
        {navLink}
      </OverlayTrigger>
    );
  }
  return navLink;
};

const Sidebar = ({ isSidebarOpen, handleMouseEnter, handleMouseLeave }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const menuSections = [
    {
      title: "Gestión",
      items: [
        { to: "/", icon: <FaTachometerAlt className="nav-icon" />, text: "Dashboard" },
        { to: "/products", icon: <FaBox className="nav-icon" />, text: "Productos" },
      ]
    },
    {
      title: "Operaciones",
      items: [
        { to: "/movements", icon: <FaExchangeAlt className="nav-icon" />, text: "Movimientos" },
        { to: "/sales", icon: <FaHandHoldingUsd className="nav-icon" />, text: "Ventas" },
        { to: "/purchases", icon: <FaShoppingCart className="nav-icon" />, text: "Compras" },
        { to: "/transfers", icon: <FaTruckLoading className="nav-icon" />, text: "Transferencias" },
      ]
    },
    {
      title: "Estructura",
      items: [
        { to: "/branches", icon: <FaWarehouse className="nav-icon" />, text: "Sucursales" },
        { to: "/categories", icon: <FaTag className="nav-icon" />, text: "Categorias" },
        { to: "/stock", icon: <FaBoxes className="nav-icon" />, text: "Stock" },
        { to: "/suppliers", icon: <FaTruck className="nav-icon" />, text: "Proveedores" },
      ]
    },
    {
      title: "Administracion",
      items: [
        { to: "/roles", icon: <FaUserShield className="nav-icon" />, text: "Gestión de Roles", adminOnly: true },
      ]
    }
  ];

  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.to === '/roles' && !isAdmin) {
          return false;
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div 
      className={`sidebar bg-dark d-flex flex-column ${isSidebarOpen ? '' : 'collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <Link to="/" className="sidebar-header text-decoration-none">
          <img
            src="/material-management.png"
            alt="Inventory360"
            className="brand-logo"
          />
          <span>Inventory360</span>
        </Link>
        <Nav className="flex-column">
          {visibleSections.map((section, index) => (
            <div key={index} className="sidebar-section">
              <small className="sidebar-section-title">{section.title}</small>
              {section.items.map((item) => (
                <NavItem key={item.text} {...item} isSidebarOpen={isSidebarOpen} />
              ))}
            </div>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;