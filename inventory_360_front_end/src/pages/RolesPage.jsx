import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import { FaSearch, FaSave, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { USER_PREFIX } from '../config/api';

const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const initialNewUser = {
  name: '',
  email: '',
  password: '',
  password2: '',
  role: 'user',
  can_purchase: false,
  can_sale: false,
  can_adjust: false,
  can_transfer: false,
};

const RolesPage = () => {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState(initialNewUser);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [showNewUserPassword2, setShowNewUserPassword2] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState('');

  const [pwdUser, setPwdUser] = useState(null);
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get(`${USER_PREFIX}/users/`);
      const data = resp.data;
      const list = Array.isArray(data) ? data : data?.results || [];
      const others = currentUser ? list.filter((u) => u.id !== currentUser.id) : list;
      setUsers(others);
      setError(null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError('Tu sesión ha expirado. Inicia sesión nuevamente.');
      else if (status === 403) setError('Necesitas permisos de administrador para ver y gestionar usuarios.');
      else setError(formatApiError(err, 'No se pudo cargar la lista de usuarios.'));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleVariant = (role) => (role === 'admin' ? 'danger' : 'secondary');

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handlePermissionToggle = (userId, field) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, [field]: !u[field] } : u)));
  };

  const handleSaveUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (user.role !== 'admin') {
      const adminCount = (currentUser?.role === 'admin' ? 1 : 0) + users.filter((u) => u.role === 'admin' && u.id !== userId).length;
      if (adminCount <= 0) {
        setToast({ show: true, variant: 'danger', message: 'No puedes quitar el último administrador.' });
        return;
      }
    }

    setSavingId(userId);
    try {
      const payload = {
        role: user.role,
        can_purchase: !!user.can_purchase,
        can_sale: !!user.can_sale,
        can_adjust: !!user.can_adjust,
        can_transfer: !!user.can_transfer,
      };
      await api.patch(`${USER_PREFIX}/users/${userId}/`, payload);
      setToast({ show: true, variant: 'success', message: 'Cambios guardados correctamente.' });
    } catch (err) {
      const message = formatApiError(err, 'No se pudo guardar los cambios del usuario.');
      setError(message);
      setToast({ show: true, variant: 'danger', message });
    } finally {
      setSavingId(null);
    }
  };

  const openPasswordModal = (user) => {
    setPwdUser(user);
    setPwd1('');
    setPwd2('');
    setShowPwd1(false);
    setShowPwd2(false);
    setModalError('');
  };

  const closePasswordModal = () => {
    setPwdUser(null);
    setPwd1('');
    setPwd2('');
    setShowPwd1(false);
    setShowPwd2(false);
    setModalError('');
  };

  const handleSetPassword = async () => {
    setModalError('');
    if (!STRONG_PASSWORD_REGEX.test(pwd1)) {
      setModalError('La contraseña debe tener 8+ caracteres e incluir mayúsculas, minúsculas, números y un símbolo.');
      return;
    }
    if (pwd1 !== pwd2) {
      setModalError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await api.post(`${USER_PREFIX}/users/${pwdUser.id}/set-password/`, { password: pwd1, password2: pwd2 });
      setToast({ show: true, variant: 'success', message: 'Contraseña actualizada.' });
      closePasswordModal();
    } catch (err) {
      setModalError(formatApiError(err, 'No se pudo actualizar la contraseña.'));
    }
  };

  const handleShowCreateModal = () => setShowCreateModal(true);

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewUser(initialNewUser);
    setShowNewUserPassword(false);
    setShowNewUserPassword2(false);
    setFormErrors({});
    setModalError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errors = {};
    const name = newUser.name.trim();
    const email = newUser.email.trim();
    const pwd = newUser.password || '';
    const pwd2 = newUser.password2 || '';

    if (!name) errors.name = 'El nombre es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'El email no tiene un formato válido.';
    if (!STRONG_PASSWORD_REGEX.test(pwd)) errors.password = 'La contraseña debe tener 8+ caracteres e incluir mayúsculas, minúsculas, números y un símbolo.';
    if (pwd !== pwd2) errors.password2 = 'Las contraseñas no coinciden.';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await api.post(`${USER_PREFIX}/users/`, newUser);
      setToast({ show: true, variant: 'success', message: 'Usuario creado correctamente.' });
      handleCloseCreateModal();
      fetchUsers();
    } catch (err) {
      const message = formatApiError(err, 'No se pudo crear el usuario. Revisa los datos ingresados.');
      setModalError(message);
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        ['name', 'email', 'password', 'password2'].forEach((field) => {
          if (data[field]) {
            const value = Array.isArray(data[field]) ? data[field].join(' ') : String(data[field]);
            fieldErrors[field] = value;
          }
        });
        if (Object.keys(fieldErrors).length) {
          setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(term));
  }, [searchTerm, users]);

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="5" className="text-center py-5"><Spinner /></td></tr>;
    if (error) return <tr><td colSpan="5"><Alert variant="danger" className="m-3">{error}</Alert></td></tr>;
    if (filteredUsers.length === 0) return <tr><td colSpan="5" className="text-center py-5">No se encontraron usuarios.</td></tr>;

    return filteredUsers.map((user, index) => (
      <tr key={user.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <td className="ps-3">
          <div className="fw-bold">{user.name}</div>
          <div className="text-muted small">{user.email}</div>
        </td>
        <td className="text-center align-middle">
          <Badge pill bg={getRoleVariant(user.role)}>{user.role}</Badge>
        </td>
        <td className="align-middle" style={{ minWidth: '200px' }}>
          <Form.Select size="sm" value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Form.Select>
        </td>
        <td className="align-middle" style={{ minWidth: '260px' }}>
          <div className="d-flex flex-wrap gap-2">
            <Form.Check type="switch" id={`sale-${user.id}`} label="Ventas" checked={!!user.can_sale} onChange={() => handlePermissionToggle(user.id, 'can_sale')} />
            <Form.Check type="switch" id={`purchase-${user.id}`} label="Compras" checked={!!user.can_purchase} onChange={() => handlePermissionToggle(user.id, 'can_purchase')} />
            <Form.Check type="switch" id={`transfer-${user.id}`} label="Transfer" checked={!!user.can_transfer} onChange={() => handlePermissionToggle(user.id, 'can_transfer')} />
            <Form.Check type="switch" id={`adjust-${user.id}`} label="Ajustes" checked={!!user.can_adjust} onChange={() => handlePermissionToggle(user.id, 'can_adjust')} />
          </div>
        </td>
        <td className="text-center align-middle">
          <Button
            variant="outline-success"
            size="sm"
            disabled={savingId === user.id}
            onClick={() => handleSaveUser(user.id)}
          >
            {savingId === user.id ? <Spinner as="span" size="sm" /> : (<><FaSave className="me-1" /> Guardar</>)}
          </Button>
          {user.role !== 'admin' && (
            <Button variant="outline-secondary" size="sm" className="ms-2" onClick={() => openPasswordModal(user)}>
              Cambiar contraseña
            </Button>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <>
      <Container fluid className="page-container">
        <Row className="align-items-center mb-4 animated-header">
          <Col>
            <h2 className="h4 mb-0">Gestión de Roles y Empleados</h2>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={handleShowCreateModal}>
              <FaPlus className="me-2" /> Añadir Empleado
            </Button>
          </Col>
        </Row>
        <Card className="shadow-sm animated-card">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 ps-3">Empleado</th>
                  <th className="text-center">Rol Actual</th>
                  <th>Cambiar Rol</th>
                  <th>Permisos</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton><Modal.Title>Añadir Nuevo Empleado</Modal.Title></Modal.Header>
        <Form noValidate onSubmit={handleCreateUser}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                isInvalid={!!formErrors.email}
                required
              />
              <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewUserPassword ? 'text' : 'password'}
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.password}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewUserPassword((prev) => !prev)}
                  aria-label={showNewUserPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showNewUserPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewUserPassword2 ? 'text' : 'password'}
                  name="password2"
                  value={newUser.password2}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.password2}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewUserPassword2((prev) => !prev)}
                  aria-label={showNewUserPassword2 ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                >
                  {showNewUserPassword2 ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              {formErrors.password2 && <div className="invalid-feedback d-block">{formErrors.password2}</div>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="role" value={newUser.role} onChange={handleInputChange}>
                <option value="user">Empleado</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
            <hr />
            <Form.Label className="fw-bold">Permisos de Operaciones</Form.Label>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_sale" label="Puede realizar Ventas" checked={newUser.can_sale} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_purchase" label="Puede realizar Compras" checked={newUser.can_purchase} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_transfer" label="Puede realizar Transferencias" checked={newUser.can_transfer} onChange={handleInputChange} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" name="can_adjust" label="Puede realizar Ajustes de Stock" checked={newUser.can_adjust} onChange={handleInputChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCreateModal}>Cancelar</Button>
            <Button variant="primary" type="submit">Crear Usuario</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={!!pwdUser} onHide={closePasswordModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nueva contraseña</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPwd1 ? 'text' : 'password'}
                value={pwd1}
                onChange={(e) => setPwd1(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPwd1((prev) => !prev)}
                aria-label={showPwd1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd1 ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirmar contraseña</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPwd2 ? 'text' : 'password'}
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPwd2((prev) => !prev)}
                aria-label={showPwd2 ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
              >
                {showPwd2 ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePasswordModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSetPassword}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg={toast.variant} onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={2500} autohide>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default RolesPage;
