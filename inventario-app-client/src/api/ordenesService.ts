// src/api/ordenesService.ts
import api from './api';
import type { OrdenDeCompra } from '../types';

export const ordenesService = {
    obtenerTodas: async (): Promise<OrdenDeCompra[]> => {
        const respuesta = await api.get<OrdenDeCompra[]>('/ordendecompra'); 
        return respuesta.data;
    },

    // 🚀 NUEVO MÉTODO PARA CREAR ORDEN
    crear: async (nuevaOrden: Omit<OrdenDeCompra, 'id' | 'proveedor' | 'producto'>): Promise<OrdenDeCompra> => {
        const respuesta = await api.post<OrdenDeCompra>('/ordendecompra', nuevaOrden);
        return respuesta.data;
    }
};