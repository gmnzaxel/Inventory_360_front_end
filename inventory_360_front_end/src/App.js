// src/App.js
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard'; // Importamos Dashboard
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {/* Renderizamos el Dashboard como componente principal */}
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
