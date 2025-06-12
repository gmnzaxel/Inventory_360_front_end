import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Importa BrowserRouter
import { BrowserRouter } from 'react-router-dom';

// Importa el CSS de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envuelve tu componente App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)