import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { parseApiError } from '../utils/errors';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { CONTROL_PREFIX } from '../config/api';
import { normalizeApiList } from '../utils/apiHelpers';
import { validatePositiveNumber } from '../utils/validation';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  product_id: '',
  branch_from_id: '',
  branch_id: '',
  quantity: '',
};

const TransferModal = ({ show, handleClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const userBranchId = currentUser?.branch?.id ?? currentUser?.branchId ?? null;
  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;

    setFormErrors({});
    setError(null);
    setFormData({
      ...emptyForm,
      branch_from_id: !isAdmin && userBranchId ? String(userBranchId) : '',
    });

    const fetchData = async () => {
      try {
        const [productsRes, branchesRes] = await Promise.all([
          api.get(`${CONTROL_PREFIX}/products/`),
          api.get(`${CONTROL_PREFIX}/branches/`),
        ]);
        const productList = normalizeApiList(productsRes.data);
        const branchListRaw = normalizeApiList(branchesRes.data);

        setProducts(productList);
        setBranches(branchListRaw);

        if (!isAdmin) {
          if (!userBranchId) {
            setError({ title: 'Sin sucursal', message: 'No tienes una sucursal asignada para transferencias.' });
          } else {
            setFormData((prev) => ({
              ...prev,
              branch_from_id: String(userBranchId),
            }));
          }
        } else if (branchListRaw.length < 2) {
          setError({ title: 'Sucursales insuficientes', message: 'Necesitas al menos dos sucursales para transferir.' });
        }
      } catch (err) {
        setError(parseApiError(err, 'No se pudieron cargar los productos o sucursales.'));
        setProducts([]);
        setBranches([]);
      }
    };

    fetchData();
  }, [show, isAdmin, userBranchId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'branch_from_id' && prev.branch_id === value) {
        next.branch_id = '';
      }
      return next;
    });
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.product_id) errors.product_id = 'Selecciona un producto.';
    if (!formData.branch_from_id) errors.branch_from_id = 'Selecciona la sucursal de origen.';
    if (!formData.branch_id) errors.branch_id = 'Selecciona la sucursal de destino.';
    if (formData.branch_from_id && formData.branch_id && formData.branch_from_id === formData.branch_id) {
      errors.branch_id = 'Origen y destino deben ser distintos.';
    }
    const quantityError = validatePositiveNumber(formData.quantity, { label: 'Cantidad' });
    if (quantityError) errors.quantity = quantityError;
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        product_id: Number(formData.product_id),
        branch_from_id: Number(formData.branch_from_id),
        branch_id: Number(formData.branch_id),
        quantity: Number(formData.quantity),
        movement_type: 'transfer',
      };
      await api.post(`${CONTROL_PREFIX}/movements/`, payload);
      onSuccess();
      handleClose();
    } catch (err) {
      const apiError = parseApiError(err, 'Ocurrio un error al crear la transferencia.');
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
    setFormData(emptyForm);
    setFormErrors({});
    setError(null);
  };

  const originBranches = isAdmin
    ? branches
    : branches.filter((branch) => String(branch.id) === String(userBranchId));
  const destinationBranches = isAdmin
    ? branches.filter((branch) => String(branch.id) !== formData.branch_from_id)
    : branches.filter((branch) => String(branch.id) !== String(userBranchId));
  const branchesUnavailable = destinationBranches.length === 0;

  return (
    <Modal show={show} onHide={handleClose} centered onExited={handleExited}>
      <Modal.Header closeButton>
        <Modal.Title>Crear nueva transferencia</Modal.Title>
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
          {branchesUnavailable && (
            <Alert variant="warning">
              No hay suficientes sucursales para realizar una transferencia.
            </Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Producto</Form.Label>
            <Form.Select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
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
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Desde (origen)</Form.Label>
                <Form.Select
                  name="branch_from_id"
                  value={formData.branch_from_id}
                  onChange={handleChange}
                  isInvalid={!!formErrors.branch_from_id}
                  required
                  disabled={!isAdmin && !!userBranchId}
                >
                  <option value="">Selecciona origen</option>
                  {originBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.branch_from_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Hasta (destino)</Form.Label>
                <Form.Select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  isInvalid={!!formErrors.branch_id}
                  required
                >
                  <option value="">Selecciona destino</option>
                  {destinationBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.branch_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              isInvalid={!!formErrors.quantity}
              required
            />
            <Form.Control.Feedback type="invalid">{formErrors.quantity}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading || branchesUnavailable}>
            {loading ? <Spinner as="span" size="sm" /> : 'Confirmar transferencia'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TransferModal;
