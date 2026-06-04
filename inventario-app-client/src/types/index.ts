export interface Producto {
    id: number;
    nombreDelProducto: string | null; 
    cantidad: number;
    precio: number;                   
    stockMinimo: number;
    fecha: string;                    
    stock: number;
}

export interface Proveedor {
    id: number;
    nombreDeEmpresa: string | null;   
    cuit: number;                   
    rubro: string | null;             
    telefono: number;                 
}

export type EstadoDeOrden = 0 | 1 | 2;

export interface OrdenDeCompra {
    id: number;
    Id?: number; // Soporte para PascalCase de C#
    fecha: string;
    Fecha?: string;
    estado: EstadoDeOrden;
    Estado?: EstadoDeOrden;
    proveedorId: number;
    ProveedorId?: number;
    productoId: number;
    ProductoId?: number;
    cantidad: number;
    Cantidad?: number;
    
    proveedor?: Proveedor | null;
    producto?: Producto | null;
}