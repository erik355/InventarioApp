using Xunit;
using Microsoft.EntityFrameworkCore;
using InventarioApp.Infrastructure.Data;
using InventarioApp.Infrastructure.Repositories;
using InventarioApp.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks; // Necesario para async Task

namespace InventarioApp.Tests
{
    public class ProductoRepositoryTests
    {
        private AppDbContext GetDbContextInMemory()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task AddAsync_DeberiaGuardarProductoEnBaseDeDatos()
        {
            var context = GetDbContextInMemory();
            var repository = new ProductoRepository(context);
            
            var nuevoProducto = new Producto { ID = 1, Nombre = "Teclado Mecanico", PrecioVenta = 5000, Stock = 10 };
            
            await repository.AddAsync(nuevoProducto);

            var resultado = await repository.GetByIdAsync(1);

            Assert.NotNull(resultado);
            Assert.Equal("Teclado Mecanico", resultado.Nombre);
        }

        [Fact]
        public async Task GetByIdAsync_DeberiaDevolverNull_CuandoElIdNoExiste()
        {
            var context = GetDbContextInMemory();
            var repository = new ProductoRepository(context);

            var resultado = await repository.GetByIdAsync(99);

            Assert.Null(resultado);
        }

        [Fact]
        public async Task GetPagedAsync_DeberiaDevolverCantidadExactaYCorrectaDeElementos()
        {
            var context = GetDbContextInMemory();
            context.Producto.AddRange(new List<Producto>
            {
                new Producto { ID = 1, Nombre = "prod 1", PrecioVenta = 10 },
                new Producto { ID = 2, Nombre = "prod 2", PrecioVenta = 10 },
                new Producto { ID = 3, Nombre = "prod 3", PrecioVenta = 10 },
                new Producto { ID = 4, Nombre = "prod 4", PrecioVenta = 10 },
                new Producto { ID = 5, Nombre = "prod 5", PrecioVenta = 10 },
            });
            await context.SaveChangesAsync();
            
            var repository = new ProductoRepository(context);

            var resultado = await repository.GetPagedAsync(1, 2);

            Assert.Equal(2, resultado.Count);
            Assert.Equal("prod 1", resultado[0].Nombre);
            Assert.Equal("prod 2", resultado[1].Nombre);
        }
    }
}