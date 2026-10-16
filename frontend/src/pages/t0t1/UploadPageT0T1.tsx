import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, type LoadStage } from '../../context/AppContextT0T1';
import { Layout } from '../../components/LayoutT0T1';
import { fetchFromBeats } from '../../lib/api';

export default function UploadPage() {
  const { loadFile, loadFromRows } = useApp();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<LoadStage | null>(null);
  const [fileName, setFileName] = useState('');
  const [waited, setWaited] = useState(0);
  const busy = stage !== null;
  const processing = stage?.kind === 'processing';

  const [apiFetching, setApiFetching] = useState(false);
  const [apiElapsed, setApiElapsed] = useState(0);
  const [apiError, setApiError] = useState('');
  const [apiCalcStage, setApiCalcStage] = useState<LoadStage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!apiFetching) { setApiElapsed(0); return; }
    const id = setInterval(() => setApiElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [apiFetching]);

  useEffect(() => {
    if (!processing) {
      setWaited(0);
      return;
    }
    const id = setInterval(() => setWaited((w) => w + 1), 1000);
    return () => clearInterval(id);
  }, [processing]);

  async function handle(file: File) {
    if (busy) return;
    setFileName(file.name);
    const ok = await loadFile(file, setStage);
    setStage(null);
    if (ok) navigate('/t0/validate');
  }

  function statusLabel(): string {
    if (!stage) return '';
    if (stage.kind === 'uploading') return `Uploading ${fileName}… ${stage.percent ?? 0}%`;
    if (stage.kind === 'processing') return 'Reading the workbook on the server…';
    return stage.detail ?? 'Calculating…';
  }

  function handleFileInput() {
    const file = fileInputRef.current?.files?.[0];
    if (file) handle(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handle(file);
  }

  async function handleApiFetch() {
    if (apiFetching || busy) return;
    setApiFetching(true);
    setApiError('');
    setApiCalcStage(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetchFromBeats('RM', ctrl.signal);
      if (!res.success || !res.rmRows || !res.dlRows) {
        setApiError(res.error || 'No data returned from the API.');
        setApiFetching(false);
        return;
      }
      setApiFetching(false);
      const ok = await loadFromRows(res.rmRows, res.dlRows, 'Beats API', setApiCalcStage);
      setApiCalcStage(null);
      if (ok) navigate('/t0/validate');
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setApiFetching(false);
        return;
      }
      setApiError(e instanceof Error ? e.message : String(e));
      setApiFetching(false);
    }
  }

  function handleApiCancel() {
    abortRef.current?.abort();
    setApiFetching(false);
  }

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const anyBusy = busy || apiFetching || apiCalcStage !== null;

  return (
    <Layout>
     <section className="view active">
       <div className="landing-wide">
         <div className="hero">
           <div className="hero-copy">
             <span className="eyebrow">Dollar Day incentives</span>
             <h1>Personal, traceable incentive PDFs for every representative.</h1>
             <p className="lede">
               Upload the Excel of RM data and get a personalized PDF for each rep, showing the incentive amount{' '}
               <strong>and every calculation step behind it</strong>.
             </p>
             <ol className="steps">
               <li>
                 <span className="step-num">1</span>
                 <div>
                   <strong>Upload</strong>
                   <span>Drop in the two-sheet workbook</span>
                 </div>
               </li>
               <li>
                 <span className="step-num">2</span>
                 <div>
                   <strong>Review</strong>
                   <span>Check validation and preview each PDF</span>
                 </div>
               </li>
               <li>
                 <span className="step-num">3</span>
                 <div>
                   <strong>Export</strong>
                   <span>Download all PDFs as one ZIP</span>
                 </div>
               </li>
             </ol>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="api-card">
              <h2>Auto Populate via API</h2>
              <p className="api-subtitle">Pull the latest incentive data directly from Beats</p>
              {!apiFetching && !apiCalcStage ? (
                <button className="api-btn" onClick={handleApiFetch} disabled={anyBusy}>
                  Fetch from Beats API
                </button>
              ) : null}
              {apiFetching && (
                <div className="api-progress" role="status" aria-live="polite">
                  <div className="progress indeterminate">
                    <div className="progress-bar" />
                  </div>
                  <div className="api-elapsed">{formatElapsed(apiElapsed)}</div>
                  <div className="api-progress-text">Fetching data from Beats API…</div>
                  <div className="api-progress-hint">
                    {apiElapsed < 30
                      ? 'This usually takes 2–5 minutes. Please wait.'
                      : apiElapsed < 120
                        ? 'Still waiting for the server to prepare your data…'
                        : 'Taking longer than usual. Hang tight — large datasets need more time.'}
                  </div>
                  <button className="api-cancel-btn" onClick={handleApiCancel}>Cancel</button>
                </div>
              )}
              {apiCalcStage && (
                <div className="api-progress" role="status" aria-live="polite">
                  <div className={'progress' + (apiCalcStage.percent === undefined ? ' indeterminate' : '')}>
                    <div className="progress-bar" style={apiCalcStage.percent === undefined ? undefined : { width: apiCalcStage.percent + '%' }} />
                  </div>
                  <div className="api-progress-text">{apiCalcStage.detail ?? 'Calculating…'}</div>
                </div>
              )}
              {apiError && <div className="api-error">{apiError}</div>}
            </div>

            <div className="api-divider"><span>or upload manually</span></div>

            <div
              className={'upload-card' + (dragOver ? ' dragover' : '')}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                </svg>
              </div>
              <h2>Upload your workbook</h2>
              <p>Drag and drop the file here, or pick it from your computer.</p>
              <button className="btn primary upload-btn" onClick={() => fileInputRef.current?.click()} disabled={anyBusy}>
                Select Excel file
              </button>
              {stage && (
                <div className="upload-status" role="status" aria-live="polite">
                  <div className={'progress' + (stage.percent === undefined ? ' indeterminate' : '')}>
                    <div className="progress-bar" style={stage.percent === undefined ? undefined : { width: stage.percent + '%' }} />
                  </div>
                  <div className="upload-status-text">{statusLabel()}</div>
                  {processing && waited >= 6 && (
                    <div className="upload-status-hint">
                      Still working. The first request after a quiet period can take up to a minute while the server wakes up.
                    </div>
                  )}
                </div>
              )}
              <div className="upload-meta">
                <span className="chip">.xlsx</span>
                <span className="chip">.xls</span>
                <span className="chip">Sheets: RMs, Deals</span>
              </div>
            </div>
          </div>
           <input
             ref={fileInputRef}
             type="file"
             className="hidden-file-input"
             accept=".xlsx,.xls"
             tabIndex={-1}
             onChange={handleFileInput}
           />
         </div>

         <div className="req-head">
           <h3>What the Excel needs</h3>
           <p>Column names are matched case-insensitively. The file is validated right after upload.</p>
         </div>
         <div className="req-grid">
           <div className="req-card">
             <div className="req-card-h">
               <span className="sheet-pill">Sheet 1</span>
               <h4>RMs</h4>
               <span className="req-sub">One row per RM</span>
             </div>
             <dl className="req-list">
               <div>
                 <dt>Identity</dt>
                 <dd>
                   <code>Employee Code</code>
                   <code>Full Name</code>
                   <code>Tier</code>
                   <code>Vertical</code>
                 </dd>
                 <p className="req-note">Tier is T0 or T1.</p>
               </div>
               <div>
                 <dt>Salary</dt>
                 <dd>
                   <code>Salary Apr</code>
                   <code>Salary May</code>
                   <code>...</code>
                   <code>Salary Mar</code>
                 </dd>
                 <p className="req-note">12 monthly columns. Only fill the months in the current YTD block.</p>
               </div>
               <div>
                 <dt>Period</dt>
                 <dd>
                   <code>Dollar Day Date</code>
                 </dd>
                 <p className="req-note">The period runs from April to the month before the Dollar Day.</p>
               </div>
               <div>
                 <dt>Payments</dt>
                 <dd>
                   <code>Total Already Paid</code>
                   <code>Prior Period Final Payable</code>
                   <code>Has CRM Approved Deal</code>
                 </dd>
                 <p className="req-note">CRM flag is Yes or No.</p>
               </div>
             </dl>
           </div>

           <div className="req-card">
             <div className="req-card-h">
               <span className="sheet-pill">Sheet 2</span>
               <h4>Deals</h4>
               <span className="req-sub">One row per deal, joined by Employee Code</span>
             </div>
             <dl className="req-list">
               <div>
                 <dt>Deal</dt>
                 <dd>
                   <code>Employee Code</code>
                   <code>TCF ID</code>
                   <code>Project Name</code>
                   <code>Revenue</code>
                   <code>Deal Month</code>
                 </dd>
                 <p className="req-note">Project Name is optional.</p>
               </div>
               <div>
                 <dt>Classification</dt>
                 <dd>
                   <code>Stage</code>
                   <code>Type</code>
                 </dd>
                 <p className="req-note">Stage: Counted, Confirmed or Collected. Type: Focus or Non-Focus.</p>
               </div>
               <div>
                 <dt>Collection</dt>
                 <dd>
                   <code>Collection %</code>
                 </dd>
                 <p className="req-note">0 or blank for Counted, 0 to 99 for Confirmed, 100 for Collected.</p>
               </div>
               <div>
                 <dt>Split</dt>
                 <dd>
                   <code>Self/Team</code>
                   <code>Share Percentage</code>
                 </dd>
                 <p className="req-note">Self/Team defaults to Self, and Team deals earn no incentive. Share defaults to 100.</p>
               </div>
             </dl>
           </div>
         </div>
       </div>
     </section>
    </Layout>
  );
}
