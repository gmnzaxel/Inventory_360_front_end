import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaCalendar, FaDownload } from 'react-icons/fa';
import MovementModal from '../components/MovementModal';
import MovementDetailModal from '../components/MovementDetailModal';
import { CONTROL_PREFIX } from '../config/api';
import { useAuth } from '../context/AuthContext';
import useDebouncedValue from '../hooks/useDebouncedValue';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState(null);

  const [selectedMovement, setSelectedMovement] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState(null);
  const { hasPermission } = useAuth();
  const canManageSales = hasPermission('ventas:execute');

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { movement_type: 'sale', page, page_size: pageSize };
      const search = debouncedSearch.trim();
      if (search) params.search = search;
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      const response = await api.get(`${CONTROL_PREFIX}/movements/`, { params });
      const { items, count } = extractListAndCount(response.data);
      setSales(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo cargar el historial de ventas.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, startDate, endDate, page, pageSize]);
  
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleSuccess = () => {
    fetchSales();
  };

  const handleShowCreateModal = () => {
    setMovementToEdit(null);
    setShowCreateEditModal(true);
  };

  const handleShowEditModal = (movement) => {
    setMovementToEdit(movement);
    setShowCreateEditModal(true);
  };

  const handleShowDetails = (movement) => {
    setSelectedMovement(movement);
  };

  const handleCloseDetails = () => {
    setSelectedMovement(null);
  };

  const applyRange = (start, end) => {
    setPage(1);
    setStartDate(start);
    setEndDate(end);
  };

  const openDeleteModal = (movement) => {
    setMovementToDelete(movement);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setMovementToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!movementToDelete) return;
    try {
      await api.delete(`${CONTROL_PREFIX}/movements/${movementToDelete.id}/`);
      closeDeleteModal();
      fetchSales();
    } catch (err) {
      const apiError = parseApiError(err, 'No se pudo eliminar la venta.');
      setError(apiError);
    }
  };

  const handleExport = async () => {
    try {
      const params = { movement_type: 'sale' };
      const search = searchTerm.trim();
      if (search) params.search = search;
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      const response = await api.get(`${CONTROL_PREFIX}/movements/export/`, { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const parts = ['ventas', startDate ? `desde-${startDate}` : '', endDate ? `hasta-${endDate}` : ''].filter(Boolean);
      link.download = parts.join('_') + '.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('No se pudo exportar ventas.');
    }
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="6" className="text-center py-5"><Spinner /></td></tr>;
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
    if (sales.length === 0) return <tr><td colSpan="6" className="text-center py-5">No se encontraron ventas.</td></tr>;

    return sales.map((sale, index) => {
      const quantity = Math.abs(Number(sale.quantity) || 0);
      const total = parseFloat((sale.unit_price || 0) * quantity).toFixed(2);

      return (
        <tr key={sale.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <td className="ps-3 fw-bold">{sale.product?.name}</td>
          <td className="text-center fw-semibold">{quantity}</td>
          <td>{new Date(sale.date).toLocaleDateString()}</td>
          <td className="text-end">${total}</td>
          <td className="text-center"><Badge pill bg="primary">Completada</Badge></td>
          <td className="text-center">
            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleShowDetails(sale)}><FaEye /></Button>
            {canManageSales && (
              <>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(sale)}><FaEdit /></Button>
                <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(sale)}><FaTrash /></Button>
              </>
            )}
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
          <Col><h2 className="h4 mb-0">Historial de Ventas</h2></Col>
          <Col xs="auto" className="d-flex gap-2">
            <Button variant="outline-primary" onClick={handleExport} title="Exportar CSV">
              <FaDownload />
            </Button>
            {canManageSales && (
              <Button variant="primary" onClick={handleShowCreateModal}>
                <FaPlus className="me-2" />
                Nueva venta
              </Button>
            )}
          </Col>
        </Row>
        <Card className="shadow-sm animated-card">
          <Card.Header className="p-3">
            <Row className="g-3 align-items-center">
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
              <Col md={6} lg={4}>
                <InputGroup>
                  <InputGroup.Text><FaCalendar /></InputGroup.Text>
                  <Form.Control type="date" value={startDate} onChange={(e) => { setPage(1); setStartDate(e.target.value); }} />
                  <Form.Control type="date" value={endDate} onChange={(e) => { setPage(1); setEndDate(e.target.value); }} />
                </InputGroup>
              </Col>
              <Col md={12} className="d-flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    applyRange(today, today);
                  }}
                >
                  Hoy
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const endValue = new Date();
                    const startValue = new Date(endValue);
                    startValue.setDate(startValue.getDate() - 6);
                    applyRange(startValue.toISOString().slice(0, 10), endValue.toISOString().slice(0, 10));
                  }}
                >
                  Últimos 7 dias
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const endValue = new Date();
                    const startValue = new Date(endValue.getFullYear(), endValue.getMonth(), 1);
                    applyRange(startValue.toISOString().slice(0, 10), endValue.toISOString().slice(0, 10));
                  }}
                >
                  Este mes
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const endValue = new Date();
                    const startValue = new Date(endValue.getFullYear(), 0, 1);
                    applyRange(startValue.toISOString().slice(0, 10), endValue.toISOString().slice(0, 10));
                  }}
                >
                  Este año
                </Button>
                <Button size="sm" variant="outline-secondary" onClick={() => applyRange('', '')}>Limpiar</Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 ps-3">Producto</th>
                  <th className="text-center">Cantidad</th>
                  <th>Fecha</th>
                  <th className="text-end">Monto Total</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">tamaño página:</span>
                <Form.Select size="sm" style={{ width: 'auto' }} value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <span className="text-muted">Página {page} de {totalPages}</span>
                <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <MovementModal
        show={showCreateEditModal}
        handleClose={() => setShowCreateEditModal(false)}
        movementType="sale"
        onSuccess={handleSuccess}
        movementToEdit={movementToEdit}
      />

      <MovementDetailModal
        show={!!selectedMovement}
        handleClose={handleCloseDetails}
        movement={selectedMovement}
      />

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Estas seguro de que quieres eliminar esta venta del producto <strong>{movementToDelete?.product?.name}</strong>? Esta accion no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={!canManageSales}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SalesPage;







