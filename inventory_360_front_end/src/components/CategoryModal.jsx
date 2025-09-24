import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';

const CategoryModal = ({ show, handleClose, onSuccess, categoryToEdit }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!categoryToEdit;

  useEffect(() => {
    if (show) {
      if (isEditMode) {
        setFormData({
          name: categoryToEdit.name,
          description: categoryToEdit.description,
        });
      } else {
        setFormData({ name: '', description: '' });
      }
    }
  }, [show, categoryToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEditMode) {
        await api.put(`${CONTROL_PREFIX}/categories/${categoryToEdit.id}/`, formData);
      } else {
        await api.post(`${CONTROL_PREFIX}/categories/`, formData);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(formatApiError(err, 'Ocurrio un error al guardar.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData({ name: '', description: '' });
    setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Editar Categoria' : 'Nueva Categoria'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required autoFocus />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripcion</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
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



