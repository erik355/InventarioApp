using FluentValidation;
using InventarioApp.Domain.Entities;

namespace InventarioApp.API.Validators
{
    public class OrdenDeCompraValidator : AbstractValidator<OrdenDeCompra>
    {
        public OrdenDeCompraValidator()
        {
            RuleFor(o => o.Cantidad)
                .GreaterThan(0).WithMessage("La cantidad de la orden debe ser mayor a 0.");

            RuleFor(o => o.ProveedorId)
                .GreaterThan(0).WithMessage("Debe especificar un ID de proveedor válido.");

            RuleFor(o => o.ProductoId)
                .GreaterThan(0).WithMessage("Debe especificar un ID de producto válido.");
                
            RuleFor(o => o.Estado)
                .IsInEnum().WithMessage("El estado de la orden no es válido.");
        }
    }
}