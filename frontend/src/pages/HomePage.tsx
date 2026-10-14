import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="Square Yards" />
          <span className="brand-name">Incentive PDF Tool</span>
          <span className="brand-sub">for Primary Sales</span>
        </div>
      </nav>

      <section className="view active">
        <div className="home-gate">
          <h1>Select incentive tier</h1>
          <p className="lede">
            Choose the tier that matches your Excel file. Each door has its own upload,
            calculation engine, preview, and export flow.
          </p>

          <div className="gate-cards">
            <button className="gate-card" onClick={() => navigate('/t0')}>
              <div className="gate-card-tier">T0 / T1</div>
              <div className="gate-card-desc">
                Single-stream provisional + confirmed incentive.
                5x salary target, 5% + 40% slabs, CRM release gate.
              </div>
              <span className="gate-card-action">Open T0/T1 tool →</span>
            </button>

            <button className="gate-card" onClick={() => navigate('/t2')}>
              <div className="gate-card-tier">T2 / T3</div>
              <div className="gate-card-desc">
                Dual-stream Team + Self incentive.
                Dynamic slab rates by tier, flat 5% self, PIP release gate.
              </div>
              <span className="gate-card-action">Open T2/T3 tool →</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
