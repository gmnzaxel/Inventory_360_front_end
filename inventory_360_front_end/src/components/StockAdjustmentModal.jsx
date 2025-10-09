import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { validateInteger, validateRequiredText } from '../utils/validation';

const StockAdjustmentModal = ({ show, handleClose, onSuccess, stockItem }) => {
  const [newQuantity, setNewQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (stockItem && show) {
      setNewQuantity(String(stockItem.quantity ?? ''));
    }
  }, [stockItem, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    const quantityError = validateInteger(newQuantity, { label: 'Nueva cantidad real', min: 0 });
    if (quantityError) errors.newQuantity = quantityError;

    const notesError = validateRequiredText(notes, { label: 'Motivo del ajuste', min: 5, max: 200 });
    if (notesError) errors.notes = notesError;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const adjustmentQuantity = parseInt(newQuantity, 10) - stockItem.quantity;
    if (adjustmentQuantity === 0) {
      setError('La nueva cantidad es igual a la actual. No se requiere ajuste.');
      return;
    }

    const movementData = {
      movement_type: 'adjustment',
      product_id: stockItem.product.id,
      branch_id: stockItem.branch.id,
      quantity: adjustmentQuantity,
      notes,
    };

    setLoading(true);
    try {
      const payload = { ...movementData, quantity: Number(movementData.quantity) };
      await api.post(`${CONTROL_PREFIX}/movements/`, payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(formatApiError(err, 'Ocurrió un error al registrar el ajuste.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setNewQuantity('');
    setNotes('');
    setError('');
    setFormErrors({});
  };

  if (!stockItem) return null;

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>Ajustar Stock</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <h5 className="fw-bold">{stockItem.product.name}</h5>
          <p className="text-muted">Sucursal: {stockItem.branch.name}</p>

          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Stock Actual en Sistema</Form.Label>
                <Form.Control type="number" value={stockItem.quantity} readOnly disabled />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Nueva Cantidad Real</Form.Label>
                <Form.Control
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  min="0"
                  isInvalid={!!formErrors.newQuantity}
                  required
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">{formErrors.newQuantity}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group>
            <Form.Label>Motivo del Ajuste</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              isInvalid={!!formErrors.notes}
              placeholder="Ej: Conteo anual, producto dañado, etc."
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.notes}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Guardar Ajuste'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StockAdjustmentModal;
