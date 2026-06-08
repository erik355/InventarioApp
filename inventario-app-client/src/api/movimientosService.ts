import api from './api';

export interface MovimientoStock {
    ID: number;
    ProductoID: number;
    Producto?: {
        ID: number;
        Nombre: string;
    };
    ProveedorID?: number;
    Proveedor?: {
        ID: number;
        NombreDeEmpresa: string;
    };
    Cantidad: number;
    PrecioCompra: number;
    FechaMovimiento: string;
    Notas?: string;
}

export const movimientosService = {
    obtenerTodos: async (): Promise<MovimientoStock[]> => {
        const { data } = await api.get<MovimientoStock[]>('/movimiento');
        return data;
    },

    registrarEntrada: async (
        productoID: number, 
        proveedorID: number, 
        cantidad: number, 
        precioCompra: number, 
        notas: string
    ): Promise<void> => {
        await api.post(`/movimiento/entrada?productoID=${productoID}&proveedorID=${proveedorID}&cantidad=${cantidad}&precioCompra=${precioCompra}&notas=${encodeURIComponent(notas)}`);
    },

    registrarSalida: async (
        productoID: number, 
        cantidad: number, 
        notas: string
    ): Promise<void> => {
        await api.post(`/movimiento/salida?productoID=${productoID}&cantidad=${cantidad}&notas=${encodeURIComponent(notas)}`);
    }
};
