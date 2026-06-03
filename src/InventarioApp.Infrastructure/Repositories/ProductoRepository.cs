using System.Runtime.InteropServices;
using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Metadata;
using SQLitePCL;
using System.Collections.Generic;
using System.Linq;

namespace InventarioApp.Infrastructure.Repositories
{
    public class ProductoRepository : IProductoRepository
    {
        private readonly AppDbContext _context;
        
        public ProductoRepository(AppDbContext context)
        {
            _context = context;
        }
    
        // Buscar todos los productos 
        public List<Producto> GetAll()
        {
           return _context.Producto.ToList();
        }
        
        //Cambiado de GetByID a GetById
        public Producto? GetById(int ID)
        {
            return _context.Producto.FirstOrDefault(p => p.ID == ID);
        }
        
        // Agregar producto
        public void Add(Producto Producto)
        {
            _context.Producto.Add(Producto);
            _context.SaveChanges();
        }
        
        // eliminar producto
        public void Delete(int ID)
        {
            var producto = GetById(ID); 
            if (producto != null)
            { 
                _context.Producto.Remove(producto);
                _context.SaveChanges();
            }
        }
       
        // Actualizar producto
        public void Update(Producto Producto)
        {
            _context.Producto.Update(Producto);
            _context.SaveChanges();
        }

        //Obtener productos paginados
        public List<Producto> GetPaged(int pagina, int tamaño)
        {
            return _context.Producto
               .OrderBy(p => p.ID)
               .Skip((pagina - 1) * tamaño)
               .Take(tamaño)
               .ToList();
        }

        //Obtener productos con stock critico
        public List<Producto> GetProductosBajoStock()
        {
            return _context.Producto
                .Where(p => p.Stock <= p.StockMinimo)
                .ToList();
        }

        //Multiplica Precio * Stock de cada producto y suma todo eficientemente
        public double GetValorTotalInventario()
        {
            return _context.Producto.Sum(p => p.Precio * p.Stock);
        }
    }
}