using System;
using System.Collections.Generic;

namespace InventarioApp.Domain.Entities

{
public class Producto
{
    public int ID {get ; set ;}
    public String? NombreDelProducto {get ; set ; }
    public int Cantidad {get ; set ;}
    public  double Precio {get ; set ;}
    public int StockMinimo{get; set ;}
    public DateTime Fecha {get ; set ;}
    public int Stock {get ; set ;}

    public List<Proveedor> Proveedores{get ; set ;} =new List<Proveedor>();
}
}
        
    