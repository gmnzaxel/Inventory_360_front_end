import React from 'react';
import { Modal, Button, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { FaBox, FaStore, FaTruck, FaUser, FaCalendarAlt } from 'react-icons/fa';

const MovementDetailModal = ({ show, handleClose, movement }) => {
  if (!movement) return null;

  const getBadgeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'sale': return 'primary';
      case 'purchase': return 'success';
      case 'transfer': return 'info';
      case 'adjustment': return 'warning';
      default: return 'secondary';
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const total = Math.abs(movement.quantity * (movement.unit_price || 0)).toFixed(2);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Detalle del Movimiento #{movement.id}
          <Badge bg={getBadgeVariant(movement.movement_type)} className="ms-2">{capitalize(movement.movement_type)}</Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="fw-bold"><FaBox className="me-2"/>Producto</div>
                {movement.product?.name}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold"><FaStore className="me-2"/>Sucursal</div>
                {movement.branch?.name}
              </ListGroup.Item>
              {movement.branch_from && (
                <ListGroup.Item>
                  <div className="fw-bold"><FaTruck className="me-2"/>Desde (Origen)</div>
                  {movement.branch_from.name}
                </ListGroup.Item>
              )}
              {movement.supplier && (
                <ListGroup.Item>
                  <div className="fw-bold"><FaTruck className="me-2"/>Proveedor</div>
                  {movement.supplier.name}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Col>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="fw-bold"><FaUser className="me-2"/>Usuario</div>
                {movement.user}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold"><FaCalendarAlt className="me-2"/>Fecha</div>
                {new Date(movement.date).toLocaleDateString()}
              </ListGroup.Item>

            </ListGroup>
          </Col>
        </Row>
        <hr />
        <Row className="text-center mt-3">
          <Col>
            <div className="text-muted">Cantidad</div>
            <h4 className={movement.quantity > 0 ? 'text-success' : 'text-danger'}>
              {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
            </h4>
          </Col>
          <Col>
            <div className="text-muted">Precio Unitario</div>
            <h4>${parseFloat(movement.unit_price || 0).toFixed(2)}</h4>
          </Col>
          <Col>
            <div className="text-muted">Monto Total</div>
            <h4>${total}</h4>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MovementDetailModal;

