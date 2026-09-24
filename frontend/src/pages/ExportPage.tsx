import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fmtINR } from '../lib/engine.js';
import { downloadHtmlZip } from '../lib/pdfExport';
import { downloadServerPdfZip } from '../lib/serverPdf';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { BackLink } from '../components/BackLink';

export default function ExportPage() {
  const { rms, toast } = useApp();
  const [zipStatus, setZipStatus] = useState<string | null>(null);

  const diag = useMemo(() => {
    const buckets = { positive: 0, zero: 0, held: 0, negative: 0 };
    let totalDisburse = 0;
    rms.forEach((rm) => {
      const sc = rm.calc.overallScenario;
      if (sc === 'positive' || sc === 'provisional_only') {
        buckets.positive++;
        totalDisburse += rm.calc.dueForRelease;
      } else if (sc === 'held_no_crm') buckets.held++;
      else if (sc === 'negative_due' || sc === 'nil_due') buckets.negative++;
      else buckets.zero++;
    });
    return { rmCount: rms.length, dealCount: rms.reduce((s, r) => s + r.deals.length, 0), ...buckets, totalDisburse };
  }, [rms]);

  if (rms.length === 0) return <Navigate to="/" replace />;

  async function handleServerZip() {
    setZipStatus('Generating…');
    try {
      const parts = await downloadServerPdfZip(rms, setZipStatus);
      toast(parts > 1 ? `Generated ${rms.length} PDFs in ${parts} ZIP files` : `Generated ${rms.length} PDFs`, 'success');
    } catch (e) {
      toast('PDF generation failed: ' + (e instanceof Error ? e.message : String(e)), 'err');
    } finally {
      setZipStatus(null);
    }
  }

  async function handleDownloadHtmlZip() {
    try {
      await downloadHtmlZip(rms);
      toast('HTML ZIP downloaded', 'success');
    } catch (e) {
      toast('Export failed: ' + (e instanceof Error ? e.message : String(e)), 'err');
    }
  }

  return (
    <Layout>
     <section className="view active">
       <div className="export">
         <BackLink to="/preview">Back to preview</BackLink>
        <h1>Bulk export</h1>
         <p className="lede">Pick the format that matches how you'll distribute these.</p>

         <div className="export-option">
           <div className="export-option-body">
             <h3>ZIP of PDFs</h3>
             <p>
               One PDF per RM, filename <code>EmployeeCode_MonthDD.pdf</code>. Very large batches are split into several ZIP files automatically, so your browser may ask to allow multiple downloads.
             </p>
           </div>
           <button className="btn primary" onClick={handleServerZip} disabled={zipStatus !== null}>
             {zipStatus ? (
               <>
                 <span className="spinner"></span> {zipStatus}
               </>
             ) : (
               'Download PDFs (ZIP)'
             )}
           </button>
         </div>

         <div className="export-option">
           <div className="export-option-body">
             <h3>ZIP of .html files (archive only)</h3>
             <p>Raw HTML per RM for archiving or internal debugging. Do not distribute outside the incentive team.</p>
             <div className="use-with">
               Use with: <strong>Internal archive</strong> only
             </div>
           </div>
           <button className="btn ghost" onClick={handleDownloadHtmlZip}>
             Download HTML ZIP
           </button>
         </div>

         <div className="diag">
           <h3>This run</h3>
           <div className="diag-row">
             <span className="k">RMs in file</span>
             <span className="v">{diag.rmCount}</span>
           </div>
           <div className="diag-row">
             <span className="k">Deals joined</span>
             <span className="v">{diag.dealCount}</span>
           </div>
           <div className="diag-row">
             <span className="k">Positive incentive</span>
             <span className="v">{diag.positive}</span>
           </div>
           <div className="diag-row">
             <span className="k">Zero incentive</span>
             <span className="v">{diag.zero}</span>
           </div>
           <div className="diag-row">
             <span className="k">Held (no CRM)</span>
             <span className="v">{diag.held}</span>
           </div>
           <div className="diag-row">
             <span className="k">Negative Due</span>
             <span className="v">{diag.negative}</span>
           </div>
           <div className="diag-row">
             <span className="k">Total to disburse this cycle</span>
             <span className="v">{fmtINR(diag.totalDisburse)}</span>
           </div>
         </div>

       </div>
     </section>
    </Layout>
  );
}
