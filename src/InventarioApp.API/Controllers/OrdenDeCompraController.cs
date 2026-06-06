using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using InventarioApp.Infrastructure.Data;
using Microsoft.Extensions.Logging; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdenDeCompraController : ControllerBase
    {
        private readonly IOrdenDeCompraRepository _repository;
        private readonly IProductoRepository _productoRepository;
        private readonly IValidator<OrdenDeCompra> _validator;
        private readonly ILogger<OrdenDeCompraController> _logger;
        private readonly AppDbContext _context;

        public OrdenDeCompraController(
            IOrdenDeCompraRepository repository,
            IProductoRepository productoRepository, 
            IValidator<OrdenDeCompra> validator, 
            ILogger<OrdenDeCompraController> logger,
            AppDbContext context)
        {
            _repository = repository;
            _productoRepository = productoRepository;
            _validator = validator;
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Consultando el listado completo de órdenes.");
            var ordenes = await _repository.GetAllAsync();
            return Ok(ordenes);
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> GetById(int ID)
        {
            var orden = await _repository.GetByIdAsync(ID);
            if (orden == null) return NotFound();
            return Ok(orden);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrdenDeCompra orden)
        {
            var validationResult = await _validator.ValidateAsync(orden);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            await _repository.AddAsync(orden);
            return CreatedAtAction(nameof(GetById), new { ID = orden.ID }, orden);
        }

        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID)
        {
            var orden = await _repository.GetByIdAsync(ID);
            if (orden == null) return NotFound();
            
            await _repository.DeleteAsync(ID);
            return NoContent();
        }

        [HttpPut("{ID}")]
        public async Task<IActionResult> Update(int ID, [FromBody] OrdenDeCompra orden)
        {
            var ordenExistente = await _repository.GetByIdAsync(ID);
            if (ordenExistente == null) return NotFound();
            
            var validationResult = await _validator.ValidateAsync(orden);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            orden.ID = ID;
            await _repository.UpdateAsync(orden);
            return Ok(orden);
        }

        [HttpPut("{ID}/aprobar")]
        public async Task<IActionResult> Aprobar(int ID)
        {
            var orden = await _repository.GetByIdAsync(ID);
            if (orden == null) return NotFound("Orden no encontrada.");
    
            if (orden.Estado != EstadoDeOrden.Pendiente) 
                return BadRequest("La orden ya fue procesada.");

            var producto = await _productoRepository.GetByIdAsync(orden.ProductoId);
            if (producto == null) return NotFound("Producto no encontrado.");
    
            if (producto.Stock < orden.Cantidad) 
                return BadRequest("Stock insuficiente.");

            producto.Stock -= orden.Cantidad;
            orden.Estado = EstadoDeOrden.Aprobado;

            await _productoRepository.UpdateAsync(producto);
            await _repository.UpdateAsync(orden);
            await _context.SaveChangesAsync(); 

            _logger.LogInformation("Orden {ID} aprobada correctamente.", ID);
            return Ok(orden);
        }
    }
}