import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import MovementModal from '../components/MovementModal';
import MovementDetailModal from '../components/MovementDetailModal';

const API_URL = 'http://localhost:8000/api/control';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState(null);
  
  const [selectedMovement, setSelectedMovement] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/movements/?movement_type=purchase`);
      setPurchases(response.data);
    } catch (err) {
      setError('No se pudo cargar el historial de compras.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleSuccess = () => {
    fetchPurchases();
  };

  const handleShowCreateModal = () => {
    setMovementToEdit(null);
    setShowCreateEditModal(true);
  };

  const handleShowEditModal = (movement) => {
    setMovementToEdit(movement);
    setShowCreateEditModal(true);
  };

  const handleShowDetails = (movement) => {
    setSelectedMovement(movement);
  };

  const handleCloseDetails = () => {
    setSelectedMovement(null);
  };

  const openDeleteModal = (movement) => {
    setMovementToDelete(movement);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setMovementToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!movementToDelete) return;
    try {
      await axios.delete(`${API_URL}/movements/${movementToDelete.id}/`);
      closeDeleteModal();
      fetchPurchases();
    } catch (err) {
      console.error("Error al eliminar la compra", err);
      alert('No se pudo eliminar la compra.');
    }
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="6" className="text-center py-5"><Spinner /></td></tr>;
    if (error) return <tr><td colSpan="6"><Alert variant="danger" className="m-3">{error}</Alert></td></tr>;
    if (purchases.length === 0) return <tr><td colSpan="6" className="text-center py-5">No hay compras registradas.</td></tr>;

    return purchases.map(purchase => (
      <tr key={purchase.id}>
        <td className="ps-3 fw-bold">{purchase.product?.name}</td>
        <td>{purchase.supplier?.name || 'N/A'}</td>
        <td>{new Date(purchase.date).toLocaleDateString()}</td>
        <td className="text-end">${parseFloat(purchase.unit_price * purchase.quantity || 0).toFixed(2)}</td>
        <td className="text-center"><Badge pill bg="success">Recibido</Badge></td>
        <td className="text-center">
          <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleShowDetails(purchase)}><FaEye /></Button>
          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(purchase)}><FaEdit /></Button>
          <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(purchase)}><FaTrash /></Button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <Container fluid>
        <Row className="align-items-center mb-4">
          <Col><h2 className="h4 mb-0">Historial de Compras</h2></Col>
          <Col xs="auto">
            <Button variant="primary" onClick={handleShowCreateModal}>
              <FaPlus className="me-2" />
              Nueva Compra
            </Button>
          </Col>
        </Row>
        <Card className="shadow-sm">
          <Card.Header className="p-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por producto o proveedor..." />
              </InputGroup>
            </Col>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 ps-3">Producto</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th className="text-end">Monto Total</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
      
      <MovementModal 
        show={showCreateEditModal}
        handleClose={() => setShowCreateEditModal(false)}
        movementType="purchase"
        onSuccess={handleSuccess}
        movementToEdit={movementToEdit}
      />

      <MovementDetailModal 
        show={!!selectedMovement}
        handleClose={handleCloseDetails}
        movement={selectedMovement}
      />

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar esta compra del producto <strong>{movementToDelete?.product?.name}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PurchasesPage;