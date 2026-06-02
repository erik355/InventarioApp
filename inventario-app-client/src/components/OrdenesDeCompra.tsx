import { useEffect, useState } from 'react';
import { ordenesService } from '../api/ordenesService';

export function OrdenesDeCompra() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
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

  const obtenerTextoEstado = (estado: number) => {
    switch(estado) {
      case 0: return 'Pendiente';
      case 1: return 'Aprobado';
      case 2: return 'Recibido'; // Cambiado a Recibido como tu enum de C#
      default: return 'Desconocido';
    }
  };

  if (cargando) return <div style={{ color: '#fff' }}>Cargando órdenes...</div>;
  if (error) return <div style={{ color: '#ff6b6b' }}>{error}</div>;

  return (
    <div>
      <h2>Historial de Órdenes de Compra</h2>
      <p style={{ color: '#aaa' }}>Datos conectados en tiempo real con tu API en .NET 10</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead style={{ backgroundColor: '#242424' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Fecha</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Producto</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Proveedor</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Cantidad</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Estado</th>
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
                    backgroundColor: orden.estado === 1 ? '#1b4332' : orden.estado === 0 ? '#4d3800' : '#143642',
                    color: orden.estado === 1 ? '#75e6da' : orden.estado === 0 ? '#ffcc00' : '#8ecae6'
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