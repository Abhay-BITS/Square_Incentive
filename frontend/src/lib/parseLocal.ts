import * as XLSX from 'xlsx';

export interface ParseResult {
  rmRows: Record<string, unknown>[];
  dlRows: Record<string, unknown>[];
}

function findSheet(wb: XLSX.WorkBook, candidates: string[]): string | null {
  for (const n of wb.SheetNames) {
    if (candidates.includes(n.trim().toLowerCase())) return n;
  }
  return null;
}

export async function parseExcelLocal(file: File, tier: 't0t1' | 't2t3'): Promise<ParseResult> {
  const arr = await file.arrayBuffer();
  const wb = XLSX.read(arr, { type: 'array', cellDates: true });

  const rmCandidates = tier === 't2t3'
    ? ['t2t3', 't2/t3', 't2-t3', 'rms', 'rm', 'reps', 'employees', 'sheet1']
    : ['rms', 'rm', 'reps', 'employees', 'sheet1'];
  const dlCandidates = ['deals', 'deal', 'sheet2'];

  let rmSheet = findSheet(wb, rmCandidates);
  let dlSheet = findSheet(wb, dlCandidates);

  if (!rmSheet && wb.SheetNames.length >= 1) rmSheet = wb.SheetNames[0];
  if (!dlSheet && wb.SheetNames.length >= 2) dlSheet = wb.SheetNames[1];

  if (!rmSheet) throw new Error('No RM/employee sheet found in the workbook.');
  if (!dlSheet) throw new Error('No Deals sheet found in the workbook.');

  const rmRows = XLSX.utils.sheet_to_json(wb.Sheets[rmSheet], { defval: null, raw: true }) as Record<string, unknown>[];
  const dlRows = XLSX.utils.sheet_to_json(wb.Sheets[dlSheet], { defval: null, raw: true }) as Record<string, unknown>[];

  return { rmRows, dlRows };
}
