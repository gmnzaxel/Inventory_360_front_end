import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
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
import { FaSearch, FaPlus, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { USER_PREFIX, CONTROL_PREFIX } from '../config/api';

const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const initialNewUser = {
  name: '',
  email: '',
  password: '',
  password2: '',
  role: 'user',
  branch_id: '',
  can_view_products: true,
  can_purchase: false,
  can_sale: false,
  can_adjust: false,
  can_transfer: false,
};

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.results) return payload.results;
  if (payload?.data) return payload.data;
  return [];
};

const cloneUser = (user) => JSON.parse(JSON.stringify(user));

const RolesPage = () => {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, variant: 'success', message: '' });

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState({});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState(initialNewUser);
  const [createErrors, setCreateErrors] = useState({});
  const [createError, setCreateError] = useState(null);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [showNewUserPassword2, setShowNewUserPassword2] = useState(false);

  const [pwdUser, setPwdUser] = useState(null);
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const statusTimersRef = useRef(new Map());
  const originalSnapshotsRef = useRef(new Map());
  const usersRef = useRef([]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => () => {
    statusTimersRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    statusTimersRef.current.clear();
    originalSnapshotsRef.current.clear();
  }, []);

  const clearStatusLater = useCallback((userId, delay = 2000) => {
    const existing = statusTimersRef.current.get(userId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      setSaveStatus((prev) => {
        if (!prev[userId]) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      statusTimersRef.current.delete(userId);
    }, delay);
    statusTimersRef.current.set(userId, timer);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get(`${USER_PREFIX}/users/`);
      const list = asList(resp.data);
      const others = currentUser ? list.filter((u) => u.id !== currentUser.id) : list;
      const normalized = others.map((u) => ({
        ...u,
        branch_id: u.branch?.id ?? null,
        can_view_products: true,
        can_purchase: !!u.can_purchase,
        can_sale: !!u.can_sale,
        can_adjust: !!u.can_adjust,
        can_transfer: !!u.can_transfer,
      }));
      setUsers(normalized);
      usersRef.current = normalized;
      setSaveStatus({});
      originalSnapshotsRef.current.clear();
      statusTimersRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      statusTimersRef.current.clear();
      setError(null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setError({ title: 'Sesion expirada', message: 'Tu sesion ha expirado. Inicia sesion nuevamente.' });
      } else if (status === 403) {
        setError({ title: 'Acceso denegado', message: 'Necesitas permisos de administrador para gestionar usuarios.' });
      } else {
        setError(parseApiError(err, 'No se pudo cargar la lista de usuarios.'));
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const resp = await api.get(`${CONTROL_PREFIX}/branches/`, { params: { page_size: 200 } });
      setBranches(asList(resp.data));
    } catch (err) {
      console.error('No se pudieron cargar las sucursales', err);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const markUserDirty = useCallback((userId, snapshot) => {
    if (snapshot && !originalSnapshotsRef.current.has(userId)) {
      originalSnapshotsRef.current.set(userId, snapshot);
    }

    const existingTimer = statusTimersRef.current.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      statusTimersRef.current.delete(userId);
    }

    setSaveStatus((prev) => ({ ...prev, [userId]: 'dirty' }));
  }, []);

  const persistUser = useCallback(async (userId) => {
    const userList = usersRef.current;
    const user = userList.find((u) => u.id === userId);
    if (!user) return;

    const originalSnapshot = originalSnapshotsRef.current.get(userId);

    if (user.role !== 'admin') {
      const adminCount = (currentUser?.role === 'admin' ? 1 : 0) + userList.filter((u) => u.role === 'admin' && u.id !== userId).length;
      if (adminCount <= 0) {
        if (originalSnapshot) {
          setUsers((prev) => {
            const next = prev.map((u) => (u.id === userId ? originalSnapshot : u));
            usersRef.current = next;
            return next;
          });
        }
        originalSnapshotsRef.current.delete(userId);
        setSaveStatus((prev) => ({ ...prev, [userId]: 'error' }));
        setToast({ show: true, variant: 'danger', message: 'No puedes quitar el ultimo administrador.' });
        clearStatusLater(userId, 4000);
        return;
      }
    }

    setSaveStatus((prev) => ({ ...prev, [userId]: 'saving' }));

    const payload = {
      role: user.role,
      can_view_products: true,
      can_purchase: !!user.can_purchase,
      can_sale: !!user.can_sale,
      can_adjust: !!user.can_adjust,
      can_transfer: !!user.can_transfer,
      branch_id: user.role === 'admin' ? null : (user.branch?.id ?? user.branch_id ?? null),
    };

    try {
      await api.patch(`${USER_PREFIX}/users/${userId}/`, payload);
      originalSnapshotsRef.current.delete(userId);
      setSaveStatus((prev) => ({ ...prev, [userId]: 'saved' }));
      setToast({ show: true, variant: 'success', message: 'Cambios guardados.' });
      clearStatusLater(userId);
    } catch (err) {
      const apiError = parseApiError(err, 'No se pudo guardar los cambios del usuario.');
      setToast({ show: true, variant: 'danger', message: apiError.message });
      if (originalSnapshot) {
        setUsers((prev) => {
          const next = prev.map((u) => (u.id === userId ? originalSnapshot : u));
          usersRef.current = next;
          return next;
        });
      }
      originalSnapshotsRef.current.delete(userId);
      setSaveStatus((prev) => ({ ...prev, [userId]: 'error' }));
      clearStatusLater(userId, 4000);
    }
  }, [clearStatusLater, currentUser]);

  const handleRoleChange = (userId, newRole) => {
    if (saveStatus[userId] === 'saving') return;
    if (newRole !== 'admin' && branches.length === 0) {
      setToast({ show: true, variant: 'danger', message: 'No hay sucursales disponibles para asignar.' });
      return;
    }
    let snapshot = null;
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.role === newRole) return u;
        snapshot = cloneUser(u);
        const updated = { ...u, role: newRole };
        if (newRole === 'admin') {
          updated.can_view_products = true;
          updated.branch_id = null;
          updated.branch = null;
        } else if (!updated.branch_id && branches.length > 0) {
          const defaultBranch = branches[0];
          updated.branch_id = defaultBranch.id;
          updated.branch = defaultBranch;
        }
        return updated;
      });
      if (!snapshot) return prev;
      usersRef.current = next;
      return next;
    });
    if (snapshot) markUserDirty(userId, snapshot);
  };

  const handlePermissionToggle = (userId, field) => {
    if (saveStatus[userId] === 'saving') return;
    let snapshot = null;
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id !== userId) return u;
        snapshot = cloneUser(u);
        return { ...u, [field]: !u[field] };
      });
      if (!snapshot) return prev;
      usersRef.current = next;
      return next;
    });
    if (snapshot) markUserDirty(userId, snapshot);
  };

  const handleBranchChange = (userId, branchId) => {
    if (saveStatus[userId] === 'saving') return;
    let snapshot = null;
    let blocked = false;
    const sanitized = branchId === '' ? null : Number(branchId);
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.branch_id === sanitized) return u;
        if (u.role !== 'admin' && sanitized == null) {
          blocked = true;
          return u;
        }
        snapshot = cloneUser(u);
        const branchObj = sanitized == null ? null : branches.find((b) => Number(b.id) === sanitized) || null;
        return {
          ...u,
          branch: branchObj,
          branch_id: sanitized,
        };
      });
      if (!snapshot) return prev;
      usersRef.current = next;
      return next;
    });
    if (snapshot) markUserDirty(userId, snapshot);
    if (blocked) {
      setToast({ show: true, variant: 'danger', message: 'El empleado debe tener una sucursal asignada.' });
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.branch?.name || ''}`.toLowerCase().includes(term));
  }, [searchTerm, users]);

  const renderSaveStatus = (userId) => {
    const status = saveStatus[userId];
    const isSaving = status === 'saving';
    const canSave = status === 'dirty' || status === 'error';

    let statusContent = <span className="text-muted small">Sin cambios</span>;
    if (status === 'dirty') {
      statusContent = <span className="text-warning small">Cambios sin guardar</span>;
    } else if (isSaving) {
      statusContent = (
        <span className="text-info small d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" role="status" />
          Guardando...
        </span>
      );
    } else if (status === 'saved') {
      statusContent = (
        <span className="text-success small d-flex align-items-center gap-2">
          <FaCheck />
          Guardado
        </span>
      );
    } else if (status === 'error') {
      statusContent = (
        <span className="text-danger small d-flex align-items-center gap-2">
          <FaExclamationTriangle />
          Error al guardar
        </span>
      );
    }

    const handleClick = () => {
      if (!canSave || isSaving) return;
      persistUser(userId);
    };

    const buttonVariant = (() => {
      if (isSaving) return 'secondary';
      if (canSave) return 'primary';
      return 'outline-secondary';
    })();

    return (
      <div className="d-flex align-items-center gap-2">
        <Button
          variant={buttonVariant}
          size="sm"
          disabled={isSaving}
          onClick={handleClick}
        >
          Guardar
        </Button>
        {statusContent}
      </div>
    );
  };

  const handleShowCreateModal = () => {
    setNewUser({
      ...initialNewUser,
      branch_id: branches.length === 1 ? String(branches[0].id) : '',
    });
    setCreateErrors({});
    setCreateError(null);
    setShowNewUserPassword(false);
    setShowNewUserPassword2(false);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewUser(initialNewUser);
    setCreateErrors({});
    setCreateError(null);
    setShowNewUserPassword(false);
    setShowNewUserPassword2(false);
  };

  const handleCreateInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewUser((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (createErrors[name]) setCreateErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateError(null);

    const errors = {};
    const name = newUser.name.trim();
    const email = newUser.email.trim();
    const pwd = newUser.password || '';
    const pwd2 = newUser.password2 || '';

    if (!name) errors.name = 'El nombre es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'El email no tiene un formato valido.';
    if (!STRONG_PASSWORD_REGEX.test(pwd)) errors.password = 'La contraseña debe tener 8+ caracteres e incluir mayusculas, minusculas, numeros y un simbolo.';
    if (pwd !== pwd2) errors.password2 = 'Las contraseñas no coinciden.';
    if (newUser.role !== 'admin' && !newUser.branch_id) errors.branch_id = 'Selecciona una sucursal.';

    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name,
        email,
        password: pwd,
        password2: pwd2,
        role: newUser.role,
        branch_id: newUser.role === 'admin' ? null : Number(newUser.branch_id),
        can_view_products: true,
        can_purchase: !!newUser.can_purchase,
        can_sale: !!newUser.can_sale,
        can_adjust: !!newUser.can_adjust,
        can_transfer: !!newUser.can_transfer,
      };

      await api.post(`${USER_PREFIX}/users/`, payload);
      setToast({ show: true, variant: 'success', message: 'Usuario creado correctamente.' });
      handleCloseCreateModal();
      fetchUsers();
    } catch (err) {
      const apiError = parseApiError(err, 'No se pudo crear el usuario. Revisa los datos ingresados.');
      setCreateError(apiError);
      const details = apiError.details || {};
      if (Object.keys(details).length) {
        setCreateErrors((prev) => ({ ...prev, ...details }));
      }
    }
  };

  const openPasswordModal = (user) => {
    setPwdUser(user);
    setPwd1('');
    setPwd2('');
    setShowPwd1(false);
    setShowPwd2(false);
    setPasswordError(null);
  };

  const closePasswordModal = () => {
    setPwdUser(null);
    setPwd1('');
    setPwd2('');
    setShowPwd1(false);
    setShowPwd2(false);
    setPasswordError(null);
  };

  const handleSetPassword = async () => {
    setPasswordError(null);
    if (!STRONG_PASSWORD_REGEX.test(pwd1)) {
      setPasswordError('La contraseña debe tener 8+ caracteres e incluir mayusculas, minusculas, numeros y un simbolo.');
      return;
    }
    if (pwd1 !== pwd2) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await api.post(`${USER_PREFIX}/users/${pwdUser.id}/set-password/`, { password: pwd1, password2: pwd2 });
      setToast({ show: true, variant: 'success', message: 'Contraseña actualizada.' });
      closePasswordModal();
    } catch (err) {
      const apiError = parseApiError(err, 'No se pudo actualizar la contraseña.');
      setPasswordError(apiError.message);
    }
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" /></td></tr>;
    if (error) {
      const details = typeof error === 'string' ? { title: 'Error', message: error } : error;
      return (
        <tr>
          <td colSpan="6">
            <Alert variant="danger" className="m-3">
              <div className="fw-semibold">{details.title || 'Error'}</div>
              <div>{details.message}</div>
              {details.requestId && (
                <div className="small text-muted">ID de seguimiento: {details.requestId}</div>
              )}
            </Alert>
          </td>
        </tr>
      );
    }
    if (filteredUsers.length === 0) return <tr><td colSpan="6" className="text-center py-5">No se encontraron usuarios.</td></tr>;

    return filteredUsers.map((user, index) => (
      <tr key={user.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <td className="ps-3">
          <div className="fw-bold">{user.name}</div>
          <div className="text-muted small">{user.email}</div>
        </td>
        <td className="align-middle" style={{ minWidth: '200px' }}>
          <Form.Select
            size="sm"
            value={user.branch_id != null ? String(user.branch_id) : ''}
            onChange={(e) => handleBranchChange(user.id, e.target.value)}
            disabled={branches.length === 0}
          >
            <option value="" disabled={user.role !== 'admin'}>
              {user.role === 'admin' ? 'Sin sucursal' : 'Selecciona una sucursal'}
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </Form.Select>
          {branches.length === 0 && (
            <div className="text-muted small mt-1">No hay sucursales disponibles.</div>
          )}
        </td>
        <td className="text-center align-middle">
          <Badge pill bg={user.role === 'admin' ? 'danger' : 'secondary'}>{user.role}</Badge>
        </td>
        <td className="align-middle" style={{ minWidth: '200px' }}>
          <Form.Select size="sm" value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Form.Select>
        </td>
        <td className="align-middle" style={{ minWidth: '280px' }}>
          <div className="d-flex flex-wrap gap-2">
            <Form.Check type="switch" id={`sale-${user.id}`} label="Ventas" checked={!!user.can_sale} onChange={() => handlePermissionToggle(user.id, 'can_sale')} />
            <Form.Check type="switch" id={`purchase-${user.id}`} label="Compras" checked={!!user.can_purchase} onChange={() => handlePermissionToggle(user.id, 'can_purchase')} />
            <Form.Check type="switch" id={`transfer-${user.id}`} label="Transfer" checked={!!user.can_transfer} onChange={() => handlePermissionToggle(user.id, 'can_transfer')} />
            <Form.Check type="switch" id={`adjust-${user.id}`} label="Ajustes" checked={!!user.can_adjust} onChange={() => handlePermissionToggle(user.id, 'can_adjust')} />
          </div>
        </td>
        <td className="align-middle" style={{ minWidth: '190px' }}>
          <div className="d-flex flex-column align-items-center gap-2">
            {renderSaveStatus(user.id)}
            {user.role !== 'admin' && (
              <Button variant="outline-secondary" size="sm" onClick={() => openPasswordModal(user)}>
                Cambiar contraseña
              </Button>
            )}
          </div>
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
                placeholder="Buscar por nombre, email o sucursal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={handleShowCreateModal} disabled={branchesLoading && branches.length === 0}>
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
                  <th>Sucursal</th>
                  <th className="text-center">Rol actual</th>
                  <th>Cambiar rol</th>
                  <th>Permisos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createError && (
            <Alert variant="danger">
              <div className="fw-semibold">{createError.title || 'Error'}</div>
              <div>{createError.message}</div>
              {createError.requestId && (
                <div className="small text-muted">ID de seguimiento: {createError.requestId}</div>
              )}
            </Alert>
          )}
          <Form onSubmit={handleCreateUser} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleCreateInputChange}
                isInvalid={!!createErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">{createErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electronico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleCreateInputChange}
                isInvalid={!!createErrors.email}
                required
              />
              <Form.Control.Feedback type="invalid">{createErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="role" value={newUser.role} onChange={handleCreateInputChange}>
                <option value="user">Empleado</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                name="branch_id"
                value={newUser.branch_id}
                onChange={handleCreateInputChange}
                isInvalid={!!createErrors.branch_id}
                disabled={branches.length === 0 && newUser.role !== 'admin'}
              >
                <option value="">{newUser.role === 'admin' ? 'Sin sucursal' : 'Selecciona una sucursal'}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{createErrors.branch_id}</Form.Control.Feedback>
              {branches.length === 0 && !branchesLoading && (
                <Form.Text className="text-muted">
                  No hay sucursales disponibles. Crea una antes de asignar empleados.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewUserPassword ? 'text' : 'password'}
                  name="password"
                  value={newUser.password}
                  onChange={handleCreateInputChange}
                  isInvalid={!!createErrors.password}
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
              <Form.Control.Feedback type="invalid" className="d-block">{createErrors.password}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar contraseña</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewUserPassword2 ? 'text' : 'password'}
                  name="password2"
                  value={newUser.password2}
                  onChange={handleCreateInputChange}
                  isInvalid={!!createErrors.password2}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewUserPassword2((prev) => !prev)}
                  aria-label={showNewUserPassword2 ? 'Ocultar confirmacion de contraseña' : 'Mostrar confirmacion de contraseña'}
                >
                  {showNewUserPassword2 ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Control.Feedback type="invalid" className="d-block">{createErrors.password2}</Form.Control.Feedback>
            </Form.Group>
            <hr />
            <Form.Label className="fw-bold">Permisos de operaciones</Form.Label>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_sale" label="Puede realizar ventas" checked={newUser.can_sale} onChange={handleCreateInputChange} /></Form.Group>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_purchase" label="Puede realizar compras" checked={newUser.can_purchase} onChange={handleCreateInputChange} /></Form.Group>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_transfer" label="Puede realizar transferencias" checked={newUser.can_transfer} onChange={handleCreateInputChange} /></Form.Group>
            <Form.Group className="mb-2"><Form.Check type="checkbox" name="can_adjust" label="Puede realizar ajustes de stock" checked={newUser.can_adjust} onChange={handleCreateInputChange} /></Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={handleCloseCreateModal}>Cancelar</Button>
              <Button
                variant="primary"
                type="submit"
                disabled={newUser.role !== 'admin' && (!newUser.branch_id || branches.length === 0)}
              >
                Crear usuario
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={!!pwdUser} onHide={closePasswordModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
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
                aria-label={showPwd2 ? 'Ocultar confirmacion de contraseña' : 'Mostrar confirmacion de contraseña'}
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
        <Toast bg={toast.variant} onClose={() => setToast((prev) => ({ ...prev, show: false }))} show={toast.show} delay={2500} autohide>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default RolesPage;
