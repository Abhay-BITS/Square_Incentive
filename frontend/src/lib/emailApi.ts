import type { Rm } from './engine.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

export interface CcEntry {
  empCode: string;
  empName: string;
  ccEmails: string[];
}

export function parseCcCsv(text: string): CcEntry[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim());
  const codeIdx = header.findIndex((h) => /employee\s*code/i.test(h));
  const nameIdx = header.findIndex((h) => /employee\s*name/i.test(h));
  const ccIdx = header.findIndex((h) => /email.*cc/i.test(h));

  if (codeIdx < 0 || ccIdx < 0) return [];

  const entries: CcEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const code = cols[codeIdx]?.trim();
    if (!code) continue;
    const name = nameIdx >= 0 ? cols[nameIdx]?.trim() || '' : '';
    const raw = cols[ccIdx]?.trim() || '';
    const ccEmails = raw
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'));
    entries.push({ empCode: code, empName: name, ccEmails });
  }
  return entries;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function buildEmailSubject(rm: Rm): string {
  return `September Dollar Day - Incentive Calculation - ${rm.empCode}`;
}

export function buildEmailBody(rm: Rm): string {
  return (
    `Hi ${rm.name},\n\n` +
    `Please find attached the detailed incentive calculation for the September Dollar Day.\n\n` +
    `Regards,\nIncentive Team\nSquare Yards`
  );
}

export interface SendResult {
  empCode: string;
  success: boolean;
  error?: string;
}

export async function sendEmail(
  rm: Rm,
  ccEmails: string[],
  smtpUser: string,
  smtpPass: string
): Promise<SendResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Rm: rm,
        RecipientEmail: rm.email,
        RecipientName: rm.name,
        Subject: buildEmailSubject(rm),
        Body: buildEmailBody(rm),
        CcEmails: ccEmails,
        SmtpUser: smtpUser,
        SmtpPass: smtpPass,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { empCode: rm.empCode, success: false, error: data.error || `HTTP ${res.status}` };
    }
    return { empCode: rm.empCode, success: true };
  } catch (e) {
    return { empCode: rm.empCode, success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function testSmtp(smtpUser: string, smtpPass: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/email/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ SmtpUser: smtpUser, SmtpPass: smtpPass }),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    return { success: !!data.success, error: data.error };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
