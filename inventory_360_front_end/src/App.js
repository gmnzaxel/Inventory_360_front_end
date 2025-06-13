import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

const MainLayout = ({ isSidebarOpen, toggleSidebar }) => (
  <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
    <Sidebar isSidebarOpen={isSidebarOpen} />
    <div className="content-wrapper">
      <Header toggleSidebar={toggleSidebar} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  </div>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
