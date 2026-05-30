using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InventarioApp.Infrastructure.Repositories
{
    public class OrdenDeCompraRepository : IOrdenDeCompraRepository
    {
        private readonly AppDbContext _context;
        public OrdenDeCompraRepository(AppDbContext context)
        {
            _context = context;
        }
        //buscar todos las ordenes de compra
        public List<OrdenDeCompra> GetAll()
        {
            return _context.OrdenDeCompras
                   .Include(o => o.Proveedor)
                   .Include(o => o.Producto)
                   .ToList();
        }
        //buscar por ID
        public OrdenDeCompra? GetById(int ID)
        {
            // CORREGIDO: Cambiado OrdenDeCompras a OrdenDeCompra y el número 0 por la letra o
            return _context.OrdenDeCompras
                   .Include(o => o.Proveedor)
                   .Include(o => o.Producto)
                   .FirstOrDefault(o => o.ID == ID);

        }
        // Agregar orden
        public void Add(OrdenDeCompra orden)
        {
            _context.OrdenDeCompras.Add(orden);
            _context.SaveChanges();
        }
        //Eliminar orden
        public void Delete(int ID)
        {
            var orden = GetById(ID);
            if(orden != null)
            {
                _context.OrdenDeCompras.Remove(orden);
                _context.SaveChanges();
            }
        }
        //Actualizar orden
        public void Update(OrdenDeCompra orden)
        {
            _context.OrdenDeCompras.Update(orden);
            _context.SaveChanges();
        }
    }
}