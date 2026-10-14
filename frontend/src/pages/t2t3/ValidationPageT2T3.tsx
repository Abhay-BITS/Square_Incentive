import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppT2T3 } from '../../context/AppContextT2T3';
import { LayoutT2T3 } from '../../components/LayoutT2T3';
import { BackLink } from '../../components/BackLink';

type Filter = 'all' | 'warn' | 'err';

export default function ValidationPageT2T3() {
  const { rms, issues, joinedCount } = useAppT2T3();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  if (rms.length === 0) return <Navigate to="/t2" replace />;

  const warnCount = issues.filter((i) => i.level === 'warn').length;
  const errCount = issues.filter((i) => i.level === 'err').length;
  const filtered = filter === 'all' ? issues : issues.filter((i) => i.level === filter);

  const statStyle = (active: boolean): React.CSSProperties => ({
    cursor: 'pointer',
    outline: active ? '2px solid var(--accent, #3B82F6)' : 'none',
    outlineOffset: -2,
    transition: 'outline 0.15s',
  });

  return (
    <LayoutT2T3>
     <section className="view active">
       <div className="validation">
         <BackLink to="/t2">Upload a different file</BackLink>
        <h1>File validated</h1>
         <p className="val-lede">
           {errCount > 0
             ? 'Fix the errors below before proceeding.'
             : warnCount > 0
               ? `Loaded with ${warnCount} warning(s). Review before proceeding.`
               : `All ${rms.length} employee(s) and ${joinedCount} deal(s) loaded cleanly.`}
         </p>

         <div
           style={{
             background: '#F8FAFC',
             border: '1px solid var(--border)',
             borderRadius: 6,
             padding: '12px 16px',
             marginBottom: 20,
             fontSize: 12.5,
             color: 'var(--ink-soft)',
             lineHeight: 1.55,
           }}
         >
           <strong style={{ color: 'var(--ink)' }}>What errors and warnings mean.</strong>{' '}
           <span style={{ color: 'var(--red-deep)', fontWeight: 600 }}>Errors</span> block the row. An employee with any
           error won't get a PDF.{' '}
           <span style={{ color: 'var(--orange-deep)', fontWeight: 600 }}>Warnings</span> let the row proceed with
           a safe default, but you should review.
         </div>

         <div className="val-stats">
           <div className="val-stat">
             <div className="val-stat-label">Employees found</div>
             <div className="val-stat-value">{rms.length}</div>
           </div>
           <div className="val-stat">
             <div className="val-stat-label">Deals joined</div>
             <div className="val-stat-value">{joinedCount}</div>
           </div>
           <div
             className={'val-stat' + (warnCount > 0 ? ' warn' : '')}
             style={statStyle(filter === 'warn')}
             onClick={() => setFilter(filter === 'warn' ? 'all' : 'warn')}
             title="Click to filter warnings"
           >
             <div className="val-stat-label">Warnings</div>
             <div className="val-stat-value">{warnCount}</div>
           </div>
           <div
             className={'val-stat' + (errCount > 0 ? ' err' : '')}
             style={statStyle(filter === 'err')}
             onClick={() => setFilter(filter === 'err' ? 'all' : 'err')}
             title="Click to filter errors"
           >
             <div className="val-stat-label">Errors</div>
             <div className="val-stat-value">{errCount}</div>
           </div>
         </div>

         {filter !== 'all' && (
           <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
               Showing {filter === 'warn' ? 'warnings' : 'errors'} only ({filtered.length})
             </span>
             <button
               onClick={() => setFilter('all')}
               style={{
                 background: 'none',
                 border: '1px solid var(--border)',
                 borderRadius: 4,
                 padding: '2px 10px',
                 fontSize: 12,
                 cursor: 'pointer',
                 color: 'var(--ink-soft)',
               }}
             >
               Show all
             </button>
           </div>
         )}

         {issues.length === 0 ? (
           <div className="issue-list">
             <h4>No issues found. You are good to proceed.</h4>
           </div>
         ) : (
           <div className="issue-list">
             <h4>
               {filtered.length} issue{filtered.length !== 1 ? 's' : ''} to review
             </h4>
             {filtered.map((i, idx) => (
               <div className="issue" key={idx}>
                 <span className={'issue-tag ' + i.level}>{i.level === 'err' ? 'Error' : 'Warning'}</span>
                 <span className="issue-msg">
                   <span className="loc">{i.loc}</span>: {i.msg.replace(/\s*—\s*/g, ', ')}
                 </span>
               </div>
             ))}
           </div>
         )}

         <div className="val-actions">
           <button className="btn primary" disabled={errCount > 0 || rms.length === 0} onClick={() => navigate('/t2/preview')}>
             Continue to PDF preview →
           </button>
           <button className="btn ghost" onClick={() => navigate('/t2')}>
             Upload a different file
           </button>
         </div>
       </div>
     </section>
    </LayoutT2T3>
  );
}
