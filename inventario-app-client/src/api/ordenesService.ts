import api from './api';
import type { OrdenDeCompra } from '../types';

export const ordenesService = {
    obtenerTodas: async (): Promise<OrdenDeCompra[]> => {
        const { data } = await api.get<OrdenDeCompra[]>('/ordendecompra');
        return data;
    },

    crear: async (nuevaOrden: Omit<OrdenDeCompra, 'ID'>): Promise<OrdenDeCompra> => {
        const { data } = await api.post<OrdenDeCompra>('/ordendecompra', nuevaOrden);
        return data;
    },

    aprobar: async (id: number): Promise<void> => {
        await api.put(`/ordendecompra/${id}/aprobar`);
    },

    eliminar: async (id: number): Promise<void> => {
        await api.delete(`/ordendecompra/${id}`);
    }
};