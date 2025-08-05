import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Badge, Image } from 'react-bootstrap';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash } from 'react-icons/fa';

const ProductsPage = () => {
  // Datos estáticos de ejemplo para la vista
  const [products] = useState([
    { id: 1, name: 'Laptop Pro X1', category: 'Electrónica', price: 1250.00, stock: 15, image: 'https://placehold.co/60x60/0d6efd/white?text=LPX' },
    { id: 2, name: 'Smartphone G-Plus', category: 'Electrónica', price: 799.50, stock: 32, image: 'https://placehold.co/60x60/198754/white?text=SGP' },
    { id: 3, name: 'Teclado Mecánico K-800', category: 'Accesorios', price: 120.00, stock: 50, image: 'https://placehold.co/60x60/ffc107/white?text=TMK' },
    { id: 4, name: 'Monitor UltraWide 34"', category: 'Monitores', price: 850.00, stock: 8, image: 'https://placehold.co/60x60/dc3545/white?text=MUW' },
    { id: 5, name: 'Silla Ergonómica Pro', category: 'Mobiliario', price: 350.00, stock: 0, image: 'https://placehold.co/60x60/6c757d/white?text=SEP' },
  ]);

  return (
    <Container fluid>
      {/* Encabezado de la página */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Gestión de Productos</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Añadir Producto
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
                <Form.Control placeholder="Buscar por nombre..." />
              </InputGroup>
            </Col>
            {/* Filtro por Categoría */}
            <Col md={6} lg={3}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select>
                  <option value="">Todas las categorías</option>
                  <option>Electrónica</option>
                  <option>Accesorios</option>
                  <option>Monitores</option>
                  <option>Mobiliario</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Tabla de Productos */}
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Producto</th>
                <th>Categoría</th>
                <th className="text-end">Precio</th>
                <th className="text-center">Stock</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center">
                      <Image src={product.image} roundedCircle className="me-3" />
                      <span className="fw-bold">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className="text-end">${product.price.toFixed(2)}</td>
                  <td className="text-center">
                    <Badge pill bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                      {product.stock > 0 ? product.stock : 'Sin Stock'}
                    </Badge>
                  </td>
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

export default ProductsPage;
