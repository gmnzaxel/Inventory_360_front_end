import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaFilter, FaFilePdf } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api/control';

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await axios.get(`${API_URL}/movements/`);
        setMovements(response.data);
      } catch (err) {
        setError('No se pudo cargar el historial de movimientos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

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
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 mb-0">Cargando movimientos...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="7">
            <Alert variant="danger" className="m-3">{error}</Alert>
          </td>
        </tr>
      );
    }

    if (movements.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center py-5">
            No hay movimientos registrados.
          </td>
        </tr>
      );
    }

    return movements.map(movement => (
      <tr key={movement.id}>
        <td className="ps-3">
          <Badge pill bg={getBadgeVariant(movement.movement_type)}>
            {capitalize(movement.movement_type)}
          </Badge>
        </td>
        <td className="fw-bold">{movement.product?.name || 'N/A'}</td>
        <td>{movement.branch?.name || 'N/A'}</td>
        <td className={`text-center fw-bold ${movement.quantity > 0 ? 'text-success' : 'text-danger'}`}>
          {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
        </td>
        <td>{new Date(movement.date).toLocaleDateString()}</td>
        <td className="text-muted">{movement.user || 'N/A'}</td>
        <td className="text-center">
          <Button variant="outline-secondary" size="sm" title="Ver Documento">
            <FaFilePdf />
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <Container fluid>
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">Historial de Movimientos</h2>
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
                  <option value="">Todos los tipos</option>
                  <option value="sale">Venta</option>
                  <option value="purchase">Compra</option>
                  <option value="transfer">Transferencia</option>
                  <option value="adjustment">Ajuste</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
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
              {renderTableContent()}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MovementsPage;