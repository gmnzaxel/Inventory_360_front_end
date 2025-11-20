import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { Container, Row, Col, Card, Table, Badge, Form, InputGroup, Spinner, Alert, Button } from 'react-bootstrap';
import { FaSearch, FaFilter, FaDownload, FaCalendar } from 'react-icons/fa';
import { CONTROL_PREFIX } from '../config/api';
import useDebouncedValue from '../hooks/useDebouncedValue';

const quickRanges = [
  {
    label: 'Hoy',
    compute: () => {
      const today = new Date();
      const value = today.toISOString().slice(0, 10);
      return { start: value, end: value };
    },
  },
  {
    label: 'Últimos 7 dias',
    compute: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    },
  },
  {
    label: 'Este mes',
    compute: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    },
  },
  {
    label: 'Este año',
    compute: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    },
  },
];

const MovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [groupBy, setGroupBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pageSize };
      const search = debouncedSearch.trim();
      if (search) params.search = search;
      if (movementTypeFilter) params.movement_type = movementTypeFilter;
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const response = await api.get(`${CONTROL_PREFIX}/movements/`, { params });
      const { items, count } = extractListAndCount(response.data);
      setMovements(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo cargar el historial de movimientos.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, movementTypeFilter, page, pageSize, startDate, endDate]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const getMovementTypeInfo = (type) => {
    switch (type?.toLowerCase()) {
      case 'sale':
        return { variant: 'primary', text: 'Venta' };
      case 'purchase':
        return { variant: 'success', text: 'Compra' };
      case 'transfer':
        return { variant: 'info', text: 'Transferencia' };
      case 'adjustment':
        return { variant: 'warning', text: 'Ajuste' };
      default:
        return { variant: 'secondary', text: 'Desconocido' };
    }
  };

  const handleExport = async () => {
    try {
      const params = {};
      const search = searchTerm.trim();
      if (search) params.search = search;
      if (movementTypeFilter) params.movement_type = movementTypeFilter;
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      if (groupBy) params.group_by = groupBy;

      const response = await api.get(`${CONTROL_PREFIX}/movements/export/`, {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const parts = [
        'movimientos',
        groupBy || 'detalle',
        startDate ? `desde-${startDate}` : '',
        endDate ? `hasta-${endDate}` : '',
        movementTypeFilter || '',
      ].filter(Boolean);
      link.download = parts.join('_') + '.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(parseApiError(err, 'No se pudo exportar el archivo.'));
    }
  };

  const applyQuickRange = (computeRange) => {
    const { start, end } = computeRange();
    setPage(1);
    setStartDate(start);
    setEndDate(end);
  };

  const clearFilters = () => {
    setPage(1);
    setStartDate('');
    setEndDate('');
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
    if (movements.length === 0) return <tr><td colSpan="6" className="text-center py-5">No se encontraron movimientos con los filtros aplicados.</td></tr>;

    return movements.map((movement, index) => {
      const typeInfo = getMovementTypeInfo(movement.movement_type);
      return (
        <tr key={movement.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <td className="ps-3">
            <Badge pill bg={typeInfo.variant}>{typeInfo.text}</Badge>
          </td>
          <td className="fw-bold">{movement.product?.name || 'N/A'}</td>
          <td>{movement.branch?.name || 'N/A'}</td>
          <td className={`text-center fw-bold ${movement.quantity < 0 ? 'text-danger' : 'text-success'}`}>
            {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
          </td>
          <td>{new Date(movement.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
          <td className="text-muted">{movement.user || 'N/A'}</td>
        </tr>
      );
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Container fluid className="page-container">
      <Row className="align-items-center mb-4 animated-header">
        <Col>
          <h2 className="h4 mb-0">Historial de Movimientos</h2>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Form.Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Detalle</option>
            <option value="day">Diario</option>
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </Form.Select>
          <Button variant="primary" onClick={handleExport} title="Exportar CSV">
            <FaDownload />
          </Button>
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
            <Col md={6} lg={3}>
              <InputGroup>
                <InputGroup.Text><FaFilter /></InputGroup.Text>
                <Form.Select
                  value={movementTypeFilter}
                  onChange={(e) => { setPage(1); setMovementTypeFilter(e.target.value); }}
                >
                  <option value="">Todos los tipos</option>
                  <option value="sale">Venta</option>
                  <option value="purchase">Compra</option>
                  <option value="transfer">Transferencia</option>
                  <option value="adjustment">Ajuste</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={6} lg={3}>
              <InputGroup>
                <InputGroup.Text><FaCalendar /></InputGroup.Text>
                <Form.Control type="date" value={startDate} onChange={(e) => { setPage(1); setStartDate(e.target.value); }} />
                <Form.Control type="date" value={endDate} onChange={(e) => { setPage(1); setEndDate(e.target.value); }} />
              </InputGroup>
            </Col>
            <Col md={12} className="d-flex flex-wrap gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => applyQuickRange(range.compute)}
                >
                  {range.label}
                </Button>
              ))}
              <Button size="sm" variant="outline-secondary" onClick={clearFilters}>Limpiar</Button>
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
              </tr>
            </thead>
            <tbody>{renderTableContent()}</tbody>
          </Table>
          <div className="d-flex justify-content-between align-items-center p-3">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Tamaño página:</span>
              <Form.Select size="sm" style={{ width: 'auto' }} value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </Form.Select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
              <span className="text-muted">Página {page} de {totalPages}</span>
              <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MovementsPage;
