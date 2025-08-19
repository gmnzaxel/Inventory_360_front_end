import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api/control';

const BranchesPage = () => {
  const { currentUser } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });
  const [modalError, setModalError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API_URL}/branches/`);
      setBranches(response.data);
    } catch (err) {
      setError('No se pudieron cargar las sucursales.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewBranch({ name: '', address: '', phone: '' });
    setModalError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBranch(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const response = await axios.post(`${API_URL}/branches/`, newBranch);
      setBranches(prev => [...prev, response.data]);
      handleCloseModal();
    } catch (err) {
      setModalError('Error al crear la sucursal. Revisa los campos.');
      console.error(err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Col className="text-center py-5"><Spinner animation="border" /></Col>;
    }
    if (error) {
      return <Col><Alert variant="danger">{error}</Alert></Col>;
    }
    if (branches.length === 0) {
      return <Col className="text-center py-5"><p>No hay sucursales para mostrar.</p></Col>;
    }

    return branches.map(branch => (
      <Col key={branch.id} md={6} lg={4} className="mb-4">
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
              <Button variant="outline-primary" size="sm"><FaEdit className="me-1" /> Editar</Button>
              <Button variant="outline-danger" size="sm"><FaTrash className="me-1" /> Eliminar</Button>
            </Card.Footer>
          )}
        </Card>
      </Col>
    ));
  };

  return (
    <>
      <Container fluid>
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="h4 mb-0">Gestión de Sucursales</h2>
          </Col>
          {isAdmin && (
            <Col xs="auto">
              <Button variant="primary" onClick={handleShowModal}>
                <FaPlus className="me-2" />Añadir Sucursal
              </Button>
            </Col>
          )}
        </Row>
        <Row>{renderContent()}</Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Sucursal</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateBranch}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" name="name" value={newBranch.name} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control type="text" name="address" value={newBranch.address} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="text" name="phone" value={newBranch.phone} onChange={handleInputChange} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Sucursal</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default BranchesPage;