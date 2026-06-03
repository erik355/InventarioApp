using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    //[Authorize]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoRepository _repository;
        private readonly IValidator<Producto> _validator;
        private readonly ILogger<ProductoController> _logger;

        public ProductoController(IProductoRepository repository, IValidator<Producto> validator, ILogger<ProductoController> logger)
        {
            _repository = repository;
            _validator = validator;
            _logger = logger;
        }
    
        // buscar todos los productos 
        [HttpGet]
        public IActionResult GetAll()
        {
            _logger.LogInformation("Se solicitaron todos los productos");
            List<Producto> Productos = _repository.GetAll();
            return Ok(Productos);
        }

        //Buscar productos con paginación
        [HttpGet("paginado")]
        public IActionResult GetPaginado([FromQuery] int pagina = 1, [FromQuery] int tamano = 10)
        {
        
            _logger.LogInformation("Se invocó GetPaginado: Página {Pagina}, Tamaño {Tamano}.", pagina, tamano);
            if (pagina <= 0 || tamano <= 0)
            {
                _logger.LogWarning("Paginación fallida: Parámetros inválidos (Pagina: {Pagina}, Tamano: {Tamano}).", pagina, tamano);
                return BadRequest(new { mensaje = "La página y el tamaño deben ser mayores a 0." });
            }

            List<Producto> productosPaginados = _repository.GetPaged(pagina, tamano);

            return Ok(productosPaginados);
        }

        // buscar producto por id
        [HttpGet("{ID}")]
        public IActionResult GetById(int ID)
        {
            _logger.LogInformation("Se invocó GetById: Buscando producto con ID {ID}.", ID);
            var Producto = _repository.GetById(ID);
        
            if (Producto == null)
            {
                _logger.LogWarning("GetById fallido: No se encontró el producto con ID {ID}.", ID);
                return NotFound();
            }
            return Ok(Producto);
        }

        // crear un nuevo producto
        [HttpPost]
        public IActionResult Create([FromBody] Producto Producto)
        {
            _logger.LogInformation("Se invocó Create: Intentando registrar un nuevo producto.");
            if(Producto == null) return BadRequest();

            var validationResult = _validator.Validate(Producto);

            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Create fallido: Error de validación para el producto. Total errores: {CantidadErrores}", validationResult.Errors.Count);
                return BadRequest(validationResult.Errors.Select(e => new{
                   campo = e.PropertyName,
                   error = e.ErrorMessage 
                }));
            }
            _repository.Add(Producto);
            _logger.LogInformation("Producto creado exitosamente con ID {ID}.", Producto.ID);
            return CreatedAtAction(nameof(GetById), new{ID = Producto.ID},Producto);
        }

        // eliminar producto 
        [HttpDelete("{ID}")]
        public IActionResult Delete (int ID)
        {
            _logger.LogInformation("Se invocó Delete: Intentando eliminar producto con ID {ID}.", ID);
            var Producto = _repository.GetById(ID);
            if (Producto == null)
            {
                _logger.LogWarning("Delete fallido: No existe el producto con ID {ID}.", ID);
                return NotFound();
            }
            _repository.Delete (ID);
            _logger.LogInformation("Producto con ID {ID} eliminado correctamente.", ID);
            return NoContent();
        }

        // modificar producto
        [HttpPut("{ID}")]
        public IActionResult Update(int ID, [FromBody] Producto Producto)
        {
            _logger.LogInformation("Se invocó Update: Intentando modificar producto con ID {ID}.", ID);
            var ProductoExistente = _repository.GetById(ID);
        
            if (ProductoExistente == null)
            {
                _logger.LogWarning("Update fallido: No se encontró el producto para actualizar con ID {ID}.", ID);
                return NotFound();
            }
            Producto.ID = ID;
            _repository.Update(Producto);
            _logger.LogInformation("Producto con ID {ID} actualizado correctamente.", ID);
            return Ok(Producto);
        }
    }
}