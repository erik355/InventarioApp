using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using InventarioApp.Infrastructure.Data;

namespace InventarioApp.Infrastructure.Repositories
{
    public class ProveedorRepository : IProveedorRepository
    {
        private readonly AppDbContext _context;
        public ProveedorRepository(AppDbContext context)
        {
            _context = context;
        }
        //Buscar todos los proveedores 
        public List<Proveedor> GetAll()
        {
            return _context.Proveedor.ToList();
        }
        //Busacar proveedor por ID
        public Proveedor? GetById(int ID)
        {
            return _context.Proveedor.FirstOrDefault(p=> p.ID == ID);
        }
        //Agregar prodeedor 
        public void Add(Proveedor proveedor)
        {
            _context.Proveedor.Add(proveedor);
            _context.SaveChanges();
        }
        //eliminar proveedor 
        public void Delete(int ID)
        {
            var proveedor = GetById(ID);
            if (proveedor != null)
            {
                _context.Proveedor.Remove(proveedor);
                _context.SaveChanges();
            }
        }
        //Actualizar proveedor 
        public void Update (Proveedor proveedor)
        {
            _context.Proveedor.Update(proveedor);
            _context.SaveChanges();
        }
    }
}