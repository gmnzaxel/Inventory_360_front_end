import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import ProductModal from '../components/ProductModal';

const API_URL = 'http://localhost:8000/api/control';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products/`, {
        params: { search: searchTerm }
      });
      setProducts(response.data);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

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
      await axios.delete(`${API_URL}/products/${productToDelete.id}/`);
      closeDeleteModal();
      fetchProducts();
    } catch (err) {
      console.error("Error al eliminar el producto", err);
      alert('No se pudo eliminar el producto.');
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-5">
            <Spinner animation="border" />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="5">
            <Alert variant="danger" className="m-3">{error}</Alert>
          </td>
        </tr>
      );
    }

    if (products.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-5">
            {searchTerm ? `No se encontraron productos para "${searchTerm}"` : 'No hay productos para mostrar.'}
          </td>
        </tr>
      );
    }

    return products.map(product => (
      <tr key={product.id}>
        <td className="ps-3 fw-bold">{product.name}</td>
        <td>{product.category?.name || 'Sin categoría'}</td>
        <td className="text-end">${parseFloat(product.price).toFixed(2)}</td>
        <td className="text-center">
          <Badge pill bg={product.stock > 0 ? 'success' : 'danger'}>
            {product.stock > 0 ? product.stock : 'Sin Stock'}
          </Badge>
        </td>
        <td className="text-center">
          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(product)}>
            <FaEdit />
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => openDeleteModal(product)}>
            <FaTrash />
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <Container fluid>
        <Row className="align-items-center mb-4">
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
        <Card className="shadow-sm">
          <Card.Header className="p-3">
            <Row>
              <Col md={6} lg={4}>
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control 
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th>Categoría</th>
                  <th className="text-end">Precio</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {renderTableContent()}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <ProductModal 
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
        productToEdit={productToEdit}
      />

      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar el producto <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
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