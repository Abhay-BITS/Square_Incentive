import { useNavigate } from 'react-router-dom';

export function BackLink({ to, children }: { to: string; children: string }) {
  const navigate = useNavigate();
  return (
    <button className="back-link" onClick={() => navigate(to)}>
      <span aria-hidden="true">←</span> {children}
    </button>
  );
}
