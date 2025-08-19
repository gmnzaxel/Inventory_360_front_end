import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';
import MovementModal from '../components/MovementModal';

const API_URL = 'http://localhost:8000/api/control';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/movements/?movement_type=sale`);
      setSales(response.data);
    } catch (err) {
      setError('No se pudo cargar el historial de ventas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSaleCreated = () => {
    fetchSales();
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'anulada': return 'danger';
      default: return 'secondary';
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 mb-0">Cargando ventas...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="5">
            <Alert variant="danger" className="m-3">{error}</Alert>
          </td>
        </tr>
      );
    }

    if (sales.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-5">
            No hay ventas registradas.
          </td>
        </tr>
      );
    }

    return sales.map(sale => (
      <tr key={sale.id}>
        <td className="ps-3 fw-bold">{sale.document?.document_number || 'Sin Doc.'}</td>
        <td>{new Date(sale.date).toLocaleDateString()}</td>
        <td className="text-end">${parseFloat(sale.unit_price * Math.abs(sale.quantity) || 0).toFixed(2)}</td>
        <td className="text-center">
          <Badge pill bg={getStatusVariant('completada')}>
            Completada
          </Badge>
        </td>
        <td className="text-center">
          <Button variant="outline-primary" size="sm">
            <FaFileInvoiceDollar /> Ver Detalle
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <Container fluid>
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="h4 mb-0">Historial de Ventas</h2>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Nueva Venta
            </Button>
          </Col>
        </Row>
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
                {renderTableContent()}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <MovementModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        movementType="sale"
        onSuccess={handleSaleCreated}
      />
    </>
  );
};

export default SalesPage;