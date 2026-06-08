using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore; // Necesario para FindAsync y ToListAsync
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventarioApp.Infrastructure.Services
{
    public class MovimientoService : IMovimientoService
    {
        private readonly AppDbContext _context;

        public MovimientoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarEntradaAsync(int productoID, int proveedorID, int cantidad, double precioCompra, string notas)
        {
            var movimiento = new MovimientoStock
            {
                ProductoID = productoID,
                ProveedorID = proveedorID,
                Cantidad = cantidad,
                PrecioCompra = precioCompra,
                FechaMovimiento = DateTime.Now,
                Notas = notas
            };

            var producto = await _context.Producto.FindAsync(productoID);
            if (producto != null)
            {
                producto.Stock += cantidad; 
            }

            await _context.MovimientoStock.AddAsync(movimiento);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarSalidaAsync(int productoID, int cantidad, string notas)
        {
            var producto = await _context.Producto.FindAsync(productoID);
    
            if (producto == null) throw new Exception("Producto no encontrado");
    
            if (producto.Stock < cantidad) 
            {
                 throw new Exception($"Stock insuficiente. Stock actual: {producto.Stock}");
            }

            var movimiento = new MovimientoStock
            {
                ProductoID = productoID,
                Cantidad = -cantidad,
                PrecioCompra = 0,
                FechaMovimiento = DateTime.Now,
                Notas = notas
            };

            producto.Stock -= cantidad;
            await _context.MovimientoStock.AddAsync(movimiento);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<MovimientoStock>> ObtenerHistorialPorProductoAsync(int productoID)
        {
            return await _context.MovimientoStock
                .Where(m => m.ProductoID == productoID)
                .OrderByDescending(m => m.FechaMovimiento)
                .ToListAsync();
        }

        public async Task<IEnumerable<MovimientoStock>> ObtenerHistorialAsync()
        {
            return await _context.MovimientoStock
                .Include(m => m.Producto)
                .Include(m => m.Proveedor)
                .OrderByDescending(m => m.FechaMovimiento)
                .ToListAsync();
        }
    }
}