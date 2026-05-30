using  InventarioApp.Domain.Entities;
namespace InventarioApp.Application.Interfaces
{
    public interface IProveedorRepository
    {
        List<Proveedor>GetAll();
        Proveedor? GetById(int ID);
        void Add(Proveedor proveedor);
        void Delete(int ID);
        void Update(Proveedor proveedor);
    }
}