import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppT2T3 } from '../context/AppContextT2T3.js';

export function LayoutT2T3({ children }: { children: ReactNode }) {
  const { navStatus, rms, reset } = useAppT2T3();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="Square Yards" />
          <span className="brand-name">Incentive PDF Tool</span>
          <span className="brand-sub">for Primary Sales T2 · T3</span>
        </div>
        <div className="nav-spacer"></div>
        <span className="nav-badge">{navStatus}</span>
        <button
          className="btn ghost"
          onClick={() => {
            reset();
            navigate('/');
          }}
        >
          ← Home
        </button>
        {rms.length > 0 && (
          <button
            className="btn ghost"
            onClick={() => {
              reset();
              navigate('/t2');
            }}
          >
            Start over
          </button>
        )}
      </nav>
      {children}
    </div>
  );
}
