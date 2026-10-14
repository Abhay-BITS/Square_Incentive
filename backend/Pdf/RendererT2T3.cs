using System.Text.Json;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace IncentiveTool.Api.Pdf;

// QuestPDF renderer for T2/T3 incentive PDFs. Structurally mirrors Renderer (T0/T1) but
// uses the T2/T3 calc model: Team Incentive (slab) + Self Incentive (flat 5%), PIP hold
// instead of CRM hold, and dynamic slab percentages.
public class RendererT2T3
{
    const string NAVY = "#0F1738", NAVY_SOFT = "#F4F5F9", BORDER = "#E2E8F0", BORDER_STRONG = "#CBD5E1",
        INK = "#1F2A44", INK_SOFT = "#475569", MUTED = "#64748B", GREEN = "#16A34A", GREEN_DEEP = "#166534",
        GREEN_SOFT = "#D1FAE5", ORANGE = "#E08A2B", ORANGE_DEEP = "#B45309", AMBER_SOFT = "#FEF3C7",
        RED = "#DC2626", RED_DEEP = "#B02E2E", RED_SOFT = "#FEE2E2", BG = "#F4F5F7", GOLD = "#FDB744",
        MUTED_BG = "#F1F5F9", MUTED_BG2 = "#F8FAFC", MUTED_BORDER = "#CBD5E1", MUTED_TEXT = "#94A3B8",
        LINK = "#1D4ED8";
    const string SANS = "Inter", MONO = "JetBrains Mono";
    const float PX = 0.68f;
    static float P(double px) => (float)(px * PX);

    static readonly byte[] LogoWhite = File.ReadAllBytes(Path.Combine(AppContext.BaseDirectory, "Pdf", "logo-white.png"));

    readonly JsonElement rm, c;
    readonly List<JsonElement> deals, results;
    readonly string month, range, scenario;
    readonly string fyLabel, fyAprilLabel;
    int stepNo;
    int NextNo() => ++stepNo;

    public static byte[] Render(JsonElement rm) =>
        Document.Create(d => new RendererT2T3(rm).Compose(d)).GeneratePdf();

    public static string FileName(JsonElement rm) =>
        $"{rm.GetProperty("empCode").GetString()}_{rm.GetProperty("calc").GetProperty("ddShort").GetString()}DD.pdf";

    public RendererT2T3(JsonElement rm)
    {
        this.rm = rm; c = rm.GetProperty("calc");
        deals = rm.Arr("deals").ToList(); results = c.Arr("dealResults").ToList();
        var dl = c.Str("ddLabel"); month = dl == "" ? "this cycle" : dl;
        range = c.GetProperty("coverage").ValueKind == JsonValueKind.Null ? "" : c.GetProperty("coverage").Str("rangeLabel");
        scenario = c.Str("overallScenario");
        var fyEl = c.GetProperty("fy");
        fyLabel = fyEl.ValueKind != JsonValueKind.Undefined && fyEl.ValueKind != JsonValueKind.Null
            ? fyEl.Str("fyLabel") : "FY27";
        fyAprilLabel = fyEl.ValueKind != JsonValueKind.Undefined && fyEl.ValueKind != JsonValueKind.Null
            ? fyEl.Str("fyAprilLabel") : "April 2026";
    }

    // ---------- rich text: **bold**  ^^red bold^^  {{gold}}  [[muted]]  <<dark yellow bold>> ----------
    static void Rich(TextDescriptor t, string s, double px, string color = INK, bool mono = false)
    {
        bool bold = false, red = false, gold = false, dim = false, hl = false; var buf = "";
        void Flush()
        {
            if (buf == "") return;
            var sp = t.Span(buf).FontSize(P(px)).FontFamily(mono ? MONO : SANS)
                .FontColor(hl ? "#A16207" : red ? RED_DEEP : gold ? GOLD : dim ? "#A5A9BB" : color);
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

    static string StgLabel(JsonElement d) => d.Bool("isLoggedIn") ? "Logged In" : d.Str("stage");
    static string StgBg(JsonElement d) => d.Bool("isLoggedIn") ? "#DBEAFE" : d.Str("stage") == "Collected" ? GREEN_SOFT : d.Str("stage") == "Confirmed" ? AMBER_SOFT : d.Str("stage") == "Not counted" ? RED_SOFT : "#EEF2F7";
    static string StgFg(JsonElement d) => d.Bool("isLoggedIn") ? "#1E40AF" : d.Str("stage") == "Collected" ? GREEN_DEEP : d.Str("stage") == "Confirmed" ? ORANGE_DEEP : d.Str("stage") == "Not counted" ? RED_DEEP : INK_SOFT;

    // ---------- section divider ----------
    static void SectionDivider(ColumnDescriptor col, string text) =>
        col.Item().PaddingTop(P(22)).EnsureSpace(60).Background(ORANGE_DEEP).PaddingVertical(P(10)).PaddingHorizontal(P(16))
            .Text(text).Bold().FontSize(P(14)).FontColor(Colors.White);

    // ---------- flow & formula helpers ----------
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

    // ---------- TCF / deal helpers ----------
    static string BeatsUrl(string linkId) => $"https://beats.squareyards.com/sales/tcf.aspx?id={linkId}";

    void TcfSpan(TextDescriptor t, JsonElement d, double fontSize, bool bold)
    {
        var tcfId = d.Str("tcfId");
        var hasLink = !d.IsNull("tcfLinkId");
        var span = hasLink ? t.Hyperlink(tcfId, BeatsUrl(d.Str("tcfLinkId"))) : t.Span(tcfId);
        span.FontFamily(MONO).FontSize(P(fontSize)).FontColor(hasLink ? LINK : INK);
        if (bold) span.Bold();
    }

    void TcfCell(IContainer x, JsonElement d)
    {
        var share = d.Num("sharePct");
        var project = d.Str("projectName");
        x.Element(BCell).Column(col =>
        {
            col.Item().Text(t => TcfSpan(t, d, 9, true));
            if (project != "") col.Item().Text(project).FontSize(P(8)).FontColor(INK_SOFT);
            if (share != 100) col.Item().Text($"Share {share}%").Bold().FontSize(P(9)).FontColor(ORANGE_DEEP);
        });
    }

    string TcfList(IEnumerable<JsonElement> ds) => string.Join(", ", ds.Select(d => $"{d.Str("tcfId")} ({StgLabel(d)})"));
    string SumFormula(IEnumerable<JsonElement> ds) => string.Join(" + ", ds.Select(d => $"{d.Str("tcfId")} ({Fmt.Lakh(d.Num("revenue"))})"));

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

    // ---------- main compose ----------
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
                });
                card.Item().PaddingHorizontal(P(28)).Column(body =>
                {
                    stepNo = 0;
                    Hero(body);
                    var first = rm.Str("name");
                    body.Item().PaddingTop(P(22)).Text(t => Rich(t, $"Hi {first},", 14));
                    body.Item().PaddingTop(P(8)).Text(t => Rich(t, $"Below is your incentive breakdown for **{month} Dollar Day**.", 14));
                    FyBlock(body);
                    PriorCard(body);
                    Step8(body);
                    Step9(body);
                    Step10(body, Footer);
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
            case "positive":
                bg = GREEN_SOFT; border = GREEN; big = Fmt.InrNoSym(total);
                formula = $"{Fmt.Inr(total)} = {Fmt.Inr(due)} (Cash in bank, 80%) + {Fmt.Inr(esop)} (ESOP, 20%)"; break;
            case "held_pip":
                bg = AMBER_SOFT; border = ORANGE;
                formula = "₹0 disbursed this Dollar Day. See Step 8 for the held amount."; break;
            case "negative_due":
                label = "NO DISBURSEMENT THIS CYCLE"; formula = "Cumulative Payable is less than Already Paid - no clawback."; break;
            case "nil_due":
                label = "NO DISBURSEMENT THIS CYCLE"; formula = "Cumulative Payable exactly matches Already Paid."; break;
            case "zero_payable":
                formula = "None of your deals produced a payable amount this cycle."; break;
            case "no_deals":
                formula = "No deals in the eligibility window this cycle."; break;
        }
        body.Item().PaddingTop(P(28)).ShowEntire().Background(bg).Border(0.75f).BorderColor(border).PaddingVertical(P(22)).PaddingHorizontal(P(24)).Column(h =>
        {
            h.Item().PaddingBottom(P(6)).Text(label).Bold().FontSize(P(10.5)).FontColor(border).LetterSpacing(0.1f);
            h.Item().Text("₹" + big).FontFamily(MONO).Bold().FontSize(P(40)).FontColor(NAVY);
            h.Item().PaddingTop(P(10)).Text(formula).FontFamily(MONO).FontSize(P(12.5)).FontColor(INK_SOFT);
        });
    }

    // ---------- FY block (wraps Steps 1-6) ----------
    void FyBlock(ColumnDescriptor body) =>
        body.Item().PaddingTop(P(18)).Column(fy =>
        {
            fy.Item().Background(NAVY_SOFT).BorderBottom(1.4f).BorderColor(NAVY).Padding(P(18)).Column(h =>
            {
                h.Item().Text($"{fyAprilLabel} Onwards · {fyLabel}").Bold().FontSize(P(17)).FontColor(NAVY);
                h.Item().PaddingTop(P(6)).Text(t => Rich(t, $"Deals from **{range}** considered. Full calculation breakdown below.", 13));
            });
            fy.Item().Background(Colors.White).PaddingHorizontal(P(22)).PaddingBottom(P(12)).Column(s =>
            {
                SectionDivider(s, "SECTION A · TEAM INCENTIVE");
                Step1(s);
                Step2(s);
                Step3(s);

                SectionDivider(s, "SECTION B · SELF INCENTIVE");
                Step4(s);
                Step5(s);

                SectionDivider(s, "COMBINED · FINAL CALCULATION");
                Step6(s);
            });
            fy.Item().Background(MUTED_BG2).BorderTop(1.4f).BorderColor(NAVY_SOFT).PaddingVertical(P(14)).PaddingHorizontal(P(22)).Row(r =>
            {
                r.RelativeItem().AlignMiddle().Text($"{fyLabel} Total Payable (Self + Team)").FontFamily(MONO).Bold().FontSize(P(10.5)).FontColor(MUTED).LetterSpacing(0.06f);
                r.AutoItem().Text(Fmt.Inr(c.Num("fyPayable"))).FontFamily(MONO).Bold().FontSize(P(18)).FontColor(NAVY);
            });
        });

    // ---------- Step 1: Team YTD Cost and Team Target ----------
    void Step1(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Team YTD Cost and Eligibility Target");
        double teamYtdCost = c.Num("teamYtdCost");
        double teamMultiplier = c.Num("teamMultiplier");
        double teamTarget = c.Num("teamTarget");
        string multStr = teamMultiplier == Math.Floor(teamMultiplier) ? $"{(int)teamMultiplier}" : teamMultiplier.ToString("0.##");
        s.Item().ShowEntire().Column(grp =>
        {
            Bullets(grp,
                "**Self+Team YTD Cost** = your team's cumulative salary cost (including your own).",
                $"**Eligibility Target** = {multStr} × (Self+Team YTD Cost).",
                "Your team's revenue must cross this to earn any incentive.");
            MonoBox(grp, new[]
            {
                $"Self+Team YTD Cost = **{Fmt.Inr(teamYtdCost)}**",
                $"Eligibility Target (SMx {multStr}×) = {multStr} × {Fmt.Inr(teamYtdCost)} = **{Fmt.Inr(teamTarget)}**",
            });
        });
    }

    // ---------- Step 2: Team Deals ----------
    void Step2(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Team Deals");
        var teamDeals = deals.Where(d => d.Str("selfTeam") == "Team" && d.Str("stage") != "Not counted").ToList();
        if (teamDeals.Count == 0)
        {
            Bullets(s, $"No counted Team deals in **{range}**.");
            return;
        }
        Bullets(s, $"These are the {teamDeals.Count} Team deal(s) booked in **{range}**.");
        DealTable(s, teamDeals);
    }

    // ---------- Step 3: Team Incentive (Confirmed Team Revenue) ----------
    void Step3(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Confirmed Incentive (Team) Calculation");
        var teamDeals = deals.Where(d => d.Str("selfTeam") == "Team" && d.Str("stage") != "Not counted").ToList();
        if (teamDeals.Count == 0)
        {
            Bullets(s, "No counted Team deals this cycle. **Confirmed Incentive (Team) = ₹0.**");
            return;
        }

        double target = c.Num("teamTarget");
        double belowPct = c.Num("teamBelowPct");
        double abovePct = c.Num("teamAbovePct");
        double teamConfBase = c.Num("teamConfBase");
        double teamIncentive = c.Num("teamIncentive");
        double teamPayable = c.Num("teamPayable");
        double belowAmt = c.Num("teamBelowAmt");
        double aboveAmt = c.Num("teamAboveAmt");
        string belowStr = $"{belowPct * 100:0.##}%";
        string aboveStr = $"{abovePct * 100:0.##}%";

        var confTeamDeals = deals.Where(d => d.Str("selfTeam") == "Team" && d.Str("stage") is "Confirmed" or "Collected").ToList();

        Bullets(s,
            $"Two-slab incentive: **{belowStr}** of revenue up to Eligibility Target, **{aboveStr}** of revenue above Eligibility Target.",
            "Only Confirmed and Collected Team deals contribute to the revenue base.");

        if (teamConfBase == 0)
        {
            Bullets(s,
                "**Deals used:** none – no Confirmed or Collected Team deals this cycle.",
                $"**Eligibility Target:** {Fmt.Inr(target)}",
                "**Confirmed Incentive (Team) = ₹0.**");
        }
        else
        {
            var crossNote = Math.Abs(teamConfBase - target) < 0.5
                ? $"**Exactly at target** – {belowStr} of target applies."
                : teamConfBase > target
                    ? $"**Crosses target** by {Fmt.Inr(teamConfBase - target)}"
                    : $"Revenue is **below target**.";
            Bullets(s,
                $"**Deals used:** {TcfList(confTeamDeals)} ({confTeamDeals.Count} deal(s))",
                $"**Eligibility Target:** {Fmt.Inr(target)}",
                $"**Total Confirmed Team Revenue:** {SumFormula(confTeamDeals)} = {Fmt.Inr(teamConfBase)}",
                crossNote);
            TeamSlab(s, target, teamConfBase, teamIncentive, belowPct, abovePct, belowAmt, aboveAmt);
        }

        if (teamPayable > 0)
        {
            SubHead(s, "Per-deal payable", 16);
            Flow(s, new[] { ("Confirmed Incentive", Fmt.Inr(teamIncentive)), ("Deal Incentive Share", "Incentive × Rev÷Total"), ("Payable", "Payout will be based on whichever is higher: 50% or actual collection.") });
            FormulaCard(s, "CONFIRMED PAYABLE FORMULA", new[]
            {
                "Deal Incentive Share = Confirmed Incentive × (Deal Revenue ÷ Total Confirmed Incentive Deal Revenue)", "",
                "[[Then per-deal:]]",
                "{{Payout will be based on whichever is higher: 50% or actual collection.}}",
            });
            SubHead(s, "Per-deal payable table", 16);
            TeamPayTable(s);
        }
    }

    // ---------- Step 4: Self Deals ----------
    void Step4(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Self Deals");
        var selfDeals = deals.Where(d => d.Str("selfTeam") == "Self" && d.Str("stage") != "Not counted").ToList();
        if (selfDeals.Count == 0)
        {
            Bullets(s, $"No counted Self deals in **{range}**.");
            return;
        }
        Bullets(s, $"These are the {selfDeals.Count} Self deal(s) booked in **{range}**.");
        DealTable(s, selfDeals);
    }

    // ---------- Step 5: Self Incentive (Flat 5%) ----------
    void Step5(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Confirmed Incentive (Self) Calculation");
        var selfDeals = deals.Where(d => d.Str("selfTeam") == "Self" && d.Str("stage") != "Not counted").ToList();
        if (selfDeals.Count == 0)
        {
            Bullets(s, "No counted Self deals this cycle. **Confirmed Incentive (Self) = ₹0.**");
            return;
        }

        double selfConfBase = c.Num("selfConfBase");
        double selfIncentive = c.Num("selfIncentive");
        double selfPayable = c.Num("selfPayable");

        var confSelfDeals = deals.Where(d => d.Str("selfTeam") == "Self" && d.Str("stage") is "Confirmed" or "Collected").ToList();

        Bullets(s,
            "**Rule:** Confirmed Incentive (Self) = 5% × Confirmed Self Deal Revenue",
            "Only Confirmed and Collected Self deals contribute.");

        if (selfConfBase == 0)
        {
            Bullets(s,
                "**Deals used:** none – no Confirmed or Collected Self deals this cycle.",
                "**Confirmed Incentive (Self) = ₹0.**");
        }
        else
        {
            s.Item().ShowEntire().Column(grp =>
            {
                Bullets(grp,
                    $"**Deals used:** {TcfList(confSelfDeals)} ({confSelfDeals.Count} deal(s))",
                    $"**Total Confirmed Self Revenue:** {SumFormula(confSelfDeals)} = {Fmt.Inr(selfConfBase)}");
                MonoBox(grp, new[]
                {
                    $"Confirmed Incentive (Self) = 5% × {Fmt.Inr(selfConfBase)} = **{Fmt.Inr(selfIncentive)}**",
                });
            });
        }

        if (selfPayable > 0)
        {
            SubHead(s, "Per-deal payable", 16);
            Flow(s, new[] { ("Confirmed Incentive", Fmt.Inr(selfIncentive)), ("Deal Incentive Share", "Incentive × Rev÷Total"), ("Payable", "Payout will be based on whichever is higher: 50% or actual collection.") });
            FormulaCard(s, "CONFIRMED PAYABLE FORMULA", new[]
            {
                "Deal Incentive Share = Confirmed Incentive × (Deal Revenue ÷ Total Confirmed Incentive Deal Revenue)", "",
                "[[Then per-deal:]]",
                "{{Payout will be based on whichever is higher: 50% or actual collection.}}",
            });
            SubHead(s, "Per-deal payable table", 16);
            SelfPayTable(s);
        }
    }

    // ---------- Step 6: Combined Payable ----------
    void Step6(ColumnDescriptor s)
    {
        SectionH(s, NextNo(), "Combined FY 2026-27 Payable");
        double teamPayable = c.Num("teamPayable");
        double selfPayable = c.Num("selfPayable");
        double fyPayable = c.Num("fyPayable");
        MonoBox(s, new[]
        {
            $"Self Payable = **{Fmt.Inr(selfPayable)}**",
            $"Team Payable = **{Fmt.Inr(teamPayable)}**",
            $"**{fyLabel} Total Payable (Self + Team) = {Fmt.Inr(selfPayable)} + {Fmt.Inr(teamPayable)} = {Fmt.Inr(fyPayable)}**",
        });
        if (fyPayable > 0) Breakup(s);
    }

    // ---------- Team slab visual ----------
    void TeamSlab(ColumnDescriptor s, double target, double rev, double inc, double belowPct, double abovePct, double belowAmt, double aboveAmt)
    {
        string belowStr = $"{belowPct * 100:0.##}%";
        string aboveStr = $"{abovePct * 100:0.##}%";
        double excess = Math.Max(0, rev - target);

        int tw, ew; string state;
        if (Math.Abs(rev - target) < 0.5 && rev > 0) { state = "at_target"; tw = 55; ew = 45; }
        else if (rev > target) { state = "crosses"; tw = (int)Math.Min(70, Math.Max(25, Math.Round(100 * target / rev))); ew = 100 - tw; }
        else if (rev > 0) { state = "below_target"; tw = 60; ew = 40; }
        else { state = "no_revenue"; tw = 50; ew = 50; }

        bool leftActive = state != "below_target" && state != "no_revenue", rightActive = state == "crosses";
        string leftBg = leftActive ? GREEN_SOFT : MUTED_BG, leftBorder = leftActive ? GREEN : MUTED_BORDER, leftText = leftActive ? GREEN_DEEP : MUTED_TEXT;
        string rightBg = rightActive ? AMBER_SOFT : MUTED_BG2, rightBorder = rightActive ? ORANGE : MUTED_BORDER, rightText = rightActive ? ORANGE_DEEP : MUTED_TEXT;

        s.Item().PaddingTop(P(12)).PaddingBottom(P(6)).ShowEntire().Column(v =>
        {
            // Revenue marker when below target
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

            // Labels
            v.Item().Row(r =>
            {
                r.RelativeItem(tw).PaddingBottom(3).AlignRight().Text($"ELIGIBILITY TARGET (SMx 4×) · {Fmt.Lakh(target)}").Bold().FontSize(P(10.5)).FontColor(ORANGE_DEEP);
                var rl = r.RelativeItem(ew).PaddingBottom(3).AlignRight();
                if (state is "crosses" or "at_target")
                    rl.Text($"REVENUE · {Fmt.Lakh(rev)}").Bold().FontSize(P(10.5)).FontColor(GREEN_DEEP);
            });

            // Slab boxes
            v.Item().Row(r =>
            {
                r.RelativeItem(tw).Height(P(46)).Background(leftBg).Border(1.1f).BorderColor(leftBorder).AlignMiddle().AlignCenter().Text(belowStr).Bold().FontSize(P(20)).FontColor(leftText);
                r.RelativeItem(ew).Height(P(46)).Background(rightBg).Border(1.1f).BorderColor(rightBorder).AlignMiddle().AlignCenter().Text(aboveStr).Bold().FontSize(P(20)).FontColor(rightText);
            });
            v.Item().PaddingTop(2).Text("₹0").FontFamily(MONO).FontSize(P(10.5)).FontColor(INK_SOFT);

            // Brackets
            v.Item().Row(r =>
            {
                r.RelativeItem(tw).PaddingHorizontal(4).PaddingTop(3).Height(P(9)).BorderTop(1.1f).BorderLeft(1.1f).BorderRight(1.1f).BorderColor(leftBorder);
                r.RelativeItem(ew).PaddingHorizontal(4).PaddingTop(3).Height(P(9)).BorderTop(1.1f).BorderLeft(1.1f).BorderRight(1.1f).BorderColor(rightBorder);
            });

            // Formula under brackets
            v.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem(tw).AlignCenter().Text(t =>
                {
                    if (!leftActive) { t.Span("₹0").FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(leftText); return; }
                    var leftVal = Math.Min(rev, target);
                    t.Span($"{belowStr} × {Fmt.Lakh(leftVal)} = ").FontFamily(MONO).FontSize(P(11.5)).FontColor(leftText);
                    t.Span(Fmt.Inr(belowAmt)).FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(leftText);
                });
                r.RelativeItem(ew).AlignCenter().Text(t =>
                {
                    t.Span($"{aboveStr} × {(excess > 0 ? Fmt.Lakh(excess) : "₹0")} = ").FontFamily(MONO).FontSize(P(11.5)).FontColor(rightText);
                    t.Span(Fmt.Inr(aboveAmt)).FontFamily(MONO).Bold().FontSize(P(11.5)).FontColor(rightText);
                });
            });

            // Result pill
            string pillBg, pillBorder, pillColor;
            if (state is "no_revenue" or "below_target") { pillBg = MUTED_BG; pillBorder = MUTED_BORDER; pillColor = INK_SOFT; }
            else { pillBg = "#EFF4FA"; pillBorder = NAVY; pillColor = NAVY; }
            v.Item().PaddingTop(P(14)).Background(pillBg).Border(1.1f).BorderColor(pillBorder).PaddingVertical(P(10)).PaddingHorizontal(P(14)).AlignCenter().Text(t =>
            {
                if (state == "no_revenue")
                {
                    t.Span("Confirmed Incentive (Team) = ₹0 ").Bold().FontSize(P(13.5)).FontColor(pillColor);
                    t.Span("· no confirmed team revenue").Italic().Medium().FontSize(P(12)).FontColor(MUTED);
                }
                else if (state == "below_target")
                {
                    t.Span($"Confirmed Incentive (Team) = ₹0 ").Bold().FontSize(P(13.5)).FontColor(pillColor);
                    t.Span("· revenue below target").Italic().Medium().FontSize(P(12)).FontColor(MUTED);
                }
                else if (state is "crosses" or "at_target")
                    t.Span($"Confirmed Incentive (Team) = {Fmt.Inr(belowAmt)} + {Fmt.Inr(aboveAmt)} = {Fmt.Inr(inc)}").Bold().FontSize(P(13.5)).FontColor(pillColor);
                else
                    t.Span($"Confirmed Incentive (Team) = {Fmt.Inr(inc)}").Bold().FontSize(P(13.5)).FontColor(pillColor);
            });
        });
    }

    // ---------- shared deal table ----------
    void DealTable(ColumnDescriptor s, List<JsonElement> dealList)
    {
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
            foreach (var d in dealList)
            {
                var type = d.Str("type");
                t.Cell().Element(BCell).Text(tt => TcfSpan(tt, d, 11.5, false));
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(d.Num("revenue"))).FontFamily(MONO).FontSize(P(12));
                t.Cell().Element(BCell).AlignCenter().Text(d.Str("month") is "" ? "-" : d.Str("month")).FontSize(P(12)).FontColor(INK_SOFT);
                Badge(t.Cell().Element(BCell), StgLabel(d), StgBg(d), StgFg(d));
                Badge(t.Cell().Element(BCell), type, type == "Focus" ? GREEN_SOFT : RED_SOFT, type == "Focus" ? GREEN_DEEP : RED_DEEP);
                t.Cell().Element(BCell).AlignRight().Text(d.IsNull("collection") ? "-" : Fmt.Pct(d.Num("collection"))).FontFamily(MONO).FontSize(P(12));
            }
        });
    }

    // ---------- Team per-deal payable table ----------
    void TeamPayTable(ColumnDescriptor s)
    {
        double teamInc = c.Num("teamIncentive"), teamBase = c.Num("teamConfBase");
        var teamResults = results.Where(r => r.GetProperty("deal").Str("selfTeam") == "Team").ToList();
        s.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(1.8f); cd.RelativeColumn(1.2f); cd.RelativeColumn(1.0f); cd.RelativeColumn(1.8f); cd.RelativeColumn(1.2f); cd.RelativeColumn(1.5f); });
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
            Head("TCF ID", null, false, false);
            Head("Deal Revenue", null, true, false);
            Head("Stage & Type", null, false, false);
            Head("Confirmed Deal Incentive Share", "Conf Inc × Deal Rev ÷ Total Conf Rev", true, false);
            Head("Collection %", null, false, false);
            Head("Final Payable", null, true, false);

            foreach (var dr in teamResults)
            {
                var d = dr.GetProperty("deal"); var stage = d.Str("stage");
                TcfCell(t.Cell(), d);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(d.Num("revenue"))).FontFamily(MONO).FontSize(P(10.5));

                if (stage == "Not counted")
                {
                    Badge(t.Cell().Element(BCell), "Not counted", RED_SOFT, RED_DEEP);
                    t.Cell().Element(BCell).AlignRight().Text("-").FontSize(P(14)).FontColor(MUTED);
                    t.Cell().Element(BCell).AlignCenter().Column(col =>
                    {
                        col.Item().AlignCenter().Text("No incentive").Bold().FontSize(P(10.5)).FontColor(MUTED);
                        col.Item().AlignCenter().Text("Not counted deal").Italic().FontSize(P(10.5)).FontColor(MUTED);
                    });
                    t.Cell().Element(BCell).AlignRight().Text("₹0").FontFamily(MONO).Bold().FontSize(P(13.5));
                    continue;
                }

                var which = dr.Str("whichApplies");
                t.Cell().Element(BCell).Text(x => { x.Span(StgLabel(d)).FontSize(P(11)).FontColor(INK_SOFT); x.Span("\n" + d.Str("type")).FontSize(P(11)).FontColor(INK_SOFT); });

                var isLI = d.Bool("isLoggedIn") && d.Num("collection") > 0;
                var dealRev = isLI ? d.Num("revenue") * (d.Num("collection") / 100) : d.Num("revenue");
                ShareCell(t.Cell(), teamInc, dr.Num("teamShare"), dealRev, teamBase, which == "team");

                t.Cell().Element(BCell).Text(Fmt.Pct(d.Num("collection"))).FontFamily(MONO).Bold().FontSize(P(10.5));

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
            t.Cell().ColumnSpan(5).Background(NAVY_SOFT).Padding(P(12)).AlignRight().Text("Total Team Payable").Bold().FontSize(P(13)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(12)).AlignRight().Text(Fmt.Inr(c.Num("teamPayable"))).FontFamily(MONO).Bold().FontSize(P(14)).FontColor(NAVY);
        });
    }

    // ---------- Self per-deal payable table ----------
    void SelfPayTable(ColumnDescriptor s)
    {
        double selfInc = c.Num("selfIncentive"), selfBase = c.Num("selfConfBase");
        var selfResults = results.Where(r => r.GetProperty("deal").Str("selfTeam") == "Self").ToList();
        s.Item().Table(t =>
        {
            t.ColumnsDefinition(cd => { cd.RelativeColumn(1.8f); cd.RelativeColumn(1.2f); cd.RelativeColumn(1.0f); cd.RelativeColumn(1.8f); cd.RelativeColumn(1.2f); cd.RelativeColumn(1.5f); });
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
            Head("TCF ID", null, false, false);
            Head("Deal Revenue", null, true, false);
            Head("Stage & Type", null, false, false);
            Head("Confirmed Deal Incentive Share", "Conf Inc × Deal Rev ÷ Total Conf Rev", true, false);
            Head("Collection %", null, false, false);
            Head("Final Payable", null, true, false);

            foreach (var dr in selfResults)
            {
                var d = dr.GetProperty("deal"); var stage = d.Str("stage");
                TcfCell(t.Cell(), d);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(d.Num("revenue"))).FontFamily(MONO).FontSize(P(10.5));

                if (stage == "Not counted")
                {
                    Badge(t.Cell().Element(BCell), "Not counted", RED_SOFT, RED_DEEP);
                    t.Cell().Element(BCell).AlignRight().Text("-").FontSize(P(14)).FontColor(MUTED);
                    t.Cell().Element(BCell).AlignCenter().Column(col =>
                    {
                        col.Item().AlignCenter().Text("No incentive").Bold().FontSize(P(10.5)).FontColor(MUTED);
                        col.Item().AlignCenter().Text("Not counted deal").Italic().FontSize(P(10.5)).FontColor(MUTED);
                    });
                    t.Cell().Element(BCell).AlignRight().Text("₹0").FontFamily(MONO).Bold().FontSize(P(13.5));
                    continue;
                }

                var which = dr.Str("whichApplies");
                t.Cell().Element(BCell).Text(x => { x.Span(StgLabel(d)).FontSize(P(11)).FontColor(INK_SOFT); x.Span("\n" + d.Str("type")).FontSize(P(11)).FontColor(INK_SOFT); });

                var isLI = d.Bool("isLoggedIn") && d.Num("collection") > 0;
                var dealRev = isLI ? d.Num("revenue") * (d.Num("collection") / 100) : d.Num("revenue");
                ShareCell(t.Cell(), selfInc, dr.Num("selfShare"), dealRev, selfBase, which == "self");

                t.Cell().Element(BCell).Text(Fmt.Pct(d.Num("collection"))).FontFamily(MONO).Bold().FontSize(P(10.5));

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
            t.Cell().ColumnSpan(5).Background(NAVY_SOFT).Padding(P(12)).AlignRight().Text("Total Self Payable").Bold().FontSize(P(13)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(12)).AlignRight().Text(Fmt.Inr(c.Num("selfPayable"))).FontFamily(MONO).Bold().FontSize(P(14)).FontColor(NAVY);
        });
    }

    // ---------- Breakup (80% cash / 20% ESOP per deal) ----------
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
                t.Cell().Element(BCell).Text(tt => TcfSpan(tt, dr.GetProperty("deal"), 10.5, true));
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(dr.Num("payable"))).FontFamily(MONO).Bold().FontSize(P(12)).FontColor(NAVY);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(dr.Num("cashPayable"))).FontFamily(MONO).Bold().FontSize(P(12)).FontColor(GREEN_DEEP);
                t.Cell().Element(BCell).AlignRight().Text(Fmt.Inr(dr.Num("esopPayable"))).FontFamily(MONO).Bold().FontSize(P(12)).FontColor(ORANGE_DEEP);
            }
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).Text("Total").Bold().FontSize(P(12)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).AlignRight().Text(Fmt.Inr(c.Num("fyPayable"))).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(NAVY);
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).AlignRight().Text(Fmt.Inr(c.Num("fyCashPayable"))).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(GREEN_DEEP);
            t.Cell().Background(NAVY_SOFT).Padding(P(10)).AlignRight().Text(Fmt.Inr(c.Num("fyEsopPayable"))).FontFamily(MONO).Bold().FontSize(P(13)).FontColor(ORANGE_DEEP);
        });
    }

    // ---------- Prior Period card ----------
    void PriorCard(ColumnDescriptor body)
    {
        var total = c.GetProperty("backYear").Num("total");
        body.Item().PaddingTop(P(18)).ShowEntire().Border(1.4f).BorderColor(ORANGE_DEEP).Column(p =>
        {
            p.Item().Background("#FFFBEB").BorderBottom(1.4f).BorderColor(ORANGE_DEEP).Padding(P(18)).Column(h =>
            {
                h.Item().Text($"Prior Period · Before {fyAprilLabel}").Bold().FontSize(P(17)).FontColor(ORANGE_DEEP);
                h.Item().PaddingTop(P(6)).Text("Final incentive payable, calculated under the earlier rules.").FontSize(P(12.5)).FontColor(INK_SOFT);
            });
            p.Item().Background(Colors.White).Padding(P(20)).Row(r =>
            {
                r.RelativeItem().AlignMiddle().Text("Final Incentive Payable (Self+Team)").Bold().FontSize(P(13.5));
                r.AutoItem().Text(Fmt.Inr(total)).FontFamily(MONO).Bold().FontSize(P(18)).FontColor(NAVY);
            });
        });
    }

    // ---------- Step 8: Due Incentive ----------
    void Step8(ColumnDescriptor body, Action<ColumnDescriptor>? tail = null) => body.Item().ShowEntire().Column(s =>
    {
        double due = c.Num("due"), fy = c.Num("fyPayable"), cash = c.Num("fyCashPayable"), paid = c.Num("alreadyPaid"), cum = c.Num("cumulativeCash");
        var back = c.GetProperty("backYear").Num("total"); bool hasBack = back > 0;
        SectionH(s, NextNo(), "Due Incentive (cash in bank) after netting Already Paid");
        var dueColor = due < 0 ? RED_DEEP : due > 0 ? GREEN_DEEP : INK;
        var lines = new List<string> { $"{fyLabel} Monetary Payable (80% of ₹{Fmt.InrNoSym(fy)}) = **{Fmt.Inr(cash)}**" };
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

    // ---------- Step 9: PIP release check ----------
    void Step9(ColumnDescriptor body, Action<ColumnDescriptor>? tail = null) => body.Item().ShowEntire().Column(s =>
    {
        if (c.Num("due") <= 0)
        {
            SectionH(s, NextNo(), "PIP release check - not applicable");
            ColorBox(s, NAVY_SOFT, MUTED, "The PIP check only matters when the Due amount is above ₹0. Your Due amount is not positive this cycle, so nothing is disbursed regardless of PIP status.");
            tail?.Invoke(s);
            return;
        }
        SectionH(s, NextNo(), "PIP release check");
        if (!c.Bool("hasPip"))
            ColorBox(s, GREEN_SOFT, GREEN, "**Released ✓.** You are not on PIP, so the Due amount disburses this Dollar Day.");
        else
            ColorBox(s, AMBER_SOFT, ORANGE, $"<<Incentive Held>> pending PIP clearance.\nYour Due Incentive of **{Fmt.Inr(c.Num("due"))}** will release automatically once the PIP is cleared.");
        tail?.Invoke(s);
    });

    // ---------- Step 10: This Dollar Day disbursement ----------
    void Step10(ColumnDescriptor body, Action<ColumnDescriptor>? tail = null) => body.Item().ShowEntire().Column(s =>
    {
        double cash = c.Num("dueForRelease");
        bool zero = cash <= 0;
        string note = c.Num("due") > 0 && c.Bool("hasPip") ? "Held pending PIP clearance" : "No disbursement this cycle";
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

    // ---------- footer ----------
    void Footer(ColumnDescriptor f)
    {
        f.Item().PaddingTop(P(14)).PaddingBottom(P(14)).Column(x =>
        {
            x.Item().PaddingBottom(P(6)).Text(t => Rich(t, "If you still have any doubts, please first reach out to your P&L. If your doubts remain unresolved, write to **incentive@squareyards.com**.", 13.5));
            x.Item().PaddingTop(P(16)).Column(sig =>
            {
                sig.Item().Text("Regards,").FontSize(P(13)).FontColor(INK_SOFT);
                sig.Item().Text("Incentive Team").Bold().FontSize(P(14)).FontColor(NAVY);
                sig.Item().Text("Square Yards").FontSize(P(13)).FontColor(MUTED);
            });
            x.Item().PaddingTop(P(18)).BorderTop(0.5f).BorderColor(BORDER).PaddingTop(P(12))
                .Text("This document is confidential and intended solely for the named recipient. Please do not forward or share it with anyone else.").FontSize(P(11)).FontColor(MUTED);
        });
    }
}
