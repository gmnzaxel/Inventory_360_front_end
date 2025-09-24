import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import { FaKey, FaSave, FaBuilding, FaPalette, FaBell } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { CONTROL_PREFIX } from '../config/api';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('empresa');

  const renderSection = () => {
    switch (activeSection) {
      case 'seguridad':
        return <PasswordSettings />;
      case 'apariencia':
        return <AppearanceSettings />;
      case 'notificaciones':
        return <NotificationsSettings />;
      case 'empresa':
      default:
        return <BusinessSettings />;
    }
  };

  return (
    <Container fluid className="page-container">
      <h2 className="h4 mb-4 animated-header">Configuraciones</h2>
      <Row>
        <Col md={4} lg={3} xl={2} className="animated-card">
          <Card className="shadow-sm">
            <Card.Body className="p-2">
              <Nav variant="pills" className="flex-column" activeKey={activeSection} onSelect={(k) => setActiveSection(k)}>
                <Nav.Link eventKey="empresa"><FaBuilding className="me-2" />Empresa</Nav.Link>
                <Nav.Link eventKey="seguridad"><FaKey className="me-2" />Seguridad</Nav.Link>
                <Nav.Link eventKey="apariencia"><FaPalette className="me-2" />Apariencia</Nav.Link>
                <Nav.Link eventKey="notificaciones"><FaBell className="me-2" />Notificaciones</Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8} lg={9} xl={7} className="animated-card" style={{ animationDelay: '0.1s' }}>
          {renderSection()}
        </Col>
      </Row>
    </Container>
  );
};

const BusinessSettings = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  
  const [formData, setFormData] = useState({
    name: currentUser?.business?.name || '',
    address: currentUser?.business?.address || '',
    phone: currentUser?.business?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`${CONTROL_PREFIX}/businesses/${currentUser.business.id}/`, formData);
      setSuccess('Informacion de la empresa actualizada!');
    } catch (err) {
      setError('No se pudo actualizar la informacion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaBuilding className="me-2"/>Informacion de la Empresa
      </Card.Header>
      <Card.Body>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Empresa</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isAdmin} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Direccion</Form.Label>
            <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isAdmin} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Telefono</Form.Label>
            <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isAdmin} />
          </Form.Group>
          {isAdmin && (
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" size="sm" /> : <><FaSave className="me-2"/>Guardar Cambios</>}
            </Button>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

const PasswordSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contrasenas no coinciden.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSuccess('Contrasena actualizada con exito!');
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaKey className="me-2"/>Cambiar Contrasena
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Contrasena Actual</Form.Label>
            <Form.Control type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nueva Contrasena</Form.Label>
            <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirmar Nueva Contrasena</Form.Label>
            <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : <><FaSave className="me-2"/>Guardar Cambios</>}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

const AppearanceSettings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaPalette className="me-2"/>Apariencia
      </Card.Header>
      <Card.Body>
        <Form.Group className="d-flex align-items-center justify-content-between p-2 rounded" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border-color)' }}>
          <Form.Label className="mb-0">Tema Oscuro</Form.Label>
          <Form.Check 
            type="switch"
            id="theme-switch"
            checked={theme === 'dark'}
            onChange={toggleTheme}
            label={theme === 'dark' ? 'Activado' : 'Desactivado'}
          />
        </Form.Group>
        <p className="text-muted small mt-2">
          Cambia entre el tema claro y oscuro para toda la aplicacion. Tu preferencia se guardara para futuras visitas.
        </p>
      </Card.Body>
    </Card>
  );
};

const NotificationsSettings = () => {
  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaBell className="me-2"/>Notificaciones por Email
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="d-flex align-items-center justify-content-between mb-3">
            <Form.Label className="mb-0">Alertas de stock bajo</Form.Label>
            <Form.Check type="switch" id="low-stock-switch" defaultChecked/>
          </Form.Group>
          <p className="text-muted small mt-0">
            Recibir un correo cuando un producto alcance su nivel minimo de stock.
          </p>
          <hr/>
          <Form.Group className="d-flex align-items-center justify-content-between">
            <Form.Label className="mb-0">Resumen semanal de actividad</Form.Label>
            <Form.Check type="switch" id="weekly-summary-switch" />
          </Form.Group>
           <p className="text-muted small mt-2">
            Recibir un resumen con las ventas y movimientos importantes cada lunes.
          </p>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SettingsPage;

