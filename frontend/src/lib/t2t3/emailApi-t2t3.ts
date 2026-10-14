import type { Rm } from './engine-t2t3.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://square-incentive.onrender.com';

export { parseCcCsv, type CcEntry } from '../t0t1/emailApi-t0t1.js';

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
        Tier: 't2t3',
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
