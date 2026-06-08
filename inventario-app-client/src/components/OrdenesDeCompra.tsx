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

  const eliminarOrden = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta orden de compra?")) return;
    try {
      await ordenesService.eliminar(id);
      await cargarDatos();
      alert("✅ Orden de compra eliminada con éxito");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la orden de compra");
    }
  };

  const imprimirOrdenPDF = (orden: OrdenDeCompra) => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;
    
    const idFormateado = orden.ID.toString().padStart(5, '0');
    const fechaFormateada = new Date(orden.Fecha).toLocaleDateString('es-AR');
    const estadoTexto = orden.Estado === 0 ? 'Pendiente' : orden.Estado === 1 ? 'Aprobado' : 'Recibido';
    const proveedorNombre = orden.Proveedor?.NombreDeEmpresa || 'N/A';
    const proveedorCuit = orden.Proveedor?.CUIT || '-';
    const proveedorTel = orden.Proveedor?.Telefono || '-';
    const productoNombre = orden.Producto?.Nombre || 'N/A';
    const productoPrecio = orden.Producto?.PrecioVenta || 0;
    const subtotal = orden.Cantidad * productoPrecio;
    const fechaActual = new Date().toLocaleString('es-AR');

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Orden de Compra #OC-${idFormateado}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .header { border-bottom: 2px solid #646cff; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 26px; font-weight: bold; color: #646cff; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            .info-title { font-weight: bold; color: #666; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .details-table th, .details-table td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            .details-table th { background: #646cff; color: white; text-transform: uppercase; font-size: 13px; }
            .total-box { text-align: right; font-size: 20px; font-weight: bold; margin-bottom: 40px; border-top: 2px solid #eee; padding-top: 15px; color: #646cff; }
            .footer { text-align: center; color: #999; font-size: 11px; margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="title">📦 INVENTARIOAPP GLOBAL</div>
              <div style="font-size: 13px; color: #666; margin-top: 5px;">Sistema Corporativo de Logística</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold;">ORDEN DE COMPRA</div>
              <div style="color: #666; font-size: 13px;">Ref: #OC-${idFormateado}</div>
            </div>
          </div>

          <div class="info-grid" style="display: flex; gap: 20px; margin-bottom: 30px;">
            <div class="info-box" style="flex: 1; min-width: 200px;">
              <div class="info-title">Proveedor Destinatario</div>
              <strong style="font-size: 16px;">${proveedorNombre}</strong><br/>
              CUIT: ${proveedorCuit}<br/>
              Teléfono: ${proveedorTel}
            </div>
            <div class="info-box" style="flex: 1; min-width: 200px;">
              <div class="info-title">Detalles del Envío</div>
              Fecha de Emisión: ${fechaFormateada}<br/>
              Estado de la Orden: ${estadoTexto}<br/>
              Almacén Destino: Depósito Central
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>ID Producto</th>
                <th>Descripción del Artículo</th>
                <th>Cantidad Solicitada</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${orden.ProductoId}</td>
                <td><strong>${productoNombre}</strong></td>
                <td>${orden.Cantidad} unidades</td>
                <td>$${productoPrecio.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            VALOR TOTAL DE ORDEN: $${subtotal.toFixed(2)}
          </div>

          <div class="footer">
            Documento de validez interna de InventarioApp Global. Copia del comprobante de despacho.<br/>
            Generado por sistema el ${fechaActual}
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
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
        {/* Selector de productos */}
        <select 
          onChange={e => setFormulario({...formulario, ProductoId: e.target.value})} 
          value={formulario.ProductoId}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: '1', minWidth: '150px' }}
        >
          <option value="">🔍 Seleccione Producto</option>
          {productos.map(p => (
            <option key={`prod-${p.ID}`} value={p.ID}>
              {p.Nombre} (Stock: {p.Stock})
            </option>
          ))}
        </select>

        {/* Selector de proveedores */}
        <select 
          onChange={e => setFormulario({...formulario, ProveedorId: e.target.value})} 
          value={formulario.ProveedorId}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', flex: '1', minWidth: '150px' }}
        >
          <option value="">🏢 Seleccione Proveedor</option>
          {proveedores.map(prov => (
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                      
                      <button 
                        onClick={() => eliminarOrden(o.ID)}
                        style={{
                          padding: '5px 12px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Eliminar
                      </button>

                      <button 
                        onClick={() => imprimirOrdenPDF(o)}
                        style={{
                          padding: '5px 12px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        🖨️ PDF
                      </button>
                    </div>
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