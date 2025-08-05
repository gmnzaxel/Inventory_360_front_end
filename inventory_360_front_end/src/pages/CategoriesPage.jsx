import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const CategoriesPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [categories] = useState([
    { id: 1, name: 'Electrónica', description: 'Dispositivos y gadgets tecnológicos.' },
    { id: 2, name: 'Accesorios de Cómputo', description: 'Periféricos y componentes para computadoras.' },
    { id: 3, name: 'Monitores', description: 'Pantallas de alta resolución para trabajo y gaming.' },
    { id: 4, name: 'Mobiliario de Oficina', description: 'Sillas, escritorios y soluciones ergonómicas.' },
    { id: 5, name: 'Hogar', description: 'Artículos y electrodomésticos para el hogar.' },
  ]);

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Gestión de Categorías</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Añadir Categoría
          </Button>
        </Col>
      </Row>

      {/* Tarjeta principal con filtros y tabla */}
      <Card className="shadow-sm">
        <Card.Header className="p-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por nombre..." />
              </InputGroup>
            </Col>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Tabla de Categorías */}
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Nombre de la Categoría</th>
                <th>Descripción</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td className="ps-3 fw-bold">{category.name}</td>
                  <td className="text-muted">{category.description}</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm" className="me-2">
                      <FaEdit />
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CategoriesPage;