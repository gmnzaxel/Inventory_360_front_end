import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const API_URL = 'http://localhost:8000/api/control';

const ProductModal = ({ show, handleClose, onSuccess, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!productToEdit;

  useEffect(() => {
    if (show && isEditMode) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price,
      });
    }
  }, [show, productToEdit, isEditMode]);

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
        await axios.put(`${API_URL}/products/${productToEdit.id}/`, formData);
      } else {
        await axios.post(`${API_URL}/products/`, formData);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Ocurrió un error.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setFormData({ name: '', description: '', price: '' });
    setError('');
  };

  const title = isEditMode ? 'Editar Producto' : 'Añadir Nuevo Producto';

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
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" required />
          </Form.Group>
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

export default ProductModal;