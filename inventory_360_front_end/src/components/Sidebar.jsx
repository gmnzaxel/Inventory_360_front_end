import React from 'react';
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBox, FaTags, FaExchangeAlt, 
  FaShoppingCart, FaHandHoldingUsd, FaFileAlt, FaWarehouse, 
  FaBuilding, FaBoxes
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
  const menuSections = [
    {
      title: "Gestión",
      items: [
        { to: "/", icon: <FaTachometerAlt className="nav-icon" />, text: "Dashboard" },
        { to: "/products", icon: <FaBox className="nav-icon" />, text: "Productos" },
        { to: "/categories", icon: <FaTags className="nav-icon" />, text: "Categorías" },
      ]
    },
    {
      title: "Operaciones",
      items: [
        { to: "/movements", icon: <FaExchangeAlt className="nav-icon" />, text: "Movimientos" },
        { to: "/sales", icon: <FaHandHoldingUsd className="nav-icon" />, text: "Ventas" },
        { to: "/purchases", icon: <FaShoppingCart className="nav-icon" />, text: "Compras" },
      ]
    },
    {
      title: "Estructura",
      items: [
        { to: "/branches", icon: <FaWarehouse className="nav-icon" />, text: "Sucursales" },
        { to: "/stock", icon: <FaBoxes className="nav-icon" />, text: "Stock" },
        { to: "/documents", icon: <FaFileAlt className="nav-icon" />, text: "Documentos" },
        { to: "/business", icon: <FaBuilding className="nav-icon" />, text: "Empresa" },
      ]
    }
  ];

  return (
    // Añadimos los manejadores de eventos al div principal del Sidebar
    <div 
      className={`sidebar bg-dark d-flex flex-column ${isSidebarOpen ? '' : 'collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <div className="sidebar-header">
          <FaWarehouse className="nav-icon" />
          <span>Inventory 360</span>
        </div>
        <Nav className="flex-column">
          {menuSections.map((section, index) => (
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