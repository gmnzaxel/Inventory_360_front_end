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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSaleCreated = () => {
    fetchSales(); // Vuelve a cargar la lista de ventas
  };

  return (
    <>
      <Container fluid>
        <Row className="align-items-center mb-4">
          <Col><h2 className="h4 mb-0">Historial de Ventas</h2></Col>
          <Col xs="auto">
            {/* 4. El botón ahora abre el modal */}
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Nueva Venta
            </Button>
          </Col>
        </Row>  
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