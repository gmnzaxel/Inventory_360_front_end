import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Nav, InputGroup } from 'react-bootstrap';
import { FaKey, FaSave, FaBuilding, FaPalette, FaBell, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { CONTROL_PREFIX } from '../config/api';
import { validateName, validatePhone, validateOptionalText, STRONG_PASSWORD_REGEX } from '../utils/validation';

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
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateName(formData.name, { label: 'Nombre de la empresa', min: 3, max: 100 });
    if (nameError) errors.name = nameError;

    const addressError = validateOptionalText(formData.address, { label: 'Dirección', min: 5, max: 200 });
    if (addressError) errors.address = addressError;

    const phoneError = validatePhone(formData.phone, { label: 'Teléfono', digits: 10, required: false });
    if (phoneError) errors.phone = phoneError;

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      await api.put(`${CONTROL_PREFIX}/businesses/${currentUser.business.id}/`, formData);
      setSuccess('Información de la empresa actualizada.');
    } catch (err) {
      setError(formatApiError(err, 'No se pudo actualizar la información.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaBuilding className="me-2" />Información de la Empresa
      </Card.Header>
      <Card.Body>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Empresa</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!formErrors.name}
              disabled={!isAdmin}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!formErrors.address}
              disabled={!isAdmin}
            />
            <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!formErrors.phone}
              disabled={!isAdmin}
            />
            <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
          </Form.Group>
          {isAdmin && (
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" size="sm" /> : (<><FaSave className="me-2" />Guardar Cambios</>)}
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
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
      setError('La nueva contraseña debe tener 8+ caracteres e incluir mayúsculas, minúsculas, números y un símbolo.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // Placeholder: integrar endpoint real cuando esté disponible
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess('Contraseña actualizada con éxito.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaKey className="me-2" />Cambiar Contraseña
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña Actual</Form.Label>
            <InputGroup>
              <Form.Control
                type={showCurrentPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowCurrentPwd((prev) => !prev)}
                aria-label={showCurrentPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showCurrentPwd ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nueva Contraseña</Form.Label>
            <InputGroup>
              <Form.Control
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowNewPwd((prev) => !prev)}
                aria-label={showNewPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showNewPwd ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirmar Nueva Contraseña</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirmPwd((prev) => !prev)}
                aria-label={showConfirmPwd ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
              >
                {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : (<><FaSave className="me-2" />Guardar Cambios</>)}
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
        <FaPalette className="me-2" />Apariencia
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
          Cambiá entre el tema claro y oscuro para toda la aplicación. Tu preferencia se guardará para futuras visitas.
        </p>
      </Card.Body>
    </Card>
  );
};

const NotificationsSettings = () => {
  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex align-items-center">
        <FaBell className="me-2" />Notificaciones por Email
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="d-flex align-items-center justify-content-between mb-3">
            <Form.Label className="mb-0">Alertas de stock bajo</Form.Label>
            <Form.Check type="switch" id="low-stock-switch" defaultChecked />
          </Form.Group>
          <p className="text-muted small mt-0">
            Recibí un correo cuando un producto alcance su nivel mínimo de stock.
          </p>
          <hr />
          <Form.Group className="d-flex align-items-center justify-content-between">
            <Form.Label className="mb-0">Resumen semanal de actividad</Form.Label>
            <Form.Check type="switch" id="weekly-summary-switch" />
          </Form.Group>
          <p className="text-muted small mt-2">
            Recibí un resumen con las ventas y movimientos importantes cada lunes.
          </p>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SettingsPage;
