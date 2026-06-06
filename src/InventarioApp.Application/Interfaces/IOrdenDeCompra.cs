using InventarioApp.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventarioApp.Application.Interfaces
{
    public interface IOrdenDeCompraRepository
    {
        Task<List<OrdenDeCompra>> GetAllAsync();
        Task<OrdenDeCompra?> GetByIdAsync(int ID);
        Task AddAsync(OrdenDeCompra orden);
        Task DeleteAsync(int ID);
        Task UpdateAsync(OrdenDeCompra orden);
    }
}