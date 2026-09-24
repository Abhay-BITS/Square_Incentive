import { saveAs } from 'file-saver';
import JSZip from 'jszip';
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

// Exports run as many small requests instead of one long one, so a slow or sleepy server
// never hits a connection timeout, progress is visible, and a failed batch is retried.
// Finished PDFs are gathered into ZIP files kept under MAX_PART_BYTES and each one is saved
// as soon as it fills, which also keeps browser memory bounded.
const BATCH_SIZE = 25;
const MAX_PART_BYTES = 450 * 1024 * 1024;
const RETRIES = 2;

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function postWithRetry(path: string, body: unknown): Promise<Blob> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await post(path, body);
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
  throw lastError;
}

function formatEta(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 1) return 'less than a minute left';
  if (min < 60) return `about ${min} min left`;
  return `about ${Math.floor(min / 60)} h ${min % 60} min left`;
}

export async function downloadServerPdfZip(rms: Rm[], onProgress?: (message: string) => void): Promise<number> {
  const ts = stamp();

  if (rms.length <= BATCH_SIZE) {
    onProgress?.('Generating…');
    saveAs(await postWithRetry('/api/pdf/zip', rms), `incentive_pdfs_server_${ts}.zip`);
    return 1;
  }

  let part = new JSZip();
  let partBytes = 0;
  let savedParts = 0;
  const started = Date.now();

  async function flush() {
    if (partBytes === 0) return;
    savedParts++;
    const blob = await part.generateAsync({ type: 'blob', compression: 'STORE' });
    saveAs(blob, `incentive_pdfs_server_${ts}_part${savedParts}.zip`);
    part = new JSZip();
    partBytes = 0;
  }

  try {
    for (let i = 0; i < rms.length; i += BATCH_SIZE) {
      const done = i;
      const elapsed = Date.now() - started;
      const eta = done > 0 ? ` (${formatEta((elapsed / done) * (rms.length - done))})` : '';
      onProgress?.(`Generating ${done} of ${rms.length} PDFs${eta}`);

      const batch = await JSZip.loadAsync(await postWithRetry('/api/pdf/zip', rms.slice(i, i + BATCH_SIZE)));
      for (const name of Object.keys(batch.files)) {
        const data = await batch.files[name].async('uint8array');
        if (partBytes + data.length > MAX_PART_BYTES) await flush();
        part.file(name, data, { compression: 'STORE' });
        partBytes += data.length;
      }
    }
    onProgress?.('Saving…');
    await flush();
  } catch (e) {
    if (savedParts > 0 || partBytes > 0) {
      await flush();
      throw new Error(
        `${e instanceof Error ? e.message : String(e)}. The PDFs generated so far were saved in ${savedParts} ZIP file(s); run the export again for the rest.`
      );
    }
    throw e;
  }
  return savedParts;
}
