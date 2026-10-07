import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fmtINR } from '../lib/engine.js';
import type { Rm } from '../lib/engine.js';
import {
  buildEmailBody,
  buildEmailSubject,
  parseCcCsv,
  sendEmail,
  testSmtp,
} from '../lib/emailApi.js';
import { useApp } from '../context/AppContext.js';
import { Layout } from '../components/Layout.js';
import { BackLink } from '../components/BackLink.js';

const DAILY_LIMIT = 10000;
const SEND_DELAY_MS = 1500;

type SendStatus = 'idle' | 'sending' | 'paused' | 'done';

function storageKey(ddShort: string) {
  return `incentive_sent_${ddShort}`;
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

export default function SendPage() {
  const { rms, toast } = useApp();

  const ddShort = rms[0]?.calc?.ddShort || '';

  const [ccMap, setCcMap] = useState<Map<string, string[]>>(new Map());
  const [ccLoaded, setCcLoaded] = useState(false);
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

  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [search, setSearch] = useState('');

  const sendableRms = useMemo(
    () => rms.filter((rm) => rm.email),
    [rms]
  );

  const pendingRms = useMemo(() => sendableRms.filter((rm) => !sentSet.has(rm.empCode)), [sendableRms, sentSet]);
  const sentRms = useMemo(() => sendableRms.filter((rm) => sentSet.has(rm.empCode)), [sendableRms, sentSet]);
  const failedRms = useMemo(() => sendableRms.filter((rm) => failedMap.has(rm.empCode)), [sendableRms, failedMap]);

  const displayRms = useMemo(() => {
    let list = sendableRms;
    if (filter === 'pending') list = pendingRms;
    else if (filter === 'sent') list = sentRms;
    else if (filter === 'failed') list = failedRms;

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
  }, [sendableRms, pendingRms, sentRms, failedRms, filter, search]);

  useEffect(() => {
    if (ddShort) persistSentSet(ddShort, sentSet);
  }, [sentSet, ddShort]);

  const handleCcUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const entries = parseCcCsv(reader.result as string);
      const map = new Map<string, string[]>();
      entries.forEach((en) => map.set(en.empCode, en.ccEmails));
      setCcMap(map);
      setCcLoaded(true);
      toast(`Loaded CC emails for ${entries.length} employees`, 'success');
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [toast]);

  async function handleTestSmtp() {
    if (!smtpPass) { toast('Enter the SMTP password first', 'err'); return; }
    setSmtpTesting(true);
    const res = await testSmtp(smtpUser, smtpPass);
    setSmtpOk(res.success);
    toast(res.success ? 'SMTP connection verified' : `SMTP failed: ${res.error}`, res.success ? 'success' : 'err');
    setSmtpTesting(false);
  }

  async function handleSendOne(rm: Rm) {
    if (!smtpPass) { toast('Enter the SMTP password first', 'err'); return; }
    setSendingOne(rm.empCode);
    const cc = ccMap.get(rm.empCode) || [];
    const result = await sendEmail(rm, cc, smtpUser, smtpPass);
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
    if (!smtpPass) { toast('Enter the SMTP password first', 'err'); return; }

    abortRef.current = false;
    setStatus('sending');
    setFailedMap(new Map());

    const toSend = pendingRms;
    setSendTotal(toSend.length);
    let count = 0;

    for (let i = 0; i < toSend.length; i++) {
      if (abortRef.current) { setStatus('paused'); return; }
      if (sentSet.size + count >= DAILY_LIMIT) {
        toast(`Reached ${DAILY_LIMIT} daily limit. Resume tomorrow.`, 'err');
        setStatus('paused');
        return;
      }

      const rm = toSend[i];
      setCurrentIdx(i);
      setSendCount(count);
      setSendingCurrent({ name: rm.name, empCode: rm.empCode });

      const cc = ccMap.get(rm.empCode) || [];
      const result = await sendEmail(rm, cc, smtpUser, smtpPass);

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

  if (rms.length === 0) return <Navigate to="/" replace />;

  const noEmail = rms.filter((rm) => !rm.email);

  return (
    <Layout>
      <section className="view active">
        <div className="export send-page">
          <BackLink to="/export">Back to export</BackLink>
          <h1>Send incentive emails</h1>
          <p className="lede">
            Email each RM their PDF incentive statement via <strong>{smtpUser}</strong>.
            Google Workspace limit: {DAILY_LIMIT}/day.
          </p>

          {/* SMTP Credentials */}
          <div className="send-section">
            <h3>1. SMTP Credentials</h3>
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

          {/* CC CSV Upload */}
          <div className="send-section">
            <h3>2. CC list (optional)</h3>
            <p className="hint">Upload the Incentive CC emails CSV to auto-add CC recipients per RM.</p>
            <div className="cc-row">
              <label className="btn secondary upload-label">
                {ccLoaded ? `CC loaded (${ccMap.size} RMs)` : 'Upload CC CSV'}
                <input type="file" accept=".csv" onChange={handleCcUpload} hidden />
              </label>
              {ccLoaded && <span className="smtp-badge ok">{ccMap.size} employees with CC</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="send-section">
            <h3>3. Send list</h3>
            <div className="diag">
              <div className="diag-row">
                <span className="k">Total RMs (with email)</span>
                <span className="v">{sendableRms.length}</span>
              </div>
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
              {noEmail.length > 0 && (
                <div className="diag-row">
                  <span className="k">Missing email (skipped)</span>
                  <span className="v">{noEmail.length}</span>
                </div>
              )}
              <div className="diag-row">
                <span className="k">Daily limit remaining</span>
                <span className="v">{Math.max(0, DAILY_LIMIT - sentSet.size)}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="send-controls">
            {status === 'idle' || status === 'paused' || status === 'done' ? (
              <>
                <button
                  className="btn primary"
                  onClick={handleSend}
                  disabled={!smtpPass || pendingRms.length === 0}
                >
                  {status === 'done'
                    ? 'Send again (retry remaining)'
                    : `Send to ${pendingRms.length} RMs`}
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

          {/* Filter + Table */}
          <div className="send-section">
            <div className="send-filters">
              {(['all', 'pending', 'sent', 'failed'] as const).map((f) => (
                <button
                  key={f}
                  className={'btn ' + (filter === f ? 'primary' : 'ghost') + ' sm'}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' && `All (${sendableRms.length})`}
                  {f === 'pending' && `Pending (${pendingRms.length})`}
                  {f === 'sent' && `Sent (${sentRms.length})`}
                  {f === 'failed' && `Failed (${failedRms.length})`}
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
                    const cc = ccMap.get(rm.empCode) || [];
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
                            disabled={isSent || isSendingThis || status === 'sending' || !smtpPass}
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
                  No RMs match this filter.
                </p>
              )}
            </div>
          </div>

          {/* Preview Modal */}
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
                  <span>{(ccMap.get(previewRm.empCode) || []).join(', ') || '(none)'}</span>
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
    </Layout>
  );
}
