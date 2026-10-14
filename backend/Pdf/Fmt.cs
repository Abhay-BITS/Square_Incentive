using System.Globalization;
using System.Text.Json;

namespace IncentiveTool.Api.Pdf;

// Ports of fmtINR / fmtINRnoSym / fmtL from the original tool.
static class Fmt
{
    public static string Inr(double n)
    {
        if (double.IsNaN(n)) return "₹0";
        var r = Math.Floor(n + 0.5); // JS Math.round
        var neg = r < 0;
        var s = ((long)Math.Abs(r)).ToString(CultureInfo.InvariantCulture);
        string outStr;
        if (s.Length > 3)
        {
            outStr = s[^3..];
            var rem = s[..^3];
            while (rem.Length > 2) { outStr = rem[^2..] + "," + outStr; rem = rem[..^2]; }
            if (rem.Length > 0) outStr = rem + "," + outStr;
        }
        else outStr = s;
        return (neg ? "-₹" : "₹") + outStr;
    }

    public static string InrNoSym(double n) => Inr(n).Replace("₹", "");

    // Collection % for display: up to 2 decimals, no trailing zeros (82.4223242 -> 82.42, 80 -> 80).
    public static string Pct(double n) =>
        (Math.Floor(n * 100 + 0.5) / 100).ToString("0.##", CultureInfo.InvariantCulture) + "%";

    static string Trim(double v)
    {
        var s = v.ToString("F2", CultureInfo.InvariantCulture);
        if (s.Contains('.')) s = s.TrimEnd('0').TrimEnd('.');
        return s;
    }

    public static string Lakh(double n)
    {
        var inLakh = n / 100000;
        if (inLakh >= 100) return "₹" + Trim(inLakh / 100) + "Cr";
        if (inLakh >= 1) return "₹" + Trim(inLakh) + "L";
        return Inr(n);
    }
}

static class J
{
    public static double Num(this JsonElement e, string k) => e.GetProperty(k).GetDouble();
    public static string Str(this JsonElement e, string k) => e.GetProperty(k).GetString() ?? "";
    public static bool Bool(this JsonElement e, string k) => e.GetProperty(k).GetBoolean();
    public static bool IsNull(this JsonElement e, string k) => e.GetProperty(k).ValueKind == JsonValueKind.Null;
    public static IEnumerable<JsonElement> Arr(this JsonElement e, string k) => e.GetProperty(k).EnumerateArray();
}
