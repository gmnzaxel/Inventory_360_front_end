import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Image, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaFilter, FaEdit } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api/control';

const StockPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        // Hacemos la petición GET a tu endpoint de stocks
        const response = await axios.get(`${API_URL}/stocks/`);
        setStockItems(response.data);
      } catch (err) {
        setError('No se pudo cargar el stock. Por favor, intenta de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { variant: 'danger', text: 'Sin Stock' };
    // Usamos el campo 'is_low_stock' que viene directamente del backend
    if (item.is_low_stock) return { variant: 'warning', text: 'Bajo Stock' };
    return { variant: 'success', text: 'OK' };
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 mb-0">Cargando stock...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="6">
            <Alert variant="danger" className="m-3">{error}</Alert>
          </td>
        </tr>
      );
    }

    if (stockItems.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-5">
            No hay registros de stock para mostrar.
          </td>
        </tr>
      );
    }

    return stockItems.map(item => {
      const status = getStockStatus(item);
      return (
        <tr key={item.id}>
          <td className="ps-3">
            <div className="d-flex align-items-center">
              {/* Leemos la imagen del objeto anidado 'product' */}
              <Image src={item.product?.image || 'https://placehold.co/60x60/secondary/white?text=P'} roundedCircle className="me-3" />
              <span className="fw-bold">{item.product?.name || 'Producto no encontrado'}</span>
            </div>
          </td>
          {/* Leemos el nombre del objeto anidado 'branch' */}
          <td>{item.branch?.name || 'Sucursal no encontrada'}</td>
          <td className="text-center">{item.quantity}</td>
          <td className="text-center">{item.minimum_stock}</td>
          <td className="text-center">
            <Badge pill bg={status.variant}>
              {status.text}
            </Badge>
          </td>
          <td className="text-center">
            <Button variant="outline-primary" size="sm" title="Editar Stock Mínimo">
              <FaEdit />
            </Button>
          </td>
        </tr>
      );
    });
  };

  return (
    <Container fluid>
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Control de Stock</h2>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="p-3">
          <Row className="align-items-center gy-3">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control placeholder="Buscar por producto..." />
              </InputGroup>
            </Col>
            <Col md={6} lg={3}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select>
                  <option value="">Todas las sucursales</option>
                  {/* Aquí podrías cargar las sucursales dinámicamente */}
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
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
              {renderTableContent()}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StockPage;