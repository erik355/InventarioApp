using InventarioApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using InventarioApp.Infrastructure.Repositories;
using InventarioApp.Application.Interfaces;
using InventarioApp.Domain.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.DependencyInjection;
using InventarioApp.API.Middleware;
using System.Text;
using FluentValidation;
using InventarioApp.API.Validators;
using InventarioApp.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi(); 
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 1. CONFIGURACIÓN DE CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<IProveedorRepository, ProveedorRepository>();
builder.Services.AddScoped<IOrdenDeCompraRepository, OrdenDeCompraRepository>();
builder.Services.AddScoped<IValidator<Producto>, ProductoValidator>();
builder.Services.AddScoped<IValidator<Proveedor>, ProveedorValidator>();
builder.Services.AddScoped<IValidator<OrdenDeCompra>, OrdenDeCompraValidator>();
builder.Services.AddScoped<IMovimientoService, MovimientoService>();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=inventario.db"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
               Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "ClaveSecretaPorDefecto123!"))
        };
    });

var app = builder.Build();

// --- INICIALIZACIÓN SEGURA DE LA BASE DE DATOS ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated(); 
}
// --------------------------------------------------

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("PermitirReact");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();