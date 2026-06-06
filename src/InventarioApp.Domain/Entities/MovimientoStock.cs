using System;

namespace InventarioApp.Domain.Entities
{
    public class MovimientoStock
    {
        public int ID { get; set; }
        
        public int ProductoID { get; set; }
        public Producto? Producto { get; set; }

        public int? ProveedorID { get; set; }
        public Proveedor? Proveedor { get; set; }

        public int Cantidad { get; set; } 
        public double PrecioCompra { get; set; } 
        public DateTime FechaMovimiento { get; set; } = DateTime.Now;
        public string? Notas { get; set; }
    }
}