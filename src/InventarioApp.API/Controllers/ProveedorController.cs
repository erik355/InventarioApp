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
    public class ProveedorController : ControllerBase
    {
        private readonly IProveedorRepository _repository;
        private readonly IValidator<Proveedor> _validator;
        private readonly ILogger<ProveedorController> _logger; 

        // 📦 ACTUALIZADO: Constructor inyectando el ILogger
        public ProveedorController(
            IProveedorRepository repository, 
            IValidator<Proveedor> validator, 
            ILogger<ProveedorController> logger)
        {
            _repository = repository;
            _validator = validator;
            _logger = logger;
        }

        // Buscar todos los proveedores 
        [HttpGet]
        public IActionResult GetAll()
        {
            _logger.LogInformation("Se invocó GetAll: Consultando el listado completo de proveedores.");
            List<Proveedor> Proveedores = _repository.GetAll();
            return Ok(Proveedores);
        }

        // Buscar proveedor por id
        [HttpGet("{ID}")]
        public IActionResult GetById(int ID)
        {
            _logger.LogInformation("Se invocó GetById: Buscando proveedor con ID {ID}.", ID);
            var proveedor = _repository.GetById(ID);
            
            if (proveedor == null)
            {
                _logger.LogWarning("GetById fallido: No se encontró el proveedor con ID {ID}.", ID);
                return NotFound();
            }
            return Ok(proveedor);
        }

        // Crear un nuevo proveedor
        [HttpPost]
        public IActionResult Create([FromBody] Proveedor proveedor)
        {
            _logger.LogInformation("Se invocó Create: Intentando registrar un nuevo proveedor.");
            
            if (proveedor == null) 
            {
                _logger.LogWarning("Create fallido: El cuerpo del proveedor llegó nulo.");
                return BadRequest();
            }

            var validationResult = _validator.Validate(proveedor);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Create fallido: Error de validación para el proveedor. Total errores: {CantidadErrores}", validationResult.Errors.Count);
                return BadRequest(validationResult.Errors.Select(e => new { 
                    campo = e.PropertyName, 
                    error = e.ErrorMessage 
                }));
            }

            _repository.Add(proveedor);
            _logger.LogInformation("Proveedor creado exitosamente con ID {ID}.", proveedor.ID);
            
            return CreatedAtAction(nameof(GetById), new { ID = proveedor.ID }, proveedor);
        }

        //Eliminar proveedor
        [HttpDelete("{ID}")]
        public IActionResult Delete(int ID)
        {
            _logger.LogInformation("Se invocó Delete: Intentando eliminar proveedor con ID {ID}.", ID);
            var proveedor = _repository.GetById(ID);
            
            if (proveedor == null)
            {
                _logger.LogWarning("Delete fallido: No existe el proveedor con ID {ID}.", ID);
                return NotFound();
            }
            
            _repository.Delete(ID);
            _logger.LogInformation("Proveedor con ID {ID} eliminado correctamente.", ID);
            return NoContent();
        }

        // Modificar proveedor 
        [HttpPut("{ID}")]
        public IActionResult Update(int ID, [FromBody] Proveedor proveedor)
        {
            _logger.LogInformation("Se invocó Update: Intentando modificar proveedor con ID {ID}.", ID);
            var proveedorExistente = _repository.GetById(ID);
            
            if (proveedorExistente == null)
            {
                _logger.LogWarning("Update fallido: No se encontró el proveedor para actualizar con ID {ID}.", ID);
                return NotFound();
            }
            
            proveedor.ID = ID;
            _repository.Update(proveedor);
            _logger.LogInformation("Proveedor con ID {ID} actualizado correctamente.", ID);
            
            return Ok(proveedor);
        }
    }
}