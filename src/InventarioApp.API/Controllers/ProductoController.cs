using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace InventarioApp.API.Controllers
{
    [ApiController]
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
    
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Se solicitaron todos los productos");
            var productos = await _repository.GetAllAsync();
            return Ok(productos);
        }

        [HttpGet("paginado")]
        public async Task<IActionResult> GetPaginado([FromQuery] int pagina = 1, [FromQuery] int tamano = 10)
        {
            _logger.LogInformation("Se invocó GetPaginado: Página {Pagina}, Tamaño {Tamano}.", pagina, tamano);
            if (pagina <= 0 || tamano <= 0)
            {
                return BadRequest(new { mensaje = "La página y el tamaño deben ser mayores a 0." });
            }

            var productosPaginados = await _repository.GetPagedAsync(pagina, tamano);
            return Ok(productosPaginados);
        }

        [HttpGet("bajo-stock")]
        public async Task<IActionResult> GetBajoStock()
        {
            _logger.LogInformation("Se invocó GetBajoStock: Consultando productos con stock crítico.");
            var productosCriticos = await _repository.GetProductosBajoStockAsync();
            return Ok(productosCriticos);
        }

        [HttpGet("valor-total")]
        public async Task<IActionResult> GetValorTotal()
        {
            _logger.LogInformation("Se invocó GetValorTotal: Calculando valor total.");
            double valorTotal = await _repository.GetValorTotalInventarioAsync();
            return Ok(new { valorTotal = valorTotal });
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> GetById(int ID)
        {
            _logger.LogInformation("Se invocó GetById con ID {ID}.", ID);
            var producto = await _repository.GetByIdAsync(ID);
            if (producto == null) return NotFound();
            return Ok(producto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Producto producto)
        {
            var validationResult = await _validator.ValidateAsync(producto);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            await _repository.AddAsync(producto);
            return CreatedAtAction(nameof(GetById), new { ID = producto.ID }, producto);
        }

        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID)
        {
            var producto = await _repository.GetByIdAsync(ID);
            if (producto == null) return NotFound();

            await _repository.DeleteAsync(ID);
            return NoContent();
        }

        [HttpPut("{ID}")]
        public async Task<IActionResult> Update(int ID, [FromBody] Producto producto)
        {
            var productoExistente = await _repository.GetByIdAsync(ID);
            if (productoExistente == null) return NotFound();

            var validationResult = await _validator.ValidateAsync(producto);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            productoExistente.Nombre = producto.Nombre;
            productoExistente.PrecioVenta = producto.PrecioVenta;
            productoExistente.Stock = producto.Stock;
            productoExistente.StockMinimo = producto.StockMinimo;

            await _repository.UpdateAsync(productoExistente);
            return Ok(productoExistente);
        }
    }
}