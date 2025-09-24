import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';

const TransferModal = ({ show, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    branch_from_id: '',
    branch_id: '',
    quantity: '',
  });
  
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (show) {
        try {
          const [productsRes, branchesRes] = await Promise.all([
            api.get(`${CONTROL_PREFIX}/products/`),
            api.get(`${CONTROL_PREFIX}/branches/`)
          ]);
          const productList = normalizeApiList(productsRes.data);
          const branchList = normalizeApiList(branchesRes.data);
          setProducts(productList);
          setBranches(branchList);
        } catch (err) {
          setError('No se pudieron cargar los productos o sucursales.');
          setProducts([]);
          setBranches([]);
        }
      }
    };
    fetchData();
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.branch_from_id === formData.branch_id) {
      setError('La sucursal de origen y destino no pueden ser la misma.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        product_id: formData.product_id ? Number(formData.product_id) : '',
        branch_from_id: formData.branch_from_id ? Number(formData.branch_from_id) : '',
        branch_id: formData.branch_id ? Number(formData.branch_id) : '',
        quantity: Number(formData.quantity),
        movement_type: 'transfer',
      };
      await api.post(`${CONTROL_PREFIX}/movements/`, payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(formatApiError(err, 'Ocurrio un error al crear la transferencia.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData({ product_id: '', branch_from_id: '', branch_id: '', quantity: '' });
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Transferencia</Modal.Title>
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
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Desde Sucursal (Origen)</Form.Label>
                <Form.Select name="branch_from_id" value={formData.branch_from_id} onChange={handleChange} required>
                  <option value="">Selecciona origen...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Hasta Sucursal (Destino)</Form.Label>
                <Form.Select name="branch_id" value={formData.branch_id} onChange={handleChange} required>
                  <option value="">Selecciona destino...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad a Transferir</Form.Label>
            <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Confirmar Transferencia'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TransferModal; 


