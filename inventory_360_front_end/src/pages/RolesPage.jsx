import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaSave, FaUserShield } from 'react-icons/fa';

const API_URL = 'http://localhost:8000/user-control';

const RolesPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Hacemos la petición GET al nuevo endpoint de usuarios
        const response = await axios.get(`${API_URL}/users/`);
        setUsers(response.data);
      } catch (err) {
        setError('No se pudo cargar la lista de usuarios.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Función para manejar el cambio de rol en el estado local
  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'empleado': return 'secondary';
      default: return 'light';
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 mb-0">Cargando usuarios...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="4">
            <Alert variant="danger" className="m-3">{error}</Alert>
          </td>
        </tr>
      );
    }

    if (users.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-5">
            No hay usuarios para mostrar.
          </td>
        </tr>
      );
    }

    return users.map(user => (
      <tr key={user.id}>
        <td className="ps-3">
          <div className="fw-bold">{user.name}</div>
          <div className="text-muted small">{user.email}</div>
        </td>
        <td className="text-center align-middle">
          <Badge pill bg={getRoleVariant(user.role)}>
            {user.role}
          </Badge>
        </td>
        <td className="align-middle" style={{ minWidth: '200px' }}>
          <Form.Select 
            size="sm"
            value={user.role}
            onChange={(e) => handleRoleChange(user.id, e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="empleado">Empleado</option>
          </Form.Select>
        </td>
        <td className="text-center align-middle">
          <Button variant="outline-success" size="sm">
            <FaSave className="me-1" /> Guardar
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <Container fluid>
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="h4 mb-0">
            <FaUserShield className="me-2" />
            Gestión de Roles de Empleados
          </h2>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="p-3">
          <Col md={6} lg={4}>
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control placeholder="Buscar por nombre o email..." />
            </InputGroup>
          </Col>
        </Card.Header>

        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 ps-3">Empleado</th>
                <th className="text-center">Rol Actual</th>
                <th>Cambiar Rol</th>
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
  );
};

export default RolesPage;