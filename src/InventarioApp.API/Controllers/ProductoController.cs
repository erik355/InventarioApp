using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoRepository _repository;

        public ProductoController(IProductoRepository repository)
        {
            _repository = repository;
        }
    
    //busacr todos los productos 
        [HttpGet]
        public IActionResult GetAll()
        {
        List<Producto> Productos = _repository.GetAll();

        return Ok(Productos);

        }
    //buscar producto por id
        [HttpGet("{ID}")]
        public IActionResult GetById(int ID)
        {
             var Producto = _repository.GetById(ID);
        
        if (Producto == null)
            {
                return NotFound();
            }
        return Ok(Producto);
        }
    // crear un nuevo producto
        [HttpPost]
        public IActionResult Create([FromBody] Producto Producto)
        {
            if(Producto == null) return BadRequest();
            _repository.Add(Producto);
            return CreatedAtAction(nameof(GetById), new{ID = Producto.ID},Producto);
            
        }
    //eliminar producto 
        [HttpDelete("{ID}")]
        public IActionResult Delete (int ID)
        {
            var Producto = _repository.GetById(ID);
        if (Producto == null)
            {
                return NotFound();
            }
         _repository.Delete (ID);
         return NoContent();

        }
    //modificar producto
    [HttpPut("{ID}")]
        public IActionResult Update(int ID, [FromBody] Producto Producto)
        {
             var ProductoExistente = _repository.GetById(ID);
        
        if (ProductoExistente == null)
            {
                return NotFound();
            }
        Producto.ID = ID;
        _repository.Update(Producto);
        return Ok(Producto);
        }
        
    }
}
