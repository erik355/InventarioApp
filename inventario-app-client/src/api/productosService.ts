import api from './api';
import type { Producto } from '../types';

export const productosService = {
    obtenerTodos: async (): Promise<Producto[]> => {
        const respuesta = await api.get<Producto[]>('/producto');
        return respuesta.data;
    },

    obtenerPaginados: async (pagina: number = 1, tamano: number = 10): Promise<Producto[]> => {
        const respuesta = await api.get<Producto[]>('/producto/paginado', {
            params: {
                pagina: pagina,
                tamano: tamano
            }
        });
        return respuesta.data;
    }
};