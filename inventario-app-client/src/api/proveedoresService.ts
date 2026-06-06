import api from './api';
import type { Proveedor } from '../types';

/**
 * Servicio para la gestión de proveedores en el backend.
 */
export const proveedoresService = {
    obtenerTodos: async (): Promise<Proveedor[]> => {
        try {
            const { data } = await api.get<Proveedor[]>('/proveedor');
            return data;
        } catch (error) {
            console.error("Error en proveedoresService.obtenerTodos:", error);
            throw new Error("No se pudo obtener el listado de proveedores.");
        }
    },

    /**
     * @param {Omit<Proveedor, 'ID'>} nuevoProveedor Datos del proveedor sin ID.
     */
    crear: async (nuevoProveedor: Omit<Proveedor, 'ID'>): Promise<Proveedor> => {
        try {
            // El backend espera 'NombreDeEmpresa', 'CUIT', etc.
            const { data } = await api.post<Proveedor>('/proveedor', nuevoProveedor);
            return data;
        } catch (error) {
            console.error("Error en proveedoresService.crear:", error);
            throw new Error("No se pudo registrar el nuevo proveedor.");
        }
    },

    eliminar: async (id: number): Promise<void> => {
        try {
            await api.delete(`/proveedor/${id}`);
        } catch (error) {
            console.error(`Error en proveedoresService.eliminar (${id}):`, error);
            throw new Error("No se pudo eliminar el proveedor.");
        }
    },

    actualizar: async (id: number, proveedorEditado: Proveedor): Promise<Proveedor> => {
        try {
            // Aseguramos que el objeto tenga la propiedad ID en mayúsculas
            const { data } = await api.put<Proveedor>(`/proveedor/${id}`, proveedorEditado);
            return data;
        } catch (error) {
            console.error(`Error en proveedoresService.actualizar (${id}):`, error);
            throw new Error("No se pudo actualizar la información del proveedor.");
        }
    }
};