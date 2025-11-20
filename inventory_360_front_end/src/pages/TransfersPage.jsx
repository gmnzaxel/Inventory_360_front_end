import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSearch } from 'react-icons/fa';
import TransferModal from '../components/TransferModal';
import { CONTROL_PREFIX } from '../config/api';
import useDebouncedValue from '../hooks/useDebouncedValue';

const TransfersPage = () => {
  const { hasPermission } = useAuth();
  const canCreateTransfers = hasPermission('transferencias:execute');

  const [transfers, setTransfers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { movement_type: 'transfer', page, page_size: pageSize };
      const search = debouncedSearch.trim();
      if (search) params.search = search;
      const response = await api.get(`${CONTROL_PREFIX}/movements/`, { params });
      const { items, count } = extractListAndCount(response.data);
      setTransfers(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudieron cargar las transferencias.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleSuccess = () => {
    fetchTransfers();
    setError(null);
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
    if (transfers.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-5">
            {searchTerm ? `No se encontraron transferencias para "${searchTerm}"` : 'No hay transferencias registradas.'}
          </td>
        </tr>
      );
    }

    return transfers.map((item, index) => (
      <tr key={item.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <td className="ps-3 fw-bold">{item.product?.name || 'N/A'}</td>
        <td className="text-center">{item.quantity}</td>
        <td>{item.branch_from?.name || 'N/A'}</td>
        <td>{item.branch?.name || 'N/A'}</td>
        <td>{new Date(item.date).toLocaleString('es-ES')}</td>
        <td className="text-muted">{item.user || 'N/A'}</td>
      </tr>
    ));
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <Container fluid className="page-container">
        <Row className="align-items-center mb-4 animated-header">
          <Col><h2 className="h4 mb-0">Transferencias entre Sucursales</h2></Col>
          <Col xs="auto">
            {canCreateTransfers && (
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <FaPlus className="me-2" />Crear transferencia
              </Button>
            )}
          </Col>
        </Row>
        <Card className="shadow-sm animated-card">
          <Card.Header className="p-3">
            <Row>
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
                  <th className="text-center">Cantidad</th>
                  <th>Desde (Origen)</th>
                  <th>Hacia (Destino)</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
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
                <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                <span className="text-muted">Página {page} de {totalPages}</span>
                <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
      <TransferModal show={showModal} handleClose={() => setShowModal(false)} onSuccess={handleSuccess} />
    </>
  );
};

export default TransfersPage;
