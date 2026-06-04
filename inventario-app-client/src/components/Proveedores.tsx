import { useEffect, useState } from 'react';
import { proveedoresService } from '../api/proveedoresService';
import type { Proveedor } from '../types';

export function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  const [formulario, setFormulario] = useState({
    nombreDeEmpresa: '',
    cuit: '',
    rubro: '',
    telefono: ''
  });

  const [enviando, setEnviando] = useState<boolean>(false);

  // 🆔 ESTADO PARA CONTROLAR EDICIÓN: Guarda el ID del proveedor seleccionado, o null si estamos creando
  const [idProveedorEnEdicion, setIdProveedorEnEdicion] = useState<number | null>(null);

  useEffect(() => {
    cargarProveedores();
  }, []);

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

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  // ✍️ FUNCIÓN PARA ACTIVAR MODO EDICIÓN: Sube los datos de la fila al formulario
  const seleccionarParaEditar = (prov: Proveedor) => {
    setIdProveedorEnEdicion(prov.id); // Guardamos el ID que estamos editando
    setFormulario({
      nombreDeEmpresa: prov.nombreDeEmpresa || '',
      cuit: prov.cuit ? prov.cuit.toString() : '',
      rubro: prov.rubro || '',
      telefono: prov.telefono ? prov.telefono.toString() : ''
    });
    // Hace un scroll suave hacia arriba para que el usuario vea el formulario cargado
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ❌ FUNCIÓN PARA CANCELAR EDICIÓN: Limpia todo y vuelve al modo Alta
  const cancelarEdicion = () => {
    setIdProveedorEnEdicion(null);
    setFormulario({ nombreDeEmpresa: '', cuit: '', rubro: '', telefono: '' });
  };

  // 📮 MANEJADOR DEL SUBMIT (Sirve para POST y PUT)
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulario.nombreDeEmpresa || !formulario.cuit) {
      alert("Por favor, completá Razón Social y CUIT.");
      return;
    }

    setEnviando(true);
    try {
      const datosProveedor = {
        nombreDeEmpresa: formulario.nombreDeEmpresa,
        cuit: Number(formulario.cuit),
        rubro: formulario.rubro || null,
        telefono: Number(formulario.telefono)
      };

      if (idProveedorEnEdicion !== null) {
        // 🔄 MODO EDICIÓN: Ejecuta el PUT en C#
        await proveedoresService.actualizar(idProveedorEnEdicion, {
          id: idProveedorEnEdicion,
          ...datosProveedor
        });
        alert("Proveedor actualizado con éxito.");
      } else {
        // ➕ MODO ALTA: Ejecuta el POST
        await proveedoresService.crear(datosProveedor);
        alert("Proveedor creado con éxito.");
      }

      // Limpiamos estados
      cancelarEdicion();
      await cargarProveedores();
    } catch (err) {
      console.error("Error al procesar el proveedor:", err);
      alert("No se pudo guardar el proveedor. Revisá los datos.");
    } finally {
      setEnviando(false);
    }
  };

  const manejarEliminar = async (id: number, razonSocial: string | null) => {
    const confirmar = window.confirm(`¿Seguro que querés eliminar a "${razonSocial || 'Este proveedor'}"?`);
    if (confirmar) {
      try {
        await proveedoresService.eliminar(id);
        setProveedores(prev => prev.filter(p => p.id !== id));
        if (idProveedorEnEdicion === id) cancelarEdicion(); // Si borran el que edito, limpio el form
        alert("Proveedor eliminado correctamente.");
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar el proveedor.");
      }
    }
  };

  if (cargando) return <div style={{ color: '#fff' }}>Cargando proveedores...</div>;
  if (error) return <div style={{ color: '#ff6b6b' }}>{error}</div>;

  const proveedoresFiltrados = proveedores.filter(prov => {
    const nombre = prov.nombreDeEmpresa ? prov.nombreDeEmpresa.toLowerCase() : '';
    const rubro = prov.rubro ? prov.rubro.toLowerCase() : '';
    const termino = busqueda.toLowerCase();
    return nombre.includes(termino) || rubro.includes(termino);
  });

  const cantidadTecnologia = proveedoresFiltrados.reduce((acumulador, prov) => {
    const rubroOriginal = prov.rubro ? prov.rubro.toLowerCase() : '';
    const rubroSinAcentos = rubroOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return rubroSinAcentos.includes('tecnologia') ? acumulador + 1 : acumulador;
  }, 0); 

  return (
    <div>
      <h2>Directorio de Proveedores</h2>
      <p style={{ color: '#aaa' }}>Empresas de distribución asociadas | <span style={{ color: '#646cff', fontWeight: 'bold' }}>💻 {cantidadTecnologia} de Tecnología</span></p>
      
      {/* FORMULARIO DINÁMICO (POST / PUT) */}
      <form onSubmit={manejarEnvio} style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: `1px solid ${idProveedorEnEdicion ? '#646cff' : '#333'}` }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: idProveedorEnEdicion ? '#646cff' : '#646cff' }}>
          {idProveedorEnEdicion ? `✏️ Editar Proveedor (ID: ${idProveedorEnEdicion})` : '➕ Agregar Nuevo Proveedor'}
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input type="text" name="nombreDeEmpresa" placeholder="Razón Social *" value={formulario.nombreDeEmpresa} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '200px' }} />
          <input type="number" name="cuit" placeholder="CUIT (Solo números) *" value={formulario.cuit} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '200px' }} />
          <input type="text" name="rubro" placeholder="Rubro (Ej: Tecnología)" value={formulario.rubro} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '200px' }} />
          <input type="number" name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={manejarCambioInput} style={{ padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px', flex: '1', minWidth: '200px' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={enviando} style={{ padding: '10px 20px', backgroundColor: idProveedorEnEdicion ? '#2e7d32' : '#646cff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
            {enviando ? 'Guardando...' : idProveedorEnEdicion ? '💾 Actualizar Cambios' : '💾 Guardar Proveedor'}
          </button>
          
          {idProveedorEnEdicion && (
            <button type="button" onClick={cancelarEdicion} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>

      <hr style={{ border: '0', borderTop: '1px solid #333', marginBottom: '20px' }} />

      {/* INPUT DEL BUSCADOR */}
      <div style={{ marginBottom: '15px' }}>
        <input type="text" placeholder="🔍 Buscar por razón social o rubro..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '10px 15px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
      </div>

      {/* TABLA SEMÁNTICA */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
        <thead style={{ backgroundColor: '#242424' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Razón Social</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>CUIT</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Rubro</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'left', color: '#fff' }}>Teléfono</th>
            <th style={{ padding: '12px', borderBottom: '2px solid #444', textAlign: 'center', color: '#fff' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedoresFiltrados.length > 0 ? (
            proveedoresFiltrados.map(prov => (
              <tr key={prov.id} style={{ borderBottom: '1px solid #333', backgroundColor: idProveedorEnEdicion === prov.id ? '#1e293b' : 'transparent' }}>
                <td style={{ padding: '12px' }}>{prov.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#646cff' }}>{prov.nombreDeEmpresa}</td>
                <td style={{ padding: '12px' }}>{prov.cuit}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ backgroundColor: '#2d2d2d', padding: '2px 6px', borderRadius: '4px' }}>
                    {prov.rubro || 'Sin Rubro'}
                  </span>
                </td>
                <td style={{ padding: '12px', color: '#aaa' }}>{prov.telefono}</td>
                
                <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {/* ✏️ BOTÓN SELECCIONAR PARA EDITAR */}
                  <button
                    onClick={() => seleccionarParaEditar(prov)}
                    style={{ backgroundColor: 'transparent', color: '#ffd166', border: '1px solid #ffd166', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => manejarEliminar(prov.id, prov.nombreDeEmpresa)}
                    style={{ backgroundColor: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No se encontraron proveedores que coincidan con "{busqueda}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}