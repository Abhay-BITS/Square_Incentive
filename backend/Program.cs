using IncentiveTool.Api.Excel;
using QuestPDF.Drawing;
using QuestPDF.Infrastructure;

// Load .env file if present (for local development)
var envFile = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".env");
if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#')) continue;
        var idx = trimmed.IndexOf('=');
        if (idx <= 0) continue;
        var key = trimmed[..idx].Trim();
        var val = trimmed[(idx + 1)..].Trim();
        Environment.SetEnvironmentVariable(key, val);
    }
}

// QuestPDF Community license (free for open-source projects). Review the terms at
// https://www.questpdf.com/license/ before any commercial use.
QuestPDF.Settings.License = LicenseType.Community;
foreach (var font in Directory.GetFiles(Path.Combine(AppContext.BaseDirectory, "Pdf", "fonts"), "*.ttf"))
{
    using var stream = File.OpenRead(font);
    FontManager.RegisterFont(stream);
}

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
var corsOrigins = (Environment.GetEnvironmentVariable("CORS_ORIGINS") ?? "http://localhost:5173,https://squareincentive.vercel.app")
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
