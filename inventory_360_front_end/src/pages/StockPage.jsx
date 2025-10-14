import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Image, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaWrench } from 'react-icons/fa';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import { CONTROL_PREFIX } from '../config/api';

const StockPage = () => {
  const { hasPermission } = useAuth();
  const canAdjustStock = hasPermission('ajustes:execute');

  const [stockItems, setStockItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize };
      if (searchTerm) params.search = searchTerm;
      const response = await api.get(`${CONTROL_PREFIX}/stocks/`, { params });
      const { items, count } = extractListAndCount(response.data);
      setStockItems(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo cargar el inventario.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleShowAdjustmentModal = (item) => {
    if (!canAdjustStock) return;
    setSelectedStockItem(item);
    setShowAdjustmentModal(true);
  };

  const handleCloseAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setSelectedStockItem(null);
  };

  const handleSuccess = () => {
    fetchStock();
    setError(null);
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { variant: 'danger', text: 'Sin stock' };
    if (item.is_low_stock) return { variant: 'warning', text: 'Bajo stock' };
    return { variant: 'success', text: 'OK' };
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-5"><Spinner /></td>
        </tr>
      );
    }

    if (error) {
      const details = typeof error === 'string' ? { title: 'Error', message: error } : error;
      return (
        <tr>
          <td colSpan="6">
            <Alert variant="danger" className="m-3">
              <div className="fw-semibold">{details.title || 'Error'}</div>
              <div>{details.message}</div>
              {details.requestId && (
                <div className="small text-muted">ID de seguimiento: {details.requestId}</div>
              )}
            </Alert>
          </td>
        </tr>
      );
    }

    if (stockItems.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-5">No hay registros de stock para mostrar.</td>
        </tr>
      );
    }

    return stockItems.map((item, index) => {
      const status = getStockStatus(item);
      return (
        <tr key={item.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <td className="ps-3">
            <div className="d-flex align-items-center">
              <Image
                src={item.product?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.product?.name || 'Producto')}&background=random`}
                roundedCircle
                width="40"
                height="40"
                className="me-3"
              />
              <span className="fw-bold">{item.product?.name || 'Producto no encontrado'}</span>
            </div>
          </td>
          <td>{item.branch?.name || 'Sucursal no encontrada'}</td>
          <td className="text-center">{item.quantity}</td>
          <td className="text-center">{item.minimum_stock}</td>
          <td className="text-center">
            <Badge pill bg={status.variant}>{status.text}</Badge>
          </td>
          <td className="text-center">
            <Button
              variant="outline-primary"
              size="sm"
              title="Ajustar stock"
              disabled={!canAdjustStock}
              onClick={() => handleShowAdjustmentModal(item)}
            >
              <FaWrench />
            </Button>
          </td>
        </tr>
      );
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <Container fluid className="page-container">
        <Row className="align-items-center mb-4 animated-header">
          <Col>
            <h2 className="h4 mb-0">Control de Stock</h2>
          </Col>
        </Row>

        <Card className="shadow-sm animated-card">
          <Card.Header className="p-3">
            <Row className="align-items-center gy-3">
              <Col md={6} lg={4}>
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por producto..."
                    value={searchTerm}
                    onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
                  />
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
                  <th className="text-center">Cantidad actual</th>
                  <th className="text-center">Stock mínimo</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">tamaño página:</span>
                <Form.Select
                  size="sm"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Anterior
                </Button>
                <span className="text-muted">Página {page} de {totalPages}</span>
                <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <StockAdjustmentModal
        show={showAdjustmentModal}
        handleClose={handleCloseAdjustmentModal}
        onSuccess={handleSuccess}
        stockItem={selectedStockItem}
      />
    </>
  );
};

export default StockPage;
