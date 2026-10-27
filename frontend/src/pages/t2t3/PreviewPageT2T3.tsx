import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { fmtINR, generateEmailHtml, generatePlainText } from '../../lib/t2t3/engine-t2t3.js';
import type { Rm } from '../../lib/t2t3/engine-t2t3.js';
import { downloadHtml } from '../../lib/t2t3/pdfExport-t2t3.js';
import { downloadServerPdf } from '../../lib/t2t3/serverPdf-t2t3.js';
import { useAppT2T3 } from '../../context/AppContextT2T3.js';
import { LayoutT2T3 } from '../../components/LayoutT2T3.js';

type Filter = 'all' | 'positive' | 'zero' | 'held' | 'negative';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  positive: 'Positive',
  zero: 'Zero',
  held: 'Held',
  negative: 'Negative',
};

const SCENARIO_MAP: Record<string, { label: string; cls: string }> = {
  positive: { label: 'Positive', cls: 'sc-positive' },
  held_pip: { label: 'Held (PIP)', cls: 'sc-held' },
  negative_due: { label: 'Negative', cls: 'sc-negative' },
  nil_due: { label: 'Nil due', cls: 'sc-negative' },
  zero_payable: { label: 'Zero payable', cls: 'sc-zero' },
  no_deals: { label: 'No deals', cls: 'sc-zero' },
};

export default function PreviewPageT2T3() {
  const { rms, activeRmId, setActiveRmId, toast } = useAppT2T3();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'T2' | 'T3' | 'Promo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverBusy, setServerBusy] = useState(false);

  useEffect(() => {
    if (rms.length > 0 && !activeRmId) setActiveRmId(rms[0].id);
  }, [rms, activeRmId, setActiveRmId]);

  const filteredRms = useMemo(() => {
    return rms.filter((rm) => {
      if (tierFilter === 'Promo') {
        if (!rm.blocks || rm.blocks.length === 0) return false;
      } else if (tierFilter !== 'all') {
        if (rm.tier !== tierFilter) return false;
      }
      if (filter !== 'all') {
        const sc = rm.calc.overallScenario;
        if (filter === 'positive' && sc !== 'positive') return false;
        if (filter === 'held' && sc !== 'held_pip') return false;
        if (filter === 'negative' && !['negative_due', 'nil_due'].includes(sc)) return false;
        if (filter === 'zero' && !['zero_payable', 'no_deals'].includes(sc)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return rm.name.toLowerCase().includes(q) || rm.id.toLowerCase().includes(q) || (rm.empCode || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [rms, filter, tierFilter, searchQuery]);

  if (rms.length === 0) return <Navigate to="/t2" replace />;

  const activeRm = rms.find((r) => r.id === activeRmId) || null;

  async function downloadServer() {
    if (!activeRm) return;
    if (activeRm.blocks && activeRm.blocks.length > 0) {
      downloadHtml(activeRm);
      toast('Promo employee — downloaded as HTML', 'success');
      return;
    }
    setServerBusy(true);
    try {
      await downloadServerPdf(activeRm);
      toast('PDF downloaded', 'success');
    } catch (e) {
      toast('PDF generation failed: ' + (e instanceof Error ? e.message : String(e)), 'err');
    } finally {
      setServerBusy(false);
    }
  }

  function handleDownloadHtml() {
    if (!activeRm) return;
    downloadHtml(activeRm);
    toast('HTML downloaded', 'success');
  }

  function copyText() {
    if (!activeRm) return;
    navigator.clipboard.writeText(generatePlainText(activeRm)).then(() => toast('Plain text copied', 'success'));
  }

  return (
    <LayoutT2T3>
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
             <div className="rep-filters" style={{ marginBottom: 4 }}>
               {(['all', 'T2', 'T3', 'Promo'] as const).map((t) => (
                 <button key={t} className={'rep-filter' + (tierFilter === t ? ' active' : '')} onClick={() => setTierFilter(t)}>
                   {t === 'all' ? 'All Tiers' : t}
                 </button>
               ))}
             </div>
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
               <div style={{ padding: 20, color: '#64748B', fontSize: 13, textAlign: 'center' }}>No employees match.</div>
             ) : (
               filteredRms.map((rm) => {
                 const sc = rm.calc.overallScenario;
                 const scMap = SCENARIO_MAP[sc] || { label: 'Zero', cls: 'sc-zero' };
                 const amountLabel =
                   sc === 'positive'
                     ? fmtINR(rm.calc.dueForRelease)
                     : sc === 'held_pip'
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
                         {rm.blocks && rm.blocks.length > 0 && (
                           <span style={{ marginLeft: 6, background: '#7C3AED', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>Promo</span>
                         )}
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
             <button className="pt-btn" onClick={() => navigate('/t2')}>
               ← Upload another file
             </button>
             <div className="pt-info">
               {activeRm ? (
                 <>
                   PDF preview for <strong>{activeRm.name}</strong> ({activeRm.empCode})
                 </>
               ) : (
                 'Select an employee to preview their PDF.'
               )}
             </div>
             {activeRm && (
               <div className="pt-actions">
                 <button className="pt-btn" onClick={downloadServer} disabled={serverBusy}>
                   {serverBusy ? 'Preparing…' : 'Download PDF'}
                 </button>
                 <button className="pt-btn" onClick={handleDownloadHtml}>
                   Download HTML
                 </button>
                 <button className="pt-btn" onClick={copyText}>
                   Copy plain text
                 </button>
                 <button className="pt-btn primary" onClick={() => navigate('/t2/export')}>
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
                 <p>Pick an employee from the list to see their generated PDF.</p>
               </div>
             )}
           </div>
         </div>
       </div>
     </section>
    </LayoutT2T3>
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
