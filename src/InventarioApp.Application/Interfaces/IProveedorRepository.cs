using InventarioApp.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventarioApp.Application.Interfaces
{
    public interface IProveedorRepository
    {
        Task<List<Proveedor>> GetAllAsync();
        Task<Proveedor?> GetByIdAsync(int ID);
        Task AddAsync(Proveedor proveedor);
        Task DeleteAsync(int ID);
        Task UpdateAsync(Proveedor proveedor);
    }
}