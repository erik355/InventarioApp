using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    //[Authorize]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoRepository _repository;
        private readonly IValidator<Producto> _validator;

        public ProductoController(IProductoRepository repository, IValidator<Producto> validator)
        {
            _repository = repository;
            _validator = validator;
        }
    
        // buscar todos los productos 
        [HttpGet]
        public IActionResult GetAll()
        {
            List<Producto> Productos = _repository.GetAll();
            return Ok(Productos);
        }

        //Buscar productos con paginación
        [HttpGet("paginado")]
        public IActionResult GetPaginado([FromQuery] int pagina = 1, [FromQuery] int tamano = 10)
        {
        
            if (pagina <= 0 || tamano <= 0)
            {
                return BadRequest(new { mensaje = "La página y el tamaño deben ser mayores a 0." });
            }

            List<Producto> productosPaginados = _repository.GetPaged(pagina, tamano);

            return Ok(productosPaginados);
        }

        // buscar producto por id
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

            var validationResult = _validator.Validate(Producto);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => new{
                   campo = e.PropertyName,
                   error = e.ErrorMessage 
                }));
            }
            _repository.Add(Producto);
            return CreatedAtAction(nameof(GetById), new{ID = Producto.ID},Producto);
        }

        // eliminar producto 
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

        // modificar producto
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