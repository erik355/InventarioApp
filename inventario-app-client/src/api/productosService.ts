import api from './api';
import type { Producto } from '../types';

export const productosService = {
    obtenerTodos: async (): Promise<Producto[]> => {
        const { data } = await api.get<Producto[]>('/producto');
        return data;
    },

    obtenerBajoStock: async (): Promise<Producto[]> => {
        const { data } = await api.get<Producto[]>('/producto/bajo-stock');
        return data;
    },

    obtenerValorTotal: async (): Promise<{ valorTotal: number }> => {
        const { data } = await api.get<{ valorTotal: number }>('/producto/valor-total');
        return data;
    },

    crear: async (nuevoProducto: Omit<Producto, 'ID'>): Promise<Producto> => {
        const { data } = await api.post<Producto>('/producto', nuevoProducto);
        return data;
    },

    actualizar: async (id: number, productoEditado: Producto): Promise<Producto> => {
        const { data } = await api.put<Producto>(`/producto/${id}`, productoEditado);
        return data;
    },

    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/producto/${id}`);
    }
};