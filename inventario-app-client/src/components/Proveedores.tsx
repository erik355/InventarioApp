import { useEffect, useState, useMemo } from 'react';
import { proveedoresService } from '../api/proveedoresService';
import type { Proveedor } from '../types';

export function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);
  const [idProveedorEnEdicion, setIdProveedorEnEdicion] = useState<number | null>(null);
  
  const [formulario, setFormulario] = useState({
    NombreDeEmpresa: '', CUIT: '', Rubro: '', Telefono: ''
  });

  useEffect(() => { cargarProveedores(); }, []);

  const cargarProveedores = async () => {
    try {
      const datos = await proveedoresService.obtenerTodos();
      setProveedores(datos);
      setError(null);
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const proveedoresFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase();
    return proveedores.filter(prov => 
      prov.NombreDeEmpresa?.toLowerCase().includes(termino) || 
      prov.Rubro?.toLowerCase().includes(termino)
    );
  }, [proveedores, busqueda]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formulario.CUIT.length !== 11) {
      alert("El CUIT debe tener 11 dígitos.");
      return;
    }

    setEnviando(true);
    try {
      const data = {
        NombreDeEmpresa: formulario.NombreDeEmpresa,
        CUIT: Number(formulario.CUIT),
        Rubro: formulario.Rubro,
        Telefono: Number(formulario.Telefono)
      };

      if (idProveedorEnEdicion) {
        // Enviar con ID en mayúsculas como espera el backend
        await proveedoresService.actualizar(idProveedorEnEdicion, { ...data, ID: idProveedorEnEdicion } as Proveedor);
      } else {
        await proveedoresService.crear(data as Proveedor);
      }
      
      cancelarEdicion();
      await cargarProveedores();
    } catch {
      alert("Error al procesar el proveedor.");
    } finally {
      setEnviando(false);
    }
  };

  const cancelarEdicion = () => {
    setIdProveedorEnEdicion(null);
    setFormulario({ NombreDeEmpresa: '', CUIT: '', Rubro: '', Telefono: '' });
  };

  if (cargando) return <div style={{ color: '#fff' }}>Cargando directorio...</div>;

  return (
    <div>
      <h2>Directorio de Proveedores</h2>
      {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
      
      <form onSubmit={manejarEnvio} style={{ backgroundColor: '#242424', padding: '20px', borderRadius: '8px' }}>
        <h3>{idProveedorEnEdicion ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}</h3>
        <input name="NombreDeEmpresa" placeholder="Razón Social" value={formulario.NombreDeEmpresa} onChange={e => setFormulario({...formulario, NombreDeEmpresa: e.target.value})} required />
        <input name="CUIT" type="number" placeholder="CUIT (11 dígitos)" value={formulario.CUIT} onChange={e => setFormulario({...formulario, CUIT: e.target.value})} required />
        <input name="Rubro" placeholder="Rubro" value={formulario.Rubro} onChange={e => setFormulario({...formulario, Rubro: e.target.value})} />
        <input name="Telefono" type="number" placeholder="Teléfono" value={formulario.Telefono} onChange={e => setFormulario({...formulario, Telefono: e.target.value})} />
        <button type="submit" disabled={enviando}>{enviando ? '...' : '💾 Guardar'}</button>
        {idProveedorEnEdicion && <button type="button" onClick={cancelarEdicion}>Cancelar</button>}
      </form>

      <input placeholder="🔍 Buscar..." onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', margin: '20px 0', padding: '10px' }} />

      <table>
        <thead>
          <tr><th>Razón Social</th><th>CUIT</th><th>Rubro</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {proveedoresFiltrados.map(prov => (
            <tr key={prov.ID}>
              <td>{prov.NombreDeEmpresa}</td>
              <td>{prov.CUIT}</td>
              <td>{prov.Rubro}</td>
              <td>
                <button onClick={() => { 
                  setIdProveedorEnEdicion(prov.ID); 
                  setFormulario({ 
                    NombreDeEmpresa: prov.NombreDeEmpresa || '', 
                    CUIT: prov.CUIT.toString(), 
                    Rubro: prov.Rubro || '', 
                    Telefono: prov.Telefono?.toString() || '' 
                  }); 
                }}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}