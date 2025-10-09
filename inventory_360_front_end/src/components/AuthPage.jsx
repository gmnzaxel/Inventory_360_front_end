import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Row, Col, Form, Button, Alert, Spinner, Toast, ToastContainer, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthPage.css';

const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, registerAdmin } = useAuth();
  const isLoginPage = location.pathname === '/login';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    password2: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPassword2, setShowRegisterPassword2] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (isLoginPage) {
      try {
        await login(formData.email, formData.password);
        navigate('/');
      } catch (err) {
        const message = (err?.message || '').trim();
        setError(message || 'El correo electrónico o la contraseña son incorrectos.');
      } finally {
        setLoading(false);
      }
      return;
    }

    const errs = {};
    const name = (formData.name || '').trim();
    const email = (formData.email || '').trim();
    const pwd = formData.password || '';
    const pwd2 = formData.password2 || '';
    const businessName = (formData.businessName || '').trim();
    const businessAddress = (formData.businessAddress || '').trim();
    const businessPhone = (formData.businessPhone || '').trim();

    if (!name) errs.name = 'El nombre es requerido.';
    else if (name.length > 60) errs.name = 'El nombre no puede exceder 60 caracteres.';

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) errs.email = 'El email no tiene un formato válido.';

    if (!STRONG_PASSWORD_REGEX.test(pwd)) errs.password = 'La contraseña debe tener 8+ caracteres e incluir mayúsculas, minúsculas, números y un símbolo.';
    if (pwd !== pwd2) errs.password2 = 'Las contraseñas no coinciden.';

    if (!businessName) errs.businessName = 'El nombre de la empresa es requerido.';
    if (businessName.length > 100) errs.businessName = 'El nombre de la empresa no puede exceder 100 caracteres.';
    if (businessAddress.length > 200) errs.businessAddress = 'La dirección no puede exceder 200 caracteres.';
    const phoneRe = /^[+()\d\s-]{3,30}$/;
    if (businessPhone && !phoneRe.test(businessPhone)) errs.businessPhone = 'El teléfono solo puede contener dígitos, espacios, +, -, ().';
    if (businessPhone.length > 30) errs.businessPhone = 'El teléfono no puede exceder 30 caracteres.';

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      setLoading(false);
      return;
    }

    const businessData = { name: businessName, address: businessAddress, phone: businessPhone };
    try {
      await registerAdmin(name, email, formData.username, pwd, pwd2, businessData);
      setSuccessMessage('Cuenta creada con éxito. Serás redirigido para iniciar sesión.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const message = (err?.message || '').trim();
      setError(message || 'Ocurrió un error al registrar la cuenta. Intentalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual-panel">
        <video
          className="auth-background-video"
          src="/videos/warehouse-video.mp4"
          poster="/videos/video-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="video-overlay"></div>
        <div className="visual-content">
          <h1 className="visual-logo">Inventory360</h1>
          <p className="visual-tagline">Control total. Visibilidad completa.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2 className="auth-title">{isLoginPage ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}</h2>
          <p className="auth-subtitle">
            {isLoginPage ? 'Ingresa tus credenciales para continuar.' : 'Completa los datos para configurar tu sistema.'}
          </p>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          {successMessage && <Alert variant="success" className="mb-3">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit} noValidate>
            {isLoginPage ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </>
            ) : (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} isInvalid={!!formErrors.name} required />
                      <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Usuario</Form.Label>
                      <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!formErrors.email} required />
                  <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showRegisterPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          isInvalid={!!formErrors.password}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          aria-label={showRegisterPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                      {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>Confirmar</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showRegisterPassword2 ? 'text' : 'password'}
                          name="password2"
                          value={formData.password2}
                          onChange={handleChange}
                          isInvalid={!!formErrors.password2}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowRegisterPassword2((prev) => !prev)}
                          aria-label={showRegisterPassword2 ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                        >
                          {showRegisterPassword2 ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                      {formErrors.password2 && <div className="invalid-feedback d-block">{formErrors.password2}</div>}
                    </Form.Group>
                  </Col>
                </Row>
                <hr />
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Empresa</Form.Label>
                  <Form.Control type="text" name="businessName" value={formData.businessName} onChange={handleChange} isInvalid={!!formErrors.businessName} required />
                  <Form.Control.Feedback type="invalid">{formErrors.businessName}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control type="text" name="businessAddress" value={formData.businessAddress} onChange={handleChange} isInvalid={!!formErrors.businessAddress} />
                  <Form.Control.Feedback type="invalid">{formErrors.businessAddress}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control type="text" name="businessPhone" value={formData.businessPhone} onChange={handleChange} isInvalid={!!formErrors.businessPhone} />
                  <Form.Control.Feedback type="invalid">{formErrors.businessPhone}</Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : (isLoginPage ? 'Ingresar' : 'Crear cuenta y configurar')}
              </Button>
            </div>

            <div className="auth-footer">
              {isLoginPage ? (
                <span>¿No tenés una cuenta? <Link to="/register">Registrate</Link></span>
              ) : (
                <span>¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link></span>
              )}
            </div>
          </Form>
        </div>
      </div>

      <ToastContainer position="bottom-end" className="p-3">
        {successMessage && (
          <Toast bg="success" show delay={2500} autohide>
            <Toast.Body className="text-white">{successMessage}</Toast.Body>
          </Toast>
        )}
        {error && (
          <Toast bg="danger" show delay={2500} autohide>
            <Toast.Body className="text-white">{error}</Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </div>
  );
};

export default AuthPage;
