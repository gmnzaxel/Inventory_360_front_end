import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { validateName, validateOptionalText } from '../utils/validation';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';

const defaultForm = { name: '', description: '' };

const CategoryModal = ({ show, handleClose, onSuccess, categoryToEdit }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!categoryToEdit;

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
      setError('');
    }
  }, [show, categoryToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateName(formData.name, { label: 'Nombre de la categoría', min: 3, max: 80 });
    if (nameError) errors.name = nameError;

    const descriptionError = validateOptionalText(formData.description, { label: 'Descripción', max: 250 });
    if (descriptionError) errors.description = descriptionError;

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
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/categories/${categoryToEdit.id}/`, formData);
      } else {
        await api.post(`${CONTROL_PREFIX}/categories/`, formData);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(formatApiError(err, 'Ocurrió un error al guardar.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
