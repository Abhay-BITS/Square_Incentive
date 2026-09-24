import { saveAs } from 'file-saver';
import type { Rm } from './engine.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

// Server-side PDFs (QuestPDF). The backend receives the same RM objects, calculation
// results included, that the browser already holds.
async function post(path: string, body: unknown): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `Server error (${res.status})`;
    try {
      msg = ((await res.json()) as { error?: string }).error || msg;
    } catch {
      // response was not JSON
    }
    throw new Error(msg);
  }
  return res.blob();
}

export async function downloadServerPdf(rm: Rm): Promise<void> {
  const blob = await post('/api/pdf/single', rm);
  saveAs(blob, `${rm.empCode}_${rm.calc.ddShort}DD.pdf`);
}

// Each ZIP part is kept under this size so no single download (or the memory the browser
// needs to hold it) gets too large. Parts are downloaded one after another from one click.
const MAX_PART_BYTES = 450 * 1024 * 1024;
const PROBE_COUNT = 20;
const SAFETY = 1.25;

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export async function downloadServerPdfZip(rms: Rm[], onProgress?: (message: string) => void): Promise<number> {
  const ts = stamp();

  if (rms.length <= PROBE_COUNT) {
    onProgress?.('Generating…');
    saveAs(await post('/api/pdf/zip', rms), `incentive_pdfs_server_${ts}.zip`);
    return 1;
  }

  // Generate a small sample first to learn the average PDF size, then decide how many
  // parts the full export needs.
  onProgress?.('Estimating size…');
  const probe = await post('/api/pdf/zip', rms.slice(0, PROBE_COUNT));
  const estimatedTotal = (probe.size / PROBE_COUNT) * SAFETY * rms.length;
  const parts = Math.max(1, Math.ceil(estimatedTotal / MAX_PART_BYTES));
  const perPart = Math.ceil(rms.length / parts);

  for (let i = 0; i < parts; i++) {
    onProgress?.(parts === 1 ? 'Generating…' : `Generating part ${i + 1} of ${parts}…`);
    const chunk = rms.slice(i * perPart, (i + 1) * perPart);
    const blob = await post('/api/pdf/zip', chunk);
    const suffix = parts === 1 ? '' : `_part${i + 1}of${parts}`;
    saveAs(blob, `incentive_pdfs_server_${ts}${suffix}.zip`);
  }
  return parts;
}
