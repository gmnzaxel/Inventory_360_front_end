import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { formatApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import CategoryModal from '../components/CategoryModal';
import { CONTROL_PREFIX } from '../config/api';

const CategoriesPage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${CONTROL_PREFIX}/categories/`, { params: { page, page_size: pageSize } });
      const { items, count } = extractListAndCount(response.data);
      setCategories(items);
      setTotalCount(count);
    } catch (err) {
      setError(formatApiError(err, 'No se pudieron cargar las categorias.'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSuccess = () => fetchCategories();

  const openModal = (category = null) => {
    setCategoryToEdit(category);
    setShowModal(true);
  };

  const openDeleteConfirmation = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setDeleteLoading(false);
  };

  const closeDeleteConfirmation = () => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
    setDeleteLoading(false);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`${CONTROL_PREFIX}/categories/${categoryToDelete.id}/`);
      closeDeleteConfirmation();
      handleSuccess();
    } catch (err) {
      setDeleteLoading(false);
      alert('No se pudo eliminar la categoria.');
    }
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="3" className="text-center py-5"><Spinner /></td></tr>;
    if (error) return <tr><td colSpan="3"><Alert variant="danger" className="m-3">{error}</Alert></td></tr>;
    if (categories.length === 0) return <tr><td colSpan="3" className="text-center py-5">No hay categorias creadas.</td></tr>;

    return categories.map((cat, index) => (
      <tr key={cat.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
        <td className="ps-3 fw-bold">{cat.name}</td>
        <td className="text-muted">{cat.description}</td>
        <td className="text-center">
          {isAdmin ? (
            <>
              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openModal(cat)}>
                <FaEdit />
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => openDeleteConfirmation(cat)}>
                <FaTrash />
              </Button>
            </>
          ) : (
            <span className="text-muted">-</span>
          )}
        </td>
      </tr>
    ));
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <Container fluid className="page-container">
        <Row className="align-items-center mb-4 animated-header">
          <Col><h2 className="h4 mb-0">Gestion de Categorias</h2></Col>
          {isAdmin && (
            <Col xs="auto"><Button variant="primary" onClick={() => openModal()}><FaPlus className="me-2" />Nueva Categoria</Button></Col>
          )}
        </Row>
        <Card className="shadow-sm animated-card">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 ps-3">Nombre</th>
                  <th>Descripcion</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">Tamano pagina:</span>
                <Form.Select size="sm" style={{ width: 'auto' }} value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value, 10) || 10); }}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </Form.Select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                <span className="text-muted">Pagina {page} de {totalPages}</span>
                <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <CategoryModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        categoryToEdit={categoryToEdit}
      />

      <Modal show={showDeleteModal} onHide={closeDeleteConfirmation} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Estas seguro de que quieres eliminar la categoria <strong>{categoryToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteConfirmation}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner as="span" size="sm" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CategoriesPage;
