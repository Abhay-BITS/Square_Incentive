using System.Text.Json;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace IncentiveTool.Api.Pdf;

// QuestPDF port of buildFullEmail() from Incentive_PDF_Tool.html: same wording, same
// branching, same colours. Pixel sizes from the template are scaled by PX to points.
public class Renderer
{
    const string NAVY = "#0F1738", NAVY_SOFT = "#F4F5F9", BORDER = "#E2E8F0", BORDER_STRONG = "#CBD5E1",
        INK = "#1F2A44", INK_SOFT = "#475569", MUTED = "#64748B", GREEN = "#16A34A", GREEN_DEEP = "#166534",
        GREEN_SOFT = "#D1FAE5", ORANGE = "#E08A2B", ORANGE_DEEP = "#B45309", AMBER_SOFT = "#FEF3C7",
        RED = "#DC2626", RED_DEEP = "#B02E2E", RED_SOFT = "#FEE2E2", BG = "#F4F5F7", GOLD = "#FDB744",
        MUTED_BG = "#F1F5F9", MUTED_BG2 = "#F8FAFC", MUTED_BORDER = "#CBD5E1", MUTED_TEXT = "#94A3B8";
    const string SANS = "Inter", MONO = "JetBrains Mono";
    const float PX = 0.68f;
    static float P(double px) => (float)(px * PX);

    static readonly byte[] LogoWhite = File.ReadAllBytes(Path.Combine(AppContext.BaseDirectory, "Pdf", "logo-white.png"));

    readonly JsonElement rm, c;
    readonly List<JsonElement> deals, results;
    readonly string month, range, scenario;
    // Steps are numbered in the order they are drawn, so a skipped step never leaves a gap.
    int stepNo;
    int NextNo() => ++stepNo;

    public static byte[] Render(JsonElement rm) =>
        Document.Create(d => new Renderer(rm).Compose(d)).GeneratePdf();

    public static string FileName(JsonElement rm) =>
        $"{rm.GetProperty("empCode").GetString()}_{rm.GetProperty("calc").GetProperty("ddShort").GetString()}DD.pdf";

    public Renderer(JsonElement rm)
    {
        this.rm = rm; c = rm.GetProperty("calc");
        deals = rm.Arr("deals").ToList(); results = c.Arr("dealResults").ToList();
        var dl = c.Str("ddLabel"); month = dl == "" ? "this cycle" : dl;
        range = c.GetProperty("coverage").ValueKind == JsonValueKind.Null ? "" : c.GetProperty("coverage").Str("rangeLabel");
        scenario = c.Str("overallScenario");
    }

    // ---------- rich text: **bold**  ^^red bold^^  {{gold}}  [[muted]]  <<yellow highlight>> ----------
    static void Rich(TextDescriptor t, string s, double px, string color = INK, bool mono = false)
    {
        bool bold = false, red = false, gold = false, dim = false, hl = false; var buf = "";
        void Flush()
        {
            if (buf == "") return;
            var sp = t.Span(buf).FontSize(P(px)).FontFamily(mono ? MONO : SANS)
                .FontColor(hl ? INK : red ? RED_DEEP : gold ? GOLD : dim ? "#A5A9BB" : color);
            if (hl) sp.BackgroundColor("#FDE047");
            if (bold || red || hl) sp.Bold(); else if (mono) sp.Medium();
            buf = "";
        }
        for (int i = 0; i < s.Length; i++)
        {
            if (Tok("**")) { Flush(); bold = !bold; i++; }
            else if (Tok("^^")) { Flush(); red = !red; i++; }
            else if (Tok("{{")) { Flush(); gold = true; i++; }
            else if (Tok("}}")) { Flush(); gold = false; i++; }
            else if (Tok("<<")) { Flush(); hl = true; i++; }
            else if (Tok(">>")) { Flush(); hl = false; i++; }
            else if (Tok("[[")) { Flush(); dim = true; i++; }
            else if (Tok("]]")) { Flush(); dim = false; i++; }
            else buf += s[i];
            bool Tok(string x) => i + 1 < s.Length && s[i] == x[0] && s[i + 1] == x[1];
        }
        Flush();
    }

    static void Bullets(ColumnDescriptor col, params string[] items) =>
        col.Item().PaddingVertical(3).Column(b =>
        {
            foreach (var it in items)
                b.Item().PaddingVertical(1.5f).Row(r =>
                {
                    r.ConstantItem(12).Text("•").FontSize(P(14)).FontColor(NAVY);
                    r.RelativeItem().Text(t => { t.DefaultTextStyle(x => x.LineHeight(1.45f)); Rich(t, it, 13); });
                });
        });

    static void SectionH(ColumnDescriptor col, int n, string title) =>
        col.Item().PaddingTop(P(18)).PaddingBottom(P(6)).EnsureSpace(80).Row(r =>
        {
            r.AutoItem().Background(NAVY).PaddingVertical(2.5f).PaddingHorizontal(6)
                .Text($"STEP {n}").FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(Colors.White);
            r.RelativeItem().PaddingLeft(7).AlignMiddle().Text(title).Bold().FontSize(P(15.5)).FontColor(NAVY);
        });

    static void SubHead(ColumnDescriptor col, string text, double topPx) =>
        col.Item().PaddingTop(P(topPx)).PaddingBottom(3).EnsureSpace(60).Text(text).Bold().FontSize(P(13.5)).FontColor(INK);

    static void MonoBox(ColumnDescriptor col, IEnumerable<string> lines) =>
        col.Item().PaddingTop(3).ShowEntire().Background(NAVY_SOFT).BorderLeft(2).BorderColor(NAVY).Padding(P(12)).Column(b =>
        {
            foreach (var l in lines) b.Item().PaddingVertical(1.5f).Text(t => Rich(t, l, 13, INK, true));
        });

    static void ColorBox(ColumnDescriptor col, string bg, string border, string text) =>
        col.Item().PaddingTop(6).ShowEntire().Background(bg).BorderLeft(2).BorderColor(border).Padding(P(12))
            .Text(t => { t.DefaultTextStyle(x => x.LineHeight(1.45f)); Rich(t, text, 13); });

    // ---------- table helpers ----------
    static IContainer HCell(IContainer x) => x.Background(NAVY).PaddingVertical(P(9)).PaddingHorizontal(P(10));
    static IContainer BCell(IContainer x) => x.BorderBottom(0.5f).BorderColor(BORDER).Background(Colors.White)
        .PaddingVertical(P(8)).PaddingHorizontal(P(9)).AlignMiddle();

    static void Badge(IContainer x, string text, string bg, string fg) =>
        x.AlignCenter().Background(bg).PaddingHorizontal(4).PaddingVertical(1.5f)
            .Text(text).Bold().FontSize(P(10.5)).FontColor(fg);

    static string StgBg(string s) => s == "Collected" ? GREEN_SOFT : s == "Confirmed" ? AMBER_SOFT : s == "Not counted" ? RED_SOFT : "#EEF2F7";
    static string StgFg(string s) => s == "Collected" ? GREEN_DEEP : s == "Confirmed" ? ORANGE_DEEP : s == "Not counted" ? RED_DEEP : INK_SOFT;

    // ---------- main ----------
    public void Compose(IDocumentContainer doc) =>
        doc.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(22);
            page.PageColor(BG);
            page.DefaultTextStyle(t => t.FontFamily(SANS).FontSize(P(13)).FontColor(INK));
            page.Content().Background(Colors.White).Column(card =>
            {
                card.Item().Background("#000000").PaddingVertical(P(18)).PaddingHorizontal(P(28)).Row(r =>
                {
                    r.ConstantItem(P(85)).Height(P(34)).Image(LogoWhite).FitArea();
                    r.RelativeItem();
                    r.AutoItem().AlignMiddle().Text($"Incentive Team · Dollar Day {rm.Str("ddDate")}").Medium().FontSize(P(11)).FontColor("#B3B7C7");
                });
                card.Item().PaddingHorizontal(P(28)).Column(body =>
                {
                    stepNo = 0;
                    Hero(body);
                    var first = rm.Str("name").Split(' ')[0];
                    body.Item().PaddingTop(P(22)).Text(t => Rich(t, $"Hi {first},", 14));
                    body.Item().PaddingTop(P(8)).Text(t => Rich(t, $"Below is your incentive breakdown for **{month} Dollar Day**.", 14));
                    Fy27Block(body);
                    PriorCard(body);
                    // The footer travels with the last step so it can never sit alone on a page.
                    Step5(body);
                    Step6(body);
                    Step7(body, Footer);
                });
            });
        });

    // ---------- hero ----------
    void Hero(ColumnDescriptor body)
    {
        var up = month.ToUpper();
        double due = c.Num("dueForRelease"), esop = due * 0.25, total = due + esop;
        string bg = NAVY_SOFT, border = NAVY, label = $"YOUR {up} DOLLAR DAY INCENTIVE", big = "0", formula = "";
        switch (scenario)
        {
            case "positive" or "provisional_only":
                bg = GREEN_SOFT; border = GREEN; big = Fmt.InrNoSym(total);
                formula = $"{Fmt.Inr(total)} = {Fmt.Inr(due)} (Cash in bank, 80%) + {Fmt.Inr(esop)} (ESOP, 20%)"; break;
            case "held_no_crm":
                bg = AMBER_SOFT; border = ORANGE; formula = $"₹0 disbursed this Dollar Day. See Step {(deals.Count > 0 ? 6 : 4)} for the held amount."; break;
            case "below_target": formula = "Cumulative revenue is below the eligibility target this cycle."; break;
            case "negative_due": label = "NO DISBURSEMENT THIS CYCLE"; formula = "Cumulative Payable is less than Already Paid - no clawback."; break;
            case "nil_due": label = "NO DISBURSEMENT THIS CYCLE"; formula = "Cumulative Payable exactly matches Already Paid."; break;
            case "zero_payable": formula = "None of your deals produced a payable amount this cycle."; break;
            case "no_deals": formula = "No deals in the eligibility window this cycle."; break;
        }
        body.Item().PaddingTop(P(28)).ShowEntire().Background(bg).Border(0.75f).BorderColor(border).PaddingVertical(P(22)).PaddingHorizontal(P(24)).Column(h =>
        {
            h.Item().PaddingBottom(P(6)).Text(label).Bold().FontSize(P(10.5)).FontColor(border).LetterSpacing(0.1f);
            h.Item().Text("₹" + big).FontFamily(MONO).Bold().FontSize(P(40)).FontColor(NAVY);
            h.Item().PaddingTop(P(10)).Text(formula).FontFamily(MONO).FontSize(P(12.5)).FontColor(INK_SOFT);
        });
    }

    // ---------- FY27 block ----------
    void Fy27Block(ColumnDescriptor body) =>
        body.Item().PaddingTop(P(18)).Border(1.4f).BorderColor(NAVY).Column(fy =>
        {
            fy.Item().Background(NAVY_SOFT).BorderBottom(1.4f).BorderColor(NAVY).Padding(P(18)).Column(h =>
            {
                h.Item().Text("April 2026 Onwards · FY27").Bold().FontSize(P(17)).FontColor(NAVY);
                h.Item().PaddingTop(P(6)).Text(t => Rich(t, $"YTD Salary Cost and deals from **{range}** considered. Full calculation breakdown below.", 13));
            });
            fy.Item().Background(Colors.White).PaddingHorizontal(P(22)).PaddingBottom(P(12)).Column(s =>
            {
                Step1(s); Step2(s); Step3(s); Step4(s);
            });
            fy.Item().Background(MUTED_BG2).BorderTop(1.4f).BorderColor(NAVY_SOFT).PaddingVertical(P(14)).PaddingHorizontal(P(22)).Row(r =>
            {
                r.RelativeItem().AlignMiddle().Text("FY27 PAYABLE THIS CYCLE").FontFamily(MONO).Bold().FontSize(P(10.5)).FontColor(MUTED).LetterSpacing(0.06f);
                r.AutoItem().Text(Fmt.Inr(c.Num("fy27Payable"))).FontFamily(MONO).Bold().FontSize(P(18)).FontColor(NAVY);
            });
        });

    void PriorCard(ColumnDescriptor body)
    {
        var total = c.GetProperty("backYear").Num("total");
        if (total <= 0) return;
        body.Item().PaddingTop(P(18)).ShowEntire().Border(1.4f).BorderColor(ORANGE_DEEP).Column(p =>
        {
            p.Item().Background("#FFFBEB").BorderBottom(1.4f).BorderColor(ORANGE_DEEP).Padding(P(18)).Column(h =>
            {
                h.Item().Text("Prior Period · Before April 2026").Bold().FontSize(P(17)).FontColor(ORANGE_DEEP);
                h.Item().PaddingTop(P(6)).Text("Final incentive payable, calculated under the earlier rules.").FontSize(P(12.5)).FontColor(INK_SOFT);
            });
            p.Item().Background(Colors.White).Padding(P(20)).Row(r =>
            {
                r.RelativeItem().AlignMiddle().Text("Final Incentive Payable").Bold().FontSize(P(13.5));
                r.AutoItem().Text(Fmt.Inr(total)).FontFamily(MONO).Bold().FontSize(P(18)).FontColor(NAVY);
            });
        });
    }

    // ---------- steps 1-2 ----------
    void Step1(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "YTD Salary Cost and Eligibility Target");
        Bullets(s,
            $"**YTD Salary Cost** = sum of your salaries in the elapsed months ({rm.Num("months")} months this cycle).",
            "**Eligibility Target** = 5 × YTD Salary Cost. Your revenue must cross this to earn any incentive.");
        MonoBox(s, new[]
        {
            $"YTD Salary Cost = **{Fmt.Inr(c.Num("ytdCost"))}**",
            $"Eligibility Target (SMx 5×) = 5 × {Fmt.Inr(c.Num("ytdCost"))} = **{Fmt.Inr(c.Num("eligibilityTarget"))}**",
        });
    }

    void Step2(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Deals in this cycle");
        if (deals.Count == 0)
        {
            Bullets(s, $"You had **no deals** in {range}. Nothing to compute this cycle.");
            return;
        }
        Bullets(s, $"These are your {deals.Count} deal(s) booked in **{range}**.");
        s.Item().PaddingTop(4).Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2.7f); cd.RelativeColumn(1.6f); cd.RelativeColumn(1.3f); cd.RelativeColumn(1.5f); cd.RelativeColumn(1.4f); cd.RelativeColumn(1.5f); });
            string[] heads = { "TCF ID", "Deal Revenue", "Deal Month", "Stage", "Project Type", "Collection %" };
            for (int i = 0; i < heads.Length; i++)
            {
                var h = heads[i]; var idx = i;
                var cell = t.Cell().Element(HCell);
                var txt = idx is 1 or 5 ? cell.AlignRight() : idx is 2 or 3 or 4 ? cell.AlignCenter() : cell;
                txt.Text(h).Bold().FontSize(P(11)).FontColor(Colors.White);
            }
            foreach (var d in deals)
            {
                var stage = d.Str("stage"); var type = d.Str("type");
                t.Cell().Element(BCell).Text(d.Str("tcfId")).FontFamily(MONO).FontSize(P(11.5));
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(d.Num("revenue"))).FontFamily(MONO).FontSize(P(12));
                t.Cell().Element(BCell).AlignCenter().Text(d.Str("month") is "" ? "-" : d.Str("month")).FontSize(P(12)).FontColor(INK_SOFT);
                Badge(t.Cell().Element(BCell), stage, StgBg(stage), StgFg(stage));
                Badge(t.Cell().Element(BCell), type, type == "Focus" ? GREEN_SOFT : RED_SOFT, type == "Focus" ? GREEN_DEEP : RED_DEEP);
                t.Cell().Element(BCell).AlignRight().Text(d.IsNull("collection") ? "-" : Fmt.Pct(d.Num("collection"))).FontFamily(MONO).FontSize(P(12));
            }
        });
    }

    // ---------- step 3 ----------
    string TcfList(IEnumerable<JsonElement> ds) => string.Join(", ", ds.Select(d => $"{d.Str("tcfId")} ({d.Str("stage")})"));
    string SumFormula(IEnumerable<JsonElement> ds) => string.Join(" + ", ds.Select(d => $"{d.Str("tcfId")} ({Fmt.Lakh(d.Num("revenue"))})"));

    void Step3(ColumnDescriptor s)
    {
        if (deals.Count == 0) return;
        SectionH(s, NextNo(), "Both Incentives - Provisional and Confirmed");
        Bullets(s, "Two incentives are computed side by side: **Provisional** (Counted + Confirmed + Collected deals) and **Confirmed** (Confirmed and Collected deals).");

        double target = c.Num("eligibilityTarget"), provBase = c.Num("provBase"), provInc = c.Num("provIncentive"),
            confBase = c.Num("confBase"), confInc = c.Num("confIncentive");
        var provDeals = deals.Where(d => d.Str("stage") != "Not counted").ToList();
        var confDeals = deals.Where(d => d.Str("stage") is "Confirmed" or "Collected").ToList();

        SubHead(s, "Provisional Incentive", 12);
        if (provDeals.Count == 0)
            Bullets(s, "**Deals used:** none - all deals are Not counted.", $"**Eligibility Target (SMx 5×):** {Fmt.Inr(target)}", "**Provisional Incentive = ₹0.**");
        else if (provInc == 0)
        {
            Bullets(s, $"**Deals used:** {TcfList(provDeals)} ({provDeals.Count} deals - all Counted, Confirmed and Collected stages)",
                $"**Eligibility Target (SMx 5×):** {Fmt.Inr(target)}",
                $"**Total Provisional Incentive Deal Revenue:** {SumFormula(provDeals)} = {Fmt.Inr(provBase)}",
                "^^Did not cross target^^ → Provisional Incentive = ₹0.");
            Slab(s, target, provBase, 0, "Provisional Incentive");
        }
        else
        {
            Bullets(s, $"**Deals used:** {TcfList(provDeals)} ({provDeals.Count} deals - all Counted, Confirmed and Collected stages)",
                $"**Eligibility Target (SMx 5×):** {Fmt.Inr(target)}",
                $"**Total Provisional Incentive Deal Revenue:** {SumFormula(provDeals)} = {Fmt.Inr(provBase)}",
                provBase > target ? $"**Crosses target** by {Fmt.Inr(provBase - target)}" : "**Exactly at target** - 5% of target applies.");
            Slab(s, target, provBase, provInc, "Provisional Incentive");
        }

        SubHead(s, "Confirmed Incentive", 22);
        if (confBase == 0)
            Bullets(s, "**Deals used:** none - no Confirmed or Collected deals this cycle.", $"**Eligibility Target (SMx 5×):** {Fmt.Inr(target)}", "**Confirmed Incentive = ₹0.**");
        else if (confInc == 0)
        {
            Bullets(s, $"**Deals used:** {TcfList(confDeals)} ({confDeals.Count} deals - only Confirmed and Collected stages)",
                $"**Eligibility Target (SMx 5×):** {Fmt.Inr(target)}",
                $"**Total Confirmed Incentive Deal Revenue:** {SumFormula(confDeals)} = {Fmt.Inr(confBase)}",
                "^^Did not cross target^^ → Confirmed Incentive = ₹0.");
            Slab(s, target, confBase, 0, "Confirmed Incentive");
        }
        else
        {
            var cross = confBase > target ? $"**Crosses target** by {Fmt.Inr(confBase - target)}" : "**Exactly at target** - 5% of target applies.";
            Bullets(s, $"**Deals used:** {TcfList(confDeals)} ({confDeals.Count} deals - only Confirmed and Collected stages)",
                $"**Eligibility Target (SMx 5×):** {Fmt.Inr(target)}",
                $"**Total Confirmed Incentive Deal Revenue:** {SumFormula(confDeals)} = {Fmt.Inr(confBase)}", cross);
            Slab(s, target, confBase, confInc, "Confirmed Incentive");
        }
    }

    void Slab(ColumnDescriptor s, double target, double rev, double inc, string label)
    {
        double five = 0.05 * target, excess = Math.Max(0, rev - target), forty = 0.4 * excess;
        int tw, ew; string state;
        if (rev > target) { state = "crosses"; tw = (int)Math.Min(70, Math.Max(25, Math.Round(100 * target / rev))); ew = 100 - tw; }
        else if (rev == target && rev > 0) { state = "at_target"; tw = 55; ew = 45; }
        else { state = "below_target"; tw = 60; ew = 40; }
        bool leftActive = state != "below_target", rightActive = state == "crosses";
        string leftBg = leftActive ? GREEN_SOFT : MUTED_BG, leftBorder = leftActive ? GREEN : MUTED_BORDER, leftText = leftActive ? GREEN_DEEP : MUTED_TEXT;
        string rightBg = rightActive ? AMBER_SOFT : MUTED_BG2, rightBorder = rightActive ? ORANGE : MUTED_BORDER, rightText = rightActive ? ORANGE_DEEP : MUTED_TEXT;

        s.Item().PaddingTop(P(12)).PaddingBottom(P(6)).ShowEntire().Column(v =>
        {
            if (state == "below_target")
            {
                double pos = target > 0 ? rev / target * tw : 0;
                v.Item().PaddingBottom(4).Row(r =>
                {
                    r.RelativeItem((float)Math.Max(pos - 12, 1));
                    r.AutoItem().Background(RED).PaddingHorizontal(5).PaddingVertical(2)
                        .Text($"REVENUE · {Fmt.Lakh(rev)}").FontFamily(MONO).Bold().FontSize(P(10.5)).FontColor(Colors.White);
                    r.RelativeItem((float)Math.Max(100 - pos, 1));
                });
            }
            v.Item().Row(r =>
            {
                r.RelativeItem(tw).PaddingBottom(3).AlignRight().Text($"ELIGIBILITY TARGET (SMx 5×) · {Fmt.Lakh(target)}").Bold().FontSize(P(10.5)).FontColor(ORANGE_DEEP);
                var rl = r.RelativeItem(ew).PaddingBottom(3).AlignRight();
                if (state != "below_target") rl.Text($"REVENUE · {Fmt.Lakh(rev)}").Bold().FontSize(P(10.5)).FontColor(GREEN_DEEP);
            });
            v.Item().Row(r =>
            {
                r.RelativeItem(tw).Height(P(46)).Background(leftBg).Border(1.1f).BorderColor(leftBorder).AlignMiddle().AlignCenter().Text("5%").Bold().FontSize(P(20)).FontColor(leftText);
                r.RelativeItem(ew).Height(P(46)).Background(rightBg).Border(1.1f).BorderColor(rightBorder).AlignMiddle().AlignCenter().Text("40%").Bold().FontSize(P(20)).FontColor(rightText);
            });
            v.Item().PaddingTop(2).Text("₹0").FontFamily(MONO).FontSize(P(10.5)).FontColor(INK_SOFT);
            v.Item().Row(r =>
            {
                r.RelativeItem(tw).PaddingHorizontal(4).PaddingTop(3).Height(P(9)).BorderTop(1.1f).BorderLeft(1.1f).BorderRight(1.1f).BorderColor(leftBorder);
                r.RelativeItem(ew).PaddingHorizontal(4).PaddingTop(3).Height(P(9)).BorderTop(1.1f).BorderLeft(1.1f).BorderRight(1.1f).BorderColor(rightBorder);
            });
            v.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem(tw).AlignCenter().Text(t =>
                {
                    if (state == "below_target") { t.Span("₹0").FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(leftText); return; }
                    t.Span($"5% × {Fmt.Lakh(target)} = ").FontFamily(MONO).FontSize(P(11.5)).FontColor(leftText); t.Span(Fmt.Inr(five)).FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(leftText);
                });
                r.RelativeItem(ew).AlignCenter().Text(t => { t.Span($"40% × {(excess > 0 ? Fmt.Lakh(excess) : "₹0")} = ").FontFamily(MONO).FontSize(P(11.5)).FontColor(rightText); t.Span(Fmt.Inr(forty)).FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(rightText); });
            });
            string pillBg = state == "below_target" ? MUTED_BG : "#EFF4FA", pillBorder = state == "below_target" ? MUTED_BORDER : NAVY,
                pillColor = state == "below_target" ? INK_SOFT : NAVY;
            v.Item().PaddingTop(P(14)).Background(pillBg).Border(1.1f).BorderColor(pillBorder).PaddingVertical(P(10)).PaddingHorizontal(P(14)).AlignCenter().Text(t =>
            {
                if (state == "below_target")
                {
                    t.Span($"{label} = ₹0 ").Bold().FontSize(P(13.5)).FontColor(pillColor);
                    t.Span("· revenue below target").Italic().Medium().FontSize(P(12)).FontColor(MUTED);
                }
                else t.Span($"{label} = {Fmt.Inr(five)} + {Fmt.Inr(forty)} = {Fmt.Inr(inc)}").Bold().FontSize(P(13.5)).FontColor(pillColor);
            });
        });
    }

    // ---------- step 4 ----------
    static void Flow(ColumnDescriptor s, (string label, string sub)[] steps) =>
        s.Item().PaddingVertical(P(10)).ShowEntire().Row(r =>
        {
            for (int i = 0; i < steps.Length; i++)
            {
                var st = steps[i];
                r.RelativeItem().Background(NAVY_SOFT).Border(1.1f).BorderColor(NAVY).PaddingVertical(P(10)).PaddingHorizontal(4).Column(b =>
                {
                    b.Item().AlignCenter().Text(st.label).Bold().FontSize(P(11.5)).FontColor(NAVY);
                    if (st.sub.Contains("{{"))
                        b.Item().PaddingTop(2).AlignCenter().Text(t => { t.AlignCenter(); Rich(t, st.sub, 10, INK_SOFT, true); });
                    else
                        b.Item().PaddingTop(2).AlignCenter().Text(st.sub).FontFamily(MONO).FontSize(P(10)).FontColor(INK_SOFT);
                });
                if (i < steps.Length - 1) r.ConstantItem(P(22)).AlignMiddle().AlignCenter().Text("→").FontFamily(MONO).Bold().FontSize(P(16)).FontColor(NAVY);
            }
        });

    static void FormulaCard(ColumnDescriptor s, string label, string[] lines) =>
        s.Item().PaddingVertical(P(10)).ShowEntire().Background(NAVY).Padding(P(16)).Column(b =>
        {
            b.Item().PaddingBottom(P(8)).Text(label).Bold().FontSize(P(10.5)).FontColor("#B3B7C7").LetterSpacing(0.1f);
            foreach (var l in lines) b.Item().PaddingVertical(P(2.5)).Text(t => { t.DefaultTextStyle(x => x.LineHeight(1.5f)); Rich(t, l == "" ? " " : l, 12.5, Colors.White, true); });
        });

    void Step4(ColumnDescriptor s)
    {
        double provInc = c.Num("provIncentive"), confInc = c.Num("confIncentive");
        if (deals.Count > 0 && (provInc > 0 || confInc > 0))
        {
            SectionH(s, NextNo(), "Per-deal payable");
            Bullets(s, "For each deal we compute a **Deal Incentive Share**, then apply the rule that fits the deal.");
            if (provInc > 0)
            {
                SubHead(s, "Provisional flow", 16);
                Flow(s, new[] { ("Provisional Incentive", Fmt.Inr(provInc)), ("Deal Incentive Share", "Incentive × Rev÷Total"), ("Payable", "25% (Focus) or ₹0") });
                FormulaCard(s, "PROVISIONAL PAYABLE FORMULA", new[]
                {
                    "Deal Incentive Share = Provisional Incentive × (Deal Revenue ÷ Total Provisional Incentive Deal Revenue)", "",
                    "[[Then per-deal:]]",
                    "For Focus deal     → Provisional Payable = {{25%}} × Deal Incentive Share",
                    "For Non-Focus deal → Provisional Payable = {{₹0}}",
                });
            }
            if (confInc > 0)
            {
                SubHead(s, "Confirmed flow", 20);
                Flow(s, new[] { ("Confirmed Incentive", Fmt.Inr(confInc)), ("Deal Incentive Share", "Incentive × Rev÷Total"), ("Payable", "Payout will be based on whichever is higher: 50% or actual collection.") });
                FormulaCard(s, "CONFIRMED PAYABLE FORMULA", new[]
                {
                    "Deal Incentive Share = Confirmed Incentive × (Deal Revenue ÷ Total Confirmed Incentive Deal Revenue)", "",
                    "[[Then per-deal:]]",
                    "{{Payout will be based on whichever is higher: 50% or actual collection.}}",
                });
            }
            SubHead(s, "Per-deal payable table", 22);
            PayTable(s);
            if (c.Num("fy27Payable") > 0) Breakup(s);
        }
        else if (deals.Count > 0)
        {
            SectionH(s, NextNo(), "Per-deal payable");
            Bullets(s,
                scenario == "below_target"
                    ? "Neither Provisional nor Confirmed Deal Revenue crossed the Eligibility Target this cycle. All per-deal payables are ₹0."
                    : "None of your deals qualified for a payable amount this cycle.",
                $"Once your cumulative revenue crosses **{Fmt.Inr(c.Num("eligibilityTarget"))}**, the calculation kicks in from the next Dollar Day.");
        }
    }

    void TcfCell(IContainer x, JsonElement d)
    {
        var share = d.Num("sharePct");
        x.Element(BCell).Column(col =>
        {
            col.Item().Text(d.Str("tcfId")).FontFamily(MONO).Bold().FontSize(P(9)).LineHeight(1.1f);
            if (share != 100) col.Item().Text($"Share {share}%").Bold().FontSize(P(9)).FontColor(ORANGE_DEEP);
        });
    }

    void ShareCell(IContainer x, double inc, double share, double rev, double bas, bool applies)
    {
        if (share <= 0 || bas <= 0)
        {
            x.Element(BCell).AlignRight().Text("-").FontSize(P(14)).FontColor(MUTED);
            return;
        }
        var cell = x.BorderBottom(0.5f).BorderColor(BORDER).Background(applies ? "#ECFDF5" : Colors.White);
        if (applies) cell = cell.BorderLeft(2).BorderColor(GREEN);
        cell.PaddingVertical(P(10)).PaddingHorizontal(P(12)).AlignMiddle().Column(col =>
        {
            col.Item().AlignRight().Text($"{Fmt.Inr(inc)} × ({Fmt.Lakh(rev)} ÷ {Fmt.Lakh(bas)})").FontFamily(MONO).FontSize(P(10)).FontColor(MUTED);
            col.Item().PaddingTop(3).AlignRight().Text($"= {Fmt.Inr(share)}").FontFamily(MONO).Bold().FontSize(P(13.5)).FontColor(applies ? GREEN_DEEP : NAVY);
        });
    }

    void PayTable(ColumnDescriptor s)
    {
        double provInc = c.Num("provIncentive"), confInc = c.Num("confIncentive"), provBase = c.Num("provBase"), confBase = c.Num("confBase");
        s.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(1.8f); cd.RelativeColumn(1.25f); cd.RelativeColumn(1.05f); cd.RelativeColumn(1.4f); cd.RelativeColumn(1.4f); cd.RelativeColumn(1.05f); cd.RelativeColumn(1.6f); });
            void Head(string h, string? sub, bool right, bool center)
            {
                var cell = t.Cell().Element(HCell);
                var al = right ? cell.AlignRight() : center ? cell.AlignCenter() : cell;
                al.Column(col =>
                {
                    col.Item().Text(h).Bold().FontSize(P(10.5)).FontColor(Colors.White);
                    if (sub != null) col.Item().PaddingTop(3).Text(sub).FontFamily(MONO).FontSize(P(9.5)).FontColor("#9CA0B4");
                });
            }
            Head("TCF ID", null, false, false); Head("Deal Revenue", null, true, false); Head("Stage & Type", null, false, false);
            Head("Provisional Deal Incentive Share", "Prov Inc × Deal Rev ÷ Total Prov Rev", true, false);
            Head("Confirmed Deal Incentive Share", "Conf Inc × Deal Rev ÷ Total Conf Rev", true, false);
            Head("Which Incentive applies", null, false, true); Head("Final Payable", null, true, false);

            foreach (var dr in results)
            {
                var d = dr.GetProperty("deal"); var stage = d.Str("stage");
                TcfCell(t.Cell(), d);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(d.Num("revenue"))).FontFamily(MONO).FontSize(P(10.5));
                if (stage == "Not counted" || d.Str("selfTeam") == "Team")
                {
                    bool nc = stage == "Not counted";
                    Badge(t.Cell().Element(BCell), nc ? "Not counted" : "Team deal", nc ? RED_SOFT : AMBER_SOFT, nc ? RED_DEEP : ORANGE_DEEP);
                    t.Cell().Element(BCell).AlignRight().Text("-").FontSize(P(14)).FontColor(MUTED);
                    t.Cell().Element(BCell).AlignRight().Text("-").FontSize(P(14)).FontColor(MUTED);
                    t.Cell().Element(BCell).AlignCenter().Column(col =>
                    {
                        col.Item().AlignCenter().Text("No incentive").Bold().FontSize(P(10.5)).FontColor(MUTED);
                        col.Item().AlignCenter().Text(nc ? "Not counted deal" : "Team deal - excluded from base").Italic().FontSize(P(10.5)).FontColor(MUTED);
                    });
                    t.Cell().Element(BCell).AlignRight().Text("₹0").FontFamily(MONO).Bold().FontSize(P(13.5));
                    continue;
                }
                var which = dr.Str("whichApplies");
                t.Cell().Element(BCell).Text(x => { x.Span(stage).FontSize(P(11)).FontColor(INK_SOFT); x.Span("\n" + d.Str("type")).FontSize(P(11)).FontColor(INK_SOFT); });
                ShareCell(t.Cell(), provInc, dr.Num("provShare"), d.Num("revenue"), provBase, which == "provisional");
                if (stage != "Counted" && dr.Num("confShare") > 0)
                    ShareCell(t.Cell(), confInc, dr.Num("confShare"), d.Num("revenue"), confBase, which == "confirmed");
                else t.Cell().Element(BCell).AlignRight().Text("-").FontSize(P(14)).FontColor(MUTED);
                t.Cell().Element(BCell).AlignCenter().Column(col =>
                {
                    if (which == "provisional")
                    {
                        col.Item().AlignCenter().Text("Provisional").Bold().FontSize(P(10.5)).FontColor(GREEN_DEEP);
                        col.Item().AlignCenter().Text("25% focus advance").FontSize(P(10.5)).FontColor(INK_SOFT);
                    }
                    else if (which == "confirmed")
                    {
                        col.Item().AlignCenter().Text("Confirmed").Bold().FontSize(P(10.5)).FontColor(ORANGE_DEEP);
                        col.Item().AlignCenter().Text($"Collection {Fmt.Pct(d.Num("collection"))}").FontSize(P(10.5)).FontColor(INK_SOFT);
                    }
                    else
                    {
                        col.Item().AlignCenter().Text("No incentive").Bold().FontSize(P(10.5)).FontColor(MUTED);
                        if (dr.Str("noReason") != "") col.Item().AlignCenter().Text(dr.Str("noReason")).Italic().FontSize(P(10.5)).FontColor(MUTED);
                    }
                });
                t.Cell().Element(BCell).Column(col =>
                {
                    if (dr.Num("payable") > 0)
                    {
                        col.Item().AlignRight().Text(dr.Str("calcNote")).FontFamily(MONO).FontSize(P(10)).FontColor(MUTED);
                        col.Item().PaddingTop(3).AlignRight().Text($"= {Fmt.Inr(dr.Num("payable"))}").FontFamily(MONO).Bold().FontSize(P(13.5)).FontColor(NAVY);
                    }
                    else col.Item().AlignRight().Text("₹0").FontFamily(MONO).Bold().FontSize(P(13.5));
                });
            }
            t.Cell().ColumnSpan(6).Background(NAVY_SOFT).Padding(P(12)).AlignRight().Text("Total FY27 Payable this cycle").Bold().FontSize(P(13)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(12)).AlignRight().Text(Fmt.Inr(c.Num("fy27Payable"))).FontFamily(MONO).Bold().FontSize(P(14)).FontColor(NAVY);
        });
    }

    void Breakup(ColumnDescriptor s)
    {
        s.Item().PaddingTop(P(20)).PaddingBottom(3).EnsureSpace(90).Text(t =>
        {
            t.Span("Monetary & ESOP breakup ").Bold().FontSize(P(13.5)).FontColor(INK);
            t.Span("- 80% cash in bank, 20% ESOP per deal").Medium().FontSize(P(11)).FontColor(INK_SOFT);
        });
        s.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(2.4f); cd.RelativeColumn(1.5f); cd.RelativeColumn(1.5f); cd.RelativeColumn(1.5f); });
            t.Cell().Element(HCell).Text("TCF ID").Bold().FontSize(P(10.5)).FontColor(Colors.White);
            t.Cell().Element(HCell).AlignRight().Text("Final Payable").Bold().FontSize(P(10.5)).FontColor(Colors.White);
            t.Cell().Element(HCell).AlignRight().Text(x => { x.Span("Monetary ").Bold().FontSize(P(10.5)).FontColor(Colors.White); x.Span("(80%)").Medium().FontSize(P(10.5)).FontColor("#B3B7C7"); });
            t.Cell().Element(HCell).AlignRight().Text(x => { x.Span("ESOP ").Bold().FontSize(P(10.5)).FontColor(Colors.White); x.Span("(20%)").Medium().FontSize(P(10.5)).FontColor("#B3B7C7"); });
            foreach (var dr in results.Where(r => r.Num("payable") > 0))
            {
                t.Cell().Element(BCell).Text(dr.GetProperty("deal").Str("tcfId")).FontFamily(MONO).Bold().FontSize(P(10.5));
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(dr.Num("payable"))).FontFamily(MONO).Bold().FontSize(P(12)).FontColor(NAVY);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(dr.Num("cashPayable"))).FontFamily(MONO).Bold().FontSize(P(12)).FontColor(GREEN_DEEP);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(dr.Num("esopPayable"))).FontFamily(MONO).Bold().FontSize(P(12)).FontColor(ORANGE_DEEP);
            }
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).Text("Total").Bold().FontSize(P(12)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).AlignRight().Text(Fmt.Inr(c.Num("fy27Payable"))).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).AlignRight().Text(Fmt.Inr(c.Num("fy27CashPayable"))).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(GREEN_DEEP);
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).AlignRight().Text(Fmt.Inr(c.Num("fy27EsopPayable"))).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(ORANGE_DEEP);
        });
    }

    // ---------- steps 5-7 ----------
    void Footer(ColumnDescriptor f)
    {
        f.Item().PaddingTop(P(14)).PaddingBottom(P(14)).Column(x =>
        {
            x.Item().PaddingBottom(P(6)).Text(t => Rich(t, "If you still have any doubts, please first reach out to your T3 or P&L. If your doubts remain unresolved, write to **incentive@squareyards.com**.", 13.5));
            x.Item().Text(t => Rich(t, "- **Incentive Team, Square Yards**", 13, INK_SOFT));
        });
    }

    void Step5(ColumnDescriptor body, Action<ColumnDescriptor>? tail = null) => body.Item().ShowEntire().Column(s =>
    {
        double due = c.Num("due"), fy27 = c.Num("fy27Payable"), cash = c.Num("fy27CashPayable"), paid = c.Num("alreadyPaid"), cum = c.Num("cumulativeCash");
        var back = c.GetProperty("backYear").Num("total"); bool hasBack = back > 0;
        string dueTag = due < 0 ? "^^" + Fmt.Inr(due) + "^^" : "**" + Fmt.Inr(due) + "**";
        SectionH(s, NextNo(), "Due Incentive (cash in bank) after netting Already Paid");
        var dueColor = due < 0 ? RED_DEEP : due > 0 ? GREEN_DEEP : INK;
        var lines = new List<string> { $"FY27 Monetary Payable (80% of ₹{Fmt.InrNoSym(fy27)}) = **{Fmt.Inr(cash)}**" };
        if (hasBack) { lines.Add($"Prior Period Payable = **{Fmt.Inr(back)}**"); lines.Add($"Cumulative Monetary Payable = {Fmt.Inr(cash)} + {Fmt.Inr(back)} = **{Fmt.Inr(cum)}**"); }
        lines.Add($"Total Already Paid = **{Fmt.Inr(paid)}**");
        s.Item().PaddingTop(3).ShowEntire().Background(NAVY_SOFT).BorderLeft(2).BorderColor(NAVY).Padding(P(12)).Column(b =>
        {
            foreach (var l in lines) b.Item().PaddingVertical(1.5f).Text(t => Rich(t, l, 13, INK, true));
            b.Item().PaddingVertical(1.5f).Text(t =>
            {
                t.Span($"Due Incentive (cash in bank) = {Fmt.Inr(hasBack ? cum : cash)} - {Fmt.Inr(paid)} = ").FontFamily(MONO).Bold().FontSize(P(13)).FontColor(INK);
                t.Span(Fmt.Inr(due)).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(dueColor);
            });
        });
        if (due < 0)
            ColorBox(s, RED_SOFT, RED, "^^No clawback:^^ Nothing is disbursed this cycle, and the amount already paid stays with you. Disbursement will be released whenever the due incentive becomes positive.");
        tail?.Invoke(s);
    });

    void Step6(ColumnDescriptor body, Action<ColumnDescriptor>? tail = null) => body.Item().ShowEntire().Column(s =>
    {
        if (c.Num("due") <= 0)
        {
            SectionH(s, NextNo(), "CRM release check - not applicable");
            ColorBox(s, NAVY_SOFT, MUTED, "The CRM check only matters when the Due amount is above ₹0. Your Due amount is not positive this cycle, so nothing is disbursed regardless of CRM approval.");
            tail?.Invoke(s);
            return;
        }
        SectionH(s, NextNo(), "CRM release check");
        if (rm.Bool("hasCrm"))
            ColorBox(s, GREEN_SOFT, GREEN, "**Release ✓.** You have a CRM-approved deal in the T-1 or T month (T = Dollar Day month), so the Due amount disburses this Dollar Day.");
        else
            ColorBox(s, AMBER_SOFT, ORANGE, $"<<Incentive Held>> as you don't have a CRM-approved deal in the T-1 or T month (T = Dollar Day month).\nYour Due Incentive of **{Fmt.Inr(c.Num("due"))}** will release automatically the next qualifying month.");
        tail?.Invoke(s);
    });

    void Step7(ColumnDescriptor body, Action<ColumnDescriptor>? tail = null) => body.Item().ShowEntire().Column(s =>
    {
        double cash = c.Num("dueForRelease");
        bool zero = cash <= 0;
        string note = c.Num("due") > 0 && !rm.Bool("hasCrm") ? "Held until CRM approval" : "No disbursement this cycle";
        double esop = cash * 0.25;
        SectionH(s, NextNo(), "This Dollar Day disbursement");
        s.Item().PaddingTop(10).ShowEntire().Column(b =>
        {
            b.Item().Row(r =>
            {
                r.RelativeItem().Background(zero ? NAVY_SOFT : GREEN_SOFT).Border(1).BorderColor(zero ? BORDER_STRONG : GREEN).Padding(P(16)).Column(k =>
                {
                    k.Item().AlignCenter().Text("CASH IN BANK").Bold().FontSize(P(10.5)).FontColor(zero ? MUTED : GREEN_DEEP).LetterSpacing(0.08f);
                    k.Item().PaddingTop(4).AlignCenter().Text(Fmt.Inr(cash)).FontFamily(MONO).Bold().FontSize(P(22)).FontColor(zero ? MUTED : GREEN_DEEP);
                    k.Item().PaddingTop(4).AlignCenter().Text(zero ? note : "80% of total incentive").FontSize(P(11)).FontColor(INK_SOFT);
                });
                r.ConstantItem(P(14));
                r.RelativeItem().Background(zero ? NAVY_SOFT : "#FFFBEB").Border(1).BorderColor(zero ? BORDER_STRONG : ORANGE).Padding(P(16)).Column(k =>
                {
                    k.Item().AlignCenter().Text("ESOP").Bold().FontSize(P(10.5)).FontColor(zero ? MUTED : ORANGE_DEEP).LetterSpacing(0.08f);
                    k.Item().PaddingTop(4).AlignCenter().Text(Fmt.Inr(esop)).FontFamily(MONO).Bold().FontSize(P(22)).FontColor(zero ? MUTED : ORANGE_DEEP);
                    k.Item().PaddingTop(4).AlignCenter().Text(zero ? note : "20% of total incentive").FontSize(P(11)).FontColor(INK_SOFT);
                });
            });
        });
        tail?.Invoke(s);
    });
}
