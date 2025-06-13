import React from 'react';
import { Nav, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaBoxOpen, FaShoppingCart, FaDollarSign, 
  FaFileInvoice, FaExchangeAlt, FaUndo, FaFileContract, 
  FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaWarehouse
} from 'react-icons/fa';
import './Sidebar.css';

// Componente helper para crear los links con tooltip
const NavItem = ({ to, icon, text, isSidebarOpen }) => {
  const navLink = (
    <Nav.Link as={NavLink} to={to} end={to === "/"} className="d-flex align-items-center">
      {icon} <span>{text}</span>
    </Nav.Link>
  );

  // Si el sidebar está cerrado, envolvemos el link con el tooltip
  if (!isSidebarOpen) {
    return (
      <OverlayTrigger
        placement="right"
        delay={{ show: 250, hide: 400 }}
        overlay={<Tooltip id={`tooltip-${text}`}>{text}</Tooltip>}
      >
        {navLink}
      </OverlayTrigger>
    );
  }

  return navLink;
};


const Sidebar = ({ isSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: "/", icon: <FaTachometerAlt className="nav-icon" />, text: "Dashboard" },
    { to: "/product", icon: <FaBoxOpen className="nav-icon" />, text: "Product" },
    { to: "/purchase", icon: <FaShoppingCart className="nav-icon" />, text: "Purchase" },
    { to: "/sale", icon: <FaDollarSign className="nav-icon" />, text: "Sale" },
    { to: "/expense", icon: <FaFileInvoice className="nav-icon" />, text: "Expense" },
    { to: "/quotation", icon: <FaFileContract className="nav-icon" />, text: "Quotation" },
    { to: "/transfer", icon: <FaExchangeAlt className="nav-icon" />, text: "Transfer" },
    { to: "/return", icon: <FaUndo className="nav-icon" />, text: "Return" },
    { to: "/accounting", icon: <FaFileContract className="nav-icon" />, text: "Accounting" },
    { to: "/hrm", icon: <FaUsers className="nav-icon" />, text: "HRM" },
    { to: "/people", icon: <FaUsers className="nav-icon" />, text: "People" },
    { to: "/reports", icon: <FaChartBar className="nav-icon" />, text: "Reports" },
    { to: "/settings", icon: <FaCog className="nav-icon" />, text: "Settings" },
  ];

  return (
    <div className={`sidebar bg-dark d-flex flex-column ${isSidebarOpen ? '' : 'collapsed'}`}>
      <div>
        <div className="sidebar-header">
          <FaWarehouse className="nav-icon" />
          <span>Inventory 360</span>
        </div>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <NavItem key={item.text} {...item} isSidebarOpen={isSidebarOpen} />
          ))}
        </Nav>
      </div>
      
      <div className="mt-auto p-3">
        <Button variant="danger" className="w-100 d-flex align-items-center justify-content-center" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
