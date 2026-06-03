using System;
using System.Collections.Generic;

namespace InventarioApp.Domain.Entities
{
    public class Proveedor
    {
        public int ID {get ; set ; }
        public string? NombreDeEmpresa { get ; set ;}
        public long CUIT {get ; set ;}
        public string? Rubro {get ; set ;}
        public long Telefono {get ; set ;}

        public List<Producto> Productos { get; set; } = new List<Producto>();

    }
}