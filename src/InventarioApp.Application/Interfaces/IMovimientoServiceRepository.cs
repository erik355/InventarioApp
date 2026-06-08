using InventarioApp.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventarioApp.Application.Interfaces
{
    public interface IMovimientoService
    {
        Task RegistrarEntradaAsync(int productoID, int proveedorID, int cantidad, double precioCompra, string notas);
        Task RegistrarSalidaAsync(int productoID, int cantidad, string notas);
        Task<IEnumerable<MovimientoStock>> ObtenerHistorialPorProductoAsync(int productoID);
        Task<IEnumerable<MovimientoStock>> ObtenerHistorialAsync();
    }
}