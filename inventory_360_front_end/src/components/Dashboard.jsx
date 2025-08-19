import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaBoxOpen, FaChartLine, FaExclamationTriangle, FaExchangeAlt } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/api/control';

const StatCard = ({ title, value, icon }) => (
  <Card className="shadow-sm h-100">
    <Card.Body className="d-flex align-items-center">
      <div className="fs-3 me-3">{icon}</div>
      <div>
        <div className="text-muted text-uppercase small">{title}</div>
        <div className="fs-4 fw-bold">{value}</div>
      </div>
    </Card.Body>
  </Card>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard-data/`);
        setData(response.data);
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
        <p className="ms-3 mb-0">Cargando Dashboard...</p>
      </Container>
    );
  }

  if (error || !data) {
    return <Container fluid><Alert variant="danger">{error || 'No se recibieron datos.'}</Alert></Container>;
  }

  return (
    <Container fluid>
      {/* Fila de Tarjetas de Estadísticas */}
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <StatCard title="Total de Productos" value={data.total_products} icon={<FaBoxOpen className="text-primary"/>} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Ventas del Mes" value={`$${data.monthly_sales.toFixed(2)}`} icon={<FaChartLine className="text-success"/>} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Stock Bajo" value={data.low_stock_count} icon={<FaExclamationTriangle className="text-warning"/>} />
        </Col>
        <Col md={6} xl={3}>
           <StatCard title="Transferencias" value={data.total_transfers} icon={<FaExchangeAlt className="text-info"/>} />
        </Col>
      </Row>

      {/* Fila de Gráficos y Actividad */}
      <Row className="g-4">
        {/* Gráfico de Rendimiento de Ventas */}
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Rendimiento de Ventas (Últimos 6 meses)</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sales_performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="ventas" fill="#0d6efd" name="Ventas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Actividad Reciente */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header>Actividad Reciente</Card.Header>
            <ListGroup variant="flush">
              {data.recent_activity.length > 0 ? (
                data.recent_activity.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{item.movement_type.charAt(0).toUpperCase() + item.movement_type.slice(1)}</div>
                      <small className="text-muted">{item.product.name}</small>
                    </div>
                    <Badge bg="light" text="dark">{new Date(item.date).toLocaleDateString()}</Badge>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>No hay actividad reciente.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;