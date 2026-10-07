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
        string SmtpUser,
        string SmtpPass
    );

    [HttpPost("send")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Send([FromBody] SendRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.RecipientEmail))
            return BadRequest(new { error = "RecipientEmail is required." });
        if (string.IsNullOrWhiteSpace(req.SmtpUser) || string.IsNullOrWhiteSpace(req.SmtpPass))
            return BadRequest(new { error = "SMTP credentials are required." });

        byte[] pdfBytes;
        string fileName;
        try
        {
            pdfBytes = Renderer.Render(req.Rm);
            fileName = Renderer.FileName(req.Rm);
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException or JsonException)
        {
            _logger.LogWarning(ex, "Invalid RM payload for email PDF");
            return BadRequest(new { error = "Invalid RM payload: " + ex.Message });
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Incentive Team", req.SmtpUser));
        message.To.Add(new MailboxAddress(req.RecipientName, req.RecipientEmail));

        if (req.CcEmails is { Length: > 0 })
        {
            foreach (var cc in req.CcEmails)
            {
                var trimmed = cc.Trim();
                if (!string.IsNullOrEmpty(trimmed))
                    message.Cc.Add(MailboxAddress.Parse(trimmed));
            }
        }

        message.Subject = req.Subject;

        var bodyBuilder = new BodyBuilder { TextBody = req.Body };
        bodyBuilder.Attachments.Add(fileName, pdfBytes, new ContentType("application", "pdf"));
        message.Body = bodyBuilder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;
            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(req.SmtpUser, req.SmtpPass, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Email sent to {Recipient} ({EmpCode})", req.RecipientEmail,
                req.Rm.TryGetProperty("empCode", out var ec) ? ec.GetString() : "?");
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient}", req.RecipientEmail);
            return StatusCode(502, new { error = "SMTP error: " + ex.Message });
        }
    }

    [HttpPost("test")]
    public async Task<IActionResult> TestConnection([FromBody] SmtpTestRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.SmtpUser) || string.IsNullOrWhiteSpace(req.SmtpPass))
            return BadRequest(new { error = "SMTP credentials are required." });

        try
        {
            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;
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
}
