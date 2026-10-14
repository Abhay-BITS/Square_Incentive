using System.IO.Compression;
using System.Runtime;
using System.Text.Json;
using IncentiveTool.Api.Pdf;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;

namespace IncentiveTool.Api.Controllers;

[ApiController]
[Route("api/pdf")]
public class PdfController : ControllerBase
{
    private readonly ILogger<PdfController> _logger;

    public PdfController(ILogger<PdfController> logger) => _logger = logger;

    static bool IsT2T3(JsonElement body) =>
        body.TryGetProperty("tier", out var t) && t.GetString() is "t2t3";

    static byte[] RenderOne(JsonElement rm, bool t2t3) =>
        t2t3 ? RendererT2T3.Render(rm) : Renderer.Render(rm);

    static string FileNameOne(JsonElement rm, bool t2t3) =>
        t2t3 ? RendererT2T3.FileName(rm) : Renderer.FileName(rm);

    [HttpPost("single")]
    [RequestSizeLimit(20_000_000)]
    public IActionResult Single([FromBody] JsonElement body)
    {
        try
        {
            var t2t3 = IsT2T3(body);
            var rm = t2t3 && body.TryGetProperty("rm", out var r) ? r : body;
            return File(RenderOne(rm, t2t3), "application/pdf", FileNameOne(rm, t2t3));
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            _logger.LogWarning(ex, "Invalid RM payload for PDF");
            return BadRequest(new { error = "Invalid RM payload: " + ex.Message });
        }
    }

    [HttpPost("zip")]
    [RequestSizeLimit(200_000_000)]
    public async Task Zip([FromBody] JsonElement body)
    {
        var t2t3 = IsT2T3(body);
        var rms = t2t3 && body.TryGetProperty("rms", out var arr) ? arr : body;

        if (rms.ValueKind != JsonValueKind.Array || rms.GetArrayLength() == 0)
        {
            await Fail(StatusCodes.Status400BadRequest, "Expected a non-empty array of RMs.");
            return;
        }

        List<(JsonElement Rm, string Name)> items;
        try
        {
            items = rms.EnumerateArray().Select(rm => (rm, FileNameOne(rm, t2t3))).ToList();
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
            var bytes = RenderOne(rm, t2t3);
            var entry = zip.CreateEntry(name, CompressionLevel.Fastest);
            using var es = entry.Open();
            es.Write(bytes, 0, bytes.Length);

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
