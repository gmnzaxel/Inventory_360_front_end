import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';

const SalesPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [sales] = useState([
    { id: 1, docNumber: 'F-001-00123', date: '2023-10-26', total: 1250.00, status: 'Pagada' },
    { id: 2, docNumber: 'F-001-00124', date: '2023-10-25', total: 350.00, status: 'Pagada' },
    { id: 3, docNumber: 'F-001-00125', date: '2023-10-24', total: 799.50, status: 'Pendiente' },
    { id: 4, docNumber: 'F-001-00126', date: '2023-10-23', total: 850.00, status: 'Anulada' },
    { id: 5, docNumber: 'F-001-00127', date: '2023-10-22', total: 120.00, status: 'Pagada' },
  ]);

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'pagada': return 'success';
      case 'pendiente': return 'warning';
      case 'anulada': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Historial de Ventas</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Nueva Venta
          </Button>
        </Col>
      </Row>

      {/* Tarjeta principal con filtros y tabla */}
      <Card className="shadow-sm">
        <Card.Header className="p-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por N° de documento..." />
              </InputGroup>
            </Col>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Tabla de Ventas */}
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Documento</th>
                <th>Fecha</th>
                <th className="text-end">Monto Total</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td className="ps-3 fw-bold">{sale.docNumber}</td>
                  <td>{sale.date}</td>
                  <td className="text-end">${sale.total.toFixed(2)}</td>
                  <td className="text-center">
                    <Badge pill bg={getStatusVariant(sale.status)}>
                      {sale.status}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      <FaFileInvoiceDollar /> Ver Detalle
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

export default SalesPage;
