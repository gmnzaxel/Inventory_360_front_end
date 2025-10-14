import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { extractListAndCount } from '../utils/apiHelpers';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import ProductModal from '../components/ProductModal';
import { useAuth } from '../context/AuthContext';
import { CONTROL_PREFIX } from '../config/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const showActions = true;
  const columnCount = showActions ? 5 : 4;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        include_all: isAdmin ? 'true' : 'false',
      };
      if (searchTerm) params.search = searchTerm;
      const response = await api.get(`${CONTROL_PREFIX}/products/`, { params });
      const { items, count } = extractListAndCount(response.data);
      setProducts(items);
      setTotalCount(count);
    } catch (err) {
      setError(parseApiError(err, 'No se pudieron cargar los productos.'));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, pageSize, isAdmin]);

  useEffect(() => {
    setLoading(true);
    const timerId = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [fetchProducts]);

  const handleSuccess = () => {
    fetchProducts();
  };

  const openEditModal = (product) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`${CONTROL_PREFIX}/products/${productToDelete.id}/`);
      closeDeleteModal();
      fetchProducts();
    } catch (err) {
      console.error("Error al eliminar el producto", err);
      setError(parseApiError(err, 'No se pudo eliminar el producto.'));
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={columnCount} className="text-center py-5">
            <Spinner animation="border" />
          </td>
        </tr>
      );
    }

    if (error) {
      const details = typeof error === 'string' ? { title: 'Error', message: error } : error;
      return (
        <tr>
          <td colSpan={columnCount}>
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

    if (products.length === 0) {
      return (
        <tr>
          <td colSpan={columnCount} className="text-center py-5">
            {searchTerm ? `No se encontraron productos para "${searchTerm}"` : 'No hay productos para mostrar.'}
          </td>
        </tr>
      );
    }

    return products.map((product, index) => {
      let stockBadgeVariant = 'success';
      if (product.stock <= 0) {
        stockBadgeVariant = 'danger';
      } else if (product.stock <= product.minimum_stock) {
        stockBadgeVariant = 'warning';
      }
      return (
        <tr key={product.id} className="animated-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <td className="ps-3 fw-bold">{product.name}</td>
          <td>{product.category?.name || 'Sin categoria'}</td>
          <td className="text-center">
            <Badge pill bg={stockBadgeVariant}>
              {product.stock}
            </Badge>
          </td>
          <td className="text-center">{product.minimum_stock}</td>
          {showActions && (
            <td className="text-center">
              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(product)}>
                <FaEdit />
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(product)}>
                <FaTrash />
              </Button>
            </td>
          )}
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
            <h2 className="h4 mb-0">Gestión de Productos</h2>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={() => openEditModal(null)}>
              <FaPlus className="me-2" />
              Añadir Producto
            </Button>
          </Col>
        </Row>
        <Card className="shadow-sm animated-card">
          <Card.Header className="p-3">
            <Row>
              <Col md={6} lg={4}>
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control 
                    placeholder="Buscar por nombre..."
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
                <th>Categoria</th>
                <th className="text-center">Stock Actual</th>
                <th className="text-center">Stock Mínimo</th>
                {showActions && <th className="text-center">Acciones</th>}
              </tr>
              </thead>
              <tbody>
                {renderTableContent()}
              </tbody>
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
                <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <span className="text-muted">Página {page} de {totalPages}</span>
                <Button variant="outline-secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <ProductModal 
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
        productToEdit={productToEdit}
        existingProducts={products}
      />

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Estas seguro de que quieres eliminar el producto <strong>{productToDelete?.name}</strong>? Esta accion no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductsPage;







