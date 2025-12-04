using Microsoft.EntityFrameworkCore;
using Nosil.Data;
using Nosil.Services;  // ReservationService namespace'i

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))); // Veritabanı bağlantısı

builder.Services.AddScoped<ReservationService>(); // ReservationService'i DI konteynerine ekleyin

// Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder => 
        {
            builder.WithOrigins("http://localhost:4200") // Angular app URL
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

builder.Services.AddControllers();  // API Controller'larını ekleyin
builder.Services.AddEndpointsApiExplorer();  // Endpoints API keşfi
builder.Services.AddSwaggerGen();  // Swagger'ı ekleyin

var app = builder.Build();

// Middleware
app.UseSwagger();  // Swagger'ı etkinleştirin
app.UseSwaggerUI(c =>  // Swagger UI için URL yapılandırması
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
});

// Use CORS before other middleware
app.UseCors("AllowAngularApp");

app.UseHttpsRedirection();  // HTTPS yönlendirmeyi etkinleştirin
app.UseAuthorization();  // Yetkilendirmeyi etkinleştirin
app.MapControllers();  // Controller'ları API ile ilişkilendirin

app.Run();
