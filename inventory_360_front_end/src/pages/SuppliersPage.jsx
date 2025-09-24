import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTruck, FaUserTie, FaPhone, FaEnvelope } from 'react-icons/fa';
import { CONTROL_PREFIX } from '../config/api';

const SuppliersPage = () => {
  const { currentUser } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({ name: '', contact_person: '', phone: '', email: '' });
  const [modalError, setModalError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${CONTROL_PREFIX}/suppliers/`, { params: { page, page_size: pageSize } });
      const { items, count } = extractListAndCount(response.data);
      setSuppliers(items);
      setTotalCount(count);
    } catch (err) {
      setError(formatApiError(err, 'No se pudieron cargar los proveedores.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, pageSize]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setCurrentSupplier({ name: '', contact_person: '', phone: '', email: '' });
    setModalError('');
  };

  const handleShowCreateModal = () => {
    setIsEditMode(false);
    setCurrentSupplier({ name: '', contact_person: '', phone: '', email: '' });
    setShowModal(true);
  };

  const handleShowEditModal = (supplier) => {
    setIsEditMode(true);
    setCurrentSupplier(supplier);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/suppliers/${currentSupplier.id}/`, currentSupplier);
      } else {
        await api.post(`${CONTROL_PREFIX}/suppliers/`, currentSupplier);
      }
      fetchSuppliers();
      handleCloseModal();
    } catch (err) {
      setModalError('Error al guardar el proveedor. Revisa los campos.');
      console.error(err);
    }
  };

  const openDeleteModal = (supplier) => {
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
      console.error("Error al eliminar el proveedor", err);
      alert('No se pudo eliminar el proveedor.');
    }
  };

  const renderContent = () => {
    if (loading) return <Col className="text-center py-5"><Spinner animation="border" /></Col>;
    if (error) return <Col><Alert variant="danger">{error}</Alert></Col>;
    if (suppliers.length === 0) return <Col className="text-center py-5"><p>No hay proveedores para mostrar.</p></Col>;

    return suppliers.map((supplier, index) => (
      <Col key={supplier.id} md={6} lg={4} className="mb-4 animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <Card className="h-100 shadow-sm">
          <Card.Body>
            <Card.Title className="fw-bold d-flex align-items-center"><FaTruck className="me-2"/>{supplier.name}</Card.Title>
            <Card.Text as="div" className="text-muted mt-3">
              <p className="mb-2 d-flex"><FaUserTie className="me-2 mt-1"/>{supplier.contact_person || 'N/A'}</p>
              <p className="mb-2 d-flex"><FaPhone className="me-2 mt-1"/>{supplier.phone || 'N/A'}</p>
              <p className="mb-0 d-flex"><FaEnvelope className="me-2 mt-1"/>{supplier.email || 'N/A'}</p>
            </Card.Text>
          </Card.Body>
          {isAdmin && (
            <Card.Footer className="bg-light d-flex justify-content-end gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => handleShowEditModal(supplier)}><FaEdit className="me-1" /> Editar</Button>
              <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(supplier)}><FaTrash className="me-1" /> Eliminar</Button>
            </Card.Footer>
          )}
        </Card>
      </Col>
    ));
  };

  return (
    <>
      <Container fluid className="page-container">
        <Row className="align-items-center mb-4 animated-header">
          <Col>
            <h2 className="h4 mb-0">Gestion de Proveedores</h2>
          </Col>
          {isAdmin && (
            <Col xs="auto">
              <Button variant="primary" onClick={handleShowCreateModal}><FaPlus className="me-2" />Anadir Proveedor</Button>
            </Col>
          )}
        </Row>
        <Row>{renderContent()}</Row>
              </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" name="name" value={currentSupplier.name} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Persona de Contacto</Form.Label>
              <Form.Control type="text" name="contact_person" value={currentSupplier.contact_person} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefono</Form.Label>
              <Form.Control type="text" name="phone" value={currentSupplier.phone} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={currentSupplier.email} onChange={handleInputChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Estas seguro de que quieres eliminar al proveedor <strong>{supplierToDelete?.name}</strong>? Esta accion no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuppliersPage;







