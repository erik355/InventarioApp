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
            
            // ✅ FILTRAR productos con ID válido
            var productosValidos = productos.Where(p => p != null && p.ID > 0).ToList();
            
            if (productos.Count != productosValidos.Count)
                _logger.LogWarning($"⚠️ Se omitieron {productos.Count - productosValidos.Count} productos con ID inválido");
            
            return Ok(productosValidos);
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
            
            // ✅ Filtrar productos con ID válido en paginado
            if (productosPaginados != null && productosPaginados.Any())
            {
                productosPaginados = productosPaginados.Where(p => p != null && p.ID > 0).ToList();
            }
            
            return Ok(productosPaginados);
        }

        [HttpGet("bajo-stock")]
        public async Task<IActionResult> GetBajoStock()
        {
            _logger.LogInformation("Se invocó GetBajoStock: Consultando productos con stock crítico.");
            var productos = await _repository.GetAllAsync();
            
            // ✅ Filtrar productos válidos y luego aplicar condición de bajo stock
            var productosValidos = productos.Where(p => p != null && p.ID > 0).ToList();
            var productosCriticos = productosValidos.Where(p => p.Stock <= p.StockMinimo).ToList();
            
            return Ok(productosCriticos);
        }

        [HttpGet("valor-total")]
        public async Task<IActionResult> GetValorTotal()
        {
            _logger.LogInformation("Se invocó GetValorTotal: Calculando valor total.");
            
            // ✅ Calcular basado en productos actuales, no en movimientos
            var productos = await _repository.GetAllAsync();
            var valorTotal = productos
                .Where(p => p != null && p.ID > 0 && p.PrecioVenta > 0)
                .Sum(p => p.PrecioVenta * p.Stock);
            
            _logger.LogInformation($"Valor total calculado: {valorTotal}");
            
            return Ok(new { valorTotal = valorTotal });
        }

        [HttpGet("{ID}")]
        public async Task<IActionResult> GetById(int ID)
        {
            _logger.LogInformation("Se invocó GetById con ID {ID}.", ID);
            
            // ✅ Validar ID
            if (ID <= 0)
            {
                return BadRequest(new { mensaje = "ID inválido" });
            }
            
            var producto = await _repository.GetByIdAsync(ID);
            if (producto == null) return NotFound();
            
            // ✅ Validar que el producto no esté corrupto
            if (producto.ID <= 0 || producto.PrecioVenta <= 0)
            {
                _logger.LogWarning($"Producto con ID {ID} tiene datos inválidos");
                return NotFound();
            }
            
            return Ok(producto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Producto producto)
        {
            // ✅ Validación adicional
            if (producto == null)
            {
                return BadRequest("Producto no puede ser nulo");
            }
            
            var validationResult = await _validator.ValidateAsync(producto);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            await _repository.AddAsync(producto);
            return CreatedAtAction(nameof(GetById), new { ID = producto.ID }, producto);
        }

        [HttpDelete("{ID}")]
        public async Task<IActionResult> Delete(int ID)
        {
            // ✅ Validar ID
            if (ID <= 0)
            {
                return BadRequest("ID inválido");
            }
            
            var producto = await _repository.GetByIdAsync(ID);
            if (producto == null) return NotFound();

            await _repository.DeleteAsync(ID);
            return NoContent();
        }

        [HttpPut("{ID}")]
        public async Task<IActionResult> Update(int ID, [FromBody] Producto producto)
        {
            // ✅ Validar ID
            if (ID <= 0)
            {
                return BadRequest("ID inválido");
            }
            
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