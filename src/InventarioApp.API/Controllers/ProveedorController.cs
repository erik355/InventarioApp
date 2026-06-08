using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using Microsoft.Extensions.Logging; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedorController : ControllerBase
    {
        private readonly IProveedorRepository _repository;
        private readonly IValidator<Proveedor> _validator;
        private readonly ILogger<ProveedorController> _logger; 

        public ProveedorController(
            IProveedorRepository repository, 
            IValidator<Proveedor> validator, 
            ILogger<ProveedorController> logger)
        {
            _repository = repository;
            _validator = validator;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Se invocó GetAll: Consultando el listado completo de proveedores.");
            var proveedores = await _repository.GetAllAsync();
            
            // ✅ FILTRAR proveedores con ID válido
            var proveedoresValidos = proveedores.Where(p => p != null && p.ID > 0).ToList();
            
            if (proveedores.Count != proveedoresValidos.Count)
                _logger.LogWarning($"⚠️ Se omitieron {proveedores.Count - proveedoresValidos.Count} proveedores con ID inválido");
            
            return Ok(proveedoresValidos);
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> GetById(int ID)
        {
            _logger.LogInformation("Se invocó GetById: Buscando proveedor con ID {ID}.", ID);
            
            // ✅ Validar ID
            if (ID <= 0)
            {
                _logger.LogWarning("GetById fallido: ID inválido {ID}.", ID);
                return BadRequest(new { mensaje = "ID inválido" });
            }
            
            var proveedor = await _repository.GetByIdAsync(ID);
            
            if (proveedor == null)
            {
                _logger.LogWarning("GetById fallido: No se encontró el proveedor con ID {ID}.", ID);
                return NotFound();
            }
            
            // ✅ Validar que el proveedor no esté corrupto
            if (proveedor.ID <= 0)
            {
                _logger.LogWarning($"Proveedor con ID {ID} tiene ID inválido");
                return NotFound();
            }
            
            return Ok(proveedor);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Proveedor proveedor)
        {
            _logger.LogInformation("Se invocó Create: Intentando registrar un nuevo proveedor.");
            
            if (proveedor == null) 
            {
                return BadRequest("Proveedor no puede ser nulo");
            }

            var validationResult = await _validator.ValidateAsync(proveedor);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => new { 
                    campo = e.PropertyName, 
                    error = e.ErrorMessage 
                }));
            }

            await _repository.AddAsync(proveedor);
            return CreatedAtAction(nameof(GetById), new { ID = proveedor.ID }, proveedor);
        }

        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID)
        {
            // ✅ Validar ID
            if (ID <= 0)
            {
                return BadRequest("ID inválido");
            }
            
            var proveedor = await _repository.GetByIdAsync(ID);
            if (proveedor == null) return NotFound();
            
            await _repository.DeleteAsync(ID);
            _logger.LogInformation("Proveedor con ID {ID} eliminado correctamente.", ID);
            return NoContent();
        }

        [HttpPut("{ID}")]
        public async Task<IActionResult> Update(int ID, [FromBody] Proveedor proveedor)
        {
            // ✅ Validar ID
            if (ID <= 0)
            {
                return BadRequest("ID inválido");
            }
            
            var proveedorExistente = await _repository.GetByIdAsync(ID);
            if (proveedorExistente == null) return NotFound();
            
            var validationResult = await _validator.ValidateAsync(proveedor);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            // ✅ Mantener el ID original
            proveedor.ID = ID;
            await _repository.UpdateAsync(proveedor);
            
            _logger.LogInformation("Proveedor con ID {ID} actualizado correctamente.", ID);
            return Ok(proveedor);
        }
    }
}