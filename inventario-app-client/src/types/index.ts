export type EstadoDeOrden = 0 | 1 | 2; 

export interface Producto {
    ID: number;
    Nombre: string;
    StockMinimo: number;
    Stock: number;
    PrecioVenta: number;
}

export interface Proveedor {
    ID: number;
    NombreDeEmpresa: string;
    CUIT: number;
    Rubro: string | null;
    Telefono: number;
}

export interface OrdenDeCompra {
    ID: number;
    Fecha: string;
    Estado: EstadoDeOrden;
    ProveedorId: number;
    ProductoId: number;
    Cantidad: number;
    Proveedor?: Proveedor;
    Producto?: Producto;
}