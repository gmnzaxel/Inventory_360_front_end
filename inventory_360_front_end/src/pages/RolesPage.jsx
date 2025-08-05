import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaSearch, FaSave, FaUserShield } from 'react-icons/fa';

const RolesPage = () => {
  // Datos estáticos de ejemplo con solo dos roles
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@test.com', role: 'Admin' },
    { id: 2, name: 'Ana García', email: 'ana.garcia@test.com', role: 'Empleado' },
    { id: 3, name: 'Carlos López', email: 'carlos.lopez@test.com', role: 'Empleado' },
    { id: 4, name: 'María Fernández', email: 'maria.fernandez@test.com', role: 'Empleado' },
  ]);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  // Se simplifica la función para dos roles
  const getRoleVariant = (role) => {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Empleado': return 'secondary';
      default: return 'light';
    }
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
              {users.map(user => (
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
                    {/* Se actualiza el selector con solo dos opciones */}
                    <Form.Select 
                      size="sm"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option>Admin</option>
                      <option>Empleado</option>
                    </Form.Select>
                  </td>
                  <td className="text-center align-middle">
                    <Button variant="outline-success" size="sm">
                      <FaSave className="me-1" /> Guardar
                    </Button>
                  </td> 
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RolesPage;
