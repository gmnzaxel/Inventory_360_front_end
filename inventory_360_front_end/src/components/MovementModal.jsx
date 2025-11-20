import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { validatePositiveNumber } from '../utils/validation';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';
import { useAuth } from '../context/AuthContext';

const buildInitialForm = (isAdmin, branchId) => ({
  product_id: '',
  branch_id: isAdmin ? '' : branchId ? String(branchId) : '',
  quantity: 1,
  unit_price: '',
});

const MovementModal = ({ show, handleClose, movementType, onSuccess, movementToEdit }) => {
  const { currentUser } = useAuth();
  const userBranchId = currentUser?.branch?.id ?? currentUser?.branchId ?? null;
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState(buildInitialForm(isAdmin, userBranchId));
  const [formErrors, setFormErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;

    const initial = movementToEdit
      ? {
          product_id: movementToEdit.product?.id ? String(movementToEdit.product.id) : '',
          branch_id: movementToEdit.branch?.id ? String(movementToEdit.branch.id) : isAdmin ? '' : userBranchId ? String(userBranchId) : '',
          quantity: Math.abs(movementToEdit.quantity),
          unit_price: movementToEdit.unit_price ?? '',
        }
      : buildInitialForm(isAdmin, userBranchId);

    setFormData(initial);
    setFormErrors({});
    setError(null);

    const fetchData = async () => {
      try {
        const includeAll = movementType === 'purchase' ? 'true' : 'false';
        const [productsRes, branchesRes] = await Promise.all([
          api.get(`${CONTROL_PREFIX}/products/`, { params: { include_all: includeAll, page_size: 500 } }),
          api.get(`${CONTROL_PREFIX}/branches/`),
        ]);
        const productList = normalizeApiList(productsRes.data);
        const branchListRaw = normalizeApiList(branchesRes.data);
        const branchList = isAdmin ? branchListRaw : branchListRaw.filter((branch) => String(branch.id) === String(userBranchId));

        setProducts(productList);
        setBranches(branchList);

        if (!isAdmin && branchList.length === 0) {
          setError({ title: 'Sin sucursal', message: 'No tienes una sucursal asignada para registrar movimientos.' });
        }
      } catch (err) {
        setProducts([]);
        setBranches([]);
        setError(parseApiError(err, 'No se pudieron cargar los datos necesarios.'));
      }
    };

    fetchData();
  }, [show, movementToEdit, isAdmin, userBranchId, movementType]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    setFormData((prev) => ({ ...prev, product_id: productId }));

    if (movementType === 'sale') {
      const selectedProduct = products.find((product) => String(product.id) === String(productId));
      setFormData((prev) => ({ ...prev, unit_price: selectedProduct ? selectedProduct.price : '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.product_id) errors.product_id = 'Selecciona un producto.';
    if (!formData.branch_id) errors.branch_id = 'Selecciona una sucursal.';

    const quantityError = validatePositiveNumber(formData.quantity, { label: 'Cantidad', allowZero: false });
    if (quantityError) errors.quantity = quantityError;

    const priceError = validatePositiveNumber(formData.unit_price, {
      label: 'Precio unitario',
      allowZero: movementType !== 'sale',
    });
    if (priceError) errors.unit_price = priceError;

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    const payload = {
      product_id: Number(formData.product_id),
      branch_id: Number(formData.branch_id),
      quantity: Number(formData.quantity),
      unit_price: formData.unit_price !== '' ? Number(formData.unit_price) : undefined,
      movement_type: movementType,
    };

    try {
      if (movementToEdit) {
        await api.put(`${CONTROL_PREFIX}/movements/${movementToEdit.id}/`, payload);
      } else {
        await api.post(`${CONTROL_PREFIX}/movements/`, payload);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      const apiError = parseApiError(err, 'Ocurrio un error al guardar el movimiento.');
      setError(apiError);
      const details = apiError.details || {};
      if (Object.keys(details).length) {
        setFormErrors((prev) => ({ ...prev, ...details }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setError(null);
    setFormErrors({});
    setFormData(buildInitialForm(isAdmin, userBranchId));
  };

  const title = useMemo(() => {
    if (movementType === 'sale') {
      return movementToEdit ? 'Editar venta' : 'Registrar nueva venta';
    }
    if (movementType === 'purchase') {
      return movementToEdit ? 'Editar compra' : 'Registrar nueva compra';
    }
    return movementToEdit ? 'Editar movimiento' : 'Registrar movimiento';
  }, [movementType, movementToEdit]);

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <div className="fw-semibold">{error.title || 'Error'}</div>
              <div>{error.message}</div>
              {error.requestId && (
                <div className="small text-muted">ID de seguimiento: {error.requestId}</div>
              )}
            </Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Select
              name="product_id"
              value={formData.product_id}
              onChange={handleProductChange}
              isInvalid={!!formErrors.product_id}
              required
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.product_id}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sucursal</Form.Label>
            <Form.Select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              isInvalid={!!formErrors.branch_id}
              required
              disabled={!isAdmin}
            >
              <option value="">Selecciona una sucursal</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.branch_id}</Form.Control.Feedback>
          </Form.Group>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                isInvalid={!!formErrors.quantity}
                min="0"
                step="1"
                required
              />
              <Form.Control.Feedback type="invalid">{formErrors.quantity}</Form.Control.Feedback>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Precio unitario</Form.Label>
              <Form.Control
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                isInvalid={!!formErrors.unit_price}
                min="0"
                step="0.01"
                required={movementType === 'sale' || movementType === 'purchase'}
              />
              <Form.Control.Feedback type="invalid">{formErrors.unit_price}</Form.Control.Feedback>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner as="span" size="sm" /> : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MovementModal;
