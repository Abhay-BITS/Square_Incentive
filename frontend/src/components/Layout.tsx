import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Layout({ children }: { children: ReactNode }) {
  const { navStatus, rms, reset } = useApp();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="Square Yards" />
          <span className="brand-name">Incentive PDF Tool</span>
          <span className="brand-sub">for Primary Sales T0 · T1</span>
        </div>
        <div className="nav-spacer"></div>
        <span className="nav-badge">{navStatus}</span>
        {rms.length > 0 && (
          <button
            className="btn ghost"
            onClick={() => {
              reset();
              navigate('/');
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
