using FluentValidation;
using InventarioApp.Domain.Entities;
using System.Data;
using SQLitePCL;

namespace InventarioApp.API.Validators
{
    public class ProductoValidator : AbstractValidator<Producto>
    {
        public ProductoValidator()
        {
            RuleFor(p => p.NombreDelProducto)
                .NotEmpty().WithMessage("El nombre del producto es obligatorio")
                .NotNull().WithMessage("El nombre del producto no puede ser nulo");

            RuleFor(p => p.Precio)
                 .GreaterThan(0).WithMessage("El pricio debe se mayor a 0");

            RuleFor(p => p.Stock)
                .GreaterThan(0).WithMessage("El stock no puede ser negativo");

            RuleFor(p => p.StockMinimo)
                 .GreaterThan(0).WithMessage("El stock minimo no puede ser negativo");

            RuleFor(p =>p.Cantidad)
                 .GreaterThan(0).WithMessage("La cantidad no puede ser negativo");
        }
    }
}
