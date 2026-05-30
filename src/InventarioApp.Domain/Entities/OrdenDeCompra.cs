namespace InventarioApp.Domain.Entities
{
    public class OrdenDeCompra
    {
        public int ID { get; set ;}
        public DateTime  Fecha { get ; set ;}
        
        public EstadoDeOrden Estado { get; set; }
        public int ProveedorId { get ; set ;}
        public int PruductoId {get ; set ;}
        public int Cantidad {get ; set ;}
    }
    public enum EstadoDeOrden { Pendiente, Aprobado , Recibido}
}