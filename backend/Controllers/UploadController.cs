using IncentiveTool.Api.Excel;
using Microsoft.AspNetCore.Mvc;

namespace IncentiveTool.Api.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly ExcelSheetReader _reader;
    private readonly ILogger<UploadController> _logger;

    public UploadController(ExcelSheetReader reader, ILogger<UploadController> logger)
    {
        _reader = reader;
        _logger = logger;
    }

    [HttpPost]
    [RequestSizeLimit(20_000_000)]
    public IActionResult Upload(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { success = false, error = "No file uploaded." });

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase) &&
            !file.FileName.EndsWith(".xls", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { success = false, error = "Only .xlsx/.xls files are supported." });

        try
        {
            using var stream = file.OpenReadStream();
            var (rmRows, dealRows) = _reader.Read(stream);
            return Ok(new { success = true, rmRows, dlRows = dealRows });
        }
        catch (InvalidOperationException ex)
        {
            return UnprocessableEntity(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse uploaded workbook {FileName}", file.FileName);
            return UnprocessableEntity(new { success = false, error = "Could not parse file: " + ex.Message });
        }
    }
}
