import { useEffect, useState } from 'react';
import { productosService } from '../api/productosService';
import type { Producto } from '../types';

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [cantidadBajoStock, setCantidadBajoStock] = useState<number>(0);
  
  const [formulario, setFormulario] = useState({ 
    Nombre: '', 
    PrecioVenta: '', 
    Stock: '', 
    StockMinimo: '' 
  });
  
  const [enviando, setEnviando] = useState<boolean>(false);
  const [idProductoEnEdicion, setIdProductoEnEdicion] = useState<number | null>(null);

  useEffect(() => { 
    cargarTodoElPanel(); 
  }, []);

  const cargarTodoElPanel = async () => {
    try {
      const [datosProductos, datosBajoStock, datosValorTotal] = await Promise.all([
        productosService.obtenerTodos(), 
        productosService.obtenerBajoStock(), 
        productosService.obtenerValorTotal()
      ]);
      
      setProductos(datosProductos || []);
      setCantidadBajoStock(Array.isArray(datosBajoStock) ? datosBajoStock.length : 0);
      setValorTotal(datosValorTotal?.valorTotal || 0);
      setError(null);
    } catch (err) { 
      console.error(err);
      setError("Error al cargar datos del servidor"); 
    } finally { 
      setCargando(false); 
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de datos
    if (!formulario.Nombre.trim()) {
      alert("El nombre del producto es obligatorio");
      return;
    }
    
    const precio = Number(formulario.PrecioVenta);
    const stock = parseInt(formulario.Stock, 10);
    const stockMinimo = parseInt(formulario.StockMinimo || '0', 10);
    
    if (isNaN(precio) || precio <= 0) {
      alert("El precio debe ser un número mayor a 0");
      return;
    }
    
    if (isNaN(stock) || stock < 0) {
      alert("El stock debe ser un número válido mayor o igual a 0");
      return;
    }
    
    setEnviando(true);
    
    try {
      if (idProductoEnEdicion !== null) {
        // ✅ CORREGIDO: Para actualizar, necesitas enviar el objeto completo con ID
        const productoActualizado: Producto = {
          ID: idProductoEnEdicion,
          Nombre: formulario.Nombre.trim(),
          PrecioVenta: precio,
          Stock: stock,
          StockMinimo: stockMinimo,
        };
        await productosService.actualizar(idProductoEnEdicion, productoActualizado);
      } else {
        // ✅ CORREGIDO: Para crear, envías los datos sin ID
        const nuevoProducto = {
          Nombre: formulario.Nombre.trim(),
          PrecioVenta: precio,
          Stock: stock,
          StockMinimo: stockMinimo,
        };
        await productosService.crear(nuevoProducto);
      }
      
      // Limpiar formulario
      setFormulario({ Nombre: '', PrecioVenta: '', Stock: '', StockMinimo: '' });
      setIdProductoEnEdicion(null);
      await cargarTodoElPanel();
      
    } catch (err) {
      console.error(err);
      alert("Error al guardar en el backend");
    } finally { 
      setEnviando(false); 
    }
  };

  const editarProducto = (producto: Producto) => {
    setFormulario({
      Nombre: producto.Nombre,
      PrecioVenta: producto.PrecioVenta.toString(),
      Stock: producto.Stock.toString(),
      StockMinimo: producto.StockMinimo?.toString() || '',
    });
    setIdProductoEnEdicion(producto.ID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setFormulario({ Nombre: '', PrecioVenta: '', Stock: '', StockMinimo: '' });
    setIdProductoEnEdicion(null);
  };

  if (cargando) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando datos...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#ffe6e6', borderRadius: '5px' }}>
          {error}
        </div>
      )}
      
      <h2>Control de Stock</h2>
      
      <div style={{ 
        padding: '15px', 
        background: '#f4f4f4', 
        marginBottom: '20px', 
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap'
      }}>
        <p style={{ margin: '5px' }}>
          <strong>💰 Valor Total en Stock:</strong> ${valorTotal.toFixed(2)}
        </p>
        <p style={{ margin: '5px', color: cantidadBajoStock > 0 ? '#d32f2f' : '#2e7d32' }}>
          <strong>⚠️ Productos en Bajo Stock:</strong> {cantidadBajoStock}
        </p>
      </div>

      <form onSubmit={manejarEnvio} style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        background: '#f9f9f9', 
        borderRadius: '8px' 
      }}>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <input 
            name="Nombre" 
            value={formulario.Nombre} 
            onChange={e => setFormulario({...formulario, Nombre: e.target.value})} 
            placeholder="Nombre del producto" 
            required 
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input 
            name="PrecioVenta" 
            type="number" 
            step="0.01"
            value={formulario.PrecioVenta} 
            onChange={e => setFormulario({...formulario, PrecioVenta: e.target.value})} 
            placeholder="Precio" 
            required 
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input 
            name="Stock" 
            type="number" 
            value={formulario.Stock} 
            onChange={e => setFormulario({...formulario, Stock: e.target.value})} 
            placeholder="Stock" 
            required 
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input 
            name="StockMinimo" 
            type="number" 
            value={formulario.StockMinimo} 
            onChange={e => setFormulario({...formulario, StockMinimo: e.target.value})} 
            placeholder="Stock Mínimo" 
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={enviando}
            style={{
              padding: '10px 20px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: enviando ? 'not-allowed' : 'pointer',
              opacity: enviando ? 0.7 : 1
            }}
          >
            {enviando ? 'Guardando...' : (idProductoEnEdicion ? 'Actualizar' : 'Guardar')}
          </button>
          {idProductoEnEdicion && (
            <button 
              type="button" 
              onClick={cancelarEdicion}
              style={{
                padding: '10px 20px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>📦 Lista de Productos</h3>
      {productos.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {productos.map((p) => (
            <li 
              key={p.ID}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: p.Stock <= p.StockMinimo ? '#fff3e0' : 'white',
                borderLeft: `4px solid ${p.Stock <= p.StockMinimo ? '#ff9800' : '#4caf50'}`,
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <strong>{p.Nombre}</strong> - Stock: {p.Stock} 
                {p.Stock <= p.StockMinimo && p.StockMinimo > 0 && (
                  <span style={{ color: '#ff9800', marginLeft: '10px', fontSize: '0.9em' }}>
                    ⚠️ Bajo stock (mínimo: {p.StockMinimo})
                  </span>
                )}
                <br />
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  Precio: ${p.PrecioVenta.toFixed(2)}
                </span>
              </div>
              <button 
                onClick={() => editarProducto(p)}
                style={{
                  padding: '5px 15px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay productos cargados.</p>
      )}
    </div>
  );
}