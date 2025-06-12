// src/components/Dashboard.jsx
import React from 'react';
import { Card, Row, Col, ProgressBar, Table, Image } from 'react-bootstrap';
import { FaBoxes, FaChartLine, FaArrowDown, FaExchangeAlt, FaUtensils, FaLaptop, FaTshirt } from 'react-icons/fa';
import './Dashboard.css';

// Componente reutilizable para las tarjetas de estadísticas
const StatCard = ({ icon, title, value, variant }) => (
  <Card className={`stat-card bg-${variant} text-white`}>
    <Card.Body className="d-flex align-items-center justify-content-between">
      <div className="icon-container">
        {icon}
      </div>
      <div className="text-end">
        <h5>{title}</h5>
        <h2>{value}</h2>
      </div>
    </Card.Body>
  </Card>
);

// Componente para el gráfico de torta (Pie Chart)
const PieChart = () => (
    <div className="d-flex align-items-center">
        <svg viewBox="0 0 32 32" className="pie-chart">
            <circle r="16" cx="16" cy="16" className="pie-slice" style={{'--offset': 0, '--value': 50, '--color': '#0d6efd'}} />
            <circle r="16" cx="16" cy="16" className="pie-slice" style={{'--offset': -50, '--value': 30, '--color': '#198754'}}/>
            <circle r="16" cx="16" cy="16" className="pie-slice" style={{'--offset': -80, '--value': 20, '--color': '#ffc107'}}/>
        </svg>
        <div className="pie-chart-legend ms-4">
            <div><FaLaptop className="me-2" style={{color: '#0d6efd'}} /> Electrónica (50%)</div>
            <div><FaTshirt className="me-2" style={{color: '#198754'}} /> Ropa (30%)</div>
            <div><FaUtensils className="me-2" style={{color: '#ffc107'}}/> Hogar (20%)</div>
        </div>
    </div>
);

const Dashboard = () => {
  const topProducts = [
    { id: 1, name: 'Laptop Pro X1', sales: 120, image: 'https://placehold.co/50x50/0d6efd/white?text=LPX' },
    { id: 2, name: 'Smartphone G-Plus', sales: 98, image: 'https://placehold.co/50x50/198754/white?text=SGP' },
    { id: 3, name: 'Auriculares SoundWave', sales: 75, image: 'https://placehold.co/50x50/ffc107/white?text=ASW' },
    { id: 4, name: 'Teclado Mecánico K-Switch', sales: 62, image: 'https://placehold.co/50x50/dc3545/white?text=TMK' },
  ];

  return (
    <div className="p-4 dashboard-container">
      {/* --- Encabezado de Bienvenida --- */}
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="mb-0">Dashboard</h2>
          <p className="text-muted">Bienvenido de nuevo, Admin.</p>
        </Col>
      </Row>

      {/* --- Tarjetas de Estadísticas --- */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <StatCard icon={<FaBoxes size={32} />} title="Total de Productos" value="1,245" variant="primary" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard icon={<FaChartLine size={32} />} title="Ventas del Mes" value="$8,520" variant="success" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard icon={<FaArrowDown size={32} />} title="Stock Bajo" value="15" variant="warning" />
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <StatCard icon={<FaExchangeAlt size={32} />} title="Transferencias" value="3" variant="info" />
        </Col>
      </Row>

      {/* --- Área de Contenido Principal --- */}
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title">Rendimiento de Ventas</h5>
              <p className="card-subtitle mb-2 text-muted">Últimos 6 meses</p>
              <div className="chart-placeholder d-flex align-items-end justify-content-around mt-4" style={{ height: '250px', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                <ProgressBar now={45} label="Ene" className="h-100" />
                <ProgressBar now={60} label="Feb" className="h-100" />
                <ProgressBar now={75} label="Mar" className="h-100" />
                <ProgressBar now={50} label="Abr" className="h-100" />
                <ProgressBar now={85} label="May" className="h-100" />
                <ProgressBar now={95} label="Jun" className="h-100" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title">Actividad Reciente</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block">Venta #5821</strong>
                    <small className="text-muted">Producto: Laptop Pro X1</small>
                  </div>
                  <span className="badge bg-success-soft text-success">Completado</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block">Transferencia #T045</strong>
                    <small className="text-muted">De Almacén 1 a Almacén 2</small>
                  </div>
                  <span className="badge bg-info-soft text-info">Enviado</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block">Nuevo Producto</strong>
                    <small className="text-muted">Añadido: Teclado Mecánico</small>
                  </div>
                  <span className="badge bg-primary-soft text-primary">Añadido</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block">Alerta de Stock</strong>
                    <small className="text-muted">Producto: Mouse Gamer</small>
                  </div>
                  <span className="badge bg-warning-soft text-warning">Stock Bajo</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- NUEVA FILA CON MÁS DETALLES --- */}
      <Row>
        {/* --- Productos Más Vendidos --- */}
        <Col lg={7} className="mb-4">
            <Card className="h-100 shadow-sm">
                <Card.Body>
                    <h5 className="card-title">Productos Más Vendidos</h5>
                    <p className="card-subtitle mb-2 text-muted">Este mes</p>
                    <Table hover responsive className="mt-3">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th className="text-end">Ventas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <Image src={product.image} roundedCircle width="40" height="40" className="me-3" />
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-end fw-bold">{product.sales}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Col>

        {/* --- Ventas por Categoría --- */}
        <Col lg={5} className="mb-4">
            <Card className="h-100 shadow-sm">
                <Card.Body>
                    <h5 className="card-title">Ventas por Categoría</h5>
                    <p className="card-subtitle mb-4 text-muted">Ingresos del mes</p>
                    <PieChart />
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
