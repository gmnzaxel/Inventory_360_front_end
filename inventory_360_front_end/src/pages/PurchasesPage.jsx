import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaSearch, FaTruckLoading } from 'react-icons/fa';
import MovementModal from '../components/MovementModal'; // 1. Importa el modal

const API_URL = 'http://localhost:8000/api/control';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Estado para el modal
  const [showModal, setShowModal] = useState(false);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/movements/?movement_type=purchase`);
      setPurchases(response.data);
    } catch (err) {
      setError('No se pudo cargar el historial de compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // 3. Función de éxito
  const handlePurchaseCreated = () => {
    fetchPurchases();
  };

  // ... (código existente para getStatusVariant y renderTableContent)

  return (
    <>
      <Container fluid>
        <Row className="align-items-center mb-4">
          <Col><h2 className="h4 mb-0">Historial de Compras</h2></Col>
          <Col xs="auto">
            {/* 4. El botón abre el modal */}
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Nueva Compra
            </Button>
          </Col>
        </Row>
        {/* ... (resto del componente Card y Table) */}
      </Container>
      
      {/* 5. Renderiza el modal */}
      <MovementModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        movementType="purchase"
        onSuccess={handlePurchaseCreated}
      />
    </>
  );
};

export default PurchasesPage;