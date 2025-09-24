import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Dashboard from './components/Dashboard';
import ProductsPage from './pages/ProductsPage';
import MovementsPage from './pages/MovementsPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import TransfersPage from './pages/TransfersPage';
import BranchesPage from './pages/BranchesPage';
import StockPage from './pages/StockPage';
import RolesPage from './pages/RolesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SuppliersPage from './pages/SuppliersPage';
import CategoriesPage from './pages/CategoriesPage';
import './App.css';
import { Toast, ToastContainer } from 'react-bootstrap';

const MainLayout = ({ isSidebarOpen, handleMouseEnter, handleMouseLeave }) => {
  const location = useLocation();
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    if (location.state && location.state.deniedMessage) {
      setToast({ show: true, message: location.state.deniedMessage });
      // Limpia el estado para evitar toasts repetidos al navegar atras
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
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
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/roles" element={
            <RoleGuard allowedRoles={["admin"]}>
              <RolesPage />
            </RoleGuard>
          } />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-end" className="p-3">
          <Toast bg="danger" onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={2500} autohide>
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleMouseEnter = () => setIsSidebarOpen(true);
  const handleMouseLeave = () => setIsSidebarOpen(false);

  return (
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
  );
}

export default App;

