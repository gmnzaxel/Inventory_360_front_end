import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { validateName, validateOptionalText, validatePositiveNumber, validateInteger } from '../utils/validation';
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
  const [formErrors, setFormErrors] = useState({});
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
        console.error('No se pudieron cargar las categorías', err);
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
      setFormErrors({});
      setError('');
    }
  }, [show, isEditMode, productToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateName(formData.name, { label: 'Nombre del producto', min: 3, max: 80 });
    if (nameError) errors.name = nameError;

    const descriptionError = validateOptionalText(formData.description, { label: 'Descripción', max: 400 });
    if (descriptionError) errors.description = descriptionError;

    const priceError = validatePositiveNumber(formData.price, { label: 'Precio' });
    if (priceError) errors.price = priceError;

    const stockError = validateInteger(formData.minimum_stock_input, { label: 'Stock mínimo', min: 0 });
    if (stockError) errors.minimum_stock_input = stockError;

    if (!formData.category_id) {
      errors.category_id = 'Seleccioná una categoría.';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      minimum_stock_input: Number(formData.minimum_stock_input),
      category_id: formData.category_id ? Number(formData.category_id) : null,
    };

    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/products/${productToEdit.id}/`, payload);
      } else {
        await api.post(`${CONTROL_PREFIX}/products/`, payload);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      const message = formatApiError(err, 'Ocurrió un error al guardar el producto.');
      setError(message);
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        ['name', 'description', 'price', 'minimum_stock_input', 'category_id'].forEach((field) => {
          if (data[field]) {
            const value = Array.isArray(data[field]) ? data[field].join(' ') : String(data[field]);
            fieldErrors[field] = value;
          }
        });
        if (Object.keys(fieldErrors).length) {
          setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData({ ...emptyForm });
    setFormErrors({});
    setError('');
    setCategories([]);
  };

  const title = isEditMode ? 'Editar Producto' : 'Añadir Nuevo Producto';

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              isInvalid={!!formErrors.name}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              isInvalid={!!formErrors.category_id}
            >
              <option value="">Seleccioná una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.category_id}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              isInvalid={!!formErrors.description}
            />
            <Form.Control.Feedback type="invalid">{formErrors.description}</Form.Control.Feedback>
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
                  isInvalid={!!formErrors.price}
                  required
                />
                <Form.Control.Feedback type="invalid">{formErrors.price}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Stock Mínimo</Form.Label>
                <Form.Control
                  type="number"
                  name="minimum_stock_input"
                  value={formData.minimum_stock_input}
                  onChange={handleChange}
                  min="0"
                  isInvalid={!!formErrors.minimum_stock_input}
                  required
                />
                <Form.Control.Feedback type="invalid">{formErrors.minimum_stock_input}</Form.Control.Feedback>
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
