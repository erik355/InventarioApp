using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens; 
using System;
using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims; 
using System.Text; 
using System.Threading.Tasks;
using InventarioApp.API.DTOs;
using Microsoft.Extensions.Logging; 

namespace InventarioApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger; 

        public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            _logger.LogInformation("Se invocó Login: Intento de inicio de sesión iniciado.");

            // 1. Validación de entrada
            if (loginDto == null || string.IsNullOrEmpty(loginDto.Usuario) || string.IsNullOrEmpty(loginDto.Contraseña))
            {
                _logger.LogWarning("Login fallido: Datos incompletos.");
                return BadRequest("El usuario y la contraseña son requeridos.");
            }

            // 2. Verificación (Temporal: Hardcodeada)
            if (loginDto.Usuario == "admin" && loginDto.Contraseña == "1234")
            {
                _logger.LogInformation("Login exitoso para '{Usuario}'. Generando token JWT.", loginDto.Usuario);

                // 3. Crear Claims
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, loginDto.Usuario),
                    new Claim(ClaimTypes.Role, "Admin")
                };

                // 4. Configuración del Token
                var jwtKey = _configuration["Jwt:Key"];
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var tokenDescriptor = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(2), 
                    signingCredentials: creds
                );

                // 5. Generar y retornar Token
                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenString = tokenHandler.WriteToken(tokenDescriptor);

                return Ok(new 
                { 
                    token = tokenString,
                    expiracion = tokenDescriptor.ValidTo
                });
            }

            _logger.LogWarning("Login rechazado: Credenciales incorrectas para el usuario '{Usuario}'.", loginDto.Usuario);
            return Unauthorized("Usuario o Contraseña incorrecta");
        }
    }
}