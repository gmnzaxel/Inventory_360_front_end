// src/components/Sidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaTachometerAlt, FaBoxOpen, FaShoppingCart, FaDollarSign, FaFileInvoice, FaExchangeAlt, FaUndo, FaFileContract, FaUsers, FaChartBar, FaCog } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar bg-dark">
      <div className="sidebar-header">
        <h3>SalePro</h3>
      </div>
      <Nav className="flex-column">
        {/* El "Dashboard" es ahora el link activo */}
        <Nav.Link href="#dashboard" active className="d-flex align-items-center">
            <FaTachometerAlt className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link href="#product" className="d-flex align-items-center">
            <FaBoxOpen className="me-2" /> Product
        </Nav.Link>
        <Nav.Link href="#purchase" className="d-flex align-items-center"><FaShoppingCart className="me-2" /> Purchase</Nav.Link>
        <Nav.Link href="#sale" className="d-flex align-items-center"><FaDollarSign className="me-2" /> Sale</Nav.Link>
        <Nav.Link href="#expense" className="d-flex align-items-center"><FaFileInvoice className="me-2" /> Expense</Nav.Link>
        <Nav.Link href="#quotation" className="d-flex align-items-center"><FaFileContract className="me-2" /> Quotation</Nav.Link>
        {/* El link de Transfer ya no está activo por defecto */}
        <Nav.Link href="#transfer" className="d-flex align-items-center">
            <FaExchangeAlt className="me-2" /> Transfer
        </Nav.Link>
        <Nav.Link href="#return" className="d-flex align-items-center"><FaUndo className="me-2" /> Return</Nav.Link>
        <Nav.Link href="#accounting" className="d-flex align-items-center"><FaFileContract className="me-2" /> Accounting</Nav.Link>
        <Nav.Link href="#hrm" className="d-flex align-items-center"><FaUsers className="me-2" /> HRM</Nav.Link>
        <Nav.Link href="#people" className="d-flex align-items-center"><FaUsers className="me-2" /> People</Nav.Link>
        <Nav.Link href="#reports" className="d-flex align-items-center"><FaChartBar className="me-2" /> Reports</Nav.Link>
        <Nav.Link href="#settings" className="d-flex align-items-center"><FaCog className="me-2" /> Settings</Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
