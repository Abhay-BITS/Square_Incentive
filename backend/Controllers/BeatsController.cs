using IncentiveTool.Api.Excel;
using Microsoft.AspNetCore.Mvc;

namespace IncentiveTool.Api.Controllers;

[ApiController]
[Route("api/beats")]
public class BeatsController : ControllerBase
{
    private readonly ExcelSheetReader _reader;
    private readonly ILogger<BeatsController> _logger;
    private static readonly HttpClient _http = new() { Timeout = TimeSpan.FromMinutes(10) };

    public BeatsController(ExcelSheetReader reader, ILogger<BeatsController> logger)
    {
        _reader = reader;
        _logger = logger;
    }

    public record BeatsRequest(string DataType, string? EmpCode = null);

    [HttpPost("incentive-input")]
    public async Task<IActionResult> FetchIncentiveInput([FromBody] BeatsRequest req, CancellationToken ct)
    {
        var apiKey = Environment.GetEnvironmentVariable("BEATS_API_KEY") ?? "";
        if (string.IsNullOrWhiteSpace(apiKey))
            return BadRequest(new { success = false, error = "BEATS_API_KEY is not configured on the server." });

        if (string.IsNullOrWhiteSpace(req.DataType))
            return BadRequest(new { success = false, error = "dataType is required (RM or leader)." });

        var url = "https://beats.squareyards.com/api/Project/ExportIncentiveEmailInput";
        var qp = new List<string> { $"dataType={Uri.EscapeDataString(req.DataType)}" };
        if (!string.IsNullOrWhiteSpace(req.EmpCode))
            qp.Add($"empCode={Uri.EscapeDataString(req.EmpCode)}");
        url += "?" + string.Join("&", qp);

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("API_KEY", apiKey);

            _logger.LogInformation("Calling Beats API: dataType={DataType}, empCode={EmpCode}",
                req.DataType, req.EmpCode ?? "(all)");

            using var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("Beats API returned {Status}: {Body}", response.StatusCode, body);
                return StatusCode((int)response.StatusCode,
                    new { success = false, error = $"Beats API returned {response.StatusCode}: {body}" });
            }

            var contentType = response.Content.Headers.ContentType?.MediaType ?? "";
            using var stream = await response.Content.ReadAsStreamAsync(ct);

            if (contentType.Contains("spreadsheet") || contentType.Contains("excel") || contentType == "application/octet-stream")
            {
                var ms = new MemoryStream();
                await stream.CopyToAsync(ms, ct);
                ms.Position = 0;
                var (rmRows, dealRows) = _reader.Read(ms);
                _logger.LogInformation("Beats API: parsed {RmCount} RMs and {DealCount} deals", rmRows.Count, dealRows.Count);
                return Ok(new { success = true, rmRows, dlRows = dealRows });
            }

            var text = await new StreamReader(stream).ReadToEndAsync(ct);
            _logger.LogWarning("Beats API returned unexpected content type {ContentType}", contentType);
            return StatusCode(502, new { success = false, error = $"Unexpected response type: {contentType}", raw = text });
        }
        catch (TaskCanceledException) when (!ct.IsCancellationRequested)
        {
            return StatusCode(504, new { success = false, error = "Beats API timed out (limit is 10 minutes)." });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Could not parse Beats API response as Excel");
            return UnprocessableEntity(new { success = false, error = "Could not parse API response: " + ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch from Beats API");
            return StatusCode(502, new { success = false, error = "Failed to fetch data: " + ex.Message });
        }
    }
}
