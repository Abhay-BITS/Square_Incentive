// Verbatim extract (lines 1358-2646) from Incentive_PDF_Tool.html - the calculation
// engine and email/PDF template generator. See the note at the bottom of this file.

const SALARY_MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const MONTH_NAMES = { Apr:'April', May:'May', Jun:'June', Jul:'July', Aug:'August', Sep:'September', Oct:'October', Nov:'November', Dec:'December', Jan:'January', Feb:'February', Mar:'March' };
const MONTH_NUM = { Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12, Jan:1, Feb:2, Mar:3 };

// ---------- Utilities ----------
function fmtINR(n) {
  if (n === null || n === undefined || isNaN(n)) return '₹0';
  n = Math.round(n);
  const neg = n < 0;
  const abs = Math.abs(n);
  const s = abs.toString();
  let out = '';
  if (s.length > 3) {
    out = s.slice(-3);
    let rem = s.slice(0, -3);
    while (rem.length > 2) { out = rem.slice(-2) + ',' + out; rem = rem.slice(0, -2); }
    if (rem.length) out = rem + ',' + out;
  } else out = s;
  return (neg ? '-₹' : '₹') + out;
}
function fmtINRnoSym(n) { return fmtINR(n).replace('₹',''); }
function fmtL(n) {
  const inLakh = n / 100000;
  if (inLakh >= 100) return '₹' + (inLakh/100).toFixed(2).replace(/\.?0+$/,'') + 'Cr';
  if (inLakh >= 1) return '₹' + inLakh.toFixed(2).replace(/\.?0+$/,'') + 'L';
  return fmtINR(n);
}
function normStage(s) {
  if (!s) return null;
  // Normalize both legacy naming (Counted/Collected/Confirmed) and My Incentive dashboard naming (Logged In (Count)/Collected (Count)/Confirmed (Count))
  // Strip parenthetical suffix "(Count)" or "(count)" first
  const stripped = String(s).trim().replace(/\s*\(\s*count\s*\)\s*$/i, '').trim();
  const v = stripped.toLowerCase();
  // Logged In (Count) -> Counted
  if (v === 'logged in' || v === 'loggedin' || v === 'logged-in') return 'Counted';
  if (v === 'counted') return 'Counted';
  if (v === 'confirmed' || v === 'confirm') return 'Confirmed';
  if (v === 'collected' || v === 'collect') return 'Collected';
  if (v === 'not counted' || v === 'notcounted' || v === 'not-counted' || v === 'reversed') return 'Not counted';
  return null;
}
function normType(s) {
  if (!s) return null;
  const v = String(s).trim().toLowerCase();
  if (v === 'focus') return 'Focus';
  if (v === 'non-focus' || v === 'nonfocus' || v === 'non focus') return 'Non-Focus';
  return null;
}
function normMonth(s) {
  if (!s) return null;
  const v = String(s).trim();
  // Try match against 3-letter month abbrev
  const match = SALARY_MONTHS.find(m => m.toLowerCase() === v.toLowerCase() || MONTH_NAMES[m].toLowerCase() === v.toLowerCase());
  return match || null;
}
function normYesNo(s) {
  if (s === true) return true;
  if (s === false) return false;
  const v = String(s || '').trim().toLowerCase();
  return v === 'yes' || v === 'y' || v === 'true' || v === '1';
}
function fmtDate(v) {
  if (!v) return '';
  let d;
  if (v instanceof Date) d = v;
  else if (typeof v === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    d = new Date(excelEpoch.getTime() + v * 86400000);
  } else d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toISOString().slice(0, 10);
}
function ddMonthLabel(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
function ddMonthShort(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', { month: 'long' }) + d.getFullYear();
}
function computeCoveredRange(ddDateStr, monthsElapsed) {
  const d = new Date(ddDateStr);
  if (isNaN(d.getTime())) return null;
  let endM = d.getMonth() - 1; let endY = d.getFullYear();
  if (endM < 0) { endM = 11; endY--; }
  let startM = endM - (monthsElapsed - 1); let startY = endY;
  while (startM < 0) { startM += 12; startY--; }
  const NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return {
    startLabel: NAMES[startM] + ' ' + startY,
    endLabel: NAMES[endM] + ' ' + endY,
    rangeLabel: NAMES[startM] + ' to ' + NAMES[endM] + ' ' + endY + (startY !== endY ? ' (across ' + startY + '-' + endY + ')' : ''),
    startM, startY, endM, endY,
  };
}
function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function toast(msg, type) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

// ---------- Excel ----------
async function parseExcel(file) {
  const arr = await file.arrayBuffer();
  const wb = XLSX.read(arr, { type: 'array', cellDates: true });
  const rmSheet = findSheet(wb, ['rms','rm','reps','employees']);
  const dlSheet = findSheet(wb, ['deals','deal']);
  if (!rmSheet) throw new Error('No sheet named "RMs" found.');
  if (!dlSheet) throw new Error('No sheet named "Deals" found.');
  const rmRows = XLSX.utils.sheet_to_json(wb.Sheets[rmSheet], { defval: null, raw: true });
  const dlRows = XLSX.utils.sheet_to_json(wb.Sheets[dlSheet], { defval: null, raw: true });
  return { rmRows, dlRows };
}
function findSheet(wb, cands) {
  for (const n of wb.SheetNames) if (cands.includes(n.trim().toLowerCase())) return n;
  return null;
}
function pick(row, ...keys) {
  const map = {};
  for (const k of Object.keys(row)) map[k.trim().toLowerCase()] = row[k];
  for (const k of keys) {
    const v = map[k.toLowerCase()];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
}

// ---------- Validation ----------
function validateAndNormalize(rmRows, dlRows) {
  const issues = [];
  const rms = [];
  const rmMap = {};

  rmRows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const empCode = pick(r, 'Employee Code','Emp Code','EmpCode','Code');
    const name = pick(r, 'Full Name','Name');
    const tier = pick(r, 'Tier');
    const vertical = pick(r, 'Vertical') || 'Primary Sales';
    const months = pick(r, 'Months Elapsed','Months');
    const alreadyPaid = pick(r, 'Total Already Paid','Already Paid YTD','Already Paid');
    const hasCrmRaw = pick(r, 'Has CRM Approved Deal','CRM Deal','CRM');
    const ddDate = pick(r, 'Dollar Day Date','DD Date','Dollar Day');
    // New v10 fields
    const priorPayable = pick(r, 'Prior Period Final Payable','Prior Period Payable','Back Payable FY24');

    const salaries = SALARY_MONTHS.map(m => {
      const v = pick(r, 'Salary ' + m, m + ' Salary', m);
      return v === null || v === '' ? null : Number(v);
    });

    if (!empCode) { issues.push({level:'err',loc:'RMs row '+rowNum,msg:'Missing Employee Code (primary key).'}); return; }
    if (rmMap[empCode]) { issues.push({level:'err',loc:'RMs row '+rowNum,msg:'Duplicate Employee Code "'+empCode+'".'}); return; }
    if (!name) issues.push({level:'err',loc:empCode,msg:'Missing Full Name.'});
    if (!tier || !['T0','T1'].includes(String(tier).trim().toUpperCase())) issues.push({level:'err',loc:empCode,msg:'Tier must be T0 or T1 (got "'+tier+'").'});

    const mN = Number(months);
    if (isNaN(mN) || mN < 1 || mN > 12) issues.push({level:'err',loc:empCode,msg:'Months Elapsed must be 1-12 (got "'+months+'").'});
    const validMonths = Math.max(1, Math.min(12, mN || 1));
    for (let i = 0; i < validMonths; i++) {
      const s = salaries[i];
      if (s === null || isNaN(s) || s <= 0) issues.push({level:'err',loc:empCode,msg:'Salary '+SALARY_MONTHS[i]+' missing or invalid - must be filled for elapsed months.'});
    }
    for (let i = validMonths; i < 12; i++) {
      if (salaries[i] !== null && !isNaN(salaries[i])) issues.push({level:'warn',loc:empCode,msg:'Salary '+SALARY_MONTHS[i]+' provided but only '+validMonths+' months elapsed - will be ignored.'});
    }

    const apN = Number(alreadyPaid);
    if (alreadyPaid !== null && (isNaN(apN) || apN < 0)) issues.push({level:'warn',loc:empCode,msg:'Total Already Paid treated as 0.'});
    if (hasCrmRaw === null) issues.push({level:'warn',loc:empCode,msg:'CRM field missing, defaulting to No.'});
    if (!ddDate) issues.push({level:'err',loc:empCode,msg:'Dollar Day Date missing.'});

    // Parse back-year payables (default 0 if missing)
    const parseBack = (v) => {
      if (v === null || v === '') return 0;
      const n = Number(v);
      return (isNaN(n) || n < 0) ? 0 : n;
    };
    const backYearPayables = { total: parseBack(priorPayable) };

    const rm = {
      id: String(empCode),
      empCode: String(empCode),
      name: String(name || 'Unknown'),
      tier: String(tier || 'T1').trim().toUpperCase(),
      vertical: String(vertical),
      salaries,
      months: validMonths,
      alreadyPaid: Math.max(0, apN || 0),   // now: total already paid across ALL periods
      hasCrm: normYesNo(hasCrmRaw),
      ddDate: fmtDate(ddDate),
      backYearPayables,                      // {fy24, h1FY26, h2FY26, total}
      deals: [],
    };
    rmMap[rm.empCode] = rm;
    rms.push(rm);
  });

  let joinedCount = 0;
  dlRows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const rmId = pick(r, 'Employee Code','Emp Code','RM ID','RMID');
    const tcfId = pick(r, 'TCF ID','TCFID','Deal ID','ID');
    const projectName = pick(r, 'Project Name','Deal Name','Project','Name') || '';
    const revenue = pick(r, 'Revenue','Amount');
    const dealMonth = pick(r, 'Deal Month','Month');
    const stageRaw = pick(r, 'Stage');
    const typeRaw = pick(r, 'Type');
    const collectionRaw = pick(r, 'Collection %','Collection','Coll %');
    const selfTeamRaw = pick(r, 'Self/Team','SelfTeam','Team Split','Team');
    const sharePctRaw = pick(r, 'Share Percentage','Share %','Share');

    if (!rmId) { issues.push({level:'err',loc:'Deals row '+rowNum,msg:'Missing Employee Code.'}); return; }
    if (!rmMap[rmId]) { issues.push({level:'err',loc:'Deals row '+rowNum,msg:'Orphan deal - Employee Code "'+rmId+'" not found.'}); return; }
    const rev = Number(revenue);
    if (isNaN(rev) || rev <= 0) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Revenue invalid.'}); return; }
    const stage = normStage(stageRaw);
    const type = normType(typeRaw);
    const month = normMonth(dealMonth);
    if (!stage) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Stage must be Counted/Logged In, Confirmed, or Collected (with or without "(Count)" suffix).'}); return; }
    if (!type) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Type must be Focus or Non-Focus.'}); return; }
    if (!month) issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Deal Month missing or invalid - will show as "-" in the PDF.'});

    let collection = null;
    if (stage === 'Confirmed') {
      // Confirmed accepts 0-99. If input is 100 → suggest Collected instead. If missing/invalid → 0.
      const c = Number(collectionRaw);
      if (collectionRaw === null || collectionRaw === '' || isNaN(c)) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed deal has no Collection %; treated as 0%.'});
        collection = 0;
      } else if (c === 100) {
        issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed at 100% - use Collected stage instead.'}); return;
      } else if (c < 0 || c > 99) {
        issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed needs Collection 0-99 (use Collected for 100%).'}); return;
      } else {
        collection = c;
      }
    } else if (stage === 'Collected') {
      // Collected is always 100%. Any other input silently forced to 100 (no warning - it's expected).
      collection = 100;
    } else if (stage === 'Counted') {
      // Counted: 0% (or missing) is OK. Any positive value → warning (stage should probably be Confirmed).
      const c = Number(collectionRaw);
      if (collectionRaw !== null && collectionRaw !== '' && !isNaN(c) && c > 0) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Counted deal has Collection ' + c + '% - should this be Confirmed instead?'});
      }
      collection = 0;
    }

    // Normalize Self/Team (default Self if blank)
    let selfTeam = 'Self';
    if (selfTeamRaw !== null && selfTeamRaw !== '') {
      const v = String(selfTeamRaw).trim().toLowerCase();
      if (v === 'team' || v === 't') selfTeam = 'Team';
      else if (v === 'self' || v === 's' || v === '') selfTeam = 'Self';
      else {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Self/Team value "'+selfTeamRaw+'" not recognized; defaulting to Self.'});
      }
    }
    // Normalize Share Percentage (default 100 if blank)
    let sharePct = 100;
    if (sharePctRaw !== null && sharePctRaw !== '') {
      const s = Number(sharePctRaw);
      if (isNaN(s) || s < 0 || s > 100) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Share Percentage "'+sharePctRaw+'" invalid; defaulting to 100.'});
      } else {
        sharePct = s;
      }
    }

    rmMap[rmId].deals.push({
      tcfId: String(tcfId || 'TCF-' + (rmMap[rmId].deals.length + 1)),
      projectName: String(projectName || ''),
      revenue: rev,
      month: month || '',
      stage, type, collection,
      selfTeam,             // 'Self' or 'Team'
      sharePct,             // 0-100 (default 100)
    });
    joinedCount++;
  });

  return { rms, issues, joinedCount };
}

// ---------- Calc ----------
function calculateIncentive(rm) {
  const ytdCost = rm.salaries.slice(0, rm.months).reduce((s, v) => s + (v || 0), 0);
  const eligibilityTarget = 5 * ytdCost;

  // Team deals are EXCLUDED from Provisional and Confirmed bases (RM earns no incentive on team deals)
  const provBase = rm.deals.filter(d => d.stage !== 'Not counted' && d.selfTeam !== 'Team').reduce((s, d) => s + d.revenue, 0);
  const provCrossed = provBase >= eligibilityTarget && provBase > 0;
  const provIncentive = provCrossed ? 0.05 * eligibilityTarget + 0.40 * (provBase - eligibilityTarget) : 0;

  const confDeals = rm.deals.filter(d => (d.stage === 'Confirmed' || d.stage === 'Collected') && d.selfTeam !== 'Team');
  const confBase = confDeals.reduce((s, d) => s + d.revenue, 0);
  const confCrossed = confBase >= eligibilityTarget && confBase > 0;
  const confIncentive = confCrossed ? 0.05 * eligibilityTarget + 0.40 * (confBase - eligibilityTarget) : 0;

  const dealResults = rm.deals.map(d => {
    // Not counted deals: skip base share calc entirely
    if (d.stage === 'Not counted') {
      return { deal: d, provShare: 0, confShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'Not counted deal' };
    }
    // Team deals: RM earns no incentive on team deals (they don't contribute to base and get zero payable)
    if (d.selfTeam === 'Team') {
      return { deal: d, provShare: 0, confShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'Team deal — no incentive' };
    }
    // Every counted/confirmed/collected deal gets a Provisional Deal Incentive Share
    const provShare = provBase > 0 ? provIncentive * (d.revenue / provBase) : 0;
    // Confirmed Share only for Confirmed / Collected deals
    const confShare = (d.stage !== 'Counted' && confBase > 0) ? confIncentive * (d.revenue / confBase) : 0;

    // Determine which incentive applies and, if none, WHY none
    let whichApplies, payable = 0, calcNote = '', noReason = '';
    if (d.stage === 'Counted') {
      if (d.type === 'Focus' && provIncentive > 0) {
        whichApplies = 'provisional';
        payable = 0.25 * provShare;
        calcNote = '25% × ' + fmtINR(provShare);
      } else if (d.type === 'Non-Focus' && provIncentive > 0) {
        whichApplies = 'none';
        noReason = 'Non-focus project';
      } else {
        // provIncentive === 0
        whichApplies = 'none';
        noReason = 'Below eligibility target';
      }
    } else {
      // Confirmed or Collected
      if (confIncentive > 0) {
        whichApplies = 'confirmed';
        const rawPct = d.collection / 100;
        const pct = Math.max(0.5, rawPct);
        payable = pct * confShare;
        calcNote = (pct * 100).toFixed(0) + '%' + (rawPct < 0.5 ? ' (floor)' : '') + ' × ' + fmtINR(confShare);
      } else if (d.type === 'Focus' && provIncentive > 0) {
        // Fallback: Focus Confirmed/Collected → Provisional 25% path
        whichApplies = 'provisional';
        payable = 0.25 * provShare;
        calcNote = '25% × ' + fmtINR(provShare);
      } else if (d.type === 'Non-Focus' && provIncentive > 0) {
        whichApplies = 'none';
        noReason = 'Non-focus project';
      } else {
        // Both sides didn't cross
        whichApplies = 'none';
        noReason = 'Below eligibility target';
      }
    }
    // Apply Share Percentage - if the RM has a partial share of the deal,
    // scale their payable proportionally. sharePct is 0-100; default 100 = full share.
    let payableBeforeShare = payable;
    let shareApplied = false;
    if (d.sharePct !== undefined && d.sharePct !== null && d.sharePct !== 100 && payable > 0) {
      payable = payable * (d.sharePct / 100);
      shareApplied = true;
      if (calcNote) {
        calcNote = calcNote + ' × ' + d.sharePct + '% (share)';
      }
    }
    return { deal: d, provShare, confShare, payable, payableBeforeShare, shareApplied, whichApplies, calcNote, noReason };
  });

  // FY27 payable (from April'26 deals) - this is what our tool actually computes
  // Split per-deal payable into cash (80%) and ESOP (20%). The dealResults are now
  // enriched with .cashPayable and .esopPayable fields so the per-deal table shows both.
  dealResults.forEach(dr => {
    dr.cashPayable = 0.80 * dr.payable;
    dr.esopPayable = 0.20 * dr.payable;
  });
  // FY27 Payable = total per-deal payable (this is the FY27 TOTAL, cash+ESOP)
  const fy27Payable = dealResults.reduce((s, dr) => s + dr.payable, 0);
  // FY27 Cash Payable = 80% of FY27 payable (the ONLY portion that flows into Due Incentive)
  const fy27CashPayable = 0.80 * fy27Payable;
  const fy27EsopPayable = 0.20 * fy27Payable;
  // Prior period payable = pure cash (My Incentive page numbers are cash-only)
  const backYear = rm.backYearPayables || {total:0};
  const backYearTotal = backYear.total;
  // Cumulative Cash Payable = FY27 Cash + Prior Cash
  const cumulativeCash = fy27CashPayable + backYearTotal;
  // Kept for backward compat with rendering fallbacks (Cumulative total including ESOP)
  const totalPayable = fy27Payable + backYearTotal;
  // Due = Cumulative Cash - Total Already Paid (My Incentive numbers are cash-only)
  const due = cumulativeCash - rm.alreadyPaid;
  const dueForRelease = rm.hasCrm && due > 0 ? due : 0;
  // 'cash' now = the cash-only Due (Due itself already represents cash). 'esop' comes from FY27 only.
  const cash = dueForRelease;  // Due is cash-only by construction
  const equity = 0;            // legacy field, kept as 0 - no ESOP in Due
  // Reverse-calculated Total ESOP for top-level summary
  // Total Cash Incentive = FY27 Cash + Prior Cash = cumulativeCash
  // Total Incentive = cumulativeCash / 0.80
  // Total ESOP = Total Incentive * 0.20 = cumulativeCash * 0.25
  const totalIncentiveOverall = cumulativeCash / 0.80;
  const totalEsopOverall = cumulativeCash * 0.25;

  let overallScenario;
  if (rm.deals.length === 0 && backYearTotal === 0) overallScenario = 'no_deals';
  else if (rm.deals.length > 0 && provIncentive === 0 && confIncentive === 0 && backYearTotal === 0) overallScenario = 'below_target';
  else if (totalPayable === 0) overallScenario = 'zero_payable';
  else if (due < 0) overallScenario = 'negative_due';
  else if (due === 0) overallScenario = 'nil_due';
  else if (!rm.hasCrm) overallScenario = 'held_no_crm';
  else if (provIncentive > 0 && confIncentive === 0) overallScenario = 'provisional_only';
  else overallScenario = 'positive';

  const coverage = computeCoveredRange(rm.ddDate, rm.months);
  const uniqueSalaries = new Set(rm.salaries.slice(0, rm.months));
  const salaryConstant = uniqueSalaries.size === 1;

  return {
    ytdCost, eligibilityTarget,
    provBase, provCrossed, provIncentive,
    confBase, confCrossed, confIncentive,
    dealResults,
    fy27Payable,           // FY27 total per-deal payable (cash+ESOP)
    fy27CashPayable,       // FY27 cash portion (80% of fy27Payable) - flows into Due
    fy27EsopPayable,       // FY27 ESOP portion (20% of fy27Payable)
    backYear,              // {total} - prior period cash payable
    cumulativeCash,        // FY27 cash + Prior cash
    totalPayable,          // legacy: FY27 (cash+ESOP) + prior cash
    alreadyPaid: rm.alreadyPaid,
    due, dueForRelease, cash, equity,
    totalIncentiveOverall, // reverse-calc: cumulativeCash / 0.80
    totalEsopOverall,      // reverse-calc: cumulativeCash * 0.25
    hasCrm: rm.hasCrm,
    overallScenario,
    ddLabel: ddMonthLabel(rm.ddDate),
    ddShort: ddMonthShort(rm.ddDate),
    coverage,
    salaryConstant,
  };
}
// ============================================================
// PDF/EMAIL TEMPLATE v3 - structured, bulleted, Priya-example style
// ============================================================
function generateEmailSubject(rm, c) {
  const m = c.ddLabel || 'this cycle';
  if (c.overallScenario === 'positive' || c.overallScenario === 'provisional_only') return 'Your ' + m + ' Dollar Day incentive: ' + fmtINR(c.dueForRelease);
  if (c.overallScenario === 'held_no_crm') return 'Your ' + m + ' Dollar Day incentive (held for CRM approval)';
  return 'Your ' + m + ' Dollar Day breakdown';
}
function generateEmailPreheader(rm, c) {
  if (c.overallScenario === 'positive' || c.overallScenario === 'provisional_only') return 'Your ' + c.ddLabel + ' Dollar Day calculation, step by step.';
  if (c.overallScenario === 'held_no_crm') return 'Calculated but pending CRM release.';
  return 'Your ' + c.ddLabel + ' Dollar Day breakdown.';
}

function generateEmailHtml(rm) {
  const c = rm.calc;
  const first = rm.name.split(' ')[0] || rm.name;
  const month = c.ddLabel || 'this cycle';
  const range = c.coverage ? c.coverage.rangeLabel : '';

  const T = {
    NAVY: '#0F1738', NAVY_SOFT: '#F4F5F9',
    BORDER: '#E2E8F0', BORDER_STRONG: '#CBD5E1',
    INK: '#1F2A44', INK_SOFT: '#475569', MUTED: '#64748B',
    GREEN: '#16A34A', GREEN_DEEP: '#166534', GREEN_SOFT: '#D1FAE5',
    ORANGE: '#E08A2B', ORANGE_DEEP: '#B45309', AMBER_SOFT: '#FEF3C7',
    RED: '#DC2626', RED_DEEP: '#B02E2E', RED_SOFT: '#FEE2E2',
    BG: '#F4F5F7', GOLD: '#FDB744',
    FONT: "'Inter','Helvetica Neue',Arial,sans-serif",
    MONO: "'JetBrains Mono','Menlo','Consolas',monospace",
  };

  const heroConf = getHeroConf(rm, c, T, month);

  return {
    emailHtml: buildFullEmail(rm, c, first, month, range, heroConf, T),
    subject: generateEmailSubject(rm, c),
    preheader: generateEmailPreheader(rm, c),
  };
}

function getHeroConf(rm, c, T, month) {
  const monthUp = month.toUpperCase();
  // Hero shows Total Incentive with 80/20 Cash+ESOP breakdown. Cash = Due (cash-only). ESOP reverse-calc'd.
  if (c.overallScenario === 'positive' || c.overallScenario === 'provisional_only') {
    // Hero shows Total Incentive for this cycle = Due (cash) + reverse-calc'd ESOP
    // Total Incentive = cash_due / 0.80 ; ESOP portion = cash_due * 0.25
    const cashDue = c.dueForRelease;
    const esopForDue = cashDue * 0.25;
    const totalForCycle = cashDue + esopForDue;
    return {
      bg: T.GREEN_SOFT, border: T.GREEN,
      label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE',
      big: fmtINRnoSym(totalForCycle),
      formula: fmtINR(totalForCycle) + ' = ' + fmtINR(cashDue) + ' (Cash to bank, 80%) + ' + fmtINR(esopForDue) + ' (ESOP, 20%)',
    };
  }
  if (c.overallScenario === 'held_no_crm') {
    return {
      bg: T.AMBER_SOFT, border: T.ORANGE,
      label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE',
      big: '0',
      formula: '₹0 disbursed this Dollar Day. See Step 6 for the held amount.',
    };
  }
  if (c.overallScenario === 'below_target') {
    return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE', big: '0', formula: 'Cumulative revenue is below the eligibility target this cycle.' };
  }
  if (c.overallScenario === 'negative_due') {
    return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'NO DISBURSEMENT THIS CYCLE', big: '0', formula: 'Cumulative Payable is less than Already Paid - no clawback.' };
  }
  if (c.overallScenario === 'nil_due') {
    return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'NO DISBURSEMENT THIS CYCLE', big: '0', formula: 'Cumulative Payable exactly matches Already Paid.' };
  }
  if (c.overallScenario === 'zero_payable') {
    return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE', big: '0', formula: 'None of your deals produced a payable amount this cycle.' };
  }
  if (c.overallScenario === 'no_deals') {
    return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE', big: '0', formula: 'No deals in the eligibility window this cycle.' };
  }
  return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE', big: '0', formula: '' };
}
function buildFullEmail(rm, c, first, month, rangeLabel, hero, T) {

  // ============ Helpers ============
  const sectionH = (num, title) => `
    <tr><td class="pdf-section-start" style="padding: 24px 0 8px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td style="background: ${T.NAVY}; color: white; font-family: ${T.MONO}; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 3px; letter-spacing: 0.3px;">STEP ${num}</td>
          <td style="padding-left: 10px; font-family: ${T.FONT}; font-size: 15.5px; font-weight: 700; color: ${T.NAVY};">${title}</td>
        </tr>
      </table>
    </td></tr>`;

  const bulletList = (items) => {
    let rows = '';
    items.forEach(item => {
      rows += `<tr>
        <td valign="top" style="width: 14px; padding: 3px 0 0 0; font-family: ${T.FONT}; font-size: 14px; color: ${T.NAVY}; line-height: 1.5;">\u2022</td>
        <td style="padding: 3px 0 3px 4px; font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55;">${item}</td>
      </tr>`;
    });
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 4px 0;">${rows}</table>`;
  };

  // Two-block period header:
  // Block A (gold) - Prior Periods with final payables (only if any exist)
  // Block B (navy) - April 2026 Onwards intro that leads into Steps 1-7
  const buildPriorPeriodsCard = (c, T) => {
    if (!c.backYear || c.backYear.total <= 0) return '';
    // Single number only - no year-by-year breakdown
    return `
      <tr><td style="padding: 18px 28px 0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.ORANGE_DEEP}; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 16px 20px; background: #FFFBEB; border-bottom: 2px solid ${T.ORANGE_DEEP};">
              <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.ORANGE_DEEP}; line-height: 1.25;">Prior Period · Before April 2026</div>
              <p style="font-family: ${T.FONT}; font-size: 12.5px; color: ${T.INK_SOFT}; line-height: 1.55; margin: 6px 0 0 0;">Final incentive payable, calculated under the earlier rules.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 20px; background: white;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td style="font-family: ${T.FONT}; font-size: 13.5px; font-weight: 700; color: ${T.INK}; line-height: 1.55;">Final Incentive Payable</td>
                  <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right; line-height: 1.2;">${fmtINR(c.backYear.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>`;
  };

  // buildFY27Block wraps Steps 1-4 in a strong navy-bordered container with a header bar
  // and a FY27 subtotal footer. Called with the pre-rendered stepsHtml for steps 1-4.
  const buildFY27Block = (c, rangeLabel, T, stepsInsideHtml) => {
    const hasPrior = c.backYear && c.backYear.total > 0;
    // FY27 block is always rendered as a proper labelled card (it's the primary focus).
    // Only difference: if hasPrior, we render alongside a Prior Period card below.
    // (No change in structure - kept for possible future divergence)
    // With prior periods: wrap steps 1-4 in a strong navy container with header + footer
    return `
      <tr><td style="padding: 18px 28px 0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.NAVY}; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 16px 20px; background: ${T.NAVY_SOFT}; border-bottom: 2px solid ${T.NAVY};">
              <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.NAVY}; line-height: 1.25;">April 2026 Onwards \u00B7 FY27</div>
              <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 6px 0 0 0;">YTD Salary Cost and deals from <strong>${rangeLabel}</strong> considered. Full calculation breakdown below.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 22px; background: white;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                ${stepsInsideHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 22px; background: #F8FAFC; border-top: 2px solid ${T.NAVY_SOFT};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; color: ${T.MUTED}; letter-spacing: 0.6px; text-transform: uppercase;">FY27 Payable this cycle</td>
                  <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.fy27Payable)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>`;
  };

  // Slab visual - matches reference: vertical divider at target boundary,
  // Rs.0 label at left, brackets under each section with calculation inside.
  // ALWAYS shows both 5% and 40% panels for consistency even if excess = 0.
  const slabVisual = (targetAmt, revenueAmt, incentiveAmt, incentiveLabel) => {
    // Three-state slab: crosses, at_target, below_target
    // Always draws both 5% and 40% panels for consistency; only colors + revenue marker vary.
    const fivePct = 0.05 * targetAmt;
    const excess = Math.max(0, revenueAmt - targetAmt);
    const fortyPct = 0.40 * excess;
    let targetWidth, excessWidth, state;
    if (revenueAmt > targetAmt) {
      state = 'crosses';
      const tp = Math.round(100 * targetAmt / revenueAmt);
      targetWidth = Math.min(70, Math.max(25, tp));
      excessWidth = 100 - targetWidth;
    } else if (revenueAmt === targetAmt && revenueAmt > 0) {
      state = 'at_target';
      targetWidth = 55; excessWidth = 45;
    } else {
      state = 'below_target';
      targetWidth = 60; excessWidth = 40;
    }

    // Color palettes per state
    const MUTED_BG = '#F1F5F9';
    const MUTED_BG2 = '#F8FAFC';
    const MUTED_BORDER = '#CBD5E1';
    const MUTED_TEXT = '#94A3B8';

    // Panel styling
    const leftActive = (state !== 'below_target');
    const rightActive = (state === 'crosses');

    const leftBg = leftActive ? T.GREEN_SOFT : MUTED_BG;
    const leftBorder = leftActive ? T.GREEN : MUTED_BORDER;
    const leftTextColor = leftActive ? T.GREEN_DEEP : MUTED_TEXT;
    const leftDivider = (state === 'crosses') ? '2.5px solid ' + T.ORANGE : '2.5px solid ' + (rightActive ? T.ORANGE : MUTED_BORDER);

    const rightBg = rightActive ? T.AMBER_SOFT : MUTED_BG2;
    const rightBorder = rightActive ? T.ORANGE : MUTED_BORDER;
    const rightTextColor = rightActive ? T.ORANGE_DEEP : MUTED_TEXT;

    // Revenue label (top-right) - hide for below_target since we show a marker instead
    const revenueTopLabel = (state !== 'below_target')
      ? `<td width="${excessWidth}%" style="padding: 0 0 4px 0; font-family: ${T.FONT}; font-size: 10.5px; color: ${T.GREEN_DEEP}; font-weight: 700; letter-spacing: 0.5px; text-align: right; white-space: nowrap;">REVENUE \u00B7 ${fmtL(revenueAmt)}</td>`
      : `<td width="${excessWidth}%" style="padding: 0 0 4px 0;">&nbsp;</td>`;

    // For below_target: build a revenue marker line inside the 5% zone using a spacer + marker table
    // Extra vertical clearance so revenue pill sits well ABOVE the target label
    let revenueMarkerRow = '';
    let extraTopPad = '';
    if (state === 'below_target') {
      const markerPos = targetAmt > 0 ? (revenueAmt / targetAmt) * targetWidth : 0;  // % of total width
      const leftGap = markerPos;
      const rightGap = 100 - markerPos;
      extraTopPad = 'padding-top: 28px;';  // room for the pill above the target label
      revenueMarkerRow = `
        <tr>
          <td colspan="2" style="padding: 0 0 6px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td width="${leftGap}%" style="padding: 0;">&nbsp;</td>
                <td width="0%" style="padding: 0; white-space: nowrap; vertical-align: bottom;">
                  <div style="display: inline-block; background: ${T.RED}; color: white; padding: 3px 8px; border-radius: 3px; font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.3px; transform: translateX(-50%); white-space: nowrap;">REVENUE \u00B7 ${fmtL(revenueAmt)}</div>
                </td>
                <td width="${rightGap}%" style="padding: 0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>`;
    }

    // Left panel content: "5%" text, muted if below_target
    const leftBarContent = `<td width="${targetWidth}%" style="background: ${leftBg}; border: 1.5px solid ${leftBorder}; border-right: ${leftDivider}; text-align: center; font-family: ${T.FONT}; font-size: 20px; font-weight: 700; color: ${leftTextColor}; height: 46px; vertical-align: middle; position: relative;">5%</td>`;
    const rightBarContent = `<td width="${excessWidth}%" style="background: ${rightBg}; border: 1.5px solid ${rightBorder}; border-left: none; text-align: center; font-family: ${T.FONT}; font-size: 20px; font-weight: 700; color: ${rightTextColor}; height: 46px; vertical-align: middle;">40%</td>`;

    // Bottom pill: normal for A/B, muted for C
    const pillBg = (state === 'below_target') ? MUTED_BG : '#EFF4FA';
    const pillBorder = (state === 'below_target') ? MUTED_BORDER : T.NAVY;
    const pillColor = (state === 'below_target') ? T.INK_SOFT : T.NAVY;
    const pillContent = (state === 'below_target')
      ? `${incentiveLabel} = \u20B90 <span style="font-family: ${T.FONT}; font-weight: 500; font-style: italic; font-size: 12px; color: ${T.MUTED};">\u00B7 revenue below target</span>`
      : `${incentiveLabel} = ${fmtINR(fivePct)} + ${fmtINR(fortyPct)} = ${fmtINR(incentiveAmt)}`;

    // For below_target, wrap the whole slab in a position:relative container and add a dashed
    // vertical line at markerPos% that starts just below the pill and extends through the bar.
    // Rough vertical layout: pill row ~28px, labels ~18px, bar 46px. Line spans ~26px to ~100px.
    const dashedLineDiv = state === 'below_target'
      ? `<div style="position: absolute; left: ${(revenueAmt / targetAmt * targetWidth).toFixed(2)}%; top: 26px; height: 78px; border-left: 2px dashed ${T.RED}; z-index: 5; pointer-events: none;"></div>`
      : '';
    const wrapperOpen = state === 'below_target' ? `<div style="position: relative;">` : '';
    const wrapperClose = state === 'below_target' ? `${dashedLineDiv}</div>` : '';

    return `${wrapperOpen}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 12px 0 6px 0;">
        ${revenueMarkerRow}
        <tr>
          <td width="${targetWidth}%" style="padding: 0 0 4px 0; font-family: ${T.FONT}; font-size: 10.5px; color: ${T.ORANGE_DEEP}; font-weight: 700; letter-spacing: 0.5px; text-align: right; white-space: nowrap;">ELIGIBILITY TARGET (SMx 5\u00D7) \u00B7 ${fmtL(targetAmt)}</td>
          ${revenueTopLabel}
        </tr>
        <tr>${leftBarContent}${rightBarContent}</tr>
        <tr>
          <td colspan="2" style="padding: 3px 0 0 0; font-family: ${T.MONO}; font-size: 10.5px; color: ${T.INK_SOFT};">\u20B90</td>
        </tr>
        <tr>
          <td width="${targetWidth}%" style="padding: 4px 6px 0 6px;">
            <div style="border-top: 1.5px solid ${leftBorder}; border-left: 1.5px solid ${leftBorder}; border-right: 1.5px solid ${leftBorder}; height: 6px;"></div>
          </td>
          <td width="${excessWidth}%" style="padding: 4px 6px 0 6px;">
            <div style="border-top: 1.5px solid ${rightBorder}; border-left: 1.5px solid ${rightBorder}; border-right: 1.5px solid ${rightBorder}; height: 6px;"></div>
          </td>
        </tr>
        <tr>
          <td width="${targetWidth}%" style="padding: 6px 6px 0 6px; font-family: ${T.MONO}; font-size: 11.5px; color: ${leftTextColor}; text-align: center;">5% \u00D7 ${fmtL(targetAmt)} = <strong>${fmtINR(fivePct)}</strong></td>
          <td width="${excessWidth}%" style="padding: 6px 6px 0 6px; font-family: ${T.MONO}; font-size: 11.5px; color: ${rightTextColor}; text-align: center;">40% \u00D7 ${excess > 0 ? fmtL(excess) : '\u20B90'} = <strong>${fmtINR(fortyPct)}</strong></td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 14px;">
            <div style="background: ${pillBg}; border: 1.5px solid ${pillBorder}; color: ${pillColor}; padding: 10px 14px; border-radius: 20px; text-align: center; font-family: ${T.FONT}; font-size: 13.5px; font-weight: 700;">${pillContent}</div>
          </td>
        </tr>
      </table>${wrapperClose}`;
  };

    const formulaCard = (label, lines) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 12px 0 8px 0;">
      <tr><td style="background: ${T.NAVY}; padding: 14px 16px; border-radius: 6px;">
        <div style="font-family: ${T.FONT}; font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 1px; margin-bottom: 8px;">${label}</div>
        <div style="font-family: ${T.MONO}; font-size: 12.5px; color: white; line-height: 1.85;">${lines.join('<br>')}</div>
      </td></tr>
    </table>`;

  const flowChart = (steps) => {
    let cells = '';
    steps.forEach((s, i) => {
      cells += `<td style="background: ${T.NAVY_SOFT}; border: 1.5px solid ${T.NAVY}; border-radius: 6px; padding: 10px 6px; text-align: center; vertical-align: middle;">
        <div style="font-family: ${T.FONT}; font-size: 11.5px; font-weight: 700; color: ${T.NAVY}; line-height: 1.3;">${s.label}</div>
        ${s.sub ? '<div style="font-family: ' + T.MONO + '; font-size: 10px; color: ' + T.INK_SOFT + '; margin-top: 3px;">' + s.sub + '</div>' : ''}
      </td>`;
      if (i < steps.length - 1) {
        cells += `<td style="width: 20px; text-align: center; vertical-align: middle; font-family: ${T.MONO}; font-size: 18px; color: ${T.NAVY}; font-weight: 700;">\u2192</td>`;
      }
    });
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 10px 0;"><tr>${cells}</tr></table>`;
  };

  // ============ STEP 1 ============
  const step1Html = sectionH(1, 'YTD Salary Cost and Eligibility Target') + `<tr><td style="padding: 4px 0 12px 0;">
    ${bulletList([
      `<strong>YTD Salary Cost</strong> = sum of your salaries in the elapsed months (${rm.months} months this cycle).`,
      `<strong>Eligibility Target</strong> = 5 \u00D7 YTD Salary Cost. Your revenue must cross this to earn any incentive.`
    ])}
    <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
      YTD Salary Cost = <strong style="color: ${T.NAVY};">${fmtINR(c.ytdCost)}</strong><br>
      Eligibility Target (SMx 5\u00D7) = 5 \u00D7 ${fmtINR(c.ytdCost)} = <strong style="color: ${T.NAVY};">${fmtINR(c.eligibilityTarget)}</strong>
    </div>
  </td></tr>`;

  // ============ STEP 2 ============
  let step2Html;
  if (rm.deals.length === 0) {
    step2Html = sectionH(2, 'Deals in this cycle') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([`You had <strong>no deals</strong> in ${rangeLabel}. Nothing to compute this cycle.`])}
    </td></tr>`;
  } else {
    let rows = '';
    rm.deals.forEach(d => {
      const stgBg = d.stage === 'Collected' ? T.GREEN_SOFT : d.stage === 'Confirmed' ? T.AMBER_SOFT : d.stage === 'Not counted' ? T.RED_SOFT : '#EEF2F7';
      const stgFg = d.stage === 'Collected' ? T.GREEN_DEEP : d.stage === 'Confirmed' ? T.ORANGE_DEEP : d.stage === 'Not counted' ? T.RED_DEEP : T.INK_SOFT;
      const typBg = d.type === 'Focus' ? T.GREEN_SOFT : T.RED_SOFT;
      const typFg = d.type === 'Focus' ? T.GREEN_DEEP : T.RED_DEEP;
      rows += `<tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 11.5px; color: ${T.INK};">${escapeHtml(d.tcfId)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; text-align: right; color: ${T.INK};">${fmtINR(d.revenue)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.FONT}; font-size: 12px; text-align: center; color: ${T.INK_SOFT};">${d.month || '-'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; text-align: center;"><span style="background: ${stgBg}; color: ${stgFg}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">${d.stage}</span></td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; text-align: center;"><span style="background: ${typBg}; color: ${typFg}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">${d.type}</span></td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; text-align: right; color: ${T.INK};">${d.collection !== null ? d.collection + '%' : '-'}</td>
      </tr>`;
    });
    step2Html = sectionH(2, 'Deals in this cycle') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([`These are your ${rm.deals.length} deal(s) booked in <strong>${rangeLabel}</strong>.`])}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden; margin-top: 8px;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 11px; color: white; font-family: ${T.FONT};">TCF ID</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 11px; color: white; font-family: ${T.FONT};">Deal Revenue</th>
          <th style="padding: 9px 10px; text-align: center; font-size: 11px; color: white; font-family: ${T.FONT};">Deal Month</th>
          <th style="padding: 9px 10px; text-align: center; font-size: 11px; color: white; font-family: ${T.FONT};">Stage</th>
          <th style="padding: 9px 10px; text-align: center; font-size: 11px; color: white; font-family: ${T.FONT};">Type</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 11px; color: white; font-family: ${T.FONT};">Collection %</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </td></tr>`;
  }


  // ============ STEP 3: Both Incentives (with TCF IDs and Eligibility Target explicit) ============
  // Prov base uses all deals EXCEPT Not counted stage
  const provDeals = rm.deals.filter(d => d.stage !== 'Not counted');
  const provDealCount = provDeals.length;
  const confDeals = rm.deals.filter(d => d.stage === 'Confirmed' || d.stage === 'Collected');
  const confDealCount = confDeals.length;

  // Helper: comma-separated TCF list with stage
  const tcfListWithStage = (deals) => deals.map(d => `${escapeHtml(d.tcfId)} (${d.stage})`).join(', ');
  // Helper: sum formula like "TCF-001 (₹5L) + TCF-002 (₹5L) + ... = ₹25L"
  const sumFormula = (deals) => deals.map(d => `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)})`).join(' + ');

  let provBlock;
  if (rm.deals.length === 0) {
    provBlock = '';
  } else if (provDealCount === 0) {
    // All deals are Not counted
    provBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> none - all deals are Not counted.`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Provisional Incentive = \u20B90.</strong>`
      ])}`;
  } else if (c.provIncentive === 0) {
    provBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> ${tcfListWithStage(provDeals)} (${provDealCount} deals - all Counted, Confirmed and Collected stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Provisional Incentive Deal Revenue:</strong> ${sumFormula(provDeals)} = ${fmtINR(c.provBase)}`,
        `<strong style="color: ${T.RED_DEEP};">Did not cross target</strong> \u2192 Provisional Incentive = \u20B90.`
      ])}
      ${slabVisual(c.eligibilityTarget, c.provBase, 0, 'Provisional Incentive')}`;
  } else {
    provBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> ${tcfListWithStage(provDeals)} (${provDealCount} deals - all Counted, Confirmed and Collected stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Provisional Incentive Deal Revenue:</strong> ${sumFormula(provDeals)} = ${fmtINR(c.provBase)}`,
        `<strong>Crosses target</strong> by ${fmtINR(c.provBase - c.eligibilityTarget)}`
      ])}
      ${slabVisual(c.eligibilityTarget, c.provBase, c.provIncentive, 'Provisional Incentive')}`;
  }

  let confBlock;
  if (rm.deals.length === 0) {
    confBlock = '';
  } else if (c.confBase === 0) {
    confBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Confirmed Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> none - no Confirmed or Collected deals this cycle.`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Confirmed Incentive = \u20B90.</strong>`
      ])}`;
  } else if (c.confIncentive === 0) {
    confBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Confirmed Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> ${tcfListWithStage(confDeals)} (${confDealCount} deals - only Confirmed and Collected stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Confirmed Incentive Deal Revenue:</strong> ${sumFormula(confDeals)} = ${fmtINR(c.confBase)}`,
        `<strong style="color: ${T.RED_DEEP};">Did not cross target</strong> \u2192 Confirmed Incentive = \u20B90.`
      ])}
      ${slabVisual(c.eligibilityTarget, c.confBase, 0, 'Confirmed Incentive')}`;
  } else {
    const crossStatus = c.confBase > c.eligibilityTarget
      ? `<strong>Crosses target</strong> by ${fmtINR(c.confBase - c.eligibilityTarget)}`
      : `<strong>Exactly at target</strong> - 5% of target applies, no excess`;
    confBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Confirmed Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> ${tcfListWithStage(confDeals)} (${confDealCount} deals - only Confirmed and Collected stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Confirmed Incentive Deal Revenue:</strong> ${sumFormula(confDeals)} = ${fmtINR(c.confBase)}`,
        crossStatus
      ])}
      ${slabVisual(c.eligibilityTarget, c.confBase, c.confIncentive, 'Confirmed Incentive')}`;
  }

  const step3Html = rm.deals.length === 0 ? '' :
    sectionH(3, 'Both Incentives - Provisional and Confirmed') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        `Two incentives are computed side by side: <strong>Provisional</strong> (Counted / Confirmed / Collected deals) and <strong>Confirmed</strong> (Confirmed and Collected deals).`
      ])}
      ${provBlock}
      ${confBlock}
    </td></tr>`;

  // ============ STEP 4: Per-deal payable (restructured) ============
  let step4Html = '';
  if (rm.deals.length > 0 && (c.provIncentive > 0 || c.confIncentive > 0)) {

    const provFlow = flowChart([
      { label: 'Provisional Incentive', sub: fmtINR(c.provIncentive) },
      { label: 'Deal Incentive Share', sub: 'Incentive \u00D7 Rev\u00F7Total' },
      { label: 'Payable', sub: '25% (Focus) or \u20B90' }
    ]);
    const confFlow = flowChart([
      { label: 'Confirmed Incentive', sub: fmtINR(c.confIncentive) },
      { label: 'Deal Incentive Share', sub: 'Incentive \u00D7 Rev\u00F7Total' },
      { label: 'Payable', sub: 'max(50%, Collection %)' }
    ]);

    // Provisional block: flow + formula + explanation
    let provPayBlock = '';
    if (c.provIncentive > 0) {
      provPayBlock = `
        <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 16px 0 6px 0; font-weight: 700;">Provisional flow</p>
        ${provFlow}
        ${formulaCard('PROVISIONAL PAYABLE FORMULA', [
          'Deal Incentive Share = Provisional Incentive \u00D7 (Deal Revenue \u00F7 Total Provisional Incentive Deal Revenue)',
          '',
          '<span style="color: rgba(255,255,255,0.7);">Then per-deal:</span>',
          'Focus deal &nbsp;&nbsp;&nbsp;\u2192 Provisional Payable = <span style="color: ' + T.GOLD + ';">25%</span> \u00D7 Deal Incentive Share',
          'Non-Focus deal \u2192 Provisional Payable = <span style="color: ' + T.GOLD + ';">\u20B90</span>'
        ])}
      `;
    }

    let confPayBlock = '';
    if (c.confIncentive > 0) {
      confPayBlock = `
        <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 20px 0 6px 0; font-weight: 700;">Confirmed flow</p>
        ${confFlow}
        ${formulaCard('CONFIRMED PAYABLE FORMULA', [
          'Deal Incentive Share = Confirmed Incentive \u00D7 (Deal Revenue \u00F7 Total Confirmed Incentive Deal Revenue)',
          '',
          '<span style="color: rgba(255,255,255,0.7);">Then per-deal:</span>',
          'Confirmed Payable = <span style="color: ' + T.GOLD + ';">max(50%, Collection %)</span> \u00D7 Deal Incentive Share'
        ])}
      `;
    }

    // Per-deal table
    // Helper: cell with calc line (small/muted) + result (large/bold). Green highlight if applies.
    const shareCellHtml = (inc, share, deal_rev, base, applies) => {
      if (share <= 0 || base <= 0) {
        return `<td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>`;
      }
      const bgCol = applies ? '#ECFDF5' : 'transparent';
      const borderLeft = applies ? `border-left: 3px solid ${T.GREEN};` : '';
      const resultCol = applies ? T.GREEN_DEEP : T.NAVY;
      const calcText = `${fmtINR(inc)} \u00D7 (${fmtL(deal_rev)} \u00F7 ${fmtL(base)})`;
      return `<td style="padding: 10px 12px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; background: ${bgCol}; ${borderLeft}">
        <div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.MUTED}; text-align: right; line-height: 1.3; font-weight: 500;">${calcText}</div>
        <div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${resultCol}; text-align: right; margin-top: 3px; line-height: 1.2;">= ${fmtINR(share)}</div>
      </td>`;
    };

    let rows = '';
    c.dealResults.forEach(dr => {
      const d = dr.deal;
      // Not counted deals: row with N/A cells + "Not counted deal" reason
      if (d.stage === 'Not counted') {
        rows += `<tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK}; white-space: nowrap;"><strong>${escapeHtml(d.tcfId)}</strong>${d.sharePct !== undefined && d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : ''}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10.5px; text-align: right; color: ${T.INK}; white-space: nowrap;">${fmtINR(d.revenue)}</td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 11px;"><span style="background: ${T.RED_SOFT}; color: ${T.RED_DEEP}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">Not counted</span></td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 10.5px; text-align: center; line-height: 1.35;"><strong style="color: ${T.MUTED};">No incentive</strong><br><span style="color: ${T.MUTED}; font-size: 10.5px; font-style: italic;">Not counted deal</span></td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; text-align: right; color: ${T.INK};">\u20B90</td>
        </tr>`;
        return;
      }
      // Team deals: RM earns no incentive on team deals; excluded from base too
      if (d.selfTeam === 'Team') {
        rows += `<tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK}; white-space: nowrap;"><strong>${escapeHtml(d.tcfId)}</strong>${d.sharePct !== undefined && d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : ''}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10.5px; text-align: right; color: ${T.INK}; white-space: nowrap;">${fmtINR(d.revenue)}</td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 11px;"><span style="background: #FEF3C7; color: ${T.ORANGE_DEEP}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">Team deal</span></td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 10.5px; text-align: center; line-height: 1.35;"><strong style="color: ${T.MUTED};">No incentive</strong><br><span style="color: ${T.MUTED}; font-size: 10.5px; font-style: italic;">Team deal - excluded from base</span></td>
          <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; text-align: right; color: ${T.INK};">\u20B90</td>
        </tr>`;
        return;
      }

      const provApplies = (dr.whichApplies === 'provisional');
      const confApplies = (dr.whichApplies === 'confirmed');
      const provShareCell = shareCellHtml(c.provIncentive, dr.provShare, d.revenue, c.provBase, provApplies);
      const showConf = (d.stage !== 'Counted' && dr.confShare > 0);
      const confShareCell = showConf
        ? shareCellHtml(c.confIncentive, dr.confShare, d.revenue, c.confBase, confApplies)
        : `<td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>`;

      // Which cell
      let whichCell;
      if (dr.whichApplies === 'provisional') {
        whichCell = '<strong style="color: ' + T.GREEN_DEEP + ';">Provisional</strong><br><span style="color: ' + T.INK_SOFT + '; font-size: 10.5px;">25% focus advance</span>';
      } else if (dr.whichApplies === 'confirmed') {
        whichCell = '<strong style="color: ' + T.ORANGE_DEEP + ';">Confirmed</strong><br><span style="color: ' + T.INK_SOFT + '; font-size: 10.5px;">Collection ' + d.collection + '%</span>';
      } else {
        whichCell = '<strong style="color: ' + T.MUTED + ';">No incentive</strong>' +
                    (dr.noReason ? '<br><span style="color: ' + T.MUTED + '; font-size: 10.5px; font-style: italic;">' + escapeHtml(dr.noReason) + '</span>' : '');
      }

      // Payable cell - bold amount + small calc note
      const payCell = dr.payable > 0
        ? `<div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.MUTED}; text-align: right; line-height: 1.3;">${dr.calcNote}</div><div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${T.NAVY}; text-align: right; margin-top: 3px; line-height: 1.2;">= ${fmtINR(dr.payable)}</div>`
        : `<div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${T.INK}; text-align: right;">\u20B90</div>`;

      rows += `<tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK}; white-space: nowrap;"><strong>${escapeHtml(d.tcfId)}</strong>${d.sharePct !== undefined && d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : ''}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10.5px; text-align: right; color: ${T.INK}; white-space: nowrap;">${fmtINR(d.revenue)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT};">${d.stage}<br>${d.type}</td>
        ${provShareCell}
        ${confShareCell}
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 10.5px; text-align: center; line-height: 1.35;">${whichCell}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right;">${payCell}</td>
      </tr>`;
    });
    const totalRow = `<tr style="background: ${T.NAVY_SOFT};">
      <td colspan="6" style="padding: 12px; font-family: ${T.FONT}; font-size: 13px; font-weight: 700; color: ${T.NAVY}; text-align: right;">Total FY27 Payable this cycle</td>
      <td style="padding: 12px; font-family: ${T.MONO}; font-size: 14px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.fy27Payable)}</td>
    </tr>`;

    // Cash + ESOP breakup mini-table (Option B - separate table to avoid clipping)
    let breakupRows = '';
    c.dealResults.forEach(dr => {
      if (dr.payable <= 0) return;  // skip zero-payable deals
      breakupRows += `<tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 10.5px; color: ${T.INK}; white-space: nowrap;"><strong>${escapeHtml(dr.deal.tcfId)}</strong></td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.NAVY}; text-align: right; white-space: nowrap;">${fmtINR(dr.payable)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.GREEN_DEEP}; text-align: right; white-space: nowrap;">${fmtINR(dr.cashPayable)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.ORANGE_DEEP}; text-align: right; white-space: nowrap;">${fmtINR(dr.esopPayable)}</td>
      </tr>`;
    });
    const breakupTotalRow = `<tr style="background: ${T.NAVY_SOFT};">
      <td style="padding: 10px; font-family: ${T.FONT}; font-size: 12px; font-weight: 700; color: ${T.NAVY};">Total</td>
      <td style="padding: 10px; font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.fy27Payable)}</td>
      <td style="padding: 10px; font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.GREEN_DEEP}; text-align: right;">${fmtINR(c.fy27CashPayable)}</td>
      <td style="padding: 10px; font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.ORANGE_DEEP}; text-align: right;">${fmtINR(c.fy27EsopPayable)}</td>
    </tr>`;
    const breakupTable = c.fy27Payable > 0 ? `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 20px 0 6px 0; font-weight: 700;">Cash &amp; ESOP breakup <span style="font-size: 11px; color: ${T.INK_SOFT}; font-weight: 500;">- 80% cash to bank, 20% ESOP per deal</span></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT};">TCF ID</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Final Payable</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Monetary <span style="font-weight: 500; color: rgba(255,255,255,0.7);">(80%)</span></th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">ESOP <span style="font-weight: 500; color: rgba(255,255,255,0.7);">(20%)</span></th>
        </tr></thead>
        <tbody>${breakupRows}${breakupTotalRow}</tbody>
      </table>` : '';

    step4Html = sectionH(4, 'Per-deal payable') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        `For each deal we compute a <strong>Deal Incentive Share</strong>, then apply the rule that fits the deal.`
      ])}
      ${provPayBlock}
      ${confPayBlock}
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Per-deal payable table</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">TCF ID</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Deal Revenue</th>
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Stage &amp; Type</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Provisional Deal Incentive Share<div style="font-family: ${T.MONO}; font-size: 9.5px; font-weight: 500; color: rgba(255,255,255,0.6); margin-top: 3px; line-height: 1.35;">Prov Inc \u00D7 Deal Rev \u00F7 Total Prov Rev</div></th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Confirmed Deal Incentive Share<div style="font-family: ${T.MONO}; font-size: 9.5px; font-weight: 500; color: rgba(255,255,255,0.6); margin-top: 3px; line-height: 1.35;">Conf Inc \u00D7 Deal Rev \u00F7 Total Conf Rev</div></th>
          <th style="padding: 9px 10px; text-align: center; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Which Incentive applies</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Final Payable</th>
        </tr></thead>
        <tbody>${rows}${totalRow}</tbody>
      </table>
      ${breakupTable}
    </td></tr>`;
  } else if (rm.deals.length > 0) {
    step4Html = sectionH(4, 'Per-deal payable') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        c.overallScenario === 'below_target'
          ? `Neither Provisional nor Confirmed Deal Revenue crossed the Eligibility Target this cycle. All per-deal payables are \u20B90.`
          : `None of your deals qualified for a payable amount this cycle.`,
        `Once your cumulative revenue crosses <strong>${fmtINR(c.eligibilityTarget)}</strong>, the calculation kicks in from the next Dollar Day.`
      ])}
    </td></tr>`;
  }


  // ============ STEP 5: Due Incentive - CASH ONLY ============
  // Due = FY27 Cash Payable (80% of FY27) + Prior Period Payable (already cash) - Already Paid (cash)
  const dueColor = c.due < 0 ? T.RED_DEEP : (c.due > 0 ? T.GREEN_DEEP : T.INK);
  const hasBackYears = c.backYear && c.backYear.total > 0;
  const cumulativeBox = hasBackYears
    ? `<div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
        FY27 Cash Payable (80% of \u20B9${fmtINRnoSym(c.fy27Payable)}) = <strong>${fmtINR(c.fy27CashPayable)}</strong><br>
        Prior Period Payable (cash) = <strong>${fmtINR(c.backYear.total)}</strong><br>
        Cumulative Cash Payable = ${fmtINR(c.fy27CashPayable)} + ${fmtINR(c.backYear.total)} = <strong>${fmtINR(c.cumulativeCash)}</strong><br>
        Total Already Paid (cash) = <strong>${fmtINR(c.alreadyPaid)}</strong><br>
        <strong>Due Incentive (cash) = ${fmtINR(c.cumulativeCash)} \u2212 ${fmtINR(c.alreadyPaid)} = <span style="color:${dueColor};">${fmtINR(c.due)}</span></strong>
      </div>`
    : `<div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
        FY27 Cash Payable (80% of \u20B9${fmtINRnoSym(c.fy27Payable)}) = <strong>${fmtINR(c.fy27CashPayable)}</strong><br>
        Total Already Paid (cash) = <strong>${fmtINR(c.alreadyPaid)}</strong><br>
        <strong>Due Incentive (cash) = ${fmtINR(c.fy27CashPayable)} \u2212 ${fmtINR(c.alreadyPaid)} = <span style="color:${dueColor};">${fmtINR(c.due)}</span></strong>
      </div>`;
  const nettingBullet = hasBackYears
    ? `Only the <strong>cash portion</strong> (80%) of your FY27 payable flows into Due Incentive. Prior Period Payable is already a cash amount. Everything nets against Total Already Paid (also cash).`
    : `Only the <strong>cash portion</strong> (80%) of your FY27 payable flows into Due Incentive. This nets against Total Already Paid (also cash).`;
  const step5Html = sectionH(5, 'Due Incentive (cash) after netting Already Paid') + `<tr><td style="padding: 4px 0 12px 0;">
    ${bulletList([nettingBullet])}
    ${cumulativeBox}
    ${c.due < 0 ? `
      <div style="margin-top: 10px; padding: 12px 14px; background: ${T.RED_SOFT}; border-left: 3px solid ${T.RED}; border-radius: 3px;">
        <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
          <strong style="color: ${T.RED_DEEP};">No clawback.</strong> Even though Due is negative, nothing is recovered. The ${fmtINR(c.alreadyPaid)} you have been paid stays. Disbursement resumes automatically the next cycle your Cumulative Cash Payable grows past ${fmtINR(c.alreadyPaid)}.
        </p>
      </div>
    ` : ''}
  </td></tr>`;

  // ============ STEP 6: CRM release ============
  let step6Html = '';
  if (c.due > 0) {
    if (rm.hasCrm) {
      step6Html = sectionH(6, 'CRM release check') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.GREEN_SOFT}; border-left: 3px solid ${T.GREEN}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            <strong style="color: ${T.GREEN_DEEP};">Release \u2713.</strong> You have a CRM-approved deal in the current or previous month, so the Due amount disburses this Dollar Day.
          </p>
        </div>
      </td></tr>`;
    } else {
      step6Html = sectionH(6, 'CRM release check') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.AMBER_SOFT}; border-left: 3px solid ${T.ORANGE}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            <strong style="color: ${T.ORANGE_DEEP};">Held - not lost.</strong> Payout requires a CRM-approved deal in the current or previous month. Your Due Incentive of <strong>${fmtINR(c.due)}</strong> will release automatically the next qualifying month. Nothing forfeited.
          </p>
        </div>
      </td></tr>`;
    }
  }

  // ============ STEP 7: Disbursement + overall incentive summary ============
  let step7Html = '';
  if (c.dueForRelease > 0) {
    // Cash disbursed this cycle = Due Incentive (cash-only)
    // Reverse-calc'd Total Incentive for this disbursement = Due / 0.80
    const cashThisCycle = c.dueForRelease;
    const esopThisCycle = cashThisCycle * 0.25;
    const totalThisCycle = cashThisCycle + esopThisCycle;
    step7Html = sectionH(7, 'This Dollar Day disbursement') + `<tr><td style="padding: 4px 0 20px 0;">
      ${bulletList([
        `Cash to bank = your <strong>Due Incentive</strong> (already cash-only).`,
        `ESOP = 25% of cash (equivalent to 20% of total incentive) - reverse-calculated since My Incentive numbers are cash-only.`
      ])}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td width="49%" style="background: ${T.GREEN_SOFT}; border: 1px solid ${T.GREEN}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.GREEN_DEEP}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">CASH TO BANK</div>
            <div style="font-family: ${T.MONO}; font-size: 22px; font-weight: 700; color: ${T.GREEN_DEEP};">${fmtINR(cashThisCycle)}</div>
            <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT}; margin-top: 4px;">80% of total incentive</div>
          </td>
          <td width="2%"></td>
          <td width="49%" style="background: #FFFBEB; border: 1px solid ${T.ORANGE}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.ORANGE_DEEP}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">ESOP</div>
            <div style="font-family: ${T.MONO}; font-size: 22px; font-weight: 700; color: ${T.ORANGE_DEEP};">${fmtINR(esopThisCycle)}</div>
            <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT}; margin-top: 4px;">20% of total incentive</div>
          </td>
        </tr>
        <tr><td colspan="3" style="padding-top: 12px;">
          <div style="background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; padding: 12px 14px; border-radius: 3px; font-family: ${T.MONO}; font-size: 12.5px; color: ${T.INK}; line-height: 1.6;">
            <strong>Total incentive this cycle = ${fmtINR(totalThisCycle)}</strong><br>
            = ${fmtINR(cashThisCycle)} (Cash, 80%) + ${fmtINR(esopThisCycle)} (ESOP, 20%)
          </div>
        </td></tr>
      </table>
    </td></tr>`;
  }

  // Split steps into FY27 breakdown (1-4) and Due/Disbursement wrap-up (5-7)
  const stepsHtmlFY27 = step1Html + step2Html + step3Html + step4Html;
  const stepsHtmlDue  = step5Html + step6Html + step7Html;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${month} Dollar Day incentive</title>
</head>
<body style="margin: 0; padding: 0; background: ${T.BG}; font-family: ${T.FONT}; color: ${T.INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background: ${T.BG};">
    <tr><td align="center" style="padding: 24px 12px;">
      <table role="presentation" width="720" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; max-width: 720px;">

        <tr><td class="pdf-section-start" style="background: ${T.NAVY}; padding: 18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family: ${T.FONT}; font-size: 15px; font-weight: 700; color: white; letter-spacing: -0.01em;">Square Yards</td>
              <td style="text-align: right; font-family: ${T.FONT}; font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 500; white-space: nowrap;">Incentive Team \u00B7 Dollar Day ${escapeHtml(rm.ddDate)}</td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding: 28px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background: ${hero.bg}; border: 1px solid ${hero.border}; border-radius: 8px; overflow: hidden;">
            <tr><td style="padding: 22px 24px;">
              <div style="font-family: ${T.FONT}; font-size: 10.5px; font-weight: 700; color: ${hero.border}; letter-spacing: 1.2px; margin-bottom: 6px;">${hero.label}</div>
              <div style="font-family: ${T.MONO}; font-size: 40px; font-weight: 700; color: ${T.NAVY}; letter-spacing: -0.02em; line-height: 1.1;">\u20B9${hero.big}</div>
              <div style="font-family: ${T.MONO}; font-size: 12.5px; color: ${T.INK_SOFT}; margin-top: 10px; line-height: 1.5;">${hero.formula}</div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding: 22px 28px 4px 28px;">
          <p style="font-family: ${T.FONT}; font-size: 14px; color: ${T.INK}; line-height: 1.6; margin: 0;">Hi ${escapeHtml(first)},</p>
          <p style="font-family: ${T.FONT}; font-size: 14px; color: ${T.INK}; line-height: 1.6; margin: 8px 0 0 0;">Below is your incentive breakdown for <strong>${month} Dollar Day</strong>.</p>
        </td></tr>

        ${buildFY27Block(c, rangeLabel, T, stepsHtmlFY27)}
        ${buildPriorPeriodsCard(c, T)}

        <tr><td style="padding: 22px 28px 0 28px;">
          <div style="font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; color: ${T.MUTED}; letter-spacing: 1.2px; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid ${T.BORDER_STRONG};">
            Due Incentive \u00B7 <span style="color: ${T.NAVY};">final cash calculation</span>
          </div>
        </td></tr>

        <tr><td style="padding: 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            ${stepsHtmlDue}
          </table>
        </td></tr>

        <tr><td class="pdf-section-start" style="padding: 24px 28px 24px 28px;">
          <div style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; line-height: 1.6; margin-bottom: 10px;">If you still have doubts, reach out to <a href="mailto:incentive@squareyards.com" style="color: ${T.NAVY}; font-weight: 700; text-decoration: none;">incentive@squareyards.com</a>.</div>
          <div style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK_SOFT};">- <strong style="color: ${T.INK};">Incentive Team, Square Yards</strong></div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function generatePlainText(rm) {
  const c = rm.calc;
  const first = rm.name.split(' ')[0] || rm.name;
  const rangeLabel = c.coverage ? c.coverage.rangeLabel : '';
  const lines = [];
  lines.push(`Hi ${first},`, '');
  lines.push(`Below is your incentive breakdown for ${c.ddLabel} Dollar Day.`);
  lines.push(`YTD Salary Cost and deals from ${rangeLabel} considered.`);
  lines.push('');
  if (c.overallScenario === 'positive' || c.overallScenario === 'provisional_only') {
    lines.push(`This-cycle cash to bank = ${fmtINR(c.dueForRelease)} (Due Incentive); ESOP = ${fmtINR(c.dueForRelease * 0.25)} (reverse-calc from cash)`);
  } else if (c.overallScenario === 'held_no_crm') {
    lines.push(`Held pending CRM approval: ${fmtINR(c.due)}`);
  } else {
    lines.push(`This Dollar Day payable: Rs. 0`);
  }
  lines.push('');
  lines.push(`YTD Salary Cost = ${fmtINR(c.ytdCost)}`);
  lines.push(`Eligibility Target = ${fmtINR(c.eligibilityTarget)}`);
  lines.push(`Provisional Incentive = ${fmtINR(c.provIncentive)}`);
  lines.push(`Confirmed Incentive = ${fmtINR(c.confIncentive)}`);
  lines.push(`Total Payable = ${fmtINR(c.totalPayable)}`);
  lines.push(`Already Paid = ${fmtINR(c.alreadyPaid)}`);
  lines.push(`Due = ${fmtINR(c.due)}`);
  lines.push('');
  lines.push('If you still have doubts, reach out to incentive@squareyards.com');
  lines.push('');
  lines.push('- Incentive Team, Square Yards');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Everything above this line is copied verbatim from Incentive_PDF_Tool.html
// (validateAndNormalize, calculateIncentive, the HTML/PDF email template
// builder, and their shared helpers) so the calculation and rendered output
// are guaranteed identical to the original tool. Do not "clean up" or
// restyle the code above - any change risks a silent mismatch with the
// original tool's output. Only these exports were added, and em dashes in output
// strings were replaced with plain hyphens.
// ---------------------------------------------------------------------------
export {
  fmtINR,
  fmtINRnoSym,
  fmtL,
  escapeHtml,
  validateAndNormalize,
  calculateIncentive,
  generateEmailHtml,
  generatePlainText,
};
