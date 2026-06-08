import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { OrdenesDeCompra } from './components/OrdenesDeCompra';
import { Productos } from './components/Productos';
import { Proveedores } from './components/Proveedores';
import { Movimientos } from './components/Movimientos';
import { Herramientas } from './components/Herramientas';

const COMPONENTES = {
  dashboard: <Dashboard />,
  ordenes: <OrdenesDeCompra />,
  productos: <Productos />,
  proveedores: <Proveedores />,
  movimientos: <Movimientos />,
  herramientas: <Herramientas />
};

type Pestana = keyof typeof COMPONENTES;

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [pestanaActiva, setPestanaActiva] = useState<Pestana>('dashboard');

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Si no está autenticado, renderizar la pantalla de Login corporativo
  if (!token) {
    return (
      <div style={{ padding: '30px', fontFamily: 'sans-serif', minHeight: '100vh', background: '#121212', color: '#fff' }}>
        <header style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h1 style={{ color: '#646cff', marginBottom: '5px', fontSize: '2.5rem', fontWeight: 'bold' }}>📦 InventarioApp Global</h1>
          <p style={{ color: '#888', marginTop: '0' }}>Plataforma Logística de Control de Stock</p>
        </header>
        <main>
          <Login onLoginSuccess={(t) => setToken(t)} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        borderBottom: '2px solid #222',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ color: '#646cff', marginBottom: '5px', fontSize: '2.2rem', fontWeight: 'bold', margin: '0' }}>📦 InventarioApp Global</h1>
          <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.95rem' }}>Panel de Control Logístico Enterprise</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: '#81c784', background: 'rgba(76, 175, 80, 0.15)', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
            ● Conectado (Admin)
          </span>
          <button
            onClick={cerrarSesion}
            style={{
              padding: '8px 16px',
              backgroundColor: '#c62828',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}
          >
            🔒 Cerrar Sesión
          </button>
        </div>
      </header>
      
      {/* Navegación Corporativa */}
      <nav style={{
        marginBottom: '30px',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        background: '#1a1a1a',
        padding: '8px',
        borderRadius: '8px',
        border: '1px solid #2d2d2d'
      }}>
        {(Object.keys(COMPONENTES) as Pestana[]).map((pestana) => {
          let label = '';
          switch (pestana) {
            case 'dashboard': label = '📊 Dashboard'; break;
            case 'ordenes': label = '📝 Órdenes'; break;
            case 'productos': label = '📦 Productos'; break;
            case 'proveedores': label = '🏢 Proveedores'; break;
            case 'movimientos': label = '🕰️ Auditoría'; break;
            case 'herramientas': label = '🛠️ Operaciones'; break;
          }
          const activa = pestanaActiva === pestana;
          return (
            <button 
              key={pestana}
              onClick={() => setPestanaActiva(pestana)}
              style={{
                padding: '10px 18px',
                cursor: 'pointer',
                backgroundColor: activa ? '#646cff' : 'transparent',
                color: activa ? '#fff' : '#aaa',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Renderizado Dinámico */}
      <main style={{ minHeight: '60vh' }}>
        {COMPONENTES[pestanaActiva]}
      </main>

      <footer style={{
        marginTop: '60px',
        borderTop: '1px solid #222',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#555',
        fontSize: '0.85rem'
      }}>
        InventarioApp Global S.A. © 2026 - Solución Segura de Gestión de Cadena de Suministro
      </footer>
    </div>
  );
}

export default App;