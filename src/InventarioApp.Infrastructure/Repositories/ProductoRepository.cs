using System.Runtime.InteropServices;
using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Metadata;
using SQLitePCL;

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
    }
}