import api from './api';
import type { Producto } from '../types';

export const productosService = {
    obtenerTodos: async (): Promise<Producto[]> => {
        const respuesta = await api.get<Producto[]>('/producto');
        return respuesta.data;
    },

    obtenerPaginados: async (pagina: number = 1, tamano: number = 10): Promise<Producto[]> => {
        const respuesta = await api.get<Producto[]>('/producto/paginado', {
            params: { pagina, tamano }
        });
        return respuesta.data;
    },

    obtenerBajoStock: async (): Promise<Producto[]> => {
        const respuesta = await api.get<Producto[]>('/producto/bajo-stock');
        return respuesta.data;
    },

    obtenerValorTotal: async (): Promise<{ valorTotal: number }> => {
        const respuesta = await api.get<{ valorTotal: number }>('/producto/valor-total');
        return respuesta.data;
    },

    // Crear Producto 
    crear: async (nuevoProducto: Omit<Producto, 'id'>): Promise<Producto> => {
        const respuesta = await api.post<Producto>('/producto', nuevoProducto);
        return respuesta.data;
    },

    //Modificar Producto existente
    actualizar: async (id: number, productoEditado: Producto): Promise<Producto> => {
        const respuesta = await api.put<Producto>(`/producto/${id}`, productoEditado);
        return respuesta.data;
    },

    // Eliminar por ID
    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/producto/${id}`);
    }
};