export interface Producto {
    id: number;
    nombre: string;
    precio: number;
}

export interface Proveedor {
    id: number;
    nombre: string;
}

export interface OrdenDeCompra {
    id: number;
    fecha: string;
    cantidad: number;
    estado: 'Pendiente' | 'Aprobado' | 'Recibido';
    productoId: number;
    proveedorId: number;
    producto?: Producto;   
    proveedor?: Proveedor;
}