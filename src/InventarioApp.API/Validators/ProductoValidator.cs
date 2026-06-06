using FluentValidation;
using InventarioApp.Domain.Entities;

namespace InventarioApp.API.Validators
{
    public class ProductoValidator : AbstractValidator<Producto>
    {
        public ProductoValidator()
        {  
            RuleFor(p => p.Nombre).NotEmpty().WithMessage("El nombre es obligatorio.");

            RuleFor(p => p.PrecioVenta).GreaterThan(0).WithMessage("El precio de venta debe ser mayor a 0.");
        }
    }
}