using IncentiveTool.Api.Excel;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(o =>
{
    // Keep raw Excel header casing as property keys ("Employee Code", "TCF ID", ...)
    // rather than camelCasing them, since the frontend's ported JS reads rows by
    // those exact original header names (see pick() in engine.js).
    o.JsonSerializerOptions.PropertyNamingPolicy = null;
});
builder.Services.AddSingleton<ExcelSheetReader>();

// CORS origin(s) for the deployed frontend, comma-separated. Defaults to the local
// Vite dev server so `dotnet run` works out of the box in development.
var corsOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Frontend");
app.MapControllers();

app.Run();
