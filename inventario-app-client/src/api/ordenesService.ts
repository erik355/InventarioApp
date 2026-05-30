// src/api/ordenesService.ts
import api from './api';
import type { OrdenDeCompra } from '../types';

export const ordenesService = {
    // Este método llama directamente al "GetAll()" de tu repositorio en C#
    obtenerTodas: async (): Promise<OrdenDeCompra[]> => {
        const respuesta = await api.get<OrdenDeCompra[]>('/ordendecompra'); // Ajustá la ruta según tu Controller
        return respuesta.data;
    }
};