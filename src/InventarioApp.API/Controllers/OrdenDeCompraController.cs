using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdenDeCompraController : ControllerBase
    {
        private readonly IOrdenDeCompraRepository _repository;

        public OrdenDeCompraController(IOrdenDeCompraRepository repository)
        {
            _repository = repository;
        }

        // Buscar todas las órdenes de compra 
        [HttpGet]
        public IActionResult GetAll()
        {
            List<OrdenDeCompra> Ordenes = _repository.GetAll();
            return Ok(Ordenes);
        }

        // Buscar orden por id
        [HttpGet("{ID}")]
        public IActionResult GetById(int ID)
        {
            var orden = _repository.GetById(ID);
            if (orden == null)
            {
                return NotFound();
            }
            return Ok(orden);
        }

        // Crear una nueva orden de compra
        [HttpPost]
        public IActionResult Create([FromBody] OrdenDeCompra orden)
        {
            if (orden == null) return BadRequest();
            
            _repository.Add(orden);
            return CreatedAtAction(nameof(GetById), new { ID = orden.ID }, orden);
        }

        // Eliminar orden de compra 
        [HttpDelete("{ID}")]
        public IActionResult Delete(int ID)
        {
            var orden = _repository.GetById(ID);
            if (orden == null)
            {
                return NotFound();
            }
            
            _repository.Delete(ID);
            return NoContent();
        }

        // Modificar orden de compra
        [HttpPut("{ID}")]
        public IActionResult Update(int ID, [FromBody] OrdenDeCompra orden)
        {
            var ordenExistente = _repository.GetById(ID);
            if (ordenExistente == null)
            {
                return NotFound();
            }
            
            orden.ID = ID;
            _repository.Update(orden);
            return Ok(orden);
        }
    }
}