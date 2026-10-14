import { Navigate, useNavigate } from 'react-router-dom';
import { useAppT2T3 } from '../../context/AppContextT2T3';
import { LayoutT2T3 } from '../../components/LayoutT2T3';
import { BackLink } from '../../components/BackLink';

export default function ValidationPageT2T3() {
  const { rms, issues, joinedCount } = useAppT2T3();
  const navigate = useNavigate();
  if (rms.length === 0) return <Navigate to="/t2" replace />;

  const warnCount = issues.filter((i) => i.level === 'warn').length;
  const errCount = issues.filter((i) => i.level === 'err').length;

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
           <div className={'val-stat' + (warnCount > 0 ? ' warn' : '')}>
             <div className="val-stat-label">Warnings</div>
             <div className="val-stat-value">{warnCount}</div>
           </div>
           <div className={'val-stat' + (errCount > 0 ? ' err' : '')}>
             <div className="val-stat-label">Errors</div>
             <div className="val-stat-value">{errCount}</div>
           </div>
         </div>

         {issues.length === 0 ? (
           <div className="issue-list">
             <h4>No issues found. You are good to proceed.</h4>
           </div>
         ) : (
           <div className="issue-list">
             <h4>
               {issues.length} issue{issues.length !== 1 ? 's' : ''} to review
             </h4>
             {issues.map((i, idx) => (
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
