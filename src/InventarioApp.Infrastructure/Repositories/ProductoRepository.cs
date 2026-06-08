using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventarioApp.Infrastructure.Repositories
{
    public class ProductoRepository : IProductoRepository
    {
        private readonly AppDbContext _context;
        
        public ProductoRepository(AppDbContext context)
        {
            _context = context;
        }
    
        public async Task<List<Producto>> GetAllAsync()
        {
            return await _context.Producto.ToListAsync();
        }
        
        public async Task<Producto?> GetByIdAsync(int ID)
        {
            return await _context.Producto.FirstOrDefaultAsync(p => p.ID == ID);
        }
        
        public async Task AddAsync(Producto producto)
        {
            await _context.Producto.AddAsync(producto);
            await _context.SaveChangesAsync();
        }
        
        public async Task DeleteAsync(int ID)
        {
            var producto = await GetByIdAsync(ID); 
            if (producto != null)
            { 
                _context.Producto.Remove(producto);
                await _context.SaveChangesAsync();
            }
        }
       
        public async Task UpdateAsync(Producto producto)
        {
            _context.Producto.Update(producto);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Producto>> GetPagedAsync(int pagina, int tamaño)
        {
            return await _context.Producto
               .OrderBy(p => p.ID)
               .Skip((pagina - 1) * tamaño)
               .Take(tamaño)
               .ToListAsync();
        }

        public async Task<List<Producto>> GetProductosBajoStockAsync()
        {
            return await _context.Producto
                .Where(p => p.Stock <= p.StockMinimo)
                .ToListAsync();
        }

        // ✅ MÉTODO CORREGIDO
        public async Task<double> GetValorTotalInventarioAsync()
        {
            var productos = await _context.Producto
                .Where(p => p.ID > 0 && p.PrecioVenta > 0)
                .ToListAsync();
            
            return productos.Sum(p => p.PrecioVenta * p.Stock);
        }
    }
}