import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import ProductsPage from './pages/ProductsPage';
import MovementsPage from './pages/MovementsPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import BranchesPage from './pages/BranchesPage';
import StockPage from './pages/StockPage';
import RolesPage from './pages/RolesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SuppliersPage from './pages/SuppliersPage'; // 1. Importa la nueva página
import './App.css';

const MainLayout = ({ isSidebarOpen, handleMouseEnter, handleMouseLeave }) => (
  <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} /> {/* 2. Añade la nueva ruta */}
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
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