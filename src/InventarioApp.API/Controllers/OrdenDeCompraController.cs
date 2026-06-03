using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using Microsoft.Extensions.Logging; 
using System.Collections.Generic;
using System.Linq;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdenDeCompraController : ControllerBase
    {
        private readonly IOrdenDeCompraRepository _repository;
        private readonly IValidator<OrdenDeCompra> _validator;
        private readonly ILogger<OrdenDeCompraController> _logger; 
        // 📦 ACTUALIZADO: Constructor inyectando el ILogger
        public OrdenDeCompraController(
            IOrdenDeCompraRepository repository, 
            IValidator<OrdenDeCompra> validator, 
            ILogger<OrdenDeCompraController> logger)
        {
            _repository = repository;
            _validator = validator;
            _logger = logger;
        }

        // Buscar todas las órdenes de compra 
        [HttpGet]
        public IActionResult GetAll()
        {
            _logger.LogInformation("Se invocó GetAll: Consultando el listado completo de órdenes de compra.");
            List<OrdenDeCompra> Ordenes = _repository.GetAll();
            return Ok(Ordenes);
        }

        // Buscar orden por id
        [HttpGet("{ID}")]
        public IActionResult GetById(int ID)
        {
            _logger.LogInformation("Se invocó GetById: Buscando orden de compra con ID {ID}.", ID);
            var orden = _repository.GetById(ID);
            
            if (orden == null)
            {
                _logger.LogWarning("GetById fallido: No se encontró la orden de compra con ID {ID}.", ID);
                return NotFound();
            }
            return Ok(orden);
        }

        // Crear una nueva orden de compra
        [HttpPost]
        public IActionResult Create([FromBody] OrdenDeCompra orden)
        {
            _logger.LogInformation("Se invocó Create: Intentando registrar una nueva orden de compra.");
            
            if (orden == null) 
            {
                _logger.LogWarning("Create fallido: El cuerpo de la orden llegó nulo.");
                return BadRequest();
            }

            var validationResult = _validator.Validate(orden);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Create fallido: Error de validación para la orden de compra. Total errores: {CantidadErrores}", validationResult.Errors.Count);
                return BadRequest(validationResult.Errors.Select(e => new { 
                    campo = e.PropertyName, 
                    error = e.ErrorMessage 
                }));
            }

            _repository.Add(orden);
            _logger.LogInformation("Orden de compra creada exitosamente con ID {ID}.", orden.ID);
            
            return CreatedAtAction(nameof(GetById), new { ID = orden.ID }, orden);
        }

        // Eliminar orden de compra 
        [HttpDelete("{ID}")]
        public IActionResult Delete(int ID)
        {
            _logger.LogInformation("Se invocó Delete: Intentando eliminar orden de compra con ID {ID}.", ID);
            var orden = _repository.GetById(ID);
            
            if (orden == null)
            {
                _logger.LogWarning("Delete fallido: No existe la orden de compra con ID {ID}.", ID);
                return NotFound();
            }
            
            _repository.Delete(ID);
            _logger.LogInformation("Orden de compra con ID {ID} eliminada correctamente.", ID);
            return NoContent();
        }

        // Modificar orden de compra
        [HttpPut("{ID}")]
        public IActionResult Update(int ID, [FromBody] OrdenDeCompra orden)
        {
            _logger.LogInformation("Se invocó Update: Intentando modificar orden de compra con ID {ID}.", ID);
            var ordenExistente = _repository.GetById(ID);
            
            if (ordenExistente == null)
            {
                _logger.LogWarning("Update fallido: No se encontró la orden de compra para actualizar con ID {ID}.", ID);
                return NotFound();
            }
            
            orden.ID = ID;
            _repository.Update(orden);
            _logger.LogInformation("Orden de compra con ID {ID} actualizada correctamente.", ID);
            
            return Ok(orden);
        }
    }
}