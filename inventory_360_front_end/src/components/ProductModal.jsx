import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  minimum_stock_input: 10,
};

const ProductModal = ({ show, handleClose, onSuccess, productToEdit }) => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = Boolean(productToEdit);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get(`${CONTROL_PREFIX}/categories/`);
        setCategories(normalizeApiList(response.data));
      } catch (err) {
        console.error('No se pudieron cargar las categorias', err);
        setCategories([]);
      }
    };

    if (show) {
      loadCategories();
      if (isEditMode) {
        setFormData({
          name: productToEdit.name || '',
          description: productToEdit.description || '',
          price: productToEdit.price ?? '',
          category_id: productToEdit.category?.id ?? '',
          minimum_stock_input: productToEdit.minimum_stock ?? 10,
        });
      } else {
        setFormData({ ...emptyForm });
      }
    }
  }, [show, isEditMode, productToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      price: formData.price !== '' ? Number(formData.price) : '',
      minimum_stock_input: Number(formData.minimum_stock_input),
      category_id: formData.category_id ? Number(formData.category_id) : null,
    };

    if (!payload.category_id) {
      payload.category_id = null;
    }

    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/products/${productToEdit.id}/`, payload);
      } else {
        await api.post(`${CONTROL_PREFIX}/products/`, payload);
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
    setFormData({ ...emptyForm });
    setError('');
    setCategories([]);
  };

  const title = isEditMode ? 'Editar Producto' : 'Anadir Nuevo Producto';

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Select name="category_id" value={formData.category_id} onChange={handleChange}>
              <option value="">Selecciona una categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripcion</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Stock Minimo</Form.Label>
                <Form.Control
                  type="number"
                  name="minimum_stock_input"
                  value={formData.minimum_stock_input}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;
