import { useEffect, useState } from 'react';
import { movimientosService } from '../api/movimientosService';
import { productosService } from '../api/productosService';
import { proveedoresService } from '../api/proveedoresService';
import type { MovimientoStock } from '../api/movimientosService';
import type { Producto, Proveedor } from '../types';

export function Movimientos() {
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario de Ajuste
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [productoID, setProductoID] = useState('');
  const [proveedorID, setProveedorID] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setError(null);
    try {
      const [movs, prods, provs] = await Promise.all([
        movimientosService.obtenerTodos(),
        productosService.obtenerTodos(),
        proveedoresService.obtenerTodos()
      ]);
      setMovimientos(movs || []);
      setProductos(prods || []);
      setProveedores(provs || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar historial de movimientos.');
    } finally {
      setCargando(false);
    }
  };

  const registrarAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoID) return alert('Por favor, selecciona un producto.');
    if (!cantidad || Number(cantidad) <= 0) return alert('Ingresa una cantidad válida.');
    if (tipo === 'entrada' && !proveedorID) return alert('Selecciona un proveedor para las entradas.');
    
    setEnviando(true);
    try {
      const pId = Number(productoID);
      const cant = Number(cantidad);
      const prId = Number(proveedorID);
      const precio = Number(precioCompra || 0);

      if (tipo === 'entrada') {
        await movimientosService.registrarEntrada(pId, prId, cant, precio, notas);
      } else {
        await movimientosService.registrarSalida(pId, cant, notas);
      }

      setCantidad('');
      setPrecioCompra('');
      setNotas('');
      await cargarDatos();
      alert('✅ Movimiento registrado y stock actualizado con éxito.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.mensaje || 'Error al registrar el movimiento.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando auditoría...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#646cff' }}>🕰️ Auditoría y Registro de Ajustes de Stock</h2>
      {error && <div style={{ color: '#ff6b6b', marginBottom: '20px' }}>{error}</div>}

      {/* Formulario de registro */}
      <form onSubmit={registrarAjuste} style={{
        background: '#242424',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>⚙️ Registrar Ajuste Manual de Stock</h3>
        
        <div style={{
          display: 'grid',
          gap: '15px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          marginBottom: '20px'
        }}>
          {/* Tipo de Ajuste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Tipo de Ajuste</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'entrada' | 'salida')}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
            >
              <option value="entrada">➕ Entrada (Ingresar Stock)</option>
              <option value="salida">➖ Salida (Ajuste / Merma / Rotura)</option>
            </select>
          </div>

          {/* Producto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Producto</label>
            <select
              value={productoID}
              onChange={(e) => setProductoID(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
            >
              <option value="">Seleccione Producto</option>
              {productos.map(p => (
                <option key={`mov-prod-${p.ID}`} value={p.ID}>{p.Nombre} (Stock: {p.Stock})</option>
              ))}
            </select>
          </div>

          {/* Proveedor (solo Entrada) */}
          {tipo === 'entrada' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Proveedor</label>
              <select
                value={proveedorID}
                onChange={(e) => setProveedorID(e.target.value)}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
              >
                <option value="">Seleccione Proveedor</option>
                {proveedores.map(p => (
                  <option key={`mov-prov-${p.ID}`} value={p.ID}>{p.NombreDeEmpresa}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cantidad */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Cantidad</label>
            <input
              type="number"
              placeholder="Ej: 15"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              min="1"
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
            />
          </div>

          {/* Precio de Compra (solo Entrada) */}
          {tipo === 'entrada' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Precio Unitario de Compra</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ej: 150.00"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
              />
            </div>
          )}
        </div>

        {/* Notas / Justificación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
          <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Notas de Ajuste (Auditoría)</label>
          <input
            type="text"
            placeholder="Ej: Ajuste por inventario físico trimestral / Producto dañado"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: '12px 24px',
            background: tipo === 'entrada' ? '#2e7d32' : '#c62828',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: enviando ? 0.7 : 1
          }}
        >
          {enviando ? 'Guardando Ajuste...' : `Registrar ${tipo === 'entrada' ? 'Entrada' : 'Salida'}`}
        </button>
      </form>

      {/* Historial de Auditoría */}
      <h3 style={{ color: '#fff', marginBottom: '15px', textAlign: 'left' }}>📋 Registro Histórico de Transacciones</h3>
      <div style={{ overflowX: 'auto', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#2d2d2d', color: '#fff' }}>
              <th style={{ padding: '12px' }}>Fecha y Hora</th>
              <th style={{ padding: '12px' }}>Tipo</th>
              <th style={{ padding: '12px' }}>Producto</th>
              <th style={{ padding: '12px' }}>Proveedor / Origen</th>
              <th style={{ padding: '12px' }}>Cantidad</th>
              <th style={{ padding: '12px' }}>Costo Unitario</th>
              <th style={{ padding: '12px' }}>Notas de Ajuste</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length > 0 ? (
              movimientos.map(m => {
                const esEntrada = m.Cantidad > 0;
                return (
                  <tr key={`mov-row-${m.ID}`} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: '#ccc' }}>
                      {new Date(m.FechaMovimiento).toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: esEntrada ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)',
                        color: esEntrada ? '#81c784' : '#e57373'
                      }}>
                        {esEntrada ? 'ENTRADA' : 'SALIDA'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#fff' }}>{m.Producto?.Nombre || `ID: ${m.ProductoID}`}</td>
                    <td style={{ padding: '12px', color: '#ccc' }}>
                      {m.Proveedor?.NombreDeEmpresa || 'N/A (Ajuste Interno)'}
                    </td>
                    <td style={{
                      padding: '12px',
                      fontWeight: 'bold',
                      color: esEntrada ? '#81c784' : '#e57373'
                    }}>
                      {esEntrada ? `+${m.Cantidad}` : m.Cantidad} u.
                    </td>
                    <td style={{ padding: '12px', color: '#ccc' }}>
                      {m.PrecioCompra > 0 ? `$${m.PrecioCompra.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: '#aaa', fontStyle: 'italic' }}>
                      {m.Notas || '-'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                  No se registran movimientos de stock en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
