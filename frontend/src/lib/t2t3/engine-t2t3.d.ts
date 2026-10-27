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
  dealCategory: 'TCF' | 'MCF' | 'PNLSHARE';
  projectName: string;
  revenue: number;
  month: string;
  stage: 'Counted' | 'Confirmed' | 'Collected' | 'Not counted';
  type: 'Focus' | 'Non-Focus';
  collection: number | null;
  selfTeam: 'Self' | 'Team';
  sharePct: number;
  isLoggedIn?: boolean;
}

export interface RmBlock {
  tier: string;
  startDate: Date | null;
  endDate: Date | null;
  ytdCost: number;
  deals: Deal[];
}

export interface BlockCalc {
  tier: string;
  teamYtdCost: number;
  teamTarget: number;
  teamMultiplier: number;
  teamBelowPct: number;
  teamAbovePct: number;
  teamCrossed: boolean;
  teamIncentive: number;
  teamBelowAmt: number;
  teamAboveAmt: number;
  teamPayable: number;
  selfProvBase: number;
  selfProvIncentive: number;
  selfConfBase: number;
  selfConfIncentive: number;
  selfPayable: number;
  dealResults: DealResult[];
}

export interface Rm {
  id: string;
  empCode: string;
  name: string;
  tier: 'T2' | 'T3';
  vertical: string;
  salaries: (number | null)[];
  months: number;
  alreadyPaid: number;
  hasPip: boolean;
  ddDate: string;
  backYearPayables: { total: number };
  teamYtdCost: number;
  email: string;
  t2Email: string;
  t3Email: string;
  pnlEmail: string;
  doj: string;
  deals: Deal[];
  calc: Calc;
  blocks?: RmBlock[];
}

export interface DealResult {
  deal: Deal;
  provShare: number;
  confShare: number;
  selfShare: number;
  teamShare: number;
  payable: number;
  payableBeforeShare?: number;
  shareApplied?: boolean;
  whichApplies: 'provisional' | 'confirmed' | 'self' | 'team' | 'none';
  calcNote: string;
  noReason: string;
  cashPayable: number;
  esopPayable: number;
}

export interface Calc {
  teamYtdCost: number;
  teamTarget: number;
  teamMultiplier: number;
  teamBelowPct: number;
  teamAbovePct: number;
  selfProvBase: number;
  selfProvIncentive: number;
  selfConfBase: number;
  selfConfIncentive: number;
  selfPayable: number;
  selfProvDeals: Deal[];
  selfConfDeals: Deal[];
  teamIncentive: number;
  teamConfBase: number;
  teamCrossed: boolean;
  teamPayable: number;
  teamBelowAmt: number;
  teamAboveAmt: number;
  teamAllBase: number;
  teamConfDeals: Deal[];
  dealResults: DealResult[];
  fyPayable: number;
  fyCashPayable: number;
  fyEsopPayable: number;
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
  hasPip: boolean;
  overallScenario:
    | 'no_deals'
    | 'zero_payable'
    | 'negative_due'
    | 'nil_due'
    | 'held_pip'
    | 'positive';
  ddLabel: string;
  ddShort: string;
  coverage: { startLabel: string; endLabel: string; rangeLabel: string } | null;
  fy: { fyStartYear: number; fyLabel: string; fyFull: string; fyAprilLabel: string };
  blockCalcs?: BlockCalc[];
}
