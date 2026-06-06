import { useState } from 'react';
import { OrdenesDeCompra } from './components/OrdenesDeCompra';
import { Productos } from './components/Productos';
import { Proveedores } from './components/Proveedores';

const COMPONENTES = {
  ordenes: <OrdenesDeCompra />,
  productos: <Productos />,
  proveedores: <Proveedores />
};

type Pestana = keyof typeof COMPONENTES;

function App() {
  const [pestanaActiva, setPestanaActiva] = useState<Pestana>('ordenes');

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px' }}>
        <h1 style={{ color: '#646cff', marginBottom: '5px' }}>📦 Sistema de Inventario</h1>
        <p style={{ color: '#888', marginTop: '0' }}>Panel de administración global</p>
      </header>
      
      {/* Navegación */}
      <nav style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        {(Object.keys(COMPONENTES) as Pestana[]).map((pestana) => (
          <button 
            key={pestana}
            onClick={() => setPestanaActiva(pestana)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              cursor: 'pointer',
              backgroundColor: pestanaActiva === pestana ? '#646cff' : '#242424',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {pestana === 'ordenes' ? '📝 Órdenes' : pestana === 'productos' ? '📦 Productos' : '🏢 Proveedores'}
          </button>
        ))}
      </nav>

      {/* Renderizado Dinámico */}
      <main>
        {COMPONENTES[pestanaActiva]}
      </main>
    </div>
  );
}

export default App;