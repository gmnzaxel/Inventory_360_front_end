import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

const MainLayout = ({ isSidebarOpen, handleMouseEnter, handleMouseLeave }) => (
  <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
    {/* Pasamos los manejadores de eventos directamente al Sidebar */}
    <Sidebar 
      isSidebarOpen={isSidebarOpen} 
      handleMouseEnter={handleMouseEnter} 
      handleMouseLeave={handleMouseLeave} 
    />
    <div className="content-wrapper">
      <Header />
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMouseEnter = () => setIsSidebarOpen(true);
  const handleMouseLeave = () => setIsSidebarOpen(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout 
              isSidebarOpen={isSidebarOpen} 
              handleMouseEnter={handleMouseEnter} 
              handleMouseLeave={handleMouseLeave}
            />
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  );
}

export default App;