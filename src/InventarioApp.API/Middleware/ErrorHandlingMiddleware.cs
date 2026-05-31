using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace InventarioApp.API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        // 1. El constructor recibe el "siguiente" middleware en la tubería
        public ErrorHandlingMiddleware (RequestDelegate next)
        {
            _next = next;
        }
        // 2. El método Invoke se ejecuta de forma automática en cada Request HTTP
        public async Task Invoke(HttpContext context)
        {
          try
            {
               await _next(context);
            }
          catch (Exception)
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"error\": \"Ocurrió un error interno.\"}");
            }
        }
    }
}