import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';

const MovementModal = ({ show, handleClose, movementType, onSuccess, movementToEdit }) => {
  const [formData, setFormData] = useState({});
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!movementToEdit;

  useEffect(() => {
    const initialFormData = {
      product_id: '',
      branch_id: '',
      supplier_id: null,
      quantity: 1,
      unit_price: ''
    };

    if (show) {
      if (isEditMode) {
        setFormData({
          product_id: movementToEdit.product?.id || '',
          branch_id: movementToEdit.branch?.id || '',
          supplier_id: movementToEdit.supplier?.id || null,
          quantity: Math.abs(movementToEdit.quantity),
          unit_price: movementToEdit.unit_price || ''
        });
      } else {
        setFormData(initialFormData);
      }

      const fetchData = async () => {
        try {
          const [productsRes, branchesRes, suppliersRes] = await Promise.all([
            api.get(`${CONTROL_PREFIX}/products/`),
            api.get(`${CONTROL_PREFIX}/branches/`),
            movementType === 'purchase' ? api.get(`${CONTROL_PREFIX}/suppliers/`) : Promise.resolve({ data: [] })
          ]);
          const productList = normalizeApiList(productsRes.data);
          const branchList = normalizeApiList(branchesRes.data);
          const supplierList = normalizeApiList(suppliersRes.data);
          setProducts(productList);
          setBranches(branchList);
          setSuppliers(supplierList);
        } catch (err) {
          setError('No se pudieron cargar los datos necesarios.');
          setProducts([]);
          setBranches([]);
          setSuppliers([]);
        }
      };
      fetchData();
    }
  }, [show, movementToEdit, isEditMode, movementType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProductChange = (e) => {
    const productId = e.target.value;
    setFormData(prev => ({ ...prev, product_id: productId }));

    if (movementType === 'sale') {
      const selectedProduct = products.find(p => p.id === parseInt(productId, 10));
      if (selectedProduct) {
        setFormData(prev => ({ ...prev, product_id: productId, unit_price: selectedProduct.price }));
      } else {
        setFormData(prev => ({ ...prev, product_id: productId, unit_price: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      product_id: formData.product_id ? Number(formData.product_id) : '',
      branch_id: formData.branch_id ? Number(formData.branch_id) : '',
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : undefined,
      quantity: Number(formData.quantity),
      unit_price: formData.unit_price !== '' ? Number(formData.unit_price) : undefined,
      movement_type: movementType,
    };
    
    if (!payload.supplier_id) {
      delete payload.supplier_id;
    }

    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/movements/${movementToEdit.id}/`, payload);
      } else {
        await api.post(`${CONTROL_PREFIX}/movements/`, payload);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(formatApiError(err, 'Ocurrio un error.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setError('');
  };

  const title = movementType === 'sale' 
    ? (isEditMode ? 'Editar Venta' : 'Registrar Nueva Venta')
    : (isEditMode ? 'Editar Compra' : 'Registrar Nueva Compra');

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
            <Form.Select name="product_id" value={formData.product_id} onChange={handleProductChange} required>
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
          {movementType === 'purchase' && (
            <Form.Group className="mb-3">
              <Form.Label>Proveedor</Form.Label>
              <Form.Select name="supplier_id" value={formData.supplier_id || ''} onChange={handleChange} required>
                <option value="">Selecciona un proveedor...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
            </Form.Group>
          )}
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
            {loading ? <Spinner as="span" size="sm" /> : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MovementModal;

