using InventarioApp.Domain.Entities;

namespace InventarioApp.Application.Interfaces
{
    public interface IProductoRepository
    {
        List<Producto>GetAll();
        Producto? GetById(int ID);
        void Add(Producto producto);
        void Delete(int ID);
        void Update(Producto producto);
    }
}

