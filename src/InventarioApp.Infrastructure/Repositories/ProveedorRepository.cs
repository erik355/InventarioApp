using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore; // Necesario para los métodos Async
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks; // Necesario para Task

namespace InventarioApp.Infrastructure.Repositories
{
    public class ProveedorRepository : IProveedorRepository
    {
        private readonly AppDbContext _context;
        
        public ProveedorRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Proveedor>> GetAllAsync()
        {
            return await _context.Proveedor.ToListAsync();
        }

        public async Task<Proveedor?> GetByIdAsync(int ID)
        {
            return await _context.Proveedor.FirstOrDefaultAsync(p => p.ID == ID);
        }

        public async Task AddAsync(Proveedor proveedor)
        {
            await _context.Proveedor.AddAsync(proveedor);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int ID)
        {
            var proveedor = await GetByIdAsync(ID);
            if (proveedor != null)
            {
                _context.Proveedor.Remove(proveedor);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateAsync(Proveedor proveedor)
        {
            _context.Proveedor.Update(proveedor);
            await _context.SaveChangesAsync();
        }
    }
}