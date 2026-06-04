import { useEffect, useState } from 'react';
import { ordenesService } from '../api/ordenesService';
import { productosService } from '../api/productosService';
import { proveedoresService } from '../api/proveedoresService';
import type { OrdenDeCompra, EstadoDeOrden, Producto, Proveedor } from '../types';

// Componente para el badge de estado
function BadgeEstado({ estado }: { estado: EstadoDeOrden }) {
  const textos = ['Pendiente', 'Aprobado', 'Recibido'];
  const colores = ['#ffcc00', '#75e6da', '#8ecae6'];
  const fondos = ['#4d3800', '#1b4332', '#143642'];

  return (
    <span style={{
      padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
      backgroundColor: fondos[estado] || '#333', color: colores[estado] || '#fff'
    }}>
      {textos[estado] || 'Desconocido'}
    </span>
  );
}

export function OrdenesDeCompra() {
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const [formulario, setFormulario] = useState({ productoId: '', proveedorId: '', cantidad: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [o, p, prov] = await Promise.all([
        ordenesService.obtenerTodas(),
        productosService.obtenerTodos(),
        proveedoresService.obtenerTodos()
      ]);
      console.log("Datos cargados:", o); // Para verificar en consola F12
      setOrdenes(o);
      setProductos(p);
      setProveedores(prov);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ordenesService.crear({
        productoId: Number(formulario.productoId),
        proveedorId: Number(formulario.proveedorId),
        cantidad: Number(formulario.cantidad),
        estado: 0,
        fecha: new Date().toISOString()
      });
      setFormulario({ productoId: '', proveedorId: '', cantidad: '' });
      await cargarDatos();
      alert("Orden creada con éxito");
    } catch (err) {
      alert("Error al crear la orden");
    }
  };

  if (cargando) return <div style={{ color: '#fff' }}>Cargando...</div>;

  return (
    <div>
      <h2>Historial de Órdenes de Compra</h2>
      
      {/* Formulario */}
      <form onSubmit={manejarEnvio} style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, color: '#646cff' }}>➕ Nueva Orden</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select onChange={(e) => setFormulario({...formulario, productoId: e.target.value})} value={formulario.productoId} style={{ padding: '8px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444' }}>
            <option value="">Seleccionar Producto</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombreDelProducto}</option>)}
          </select>
          <select onChange={(e) => setFormulario({...formulario, proveedorId: e.target.value})} value={formulario.proveedorId} style={{ padding: '8px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444' }}>
            <option value="">Seleccionar Proveedor</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombreDeEmpresa}</option>)}
          </select>
          <input type="number" placeholder="Cantidad" value={formulario.cantidad} onChange={(e) => setFormulario({...formulario, cantidad: e.target.value})} style={{ padding: '8px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444' }} />
          <button type="submit" style={{ backgroundColor: '#646cff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Crear</button>
        </div>
      </form>

      {/* Tabla */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead>
          <tr style={{ backgroundColor: '#242424' }}>
            {['ID', 'Producto', 'Proveedor', 'Cantidad', 'Estado'].map(h => <th key={h} style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o: any) => {
            // Manejo flexible de nombres de propiedades (camelCase o PascalCase)
            const prod = o.producto || o.Producto;
            const prov = o.proveedor || o.Proveedor;
            const cant = o.cantidad ?? o.Cantidad;
            const est = o.estado ?? o.Estado ?? 0;

            return (
              <tr key={o.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{o.id}</td>
                <td style={{ padding: '12px', color: '#646cff' }}>{prod?.nombreDelProducto || `ID: ${o.productoId || o.ProductoId}`}</td>
                <td style={{ padding: '12px' }}>{prov?.nombreDeEmpresa || `ID: ${o.proveedorId || o.ProveedorId}`}</td>
                <td style={{ padding: '12px' }}>{cant} u.</td>
                <td style={{ padding: '12px' }}><BadgeEstado estado={est} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}