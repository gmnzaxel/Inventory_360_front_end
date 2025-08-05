import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Image } from 'react-bootstrap';
import { FaSearch, FaFilter, FaEdit } from 'react-icons/fa';

const StockPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [stockItems] = useState([
    { id: 1, product: 'Laptop Pro X1', branch: 'Almacén Central', quantity: 15, minStock: 10, image: 'https://placehold.co/60x60/0d6efd/white?text=LPX' },
    { id: 2, product: 'Smartphone G-Plus', branch: 'Almacén Central', quantity: 32, minStock: 20, image: 'https://placehold.co/60x60/198754/white?text=SGP' },
    { id: 3, product: 'Teclado Mecánico K-800', branch: 'Sucursal Norte', quantity: 50, minStock: 15, image: 'https://placehold.co/60x60/ffc107/white?text=TMK' },
    { id: 4, product: 'Monitor UltraWide 34"', branch: 'Almacén Central', quantity: 8, minStock: 10, image: 'https://placehold.co/60x60/dc3545/white?text=MUW' },
    { id: 5, product: 'Silla Ergonómica Pro', branch: 'Sucursal Sur', quantity: 0, minStock: 5, image: 'https://placehold.co/60x60/6c757d/white?text=SEP' },
    { id: 6, product: 'Laptop Pro X1', branch: 'Sucursal Norte', quantity: 5, minStock: 5, image: 'https://placehold.co/60x60/0d6efd/white?text=LPX' },
  ]);

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { variant: 'danger', text: 'Sin Stock' };
    if (quantity <= minStock) return { variant: 'warning', text: 'Bajo Stock' };
    return { variant: 'success', text: 'OK' };
  };

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Control de Stock</h2>
        </Col>
      </Row>

      {/* Tarjeta principal con filtros y tabla */}
      <Card className="shadow-sm">
        <Card.Header className="p-3">
          <Row className="align-items-center gy-3">
            {/* Input de Búsqueda por Producto */}
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por producto..." />
              </InputGroup>
            </Col>
            {/* Filtro por Sucursal */}
            <Col md={6} lg={3}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select>
                  <option value="">Todas las sucursales</option>
                  <option>Almacén Central</option>
                  <option>Sucursal Norte</option>
                  <option>Sucursal Sur</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Tabla de Stock */}
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Producto</th>
                <th>Sucursal</th>
                <th className="text-center">Cantidad Actual</th>
                <th className="text-center">Stock Mínimo</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(item => {
                const status = getStockStatus(item.quantity, item.minStock);
                return (
                  <tr key={item.id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center">
                        <Image src={item.image} roundedCircle className="me-3" />
                        <span className="fw-bold">{item.product}</span>
                      </div>
                    </td>
                    <td>{item.branch}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-center">{item.minStock}</td>
                    <td className="text-center">
                      <Badge pill bg={status.variant}>
                        {status.text}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm">
                        <FaEdit />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StockPage;