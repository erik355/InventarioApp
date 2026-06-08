import React, { useEffect, useState } from 'react';
import { productosService } from '../api/productosService';
import type { Producto } from '../types';

export function Herramientas() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [productoEncontrado, setProductoEncontrado] = useState<Producto | null>(null);
  
  // Importer
  const [csvContent, setCsvContent] = useState('');
  const [importando, setImportando] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Warehouse allocation simulator
  const [warehouseSelections, setWarehouseSelections] = useState<Record<number, string>>({});

  const bodegas = [
    'Depósito Norte (Rosario)',
    'Depósito Central (CABA)',
    'Sucursal Oeste (Mendoza)',
    'Tránsito / Camión de Reparto'
  ];

  useEffect(() => {
    cargarProductos();
    // Leer asignaciones de bodega guardadas en localStorage
    const saved = localStorage.getItem('warehouseSelections');
    if (saved) {
      setWarehouseSelections(JSON.parse(saved));
    }
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await productosService.obtenerTodos();
      setProductos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Simular escaneo de código
  const manejarEscaneo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoEscaneado.trim()) return;

    // Simulación: el código de barra mapea al ID del producto o a un código mock.
    // Buscamos si coincide con ID, o simulamos que "BARCODE-001" es el Producto ID 1, etc.
    const searchId = parseInt(codigoEscaneado, 10);
    const prod = productos.find(p => p.ID === searchId || `BAR-${p.ID}` === codigoEscaneado.toUpperCase());
    
    if (prod) {
      setProductoEncontrado(prod);
      setCodigoEscaneado('');
    } else {
      alert(`⚠️ Código "${codigoEscaneado}" no registrado en el inventario.`);
      setProductoEncontrado(null);
    }
  };

  const modificarStockRapido = async (cantidadAjuste: number) => {
    if (!productoEncontrado) return;
    const nuevoStock = productoEncontrado.Stock + cantidadAjuste;
    if (nuevoStock < 0) {
      alert('Error: El stock no puede ser negativo.');
      return;
    }

    try {
      const prodActualizado = {
        ...productoEncontrado,
        Stock: nuevoStock
      };
      await productosService.actualizar(productoEncontrado.ID, prodActualizado);
      setProductoEncontrado(prodActualizado);
      await cargarProductos();
    } catch (err) {
      console.error(err);
      alert('Error al ajustar el stock rápido.');
    }
  };

  // Importar CSV
  const procesarImportacion = async () => {
    if (!csvContent.trim()) {
      alert('Por favor, introduce el texto CSV en el recuadro.');
      return;
    }

    setImportando(true);
    setImportStatus('Leyendo y validando líneas...');

    const lineas = csvContent.split('\n');
    const cabecera = lineas[0].split(',');
    
    // Validar cabeceras mínimas
    if (!cabecera.includes('Nombre') || !cabecera.includes('PrecioVenta') || !cabecera.includes('Stock')) {
      alert('CSV no válido. Debe contener las columnas: Nombre,PrecioVenta,Stock,StockMinimo');
      setImportando(false);
      return;
    }

    const indiceNombre = cabecera.indexOf('Nombre');
    const indicePrecio = cabecera.indexOf('PrecioVenta');
    const indiceStock = cabecera.indexOf('Stock');
    const indiceStockMin = cabecera.indexOf('StockMinimo');

    let importados = 0;
    let fallidos = 0;

    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;

      const columnas = linea.split(',');
      if (columnas.length < 3) {
        fallidos++;
        continue;
      }

      try {
        const nuevoProducto = {
          Nombre: columnas[indiceNombre]?.trim(),
          PrecioVenta: Number(columnas[indicePrecio]),
          Stock: parseInt(columnas[indiceStock], 10),
          StockMinimo: indiceStockMin !== -1 ? parseInt(columnas[indiceStockMin], 10) : 0
        };

        if (!nuevoProducto.Nombre || isNaN(nuevoProducto.PrecioVenta) || isNaN(nuevoProducto.Stock)) {
          fallidos++;
          continue;
        }

        setImportStatus(`Cargando (${importados + 1}/${lineas.length - 1}): ${nuevoProducto.Nombre}`);
        await productosService.crear(nuevoProducto);
        importados++;
      } catch (err) {
        console.error(err);
        fallidos++;
      }
    }

    setImportStatus(`✅ Importación completada. Exitosos: ${importados} | Fallidos: ${fallidos}`);
    setCsvContent('');
    setImportando(false);
    await cargarProductos();
  };

  // Asignar Bodega
  const asignarBodega = (prodId: number, bodega: string) => {
    const updated = {
      ...warehouseSelections,
      [prodId]: bodega
    };
    setWarehouseSelections(updated);
    localStorage.setItem('warehouseSelections', JSON.stringify(updated));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: 'sans-serif', textAlign: 'left' }}>
      <h2 style={{ marginBottom: '20px', color: '#646cff' }}>🛠️ Herramientas y Operación del Depósito</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px'
      }}>
        {/* Lector de Barras */}
        <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '10px' }}>🏷️ Simulador de Escáner de Códigos de Barras</h3>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
            Simula el ingreso por lectora láser en depósito. Escribe el ID del producto (ej: <code>1</code>, <code>2</code>) o el código de barra simulado (ej: <code>BAR-1</code>).
          </p>

          <form onSubmit={manejarEscaneo} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input
              type="text"
              placeholder="Escribe ID del producto o código de barra..."
              value={codigoEscaneado}
              onChange={(e) => setCodigoEscaneado(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #444',
                background: '#242424',
                color: '#fff',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#646cff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Escanear
            </button>
          </form>

          {productoEncontrado ? (
            <div style={{
              background: '#242424',
              padding: '20px',
              borderRadius: '8px',
              borderLeft: '4px solid #4caf50',
              color: '#fff'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#4caf50', fontSize: '1.1rem' }}>
                🏷️ Producto Escaneado: {productoEncontrado.Nombre}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#ccc', marginBottom: '20px' }}>
                <div>ID Producto: <strong>{productoEncontrado.ID}</strong></div>
                <div>Código Escaneado: <strong>BAR-{productoEncontrado.ID}</strong></div>
                <div>Precio de Venta: <strong>${productoEncontrado.PrecioVenta.toFixed(2)}</strong></div>
                <div>Stock Actual: <strong style={{ color: productoEncontrado.Stock <= productoEncontrado.StockMinimo ? '#ff9800' : '#4caf50' }}>{productoEncontrado.Stock} u.</strong></div>
              </div>

              {/* Botones de acción rápida */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => modificarStockRapido(1)}
                  style={{ flex: 1, padding: '10px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ➕ Incrementar Stock (+1)
                </button>
                <button
                  onClick={() => modificarStockRapido(-1)}
                  style={{ flex: 1, padding: '10px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ➖ Decrementar Stock (-1)
                </button>
              </div>
            </div>
          ) : (
            <div style={{ border: '1px dashed #444', padding: '30px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
              Ningún producto escaneado actualmente.
            </div>
          )}
        </div>

        {/* Importador Masivo */}
        <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '12px', border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '10px' }}>📥 Importador Masivo de Catálogo de Productos (CSV)</h3>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '15px' }}>
            Pega datos estructurados en formato CSV para ingresar stock masivamente.
          </p>

          <textarea
            rows={6}
            placeholder={`Nombre,PrecioVenta,Stock,StockMinimo\nDestornillador Phillips,120,50,10\nCaja de Herramientas Premium,1450.5,15,2\nTaladro Percutor,8900,10,3`}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            disabled={importando}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #444',
              background: '#242424',
              color: '#fff',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              marginBottom: '15px'
            }}
          />

          <button
            onClick={procesarImportacion}
            disabled={importando}
            style={{
              padding: '12px 24px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: importando ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            {importando ? 'Procesando Carga...' : '🚀 Procesar e Importar CSV'}
          </button>

          {importStatus && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: '#242424',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: '#ccc',
              borderLeft: '4px solid #646cff'
            }}>
              {importStatus}
            </div>
          )}
        </div>
      </div>

      {/* Asignador de Bodega / Depósitos */}
      <div style={{
        background: '#1a1a1a',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #333',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '10px' }}>🏢 Asignador de Ubicaciones / Depósitos Internos</h3>
        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
          Para empresas con logística multi-depósito, permite categorizar el stock asignando a qué sucursal física pertenecen los artículos del catálogo.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#2d2d2d', color: '#fff' }}>
                <th style={{ padding: '12px' }}>Producto</th>
                <th style={{ padding: '12px' }}>Stock Actual</th>
                <th style={{ padding: '12px' }}>Depósito Asignado</th>
              </tr>
            </thead>
            <tbody>
              {productos.length > 0 ? (
                productos.map(p => (
                  <tr key={`ware-${p.ID}`} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', color: '#fff', fontWeight: 'bold' }}>{p.Nombre}</td>
                    <td style={{ padding: '12px', color: '#ccc' }}>{p.Stock} u.</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={warehouseSelections[p.ID] || ''}
                        onChange={(e) => asignarBodega(p.ID, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #444',
                          background: '#242424',
                          color: '#fff',
                          width: '100%',
                          maxWidth: '300px'
                        }}
                      >
                        <option value="">⚠️ Sin depósito asignado (Bodega Virtual)</option>
                        {bodegas.map(b => (
                          <option key={`b-${b}`} value={b}>{b}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Carga productos para gestionar sus ubicaciones físicas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
