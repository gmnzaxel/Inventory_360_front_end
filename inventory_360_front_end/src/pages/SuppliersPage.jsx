import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTruck, FaUserTie, FaPhone, FaEnvelope } from 'react-icons/fa';
import { CONTROL_PREFIX } from '../config/api';
import { validateName, validatePhone, validateEmail } from '../utils/validation';

const emptySupplier = { name: '', contact_person: '', phone: '', email: '' };

const SuppliersPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [suppliers, setSuppliers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(emptySupplier);
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${CONTROL_PREFIX}/suppliers/`, { params: { page, page_size: pageSize } });
      const { items, count } = extractListAndCount(response.data);
      setSuppliers(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudieron cargar los proveedores.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setCurrentSupplier(emptySupplier);
    setFormErrors({});
    setModalError(null);
  };

  const openCreateModal = () => {
    if (!isAdmin) return;
    setIsEditMode(false);
    setCurrentSupplier(emptySupplier);
    setFormErrors({});
    setModalError(null);
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    if (!isAdmin) return;
    setIsEditMode(true);
    setCurrentSupplier({
      id: supplier.id,
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
    });
    setFormErrors({});
    setModalError(null);
    setShowModal(true);
  };

  const validateSupplier = (supplier) => {
    const errors = {};
    const nameError = validateName(supplier.name, { label: 'Nombre del proveedor', min: 3, max: 80 });
    if (nameError) errors.name = nameError;

    if (supplier.contact_person) {
      const contactError = validateName(supplier.contact_person, { label: 'Persona de contacto', min: 2, max: 80 });
      if (contactError) errors.contact_person = contactError;
    }

    const phoneError = validatePhone(supplier.phone, { label: 'Telefono', digits: 10 });
    if (phoneError) errors.phone = phoneError;

    const emailError = validateEmail(supplier.email, { label: 'Email' });
    if (emailError) errors.email = emailError;

    return errors;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentSupplier((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setModalError(null);

    const sanitized = {
      ...currentSupplier,
      name: currentSupplier.name.trim(),
      contact_person: currentSupplier.contact_person?.trim() || '',
      phone: currentSupplier.phone.trim(),
      email: currentSupplier.email.trim(),
    };

    const validationErrors = validateSupplier(sanitized);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/suppliers/${sanitized.id}/`, sanitized);
      } else {
        await api.post(`${CONTROL_PREFIX}/suppliers/`, sanitized);
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (err) {
      const apiError = parseApiError(err, 'Error al guardar el proveedor. Revisa los campos.');
      setModalError(apiError);
      const details = apiError.details || {};
      if (Object.keys(details).length) {
        setFormErrors((prev) => ({ ...prev, ...details }));
      }
    }
  };

  const openDeleteModal = (supplier) => {
    if (!isAdmin) return;
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSupplierToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await api.delete(`${CONTROL_PREFIX}/suppliers/${supplierToDelete.id}/`);
      closeDeleteModal();
      fetchSuppliers();
    } catch (err) {
      setError(parseApiError(err, 'No se pudo eliminar el proveedor.'));
    }
  };

  const renderContent = () => {
    if (loading) return <Col className="text-center py-5"><Spinner animation="border" /></Col>;
    if (error) {
      const details = typeof error === 'string' ? { title: 'Error', message: error } : error;
      return (
        <Col>
          <Alert variant="danger">
            <div className="fw-semibold">{details.title || 'Error'}</div>
            <div>{details.message}</div>
            {details.requestId && (
              <div className="small text-muted">ID de seguimiento: {details.requestId}</div>
            )}
          </Alert>
        </Col>
      );
    }
    if (suppliers.length === 0) return <Col className="text-center py-5"><p>No hay proveedores para mostrar.</p></Col>;

    return suppliers.map((supplier, index) => (
      <Col key={supplier.id} md={6} lg={4} className="mb-4 animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <Card className="h-100 shadow-sm">
          <Card.Body>
            <Card.Title className="fw-bold d-flex align-items-center"><FaTruck className="me-2" />{supplier.name}</Card.Title>
            <Card.Text as="div" className="text-muted mt-3">
              <p className="mb-2 d-flex"><FaUserTie className="me-2 mt-1" />{supplier.contact_person || 'N/A'}</p>
              <p className="mb-2 d-flex"><FaPhone className="me-2 mt-1" />{supplier.phone || 'N/A'}</p>
              <p className="mb-0 d-flex"><FaEnvelope className="me-2 mt-1" />{supplier.email || 'N/A'}</p>
            </Card.Text>
          </Card.Body>
          {isAdmin && (
            <Card.Footer className="bg-light d-flex justify-content-end gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => openEditModal(supplier)}><FaEdit className="me-1" /> Editar</Button>
              <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(supplier)}><FaTrash className="me-1" /> Eliminar</Button>
            </Card.Footer>
          )}
        </Card>
      </Col>
    ));
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <Container fluid className="page-container">
        <Row className="align-items-center mb-4 animated-header">
          <Col>
            <h2 className="h4 mb-0">Gestión de Proveedores</h2>
          </Col>
          {isAdmin && (
            <Col xs="auto">
              <Button variant="primary" onClick={openCreateModal}><FaPlus className="me-2" />Añadir Proveedor</Button>
            </Col>
          )}
        </Row>
        <Card className="shadow-sm animated-card">
          <Card.Body className="p-3">
            <Row>
              <Col md={12} className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted">tamaño página:</span>
                  <Form.Select size="sm" style={{ width: 'auto' }} value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </Form.Select>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                  <span className="text-muted">Página {page} de {totalPages}</span>
                  <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
                </div>
              </Col>
            </Row>
            <Row>{renderContent()}</Row>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Editar proveedor' : 'Crear proveedor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && (
            <Alert variant="danger">
              <div className="fw-semibold">{modalError.title || 'Error'}</div>
              <div>{modalError.message}</div>
              {modalError.requestId && (
                <div className="small text-muted">ID de seguimiento: {modalError.requestId}</div>
              )}
            </Alert>
          )}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del proveedor</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentSupplier.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Persona de contacto</Form.Label>
              <Form.Control
                type="text"
                name="contact_person"
                value={currentSupplier.contact_person}
                onChange={handleInputChange}
                isInvalid={!!formErrors.contact_person}
              />
              <Form.Control.Feedback type="invalid">{formErrors.contact_person}</Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Telefono</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={currentSupplier.phone}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.phone}
                  required
                />
                <Form.Control.Feedback type="invalid">{formErrors.phone}</Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={currentSupplier.email}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              <Button variant="primary" type="submit">{isEditMode ? 'Guardar cambios' : 'Crear proveedor'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Estas seguro de que quieres eliminar a <strong>{supplierToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={!isAdmin}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuppliersPage;
