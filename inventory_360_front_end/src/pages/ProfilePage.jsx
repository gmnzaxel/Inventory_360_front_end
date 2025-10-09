import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert, Image } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { FaBuilding, FaStore, FaUserTag, FaExclamationTriangle, FaPencilAlt } from 'react-icons/fa';
import { validateName } from '../utils/validation';

const ProfilePage = () => {
  const { currentUser, deleteAccount } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  if (!currentUser) {
    return <Container fluid><p>Cargando perfil...</p></Container>;
  }

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setConfirmText('');
    setError('');
  };

  const handleOpenEdit = () => {
    setEditName(currentUser?.name || '');
    setEditError('');
    setShowEdit(true);
  };
  const handleCloseEdit = () => {
    setShowEdit(false);
    setEditName('');
    setEditError('');
  };

  const handleSaveProfile = async () => {
    const validationError = validateName(editName, { label: 'Nombre', min: 2, max: 60 });
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setSaving(true);
    setEditError('');
    try {
      await api.patch(`/user-control/users/${currentUser.id}/`, { name: editName.trim() });
      window.location.reload();
    } catch (e) {
      setEditError('No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleVariant = (role) => (role === 'admin' ? 'danger' : 'secondary');
  const avatarUrl = `https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=0d6efd&color=fff&size=128&font-size=0.33`;

  return (
    <>
      <Container fluid className="page-container">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <h2 className="h4 mb-4 animated-header">Mi Perfil</h2>

            <Card className="shadow-sm mb-4 animated-card">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <Image src={avatarUrl} roundedCircle className="me-4" style={{ width: '100px', height: '100px' }} />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h3 className="h5 mb-0 fw-bold">{currentUser.name}</h3>
                        <p className="text-muted mb-0">{currentUser.email}</p>
                      </div>
                      <Button variant="outline-secondary" size="sm" onClick={handleOpenEdit}>
                        <FaPencilAlt className="me-1" /> Editar Perfil
                      </Button>
                    </div>
                  </div>
                </div>

                <hr />

                <Row className="align-items-center my-3">
                  <Col sm={3} className="text-muted d-flex align-items-center"><FaUserTag className="me-2" /> Rol</Col>
                  <Col sm={9}><Badge pill bg={getRoleVariant(currentUser.role)}>{currentUser.role}</Badge></Col>
                </Row>
                <Row className="align-items-center my-3">
                  <Col sm={3} className="text-muted d-flex align-items-center"><FaBuilding className="me-2" /> Empresa</Col>
                  <Col sm={9}>{currentUser.business?.name || 'N/A'}</Col>
                </Row>
                {currentUser.branch && (
                  <Row className="align-items-center my-3">
                    <Col sm={3} className="text-muted d-flex align-items-center"><FaStore className="me-2" /> Sucursal</Col>
                    <Col sm={9}>{currentUser.branch.name}</Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-danger animated-card" style={{ animationDelay: '0.2s' }}>
              <Card.Header as="h5" className="text-danger d-flex align-items-center bg-transparent">
                <FaExclamationTriangle className="me-2" />
                Zona de Peligro
              </Card.Header>
              <Card.Body>
                <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegurate antes de continuar.</p>
                <Button variant="danger" onClick={handleShowModal}>
                  Eliminar mi cuenta
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">¿Estás absolutamente seguro?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Esta acción es irreversible.</p>
          {currentUser.role === 'admin' && (
            <Alert variant="warning">
              <strong>¡Atención, eres administrador!</strong> Si sos el último administrador, al eliminar tu cuenta se borrará <strong>toda la empresa</strong>, incluyendo sucursales, productos y datos de otros usuarios.
            </Alert>
          )}
          <p>Por favor, escribí <strong>ELIMINAR</strong> para confirmar.</p>
          <Form.Control
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={confirmText !== 'ELIMINAR'}
          >
            Entiendo las consecuencias, eliminar mi cuenta
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEdit} onHide={handleCloseEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={60}
              required
            />
            <Form.Text className="text-muted">Nombre y apellido con la inicial en mayúscula.</Form.Text>
          </Form.Group>
          <Form.Text className="text-muted">El email y rol no pueden editarse.</Form.Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEdit}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfilePage;
