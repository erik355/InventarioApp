using InventarioApp.Domain.Entities;

namespace InventarioApp.Application.Interfaces
{
    public interface IOrdenDeCompraRepository
    {
        List<OrdenDeCompra> GetAll();
        OrdenDeCompra? GetById (int ID);
        void Add(OrdenDeCompra orden);
        void Delete(int ID);
        void Update(OrdenDeCompra orden);
    }
}