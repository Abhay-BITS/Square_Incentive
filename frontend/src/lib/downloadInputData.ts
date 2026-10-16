import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function downloadInputAsExcel(
  rmRows: Record<string, unknown>[],
  dlRows: Record<string, unknown>[],
  tier: 't2t3' | 't0t1',
) {
  const wb = XLSX.utils.book_new();
  const rmSheet = XLSX.utils.json_to_sheet(rmRows);
  const dlSheet = XLSX.utils.json_to_sheet(dlRows);
  const rmName = tier === 't2t3' ? 'T2T3' : 'RMs';
  XLSX.utils.book_append_sheet(wb, rmSheet, rmName);
  XLSX.utils.book_append_sheet(wb, dlSheet, 'Deals');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `beats_input_${tier}_${ts}.xlsx`);
}
