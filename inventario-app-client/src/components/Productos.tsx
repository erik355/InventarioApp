import { useEffect, useState } from 'react';
import { productosService } from '../api/productosService';
import type { Producto } from '../types';

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const datos = await productosService.obtenerTodos();
        setProductos(datos);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos.");
      } finally {
        setCargando(false);
      }
    };
    cargarProductos();
  }, []);

  if (cargando) return <div style={{ color: '#fff' }}>Cargando productos...</div>;
  if (error) return <div style={{ color: '#ff6b6b' }}>{error}</div>;

  return (
    <div>
      <h2>Control de Stock - Productos</h2>
      <p style={{ color: '#aaa' }}>Listado de artículos en almacén</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead style={{ backgroundColor: '#242424' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Nombre</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Precio</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Stock Actual</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '12px' }}>{p.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#646cff' }}>{p.nombreDelProducto}</td>
              <td style={{ padding: '12px' }}>${p.precio.toLocaleString()}</td>
              <td style={{ padding: '12px', color: p.stock <= p.stockMinimo ? '#ff6b6b' : '#fff' }}>
                {p.stock} u. {p.stock <= p.stockMinimo && '⚠️'}
              </td>
              <td style={{ padding: '12px', color: '#888' }}>{p.stockMinimo} u.</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}