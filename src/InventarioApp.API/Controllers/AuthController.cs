using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens; 
using System;
using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims; 
using System.Text; 
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
        // 📦 ACTUALIZADO: Constructor inyectando el ILogger junto a la configuración
        public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            _logger.LogInformation("Se invocó Login: Intento de inicio de sesión iniciado.");

            // VALIDACION DE NULOS BASICA
            if (loginDto == null || string.IsNullOrEmpty(loginDto.Usuario) || string.IsNullOrEmpty(loginDto.Contraseña))
            {
                _logger.LogWarning("Login fallido: Datos incompletos en la solicitud.");
                return BadRequest("El usuario y la contraseña son requeridos.");
            }

            // Verificacion hardcodeada (temporal)
            if (loginDto.Usuario == "admin" && loginDto.Contraseña == "1234")
            {
                _logger.LogInformation("Login exitoso para el usuario: '{Usuario}'. Generando credenciales de seguridad.", loginDto.Usuario);

                //Crear los Claims (la información del usuario que viaja en el token)
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, loginDto.Usuario),
                    new Claim(ClaimTypes.Role, "Admin"), // Rol inventado por ahora
                    new Claim("MiDatoPersonalizado", "Lo que quieras poner acá") 
                };

                //Levantar los datos del JWT desde el appsettings.json
                var jwtKey = _configuration["Jwt:Key"];
                var jwtIssuer = _configuration["Jwt:Issuer"];
                var jwtAudience = _configuration["Jwt:Audience"];

                // Crear la clave simétrica y las credenciales de firma
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                // Crear el esqueleto del Token (Payload y configuración)
                var tokenDescriptor = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.Now.AddHours(2), // El token expira en 2 horas
                    signingCredentials: creds
                );

                //Generar el string final del token usando el Handler
                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenString = tokenHandler.WriteToken(tokenDescriptor);

                _logger.LogInformation("Token JWT emitido correctamente para el usuario '{Usuario}'. Expira el: {Expiracion}", loginDto.Usuario, tokenDescriptor.ValidTo);

                //Devolver el token al cliente
                return Ok(new 
                { 
                    token = tokenString,
                    expiracion = tokenDescriptor.ValidTo
                });
            }

            // Si las credenciales no coinciden (Alerta de seguridad potencial)
            _logger.LogWarning("Login rechazado: Credenciales incorrectas para el intento de usuario '{Usuario}'.", loginDto.Usuario);
            return Unauthorized("Usuario o Contraseña incorrecta");
        }
    }
}