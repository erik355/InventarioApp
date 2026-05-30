namespace InventarioApp.Domain.Entities
{
    public class Proveedor
    {
        public int ID {get ; set ; }
        public string? NombreDeEmpresa { get ; set ;}
        public long CUIT {get ; set ;}
        public string? Rubro {get ; set ;}
        public long Telefono {get ; set ;}


    }
}