import { useState } from 'react';
import React from 'react'; 
import { OrdenesDeCompra } from './components/OrdenesDeCompra';
import { Productos } from './components/Productos';
import { Proveedores } from './components/Proveedores';

function App() {
  // Estado para saber qué pestaña renderizar
  const [pestanaActiva, setPestanaActiva] = useState<'productos' | 'proveedores' | 'ordenes'>('ordenes');

  // Función para darle estilos a los botones del menú
  const obtenerEstiloBoton = (tipo: 'productos' | 'proveedores' | 'ordenes'): React.CSSProperties => ({
    padding: '10px 20px',
    marginRight: '10px',
    cursor: 'pointer',
    backgroundColor: pestanaActiva === tipo ? '#646cff' : '#242424',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  });

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#646cff', marginBottom: '5px' }}>📦 Sistema de Inventario</h1>
      <p style={{ color: '#888', marginTop: '0', marginBottom: '25px' }}>Panel de administración global</p>
      
      {/* Selector de pestañas */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <button 
          style={obtenerEstiloBoton('ordenes')} 
          onClick={() => setPestanaActiva('ordenes')}
        >
          📝 Órdenes de Compra
        </button>
        <button 
          style={obtenerEstiloBoton('productos')} 
          onClick={() => setPestanaActiva('productos')}
        >
          📦 Productos
        </button>
        <button 
          style={obtenerEstiloBoton('proveedores')} 
          onClick={() => setPestanaActiva('proveedores')}
        >
          🏢 Proveedores
        </button>
      </div>

      {/* Renderizado dinámico según la pestaña seleccionada */}
      <div style={{ marginTop: '10px' }}>
        {pestanaActiva === 'ordenes' && <OrdenesDeCompra />}
        {pestanaActiva === 'productos' && <Productos />}
        {pestanaActiva === 'proveedores' && <Proveedores />}
      </div>
    </div>
  );
}

export default App;