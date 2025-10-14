import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { validateName, validateOptionalText } from '../utils/validation';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';

const defaultForm = { name: '', description: '' };

const CategoryModal = ({
  show,
  handleClose,
  onSuccess,
  categoryToEdit,
  existingCategories = [],
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(categoryToEdit);
  const comparableCategories = useMemo(
    () => (Array.isArray(existingCategories) ? existingCategories : []),
    [existingCategories]
  );

  useEffect(() => {
    if (show) {
      if (isEditMode) {
        setFormData({
          name: categoryToEdit.name || '',
          description: categoryToEdit.description || '',
        });
      } else {
        setFormData(defaultForm);
      }
      setFormErrors({});
      setError(null);
    }
  }, [show, isEditMode, categoryToEdit]);

  const checkDuplicateName = (rawName) => {
    const candidate = (rawName || '').trim().toLowerCase();
    if (!candidate) return null;
    const duplicate = comparableCategories.some(
      (category) =>
        category &&
        category.id !== (categoryToEdit?.id ?? null) &&
        (category.name || '').trim().toLowerCase() === candidate
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
    const nameError = validateName(formData.name, { label: 'Nombre de la categoria', min: 3, max: 80 });
    if (nameError) {
      errors.name = nameError;
    } else {
      const duplicateMessage = checkDuplicateName(formData.name);
      if (duplicateMessage) errors.name = duplicateMessage;
    }

    const descriptionError = validateOptionalText(formData.description, { label: 'Descripción', max: 250 });
    if (descriptionError) errors.description = descriptionError;

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/categories/${categoryToEdit.id}/`, formData);
      } else {
        await api.post(`${CONTROL_PREFIX}/categories/`, formData);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      const apiError = err.inventoryError || parseApiError(err, 'Ocurrió un error al guardar la categoría.', 'Error al guardar');
      setError(apiError);
      const details = apiError.details || {};
      if (Object.keys(details).length) {
        setFormErrors((prev) => ({ ...prev, ...details }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setError(null);
  };

  const title = isEditMode ? 'Editar Categoria' : 'Nueva Categoria';

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
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={!!formErrors.name}
              required
              autoFocus
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
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

export default CategoryModal;
