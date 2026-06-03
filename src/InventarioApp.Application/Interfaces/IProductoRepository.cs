using InventarioApp.Domain.Entities;
using System.Collections.Generic;

namespace InventarioApp.Application.Interfaces
{
    public interface IProductoRepository
    {
        List<Producto>GetAll();
        Producto? GetById(int ID);
        void Add(Producto producto);
        void Delete(int ID);
        void Update(Producto producto);
        List<Producto>GetPaged(int pagina,  int tamaño);
        List<Producto> GetProductosBajoStock();
        double GetValorTotalInventario();
    }
}

