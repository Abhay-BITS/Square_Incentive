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

export async function downloadServerPdfZip(rms: Rm[]): Promise<void> {
  const blob = await post('/api/pdf/zip', rms);
  saveAs(blob, 'incentive_pdfs_server_' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.zip');
}
