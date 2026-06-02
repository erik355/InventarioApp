import api from './api';
import type { Proveedor } from '../types';

export const proveedoresService = {
    obtenerTodos: async (): Promise<Proveedor[]> => {
        const respuesta = await api.get<Proveedor[]>('/proveedor'); 
        return respuesta.data;
    },

    /*
    obtenerPaginados: async (pagina: number = 1, tamano: number = 10): Promise<Proveedor[]> => {
        const respuesta = await api.get<Proveedor[]>('/proveedor/paginado', {
            params: { pagina, tamano }
        });
        return respuesta.data;
    }
    */
};