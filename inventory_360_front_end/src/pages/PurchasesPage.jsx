import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch, FaTruckLoading } from 'react-icons/fa';

const PurchasesPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [purchases] = useState([
    { id: 1, docNumber: 'PO-2023-051', supplier: 'Tech Distributors Inc.', date: '2023-10-25', total: 6000.00, status: 'Recibido' },
    { id: 2, docNumber: 'PO-2023-052', supplier: 'Office Solutions', date: '2023-10-22', total: 1750.00, status: 'Recibido' },
    { id: 3, docNumber: 'PO-2023-053', supplier: 'Global Gadgets', date: '2023-10-20', total: 15990.00, status: 'Pendiente' },
    { id: 4, docNumber: 'PO-2023-054', supplier: 'Tech Distributors Inc.', date: '2023-10-18', total: 4250.00, status: 'Cancelado' },
  ]);

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'recibido': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelado': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Historial de Compras</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Nueva Compra
          </Button>
        </Col>
      </Row>

      {/* Tarjeta principal con filtros y tabla */}
      <Card className="shadow-sm">
        <Card.Header className="p-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por N° de orden..." />
              </InputGroup>
            </Col>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Tabla de Compras */}
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Orden de Compra</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th className="text-end">Monto Total</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase.id}>
                  <td className="ps-3 fw-bold">{purchase.docNumber}</td>
                  <td>{purchase.supplier}</td>
                  <td>{purchase.date}</td>
                  <td className="text-end">${purchase.total.toFixed(2)}</td>
                  <td className="text-center">
                    <Badge pill bg={getStatusVariant(purchase.status)}>
                      {purchase.status}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      <FaTruckLoading /> Ver Detalle
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

export default PurchasesPage;
