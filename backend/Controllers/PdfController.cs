using System.IO.Compression;
using System.Text.Json;
using IncentiveTool.Api.Pdf;
using Microsoft.AspNetCore.Mvc;

namespace IncentiveTool.Api.Controllers;

/// <summary>
/// Server-side PDF generation with QuestPDF. The body is the same RM object the frontend
/// already holds (RM fields plus the calc results from the calculation engine).
/// </summary>
[ApiController]
[Route("api/pdf")]
public class PdfController : ControllerBase
{
    private readonly ILogger<PdfController> _logger;

    public PdfController(ILogger<PdfController> logger) => _logger = logger;

    [HttpPost("single")]
    [RequestSizeLimit(20_000_000)]
    public IActionResult Single([FromBody] JsonElement rm)
    {
        try
        {
            return File(Renderer.Render(rm), "application/pdf", Renderer.FileName(rm));
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            _logger.LogWarning(ex, "Invalid RM payload for PDF");
            return BadRequest(new { error = "Invalid RM payload: " + ex.Message });
        }
    }

    [HttpPost("zip")]
    [RequestSizeLimit(200_000_000)]
    public IActionResult Zip([FromBody] JsonElement rms)
    {
        if (rms.ValueKind != JsonValueKind.Array || rms.GetArrayLength() == 0)
            return BadRequest(new { error = "Expected a non-empty array of RMs." });
        try
        {
            using var ms = new MemoryStream();
            using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, true))
            {
                foreach (var rm in rms.EnumerateArray())
                {
                    var entry = zip.CreateEntry(Renderer.FileName(rm), CompressionLevel.Fastest);
                    using var es = entry.Open();
                    var bytes = Renderer.Render(rm);
                    es.Write(bytes, 0, bytes.Length);
                }
            }
            return File(ms.ToArray(), "application/zip", $"incentive_pdfs_{DateTime.UtcNow:yyyyMMdd-HHmmss}.zip");
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            _logger.LogWarning(ex, "Invalid RM payload for PDF zip");
            return BadRequest(new { error = "Invalid RM payload: " + ex.Message });
        }
    }
}
