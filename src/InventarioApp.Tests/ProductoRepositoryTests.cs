using Xunit;
using Microsoft.EntityFrameworkCore;
using InventarioApp.Infrastructure.Data;
using InventarioApp.Infrastructure.Repositories;
using InventarioApp.Domain.Entities;
using System.Collections.Generic;


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
    public void Add_DeberiaGuardarProductoEnBaseDeDatos()
        {
            var context = GetDbContextInMemory();
            var repository = new ProductoRepository(context);
            var nuevoProducto = new Producto { ID = 1, NombreDelProducto = "Teclado Mecanico", Precio = 5000, Stock = 10};
            repository.Add(nuevoProducto);
            context.SaveChanges();


            var resultado = repository.GetById(1);

            Assert.NotNull(resultado);
            Assert.Equal("Teclado Mecanico", resultado.NombreDelProducto);
        }
        [Fact]
        public void GetById_DeberiaDevolverNull_CuandoElIdNoExiste()
        {
            var context = GetDbContextInMemory();
            var repository = new ProductoRepository(context);

            var resultado = repository.GetById(99);

            Assert.Null(resultado);
        }
        [Fact]
        public void GetPaged_DeberiaDevolverCantidadExactsYCorrectaDeElementos()
        {
            var context = GetDbContextInMemory();
            context.Producto.AddRange(new List<Producto>
            {
                new Producto { ID = 1, NombreDelProducto = "prod 1", Precio = 10},
                new Producto { ID = 2, NombreDelProducto = "prod 2", Precio = 10},
                new Producto { ID = 3, NombreDelProducto = "prod 3", Precio = 10},
                new Producto { ID = 4, NombreDelProducto = "prod 4", Precio = 10},
                new Producto { ID = 5, NombreDelProducto = "prod 5", Precio = 10},
            });
            context.SaveChanges();
            var repository = new ProductoRepository(context);

            var resultado = repository.GetPaged( 1, 2);

            Assert.Equal(2, resultado.Count);
            Assert.Equal("prod 1", resultado [0].NombreDelProducto);
            Assert.Equal("prod 2", resultado [1].NombreDelProducto);
        }
    }
}