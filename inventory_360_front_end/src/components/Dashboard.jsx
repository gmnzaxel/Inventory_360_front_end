import React from 'react';
import { Card, Row, Col, Table, Image } from 'react-bootstrap';
import { FaBoxes, FaChartLine, FaArrowDown, FaExchangeAlt, FaUtensils, FaLaptop, FaTshirt } from 'react-icons/fa';
import './Dashboard.css';

// ... (StatCard y PieChart no cambian)
const StatCard = ({ icon, title, value, variant }) => ( <Card className={`stat-card border-start-${variant}`}> <Card.Body> <Row className="align-items-center"> <Col> <h5 className={`text-${variant} text-uppercase mb-1`}>{title}</h5> <h2 className="mb-0">{value}</h2> </Col> <Col xs="auto" className="icon-col"> {icon} </Col> </Row> </Card.Body> </Card> );
const PieChart = () => ( <div className="d-flex align-items-center"> <svg viewBox="0 0 32 32" className="pie-chart"> <circle r="16" cx="16" cy="16" className="pie-slice" style={{'--offset': 0, '--value': 50, '--color': '#0d6efd'}} /> <circle r="16" cx="16" cy="16" className="pie-slice" style={{'--offset': -50, '--value': 30, '--color': '#198754'}}/> <circle r="16" cx="16" cy="16" className="pie-slice" style={{'--offset': -80, '--value': 20, '--color': '#ffc107'}}/> </svg> <div className="pie-chart-legend ms-4"> <div><FaLaptop className="me-2" style={{color: '#0d6efd'}} /> Electrónica (50%)</div> <div><FaTshirt className="me-2" style={{color: '#198754'}} /> Ropa (30%)</div> <div><FaUtensils className="me-2" style={{color: '#ffc107'}}/> Hogar (20%)</div> </div> </div> );

// --- NUEVO COMPONENTE PARA EL GRÁFICO DE BARRAS ---
const BarChart = () => {
  const salesData = [
    { month: 'Ene', sales: 6500 },
    { month: 'Feb', sales: 5900 },
    { month: 'Mar', sales: 8000 },
    { month: 'Abr', sales: 8100 },
    { month: 'May', sales: 5600 },
    { month: 'Jun', sales: 9500 },
  ];
  const maxSales = 15000; // El valor máximo para la escala del eje Y

  return (
    <div className="bar-chart-container">
      <div className="y-axis">
        <span>${maxSales / 1000}K</span>
        <span>${(maxSales * 2/3) / 1000}K</span>
        <span>${(maxSales * 1/3) / 1000}K</span>
        <span>$0K</span>
      </div>
      <div className="x-axis">
        {salesData.map(data => (
          <div key={data.month} className="bar-wrapper">
            <div className="bar-tooltip">${data.sales.toLocaleString()}</div>
            <div 
              className="bar" 
              style={{ height: `${(data.sales / maxSales) * 100}%` }}
            ></div>
            <span className="bar-label">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const Dashboard = () => {
  const topProducts = [
    { id: 1, name: 'Laptop Pro X1', sales: 120, image: 'https://placehold.co/50x50/0d6efd/white?text=LPX' },
    { id: 2, name: 'Smartphone G-Plus', sales: 98, image: 'https://placehold.co/50x50/198754/white?text=SGP' },
    { id: 3, name: 'Auriculares SoundWave', sales: 75, image: 'https://placehold.co/50x50/ffc107/white?text=ASW' },
    { id: 4, name: 'Teclado Mecánico K-Switch', sales: 62, image: 'https://placehold.co/50x50/dc3545/white?text=TMK' },
  ];

  return (
    <>
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3"><StatCard icon={<FaBoxes size={32} />} title="Total de Productos" value="1,245" variant="primary" /></Col>
        <Col md={6} lg={3} className="mb-3"><StatCard icon={<FaChartLine size={32} />} title="Ventas del Mes" value="$8,520" variant="success" /></Col>
        <Col md={6} lg={3} className="mb-3"><StatCard icon={<FaArrowDown size={32} />} title="Stock Bajo" value="15" variant="warning" /></Col>
        <Col md={6} lg={3} className="mb-3"><StatCard icon={<FaExchangeAlt size={32} />} title="Transferencias" value="3" variant="info" /></Col>
      </Row>
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h5 className="card-title">Rendimiento de Ventas</h5>
              <p className="card-subtitle mb-2 text-muted">Últimos 6 meses</p>
              {/* Reemplazamos el placeholder con nuestro nuevo componente de gráfico */}
              <div className="mt-4">
                <BarChart />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body><h5 className="card-title">Actividad Reciente</h5><ul className="list-group list-group-flush"><li className="list-group-item d-flex justify-content-between align-items-center"><div><strong className="d-block">Venta #5821</strong><small className="text-muted">Producto: Laptop Pro X1</small></div><span className="badge bg-success-soft text-success">Completado</span></li><li className="list-group-item d-flex justify-content-between align-items-center"><div><strong className="d-block">Transferencia #T045</strong><small className="text-muted">De Almacén 1 a Almacén 2</small></div><span className="badge bg-info-soft text-info">Enviado</span></li><li className="list-group-item d-flex justify-content-between align-items-center"><div><strong className="d-block">Nuevo Producto</strong><small className="text-muted">Añadido: Teclado Mecánico</small></div><span className="badge bg-primary-soft text-primary">Añadido</span></li><li className="list-group-item d-flex justify-content-between align-items-center"><div><strong className="d-block">Alerta de Stock</strong><small className="text-muted">Producto: Mouse Gamer</small></div><span className="badge bg-warning-soft text-warning">Stock Bajo</span></li></ul></Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={7} className="mb-4"><Card className="h-100 shadow-sm"><Card.Body><h5 className="card-title">Productos Más Vendidos</h5><p className="card-subtitle mb-2 text-muted">Este mes</p><Table hover responsive className="mt-3"><thead><tr><th>Producto</th><th className="text-end">Ventas</th></tr></thead><tbody>{topProducts.map(product => (<tr key={product.id}><td><div className="d-flex align-items-center"><Image src={product.image} roundedCircle width="40" height="40" className="me-3" /><span>{product.name}</span></div></td><td className="text-end fw-bold">{product.sales}</td></tr>))}</tbody></Table></Card.Body></Card></Col>
        <Col lg={5} className="mb-4"><Card className="h-100 shadow-sm"><Card.Body><h5 className="card-title">Ventas por Categoría</h5><p className="card-subtitle mb-4 text-muted">Ingresos del mes</p><PieChart /></Card.Body></Card></Col>
      </Row>
    </>
  );
};

export default Dashboard;
