using InventarioApp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovimientoController : ControllerBase
    {
        private readonly IMovimientoService _movimientoService;

        public MovimientoController(IMovimientoService movimientoService)
        {
            _movimientoService = movimientoService;
        }

        [HttpPost("entrada")]
        public async Task<IActionResult> RegistrarEntrada(int productoID, int proveedorID, int cantidad, double precioCompra, string notas)
        {
            await _movimientoService.RegistrarEntradaAsync(productoID, proveedorID, cantidad, precioCompra, notas);
            return Ok(new { mensaje = "Entrada de stock registrada correctamente." });
        }

        [HttpPost("salida")]
        public async Task<IActionResult> RegistrarSalida(int productoID, int cantidad, string notas)
        {
            try 
            {
                await _movimientoService.RegistrarSalidaAsync(productoID, cantidad, notas);
                return Ok(new { mensaje = "Salida de stock registrada correctamente." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        [HttpGet("historial/{productoID}")]
        public async Task<IActionResult> GetHistorial(int productoID)
        {
            var historial = await _movimientoService.ObtenerHistorialPorProductoAsync(productoID);
            return Ok(historial);
        }

        [HttpGet]
        public async Task<IActionResult> GetHistorialTodo()
        {
            var historial = await _movimientoService.ObtenerHistorialAsync();
            return Ok(historial);
        }
    }
}