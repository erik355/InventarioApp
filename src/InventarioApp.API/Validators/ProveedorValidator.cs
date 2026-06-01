using FluentValidation;
using InventarioApp.Domain.Entities;

namespace InventarioApp.API.Validators
{
    public class ProveedorValidator : AbstractValidator<Proveedor>
    {
        public ProveedorValidator()
        {
            RuleFor(p => p.NombreDeEmpresa)
                .NotEmpty().WithMessage("El nombre de la empresa es obligatorio.");

            RuleFor(p => p.CUIT)
                .GreaterThan(0).WithMessage("El CUIT debe ser un número válido.");

            RuleFor(p => p.Rubro)
                .NotEmpty().WithMessage("El rubro es obligatorio.");
        }
    }
}