using System;
using System.Collections.Generic;

namespace InventarioApp.Domain.Entities
{
    public class Producto
    {
        public int ID { get; set; }
        public string? Nombre { get; set; }
        public int StockMinimo { get; set; }
        public int Stock { get; set; }
        public double PrecioVenta { get; set; } 
        public ICollection<MovimientoStock> Movimientos { get; set; } = new List<MovimientoStock>();
    }
}
