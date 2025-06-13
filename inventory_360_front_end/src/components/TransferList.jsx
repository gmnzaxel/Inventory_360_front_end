import React, { useState } from 'react';
import { Button, Form, Table, Badge, Dropdown, InputGroup, Row, Col, Card, Pagination } from 'react-bootstrap';
import { FaFilePdf, FaFileCsv, FaPrint, FaTrash, FaEye, FaPlus } from 'react-icons/fa';

// Datos de ejemplo. En una app real, esto vendría de una API.
const initialTransfers = [
  { id: 1, date: '23/10/2020 22:01:46', ref: 'tr-20201024-090146', from: 'warehouse 2', to: 'warehouse 1', cost: '34,500.00', tax: '4,500.00', total: '34,500.00', status: 'Completed' },
  { id: 2, date: '18/10/2020 07:17:08', ref: 'tr-20201018-061708', from: 'warehouse 1', to: 'warehouse 2', cost: '1.00', tax: '0.00', total: '1.00', status: 'Completed' },
  { id: 3, date: '08/10/2020 02:27:35', ref: 'tr-20201008-012735', from: 'warehouse 1', to: 'warehouse 2', cost: '352.00', tax: '32.00', total: '352.00', status: 'Completed' },
  { id: 4, date: '22/01/2020 00:30:58', ref: 'tr-20200122-123058', from: 'warehouse 2', to: 'warehouse 1', cost: '1,000.00', tax: '0.00', total: '1,000.00', status: 'Completed' },
  { id: 5, date: '06/12/2019 07:55:04', ref: 'tr-20181705-075504', from: 'warehouse 1', to: 'warehouse 7', cost: '2.00', tax: '0.00', total: '2.00', status: 'Completed' },
  { id: 6, date: '08/08/2018 06:17:10', ref: 'tr-20180808-061710', from: 'warehouse 2', to: 'warehouse 1', cost: '100.00', tax: '0.00', total: '100.00', status: 'Completed' },
];

const TransferList = () => {
  const [transfers] = useState(initialTransfers);

  return (
    <div className="p-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2>Transfer List</h2>
        <div>
          <Button variant="primary" className="me-2 d-flex align-items-center">
            <FaPlus className="me-2" /> Add Transfer
          </Button>
        </div>
      </header>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <InputGroup size="sm">
                <InputGroup.Text>Show</InputGroup.Text>
                <Form.Select defaultValue="10">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </Form.Select>
                <InputGroup.Text>entries</InputGroup.Text>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Control size="sm" placeholder="Search..." />
            </Col>
            <Col md={6} className="text-end">
              <Button variant="light" size="sm" className="border me-1"><FaFilePdf className="me-1" /> PDF</Button>
              <Button variant="light" size="sm" className="border me-1"><FaFileCsv className="me-1" /> CSV</Button>
              <Button variant="light" size="sm" className="border me-1"><FaPrint className="me-1" /> Print</Button>
              <Button variant="danger" size="sm" className="me-1"><FaTrash className="me-1" /> Delete</Button>
              <Button variant="light" size="sm" className="border"><FaEye className="me-1" /> Column visibility</Button>
            </Col>
          </Row>

          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th><Form.Check type="checkbox" /></th>
                <th>Date</th>
                <th>Reference No</th>
                <th>Warehouse (From)</th>
                <th>Warehouse (To)</th>
                <th className="text-end">Product Cost</th>
                <th className="text-end">Product Tax</th>
                <th className="text-end">Grand Total</th>
                <th className="text-center">Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer.id}>
                  <td><Form.Check type="checkbox" /></td>
                  <td>{transfer.date}</td>
                  <td>{transfer.ref}</td>
                  <td>{transfer.from}</td>
                  <td>{transfer.to}</td>
                  <td className="text-end">${transfer.cost}</td>
                  <td className="text-end">${transfer.tax}</td>
                  <td className="text-end">${transfer.total}</td>
                  <td className="text-center">
                    <Badge bg="success" pill>{transfer.status}</Badge>
                  </td>
                  <td className="text-center">
                    <Dropdown>
                      <Dropdown.Toggle variant="primary" size="sm" id={`action-dropdown-${transfer.id}`}>
                        Action
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item href="#">View Details</Dropdown.Item>
                        <Dropdown.Item href="#">Edit Transfer</Dropdown.Item>
                        <Dropdown.Item href="#" className="text-danger">Delete Transfer</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>Showing 1 to {transfers.length} of {transfers.length} entries</span>
            <Pagination size="sm">
              <Pagination.Prev disabled />
              <Pagination.Item active>{1}</Pagination.Item>
              <Pagination.Next disabled />
            </Pagination>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TransferList;
