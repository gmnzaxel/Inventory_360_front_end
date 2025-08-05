import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaSearch } from 'react-icons/fa';

const BranchesPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [branches] = useState([
    { id: 1, name: 'Almacén Central', address: 'Av. Siempre Viva 742, Springfield', phone: '+54 9 261 123-4567' },
    { id: 2, name: 'Sucursal Norte', address: 'Calle Falsa 123, Capital', phone: '+54 9 261 234-5678' },
    { id: 3, name: 'Sucursal Sur', address: 'Boulevard de los Sueños Rotos 49', phone: '+54 9 261 345-6789' },
    { id: 4, name: 'Punto de Venta Oeste', address: 'Ruta 40, Km 29, Luján de Cuyo', phone: '+54 9 261 456-7890' },
  ]);

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h2 className="h4 mb-0">Gestión de Sucursales</h2>
        </Col>
        <Col md={6} className="d-flex justify-content-end gap-2">
            <InputGroup style={{ maxWidth: '300px' }}>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar sucursal..." />
            </InputGroup>
            <Button variant="primary">
                <FaPlus className="me-2" />
                Añadir Sucursal
            </Button>
        </Col>
      </Row>

      {/* Grid de Tarjetas de Sucursales */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {branches.map(branch => (
          <Col key={branch.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="fw-bold">{branch.name}</Card.Title>
                <Card.Text as="div" className="text-muted">
                  <p className="mb-2 d-flex align-items-start">
                    <FaMapMarkerAlt className="me-2 mt-1 flex-shrink-0" /> 
                    <span>{branch.address}</span>
                  </p>
                  <p className="mb-0 d-flex align-items-center">
                    <FaPhone className="me-2 flex-shrink-0" /> 
                    <span>{branch.phone}</span>
                  </p>
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-light d-flex justify-content-end gap-2">
                <Button variant="outline-primary" size="sm">
                  <FaEdit className="me-1" /> Editar
                </Button>
                <Button variant="outline-danger" size="sm">
                  <FaTrash className="me-1" /> Eliminar
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BranchesPage;