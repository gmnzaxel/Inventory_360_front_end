import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { CONTROL_PREFIX } from '../config/api';
import { validateName, validatePhone, validateRequiredText } from '../utils/validation';

const emptyBranch = { name: '', address: '', phone: '' };

const BranchesPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [branches, setBranches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [branchForm, setBranchForm] = useState(emptyBranch);
  const [branchErrors, setBranchErrors] = useState({});
  const [branchToEdit, setBranchToEdit] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${CONTROL_PREFIX}/branches/`, { params: { page, page_size: pageSize } });
      const { items, count } = extractListAndCount(response.data);
      setBranches(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudieron cargar las sucursales.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openModal = (branch = null) => {
    setBranchToEdit(branch);
    setBranchForm(branch ? { name: branch.name || '', address: branch.address || '', phone: branch.phone || '' } : { ...emptyBranch });
    setBranchErrors({});
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setBranchToEdit(null);
    setBranchForm({ ...emptyBranch });
    setBranchErrors({});
    setModalError(null);
    setModalLoading(false);
  };


  const checkDuplicateName = (rawName) => {
    const candidate = (rawName || '').trim().toLowerCase();
    if (!candidate) return null;
    const duplicate = branches.some((branch) => (branch?.id ?? null) !== (branchToEdit?.id ?? null) && (branch?.name || '').trim().toLowerCase() === candidate);
    return duplicate ? `Ya existe '${rawName.trim()}' en esta empresa.` : null;
  };

  const handleNameBlur = () => {
    const duplicateMessage = checkDuplicateName(branchForm.name);
    setBranchErrors((prev) => ({ ...prev, name: duplicateMessage || prev?.name }));
  };
  const validateBranchForm = (form) => {
    const errors = {};
    const nameError = validateName(form.name, { label: 'Nombre de la sucursal', min: 3, max: 80 });
    if (nameError) {
      errors.name = nameError;
    } else {
      const duplicateMessage = checkDuplicateName(form.name);
      if (duplicateMessage) errors.name = duplicateMessage;
    }

    const addressError = validateRequiredText(form.address, { label: 'Dirección', min: 5, max: 200 });
    if (addressError) errors.address = addressError;

    const phoneError = validatePhone(form.phone, { label: 'Teléfono', digits: 10 });
    if (phoneError) errors.phone = phoneError;

    return errors;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBranchForm((prev) => ({ ...prev, [name]: value }));
    setBranchErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === 'name') {
      const duplicateMessage = checkDuplicateName(value);
      setBranchErrors((prev) => ({ ...prev, name: duplicateMessage || prev?.name }));
    }
  };

  const handleSubmitBranch = async (event) => {
    event.preventDefault();
    setModalError(null);

    const validationErrors = validateBranchForm(branchForm);
    setBranchErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setModalLoading(true);
    try {
      const payload = {
        name: branchForm.name.trim(),
        address: branchForm.address.trim(),
        phone: branchForm.phone.trim(),
      };
      if (branchToEdit) {
        await api.put(`${CONTROL_PREFIX}/branches/${branchToEdit.id}/`, payload);
      } else {
        await api.post(`${CONTROL_PREFIX}/branches/`, payload);
      }
      closeModal();
      fetchBranches();
    } catch (err) {
      setModalError(parseApiError(err, branchToEdit ? 'Error al actualizar la sucursal.' : 'Error al crear la sucursal.'));
      setModalLoading(false);
    }
  };

  const openDeleteConfirmation = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };

  const closeDeleteConfirmation = () => {
    setBranchToDelete(null);
    setShowDeleteModal(false);
    setDeleteLoading(false);
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`${CONTROL_PREFIX}/branches/${branchToDelete.id}/`);
      closeDeleteConfirmation();
      fetchBranches();
    } catch (err) {
      setDeleteLoading(false);
      setError(parseApiError(err, 'No se pudo eliminar la sucursal.'));
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Col className="text-center py-5"><Spinner animation="border" /></Col>;
    }
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
    if (branches.length === 0) {
      return <Col className="text-center py-5"><p>No hay sucursales para mostrar.</p></Col>;
    }

    return branches.map((branch, index) => (
      <Col key={branch.id} md={6} lg={4} className="mb-4 animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <Card className="h-100 shadow-sm">
          <Card.Body>
            <Card.Title className="fw-bold">{branch.name}</Card.Title>
            <Card.Text as="div" className="text-muted">
              <p className="mb-2 d-flex"><FaMapMarkerAlt className="me-2 mt-1 flex-shrink-0" />{branch.address}</p>
              <p className="mb-0 d-flex"><FaPhone className="me-2 mt-1 flex-shrink-0" />{branch.phone}</p>
            </Card.Text>
          </Card.Body>
          {isAdmin && (
            <Card.Footer className="bg-light d-flex justify-content-end gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => openModal(branch)}>
                <FaEdit className="me-1" /> Editar
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => openDeleteConfirmation(branch)}>
                <FaTrash className="me-1" /> Eliminar
              </Button>
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
            <h2 className="h4 mb-0">Gestión de Sucursales</h2>
          </Col>
          {isAdmin && (
            <Col xs="auto">
              <Button variant="primary" onClick={() => openModal()}>
                <FaPlus className="me-2" />Añadir Sucursal
              </Button>
            </Col>
          )}
        </Row>
        <Row>{renderContent()}</Row>
        <div className="d-flex justify-content-between align-items-center p-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Tamaño página:</span>
            <Form.Select
              size="sm"
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(parseInt(e.target.value, 10) || 10);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </Button>
            <span className="text-muted">Página {page} de {totalPages}</span>
            <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      </Container>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{branchToEdit ? 'Editar Sucursal' : 'Nueva Sucursal'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitBranch} noValidate>
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
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={branchForm.name}
                onChange={handleInputChange}
                onBlur={handleNameBlur}
                isInvalid={!!branchErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">{branchErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={branchForm.address}
                onChange={handleInputChange}
                isInvalid={!!branchErrors.address}
                required
              />
              <Form.Control.Feedback type="invalid">{branchErrors.address}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={branchForm.phone}
                onChange={handleInputChange}
                isInvalid={!!branchErrors.phone}
                required
              />
              <Form.Control.Feedback type="invalid">{branchErrors.phone}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={modalLoading}>
              {modalLoading ? <Spinner as="span" size="sm" /> : branchToEdit ? 'Guardar cambios' : 'Guardar sucursal'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={closeDeleteConfirmation} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de eliminar la sucursal <strong>{branchToDelete?.name}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteConfirmation}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner as="span" size="sm" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BranchesPage;
