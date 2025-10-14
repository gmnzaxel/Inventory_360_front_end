import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { validateName, validateOptionalText, validateInteger } from '../utils/validation';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';

const emptyForm = {
  name: '',
  description: '',
  category_id: '',
  minimum_stock_input: 10,
};

const ProductModal = ({
  show,
  handleClose,
  onSuccess,
  productToEdit,
  existingProducts = [],
}) => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(productToEdit);
  const comparableProducts = useMemo(
    () => (Array.isArray(existingProducts) ? existingProducts : []),
    [existingProducts]
  );

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
          category_id: productToEdit.category?.id ?? '',
          minimum_stock_input: productToEdit.minimum_stock ?? 10,
        });
      } else {
        setFormData({ ...emptyForm });
      }
      setFormErrors({});
      setError(null);
    }
  }, [show, isEditMode, productToEdit]);

  const checkDuplicateName = (rawName) => {
    const candidate = (rawName || '').trim().toLowerCase();
    if (!candidate) return null;
    const duplicate = comparableProducts.some(
      (product) =>
        product &&
        product.id !== (productToEdit?.id ?? null) &&
        (product.name || '').trim().toLowerCase() === candidate
    );
    if (duplicate) {
      return `Ya existe '${rawName.trim()}' en esta empresa.`;
    }
    return null;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === 'name') {
      const duplicateMessage = checkDuplicateName(value);
      setFormErrors((prev) => ({
        ...prev,
        name: duplicateMessage || prev?.name,
      }));
    }
  };

  const handleBlur = (event) => {
    if (event.target.name !== 'name') return;
    const duplicateMessage = checkDuplicateName(event.target.value);
    setFormErrors((prev) => ({
      ...prev,
      name: duplicateMessage || prev?.name,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateName(formData.name, { label: 'Nombre del producto', min: 3, max: 80 });
    if (nameError) {
      errors.name = nameError;
    } else {
      const duplicateMessage = checkDuplicateName(formData.name);
      if (duplicateMessage) errors.name = duplicateMessage;
    }

    const descriptionError = validateOptionalText(formData.description, { label: 'Descripción', max: 400 });
    if (descriptionError) errors.description = descriptionError;

    const stockError = validateInteger(formData.minimum_stock_input, { label: 'Stock mínimo', min: 0 });
    if (stockError) errors.minimum_stock_input = stockError;

    if (!formData.category_id) {
      errors.category_id = 'Seleccioná una categoría.';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description,
      minimum_stock_input: Number(formData.minimum_stock_input ?? 0),
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
      const apiError = err.inventoryError || parseApiError(err, 'Ocurrió un error al guardar el producto.', 'Error al guardar');
      setError(apiError);
      const details = apiError.details || {};
      if (Object.keys(details).length) {
        setFormErrors((prev) => ({
          ...prev,
          ...details,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData({ ...emptyForm });
    setFormErrors({});
    setError(null);
    setCategories([]);
  };

  const title = isEditMode ? 'Editar Producto' : 'Añadir Producto';

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <div className="fw-semibold">{error.title || 'Error'}</div>
              <div>{error.message}</div>
              {error.requestId && (
                <div className="small text-muted">ID de seguimiento: {error.requestId}</div>
              )}
            </Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Producto</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
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
          <Form.Group className="mb-3">
            <Form.Label>Stock mínimo</Form.Label>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;
