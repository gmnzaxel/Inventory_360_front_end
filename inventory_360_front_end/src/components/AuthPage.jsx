import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Cambiamos el nombre de la función para que sea más claro
  const { login, registerAdmin } = useAuth(); 

  const isLoginPage = location.pathname === '/login';

  // Estados para el usuario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // Estado anidado para los datos de la empresa
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    address: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Manejador para los campos de la empresa
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (isLoginPage) {
      try {
        await login(email, password);
        navigate('/');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Lógica para registrar al Admin y la Empresa
      if (password !== password2) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      try {
        await registerAdmin(name, email, username, password, password2, businessInfo);
        setSuccessMessage('¡Sistema configurado con éxito! Serás redirigido al login.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container fluid className="py-5 d-flex align-items-center justify-content-center bg-light">
      <Row>
        <Col>
          <Card style={{ width: '28rem' }} className="shadow-lg">
            <Card.Body className="p-5">
              <h3 className="text-center mb-4">{isLoginPage ? 'Iniciar Sesión' : 'Configurar Sistema'}</h3>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* --- CAMPOS DE REGISTRO --- */}
                {!isLoginPage && (
                  <>
                    <h5 className="text-muted mb-3 mt-4 fs-6">Datos del Administrador</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario</Form.Label>
                      <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </Form.Group>
                  </>
                )}

                {/* --- CAMPOS COMUNES --- */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>

                {/* --- CAMPOS DE REGISTRO (Continuación) --- */}
                {!isLoginPage && (
                  <>
                    <Form.Group className="mb-4">
                      <Form.Label>Confirmar Contraseña</Form.Label>
                      <Form.Control type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
                    </Form.Group>

                    <h5 className="text-muted mb-3 mt-4 fs-6">Datos de la Empresa</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre de la Empresa</Form.Label>
                      <Form.Control type="text" name="name" value={businessInfo.name} onChange={handleBusinessChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control as="textarea" rows={2} name="address" value={businessInfo.address} onChange={handleBusinessChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control type="text" name="phone" value={businessInfo.phone} onChange={handleBusinessChange} required />
                    </Form.Group>
                  </>
                )}

                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : (isLoginPage ? 'Ingresar' : 'Crear y Configurar')}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                {isLoginPage ? "Para configurar el sistema, " : "¿Ya tienes una cuenta? "}
                <Link to={isLoginPage ? "/register" : "/login"}>
                  {isLoginPage ? "regístrate aquí." : "Inicia Sesión"}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthPage;