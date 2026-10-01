// Type declarations for engine.js (a verbatim, untyped JS extract — see the note at
// the bottom of that file). This is a companion declaration file: TypeScript picks
// it up automatically for `import ... from './engine.js'` without parsing engine.js
// itself as TypeScript/JSX.
export function fmtINR(n: number | null | undefined): string;
export function fmtINRnoSym(n: number | null | undefined): string;
export function fmtL(n: number): string;
export function escapeHtml(s: unknown): string;
export function validateAndNormalize(
  rmRows: Record<string, unknown>[],
  dlRows: Record<string, unknown>[]
): { rms: Rm[]; issues: Issue[]; joinedCount: number };
export function calculateIncentive(rm: Rm): Calc;
export function generateEmailHtml(rm: Rm): { emailHtml: string; subject: string; preheader: string };
export function generatePlainText(rm: Rm): string;

export interface Issue {
  level: 'err' | 'warn';
  loc: string;
  msg: string;
}

export interface Deal {
  tcfId: string;
  tcfLinkId: string | null;
  projectName: string;
  revenue: number;
  month: string;
  stage: 'Counted' | 'Confirmed' | 'Collected' | 'Not counted';
  type: 'Focus' | 'Non-Focus';
  collection: number | null;
  selfTeam: 'Self' | 'Team';
  sharePct: number;
}

export interface Rm {
  id: string;
  empCode: string;
  name: string;
  tier: string;
  vertical: string;
  salaries: (number | null)[];
  months: number;
  alreadyPaid: number;
  hasCrm: boolean;
  ddDate: string;
  backYearPayables: { total: number };
  deals: Deal[];
  calc: Calc;
}

export interface DealResult {
  deal: Deal;
  provShare: number;
  confShare: number;
  payable: number;
  payableBeforeShare?: number;
  shareApplied?: boolean;
  whichApplies: 'provisional' | 'confirmed' | 'none';
  calcNote: string;
  noReason: string;
  cashPayable: number;
  esopPayable: number;
}

export interface Calc {
  ytdCost: number;
  eligibilityTarget: number;
  provBase: number;
  provCrossed: boolean;
  provIncentive: number;
  confBase: number;
  confCrossed: boolean;
  confIncentive: number;
  dealResults: DealResult[];
  fy27Payable: number;
  fy27CashPayable: number;
  fy27EsopPayable: number;
  backYear: { total: number };
  cumulativeCash: number;
  totalPayable: number;
  alreadyPaid: number;
  due: number;
  dueForRelease: number;
  cash: number;
  equity: number;
  totalIncentiveOverall: number;
  totalEsopOverall: number;
  hasCrm: boolean;
  overallScenario:
    | 'no_deals'
    | 'below_target'
    | 'zero_payable'
    | 'negative_due'
    | 'nil_due'
    | 'held_no_crm'
    | 'provisional_only'
    | 'positive';
  ddLabel: string;
  ddShort: string;
  coverage: { startLabel: string; endLabel: string; rangeLabel: string } | null;
  salaryConstant: boolean;
}
