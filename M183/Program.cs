using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using M183.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Logging-Konfiguration hinzufügen  
builder.Logging.ClearProviders();
builder.Logging.AddConsole();  // Logs in der Konsole  
builder.Logging.AddDebug();    // Debug-Output in Entwicklungsumgebungen  
builder.Logging.SetMinimumLevel(LogLevel.Information); // Filter für minimale Protokollierung  

builder.Services.AddControllers();

// 1. Datenbankkonfiguration (Server-Side)  
builder.Services.AddDbContext<NewsAppContext>(options =>
   options.UseSqlServer(builder.Configuration.GetConnectionString("SongContext")));

// 2. JWT-Schlüssel aus Konfiguration laden (Server-Side)  
var securityKey = new SymmetricSecurityKey(
   Convert.FromBase64String(builder.Configuration["Jwt:Key"]!));

// JWT-Authentifizierung einrichten  
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
           IssuerSigningKey = securityKey
       };
   });

// 4. Swagger/OpenAPI-Konfiguration (Fur API-Dokumentation)  
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SwaggerAnnotation", Version = "v1" });

    // 5. Swagger-JWT-Unterstützung (Fur Testzwecke in der Entwicklung)  
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
   {
       {
           new OpenApiSecurityScheme
           {
               Reference = new OpenApiReference
               {
                   Type = ReferenceType.SecurityScheme,
                   Id = "Bearer"
               }
           },
           Array.Empty<string>()
       }
   });
});

builder.Services.AddAuthorization();

var app = builder.Build();

// 6. Middleware-Konfiguration (Server-Side)  
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Middleware-Pipeline  
app.UseAuthentication(); // <-- Zuerst  
app.UseAuthorization();  // <-- Dann  

app.MapControllers();
app.Run();
