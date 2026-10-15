import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fmtINR } from '../../lib/t2t3/engine-t2t3.js';
import type { Rm } from '../../lib/t2t3/engine-t2t3.js';
import {
  buildEmailBody,
  buildEmailSubject,
  sendEmail,
  sendTestEmail,
  testSmtp,
} from '../../lib/t2t3/emailApi-t2t3.js';
import { useAppT2T3 } from '../../context/AppContextT2T3.js';
import { LayoutT2T3 } from '../../components/LayoutT2T3.js';
import { BackLink } from '../../components/BackLink.js';

const SEND_DELAY_MS = 1500;

type SendStatus = 'idle' | 'sending' | 'paused' | 'done';

function storageKey(ddShort: string) {
  return `incentive_t2t3_sent_${ddShort}`;
}

function loadSentSet(ddShort: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(ddShort));
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* empty */ }
  return new Set();
}

function persistSentSet(ddShort: string, sent: Set<string>) {
  try {
    localStorage.setItem(storageKey(ddShort), JSON.stringify([...sent]));
  } catch { /* quota */ }
}

export default function SendPageT2T3() {
  const { rms, toast } = useAppT2T3();

  const ddShort = rms[0]?.calc?.ddShort || '';

  const [fromEmail, setFromEmail] = useState('incentive@Squareyards.com');
  const [fromName, setFromName] = useState('Incentive Team');

  const [smtpUser, setSmtpUser] = useState('incentive@squareyards.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpOk, setSmtpOk] = useState<boolean | null>(null);
  const [smtpTesting, setSmtpTesting] = useState(false);

  const [sentSet, setSentSet] = useState<Set<string>>(() => loadSentSet(ddShort));
  const [failedMap, setFailedMap] = useState<Map<string, string>>(new Map());
  const [status, setStatus] = useState<SendStatus>('idle');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sendCount, setSendCount] = useState(0);
  const [sendTotal, setSendTotal] = useState(0);
  const [sendingCurrent, setSendingCurrent] = useState<{ name: string; empCode: string } | null>(null);
  const [sendingOne, setSendingOne] = useState<string | null>(null);
  const abortRef = useRef(false);

  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed' | 'new_no_deals'>('all');
  const [search, setSearch] = useState('');

  function isNewNoDeal(rm: Rm): boolean {
    if (!rm.doj || !rm.ddDate || rm.deals.length > 0) return false;
    const doj = new Date(rm.doj);
    const dd = new Date(rm.ddDate);
    if (isNaN(doj.getTime()) || isNaN(dd.getTime())) return false;
    const ddM = dd.getFullYear() * 12 + dd.getMonth();
    const dojM = doj.getFullYear() * 12 + doj.getMonth();
    return dojM === ddM || dojM === ddM - 1;
  }

  const newNoDealRms = useMemo(() => rms.filter((rm) => rm.email && isNewNoDeal(rm)), [rms]);

  const sendableRms = useMemo(
    () => rms.filter((rm) => rm.email && !isNewNoDeal(rm)),
    [rms]
  );

  const pendingRms = useMemo(() => sendableRms.filter((rm) => !sentSet.has(rm.empCode)), [sendableRms, sentSet]);
  const sentRms = useMemo(() => sendableRms.filter((rm) => sentSet.has(rm.empCode)), [sendableRms, sentSet]);
  const failedRms = useMemo(() => sendableRms.filter((rm) => failedMap.has(rm.empCode)), [sendableRms, failedMap]);

  const displayRms = useMemo(() => {
    let list: Rm[] = sendableRms;
    if (filter === 'pending') list = pendingRms;
    else if (filter === 'sent') list = sentRms;
    else if (filter === 'failed') list = failedRms;
    else if (filter === 'new_no_deals') list = newNoDealRms;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (rm) =>
          rm.empCode.toLowerCase().includes(q) ||
          rm.name.toLowerCase().includes(q) ||
          rm.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sendableRms, pendingRms, sentRms, failedRms, newNoDealRms, filter, search]);

  useEffect(() => {
    if (ddShort) persistSentSet(ddShort, sentSet);
  }, [sentSet, ddShort]);

  function getCc(rm: Rm): string[] {
    const cc: string[] = [];
    if (rm.t2Email && rm.t2Email.includes('@')) cc.push(rm.t2Email);
    if (rm.t3Email && rm.t3Email.includes('@')) cc.push(rm.t3Email);
    if (rm.pnlEmail && rm.pnlEmail.includes('@')) cc.push(rm.pnlEmail);
    return cc;
  }

  async function handleTestSmtp() {
    if (!smtpPass) { toast('Enter the SMTP password first', 'err'); return; }
    setSmtpTesting(true);
    const res = await testSmtp(smtpUser, smtpPass);
    setSmtpOk(res.success);
    toast(res.success ? 'SMTP connection verified' : `SMTP failed: ${res.error}`, res.success ? 'success' : 'err');
    setSmtpTesting(false);
  }

  async function handleSendOne(rm: Rm) {
    setSendingOne(rm.empCode);
    const cc = getCc(rm);
    const result = await sendEmail(rm, cc, smtpPass ? smtpUser : undefined, smtpPass || undefined, fromEmail, fromName);
    if (result.success) {
      setSentSet((prev) => { const next = new Set(prev); next.add(rm.empCode); return next; });
      toast(`Sent to ${rm.name}`, 'success');
    } else {
      setFailedMap((prev) => new Map(prev).set(rm.empCode, result.error || 'Unknown error'));
      toast(`Failed: ${result.error}`, 'err');
    }
    setSendingOne(null);
  }

  async function handleSend() {
    abortRef.current = false;
    setStatus('sending');
    setFailedMap(new Map());

    const toSend = pendingRms;
    setSendTotal(toSend.length);
    let count = 0;

    for (let i = 0; i < toSend.length; i++) {
      if (abortRef.current) { setStatus('paused'); return; }

      const rm = toSend[i];
      setCurrentIdx(i);
      setSendCount(count);
      setSendingCurrent({ name: rm.name, empCode: rm.empCode });

      const cc = getCc(rm);
      const result = await sendEmail(rm, cc, smtpPass ? smtpUser : undefined, smtpPass || undefined, fromEmail, fromName);

      if (result.success) {
        setSentSet((prev) => {
          const next = new Set(prev);
          next.add(rm.empCode);
          return next;
        });
        count++;
      } else {
        setFailedMap((prev) => new Map(prev).set(rm.empCode, result.error || 'Unknown error'));
      }

      if (i < toSend.length - 1 && !abortRef.current) {
        await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
      }
    }

    setSendCount(count);
    setStatus('done');
    toast(`Finished! ${count} emails sent, ${failedMap.size} failed.`, 'success');
  }

  function handlePause() {
    abortRef.current = true;
  }

  function handleClearSent() {
    if (!confirm('Clear the sent tracking for this cycle? This does NOT unsend any emails.')) return;
    setSentSet(new Set());
    setFailedMap(new Map());
    setStatus('idle');
  }

  const [previewRm, setPreviewRm] = useState<Rm | null>(null);

  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; via?: string; error?: string } | null>(null);

  async function handleTestEmail() {
    if (!testEmail || !testEmail.includes('@')) { toast('Enter a valid email address', 'err'); return; }
    if (sendableRms.length === 0) { toast('No employees to preview', 'err'); return; }
    setTestSending(true);
    setTestResult(null);
    const rm = sendableRms[0];
    const res = await sendTestEmail(rm, testEmail, smtpPass ? smtpUser : undefined, smtpPass || undefined, fromEmail, fromName);
    setTestResult(res);
    toast(res.success ? `Test email sent via ${res.via}` : `Test failed: ${res.error}`, res.success ? 'success' : 'err');
    setTestSending(false);
  }

  if (rms.length === 0) return <Navigate to="/t2" replace />;

  const noEmail = rms.filter((rm) => !rm.email);

  return (
    <LayoutT2T3>
      <section className="view active">
        <div className="export send-page">
          <BackLink to="/t2/export">Back to export</BackLink>
          <h1>Send incentive emails</h1>
          <p className="lede">
            Email each employee their PDF incentive statement. Primary sender: <strong>SendGrid</strong>.
          </p>

          {/* Sender Identity */}
          <div className="send-section">
            <h3>1. Sender</h3>
            <div className="smtp-row">
              <label>
                From Email
                <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="input" />
              </label>
              <label>
                From Name
                <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} className="input" />
              </label>
            </div>
          </div>

          {/* Test Email */}
          <div className="send-section">
            <h3>2. Test Email</h3>
            <p className="hint" style={{ marginBottom: 8 }}>Send a test email with the first employee's PDF to verify delivery.</p>
            <div className="smtp-row">
              <label>
                Send test to
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => { setTestEmail(e.target.value); setTestResult(null); }}
                  placeholder="your.email@example.com"
                  className="input"
                />
              </label>
              <button
                className="btn secondary"
                onClick={handleTestEmail}
                disabled={testSending || !testEmail || sendableRms.length === 0}
              >
                {testSending ? <><span className="spinner"></span> Sending…</> : 'Send test'}
              </button>
              {testResult?.success && <span className="smtp-badge ok">Sent via {testResult.via}</span>}
              {testResult && !testResult.success && <span className="smtp-badge fail">Failed</span>}
            </div>
          </div>

          <div className="send-section">
            <h3>3. Backup SMTP (optional)</h3>
            <p className="hint" style={{ marginBottom: 8 }}>SendGrid is the primary sender. SMTP is used as a fallback only if SendGrid fails.</p>
            <div className="smtp-row">
              <label>
                Email
                <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="input" />
              </label>
              <label>
                App Password
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => { setSmtpPass(e.target.value); setSmtpOk(null); }}
                  placeholder="Google App Password"
                  className="input"
                />
              </label>
              <button className="btn secondary" onClick={handleTestSmtp} disabled={smtpTesting || !smtpPass}>
                {smtpTesting ? <><span className="spinner"></span> Testing…</> : 'Test connection'}
              </button>
              {smtpOk === true && <span className="smtp-badge ok">Connected</span>}
              {smtpOk === false && <span className="smtp-badge fail">Failed</span>}
            </div>
          </div>

          <div className="send-section">
            <h3>4. Send list</h3>
            <div className="diag">
              <div className="diag-row">
                <span className="k">Total employees in input file</span>
                <span className="v">{rms.length}</span>
              </div>
              <div className="diag-row">
                <span className="k">Total eligible for email</span>
                <span className="v">{sendableRms.length}</span>
              </div>
              {newNoDealRms.length > 0 && (
                <div className="diag-row">
                  <span className="k">M & M-1 employees (No Deal)</span>
                  <span className="v">{newNoDealRms.length}</span>
                </div>
              )}
              {noEmail.length > 0 && (
                <div className="diag-row">
                  <span className="k">Missing email (skipped)</span>
                  <span className="v">{noEmail.length}</span>
                </div>
              )}
              <div className="diag-row">
                <span className="k">Already sent (this cycle)</span>
                <span className="v sent-count">{sentSet.size}</span>
              </div>
              <div className="diag-row">
                <span className="k">Remaining</span>
                <span className="v pending-count">{pendingRms.length}</span>
              </div>
              {failedMap.size > 0 && (
                <div className="diag-row">
                  <span className="k">Failed</span>
                  <span className="v failed-count">{failedMap.size}</span>
                </div>
              )}
            </div>
          </div>

          <div className="send-controls">
            {status === 'idle' || status === 'paused' || status === 'done' ? (
              <>
                <button
                  className="btn primary"
                  onClick={handleSend}
                  disabled={pendingRms.length === 0}
                >
                  {status === 'done'
                    ? 'Send again (retry remaining)'
                    : `Send to ${pendingRms.length} employees`}
                </button>
                {sentSet.size > 0 && (
                  <button className="btn ghost" onClick={handleClearSent}>
                    Clear sent tracking
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="btn secondary" onClick={handlePause}>
                  <span className="spinner"></span> Pause
                </button>
                <span className="send-progress-text">
                  Sending {currentIdx + 1} of {sendTotal}… ({sendCount} sent)
                </span>
              </>
            )}
          </div>

          {status === 'sending' && (
            <div className="zip-progress" role="status" aria-live="polite">
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${sendTotal > 0 ? Math.min(100, Math.round(((currentIdx + 1) / sendTotal) * 100)) : 0}%` }}
                />
              </div>
              <div className="zip-progress-row">
                <span className="zip-progress-text">
                  Sending to {sendingCurrent?.name} ({sendingCurrent?.empCode})
                </span>
                <span className="zip-progress-percent">
                  {sendTotal > 0 ? Math.min(100, Math.round(((currentIdx + 1) / sendTotal) * 100)) : 0}%
                </span>
              </div>
            </div>
          )}

          <div className="send-section">
            <div className="send-filters">
              {(['all', 'pending', 'sent', 'failed', 'new_no_deals'] as const).map((f) => (
                <button
                  key={f}
                  className={'btn ' + (filter === f ? 'primary' : 'ghost') + ' sm'}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' && `All (${sendableRms.length})`}
                  {f === 'pending' && `Pending (${pendingRms.length})`}
                  {f === 'sent' && `Sent (${sentRms.length})`}
                  {f === 'failed' && `Failed (${failedRms.length})`}
                  {f === 'new_no_deals' && `M & M-1 No Deals (${newNoDealRms.length})`}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search name, code, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input search-input"
              />
            </div>

            <div className="send-table-wrap">
              <table className="send-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Incentive</th>
                    <th>CC</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {displayRms.slice(0, 200).map((rm) => {
                    const isSent = sentSet.has(rm.empCode);
                    const err = failedMap.get(rm.empCode);
                    const cc = getCc(rm);
                    const cashDue = rm.calc.dueForRelease;
                    const total = cashDue + cashDue * 0.25;
                    const isSendingThis = sendingOne === rm.empCode;
                    return (
                      <tr key={rm.empCode} className={isSent ? 'row-sent' : err ? 'row-failed' : ''}>
                        <td className="mono nowrap">{rm.empCode}</td>
                        <td className="nowrap">{rm.name}</td>
                        <td className="email-cell nowrap">{rm.email}</td>
                        <td className="mono nowrap">{fmtINR(total)}</td>
                        <td className="nowrap">{cc.length > 0 ? `${cc.length} CC` : '—'}</td>
                        <td>
                          {isSent && <span className="badge-sent">Sent</span>}
                          {err && <span className="badge-failed" title={err}>Failed</span>}
                          {!isSent && !err && <span className="badge-pending">Pending</span>}
                        </td>
                        <td className="actions-cell">
                          <button className="btn ghost sm" onClick={() => setPreviewRm(rm)}>Preview</button>
                          <button
                            className="btn primary sm"
                            onClick={() => handleSendOne(rm)}
                            disabled={isSent || isSendingThis || status === 'sending'}
                          >
                            {isSendingThis ? <><span className="spinner"></span></> : isSent ? 'Sent' : 'Send'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {displayRms.length > 200 && (
                <p className="hint" style={{ textAlign: 'center', marginTop: 8 }}>
                  Showing first 200 of {displayRms.length}. Use search to filter.
                </p>
              )}
              {displayRms.length === 0 && (
                <p className="hint" style={{ textAlign: 'center', padding: 24 }}>
                  No employees match this filter.
                </p>
              )}
            </div>
          </div>

          {previewRm && (
            <div className="modal-overlay" onClick={() => setPreviewRm(null)}>
              <div className="modal-body" onClick={(e) => e.stopPropagation()}>
                <h3>Email Preview {previewRm.empCode}</h3>
                <div className="preview-field">
                  <span className="preview-label">To:</span>
                  <span>{previewRm.email}</span>
                </div>
                <div className="preview-field">
                  <span className="preview-label">CC:</span>
                  <span>{getCc(previewRm).join(', ') || '(none)'}</span>
                </div>
                <div className="preview-field">
                  <span className="preview-label">Subject:</span>
                  <span>{buildEmailSubject(previewRm)}</span>
                </div>
                <pre className="preview-body">{buildEmailBody(previewRm)}</pre>
                <div className="preview-field">
                  <span className="preview-label">Attachment:</span>
                  <span>{previewRm.empCode}_{previewRm.calc.ddShort}DD.pdf</span>
                </div>
                <button className="btn ghost" onClick={() => setPreviewRm(null)} style={{ marginTop: 16 }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </LayoutT2T3>
  );
}
