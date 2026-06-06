using InventarioApp.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventarioApp.Application.Interfaces
{
    public interface IProductoRepository
    {
        Task<List<Producto>> GetAllAsync();
        Task<Producto?> GetByIdAsync(int ID);
        Task AddAsync(Producto producto);
        Task DeleteAsync(int ID);
        Task UpdateAsync(Producto producto);
        Task<List<Producto>> GetPagedAsync(int pagina, int tamaño);
        Task<List<Producto>> GetProductosBajoStockAsync();
        Task<double> GetValorTotalInventarioAsync();
    }
}