using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedorController : ControllerBase
    {
        private readonly IProveedorRepository _repository;
        private readonly IValidator<Proveedor> _validator;

        public ProveedorController(IProveedorRepository repository, IValidator<Proveedor> validator)
        {
            _repository = repository;
            _validator = validator;
        }

        // Buscar todos los proveedores 
        [HttpGet]
        public IActionResult GetAll()
        {
            List<Proveedor> Proveedores = _repository.GetAll();
            return Ok(Proveedores);
        }

        // Buscar proveedor por id
        [HttpGet("{ID}")]
        public IActionResult GetById(int ID)
        {
            var proveedor = _repository.GetById(ID);
            if (proveedor == null)
            {
                return NotFound();
            }
            return Ok(proveedor);
        }

        // Crear un nuevo proveedor
       [HttpPost]
public IActionResult Create([FromBody] Proveedor proveedor)
{
    if (proveedor == null) return BadRequest();

    var validationResult = _validator.Validate(proveedor);
    if (!validationResult.IsValid)
    {
        return BadRequest(validationResult.Errors.Select(e => new { 
            campo = e.PropertyName, 
            error = e.ErrorMessage 
        }));
    }

    _repository.Add(proveedor);
    return CreatedAtAction(nameof(GetById), new { ID = proveedor.ID }, proveedor);
}
        //Eliminar proveedor
        [HttpDelete("{ID}")]
        public IActionResult Delete(int ID)
        {
            var proveedor =_repository.GetById(ID);
            if(proveedor == null)
            {
                return NotFound();
            }
            _repository.Delete(ID);
            return NoContent();
        }
        // Modificar proveedor 
        [HttpPut("{ID}")]
        public IActionResult Update(int ID, [FromBody] Proveedor proveedor)
        {
            var proveedorExistente = _repository.GetById(ID);
            if(proveedorExistente == null)
            {
                return NotFound();
            }
            proveedor.ID = ID;
            _repository.Update(proveedor);
            return Ok(proveedor);
        }
    }
}