import api from './api';
import type { Proveedor } from '../types';

export const proveedoresService = {
    obtenerTodos: async (): Promise<Proveedor[]> => {
        const respuesta = await api.get<Proveedor[]>('/proveedor'); 
        return respuesta.data;
    },

    crear: async (nuevoProveedor: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
        const respuesta = await api.post<Proveedor>('/proveedor', nuevoProveedor);
        return respuesta.data;
    },

    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/proveedor/${id}`);
    },

    actualizar: async (id: number, proveedorEditado: Proveedor): Promise<Proveedor> => {
        const respuesta = await api.put<Proveedor>(`/proveedor/${id}`, proveedorEditado);
        return respuesta.data;
    }
};