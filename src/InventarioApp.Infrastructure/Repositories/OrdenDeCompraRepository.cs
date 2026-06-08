using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventarioApp.Infrastructure.Repositories
{
    public class OrdenDeCompraRepository : IOrdenDeCompraRepository
    {
        private readonly AppDbContext _context;

        public OrdenDeCompraRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrdenDeCompra>> GetAllAsync()
        {
            return await _context.OrdenDeCompra
                .Include(o => o.Producto)
                .Include(o => o.Proveedor)
                .ToListAsync();
        }

        public async Task<OrdenDeCompra?> GetByIdAsync(int ID)
        {
            return await _context.OrdenDeCompra
                .Include(o => o.Producto)
                .Include(o => o.Proveedor)
                .FirstOrDefaultAsync(o => o.ID == ID);
        }

        public async Task AddAsync(OrdenDeCompra orden)
        {
            await _context.OrdenDeCompra.AddAsync(orden);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int ID)
        {
            var orden = await GetByIdAsync(ID);
            if (orden != null)
            {
                _context.OrdenDeCompra.Remove(orden);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateAsync(OrdenDeCompra orden)
        {
            _context.OrdenDeCompra.Update(orden);
            await _context.SaveChangesAsync();
        }
    }
}