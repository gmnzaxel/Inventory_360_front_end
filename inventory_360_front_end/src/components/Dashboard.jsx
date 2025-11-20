import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { CONTROL_PREFIX } from '../config/api';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Table, Button } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  FaBoxOpen,
  FaChartLine,
  FaExclamationTriangle,
  FaReceipt,
  FaArrowUp,
  FaArrowDown,
  FaWrench,
  FaExchangeAlt
} from 'react-icons/fa';
import './Dashboard.css';

const StatCard = ({ title, value, icon }) => (
  <Card className="h-100 dashboard-card">
    <Card.Body className="d-flex align-items-center">
      <div className="fs-3 me-3">{icon}</div>
      <div>
        <div className="text-muted text-uppercase small">{title}</div>
        <div className="fs-4 fw-bold">{value}</div>
      </div>
    </Card.Body>
  </Card>
);

const movementConfig = {
  sale: { icon: FaArrowDown, color: 'danger', text: 'Venta' },
  purchase: { icon: FaArrowUp, color: 'success', text: 'Compra' },
  transfer: { icon: FaExchangeAlt, color: 'info', text: 'Transferencia' },
  adjustment: { icon: FaWrench, color: 'secondary', text: 'Ajuste' },
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingLowStock, setExportingLowStock] = useState(false);
  const [lowStockExportError, setLowStockExportError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get(`${CONTROL_PREFIX}/dashboard-data/`);
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

  const handleDownloadLowStock = async () => {
    if (!data || !data.low_stock_items) return;
    setLowStockExportError('');
    setExportingLowStock(true);
    try {
      const response = await api.get(`${CONTROL_PREFIX}/stocks/low-stock-export/`, {
        responseType: 'blob',
      });
      
      // Verificar el status code primero
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Error del servidor: ${response.status}`);
      }
      
      // Verificar si la respuesta es un error (cuando responseType es 'blob', los errores también vienen como blob)
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
      
      // Si el content-type es JSON, es probable que sea un error
      if (contentType.includes('application/json')) {
        // Es un error JSON, leerlo como texto
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(response.data);
        });
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.detail || errorData.message || 'Error al descargar el archivo');
        } catch (parseErr) {
          throw new Error('Error al procesar la respuesta del servidor');
        }
      }
      
      // Verificar que el blob no esté vacío
      if (!response.data || response.data.size === 0) {
        throw new Error('El archivo descargado está vacío');
      }
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock_bajo_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      let errorMessage = 'No se pudo descargar el detalle de stock bajo.';
      
      // Si el error tiene response.data como Blob (error HTTP con responseType blob)
      if (err.response?.data instanceof Blob) {
        try {
          const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(err.response.data);
          });
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorData.message || errorData.error?.message || errorMessage;
          } catch (parseErr) {
            // Si no se puede parsear, usar el status code
            if (err.response?.status) {
              if (err.response.status === 404) {
                errorMessage = 'El endpoint no fue encontrado. Verifique la configuración del servidor.';
              } else if (err.response.status === 403) {
                errorMessage = 'No tiene permisos para descargar este archivo.';
              } else if (err.response.status === 401) {
                errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
              } else {
                errorMessage = `Error ${err.response.status}: ${errorMessage}`;
              }
            }
          }
        } catch (readErr) {
          // Si no se puede leer el blob, usar el status code
          if (err.response?.status) {
            errorMessage = `Error ${err.response.status}: ${errorMessage}`;
          }
        }
      } else if (err.response?.data) {
        // Si el error no es un blob, intentar leer el mensaje directamente
        if (typeof err.response.data === 'object') {
          errorMessage = err.response.data.detail || err.response.data.message || errorMessage;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status) {
        errorMessage = `Error ${err.response.status}: ${errorMessage}`;
      }
      
      setLowStockExportError(errorMessage);
      console.error('Error al descargar stock bajo:', {
        error: err,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: `${CONTROL_PREFIX}/stocks/download-low-stock/`,
      });
    } finally {
      setExportingLowStock(false);
    }
  };

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
    <Container fluid className="dashboard-container">
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <StatCard title="Total de Productos" value={data.total_products} icon={<FaBoxOpen className="text-primary" />} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Ventas del Mes" value={`$${data.monthly_sales.toFixed(2)}`} icon={<FaChartLine className="text-success" />} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Stock Bajo" value={data.low_stock_count} icon={<FaExclamationTriangle className="text-warning" />} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="N° de Ventas" value={data.monthly_sales_count} icon={<FaReceipt className="text-info" />} />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="h-100 dashboard-card">
            <Card.Header className="card-header-custom">Rendimiento de Ventas (Ultimos 6 meses)</Card.Header>
            <Card.Body>
              <div className="sales-chart-scroll">
                <div className="sales-chart-inner">
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
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100 dashboard-card">
            <Card.Header className="card-header-custom">Actividad Reciente</Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {data.recent_activity.length > 0 ? (
                  data.recent_activity.map(item => {
                    const config = movementConfig[item.movement_type] || movementConfig.adjustment;
                    const IconComponent = config.icon;
                    return (
                      <ListGroup.Item key={item.id} className="d-flex align-items-center px-3 py-3 activity-item">
                        <div className={`bg-${config.color}-subtle text-${config.color} rounded-circle d-flex align-items-center justify-content-center me-3 icon-circle`} >
                          <IconComponent />
                        </div>
                        <div className="flex-grow-1">
                          <div className="text-dark fw-bold">{config.text} de <strong>{item.product.name}</strong></div>
                          <small className="text-muted">Cantidad: {Math.abs(item.quantity)}</small>
                        </div>
                        <div className="text-muted small ms-3 date-text">
                          {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                      </ListGroup.Item>
                    );
                  })
                ) : (
                  <div className="text-center text-muted p-5">
                    No hay actividad reciente.
                  </div>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-2">
        <Col>
          <Card className="dashboard-card">
            <Card.Header className="card-header-custom d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 className="mb-0 d-flex align-items-center">
                <FaExclamationTriangle className="text-warning me-2" />
                Productos con Stock Bajo
              </h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownloadLowStock}
                disabled={exportingLowStock || !data.low_stock_items?.length}
              >
                {exportingLowStock ? 'Descargando...' : 'Descargar Excel'}
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              {lowStockExportError && (
                <Alert variant="danger" className="m-3 py-2">
                  {lowStockExportError}
                </Alert>
              )}
              {data.low_stock_items.length > 0 ? (
                <Table responsive hover className="mb-0 dashboard-table">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Producto</th>
                      <th>Sucursal</th>
                      <th className="text-center">Stock Actual</th>
                      <th className="text-center">Stock Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.low_stock_items.map(item => (
                      <tr key={item.id}>
                        <td className="ps-3 fw-bold">{item.product.name}</td>
                        <td>{item.branch.name}</td>
                        <td className="text-center text-danger fw-bold">{item.quantity}</td>
                        <td className="text-center">{item.minimum_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted">
                  Excelente! No hay productos con stock bajo.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

