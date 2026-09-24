import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateEmailHtml } from './engine.js';
import type { Rm } from './engine.js';

function tsSlug(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function htmlFileName(rm: Rm): string {
  return (rm.empCode + '_' + rm.name).replace(/[^A-Za-z0-9_-]/g, '_') + '.html';
}

export function downloadHtml(rm: Rm): void {
  const { emailHtml } = generateEmailHtml(rm);
  saveAs(new Blob([emailHtml], { type: 'text/html;charset=utf-8' }), htmlFileName(rm));
}

export async function downloadHtmlZip(rms: Rm[]): Promise<void> {
  if (rms.length === 0) return;
  const zip = new JSZip();
  rms.forEach((rm) => zip.file(htmlFileName(rm), generateEmailHtml(rm).emailHtml));
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'incentive_html_' + tsSlug() + '.zip');
}
