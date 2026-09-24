using ClosedXML.Excel;

namespace IncentiveTool.Api.Excel;

/// <summary>
/// Reads the "RMs" and "Deals" sheets into raw row objects — plain header-to-value
/// dictionaries, the same shape XLSX.utils.sheet_to_json() produces in the original
/// tool. No business logic here: validation/normalization/calculation/rendering all
/// happen client-side using the original tool's own JS, verbatim, so behavior is
/// guaranteed identical to Incentive_PDF_Tool.html.
/// </summary>
public class ExcelSheetReader
{
    private static readonly string[] RmSheetNames = { "rms", "rm", "reps", "employees" };
    private static readonly string[] DealSheetNames = { "deals", "deal" };

    public (List<Dictionary<string, object?>> RmRows, List<Dictionary<string, object?>> DealRows) Read(Stream xlsxStream)
    {
        using var wb = new XLWorkbook(xlsxStream);

        var rmSheet = FindSheet(wb, RmSheetNames)
            ?? throw new InvalidOperationException("No sheet named \"RMs\" found.");
        var dealSheet = FindSheet(wb, DealSheetNames)
            ?? throw new InvalidOperationException("No sheet named \"Deals\" found.");

        return (ReadSheet(rmSheet), ReadSheet(dealSheet));
    }

    private static IXLWorksheet? FindSheet(XLWorkbook wb, string[] candidates) =>
        wb.Worksheets.FirstOrDefault(ws => candidates.Contains(ws.Name.Trim().ToLowerInvariant()));

    private static List<Dictionary<string, object?>> ReadSheet(IXLWorksheet ws)
    {
        var usedRange = ws.RangeUsed();
        if (usedRange is null) return new List<Dictionary<string, object?>>();

        var rows = usedRange.RowsUsed().ToList();
        if (rows.Count == 0) return new List<Dictionary<string, object?>>();

        var headerRow = rows[0];
        var headers = headerRow.Cells().Select(c => c.GetString().Trim()).ToList();

        var result = new List<Dictionary<string, object?>>();
        foreach (var row in rows.Skip(1))
        {
            var dict = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < headers.Count; i++)
            {
                if (string.IsNullOrEmpty(headers[i])) continue;
                var cell = row.Cell(i + 1);
                dict[headers[i]] = CellValue(cell);
            }
            if (dict.Values.All(v => v is null)) continue; // skip fully blank rows
            result.Add(dict);
        }
        return result;
    }

    private static object? CellValue(IXLCell cell)
    {
        if (cell.IsEmpty()) return null;
        return cell.DataType switch
        {
            XLDataType.DateTime => cell.GetDateTime(),
            XLDataType.Number => cell.GetDouble(),
            XLDataType.Boolean => cell.GetBoolean(),
            XLDataType.Text => cell.GetString(),
            _ => cell.Value.ToString(),
        };
    }
}
