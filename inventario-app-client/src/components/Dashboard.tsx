import { useEffect, useState } from 'react';
import { productosService } from '../api/productosService';
import { ordenesService } from '../api/ordenesService';
import { proveedoresService } from '../api/proveedoresService';
import type { Producto, OrdenDeCompra, Proveedor } from '../types';

export function Dashboard() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prod, ord, prov] = await Promise.all([
        productosService.obtenerTodos(),
        ordenesService.obtenerTodas(),
        proveedoresService.obtenerTodos()
      ]);
      setProductos(prod || []);
      setOrdenes(ord || []);
      setProveedores(prov || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al recuperar los datos analíticos.');
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando analíticas globales...</div>;
  if (error) return <div style={{ color: '#ff6b6b', padding: '40px', textAlign: 'center' }}>{error}</div>;

  // Cálculos de KPIs
  const valorTotal = productos.reduce((acc, p) => acc + (p.PrecioVenta * p.Stock), 0);
  const productosBajoStock = productos.filter(p => p.Stock <= p.StockMinimo && p.StockMinimo > 0);
  const cantProductosBajoStock = productosBajoStock.length;

  // Preparar datos para el gráfico de barras SVG: Stock de los primeros 5 productos
  const productosGrafico = productos.slice(0, 6);
  const maxStock = Math.max(...productosGrafico.map(p => p.Stock), 10);

  // Datos para el gráfico Donut de órdenes
  const totalOrdenes = ordenes.length || 1;
  const ord0 = ordenes.filter(o => o.Estado === 0).length;
  const ord1 = ordenes.filter(o => o.Estado === 1).length;
  const ord2 = ordenes.filter(o => o.Estado === 2).length;

  const pct0 = (ord0 / totalOrdenes) * 100;
  const pct1 = (ord1 / totalOrdenes) * 100;
  const pct2 = (ord2 / totalOrdenes) * 100;

  // Cálculos para el círculo de SVG Donut (Circunferencia = 2 * PI * r, r = 50, circ = 314.16)
  const circ = 314.16;
  const stroke0 = (pct0 / 100) * circ;
  const stroke1 = (pct1 / 100) * circ;
  const stroke2 = (pct2 / 100) * circ;

  return (
    <div style={{ padding: '10px 0', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#646cff' }}>📊 Panel de Control y Analíticas Globales</h2>

      {/* Grid de KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* KPI 1 */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #311042)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #431407',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>💰</span>
          <h3 style={{ margin: '10px 0 5px 0', fontSize: '1rem', color: '#aaa' }}>Valor Total del Inventario</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>
            ${valorTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937, #111827)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #374151',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>📦</span>
          <h3 style={{ margin: '10px 0 5px 0', fontSize: '1rem', color: '#aaa' }}>Productos en Catálogo</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#646cff' }}>
            {productos.length} items
          </p>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: 'linear-gradient(135deg, #450a0a, #180000)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #7f1d1d',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <h3 style={{ margin: '10px 0 5px 0', fontSize: '1rem', color: '#aaa' }}>Críticos por Bajo Stock</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#f87171' }}>
            {cantProductosBajoStock} alertas
          </p>
        </div>

        {/* KPI 4 */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b, #022c22)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #065f46',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🏢</span>
          <h3 style={{ margin: '10px 0 5px 0', fontSize: '1rem', color: '#aaa' }}>Proveedores Activos</h3>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold', color: '#34d399' }}>
            {proveedores.length} empresas
          </p>
        </div>
      </div>

      {/* Panel de Gráficos SVG */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px',
        marginBottom: '45px'
      }}>
        {/* Gráfico 1: Barras SVG */}
        <div style={{
          background: '#1a1a1a',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>📦 Niveles de Stock por Producto</h3>
          {productosGrafico.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {productosGrafico.map(p => {
                const pct = (p.Stock / maxStock) * 100;
                const esBajo = p.Stock <= p.StockMinimo;
                return (
                  <div key={`graf-${p.ID}`} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                      color: '#ccc',
                      textAlign: 'left'
                    }} title={p.Nombre}>
                      {p.Nombre}
                    </div>
                    <div style={{ background: '#2d2d2d', borderRadius: '8px', height: '16px', width: '100%', overflow: 'hidden' }}>
                      <div style={{
                        background: esBajo ? '#ef4444' : '#646cff',
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '8px',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: esBajo ? '#ef4444' : '#fff',
                      textAlign: 'right'
                    }}>
                      {p.Stock} u.
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Carga productos para visualizar sus existencias.</p>
          )}
        </div>

        {/* Gráfico 2: Donut SVG */}
        <div style={{
          background: '#1a1a1a',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px', alignSelf: 'flex-start', width: '100%' }}>
            📝 Estado de las Órdenes de Compra
          </h3>

          {ordenes.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap', gap: '20px' }}>
              {/* Círculo SVG Donut */}
              <svg width="160" height="160" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#2d2d2d" strokeWidth="15" />
                
                {/* Sector 0: Pendiente (Amarillo #ffcc00) */}
                {stroke0 > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#ffcc00"
                    strokeWidth="15"
                    strokeDasharray={`${stroke0} ${circ}`}
                    strokeDashoffset="0"
                  />
                )}
                
                {/* Sector 1: Aprobado (Verde #34d399) */}
                {stroke1 > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#34d399"
                    strokeWidth="15"
                    strokeDasharray={`${stroke1} ${circ}`}
                    strokeDashoffset={`-${stroke0}`}
                  />
                )}

                {/* Sector 2: Recibido (Azul #38bdf8) */}
                {stroke2 > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#38bdf8"
                    strokeWidth="15"
                    strokeDasharray={`${stroke2} ${circ}`}
                    strokeDashoffset={`-${stroke0 + stroke1}`}
                  />
                )}
              </svg>

              {/* Leyenda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffcc00' }} />
                  <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Pendientes: <strong>{ord0}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399' }} />
                  <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Aprobadas: <strong>{ord1}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#38bdf8' }} />
                  <span style={{ fontSize: '0.9rem', color: '#ccc' }}>Recibidas: <strong>{ord2}</strong></span>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '4px', fontSize: '0.8rem', color: '#666' }}>
                  Total de órdenes: {ordenes.length}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>No hay órdenes en el sistema.</p>
          )}
        </div>
      </div>

      {/* Alertas Críticas (Productos bajo stock mínimo) */}
      <div style={{
        background: '#1a1a1a',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #333',
        textAlign: 'left'
      }}>
        <h3 style={{ color: '#f87171', marginTop: 0, marginBottom: '16px' }}>⚠️ Alertas Críticas de Reabastecimiento</h3>
        {productosBajoStock.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {productosBajoStock.map(p => (
              <div key={`alert-${p.ID}`} style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '4px solid #ef4444',
                padding: '12px 16px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <strong style={{ color: '#fff' }}>{p.Nombre}</strong>
                  <span style={{ color: '#ccc', marginLeft: '12px', fontSize: '0.9rem' }}>
                    Stock actual: <strong>{p.Stock}</strong> unidades (Mínimo requerido: {p.StockMinimo})
                  </span>
                </div>
                <div style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  FALTAN {p.StockMinimo - p.Stock} u.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', margin: 0 }}>✅ Todos los productos se encuentran en niveles de stock óptimos.</p>
        )}
      </div>
    </div>
  );
}
