import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaBuilding, FaStore, FaUserTag, FaExclamationTriangle } from 'react-icons/fa';

const ProfilePage = () => {
  const { currentUser, deleteAccount } = useAuth();
  
  // Estados para el modal de eliminación
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    return <Container fluid><p>Cargando perfil...</p></Container>;
  }

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setConfirmText('');
    setError('');
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      // La redirección se maneja en el AuthContext a través del logout
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleVariant = (role) => (role === 'admin' ? 'danger' : 'secondary');

  return (
    <>
      <Container fluid>
        <h2 className="h4 mb-4">Mi Perfil</h2>
        <Row>
          <Col lg={8} xl={6}>
            {/* Tarjeta de Información */}
            <Card className="shadow-sm mb-4">
              <Card.Header as="h5" className="d-flex align-items-center">
                <FaUserCircle className="me-2" />
                Información de la Cuenta
              </Card.Header>
              <Card.Body>
                <dl className="row">
                  <dt className="col-sm-4 d-flex align-items-center"><FaUserTag className="me-2"/>Rol</dt>
                  <dd className="col-sm-8"><Badge pill bg={getRoleVariant(currentUser.role)}>{currentUser.role}</Badge></dd>
                  <dt className="col-sm-4">Nombre</dt>
                  <dd className="col-sm-8">{currentUser.name}</dd>
                  <dt className="col-sm-4 d-flex align-items-center"><FaEnvelope className="me-2"/>Email</dt>
                  <dd className="col-sm-8">{currentUser.email}</dd>
                  <dt className="col-sm-4 d-flex align-items-center"><FaBuilding className="me-2"/>Empresa</dt>
                  <dd className="col-sm-8">{currentUser.business?.name || 'N/A'}</dd>
                  {currentUser.branch && (
                    <><dt className="col-sm-4 d-flex align-items-center"><FaStore className="me-2"/>Sucursal</dt>
                    <dd className="col-sm-8">{currentUser.branch.name}</dd></>
                  )}
                </dl>
              </Card.Body>
            </Card>

            {/* Tarjeta de Zona de Peligro */}
            <Card className="shadow-sm border-danger">
              <Card.Header as="h5" className="text-danger d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                Eliminar Cuenta
              </Card.Header>
              <Card.Body>
                <p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten la seguridad.</p>
                <Button variant="danger" onClick={handleShowModal}>
                  Eliminar mi cuenta
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de Confirmación */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">¿Estás absolutamente seguro?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Esta acción es irreversible.</p>
          {currentUser.role === 'admin' && (
            <Alert variant="warning">
              <strong>¡Atención, eres administrador!</strong> Si eres el último administrador, al eliminar tu cuenta se borrará <strong>toda la empresa</strong>, incluyendo todas las sucursales, productos y datos de otros usuarios.
            </Alert>
          )}
          <p>Por favor, escribe <strong>ELIMINAR</strong> para confirmar.</p>
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
    </>
  );
};

export default ProfilePage;