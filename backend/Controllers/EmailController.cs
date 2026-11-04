using System.Text.Json;
using IncentiveTool.Api.Pdf;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using MimeKit;

namespace IncentiveTool.Api.Controllers;

[ApiController]
[Route("api/email")]
public class EmailController : ControllerBase
{
    private readonly ILogger<EmailController> _logger;

    public EmailController(ILogger<EmailController> logger) => _logger = logger;

    public record SendRequest(
        JsonElement Rm,
        string RecipientEmail,
        string RecipientName,
        string Subject,
        string Body,
        string[] CcEmails,
        string? SmtpUser = null,
        string? SmtpPass = null,
        string? Tier = null,
        string? FromEmail = null,
        string? FromName = null,
        string? PreRenderedHtml = null,
        string? AttachmentFileName = null
    );

    private static (string host, int port, string user, string pass, string fromEmail, string fromName, bool ok) GetSendGridConfig()
    {
        var host = Environment.GetEnvironmentVariable("SENDGRID_SMTP_HOST") ?? "";
        var portStr = Environment.GetEnvironmentVariable("SENDGRID_SMTP_PORT") ?? "587";
        var user = Environment.GetEnvironmentVariable("SENDGRID_USERNAME") ?? "";
        var pass = Environment.GetEnvironmentVariable("SENDGRID_PASSWORD") ?? "";
        var fromEmail = Environment.GetEnvironmentVariable("SENDGRID_FROM_EMAIL") ?? "incentive@Squareyards.com";
        var fromName = Environment.GetEnvironmentVariable("SENDGRID_FROM_NAME") ?? "Incentive Team";
        var ok = !string.IsNullOrWhiteSpace(host) && !string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(pass);
        return (host, int.TryParse(portStr, out var p) ? p : 587, user, pass, fromEmail, fromName, ok);
    }

    private static MimeMessage BuildMessage(string fromEmail, string fromName, string toEmail, string toName,
        string subject, string body, string fileName, byte[] attachmentBytes, ContentType attachmentType, string[]? ccEmails = null)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));

        if (ccEmails is { Length: > 0 })
        {
            foreach (var cc in ccEmails)
            {
                var trimmed = cc.Trim();
                if (!string.IsNullOrEmpty(trimmed))
                    message.Cc.Add(MailboxAddress.Parse(trimmed));
            }
        }

        message.Subject = subject;
        var bodyBuilder = new BodyBuilder { TextBody = body };
        bodyBuilder.Attachments.Add(fileName, attachmentBytes, attachmentType);
        message.Body = bodyBuilder.ToMessageBody();
        return message;
    }

    // NOTE: MimeKit.ContentType is NOT thread-safe — AttachmentCollection.Add mutates the
    // ContentType's internal header list when attaching it to a MIME part. Sharing a single
    // ContentType across concurrent BuildMessage calls causes HeaderList race conditions
    // ("Index was out of range", "Unexpected token at offset X"). Construct a fresh instance
    // every call.
    private static (byte[] bytes, string fileName, ContentType type) BuildAttachment(
        JsonElement rm, string? tier, string? preRenderedHtml, string? attachmentFileName)
    {
        // Promo / client-side path: use pre-rendered HTML as the attachment.
        if (!string.IsNullOrWhiteSpace(preRenderedHtml))
        {
            var htmlBytes = System.Text.Encoding.UTF8.GetBytes(preRenderedHtml);
            var fallbackName = tier == "t2t3"
                ? RendererT2T3.FileName(rm).Replace(".pdf", ".html", StringComparison.OrdinalIgnoreCase)
                : Renderer.FileName(rm).Replace(".pdf", ".html", StringComparison.OrdinalIgnoreCase);
            var name = !string.IsNullOrWhiteSpace(attachmentFileName) ? attachmentFileName! : fallbackName;
            return (htmlBytes, name, new ContentType("text", "html") { Charset = "utf-8" });
        }

        // Standard path: server-rendered PDF.
        var t2t3 = tier == "t2t3";
        var pdfBytes = t2t3 ? RendererT2T3.Render(rm) : Renderer.Render(rm);
        var fileName = t2t3 ? RendererT2T3.FileName(rm) : Renderer.FileName(rm);
        return (pdfBytes, fileName, new ContentType("application", "pdf"));
    }

    private static async Task SendViaSendGrid(MimeMessage message, string host, int port, string user, string pass, CancellationToken ct)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
        await client.AuthenticateAsync(user, pass, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }

    private static async Task SendViaSmtp(MimeMessage message, string smtpUser, string smtpPass, CancellationToken ct)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, ct);
        await client.AuthenticateAsync(smtpUser, smtpPass, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }

    [HttpPost("send")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Send([FromBody] SendRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.RecipientEmail))
            return BadRequest(new { error = "RecipientEmail is required." });

        var sg = GetSendGridConfig();
        var hasSmtp = !string.IsNullOrWhiteSpace(req.SmtpUser) && !string.IsNullOrWhiteSpace(req.SmtpPass);

        if (!sg.ok && !hasSmtp)
            return BadRequest(new { error = "No email credentials available. Configure SendGrid or provide SMTP credentials." });

        byte[] attachmentBytes;
        string fileName;
        ContentType attachmentType;
        try
        {
            (attachmentBytes, fileName, attachmentType) = BuildAttachment(
                req.Rm, req.Tier, req.PreRenderedHtml, req.AttachmentFileName);
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            _logger.LogWarning(ex, "Invalid RM payload for email attachment");
            return BadRequest(new { error = "Invalid RM payload: " + ex.Message });
        }

        var fromEmail = !string.IsNullOrWhiteSpace(req.FromEmail) ? req.FromEmail : sg.fromEmail;
        var fromName = !string.IsNullOrWhiteSpace(req.FromName) ? req.FromName : sg.fromName;

        // Try SendGrid first
        if (sg.ok)
        {
            try
            {
                var message = BuildMessage(fromEmail, fromName, req.RecipientEmail, req.RecipientName,
                    req.Subject, req.Body, fileName, attachmentBytes, attachmentType, req.CcEmails);
                await SendViaSendGrid(message, sg.host, sg.port, sg.user, sg.pass, ct);

                _logger.LogInformation("Email sent via SendGrid to {Recipient} ({EmpCode})", req.RecipientEmail,
                    req.Rm.TryGetProperty("empCode", out var ec) ? ec.GetString() : "?");
                return Ok(new { success = true, via = "sendgrid" });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SendGrid failed for {Recipient}, trying SMTP fallback", req.RecipientEmail);
            }
        }

        // Fallback to user-provided SMTP
        if (hasSmtp)
        {
            try
            {
                var message = BuildMessage(fromEmail, fromName, req.RecipientEmail, req.RecipientName,
                    req.Subject, req.Body, fileName, attachmentBytes, attachmentType, req.CcEmails);
                await SendViaSmtp(message, req.SmtpUser!, req.SmtpPass!, ct);

                _logger.LogInformation("Email sent via SMTP fallback to {Recipient} ({EmpCode})", req.RecipientEmail,
                    req.Rm.TryGetProperty("empCode", out var ec) ? ec.GetString() : "?");
                return Ok(new { success = true, via = "smtp" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMTP fallback also failed for {Recipient}", req.RecipientEmail);
                return StatusCode(502, new { error = "Both SendGrid and SMTP failed: " + ex.Message });
            }
        }

        return StatusCode(502, new { error = "SendGrid failed and no SMTP fallback credentials provided." });
    }

    [HttpPost("test")]
    public async Task<IActionResult> TestConnection([FromBody] SmtpTestRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SmtpUser) || string.IsNullOrWhiteSpace(req.SmtpPass))
            return BadRequest(new { error = "SMTP credentials are required." });

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(req.SmtpUser, req.SmtpPass, ct);
            await client.DisconnectAsync(true, ct);
            return Ok(new { success = true, message = "SMTP connection successful." });
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { error = "SMTP connection failed: " + ex.Message });
        }
    }

    public record SmtpTestRequest(string SmtpUser, string SmtpPass);

    public record TestEmailRequest(
        JsonElement Rm,
        string TestEmail,
        string Subject,
        string Body,
        string? Tier = null,
        string? SmtpUser = null,
        string? SmtpPass = null,
        string? FromEmail = null,
        string? FromName = null,
        string? PreRenderedHtml = null,
        string? AttachmentFileName = null
    );

    [HttpPost("test-send")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> TestSend([FromBody] TestEmailRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.TestEmail))
            return BadRequest(new { error = "TestEmail is required." });

        var sg = GetSendGridConfig();
        var hasSmtp = !string.IsNullOrWhiteSpace(req.SmtpUser) && !string.IsNullOrWhiteSpace(req.SmtpPass);

        if (!sg.ok && !hasSmtp)
            return BadRequest(new { error = "No email credentials available." });

        byte[] attachmentBytes;
        string fileName;
        ContentType attachmentType;
        try
        {
            (attachmentBytes, fileName, attachmentType) = BuildAttachment(
                req.Rm, req.Tier, req.PreRenderedHtml, req.AttachmentFileName);
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            return BadRequest(new { error = "Invalid RM payload: " + ex.Message });
        }

        var fromEmail = !string.IsNullOrWhiteSpace(req.FromEmail) ? req.FromEmail : sg.fromEmail;
        var fromName = !string.IsNullOrWhiteSpace(req.FromName) ? req.FromName : sg.fromName;

        if (sg.ok)
        {
            try
            {
                var message = BuildMessage(fromEmail, fromName, req.TestEmail, "Test Recipient",
                    "[TEST] " + req.Subject, "[TEST EMAIL]\n\n" + req.Body, fileName, attachmentBytes, attachmentType);
                await SendViaSendGrid(message, sg.host, sg.port, sg.user, sg.pass, ct);

                _logger.LogInformation("Test email sent via SendGrid to {TestEmail}", req.TestEmail);
                return Ok(new { success = true, via = "sendgrid" });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SendGrid test-send failed, trying SMTP fallback");
            }
        }

        if (hasSmtp)
        {
            try
            {
                var message = BuildMessage(fromEmail, fromName, req.TestEmail, "Test Recipient",
                    "[TEST] " + req.Subject, "[TEST EMAIL]\n\n" + req.Body, fileName, attachmentBytes, attachmentType);
                await SendViaSmtp(message, req.SmtpUser!, req.SmtpPass!, ct);

                _logger.LogInformation("Test email sent via SMTP to {TestEmail}", req.TestEmail);
                return Ok(new { success = true, via = "smtp" });
            }
            catch (Exception ex)
            {
                return StatusCode(502, new { error = "Test send failed: " + ex.Message });
            }
        }

        return StatusCode(502, new { error = "SendGrid failed and no SMTP fallback provided." });
    }
}
