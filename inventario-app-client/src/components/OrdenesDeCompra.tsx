import { useEffect, useState } from 'react';
import { ordenesService } from '../api/ordenesService';
import { productosService } from '../api/productosService';
import { proveedoresService } from '../api/proveedoresService';
import type { OrdenDeCompra, EstadoDeOrden, Producto, Proveedor } from '../types';

const BadgeEstado = ({ estado }: { estado: EstadoDeOrden }) => {
  const config = {
    0: { texto: 'Pendiente', color: '#ffcc00', fondo: '#4d3800' },
    1: { texto: 'Aprobado', color: '#75e6da', fondo: '#1b4332' },
    2: { texto: 'Recibido', color: '#8ecae6', fondo: '#143642' }
  };
  const { texto, color, fondo } = config[estado as keyof typeof config] || { texto: 'Desconocido', color: '#fff', fondo: '#333' };
  
  return (
    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', backgroundColor: fondo, color, display: 'inline-block' }}>
      {texto}
    </span>
  );
};

export function OrdenesDeCompra() {
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [formulario, setFormulario] = useState({ ProductoId: '', ProveedorId: '', Cantidad: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setError(null);
    try {
      const [o, p, prov] = await Promise.all([
        ordenesService.obtenerTodas(),
        productosService.obtenerTodos(),
        proveedoresService.obtenerTodos()
      ]);
      
      // ✅ Filtrar elementos con ID válido para evitar errores de key
      const productosValidos = (p || []).filter(prod => prod?.ID != null);
      const proveedoresValidos = (prov || []).filter(prov => prov?.ID != null);
      const ordenesValidas = (o || []).filter(ord => ord?.ID != null);
      
      setOrdenes(ordenesValidas);
      setProductos(productosValidos);
      setProveedores(proveedoresValidos);
      
      // ✅ Advertencia si hay datos inválidos
      if ((p || []).length !== productosValidos.length) {
        console.warn(`⚠️ Se omitieron ${(p || []).length - productosValidos.length} productos sin ID`);
      }
      if ((prov || []).length !== proveedoresValidos.length) {
        console.warn(`⚠️ Se omitieron ${(prov || []).length - proveedoresValidos.length} proveedores sin ID`);
      }
      
    } catch (err) { 
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos. Por favor, recarga la página.");
    } finally { 
      setCargando(false); 
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Validaciones mejoradas
    if (!formulario.ProductoId) return alert("Selecciona un producto");
    if (!formulario.ProveedorId) return alert("Selecciona un proveedor");
    if (!formulario.Cantidad) return alert("Ingresa una cantidad");
    
    const prodId = Number(formulario.ProductoId);
    const provId = Number(formulario.ProveedorId);
    const cantidad = Number(formulario.Cantidad);
    
    if (isNaN(cantidad) || cantidad <= 0) return alert("La cantidad debe ser un número positivo");

    const producto = productos.find(p => p.ID === prodId);
    if (!producto) return alert("Producto no encontrado");
    if (cantidad > producto.Stock) return alert(`⚠️ Stock insuficiente. Disponibles: ${producto.Stock}`);

    try {
      await ordenesService.crear({ 
        ProductoId: prodId, 
        ProveedorId: provId, 
        Cantidad: cantidad, 
        Estado: 0, 
        Fecha: new Date().toISOString() 
      } as any);
      
      setFormulario({ ProductoId: '', ProveedorId: '', Cantidad: '' });
      await cargarDatos();
      alert("✅ Orden creada con éxito");
    } catch (err) { 
      console.error(err);
      alert("Error al procesar la orden."); 
    }
  };

  const aprobarOrden = async (id: number) => {
    if (!confirm("¿Aprobar esta orden de compra?")) return;
    try {
      await ordenesService.aprobar(id);
      await cargarDatos();
      alert("✅ Orden aprobada");
    } catch (err) {
      console.error(err);
      alert("Error al aprobar la orden");
    }
  };

  if (cargando) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  
  if (error) return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
      {error}
      <button onClick={cargarDatos} style={{ marginLeft: '10px' }}>Reintentar</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>📋 Historial de Órdenes</h2>
      
      {/* Formulario de creación */}
      <form onSubmit={manejarEnvio} style={{ 
        backgroundColor: '#242424', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {/* ✅ Selector de productos - CORREGIDO: Filtro y key única */}
        <select 
          onChange={e => setFormulario({...formulario, ProductoId: e.target.value})} 
          value={formulario.ProductoId}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: '1', minWidth: '150px' }}
        >
          <option value="">🔍 Seleccione Producto</option>
          {productos
            .filter(p => p?.ID != null) // ✅ Filtro de seguridad
            .map(p => (
              <option key={`prod-${p.ID}`} value={p.ID}>
                {p.Nombre} (Stock: {p.Stock})
              </option>
            ))}
        </select>

        {/* ✅ Selector de proveedores - CORREGIDO: Filtro y key única */}
        <select 
          onChange={e => setFormulario({...formulario, ProveedorId: e.target.value})} 
          value={formulario.ProveedorId}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: '1', minWidth: '150px' }}
        >
          <option value="">🏢 Seleccione Proveedor</option>
          {proveedores
            .filter(prov => prov?.ID != null) // ✅ Filtro de seguridad
            .map(prov => (
              <option key={`prov-${prov.ID}`} value={prov.ID}>
                {prov.NombreDeEmpresa}
              </option>
            ))}
        </select>

        <input 
          type="number" 
          placeholder="📦 Cantidad" 
          value={formulario.Cantidad} 
          onChange={e => setFormulario({...formulario, Cantidad: e.target.value})}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '120px' }}
        />
        
        <button 
          type="submit" 
          style={{
            padding: '8px 20px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Crear Orden
        </button>
      </form>

      {/* Tabla de órdenes */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Producto</th>
              <th style={{ padding: '12px' }}>Proveedor</th>
              <th style={{ padding: '12px' }}>Cantidad</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length > 0 ? (
              ordenes.map(o => (
                <tr key={`ord-${o.ID}`} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '12px' }}>{o.ID}</td>
                  <td style={{ padding: '12px' }}>{o.Producto?.Nombre || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{o.Proveedor?.NombreDeEmpresa || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{o.Cantidad} u.</td>
                  <td style={{ padding: '12px' }}><BadgeEstado estado={o.Estado} /></td>
                  <td style={{ padding: '12px' }}>
                    {o.Estado === 0 && (
                      <button 
                        onClick={() => aprobarOrden(o.ID)}
                        style={{
                          padding: '5px 12px',
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Aprobar
                      </button>
                    )}
                    {o.Estado === 1 && <span style={{ color: '#75e6da' }}>En espera</span>}
                    {o.Estado === 2 && <span style={{ color: '#8ecae6' }}>Completado</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                  No hay órdenes de compra registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}