import React from 'react';
import { Card } from 'react-bootstrap';

const Home = () => {
  return (
    <div className="p-4">
      <header className="mb-4">
        <h2>Página de Inicio</h2>
      </header>
      <Card>
        <Card.Body>
          <p>Este es el contenido de la página principal.</p>
          <p>Toda la lógica de conexión con la API ha sido eliminada.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Home;