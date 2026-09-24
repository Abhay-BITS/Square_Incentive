import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { fmtINR, generateEmailHtml, generatePlainText } from '../lib/engine.js';
import type { Rm } from '../lib/engine.js';
import { downloadSinglePdf } from '../lib/pdfExport';
import { downloadServerPdf } from '../lib/serverPdf';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

type Filter = 'all' | 'positive' | 'provonly' | 'zero' | 'held' | 'negative';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  positive: 'Positive',
  provonly: 'Prov only',
  zero: 'Zero',
  held: 'Held',
  negative: 'Negative',
};

const SCENARIO_MAP: Record<string, { label: string; cls: string }> = {
  positive: { label: 'Positive', cls: 'sc-positive' },
  provisional_only: { label: 'Prov only', cls: 'sc-positive' },
  held_no_crm: { label: 'Held', cls: 'sc-held' },
  negative_due: { label: 'Negative', cls: 'sc-negative' },
  nil_due: { label: 'Nil due', cls: 'sc-negative' },
  below_target: { label: 'Below target', cls: 'sc-zero' },
  zero_payable: { label: 'Zero payable', cls: 'sc-zero' },
  no_deals: { label: 'No deals', cls: 'sc-zero' },
};

export default function PreviewPage() {
  const { rms, activeRmId, setActiveRmId, toast } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [serverBusy, setServerBusy] = useState(false);

  useEffect(() => {
    if (rms.length > 0 && !activeRmId) setActiveRmId(rms[0].id);
  }, [rms, activeRmId, setActiveRmId]);

  const filteredRms = useMemo(() => {
    return rms.filter((rm) => {
      if (filter !== 'all') {
        const sc = rm.calc.overallScenario;
        if (filter === 'positive' && sc !== 'positive') return false;
        if (filter === 'provonly' && sc !== 'provisional_only') return false;
        if (filter === 'held' && sc !== 'held_no_crm') return false;
        if (filter === 'negative' && !['negative_due', 'nil_due'].includes(sc)) return false;
        if (filter === 'zero' && !['below_target', 'zero_payable', 'no_deals'].includes(sc)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return rm.name.toLowerCase().includes(q) || rm.id.toLowerCase().includes(q) || (rm.empCode || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rms, filter, searchQuery]);

  if (rms.length === 0) return <Navigate to="/" replace />;

  const activeRm = rms.find((r) => r.id === activeRmId) || null;

  async function downloadPdf() {
    if (!activeRm) return;
    setPdfBusy(true);
    try {
      await downloadSinglePdf(activeRm);
      toast('PDF downloaded', 'success');
    } catch (e) {
      toast('PDF generation failed: ' + (e instanceof Error ? e.message : String(e)), 'err');
    } finally {
      setPdfBusy(false);
    }
  }

  async function downloadServer() {
    if (!activeRm) return;
    setServerBusy(true);
    try {
      await downloadServerPdf(activeRm);
      toast('Server PDF downloaded', 'success');
    } catch (e) {
      toast('Server PDF failed: ' + (e instanceof Error ? e.message : String(e)), 'err');
    } finally {
      setServerBusy(false);
    }
  }

  function copyHtml() {
    if (!activeRm) return;
    navigator.clipboard.writeText(generateEmailHtml(activeRm).emailHtml).then(() => toast('HTML copied', 'success'));
  }

  function copyText() {
    if (!activeRm) return;
    navigator.clipboard.writeText(generatePlainText(activeRm)).then(() => toast('Plain text copied', 'success'));
  }

  return (
    <Layout>
     <section className="view active">
       <div className="preview-shell">
         <aside className="rep-panel">
           <div className="rep-panel-h">
             <div className="title">
               Recipients ({filteredRms.length} of {rms.length})
             </div>
             <input
               type="text"
               className="rep-search"
               placeholder="Search name or employee code…"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <div className="rep-filters">
               {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
                 <button key={f} className={'rep-filter' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
                   {FILTER_LABELS[f]}
                 </button>
               ))}
             </div>
           </div>
           <div className="rep-list">
             {filteredRms.length === 0 ? (
               <div style={{ padding: 20, color: '#64748B', fontSize: 13, textAlign: 'center' }}>No RMs match.</div>
             ) : (
               filteredRms.map((rm) => {
                 const sc = rm.calc.overallScenario;
                 const scMap = SCENARIO_MAP[sc] || { label: 'Zero', cls: 'sc-zero' };
                 const amountLabel =
                   sc === 'positive' || sc === 'provisional_only'
                     ? fmtINR(rm.calc.dueForRelease)
                     : sc === 'held_no_crm'
                       ? fmtINR(rm.calc.due) + ' held'
                       : '₹0';
                 return (
                   <div
                     key={rm.id}
                     className={'rep-item' + (rm.id === activeRmId ? ' active' : '')}
                     onClick={() => setActiveRmId(rm.id)}
                   >
                     <div className="rep-item-row1">
                       <div className="rep-item-name">{rm.name}</div>
                       <div className="rep-item-amt">{amountLabel}</div>
                     </div>
                     <div className="rep-item-row2">
                       <span className="rep-item-id">
                         {rm.empCode || rm.id} · {rm.tier}
                       </span>
                       <span className={'rep-item-scenario ' + scMap.cls}>{scMap.label}</span>
                     </div>
                   </div>
                 );
               })
             )}
           </div>
         </aside>

         <div className="preview-panel">
           <div className="preview-toolbar">
             <button className="pt-btn" onClick={() => navigate('/')}>
               ← Upload another file
             </button>
             <div className="pt-info">
               {activeRm ? (
                 <>
                   PDF preview for <strong>{activeRm.name}</strong> ({activeRm.empCode})
                 </>
               ) : (
                 'Select an RM to preview their PDF.'
               )}
             </div>
             {activeRm && (
               <div className="pt-actions">
                 <button className="pt-btn" onClick={downloadPdf} disabled={pdfBusy}>
                   {pdfBusy ? 'Preparing…' : 'Download PDF (browser)'}
                 </button>
                 <button className="pt-btn" onClick={downloadServer} disabled={serverBusy}>
                   {serverBusy ? 'Preparing…' : 'Download PDF (server)'}
                 </button>
                 <button className="pt-btn" onClick={copyHtml}>
                   Copy HTML
                 </button>
                 <button className="pt-btn" onClick={copyText}>
                   Copy plain text
                 </button>
                 <button className="pt-btn primary" onClick={() => navigate('/export')}>
                   Bulk export →
                 </button>
               </div>
             )}
           </div>
           <div className="email-frame-wrap">
             {activeRm ? (
               <EmailFrame rm={activeRm} />
             ) : (
               <div className="empty-preview">
                 <h3>No PDF selected</h3>
                 <p>Pick an RM from the list to see their generated PDF.</p>
               </div>
             )}
           </div>
         </div>
       </div>
     </section>
    </Layout>
  );
}

function EmailFrame({ rm }: { rm: Rm }) {
  const { emailHtml } = generateEmailHtml(rm);
  return (
    <iframe
      key={rm.id}
      sandbox="allow-same-origin"
      srcDoc={emailHtml}
      onLoad={(e) => {
        try {
          const iframe = e.currentTarget;
          const doc = iframe.contentDocument;
          if (doc && doc.body) iframe.style.height = doc.body.scrollHeight + 40 + 'px';
        } catch {
          // ignore, default height applies
        }
      }}
    />
  );
}
