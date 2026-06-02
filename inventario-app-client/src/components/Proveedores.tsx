import { useEffect, useState } from 'react';
import { proveedoresService } from '../api/proveedoresService';
import type { Proveedor } from '../types';

export function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const datos = await proveedoresService.obtenerTodos();
        setProveedores(datos);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los proveedores.");
      } finally {
        setCargando(false);
      }
    };
    cargarProveedores();
  }, []);

  if (cargando) return <div style={{ color: '#fff' }}>Cargando proveedores...</div>;
  if (error) return <div style={{ color: '#ff6b6b' }}>{error}</div>;

  return (
    <div>
      <h2>Directorio de Proveedores</h2>
      <p style={{ color: '#aaa' }}>Empresas de distribución asociadas</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead style={{ backgroundColor: '#242424' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Razón Social</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>CUIT</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Rubro</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(prov => (
            <tr key={prov.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '12px' }}>{prov.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#646cff' }}>{prov.nombreDeEmpresa}</td>
              <td style={{ padding: '12px' }}>{prov.cuit}</td>
              <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#2d2d2d', padding: '2px 6px', borderRadius: '4px' }}>{prov.rubro}</span></td>
              <td style={{ padding: '12px', color: '#aaa' }}>{prov.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}