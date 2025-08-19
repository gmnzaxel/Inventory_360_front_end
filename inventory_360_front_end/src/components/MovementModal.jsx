import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

const API_URL = 'http://localhost:8000/api/control';

const MovementModal = ({ show, handleClose, movementType, onSuccess }) => {
  // Estados para los datos del formulario
  const [formData, setFormData] = useState({
    product_id: '',
    branch_id: '',
    quantity: 1,
    unit_price: ''
  });

  // Estados para cargar los selectores y manejar el envío
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar productos y sucursales cuando se abre el modal
  useEffect(() => {
    if (show) {
      const fetchData = async () => {
        try {
          const [productsRes, branchesRes] = await Promise.all([
            axios.get(`${API_URL}/products/`),
            axios.get(`${API_URL}/branches/`)
          ]);
          setProducts(productsRes.data);
          setBranches(branchesRes.data);
        } catch (err) {
          setError('No se pudieron cargar los datos necesarios.');
        }
      };
      fetchData();
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      movement_type: movementType,
      date: new Date().toISOString().split('T')[0], // Fecha actual
    };

    try {
      await axios.post(`${API_URL}/movements/`, payload);
      onSuccess();
      handleClose(); 
    } catch (err) {
      const errorMessage = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Ocurrió un error.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resetea el formulario cuando se cierra el modal
  const handleExited = () => {
    setFormData({ product_id: '', branch_id: '', quantity: 1, unit_price: '' });
    setError('');
  };

  const title = movementType === 'sale' ? 'Registrar Nueva Venta' : 'Registrar Nueva Compra';

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Select name="product_id" value={formData.product_id} onChange={handleChange} required>
              <option value="">Selecciona un producto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sucursal</Form.Label>
            <Form.Select name="branch_id" value={formData.branch_id} onChange={handleChange} required>
              <option value="">Selecciona una sucursal...</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Precio Unitario</Form.Label>
                <Form.Control type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} step="0.01" min="0" required />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MovementModal;