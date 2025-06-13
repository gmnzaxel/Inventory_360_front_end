import React from 'react';
import { Button } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();

  return (
    <header className="app-header">
      <div className="d-flex align-items-center">
        <Button
          variant="outline-secondary"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
        >
          <FaBars />
        </Button>
      </div>
      <div className="d-flex align-items-center">
        <div className="text-end">
          <h6 className="mb-0">{currentUser?.name || 'Admin'}</h6>
          <small className="text-muted">{currentUser?.email}</small>
        </div>
      </div>
    </header>
  );
};

export default Header;
