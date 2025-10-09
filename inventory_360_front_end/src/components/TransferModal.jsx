import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';
import { validatePositiveNumber } from '../utils/validation';

const TransferModal = ({ show, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    branch_from_id: '',
    branch_id: '',
    quantity: '',
  });
  const [formErrors, setFormErrors] = useState({});
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
            api.get(`${CONTROL_PREFIX}/branches/`),
          ]);
          setProducts(normalizeApiList(productsRes.data));
          setBranches(normalizeApiList(branchesRes.data));
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.product_id) errors.product_id = 'Seleccioná un producto.';
    if (!formData.branch_from_id) errors.branch_from_id = 'Seleccioná la sucursal de origen.';
    if (!formData.branch_id) errors.branch_id = 'Seleccioná la sucursal de destino.';
    if (formData.branch_from_id && formData.branch_id && formData.branch_from_id === formData.branch_id) {
      errors.branch_id = 'Origen y destino deben ser distintos.';
    }
    const quantityError = validatePositiveNumber(formData.quantity, { label: 'Cantidad' });
    if (quantityError) errors.quantity = quantityError;
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        product_id: Number(formData.product_id),
        branch_from_id: Number(formData.branch_from_id),
        branch_id: Number(formData.branch_id),
        quantity: Number(formData.quantity),
        movement_type: 'transfer',
      };
      await api.post(`${CONTROL_PREFIX}/movements/`, payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(formatApiError(err, 'Ocurrió un error al crear la transferencia.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData({ product_id: '', branch_from_id: '', branch_id: '', quantity: '' });
    setFormErrors({});
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Transferencia</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              isInvalid={!!formErrors.product_id}
              required
            >
              <option value="">Seleccioná un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.product_id}</Form.Control.Feedback>
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Desde (Origen)</Form.Label>
                <Form.Select
                  name="branch_from_id"
                  value={formData.branch_from_id}
                  onChange={handleChange}
                  isInvalid={!!formErrors.branch_from_id}
                  required
                >
                  <option value="">Seleccioná origen...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.branch_from_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Hasta (Destino)</Form.Label>
                <Form.Select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  isInvalid={!!formErrors.branch_id}
                  required
                >
                  <option value="">Seleccioná destino...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.branch_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              isInvalid={!!formErrors.quantity}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.quantity}</Form.Control.Feedback>
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
