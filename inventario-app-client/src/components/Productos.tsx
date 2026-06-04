import { useEffect, useState } from 'react';
import { productosService } from '../api/productosService';
import type { Producto } from '../types';

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [valorTotal, setValorTotal] = useState<number>(0);
  const [cantidadBajoStock, setCantidadBajoStock] = useState<number>(0);

  const [soloMostrarAlertas, setSoloMostrarAlertas] = useState<boolean>(false);

  // 📝 ESTADO DEL FORMULARIO: Mapea los campos específicos del Producto
  const [formulario, setFormulario] = useState({
    nombreDelProducto: '',
    precio: '',
    stock: '',
    stockMinimo: ''
  });

  const [enviando, setEnviando] = useState<boolean>(false);

  // 🆔 ESTADO PARA CONTROLAR EDICIÓN
  const [idProductoEnEdicion, setIdProductoEnEdicion] = useState<number | null>(null);

  useEffect(() => {
    cargarTodoElPanel();
  }, []);

  // Centralizamos la carga para poder reutilizarla después de cada POST, PUT o DELETE
  const cargarTodoElPanel = async () => {
    try {
      const [datosProductos, datosBajoStock, datosValorTotal] = await Promise.all([
        productosService.obtenerTodos(),
        productosService.obtenerBajoStock(),   
        productosService.obtenerValorTotal()   
      ]);

      setProductos(datosProductos);
      setCantidadBajoStock(datosBajoStock.length); 
      setValorTotal(datosValorTotal.valorTotal);   
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las métricas ni los productos.");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  // ✍️ ACTIVAR MODO EDICIÓN: Rellena el formulario con los datos numéricos pasados a string
  const seleccionarParaEditar = (p: Producto) => {
    setIdProductoEnEdicion(p.id);
    setFormulario({
      nombreDelProducto: p.nombreDelProducto || '',
      precio: p.precio ? p.precio.toString() : '',
      stock: p.stock !== undefined ? p.stock.toString() : '',
      stockMinimo: p.stockMinimo !== undefined ? p.stockMinimo.toString() : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ❌ CANCELAR EDICIÓN
  const cancelarEdicion = () => {
    setIdProductoEnEdicion(null);
    setFormulario({ nombreDelProducto: '', precio: '', stock: '', stockMinimo: '' });
  };

  // 📮 MANEJADOR DEL SUBMIT (POST / PUT)
 const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulario.nombreDelProducto || !formulario.precio || !formulario.stock) {
      alert("Por favor, completá los campos obligatorios.");
      return;
    }

    setEnviando(true);
    try {
      
      const datosProducto: Omit<Producto, 'id'> = {
        nombreDelProducto: formulario.nombreDelProducto,
        precio: Number(formulario.precio),
        stock: parseInt(formulario.stock, 10),
        cantidad: parseInt(formulario.stock, 10), 
        stockMinimo: formulario.stockMinimo ? parseInt(formulario.stockMinimo, 10) : 0,
        fecha: new Date().toISOString() 
      };

      if (idProductoEnEdicion !== null) {
        await productosService.actualizar(idProductoEnEdicion, {
          id: idProductoEnEdicion,
          ...datosProducto
        });
        alert("Producto actualizado con éxito.");
      } else {
        await productosService.crear(datosProducto);
        alert("Producto creado con éxito.");
      }

      cancelarEdicion();
      await cargarTodoElPanel();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("No se pudo guardar el producto. Revisá los campos.");
    } finally {
      setEnviando(false);
    }
  };

  // 🗑️ MANEJADOR DEL DELETE
  const manejarEliminar = async (id: number, nombre: string | null) => {
    const confirmar = window.confirm(`¿Seguro que querés eliminar "${nombre || 'Este producto'}" del inventario?`);
    if (confirmar) {
      try {
        await productosService.eliminar(id);
        if (idProductoEnEdicion === id) cancelarEdicion();
        await cargarTodoElPanel(); // Recargamos para que impacte en el total en pesos y contadores
        alert("Producto eliminado correctamente.");
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el producto. Comprobá si tiene órdenes de compra asociadas.");
      }
    }
  };

  if (cargando) return <div style={{ color: '#fff' }}>Cargando panel de productos...</div>;
  if (error) return <div style={{ color: '#ff6b6b' }}>{error}</div>;

  const productosRenderizados = soloMostrarAlertas
    ? productos.filter(p => p.stock <= p.stockMinimo)
    : productos;

  return (
    <div>
      <h2>Control de Stock - Productos</h2>
      <p style={{ color: '#aaa' }}>Listado de artículos en almacén</p>
      
      {/* 📥 FORMULARIO DINÁMICO (POST / PUT) */}
      <form onSubmit={manejarEnvio} style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${idProductoEnEdicion ? '#646cff' : '#333'}` }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#646cff' }}>
          {idProductoEnEdicion ? `✏️ Editar Producto (ID: ${idProductoEnEdicion})` : '➕ Agregar Nuevo Producto'}
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input type="text" name="nombreDelProducto" placeholder="Nombre del Producto *" value={formulario.nombreDelProducto} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '2', minWidth: '200px' }} />
          <input type="number" step="0.01" name="precio" placeholder="Precio ($) *" value={formulario.precio} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '120px' }} />
          <input type="number" name="stock" placeholder="Stock Inicial *" value={formulario.stock} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '120px' }} />
          <input type="number" name="stockMinimo" placeholder="Stock Mínimo Alerta" value={formulario.stockMinimo} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '120px' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={enviando} style={{ padding: '10px 20px', backgroundColor: idProductoEnEdicion ? '#2e7d32' : '#646cff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
            {enviando ? 'Guardando...' : idProductoEnEdicion ? '💾 Actualizar Cambios' : '💾 Guardar Producto'}
          </button>
          
          {idProductoEnEdicion && (
            <button type="button" onClick={cancelarEdicion} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>

      {/* 📊 SECCIÓN DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px', marginTop: '20px' }}>
        <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#888', fontSize: '14px', fontWeight: 'bold' }}>VALOR TOTAL DEL INVENTARIO</span>
          <span style={{ color: '#4caf50', fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>
            {valorTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
          </span>
        </div>

        <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#ff6b6b', fontSize: '14px', fontWeight: 'bold' }}>PRODUCTOS BAJO STOCK CRÍTICO</span>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>
            {cantidadBajoStock} <span style={{ fontSize: '18px', color: '#ff6b6b' }}>en alerta ⚠️</span>
          </span>
        </div>
      </div>

      {/* 🔘 BARRA DE HERRAMIENTAS */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setSoloMostrarAlertas(!soloMostrarAlertas)}
          style={{ padding: '8px 16px', backgroundColor: soloMostrarAlertas ? '#ff6b6b' : '#242424', color: '#fff', border: soloMostrarAlertas ? '1px solid #ff6b6b' : '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
        >
          {soloMostrarAlertas ? '🚫 Mostrar Todos' : '⚠️ Filtrar Alertas Críticas'}
        </button>
      </div>

      {/* 📋 SECCIÓN TABLA */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead style={{ backgroundColor: '#242424' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Nombre</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Precio</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Stock Actual</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Stock Mínimo</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'center', color: '#fff' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosRenderizados.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #333', backgroundColor: idProductoEnEdicion === p.id ? '#1e293b' : 'transparent' }}>
              <td style={{ padding: '12px' }}>{p.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#646cff' }}>{p.nombreDelProducto}</td>
              <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                {p.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </td>
              <td style={{ padding: '12px', color: p.stock <= p.stockMinimo ? '#ff6b6b' : '#fff' }}>
                {p.stock} u. {p.stock <= p.stockMinimo && '⚠️'}
              </td>
              <td style={{ padding: '12px', color: '#888' }}>{p.stockMinimo} u.</td>
              
              {/* 🕹️ COLUMNA DE ACCIONES */}
              <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => seleccionarParaEditar(p)}
                  style={{ backgroundColor: 'transparent', color: '#ffd166', border: '1px solid #ffd166', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => manejarEliminar(p.id, p.nombreDelProducto)}
                  style={{ backgroundColor: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}