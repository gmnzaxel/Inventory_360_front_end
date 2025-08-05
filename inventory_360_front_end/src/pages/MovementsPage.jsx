import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch, FaFilter, FaFilePdf } from 'react-icons/fa';

const MovementsPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [movements] = useState([
    { id: 1, type: 'Venta', product: 'Laptop Pro X1', branch: 'Almacén Central', quantity: -5, date: '2023-10-26', user: 'admin' },
    { id: 2, type: 'Compra', product: 'Teclado Mecánico K-800', branch: 'Almacén Central', quantity: 50, date: '2023-10-25', user: 'admin' },
    { id: 3, type: 'Transferencia', product: 'Smartphone G-Plus', branch: 'Sucursal Norte', quantity: -10, date: '2023-10-24', user: 'support' },
    { id: 4, type: 'Ajuste', product: 'Monitor UltraWide 34"', branch: 'Almacén Central', quantity: 1, date: '2023-10-23', user: 'admin' },
    { id: 5, type: 'Venta', product: 'Silla Ergonómica Pro', branch: 'Sucursal Sur', quantity: -2, date: '2023-10-22', user: 'ventas' },
  ]);

  const getBadgeVariant = (type) => {
    switch (type.toLowerCase()) {
      case 'venta': return 'primary';
      case 'compra': return 'success';
      case 'transferencia': return 'info';
      case 'ajuste': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Historial de Movimientos</h2>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="success">
            <FaPlus className="me-2" />
            Registrar Compra
          </Button>
          <Button variant="primary">
            <FaPlus className="me-2" />
            Registrar Venta
          </Button>
        </Col>
      </Row>

      {/* Tarjeta principal con filtros y tabla */}
      <Card className="shadow-sm">
        <Card.Header className="p-3">
          <Row className="align-items-center gy-3">
            {/* Input de Búsqueda */}
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por producto..." />
              </InputGroup>
            </Col>
            {/* Filtro por Tipo */}
            <Col md={6} lg={3}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select>
                  <option value="">Todos los tipos</option>
                  <option>Venta</option>
                  <option>Compra</option>
                  <option>Transferencia</option>
                  <option>Ajuste</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Tabla de Movimientos */}
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Tipo</th>
                <th>Producto</th>
                <th>Sucursal</th>
                <th className="text-center">Cantidad</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th className="text-center">Documento</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(movement => (
                <tr key={movement.id}>
                  <td className="ps-3">
                    <Badge pill bg={getBadgeVariant(movement.type)}>
                      {movement.type}
                    </Badge>
                  </td>
                  <td className="fw-bold">{movement.product}</td>
                  <td>{movement.branch}</td>
                  <td className={`text-center fw-bold ${movement.quantity > 0 ? 'text-success' : 'text-danger'}`}>
                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                  </td>
                  <td>{movement.date}</td>
                  <td className="text-muted">{movement.user}</td>
                  <td className="text-center">
                    <Button variant="outline-secondary" size="sm">
                      <FaFilePdf />
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

export default MovementsPage;
