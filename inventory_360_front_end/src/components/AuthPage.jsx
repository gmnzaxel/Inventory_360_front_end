import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import { FaWarehouse, FaEnvelope, FaLock, FaUser, FaUserCircle } from 'react-icons/fa';
import './AuthPage.css';

// --- Sub-componente para el formulario de Login ---
const LoginForm = ({ onSwitch }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="auth-title">Iniciar Sesión</h2>
      <p className="auth-subtitle text-muted">Bienvenido de nuevo</p>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        <InputGroup className="mb-3">
          <InputGroup.Text><FaUserCircle /></InputGroup.Text>
          <Form.Control type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email o Nombre de usuario" />
        </InputGroup>
        <InputGroup className="mb-4">
          <InputGroup.Text><FaLock /></InputGroup.Text>
          <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
        </InputGroup>
        <Button variant="primary" type="submit" className="w-100 py-2">
          Ingresar
        </Button>
      </Form>
      <div className="text-center mt-3">
        <span className="auth-switch-link" onClick={onSwitch}>¿No tienes una cuenta? Regístrate</span>
      </div>
    </div>
  );
};

// --- Sub-componente para el formulario de Registro ---
const RegisterForm = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== passwordConfirm) return setError('Las contraseñas no coinciden');
    try {
      await register(email, password, name, username);
      setSuccess('¡Registro exitoso! Por favor, inicia sesión.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="auth-title">Crear Cuenta</h2>
      <p className="auth-subtitle text-muted">Únete a nuestro equipo</p>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {success && <Alert variant="success" className="py-2">{success}</Alert>}
        <InputGroup className="mb-3">
            <InputGroup.Text><FaUser /></InputGroup.Text>
            <Form.Control type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Text><FaUserCircle /></InputGroup.Text>
            <Form.Control type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nombre de usuario" />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Text><FaEnvelope /></InputGroup.Text>
            <Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </InputGroup>
        <InputGroup className="mb-3">
            <InputGroup.Text><FaLock /></InputGroup.Text>
            <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
        </InputGroup>
        <InputGroup className="mb-4">
            <InputGroup.Text><FaLock /></InputGroup.Text>
            <Form.Control type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirmar Contraseña" />
        </InputGroup>
        <Button variant="primary" type="submit" className="w-100 py-2">
          Crear Cuenta
        </Button>
      </Form>
      <div className="text-center mt-3">
        <span className="auth-switch-link" onClick={onSwitch}>¿Ya tienes una cuenta? Inicia Sesión</span>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página de Autenticación ---
const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="auth-page-container">
      <Card className="auth-card">
        <Card.Body>
          <div className="auth-header text-center mb-4">
            <FaWarehouse size={40} className="text-primary" />
            <h1 className="mt-2">Inventory 360</h1>
          </div>
          {isLoginView 
            ? <LoginForm onSwitch={() => setIsLoginView(false)} /> 
            : <RegisterForm onSwitch={() => setIsLoginView(true)} />
          }
        </Card.Body>
      </Card>
    </div>
  );
};

export default AuthPage;
