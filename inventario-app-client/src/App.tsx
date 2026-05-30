import { useEffect, useState } from 'react';
import type { OrdenDeCompra } from './types'; 
import { ordenesService } from './api/ordenesService';

function App() {
  const [ordenes, setOrdenes] = useState<any[]>([]); // Usamos any temporalmente para adaptarnos al JSON exacto
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await ordenesService.obtenerTodas();
        setOrdenes(datos);
      } catch (err) {
        console.error("Error al traer las órdenes:", err);
        setError("No se pudieron cargar las órdenes de compra.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Función auxiliar para traducir el número de estado a texto visible
  const obtenerTextoEstado = (estado: number) => {
    switch(estado) {
      case 0: return 'Pendiente';
      case 1: return 'Aprobado';
      case 2: return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  if (cargando) return <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>Cargando órdenes...</div>;
  if (error) return <div style={{ padding: '20px', color: '#ff6b6b', fontFamily: 'sans-serif' }}>{error}</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#646cff' }}>📦 Sistema de Inventario</h1>
      <h2>Órdenes de Compra</h2>
      <p>Datos conectados en tiempo real con tu API en .NET 10</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead style={{ backgroundColor: '#242424' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left' }}>Fecha</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left' }}>Producto</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left' }}>Proveedor</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left' }}>Cantidad</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No hay órdenes de compra registradas.
              </td>
            </tr>
          ) : (
            ordenes.map((orden) => (
              <tr key={orden.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{orden.id}</td>
                <td style={{ padding: '12px' }}>{new Date(orden.fecha).toLocaleDateString()}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#646cff' }}>
                  {orden.producto ? orden.producto.nombreDelProducto : `ID: ${orden.productoId}`}
                </td>
                <td style={{ padding: '12px' }}>
                  {orden.proveedor ? orden.proveedor.nombreDeEmpresa : `ID: ${orden.proveedorId}`}
                </td>
                <td style={{ padding: '12px' }}>{orden.cantidad} u.</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: orden.estado === 1 ? '#1b4332' : orden.estado === 0 ? '#4d3800' : '#2d2d2d',
                    color: orden.estado === 1 ? '#75e6da' : orden.estado === 0 ? '#ffcc00' : '#fff'
                  }}>
                    {obtenerTextoEstado(orden.estado)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;