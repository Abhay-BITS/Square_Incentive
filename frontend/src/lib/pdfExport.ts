// Ported from app.downloadPdfZip() / app.downloadHtmlZip() in Incentive_PDF_Tool.html.
// Same page-break-aware html2canvas -> sliced jsPDF pipeline, so PDFs render identically
// to the original tool's output.
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateEmailHtml } from './engine.js';
import type { Rm } from './engine.js';

function tsSlug(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function getContainer(): HTMLElement {
  let container = document.getElementById('pdf-render-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pdf-render-container';
    Object.assign(container.style, {
      position: 'absolute',
      left: '0px',
      top: '100000px',
      width: '680px',
      background: '#F4F5F7',
      pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }
  return container;
}

async function renderRmToPdf(rm: Rm, container: HTMLElement): Promise<Blob> {
  const { emailHtml } = generateEmailHtml(rm);
  const parser = new DOMParser();
  const dom = parser.parseFromString(emailHtml, 'text/html');
  container.innerHTML = dom.body.innerHTML;
  container.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''));

  await new Promise((r) => setTimeout(r, 120));

  const containerRect = container.getBoundingClientRect();
  const sectionElements = Array.from(container.querySelectorAll('.pdf-section-start'));
  const breakpoints = sectionElements
    .map((el) => el.getBoundingClientRect().top - containerRect.top)
    .filter((y) => y > 40);

  const canvas = await html2canvas(container, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: '#F4F5F7',
    logging: false,
    windowWidth: 780,
    width: 780,
  });

  const scaleY = canvas.height / container.offsetHeight;
  const canvasBreakpoints = breakpoints.map((y) => Math.round(y * scaleY));

  const pdfWidth = 555;
  const pdfPageHeight = 780;
  const canvasToPt = pdfWidth / canvas.width;
  const pageHeightInCanvasPx = pdfPageHeight / canvasToPt;

  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });

  let currentY = 0;
  let pageNum = 0;
  while (currentY < canvas.height) {
    const idealEnd = Math.min(currentY + pageHeightInCanvasPx, canvas.height);
    let sliceEnd = idealEnd;
    if (idealEnd < canvas.height) {
      const minAcceptable = currentY + 0.65 * pageHeightInCanvasPx;
      const candidates = canvasBreakpoints.filter((bp) => bp > minAcceptable && bp <= idealEnd);
      if (candidates.length > 0) sliceEnd = Math.max(...candidates);
    }
    const sliceHeight = sliceEnd - currentY;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.fillStyle = '#F4F5F7';
    ctx.fillRect(0, 0, canvas.width, sliceHeight);
    ctx.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.85);

    if (pageNum > 0) doc.addPage();
    doc.addImage(sliceData, 'JPEG', 20, 20, pdfWidth, sliceHeight * canvasToPt);

    currentY = sliceEnd;
    pageNum++;
  }

  return doc.output('blob');
}

function pdfFileName(rm: Rm): string {
  return `${rm.empCode}_${rm.calc.ddShort}DD.pdf`;
}

export async function downloadSinglePdf(rm: Rm): Promise<void> {
  const container = getContainer();
  const blob = await renderRmToPdf(rm, container);
  container.innerHTML = '';
  saveAs(blob, pdfFileName(rm));
}

export async function downloadPdfZip(rms: Rm[], onProgress?: (done: number, total: number) => void): Promise<void> {
  if (rms.length === 0) return;

  const zip = new JSZip();
  const container = getContainer();
  let done = 0;

  for (const rm of rms) {
    zip.file(pdfFileName(rm), await renderRmToPdf(rm, container));
    done++;
    onProgress?.(done, rms.length);
  }

  container.innerHTML = '';
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'incentive_pdfs_' + tsSlug() + '.zip');
}

export async function downloadHtmlZip(rms: Rm[]): Promise<void> {
  if (rms.length === 0) return;
  const zip = new JSZip();
  rms.forEach((rm) => {
    const { emailHtml } = generateEmailHtml(rm);
    const safeName = (rm.empCode + '_' + rm.name).replace(/[^A-Za-z0-9_-]/g, '_');
    zip.file(safeName + '.html', emailHtml);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'incentive_html_' + tsSlug() + '.zip');
}
