import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import type { Rm as RmT0T1, Calc as CalcT0T1, DealResult as DRT0T1 } from './t0t1/engine-t0t1.js';
import type { Rm as RmT2T3, Calc as CalcT2T3, DealResult as DRT2T3, BlockCalc } from './t2t3/engine-t2t3.js';

type Row = Record<string, unknown>;

function num(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/,/g, '').trim());
  return isNaN(n) ? 0 : n;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function round(n: number): number {
  return Math.round(n);
}

function matchLabel(diff: number, threshold: number): string {
  if (Math.abs(diff) <= threshold) return 'YES';
  return 'NO';
}

const EMAIL_PATTERNS = /email|e-mail|e_mail/i;

function indexByEmpCode(rows: Row[]): Map<string, Row[]> {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const code = str(r['Employee Code']);
    if (!code) continue;
    if (!map.has(code)) map.set(code, []);
    map.get(code)!.push(r);
  }
  return map;
}

function rawDealKey(r: Row): string {
  return str(r['Employee Code']) + '|' + str(r['TCFNumber']);
}

function getHeaders(rows: Row[]): string[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]).filter(
    (h) => !h.startsWith('__EMPTY') && !EMAIL_PATTERNS.test(h),
  );
}

// ── Style constants ──
const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial', sz: 10 },
  fill: { fgColor: { rgb: '1E3A5F' } },
  alignment: { horizontal: 'center' as const, wrapText: true },
  border: {
    top: { style: 'thin' as const, color: { rgb: '000000' } },
    bottom: { style: 'thin' as const, color: { rgb: '000000' } },
    left: { style: 'thin' as const, color: { rgb: '000000' } },
    right: { style: 'thin' as const, color: { rgb: '000000' } },
  },
};

const ENGINE_HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial', sz: 10 },
  fill: { fgColor: { rgb: '2E75B6' } },
  alignment: { horizontal: 'center' as const, wrapText: true },
  border: {
    top: { style: 'thin' as const, color: { rgb: '000000' } },
    bottom: { style: 'thin' as const, color: { rgb: '000000' } },
    left: { style: 'thin' as const, color: { rgb: '000000' } },
    right: { style: 'thin' as const, color: { rgb: '000000' } },
  },
};

const ENGINE_CELL_STYLE = {
  fill: { fgColor: { rgb: 'DCE6F1' } },
  font: { name: 'Arial', sz: 10 },
};

function applyStyles(
  ws: XLSX.WorkSheet,
  totalCols: number,
  engineStartCol: number,
  rowCount: number,
) {
  for (let c = 0; c < totalCols; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) ws[addr] = { v: '', t: 's' };
    ws[addr].s = c >= engineStartCol ? ENGINE_HEADER_STYLE : HEADER_STYLE;
  }
  for (let r = 1; r <= rowCount; r++) {
    for (let c = engineStartCol; c < totalCols; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      ws[addr].s = ENGINE_CELL_STYLE;
    }
  }
}

function setColWidths(ws: XLSX.WorkSheet, headers: string[]) {
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 13) }));
}

function addAutoFilter(ws: XLSX.WorkSheet, colCount: number, rowCount: number) {
  ws['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rowCount, c: colCount - 1 },
    }),
  };
}

// ═══════════════════════════════════════════════════════════════════
//                        T0/T1 COMPARISON
// ═══════════════════════════════════════════════════════════════════
export function exportComparisonT0T1(
  rms: RmT0T1[],
  rawRmRows: Row[],
  rawDlRows: Row[],
) {
  const wb = XLSX.utils.book_new();
  const rmIndex = indexByEmpCode(rawRmRows);
  const rawDealMap = new Map<string, Row>();
  for (const r of rawDlRows) rawDealMap.set(rawDealKey(r), r);

  // ── Sheet 1: RMs ──
  const rmOrigHeaders = getHeaders(rawRmRows);
  const engineCols = [
    'Target (5×Cost)',
    'Counted Revenue',
    'Conf+Coll Revenue',
    'Prov Base',
    'Prov Crossed',
    'Prov Payable Incentive',
    'Conf Base',
    'Conf Crossed',
    'Conf Payable Incentive',
    'Engine FY Payable',
    'Engine FY Cash (80%)',
    'Sheet FY Payable',
    'Diff',
    'Match',
  ];
  const engineStartCol = rmOrigHeaders.length;
  const allRmHeaders = [...rmOrigHeaders, ...engineCols];
  const rmDataRows: unknown[][] = [];

  const rmMap = new Map<string, RmT0T1>();
  for (const rm of rms) rmMap.set(rm.empCode, rm);

  for (const rawRow of rawRmRows) {
    const code = str(rawRow['Employee Code']);
    const rm = rmMap.get(code);
    const calc: CalcT0T1 | undefined = rm?.calc;

    const origValues = rmOrigHeaders.map((h) => rawRow[h] ?? '');
    const sheetFyPay = round(num(rawRow['FY-202627 Final Payable']));
    const engCash = calc ? round(calc.fy27CashPayable) : 0;
    const diff = engCash - sheetFyPay;

    const confCollDeals = rm ? rm.deals.filter((d) => d.stage === 'Confirmed' || d.stage === 'Collected') : [];
    const countedDeals = rm ? rm.deals.filter((d) => d.stage === 'Counted') : [];

    const engineValues = [
      calc ? round(calc.eligibilityTarget) : '',
      round(countedDeals.reduce((s, d) => s + d.revenue, 0)),
      round(confCollDeals.reduce((s, d) => s + d.revenue, 0)),
      calc ? round(calc.provBase) : '',
      calc ? (calc.provCrossed ? 'Yes' : 'No') : '',
      calc ? round(calc.provIncentive) : '',
      calc ? round(calc.confBase) : '',
      calc ? (calc.confCrossed ? 'Yes' : 'No') : '',
      calc ? round(calc.confIncentive) : '',
      calc ? round(calc.fy27Payable) : '',
      engCash,
      sheetFyPay,
      diff,
      matchLabel(diff, 300),
    ];

    rmDataRows.push([...origValues, ...engineValues]);
  }

  const rmWs = XLSX.utils.aoa_to_sheet([allRmHeaders, ...rmDataRows]);
  setColWidths(rmWs, allRmHeaders);
  applyStyles(rmWs, allRmHeaders.length, engineStartCol, rmDataRows.length);
  addAutoFilter(rmWs, allRmHeaders.length, rmDataRows.length);
  XLSX.utils.book_append_sheet(wb, rmWs, 'T0-T1 RMs');

  // ── Sheet 2: Deals ──
  const dlOrigHeaders = getHeaders(rawDlRows);
  const dealEngineCols = [
    'Deal ProvShare',
    'Deal ConfShare',
    'Engine Payable (100%)',
    'Engine Cash (80%)',
    'Sheet Payable',
    'Diff',
    'Match',
  ];
  const dlEngineStartCol = dlOrigHeaders.length;
  const allDlHeaders = [...dlOrigHeaders, ...dealEngineCols];
  const dlDataRows: unknown[][] = [];

  const dealResultMap = new Map<string, DRT0T1>();
  for (const rm of rms) {
    if (!rm.calc?.dealResults) continue;
    for (const dr of rm.calc.dealResults) {
      dealResultMap.set(rm.empCode + '|' + dr.deal.tcfId, dr);
    }
  }

  for (const rawDeal of rawDlRows) {
    const key = rawDealKey(rawDeal);
    const dr = dealResultMap.get(key);

    const origValues = dlOrigHeaders.map((h) => rawDeal[h] ?? '');
    const sheetPay = round(num(rawDeal['Payable']));
    const engCash = dr ? round(dr.cashPayable) : 0;
    const diff = engCash - sheetPay;

    const engineValues = [
      dr ? round(dr.provShare) : '',
      dr ? round(dr.confShare) : '',
      dr ? round(dr.payable) : '',
      engCash,
      sheetPay,
      diff,
      matchLabel(diff, 300),
    ];

    dlDataRows.push([...origValues, ...engineValues]);
  }

  const dlWs = XLSX.utils.aoa_to_sheet([allDlHeaders, ...dlDataRows]);
  setColWidths(dlWs, allDlHeaders);
  applyStyles(dlWs, allDlHeaders.length, dlEngineStartCol, dlDataRows.length);
  addAutoFilter(dlWs, allDlHeaders.length, dlDataRows.length);
  XLSX.utils.book_append_sheet(wb, dlWs, 'Deals');

  // ── Sheet 3: Summary ──
  buildSummarySheet(wb, rmDataRows, dlDataRows, allRmHeaders, allDlHeaders, 't0t1');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const ts = new Date().toISOString().slice(0, 10);
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `T0T1_Comparison_${ts}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════════
//                        T2/T3 COMPARISON
// ═══════════════════════════════════════════════════════════════════
export function exportComparisonT2T3(
  rms: RmT2T3[],
  rawRmRows: Row[],
  rawDlRows: Row[],
) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: RMs ──
  const rmOrigHeaders = getHeaders(rawRmRows);
  const engineCols = [
    'Target',
    'Target Smx',
    'Counted Revenue',
    'Conf+Coll Revenue',
    'Team Incentive',
    'Prov Base',
    'Prov Payable Incentive',
    'Conf Base',
    'Conf Payable Incentive',
    'Self Incentive',
    'Engine FY Payable',
    'Engine FY Cash (80%)',
    'Sheet FY Payable',
    'Diff',
    'Match',
  ];
  const engineStartCol = rmOrigHeaders.length;
  const allRmHeaders = [...rmOrigHeaders, ...engineCols];
  const rmDataRows: unknown[][] = [];

  const rmMap = new Map<string, RmT2T3>();
  for (const rm of rms) rmMap.set(rm.empCode, rm);

  const rawRmByCode = indexByEmpCode(rawRmRows);
  const processedCodes = new Set<string>();

  for (const rawRow of rawRmRows) {
    const code = str(rawRow['Employee Code']);
    if (processedCodes.has(code)) continue;

    const rm = rmMap.get(code);
    const calc: CalcT2T3 | undefined = rm?.calc;
    const allRawForCode = rawRmByCode.get(code) || [rawRow];
    const isPromo = allRawForCode.length > 1 && calc?.blockCalcs && calc.blockCalcs.length > 1;

    if (isPromo && calc?.blockCalcs) {
      for (let bi = 0; bi < allRawForCode.length; bi++) {
        const raw = allRawForCode[bi];
        const origValues = rmOrigHeaders.map((h) => raw[h] ?? '');
        const bc: BlockCalc | undefined = calc.blockCalcs[bi];

        const blockDeals = rm!.blocks?.[bi]?.deals || [];
        const confCollDeals = blockDeals.filter((d) => d.stage === 'Confirmed' || d.stage === 'Collected');
        const countedDeals = blockDeals.filter((d) => d.stage === 'Counted');

        const tier = bc?.tier || '';
        const smxLabel = tier === 'T2' ? '4x' : tier === 'T3' ? '3x' : 'no target';

        const engineValues = [
          bc ? round(bc.teamTarget) : '',
          smxLabel,
          round(countedDeals.reduce((s, d) => s + d.revenue, 0)),
          round(confCollDeals.reduce((s, d) => s + d.revenue, 0)),
          bc ? round(bc.teamPayable) : '-',
          bc ? round(bc.selfProvBase) : '',
          bc ? round(bc.selfProvIncentive) : '',
          bc ? round(bc.selfConfBase) : '',
          bc ? round(bc.selfConfIncentive) : '',
          bc ? round(bc.selfPayable) : '',
          '',
          '',
          '',
          '',
          `Block ${bi + 1}`,
        ];
        rmDataRows.push([...origValues, ...engineValues]);
      }

      const sheetFyPay = round(num(allRawForCode[0]['FY-202627 Final Payable']));
      const engCash = calc ? round(calc.fyCashPayable) : 0;
      const diff = engCash - sheetFyPay;

      const confCollDeals = rm!.deals.filter((d) => d.stage === 'Confirmed' || d.stage === 'Collected');
      const countedDeals = rm!.deals.filter((d) => d.stage === 'Counted');

      const summaryOrig = rmOrigHeaders.map((h) => {
        if (h === 'Employee Code') return code;
        if (h === 'Full Name') return rm?.name || '';
        return '— TOTAL —';
      });
      const summaryEngine = [
        '',
        '',
        round(countedDeals.reduce((s, d) => s + d.revenue, 0)),
        round(confCollDeals.reduce((s, d) => s + d.revenue, 0)),
        calc ? round(calc.teamPayable) : '',
        '',
        calc ? round(calc.selfProvIncentive) : '',
        '',
        calc ? round(calc.selfConfIncentive) : '',
        calc ? round(calc.selfPayable) : '',
        calc ? round(calc.fyPayable) : '',
        engCash,
        sheetFyPay,
        diff,
        matchLabel(diff, 300),
      ];
      rmDataRows.push([...summaryOrig, ...summaryEngine]);
    } else {
      const origValues = rmOrigHeaders.map((h) => rawRow[h] ?? '');
      const sheetFyPay = round(num(rawRow['FY-202627 Final Payable']));
      const engCash = calc ? round(calc.fyCashPayable) : 0;
      const diff = engCash - sheetFyPay;

      const confCollDeals = rm ? rm.deals.filter((d) => d.stage === 'Confirmed' || d.stage === 'Collected') : [];
      const countedDeals = rm ? rm.deals.filter((d) => d.stage === 'Counted') : [];

      const tier = rm?.tier || str(rawRow['Tier']);
      const smxLabel = tier === 'T2' ? '4x' : tier === 'T3' ? '3x' : 'no target';

      const engineValues = [
        calc ? round(calc.teamTarget) : '',
        smxLabel,
        round(countedDeals.reduce((s, d) => s + d.revenue, 0)),
        round(confCollDeals.reduce((s, d) => s + d.revenue, 0)),
        calc ? round(calc.teamPayable) : '-',
        calc ? round(calc.selfProvBase) : '',
        calc ? round(calc.selfProvIncentive) : '',
        calc ? round(calc.selfConfBase) : '',
        calc ? round(calc.selfConfIncentive) : '',
        calc ? round(calc.selfPayable) : '',
        calc ? round(calc.fyPayable) : '',
        engCash,
        sheetFyPay,
        diff,
        matchLabel(diff, 300),
      ];
      rmDataRows.push([...origValues, ...engineValues]);
    }
    processedCodes.add(code);
  }

  const rmWs = XLSX.utils.aoa_to_sheet([allRmHeaders, ...rmDataRows]);
  setColWidths(rmWs, allRmHeaders);
  applyStyles(rmWs, allRmHeaders.length, engineStartCol, rmDataRows.length);
  addAutoFilter(rmWs, allRmHeaders.length, rmDataRows.length);
  XLSX.utils.book_append_sheet(wb, rmWs, 'T2-T3 RMs');

  // ── Sheet 2: Deals ──
  const dlOrigHeaders = getHeaders(rawDlRows);
  const dealEngineCols = [
    'Deal ProvShare',
    'Deal ConfShare',
    'Engine Payable (100%)',
    'Engine Cash (80%)',
    'Sheet Payable',
    'Diff',
    'Match',
  ];
  const dlEngineStartCol = dlOrigHeaders.length;
  const allDlHeaders = [...dlOrigHeaders, ...dealEngineCols];
  const dlDataRows: unknown[][] = [];

  const dealResultMap = new Map<string, DRT2T3>();
  for (const rm of rms) {
    if (!rm.calc?.dealResults) continue;
    for (const dr of rm.calc.dealResults) {
      dealResultMap.set(rm.empCode + '|' + dr.deal.tcfId, dr);
    }
  }

  for (const rawDeal of rawDlRows) {
    const key = rawDealKey(rawDeal);
    const dr = dealResultMap.get(key);

    const origValues = dlOrigHeaders.map((h) => rawDeal[h] ?? '');
    const sheetPay = round(num(rawDeal['Payable']));
    const engCash = dr ? round(dr.cashPayable) : 0;
    const diff = engCash - sheetPay;

    const isTeam = dr ? dr.deal.selfTeam === 'Team' : str(rawDeal['Self/Team']).toLowerCase() === 'team';

    const engineValues = [
      isTeam ? '-' : (dr ? round(dr.provShare) : ''),
      dr ? round(dr.confShare) : '',
      dr ? round(dr.payable) : '',
      engCash,
      sheetPay,
      diff,
      matchLabel(diff, 300),
    ];

    dlDataRows.push([...origValues, ...engineValues]);
  }

  const dlWs = XLSX.utils.aoa_to_sheet([allDlHeaders, ...dlDataRows]);
  setColWidths(dlWs, allDlHeaders);
  applyStyles(dlWs, allDlHeaders.length, dlEngineStartCol, dlDataRows.length);
  addAutoFilter(dlWs, allDlHeaders.length, dlDataRows.length);
  XLSX.utils.book_append_sheet(wb, dlWs, 'Deals');

  // ── Sheet 3: Summary ──
  buildSummarySheet(wb, rmDataRows, dlDataRows, allRmHeaders, allDlHeaders, 't2t3');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const ts = new Date().toISOString().slice(0, 10);
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `T2T3_Comparison_${ts}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════════
//  Summary sheet (shared)
// ═══════════════════════════════════════════════════════════════════
function buildSummarySheet(
  wb: XLSX.WorkBook,
  rmDataRows: unknown[][],
  _dlDataRows: unknown[][],
  allRmHeaders: string[],
  allDlHeaders: string[],
  _tier: 't0t1' | 't2t3',
) {
  const matchIdx = allRmHeaders.indexOf('Match');
  const dlMatchIdx = allDlHeaders.indexOf('Match');

  const rmRows = rmDataRows.filter((r) => {
    const m = String(r[matchIdx] || '');
    return m === 'YES' || m === 'NO';
  });

  const rmTotal = rmRows.length;
  const rmMatch = rmRows.filter((r) => r[matchIdx] === 'YES').length;
  const rmMismatch = rmTotal - rmMatch;

  const dlTotal = _dlDataRows.length;
  const dlMatch = _dlDataRows.filter((r) => r[dlMatchIdx] === 'YES').length;
  const dlMismatch = dlTotal - dlMatch;

  const engCashIdx = allRmHeaders.indexOf('Engine FY Cash (80%)');
  const sheetPayIdx = allRmHeaders.indexOf('Sheet FY Payable');
  const rmNzBoth = rmRows.filter(
    (r) => num(r[engCashIdx]) !== 0 && num(r[sheetPayIdx]) !== 0,
  );
  const rmNzMatch = rmNzBoth.filter((r) => r[matchIdx] === 'YES').length;

  const pct = (n: number, d: number) => (d ? ((n / d) * 100).toFixed(1) : '0');

  const summaryData: unknown[][] = [
    ['Metric', 'Value'],
    [],
    ['— RM Level —', ''],
    ['Total RMs', rmTotal],
    ['Match (±300)', `${rmMatch} / ${rmTotal} (${pct(rmMatch, rmTotal)}%)`],
    ['Mismatch', rmMismatch],
    ['Non-Zero Both Sides', rmNzBoth.length],
    ['Non-Zero Match', `${rmNzMatch} / ${rmNzBoth.length} (${pct(rmNzMatch, rmNzBoth.length)}%)`],
    [],
    ['— Deal Level —', ''],
    ['Total Deals', dlTotal],
    ['Match (±300)', `${dlMatch} / ${dlTotal} (${pct(dlMatch, dlTotal)}%)`],
    ['Mismatch', dlMismatch],
  ];

  const sumWs = XLSX.utils.aoa_to_sheet(summaryData);
  sumWs['!cols'] = [{ wch: 35 }, { wch: 50 }];
  // Style header row
  for (let c = 0; c < 2; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (sumWs[addr]) sumWs[addr].s = HEADER_STYLE;
  }
  XLSX.utils.book_append_sheet(wb, sumWs, 'Summary');
}
