import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { calculateIncentive, validateAndNormalize } from '../lib/engine.js';
import type { Issue, Rm } from '../lib/engine.js';
import { uploadWorkbook } from '../lib/api';

type ToastKind = '' | 'success' | 'err';

export interface LoadStage {
  kind: 'uploading' | 'processing' | 'calculating';
  percent?: number;
  detail?: string;
}
interface Toast {
  id: number;
  msg: string;
  kind: ToastKind;
}

interface AppState {
  rms: Rm[];
  issues: Issue[];
  joinedCount: number;
  navStatus: string;
  activeRmId: string | null;
  setActiveRmId: (id: string | null) => void;
  toast: (msg: string, kind?: ToastKind) => void;
  loadFile: (file: File, onStage?: (stage: LoadStage) => void) => Promise<boolean>;
  reset: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rms, setRms] = useState<Rm[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [joinedCount, setJoinedCount] = useState(0);
  const [navStatus, setNavStatus] = useState('No file loaded');
  const [activeRmId, setActiveRmId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  function toast(msg: string, kind: ToastKind = '') {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }

  function reset() {
    setRms([]);
    setIssues([]);
    setJoinedCount(0);
    setActiveRmId(null);
    setNavStatus('No file loaded');
  }

  async function loadFile(file: File, onStage?: (stage: LoadStage) => void): Promise<boolean> {
    const tick = () => new Promise<void>((r) => setTimeout(r, 0));
    try {
      onStage?.({ kind: 'uploading', percent: 0 });
      const res = await uploadWorkbook(file, (f) => {
        onStage?.(f >= 1 ? { kind: 'processing' } : { kind: 'uploading', percent: Math.round(f * 100) });
      });
      if (!res.success || !res.rmRows || !res.dlRows) {
        throw new Error(res.error || 'Could not parse file.');
      }
      onStage?.({ kind: 'calculating', percent: 0, detail: 'Validating rows' });
      await tick();
      const { rms: parsedRms, issues: parsedIssues, joinedCount: jc } = validateAndNormalize(res.rmRows, res.dlRows);
      for (let i = 0; i < parsedRms.length; i++) {
        parsedRms[i].calc = calculateIncentive(parsedRms[i]);
        if (i % 100 === 99 || i === parsedRms.length - 1) {
          onStage?.({
            kind: 'calculating',
            percent: Math.round(((i + 1) / parsedRms.length) * 100),
            detail: `Calculating incentives for ${i + 1} of ${parsedRms.length} RMs`,
          });
          await tick();
        }
      }
      setRms(parsedRms);
      setIssues(parsedIssues);
      setJoinedCount(jc);
      setActiveRmId(null);
      setNavStatus(file.name + ' · ' + parsedRms.length + ' RMs');
      return true;
    } catch (e) {
      toast('Could not parse file: ' + (e instanceof Error ? e.message : String(e)), 'err');
      return false;
    }
  }

  return (
    <Ctx.Provider value={{ rms, issues, joinedCount, navStatus, activeRmId, setActiveRmId, toast, loadFile, reset }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={'toast' + (t.kind ? ' ' + t.kind : '')}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
