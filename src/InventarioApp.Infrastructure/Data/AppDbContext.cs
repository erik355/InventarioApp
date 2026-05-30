using InventarioApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace InventarioApp.Infrastructure.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Producto> Producto {get ; set ;}
    public DbSet<Proveedor> Proveedor {get ; set ;}
    public DbSet<OrdenDeCompra> OrdenDeCompras { get ; set ;}

}