using System.IO.Compression;
using System.Runtime;
using System.Text.Json;
using IncentiveTool.Api.Pdf;
using Microsoft.AspNetCore.Http.Features;
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

    /// <summary>
    /// Streams the ZIP straight to the response, one PDF at a time, so memory use stays flat
    /// no matter how many RMs are in the request. The frontend splits very large exports
    /// across several requests.
    /// </summary>
    [HttpPost("zip")]
    [RequestSizeLimit(200_000_000)]
    public async Task Zip([FromBody] JsonElement rms)
    {
        if (rms.ValueKind != JsonValueKind.Array || rms.GetArrayLength() == 0)
        {
            await Fail(StatusCodes.Status400BadRequest, "Expected a non-empty array of RMs.");
            return;
        }

        List<(JsonElement Rm, string Name)> items;
        try
        {
            items = rms.EnumerateArray().Select(rm => (rm, Renderer.FileName(rm))).ToList();
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            _logger.LogWarning(ex, "Invalid RM payload for PDF zip");
            await Fail(StatusCodes.Status400BadRequest, "Invalid RM payload: " + ex.Message);
            return;
        }

        Response.ContentType = "application/zip";
        Response.Headers.ContentDisposition = $"attachment; filename=\"incentive_pdfs_{DateTime.UtcNow:yyyyMMdd-HHmmss}.zip\"";
        var bodyControl = HttpContext.Features.Get<IHttpBodyControlFeature>();
        if (bodyControl != null) bodyControl.AllowSynchronousIO = true;

        using var zip = new ZipArchive(Response.Body, ZipArchiveMode.Create, leaveOpen: true);
        var count = 0;
        foreach (var (rm, name) in items)
        {
            HttpContext.RequestAborted.ThrowIfCancellationRequested();
            var bytes = Renderer.Render(rm);
            var entry = zip.CreateEntry(name, CompressionLevel.Fastest);
            using var es = entry.Open();
            es.Write(bytes, 0, bytes.Length);

            // Each PDF is a large-object-heap array plus native drawing memory. Without an
            // explicit collection the process keeps growing over thousands of PDFs, which
            // matters on small hosts.
            if (++count % 25 == 0)
            {
                GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
                GC.Collect(2, GCCollectionMode.Forced, blocking: true, compacting: true);
            }
        }
    }

    private async Task Fail(int status, string message)
    {
        Response.StatusCode = status;
        Response.ContentType = "application/json";
        await Response.WriteAsync(JsonSerializer.Serialize(new { error = message }));
    }
}
