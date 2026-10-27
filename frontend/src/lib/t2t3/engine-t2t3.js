// T2/T3 Incentive Engine
// Extracted from T2_T3_Incentive_PDF_Tool.html — all business logic and template generation.
// This is a standalone ES module with the same API surface as engine.js (T0/T1).

const LOGO_WHITE = 'data:image/png;base64,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';

const state = {
  rms: [],
  filter: 'all',
  searchQuery: '',
  activeRmId: null,
  sentSet: new Set(),
  filename: '',
};

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
// Collection % for display: up to 2 decimals, no trailing zeros (82.4223242 -> 82.42, 80 -> 80).
function fmtPct(n) {
  return String(Math.round(Number(n) * 100) / 100) + '%';
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
  // Beats dashboard statuses (mapping confirmed by the incentive team):
  //   DISBURSEDCONFIRMED / DISBURSEDCONFIRMED (PDD PENDING) -> Confirmed
  //   PARTIALLY COLLECTED                                   -> Confirmed
  //   SUBMITTED(Count) / REVISED(Count)                     -> Counted
  if (v.startsWith('disbursedconfirmed')) return 'Confirmed';
  if (v === 'partially collected' || v === 'partiallycollected') return 'Confirmed';
  if (v === 'submitted' || v === 'revised') return 'Counted';
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
  if (s instanceof Date && !isNaN(s.getTime())) return SALARY_MONTHS[((s.getMonth() + 9) % 12)];
  if (typeof s === 'number') {
    const d = new Date(Date.UTC(1899, 11, 30 + s));
    if (!isNaN(d.getTime())) return SALARY_MONTHS[((d.getUTCMonth() + 9) % 12)];
  }
  const str = String(s).trim();
  // ISO date string like "2026-07-15" or "2026-07-15T00:00:00"
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const mo = Number(isoMatch[2]) - 1;
    return SALARY_MONTHS[((mo + 9) % 12)];
  }
  // Strip a trailing year suffix such as "-26", "-2026", "/26" (e.g. "Apr-26" -> "Apr")
  // and a leading day prefix such as "14-" (e.g. "14-May-26" -> "May").
  const v = str.replace(/[\s\-\/]\d{2,4}$/, '').replace(/^\d{1,2}[\s\-\/]/, '');
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
// 'YYYY-MM-DD...' strings are read as that calendar date in local time, so the day never shifts with the timezone.
function toLocalDate(v) {
  const m = typeof v === 'string' ? v.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(v);
}
function isReadableDate(v) {
  if (v instanceof Date) return !isNaN(v.getTime());
  if (typeof v === 'number') return isFinite(v);
  return !isNaN(new Date(v).getTime());
}
function fmtDate(v) {
  if (!v) return '';
  let d;
  if (v instanceof Date) d = v;
  else if (typeof v === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    d = new Date(excelEpoch.getTime() + v * 86400000);
  } else d = toLocalDate(v);
  if (isNaN(d.getTime())) return String(v);
  const utc = typeof v === 'number';   // Excel serials are built in UTC, everything else is local midnight
  const y = utc ? d.getUTCFullYear() : d.getFullYear();
  const mo = (utc ? d.getUTCMonth() : d.getMonth()) + 1;
  const da = utc ? d.getUTCDate() : d.getDate();
  return y + '-' + String(mo).padStart(2, '0') + '-' + String(da).padStart(2, '0');
}
function parseDealDate(v) {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(excelEpoch.getTime() + v * 86400000);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function fmtBlockDateRange(block) {
  const fmt = (dt) => {
    if (!dt) return '?';
    const d = dt instanceof Date ? dt : parseDealDate(dt);
    if (!d) return '?';
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };
  return fmt(block.startDate) + ' – ' + fmt(block.endDate);
}
function ddMonthLabel(dateStr) {
  const d = toLocalDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
function ddMonthShort(dateStr) {
  const d = toLocalDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', { month: 'long' }) + d.getFullYear();
}
// Derive financial year labels from the Dollar Day date.
// DD in Oct 2026 -> FY starts Apr 2026 -> fyStartYear=2026, fyLabel="FY 2026 - 27", fyFull="FY-202627", fyAprilLabel="April 2026"
function fyFromDollarDay(ddDateStr) {
  const d = toLocalDate(ddDateStr);
  if (isNaN(d.getTime())) return { fyStartYear: 2026, fyLabel: 'FY 2026-27', fyFull: 'FY-202627', fyAprilLabel: 'April 2026' };
  const m = d.getMonth(); // 0-based
  const y = d.getFullYear();
  const fyStartYear = m >= 3 ? y : y - 1; // Apr-Dec -> same year, Jan-Mar -> previous year
  const fyEndYear = fyStartYear + 1;
  const shortEnd = String(fyEndYear).slice(-2);
  return {
    fyStartYear,
    fyLabel: 'FY ' + fyStartYear + '-' + shortEnd,
    fyFull: 'FY-' + fyStartYear + fyEndYear,
    fyAprilLabel: 'April ' + fyStartYear,
  };
}
function fyAprilStart(ddDateRaw) {
  const d = ddDateRaw instanceof Date ? ddDateRaw : toLocalDate(ddDateRaw);
  if (isNaN(d.getTime())) return null;
  const m = d.getMonth();
  const y = d.getFullYear();
  const fyStartYear = m >= 3 ? y : y - 1;
  return new Date(fyStartYear, 3, 1);
}
// Months in the period: April of the financial year up to the month before the Dollar Day.
function monthsFromDollarDay(ddDateStr) {
  const d = toLocalDate(ddDateStr);
  if (isNaN(d.getTime())) return null;
  const endM = (d.getMonth() + 11) % 12;
  return endM >= 3 ? endM - 2 : endM + 10;
}
function computeCoveredRange(ddDateStr, joinMonthIndex) {
  const d = toLocalDate(ddDateStr);
  if (isNaN(d.getTime())) return null;
  let endM = d.getMonth() - 1; let endY = d.getFullYear();
  if (endM < 0) { endM = 11; endY--; }
  // The period starts in April of the financial year the end month falls in, or later if the
  // RM joined partway through (joinMonthIndex counts months on from that April).
  const fyStartY = endM >= 3 ? endY : endY - 1;
  const startDate = new Date(fyStartY, 3 + (joinMonthIndex || 0), 1);
  let startM = startDate.getMonth(); let startY = startDate.getFullYear();
  // If the RM has no salaried months at all this cycle, the join month can land after the end
  // month; fall back to a single-month label instead of a reversed range.
  if (startY * 12 + startM > endY * 12 + endM) { startM = endM; startY = endY; }
  const NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return {
    startLabel: NAMES[startM] + ' ' + startY,
    endLabel: NAMES[endM] + ' ' + endY,
    rangeLabel: (startY === endY && startM === endM)
      ? NAMES[endM] + ' ' + endY
      : startY === endY
        ? NAMES[startM] + ' to ' + NAMES[endM] + ' ' + endY
        : NAMES[startM] + ' ' + startY + ' to ' + NAMES[endM] + ' ' + endY,
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
  const rmSheet = findSheet(wb, ['t2_t3','t2t3','t2/t3','rms','rm','reps','employees']);
  const dlSheet = findSheet(wb, ['deals','deal']);
  if (!rmSheet) throw new Error('No sheet named "T2_T3" or "RMs" found.');
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

// Reads a number typed with Indian-style commas ("8,69,204") or a trailing percent sign
// ("50%"). Returns NaN for anything unreadable, same as a bad Number() call.
function parseNum(v) {
  if (v === null || v === undefined || v === '') return NaN;
  if (typeof v === 'number') return v;
  return Number(String(v).replace(/,/g, '').replace(/%\s*$/, '').trim());
}

function pickSalary(row, m) {
  const exact = pick(row, 'Salary ' + m, m + ' Salary', m);
  if (exact !== null) return exact;
  // Fall back to any column that starts with "salary <month>", ignoring punctuation and a
  // trailing suffix such as "-26" or "-2026" (e.g. "Salary Apr-26").
  const want = 'salary' + m.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.trim().toLowerCase().replace(/[^a-z]/g, '') === want) return row[k];
  }
  return null;
}

// ---------- Validation ----------
function validateAndNormalize(rmRows, dlRows) {
  const issues = [];
  const rms = [];
  const rmMap = {};

  // Pre-scan: identify promotion employees (multiple tier rows, at least one T2/T3)
  const _empTierScan = {};
  rmRows.forEach(r => {
    const code = pick(r, 'Employee Code','Emp Code','EmpCode','Code');
    const t = pick(r, 'Tier');
    if (!code || !t) return;
    const norm = String(t).trim().toUpperCase();
    if (!_empTierScan[code]) _empTierScan[code] = [];
    _empTierScan[code].push(norm);
  });
  const promoEmps = new Set();
  for (const [code, tiers] of Object.entries(_empTierScan)) {
    if (tiers.length > 1 && tiers.some(t => t === 'T2' || t === 'T3')) {
      promoEmps.add(code);
    }
  }

  rmRows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const empCode = pick(r, 'Employee Code','Emp Code','EmpCode','Code');
    const name = pick(r, 'Full Name','Name');
    const tier = pick(r, 'Tier');
    const vertical = pick(r, 'Vertical') || 'Primary Sales';
    const alreadyPaid = pick(r, 'Total Already Paid','Already Paid YTD','Already Paid');
    const hasPipRaw = pick(r, 'Has PIP','PIP','PIP Status','onPIP','On PIP');
    const ddDate = pick(r, 'Dollar Day Date','DD Date','Dollar Day');
    const priorPayable = pick(r, 'Prior Period Final Payable','Prior Period Payable','Back Payable FY24');
    const emailId = pick(r, 'EmailIDOfficial','Email ID Official','Email','EmailId','Official Email');
    const t2EmailRaw = pick(r, 'T2Email','T2 Email','T2_Email');
    const t3EmailRaw = pick(r, 'T3Email','T3 Email','T3_Email');
    const pnlEmailRaw = pick(r, 'PnLEmail','PnL Email','PNLEmail','PnL_Email');
    const dojRaw = pick(r, 'DOJ','Date of Joining','DateOfJoining');
    const teamCostRaw = pick(r, 'Self+Team YTD Cost','Team YTD Cost','SelfTeamYTDCost','Self+Team Cost','Team Cost','Self & Team YTD Cost','YTD Team + Self','YTD Team+Self','YTD Team + Self / YTD Self','Target');
    const startDateRaw = pick(r, 'Start Date','StartDate','startdate');
    const endDateRaw = pick(r, 'End Date','EndDate','enddate');

    if (!empCode) { issues.push({level:'err',loc:'RMs row '+rowNum,msg:'Missing Employee Code (primary key).'}); return; }
    const normTier = tier ? String(tier).trim().toUpperCase() : '';
    if ((normTier === 'T0' || normTier === 'T1') && !promoEmps.has(empCode)) return;
    if (rmMap[empCode]) {
      if (promoEmps.has(empCode)) {
        const parsedCostBlock = teamCostRaw !== null ? parseNum(teamCostRaw) : null;
        const blockYtdCost = (parsedCostBlock !== null && !isNaN(parsedCostBlock) && parsedCostBlock >= 0) ? parsedCostBlock : 0;
        const blockStart = parseDealDate(startDateRaw);
        const blockEnd = parseDealDate(endDateRaw);
        rmMap[empCode].blocks.push({ tier: normTier, startDate: blockStart, endDate: blockEnd, ytdCost: blockYtdCost, deals: [] });
        if (normTier === 'T2' || normTier === 'T3') rmMap[empCode].tier = normTier;
        return;
      }
      const ddForFY = ddDate || rmMap[empCode]._ddDate;
      const fyStart = ddForFY ? fyAprilStart(ddForFY) : null;
      const newStart = startDateRaw instanceof Date ? startDateRaw : (startDateRaw ? new Date(startDateRaw) : null);
      const existingStart = rmMap[empCode]._startDate;
      const newInFY = fyStart && newStart && newStart >= fyStart;
      const existingInFY = fyStart && existingStart && existingStart >= fyStart;
      if (newInFY && !existingInFY) {
        const oldIdx = rms.indexOf(rmMap[empCode]);
        if (oldIdx !== -1) rms.splice(oldIdx, 1);
        delete rmMap[empCode];
      } else if (newInFY && existingInFY && newStart > existingStart) {
        const oldIdx = rms.indexOf(rmMap[empCode]);
        if (oldIdx !== -1) rms.splice(oldIdx, 1);
        delete rmMap[empCode];
      } else {
        return;
      }
    }
    if (!name) issues.push({level:'err',loc:empCode,msg:'Missing Full Name.'});

    const validMonths = monthsFromDollarDay(fmtDate(ddDate)) || 1;

    // Parse Self+Team YTD Cost
    const parsedTeamCost = teamCostRaw !== null ? parseNum(teamCostRaw) : null;
    const hasTeamCost = parsedTeamCost !== null && !isNaN(parsedTeamCost) && parsedTeamCost >= 0;
    if (teamCostRaw !== null && !hasTeamCost) issues.push({level:'err',loc:empCode,msg:'Self+Team YTD Cost must be a valid number >= 0 (got "'+teamCostRaw+'").'});
    if (teamCostRaw === null) issues.push({level:'warn',loc:empCode,msg:'Self+Team YTD Cost not provided, defaulting to 0.'});

    // Fallback salary columns for backward compat
    const salaries = SALARY_MONTHS.map(m => {
      const v = pickSalary(r, m);
      return v === null || v === '' ? null : Number(String(v).replace(/,/g, ''));
    });

    const apN = parseNum(alreadyPaid);
    if (alreadyPaid !== null && (isNaN(apN) || apN < 0)) issues.push({level:'warn',loc:empCode,msg:'Total Already Paid treated as 0.'});
    if (hasPipRaw === null) issues.push({level:'warn',loc:empCode,msg:'PIP field missing, defaulting to No (released).'});
    else if (!['yes','y','true','1','no','n','false','0'].includes(String(hasPipRaw).trim().toLowerCase())) issues.push({level:'err',loc:empCode,msg:'Has PIP must be Yes or No (got "'+hasPipRaw+'").'});
    if (!ddDate) issues.push({level:'err',loc:empCode,msg:'Dollar Day Date missing.'});
    else if (!isReadableDate(ddDate)) issues.push({level:'err',loc:empCode,msg:'Dollar Day Date is not a readable date (got "'+ddDate+'").'});
    if (priorPayable !== null) {
      const ppN = parseNum(priorPayable);
      if (isNaN(ppN) || ppN < 0) issues.push({level:'err',loc:empCode,msg:'Prior Period Final Payable must be a number, 0 or more (got "'+priorPayable+'").'});
    }

    const parseBack = (v) => {
      if (v === null || v === '') return 0;
      const n = parseNum(v);
      return (isNaN(n) || n < 0) ? 0 : n;
    };
    const backYearPayables = { total: parseBack(priorPayable) };

    const rm = {
      id: String(empCode),
      empCode: String(empCode),
      name: String(name || 'Unknown'),
      tier: String(tier || 'T2').trim().toUpperCase(),
      vertical: String(vertical),
      salaries,
      months: validMonths,
      joinMonthIndex: 0,
      activeMonths: validMonths,
      teamYtdCost: hasTeamCost ? parsedTeamCost : 0,
      alreadyPaid: Math.max(0, apN || 0),
      hasPip: normYesNo(hasPipRaw),
      ddDate: fmtDate(ddDate),
      backYearPayables,
      email: emailId ? String(emailId).trim() : '',
      t2Email: t2EmailRaw ? String(t2EmailRaw).trim() : '',
      t3Email: t3EmailRaw ? String(t3EmailRaw).trim() : '',
      pnlEmail: pnlEmailRaw ? String(pnlEmailRaw).trim() : '',
      doj: dojRaw ? fmtDate(dojRaw) : '',
      deals: [],
      _startDate: startDateRaw instanceof Date ? startDateRaw : (startDateRaw ? new Date(startDateRaw) : null),
      _ddDate: ddDate,
    };
    if (promoEmps.has(empCode)) {
      const blockStart = parseDealDate(startDateRaw);
      const blockEnd = parseDealDate(endDateRaw);
      rm.blocks = [{ tier: normTier, startDate: blockStart, endDate: blockEnd, ytdCost: rm.teamYtdCost, deals: [] }];
    }
    rmMap[rm.empCode] = rm;
    rms.push(rm);
  });

  let joinedCount = 0;
  dlRows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const rmId = pick(r, 'Employee Code','Emp Code','RM ID','RMID');
    const tcfId = pick(r, 'TCF Number','TCFNumber','TCF ID','TCFID','Deal ID','ID');
    const tcfLinkIdRaw = pick(r, 'TCF ID','TCFID','Tcf Id','tcfidd');
    const projectName = pick(r, 'Project Name','Deal Name','Project','Name','ProductName') || '';
    const revenue = pick(r, 'Revenue','Amount');
    const dealMonth = pick(r, 'Deal Month','Month','deal_month','deal_date','deal_Date','Deal Date');
    const stageRaw = pick(r, 'Stage','DealStatus');
    const typeRaw = pick(r, 'Type');
    const collectionRaw = pick(r, 'Collection %','Collection','Coll %');
    const selfTeamRaw = pick(r, 'Self/Team','SelfTeam','Team Split','Team');
    const sharePctRaw = pick(r, 'Share Percentage','Share %','Share');

    if (!rmId) { issues.push({level:'err',loc:'Deals row '+rowNum,msg:'Missing Employee Code.'}); return; }
    if (!rmMap[rmId]) return;
    const rev = parseNum(revenue);
    if (isNaN(rev) || rev < 0) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Revenue invalid.'}); return; }
    let stage = normStage(stageRaw);
    const type = normType(typeRaw);
    const month = normMonth(dealMonth);
    if (!stage) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Stage must be Counted/Logged In, Confirmed, or Collected (with or without "(Count)" suffix).'}); return; }
    if (!type) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Type must be Focus or Non-Focus.'}); return; }
    if (!month) issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Deal Month missing or invalid - will show as "-" in the PDF.'});

    let collection = null;
    // Normalize collection: if value is in (0,1] range, treat as fraction (e.g. 0.5 → 50%)
    let collNorm = parseNum(collectionRaw);
    if (!isNaN(collNorm) && collNorm > 0 && collNorm <= 1) collNorm = Math.round(collNorm * 10000) / 100;

    if (stage === 'Confirmed') {
      const c = collNorm;
      if (collectionRaw === null || collectionRaw === '' || isNaN(c) || c < 0) {
        issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed needs valid collection.'}); return;
      } else if (c === 100) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed at 100% collection - treating as Collected.'});
        stage = 'Collected';
        collection = 100;
      } else {
        collection = c;
      }
    } else if (stage === 'Collected') {
      const c = collNorm;
      if (collectionRaw === null || collectionRaw === '' || isNaN(c)) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Collected deal has no Collection %; treated as 100%.'});
        collection = 100;
      } else {
        collection = c;
      }
    } else if (stage === 'Counted') {
      const c = collNorm;
      if (collectionRaw !== null && collectionRaw !== '' && !isNaN(c) && c > 0) {
        if (c === 100) {
          issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Logged In deal with 100% collection - treating as Collected.'});
          stage = 'Collected';
          collection = 100;
        } else {
          issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Logged In deal with '+fmtPct(c)+' collection - treating as Confirmed.'});
          stage = 'Confirmed';
          collection = c;
        }
      } else {
        collection = 0;
      }
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

    const tcfIdStr = String(tcfId || 'TCF-' + (rmMap[rmId].deals.length + 1));
    const tcfLinkId = (tcfLinkIdRaw !== null && tcfLinkIdRaw !== '' && /^\d+$/.test(String(tcfLinkIdRaw).trim()))
      ? String(tcfLinkIdRaw).trim() : null;

    let dealCategory = 'TCF';
    if (/^MCF-/i.test(tcfIdStr)) dealCategory = 'MCF';
    else if (/^PNLSHARE\//i.test(tcfIdStr)) dealCategory = 'PNLSHARE';

    const isLoggedIn = /logged\s*in/i.test(String(stageRaw).replace(/\s*\(\s*count\s*\)\s*$/i, '').trim());
    const dealDateParsed = parseDealDate(dealMonth);
    rmMap[rmId].deals.push({
      tcfId: tcfIdStr,
      tcfLinkId,
      dealCategory,
      projectName: String(projectName || ''),
      revenue: rev,
      month: month || '',
      stage, type, collection,
      selfTeam,
      sharePct,
      isLoggedIn,
      _rawDealDate: dealDateParsed,
    });
    joinedCount++;
  });

  // Assign deals to blocks for promotion RMs
  for (const rm of rms) {
    if (!rm.blocks) continue;
    for (const d of rm.deals) {
      let assigned = false;
      if (d._rawDealDate) {
        for (const block of rm.blocks) {
          if (block.startDate && block.endDate && d._rawDealDate >= block.startDate && d._rawDealDate <= block.endDate) {
            block.deals.push(d);
            assigned = true;
            break;
          }
        }
      }
      if (!assigned) {
        rm.blocks[rm.blocks.length - 1].deals.push(d);
      }
    }
  }

  return { rms, issues, joinedCount };
}

// ---------- Calc ----------
function _computeBlock(deals, tier, ytdCost) {
  const teamYtdCost = ytdCost || 0;
  const isT0T1 = tier === 'T0' || tier === 'T1';

  // --- T0/T1 branch: follows engine-t0t1.js rules ---
  if (isT0T1) {
    const eligibilityTarget = 5 * teamYtdCost;

    // Team deals excluded from base entirely in T0/T1
    const selfProvDeals = deals.filter(d => d.selfTeam !== 'Team' && d.stage !== 'Not counted');
    const selfProvBase = selfProvDeals.reduce((s, d) => s + d.revenue, 0);
    const provCrossed = selfProvBase >= eligibilityTarget && selfProvBase > 0 && eligibilityTarget > 0;
    const selfProvIncentive = provCrossed ? 0.05 * eligibilityTarget + 0.40 * (selfProvBase - eligibilityTarget) : 0;

    const selfConfDeals = deals.filter(d => d.selfTeam !== 'Team' && (d.stage === 'Confirmed' || d.stage === 'Collected'));
    const selfConfBase = selfConfDeals.reduce((s, d) => {
      if (d.isLoggedIn && d.collection > 0) return s + d.revenue * (d.collection / 100);
      if (d.isLoggedIn && d.collection === 0) return s;
      return s + d.revenue;
    }, 0);
    const confCrossed = selfConfBase >= eligibilityTarget && selfConfBase > 0 && eligibilityTarget > 0;
    const selfConfIncentive = confCrossed ? 0.05 * eligibilityTarget + 0.40 * (selfConfBase - eligibilityTarget) : 0;

    const dealResults = deals.map(d => {
      if (d.stage === 'Not counted') {
        return { deal: d, provShare: 0, confShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'Not counted deal', cashPayable: 0, esopPayable: 0 };
      }
      if (d.selfTeam === 'Team') {
        return { deal: d, provShare: 0, confShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'Team deal — no incentive', cashPayable: 0, esopPayable: 0 };
      }
      const provShare = selfProvBase > 0 ? selfProvIncentive * (d.revenue / selfProvBase) : 0;
      const confContrib = (d.isLoggedIn && d.collection > 0) ? d.revenue * (d.collection / 100) : d.revenue;
      const confShare = (d.stage !== 'Counted' && selfConfBase > 0) ? selfConfIncentive * (confContrib / selfConfBase) : 0;
      let whichApplies, payable = 0, calcNote = '', noReason = '';
      if (d.stage === 'Counted') {
        if (d.type === 'Focus' && selfProvIncentive > 0) { whichApplies = 'provisional'; payable = 0.25 * provShare; calcNote = '25% × ' + fmtINR(provShare); }
        else if (d.type === 'Non-Focus' && selfProvIncentive > 0) { whichApplies = 'none'; noReason = 'Non-focus project'; }
        else { whichApplies = 'none'; noReason = 'Below eligibility target'; }
      } else {
        if (selfConfIncentive > 0) {
          const rawPct = d.collection / 100;
          const pct = (d.isLoggedIn && d.collection > 0) ? 1.0 : Math.max(0.5, rawPct);
          const confPay = pct * confShare;
          const advPay = (d.type === 'Focus' && selfProvIncentive > 0) ? 0.25 * provShare : 0;
          if (advPay > confPay) { whichApplies = 'provisional'; payable = advPay; calcNote = '25% × ' + fmtINR(provShare); }
          else {
            whichApplies = 'confirmed'; payable = confPay;
            calcNote = (d.isLoggedIn && d.collection > 0) ? '100% × ' + fmtINR(confShare) + ' (Logged In)' : fmtPct(pct * 100) + (rawPct < 0.5 ? ' (floor)' : '') + ' × ' + fmtINR(confShare);
          }
        } else if (d.type === 'Focus' && selfProvIncentive > 0) { whichApplies = 'provisional'; payable = 0.25 * provShare; calcNote = '25% × ' + fmtINR(provShare); }
        else if (d.type === 'Non-Focus' && selfProvIncentive > 0) { whichApplies = 'none'; noReason = 'Non-focus project'; }
        else { whichApplies = 'none'; noReason = 'Below eligibility target'; }
      }
      let payableBeforeShare = payable;
      let shareApplied = false;
      if (d.sharePct !== undefined && d.sharePct !== null && d.sharePct !== 100 && payable > 0) {
        payable = payable * (d.sharePct / 100); shareApplied = true; calcNote = calcNote + ' × ' + d.sharePct + '% (share)';
      }
      return { deal: d, provShare, confShare, selfShare: Math.max(provShare, confShare), teamShare: 0, payable, payableBeforeShare, shareApplied, whichApplies, calcNote, noReason, cashPayable: 0.80 * payable, esopPayable: 0.20 * payable };
    });

    const selfPayable = dealResults.filter(dr => dr.deal.selfTeam === 'Self').reduce((s, dr) => s + dr.payable, 0);
    return {
      isT0T1: true,
      teamYtdCost, teamTarget: eligibilityTarget, teamMultiplier: 5,
      teamBelowPct: 0.05, teamAbovePct: 0.40,
      selfProvBase, selfProvIncentive, selfConfBase, selfConfIncentive, selfPayable,
      provCrossed, confCrossed, eligibilityTarget,
      selfProvDeals, selfConfDeals,
      teamIncentive: 0, teamConfBase: 0, teamCrossed: false, teamPayable: 0,
      teamBelowAmt: 0, teamAboveAmt: 0,
      teamAllBase: 0, teamConfDeals: [],
      dealResults,
    };
  }

  // --- T2/T3 branch: original logic ---
  const isT2 = tier === 'T2';
  const teamMultiplier = isT2 ? 4 : 3;
  const teamBelowPct = isT2 ? 0.03 : 0.015;
  const teamAbovePct = isT2 ? 0.15 : 0.10;
  const teamTarget = teamMultiplier * teamYtdCost;

  const selfProvDeals = deals.filter(d => d.selfTeam === 'Self' && d.stage !== 'Not counted');
  const selfProvBase = selfProvDeals.reduce((s, d) => s + d.revenue, 0);
  const selfProvIncentive = selfProvBase > 0 ? 0.05 * selfProvBase : 0;

  const selfConfDeals = deals.filter(d => d.selfTeam === 'Self' && (d.stage === 'Confirmed' || d.stage === 'Collected'));
  const selfConfBase = selfConfDeals.reduce((s, d) => {
    if (d.isLoggedIn && d.collection > 0) return s + d.revenue * (d.collection / 100);
    if (d.isLoggedIn && d.collection === 0) return s;
    return s + d.revenue;
  }, 0);
  const selfConfIncentive = selfConfBase > 0 ? 0.05 * selfConfBase : 0;

  const teamConfDeals = deals.filter(d => d.selfTeam === 'Team' && (d.stage === 'Confirmed' || d.stage === 'Collected'));
  const teamConfBase = teamConfDeals.reduce((s, d) => {
    if (d.isLoggedIn && d.collection > 0) return s + d.revenue * (d.collection / 100);
    if (d.isLoggedIn && d.collection === 0) return s;
    return s + d.revenue;
  }, 0);
  const teamCrossed = teamConfBase >= teamTarget && teamConfBase > 0 && teamTarget > 0;
  const teamBelowAmt = teamCrossed ? teamBelowPct * teamTarget : 0;
  const teamAboveAmt = teamCrossed ? teamAbovePct * Math.max(0, teamConfBase - teamTarget) : 0;
  const teamIncentive = teamCrossed ? teamBelowAmt + teamAboveAmt : 0;

  const teamAllDeals = deals.filter(d => d.selfTeam === 'Team' && d.stage !== 'Not counted');
  const teamAllBase = teamAllDeals.reduce((s, d) => s + d.revenue, 0);

  const dealResults = deals.map(d => {
    if (d.stage === 'Not counted') {
      return { deal: d, selfShare: 0, teamShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'Not counted deal', cashPayable: 0, esopPayable: 0 };
    }
    if (d.dealCategory === 'PNLSHARE' && d.stage !== 'Collected') {
      return { deal: d, selfShare: 0, teamShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'PnL Share — not yet Collected', cashPayable: 0, esopPayable: 0 };
    }
    if (d.selfTeam === 'Self') {
      const provShare = selfProvBase > 0 ? selfProvIncentive * (d.revenue / selfProvBase) : 0;
      const confContrib = (d.isLoggedIn && d.collection > 0) ? d.revenue * (d.collection / 100) : d.revenue;
      const confShare = (d.stage !== 'Counted' && selfConfBase > 0) ? selfConfIncentive * (confContrib / selfConfBase) : 0;
      let whichApplies, payable = 0, calcNote = '', noReason = '';
      if (d.stage === 'Counted') {
        if (d.type === 'Focus' && selfProvIncentive > 0) { whichApplies = 'provisional'; payable = 0.25 * provShare; calcNote = '25% × ' + fmtINR(provShare); }
        else if (d.type === 'Non-Focus' && selfProvIncentive > 0) { whichApplies = 'none'; noReason = 'Non-focus project'; }
        else { whichApplies = 'none'; noReason = 'No self revenue'; }
      } else {
        if (selfConfIncentive > 0) {
          const rawPct = d.collection / 100;
          const pct = (d.isLoggedIn && d.collection > 0) ? 1.0 : Math.max(0.5, rawPct);
          const confPay = pct * confShare;
          const advPay = (d.type === 'Focus' && selfProvIncentive > 0) ? 0.25 * provShare : 0;
          if (advPay > confPay) { whichApplies = 'provisional'; payable = advPay; calcNote = '25% × ' + fmtINR(provShare); }
          else {
            whichApplies = 'confirmed'; payable = confPay;
            calcNote = (d.isLoggedIn && d.collection > 0) ? '100% × ' + fmtINR(confShare) + ' (Logged In)' : fmtPct(pct * 100) + (rawPct < 0.5 ? ' (floor)' : '') + ' × ' + fmtINR(confShare);
          }
        } else if (d.type === 'Focus' && selfProvIncentive > 0) { whichApplies = 'provisional'; payable = 0.25 * provShare; calcNote = '25% × ' + fmtINR(provShare); }
        else if (d.type === 'Non-Focus' && selfProvIncentive > 0) { whichApplies = 'none'; noReason = 'Non-focus project'; }
        else { whichApplies = 'none'; noReason = 'No self revenue'; }
      }
      let payableBeforeShare = payable;
      let shareApplied = false;
      if (d.dealCategory === 'MCF' && d.sharePct !== undefined && d.sharePct !== null && d.sharePct !== 100 && payable > 0) {
        payable = payable * (d.sharePct / 100); shareApplied = true; calcNote = calcNote + ' × ' + d.sharePct + '% (share)';
      }
      return { deal: d, provShare, confShare, selfShare: Math.max(provShare, confShare), teamShare: 0, payable, payableBeforeShare, shareApplied, whichApplies, calcNote, noReason, cashPayable: 0.80 * payable, esopPayable: 0.20 * payable };
    }
    if (d.selfTeam === 'Team') {
      if (d.stage === 'Counted') return { deal: d, selfShare: 0, teamShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'Counted — not yet confirmed', cashPayable: 0, esopPayable: 0 };
      if (teamIncentive === 0) return { deal: d, selfShare: 0, teamShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: 'No team incentive this cycle', cashPayable: 0, esopPayable: 0 };
      const confContrib = (d.isLoggedIn && d.collection > 0) ? d.revenue * (d.collection / 100) : d.revenue;
      const share = teamConfBase > 0 ? teamIncentive * (confContrib / teamConfBase) : 0;
      let payable, calcNote;
      if (d.isLoggedIn && d.collection > 0) { payable = share; calcNote = '100% × ' + fmtINR(share) + ' (Logged In)'; }
      else { const rawPct = d.collection / 100; const pct = Math.max(0.5, rawPct); payable = pct * share; calcNote = fmtPct(pct * 100) + (rawPct < 0.5 ? ' (floor)' : '') + ' × ' + fmtINR(share); }
      let payableBeforeShare = payable;
      let shareApplied = false;
      if (d.dealCategory === 'MCF' && d.sharePct !== undefined && d.sharePct !== null && d.sharePct !== 100 && payable > 0) {
        payable = payable * (d.sharePct / 100); shareApplied = true; calcNote = calcNote + ' × ' + d.sharePct + '% (share)';
      }
      return { deal: d, selfShare: 0, teamShare: share, payable, payableBeforeShare, shareApplied, whichApplies: 'team', calcNote, noReason: '', cashPayable: 0.80 * payable, esopPayable: 0.20 * payable };
    }
    return { deal: d, selfShare: 0, teamShare: 0, payable: 0, whichApplies: 'none', calcNote: '', noReason: '', cashPayable: 0, esopPayable: 0 };
  });

  const selfPayable = dealResults.filter(dr => dr.deal.selfTeam === 'Self').reduce((s, dr) => s + dr.payable, 0);
  const teamPayable = dealResults.filter(dr => dr.deal.selfTeam === 'Team').reduce((s, dr) => s + dr.payable, 0);

  return {
    isT0T1: false,
    teamYtdCost, teamTarget, teamMultiplier, teamBelowPct, teamAbovePct,
    selfProvBase, selfProvIncentive, selfConfBase, selfConfIncentive, selfPayable,
    selfProvDeals, selfConfDeals,
    teamIncentive, teamConfBase, teamCrossed, teamPayable,
    teamBelowAmt, teamAboveAmt,
    teamAllBase, teamConfDeals,
    dealResults,
  };
}

function calculateIncentive(rm) {
  let blockCalcs, singleBlockResult, allDealResults, selfPayable, teamPayable;

  if (rm.blocks && rm.blocks.length > 0) {
    blockCalcs = rm.blocks.map(block => {
      const bc = _computeBlock(block.deals, block.tier, block.ytdCost);
      return { ...bc, tier: block.tier, startDate: block.startDate, endDate: block.endDate, ytdCost: block.ytdCost };
    });
    allDealResults = blockCalcs.flatMap(bc => bc.dealResults);
    selfPayable = blockCalcs.reduce((s, bc) => s + bc.selfPayable, 0);
    teamPayable = blockCalcs.reduce((s, bc) => s + bc.teamPayable, 0);
    singleBlockResult = null;
  } else {
    singleBlockResult = _computeBlock(rm.deals, rm.tier, rm.teamYtdCost);
    blockCalcs = null;
    allDealResults = singleBlockResult.dealResults;
    selfPayable = singleBlockResult.selfPayable;
    teamPayable = singleBlockResult.teamPayable;
  }

  const fyPayable = selfPayable + teamPayable;
  const fyCashPayable = 0.80 * fyPayable;
  const fyEsopPayable = 0.20 * fyPayable;

  const backYear = rm.backYearPayables || {total:0};
  const backYearTotal = backYear.total;
  const cumulativeCash = fyCashPayable + backYearTotal;
  const totalPayable = fyPayable + backYearTotal;

  const due = cumulativeCash - rm.alreadyPaid;
  const dueForRelease = !rm.hasPip && due > 0 ? due : 0;
  const cash = dueForRelease;
  const equity = 0;
  const totalIncentiveOverall = fyPayable + backYearTotal;
  const totalEsopOverall = fyEsopPayable;

  let overallScenario;
  if (rm.deals.length === 0) overallScenario = 'no_deals';
  else if (fyPayable === 0 && backYearTotal === 0) overallScenario = 'zero_payable';
  else if (totalPayable === 0) overallScenario = 'zero_payable';
  else if (due < 0) overallScenario = 'negative_due';
  else if (due === 0) overallScenario = 'nil_due';
  else if (rm.hasPip) overallScenario = 'held_pip';
  else overallScenario = 'positive';

  const coverage = computeCoveredRange(rm.ddDate, 0);
  const fy = fyFromDollarDay(rm.ddDate);

  return {
    ...(singleBlockResult || {}),
    ...(blockCalcs ? { blockCalcs } : {}),
    selfPayable, teamPayable,
    dealResults: allDealResults,
    fyPayable, fyCashPayable, fyEsopPayable,
    backYear, cumulativeCash, totalPayable,
    alreadyPaid: rm.alreadyPaid,
    due, dueForRelease, cash, equity,
    totalIncentiveOverall, totalEsopOverall,
    hasPip: rm.hasPip,
    overallScenario,
    ddLabel: ddMonthLabel(rm.ddDate),
    ddShort: ddMonthShort(rm.ddDate),
    coverage, fy,
  };
}

// ============================================================
// PDF/EMAIL TEMPLATE - T2/T3 version (Self + Team incentive)
// ============================================================
function generateEmailSubject(rm, c) {
  return c.ddLabel + ' Dollar Day - Incentive Statement - ' + rm.empCode;
}
function generateEmailPreheader(rm, c) {
  if (c.overallScenario === 'positive') return 'Your ' + c.ddLabel + ' Dollar Day calculation, step by step.';
  if (c.overallScenario === 'held_pip') return 'Calculated but pending PIP clearance.';
  return 'Your ' + c.ddLabel + ' Dollar Day breakdown.';
}

function generateEmailHtml(rm) {
  const c = rm.calc;
  const first = rm.name;
  const month = c.ddLabel || 'this cycle';
  const range = c.coverage ? c.coverage.rangeLabel : '';

  const T = {
    NAVY: '#0F1738', NAVY_SOFT: '#F4F5F9',
    BORDER: '#E2E8F0', BORDER_STRONG: '#CBD5E1',
    INK: '#1F2A44', INK_SOFT: '#475569', MUTED: '#64748B',
    GREEN: '#16A34A', GREEN_DEEP: '#166534', GREEN_SOFT: '#D1FAE5',
    ORANGE: '#E08A2B', ORANGE_DEEP: '#B45309', AMBER_SOFT: '#FEF3C7',
    RED: '#DC2626', RED_DEEP: '#B02E2E', RED_SOFT: '#FEE2E2',
    BG: '#F4F5F7', GOLD: '#FDB744', LINK: '#1D4ED8',
    BLUE: '#2563EB', BLUE_SOFT: '#DBEAFE', BLUE_DEEP: '#1E40AF',
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
  if (c.overallScenario === 'positive') {
    const cashDue = c.dueForRelease;
    const esopForDue = cashDue * 0.25;
    const totalForCycle = cashDue + esopForDue;
    return {
      bg: T.GREEN_SOFT, border: T.GREEN,
      label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE',
      big: fmtINRnoSym(totalForCycle),
      formula: fmtINR(totalForCycle) + ' = ' + fmtINR(cashDue) + ' (Cash in bank, 80%) + ' + fmtINR(esopForDue) + ' (ESOP, 20%)',
    };
  }
  if (c.overallScenario === 'held_pip') {
    return {
      bg: T.AMBER_SOFT, border: T.ORANGE,
      label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE',
      big: '0',
      formula: '₹0 disbursed this Dollar Day. Held pending PIP clearance.',
    };
  }
  if (c.overallScenario === 'negative_due') {
    return { bg: T.NAVY_SOFT, border: T.NAVY, label: 'NO DISBURSEMENT THIS CYCLE', big: '0', formula: 'Cumulative Payable is less than Already Paid, no clawback.' };
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
  let stepNo = 0;
  const nextNo = () => ++stepNo;
  const sectionH = (num, title) => `
    <tr><td class="pdf-section-start" style="padding: 24px 0 8px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <td style="background: ${T.NAVY}; color: white; font-family: ${T.MONO}; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 3px; letter-spacing: 0.3px;">STEP ${num}</td>
          <td style="padding-left: 10px; font-family: ${T.FONT}; font-size: 15.5px; font-weight: 700; color: ${T.NAVY};">${title}</td>
        </tr>
      </table>
    </td></tr>`;

  const sectionDivider = (label, color) => `
    <tr><td class="pdf-section-start" style="padding: 28px 0 12px 0;">
      <div style="background: ${color}; color: white; font-family: ${T.FONT}; font-size: 14px; font-weight: 700; padding: 10px 16px; border-radius: 6px; letter-spacing: 0.5px;">${label}</div>
    </td></tr>`;

  const bulletList = (items) => {
    let rows = '';
    items.forEach(item => {
      rows += `<tr>
        <td valign="top" style="width: 14px; padding: 3px 0 0 0; font-family: ${T.FONT}; font-size: 14px; color: ${T.NAVY}; line-height: 1.5;">•</td>
        <td style="padding: 3px 0 3px 4px; font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55;">${item}</td>
      </tr>`;
    });
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 4px 0;">${rows}</table>`;
  };

  const tcfCell = (d, opts = {}) => {
    const label = escapeHtml(d.tcfId);
    const linked = d.tcfLinkId
      ? `<a href="https://beats.squareyards.com/sales/tcf.aspx?id=${escapeHtml(d.tcfLinkId)}" target="_blank" rel="noopener" style="color: ${T.LINK}; text-decoration: underline; font-weight: 700;">${label}</a>`
      : label;
    return opts.withProject && d.projectName
      ? `${linked}<br><span style="font-family: ${T.FONT}; font-weight: 500; color: ${T.INK_SOFT}; font-size: 9px;">${escapeHtml(d.projectName)}</span>`
      : linked;
  };

  const formulaCard = (label, lines) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 12px 0 8px 0;">
      <tr><td style="background: ${T.NAVY}; padding: 14px 16px; border-radius: 6px;">
        <div style="font-family: ${T.FONT}; font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 1px; margin-bottom: 8px;">${label}</div>
        <div style="font-family: ${T.MONO}; font-size: 12.5px; color: white; line-height: 1.85;">${lines.join('<br>')}</div>
      </td></tr>
    </table>`;

  const tcfListWithStage = (deals) => deals.map(d => `${escapeHtml(d.tcfId)} (${d.isLoggedIn ? 'Logged In' : d.stage})`).join(', ');
  const confSumFormula = (deals) => deals.map(d => {
    if (d.isLoggedIn && d.collection > 0) return `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)} × ${fmtPct(d.collection)} = ${fmtL(d.revenue * d.collection / 100)})`;
    return `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)})`;
  }).join(' + ');

  // Slab visual for Team Incentive
  const slabVisual = (targetAmt, revenueAmt, incentiveAmt, belowPct, abovePct, incentiveLabel, blockTier) => {
    const belowLabel = (belowPct * 100) + '%';
    const aboveLabel = (abovePct * 100) + '%';
    const belowAmt = belowPct * Math.min(revenueAmt, targetAmt);
    const excess = Math.max(0, revenueAmt - targetAmt);
    const aboveAmt = abovePct * excess;

    let targetWidth, excessWidth, state;
    if (Math.abs(revenueAmt - targetAmt) < 0.5 && revenueAmt > 0) {
      state = 'at_target';
      targetWidth = 55; excessWidth = 45;
    } else if (revenueAmt > targetAmt) {
      state = 'crosses';
      const tp = Math.round(100 * targetAmt / revenueAmt);
      targetWidth = Math.min(70, Math.max(25, tp));
      excessWidth = 100 - targetWidth;
    } else {
      state = 'below_target';
      targetWidth = 60; excessWidth = 40;
    }

    const MUTED_BG = '#F1F5F9';
    const MUTED_BG2 = '#F8FAFC';
    const MUTED_BORDER = '#CBD5E1';
    const MUTED_TEXT = '#94A3B8';

    const leftActive = state !== 'below_target' && revenueAmt > 0;
    const rightActive = (state === 'crosses');

    const leftBg = leftActive ? T.GREEN_SOFT : MUTED_BG;
    const leftBorder = leftActive ? T.GREEN : MUTED_BORDER;
    const leftTextColor = leftActive ? T.GREEN_DEEP : MUTED_TEXT;
    const leftDivider = (state === 'crosses') ? '2.5px solid ' + T.ORANGE : '2.5px solid ' + MUTED_BORDER;

    const rightBg = rightActive ? T.AMBER_SOFT : MUTED_BG2;
    const rightBorder = rightActive ? T.ORANGE : MUTED_BORDER;
    const rightTextColor = rightActive ? T.ORANGE_DEEP : MUTED_TEXT;

    const revenueTopLabel = (state !== 'below_target')
      ? `<td width="${excessWidth}%" style="padding: 0 0 4px 0; font-family: ${T.FONT}; font-size: 10.5px; color: ${T.GREEN_DEEP}; font-weight: 700; letter-spacing: 0.5px; text-align: right; white-space: nowrap;">REVENUE · ${fmtL(revenueAmt)}</td>`
      : `<td width="${excessWidth}%" style="padding: 0 0 4px 0;">&nbsp;</td>`;

    let revenueMarkerRow = '';
    if (state === 'below_target' && revenueAmt > 0) {
      const markerPos = targetAmt > 0 ? (revenueAmt / targetAmt) * targetWidth : 0;
      revenueMarkerRow = `
        <tr><td colspan="2" style="padding: 0 0 6px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            <tr>
              <td width="${markerPos}%" style="padding: 0;">&nbsp;</td>
              <td width="0%" style="padding: 0; white-space: nowrap; vertical-align: bottom;">
                <div style="display: inline-block; background: ${T.GREEN}; color: white; padding: 3px 8px; border-radius: 3px; font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.3px; transform: translateX(-50%); white-space: nowrap;">REVENUE · ${fmtL(revenueAmt)}</div>
              </td>
              <td width="${100 - markerPos}%" style="padding: 0;">&nbsp;</td>
            </tr>
          </table>
        </td></tr>`;
    }

    const leftBarContent = `<td width="${targetWidth}%" style="background: ${leftBg}; border: 1.5px solid ${leftBorder}; border-right: ${leftDivider}; text-align: center; font-family: ${T.FONT}; font-size: 20px; font-weight: 700; color: ${leftTextColor}; height: 46px; vertical-align: middle;">${belowLabel}</td>`;
    const rightBarContent = `<td width="${excessWidth}%" style="background: ${rightBg}; border: 1.5px solid ${rightBorder}; border-left: none; text-align: center; font-family: ${T.FONT}; font-size: 20px; font-weight: 700; color: ${rightTextColor}; height: 46px; vertical-align: middle;">${aboveLabel}</td>`;

    const pillBg = (state === 'below_target') ? MUTED_BG : '#EFF4FA';
    const pillBorder = (state === 'below_target') ? MUTED_BORDER : T.NAVY;
    const pillColor = (state === 'below_target') ? T.INK_SOFT : T.NAVY;
    const pillContent = (state === 'below_target')
      ? `${incentiveLabel} = ₹0 <span style="font-family: ${T.FONT}; font-weight: 500; font-style: italic; font-size: 12px; color: ${T.MUTED};">· revenue below target</span>`
      : `${incentiveLabel} = ${fmtINR(belowAmt)} + ${fmtINR(aboveAmt)} = ${fmtINR(incentiveAmt)}`;

    const _st = blockTier || rm.tier;
    const slabMultiplierLabel = (_st === 'T0' || _st === 'T1') ? 'SMx 5×' : _st === 'T2' ? 'SMx 4×' : 'SMx 3×';

    const dashedLineDiv = state === 'below_target' && revenueAmt > 0
      ? `<div style="position: absolute; left: ${(revenueAmt / targetAmt * targetWidth).toFixed(2)}%; top: 26px; height: 78px; border-left: 2px dashed ${T.RED}; z-index: 5; pointer-events: none;"></div>`
      : '';
    const wrapperOpen = state === 'below_target' ? `<div style="position: relative;">` : '';
    const wrapperClose = state === 'below_target' ? `${dashedLineDiv}</div>` : '';

    return `${wrapperOpen}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 12px 0 6px 0;">
        ${revenueMarkerRow}
        <tr>
          <td width="${targetWidth}%" style="padding: 0 0 4px 0; font-family: ${T.FONT}; font-size: 10.5px; color: ${T.ORANGE_DEEP}; font-weight: 700; letter-spacing: 0.5px; text-align: right; white-space: nowrap;">ELIGIBILITY TARGET (${slabMultiplierLabel}) · ${fmtL(targetAmt)}</td>
          ${revenueTopLabel}
        </tr>
        <tr>${leftBarContent}${rightBarContent}</tr>
        <tr>
          <td colspan="2" style="padding: 3px 0 0 0; font-family: ${T.MONO}; font-size: 10.5px; color: ${T.INK_SOFT};">₹0</td>
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
          <td width="${targetWidth}%" style="padding: 6px 6px 0 6px; font-family: ${T.MONO}; font-size: 11.5px; color: ${leftTextColor}; text-align: center;">${leftActive ? `${belowLabel} × ${fmtL(Math.min(revenueAmt, targetAmt))} = <strong>${fmtINR(belowAmt)}</strong>` : '<strong>₹0</strong>'}</td>
          <td width="${excessWidth}%" style="padding: 6px 6px 0 6px; font-family: ${T.MONO}; font-size: 11.5px; color: ${rightTextColor}; text-align: center;">${aboveLabel} × ${excess > 0 ? fmtL(excess) : '₹0'} = <strong>${fmtINR(aboveAmt)}</strong></td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 14px;">
            <div style="background: ${pillBg}; border: 1.5px solid ${pillBorder}; color: ${pillColor}; padding: 10px 14px; border-radius: 20px; text-align: center; font-family: ${T.FONT}; font-size: 13.5px; font-weight: 700;">${pillContent}</div>
          </td>
        </tr>
      </table>${wrapperClose}`;
  };

  // Deal table builder (reused for self and team sections)
  const buildDealTable = (deals, label) => {
    if (deals.length === 0) return bulletList([`No ${label} deals in ${rangeLabel}.`]);
    let rows = '';
    deals.forEach(d => {
      const stageLabel = d.isLoggedIn ? 'Logged In' : d.stage;
      const stgBg = d.isLoggedIn ? '#DBEAFE' : d.stage === 'Collected' ? T.GREEN_SOFT : d.stage === 'Confirmed' ? T.AMBER_SOFT : d.stage === 'Not counted' ? T.RED_SOFT : '#EEF2F7';
      const stgFg = d.isLoggedIn ? '#1E40AF' : d.stage === 'Collected' ? T.GREEN_DEEP : d.stage === 'Confirmed' ? T.ORANGE_DEEP : d.stage === 'Not counted' ? T.RED_DEEP : T.INK_SOFT;
      const typBg = d.type === 'Focus' ? T.GREEN_SOFT : T.RED_SOFT;
      const typFg = d.type === 'Focus' ? T.GREEN_DEEP : T.RED_DEEP;
      rows += `<tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 11.5px; color: ${T.INK};">${tcfCell(d)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; text-align: right; color: ${T.INK};">${fmtINR(d.revenue)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.FONT}; font-size: 12px; text-align: center; color: ${T.INK_SOFT};">${d.month || '-'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; text-align: center;"><span style="background: ${stgBg}; color: ${stgFg}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">${stageLabel}</span></td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; text-align: center;"><span style="background: ${typBg}; color: ${typFg}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">${d.type}</span></td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; text-align: right; color: ${T.INK};">${d.collection !== null ? fmtPct(d.collection) : '-'}</td>
      </tr>`;
    });
    return `
      ${bulletList([`${deals.length} ${label} deal(s) in <strong>${rangeLabel}</strong>.`])}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden; margin-top: 8px;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 11px; color: white; font-family: ${T.FONT};">TCF ID</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 11px; color: white; font-family: ${T.FONT};">Deal Revenue</th>
          <th style="padding: 9px 10px; text-align: center; font-size: 11px; color: white; font-family: ${T.FONT};">Deal Month</th>
          <th style="padding: 9px 10px; text-align: center; font-size: 11px; color: white; font-family: ${T.FONT};">Stage</th>
          <th style="padding: 9px 10px; text-align: center; font-size: 11px; color: white; font-family: ${T.FONT};">Project Type</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 11px; color: white; font-family: ${T.FONT};">Collection %</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  };

  // Per-deal payable table for a stream (self or team) — T0-style 6-column layout
  const buildPerDealTable = (dealResults, incentiveAmt, base, streamLabel, totalPayable) => {
    if (dealResults.length === 0 || incentiveAmt === 0) return '';
    let rows = '';
    dealResults.forEach(dr => {
      const d = dr.deal;
      const isCounted = d.stage === 'Not counted' || d.stage === 'Counted';
      const stageLabel = d.isLoggedIn ? 'Logged In' : d.stage;
      const shareTag = d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : '';
      const dealShare = !isCounted && base > 0 ? Math.round(incentiveAmt * d.revenue / base) : 0;
      const effColl = d.isLoggedIn ? 100 : Math.max(50, d.collection || 0);

      const confShareCell = isCounted
        ? `<div style="font-family: ${T.MONO}; font-size: 11px; font-weight: 700; color: ${T.MUTED}; text-align: left;">—</div>`
        : `<div style="font-family: ${T.MONO}; font-size: 9.5px; color: ${T.MUTED}; text-align: left; line-height: 1.35;">${fmtINR(incentiveAmt)} × (${fmtL(d.revenue)} ÷ ${fmtL(base)})</div><div style="font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.NAVY}; text-align: left; margin-top: 3px;">= ${fmtINR(dealShare)}</div>`;

      const whichCell = isCounted
        ? `<span style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.MUTED};">N/A</span>`
        : `<span style="font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.NAVY};">${fmtPct(d.collection)}</span>`;

      const finalCell = isCounted
        ? `<div style="font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.INK}; text-align: left;">₹0</div>`
        : dr.payable > 0
          ? `<div style="font-family: ${T.MONO}; font-size: 9.5px; color: ${T.MUTED}; text-align: left; line-height: 1.3;">${effColl}% × ${fmtINR(dealShare)}</div><div style="font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.NAVY}; text-align: left; margin-top: 3px;">= ${fmtINR(dr.payable)}</div>`
          : `<div style="font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.INK}; text-align: left;">₹0</div>`;

      rows += `<tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK}; vertical-align: middle;">${tcfCell(d, { withProject: true })}${shareTag}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 10.5px; text-align: left; color: ${T.INK}; vertical-align: middle; white-space: nowrap;">${fmtINR(d.revenue)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.FONT}; font-size: 11px; text-align: left; color: ${T.INK_SOFT}; vertical-align: middle;">${stageLabel}<br>${d.type}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; text-align: left; vertical-align: middle;">${whichCell}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: left; background: transparent;">${confShareCell}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; text-align: left; vertical-align: middle;">${finalCell}</td>
      </tr>`;
    });
    const totalRow = `<tr style="background: ${T.NAVY_SOFT};">
      <td colspan="5" style="padding: 12px; font-family: ${T.FONT}; font-size: 13px; font-weight: 700; color: ${T.NAVY}; text-align: left;">Total ${streamLabel} Payable</td>
      <td style="padding: 12px; font-family: ${T.MONO}; font-size: 14px; font-weight: 700; color: ${T.NAVY}; text-align: left;">${fmtINR(totalPayable)}</td>
    </tr>`;
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">TCF ID</th>
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Deal Revenue</th>
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Stage &amp; Type</th>
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Collection %</th>
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Confirmed Deal Incentive Share<div style="font-family: ${T.MONO}; font-size: 9.5px; font-weight: 500; color: rgba(255,255,255,0.6); margin-top: 3px; line-height: 1.35;">Conf Inc × Deal Rev ÷ Total Conf Rev</div></th>
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Final Payable</th>
        </tr></thead>
        <tbody>${rows}${totalRow}</tbody>
      </table>`;
  };

  // Cash/ESOP breakup table for a stream
  const buildBreakupTable = (dealResults, totalPayable, cashTotal, esopTotal) => {
    if (totalPayable <= 0) return '';
    let breakupRows = '';
    dealResults.forEach(dr => {
      if (dr.payable <= 0) return;
      breakupRows += `<tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 10.5px; color: ${T.INK};">${tcfCell(dr.deal)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(dr.payable)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.GREEN_DEEP}; text-align: right;">${fmtINR(dr.cashPayable)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 12px; font-weight: 700; color: ${T.ORANGE_DEEP}; text-align: right;">${fmtINR(dr.esopPayable)}</td>
      </tr>`;
    });
    const breakupTotalRow = `<tr style="background: ${T.NAVY_SOFT};">
      <td style="padding: 10px; font-family: ${T.FONT}; font-size: 12px; font-weight: 700; color: ${T.NAVY};">Total Payable</td>
      <td style="padding: 10px; font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(totalPayable)}</td>
      <td style="padding: 10px; font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.GREEN_DEEP}; text-align: right;">${fmtINR(cashTotal)}</td>
      <td style="padding: 10px; font-family: ${T.MONO}; font-size: 13px; font-weight: 700; color: ${T.ORANGE_DEEP}; text-align: right;">${fmtINR(esopTotal)}</td>
    </tr>`;
    return `
      <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; margin: 16px 0 6px 0; font-weight: 700;">Monetary &amp; ESOP breakup <span style="font-size: 11px; color: ${T.INK_SOFT}; font-weight: 500;">- 80% cash in bank, 20% ESOP per deal</span></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT};">TCF ID</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Final Payable</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Monetary <span style="font-weight: 500; color: rgba(255,255,255,0.7);">(80%)</span></th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">ESOP <span style="font-weight: 500; color: rgba(255,255,255,0.7);">(20%)</span></th>
        </tr></thead>
        <tbody>${breakupRows}${breakupTotalRow}</tbody>
      </table>`;
  };

  // Flow chart (3-box diagram: [label] → Deal Incentive Share → Payable)
  const buildFlowDiagram = (incentiveAmt, label = 'Confirmed Incentive') => {
    if (incentiveAmt <= 0) return '';
    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 10px 0;"><tr>
        <td style="background: ${T.NAVY_SOFT}; border: 1.5px solid ${T.NAVY}; border-radius: 6px; padding: 10px 6px; text-align: center; vertical-align: middle;">
          <div style="font-family: ${T.FONT}; font-size: 11.5px; font-weight: 700; color: ${T.NAVY}; line-height: 1.3;">${label}</div>
          <div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.INK_SOFT}; margin-top: 3px;">${fmtINR(incentiveAmt)}</div>
        </td>
        <td style="width: 20px; text-align: center; vertical-align: middle; font-family: ${T.MONO}; font-size: 18px; color: ${T.NAVY}; font-weight: 700;">→</td>
        <td style="background: ${T.NAVY_SOFT}; border: 1.5px solid ${T.NAVY}; border-radius: 6px; padding: 10px 6px; text-align: center; vertical-align: middle;">
          <div style="font-family: ${T.FONT}; font-size: 11.5px; font-weight: 700; color: ${T.NAVY}; line-height: 1.3;">Deal Incentive Share</div>
          <div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.INK_SOFT}; margin-top: 3px;">Incentive × Rev÷Total</div>
        </td>
        <td style="width: 20px; text-align: center; vertical-align: middle; font-family: ${T.MONO}; font-size: 18px; color: ${T.NAVY}; font-weight: 700;">→</td>
        <td style="background: ${T.NAVY_SOFT}; border: 1.5px solid ${T.NAVY}; border-radius: 6px; padding: 10px 6px; text-align: center; vertical-align: middle;">
          <div style="font-family: ${T.FONT}; font-size: 11.5px; font-weight: 700; color: ${T.NAVY}; line-height: 1.3;">Payable</div>
          <div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.INK_SOFT}; margin-top: 3px;">Payout will be based on whichever is higher: 50% or actual collection.</div>
        </td>
      </tr></table>`;
  };

  // =====================================
  // PROMOTION BLOCK HTML GENERATOR
  // =====================================
  const isPromo = rm.blocks && rm.blocks.length > 0;

  const buildPromoBlockCard = (bc, block, bi) => {
    const bTier = bc.tier;
    const bIsT0T1 = bc.isT0T1;
    const bIsT2 = bTier === 'T2';
    const bMultLabel = bIsT0T1 ? 'SMx 5×' : (bIsT2 ? 'SMx 4×' : 'SMx 3×');
    const bMultNum = bIsT0T1 ? '5' : (bIsT2 ? '4' : '3');
    const bRange = fmtBlockDateRange(block);
    const bSelfDeals = block.deals.filter(d => d.selfTeam === 'Self');
    const bSelfDR = bc.dealResults.filter(dr => dr.deal.selfTeam === 'Self');
    const blockPay = bc.selfPayable + bc.teamPayable;

    let stepsHtml = '';

    // --- T0/T1 block: NO team section, slab-based self calc ---
    if (bIsT0T1) {
      stepsHtml += sectionH(nextNo(), 'YTD Salary Cost and Eligibility Target') + `<tr><td style="padding: 4px 0 12px 0;">
        ${bulletList([
          '<strong>YTD Salary Cost</strong> = cumulative salary cost for the block period.',
          '<strong>Eligibility Target</strong> = 5 × YTD Salary Cost. Revenue must cross this to earn incentive.'
        ])}
        <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
          YTD Salary Cost = <strong style="color: ${T.NAVY};">${fmtINR(bc.teamYtdCost)}</strong><br>
          Eligibility Target (${bMultLabel}) = 5 × ${fmtINR(bc.teamYtdCost)} = <strong style="color: ${T.NAVY};">${fmtINR(bc.eligibilityTarget)}</strong>
        </div>
      </td></tr>`;

      // All deals (team deals shown with "no incentive" note)
      const allDeals = block.deals;
      stepsHtml += sectionH(nextNo(), 'Deals in this block') + `<tr><td style="padding: 4px 0 12px 0;">${buildDealTable(allDeals, 'All')}</td></tr>`;

      // Provisional + Confirmed incentive (slab-based)
      if (allDeals.length > 0) {
        const bSPL = bc.selfProvDeals || bSelfDeals.filter(d => d.stage !== 'Not counted');
        const bSCL = bc.selfConfDeals || bSelfDeals.filter(d => d.stage === 'Confirmed' || d.stage === 'Collected');
        const sf = (deals) => deals.map(d => escapeHtml(d.tcfId) + ' (' + fmtL(d.revenue) + ')').join(' + ');

        // Team deals note
        const teamDeals = block.deals.filter(d => d.selfTeam === 'Team');
        const teamNote = teamDeals.length > 0 ? '<strong>Note:</strong> Team deals (' + teamDeals.map(d => escapeHtml(d.tcfId)).join(', ') + ') get ₹0 — no incentive on team deals in ' + bTier + '.' : '';

        let provBlock;
        if (bSPL.length === 0) {
          provBlock = bulletList(['<strong>Provisional Incentive = ₹0.</strong>']);
        } else if (bc.selfProvIncentive === 0) {
          provBlock = bulletList([
            '<strong>Eligibility Target (' + bMultLabel + '):</strong> ' + fmtINR(bc.eligibilityTarget),
            '<strong>Total Provisional Revenue:</strong> ' + sf(bSPL) + ' = ' + fmtINR(bc.selfProvBase),
            '<strong style="color: ' + T.RED_DEEP + ';">Did not cross target</strong> → Provisional Incentive = ₹0.'
          ]) + slabVisual(bc.eligibilityTarget, bc.selfProvBase, 0, 0.05, 0.40, 'Provisional Incentive', bTier);
        } else {
          const crossNote = bc.selfProvBase > bc.eligibilityTarget
            ? '<strong>Crosses target</strong> by ' + fmtINR(bc.selfProvBase - bc.eligibilityTarget)
            : '<strong>Exactly at target</strong> — 5% of target applies.';
          provBlock = bulletList([
            '<strong>Eligibility Target (' + bMultLabel + '):</strong> ' + fmtINR(bc.eligibilityTarget),
            '<strong>Total Provisional Revenue:</strong> ' + sf(bSPL) + ' = ' + fmtINR(bc.selfProvBase),
            crossNote
          ]) + slabVisual(bc.eligibilityTarget, bc.selfProvBase, bc.selfProvIncentive, 0.05, 0.40, 'Provisional Incentive', bTier);
        }

        let confBlock;
        if (bSCL.length === 0) {
          confBlock = bulletList(['No Confirmed/Collected self deals. <strong>Confirmed Incentive = ₹0.</strong>']);
        } else if (bc.selfConfIncentive === 0) {
          confBlock = bulletList([
            '<strong>Eligibility Target (' + bMultLabel + '):</strong> ' + fmtINR(bc.eligibilityTarget),
            '<strong>Total Confirmed Revenue:</strong> ' + confSumFormula(bSCL) + ' = ' + fmtINR(bc.selfConfBase),
            '<strong style="color: ' + T.RED_DEEP + ';">Did not cross target</strong> → Confirmed Incentive = ₹0.'
          ]) + slabVisual(bc.eligibilityTarget, bc.selfConfBase, 0, 0.05, 0.40, 'Confirmed Incentive', bTier);
        } else {
          const crossNote = bc.selfConfBase > bc.eligibilityTarget
            ? '<strong>Crosses target</strong> by ' + fmtINR(bc.selfConfBase - bc.eligibilityTarget)
            : '<strong>Exactly at target</strong> — 5% of target applies.';
          confBlock = bulletList([
            '<strong>Eligibility Target (' + bMultLabel + '):</strong> ' + fmtINR(bc.eligibilityTarget),
            '<strong>Total Confirmed Revenue:</strong> ' + confSumFormula(bSCL) + ' = ' + fmtINR(bc.selfConfBase),
            crossNote
          ]) + slabVisual(bc.eligibilityTarget, bc.selfConfBase, bc.selfConfIncentive, 0.05, 0.40, 'Confirmed Incentive', bTier);
        }

        stepsHtml += sectionH(nextNo(), 'Both Incentives — Provisional and Confirmed') + `<tr><td style="padding: 4px 0 12px 0;">
          ${bulletList([
            'Two incentives computed: <strong>Provisional</strong> (all Self deals excl. Not counted) and <strong>Confirmed</strong> (Confirmed/Collected Self deals).',
            '<strong>Rule:</strong> 5% × Eligibility Target + 40% × (Revenue − Eligibility Target). Must cross target first.'
          ])}
          ${teamNote ? '<p style="font-family: ' + T.FONT + '; font-size: 12px; color: ' + T.MUTED + '; margin: 8px 0;">' + teamNote + '</p>' : ''}
          <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive</p>
          ${provBlock}
          <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 16px 0 6px 0; font-weight: 700;">Confirmed Incentive</p>
          ${confBlock}
        </td></tr>`;

        if (bc.selfProvIncentive > 0 || bc.selfConfIncentive > 0) {
          let selfPayRows = '';
          bSelfDR.forEach(dr => {
            const d = dr.deal;
            const stg = d.isLoggedIn ? 'Logged In' : d.stage;
            const shareTag = d.sharePct !== 100 ? '<br><span style="font-family: ' + T.FONT + '; font-size: 9px; color: ' + T.ORANGE_DEEP + '; font-weight: 700;">Share ' + d.sharePct + '%</span>' : '';
            let whichCell;
            if (dr.whichApplies === 'provisional') whichCell = '<strong style="color: ' + T.GREEN_DEEP + ';">Provisional</strong>';
            else if (dr.whichApplies === 'confirmed') whichCell = '<strong style="color: ' + T.ORANGE_DEEP + ';">Confirmed</strong>';
            else whichCell = '<strong style="color: ' + T.MUTED + ';">—</strong>' + (dr.noReason ? '<br><span style="font-size: 10px; color: ' + T.MUTED + '; font-style: italic;">' + escapeHtml(dr.noReason) + '</span>' : '');
            selfPayRows += '<tr>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.MONO + '; font-size: 10.5px; color: ' + T.INK + ';">' + tcfCell(d) + shareTag + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.MONO + '; font-size: 12px; text-align: right; color: ' + T.INK + ';">' + fmtINR(d.revenue) + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.FONT + '; font-size: 11px; text-align: center; color: ' + T.INK_SOFT + ';">' + stg + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.FONT + '; font-size: 11px; text-align: center;">' + whichCell + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.MONO + '; font-size: 12px; font-weight: 700; text-align: right; color: ' + T.NAVY + ';">' + fmtINR(dr.payable) + '</td>' +
              '</tr>';
          });
          const selfTotalRow = '<tr style="background: ' + T.NAVY_SOFT + ';"><td colspan="4" style="padding: 12px; font-family: ' + T.FONT + '; font-size: 13px; font-weight: 700; color: ' + T.NAVY + ';">Total Self Payable</td><td style="padding: 12px; font-family: ' + T.MONO + '; font-size: 14px; font-weight: 700; color: ' + T.NAVY + '; text-align: right;">' + fmtINR(bc.selfPayable) + '</td></tr>';
          stepsHtml += sectionH(nextNo(), 'Per-deal payable') + `<tr><td style="padding: 4px 0 12px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
              <thead><tr style="background: ${T.NAVY};">
                <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT};">TCF ID</th>
                <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Revenue</th>
                <th style="padding: 9px 10px; text-align: center; font-size: 10.5px; color: white; font-family: ${T.FONT};">Stage</th>
                <th style="padding: 9px 10px; text-align: center; font-size: 10.5px; color: white; font-family: ${T.FONT};">Which Applies</th>
                <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Payable</th>
              </tr></thead>
              <tbody>${selfPayRows}${selfTotalRow}</tbody>
            </table>
            ${buildBreakupTable(bSelfDR, bc.selfPayable, 0.80 * bc.selfPayable, 0.20 * bc.selfPayable)}
          </td></tr>`;
        }
      } else {
        stepsHtml += sectionH(nextNo(), 'Both Incentives — Provisional and Confirmed') + `<tr><td style="padding: 4px 0 12px 0;">${bulletList(['No deals in this block. Incentive = ₹0.'])}</td></tr>`;
      }

      // Block total (T0/T1: self only, no team line)
      stepsHtml += sectionH(nextNo(), 'Block ' + (bi + 1) + ' Payable') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
          <strong>Block ${bi + 1} Total Payable = <span style="color: ${T.NAVY};">${fmtINR(blockPay)}</span></strong>
        </div>
      </td></tr>`;

    } else {
      // --- T2/T3 block: original logic with team + self sections ---
      const bTeamDeals = block.deals.filter(d => d.selfTeam === 'Team');
      const bTeamDR = bc.dealResults.filter(dr => dr.deal.selfTeam === 'Team');

      let teamSteps = sectionDivider('SECTION A · TEAM INCENTIVE', T.ORANGE_DEEP);
      teamSteps += sectionH(nextNo(), 'Team YTD Cost and Eligibility Target') + `<tr><td style="padding: 4px 0 12px 0;">
        ${bulletList([
          '<strong>Self+Team YTD Cost</strong> = cumulative salary cost.',
          '<strong>Eligibility Target</strong> = ' + bMultNum + ' × (Self+Team YTD Cost).',
          'Revenue must cross this to earn incentive.'
        ])}
        <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
          Self+Team YTD Cost = <strong style="color: ${T.NAVY};">${fmtINR(bc.teamYtdCost)}</strong><br>
          Eligibility Target (${bMultLabel}) = ${bMultNum} × ${fmtINR(bc.teamYtdCost)} = <strong style="color: ${T.NAVY};">${fmtINR(bc.teamTarget)}</strong>
        </div>
      </td></tr>`;
      teamSteps += sectionH(nextNo(), 'Team Deals') + `<tr><td style="padding: 4px 0 12px 0;">${buildDealTable(bTeamDeals, 'Team')}</td></tr>`;
      if (bTeamDeals.length > 0) {
        const bTCDL = bc.teamConfDeals || bTeamDeals.filter(d => d.stage === 'Confirmed' || d.stage === 'Collected');
        const crossNote = bc.teamCrossed
          ? `<strong style="color: ${T.GREEN_DEEP};">Crosses target</strong> by ${fmtINR(bc.teamConfBase - bc.teamTarget)}`
          : bc.teamConfBase > 0 ? 'Revenue is <strong>below target</strong>.' : 'No confirmed team revenue.';
        teamSteps += sectionH(nextNo(), 'Confirmed Incentive (Team) Calculation') + `<tr><td style="padding: 4px 0 12px 0;">
          ${bulletList([
            '<strong>Confirmed Team Revenue:</strong> ' + (bTCDL.length > 0 ? confSumFormula(bTCDL) + ' = ' + fmtINR(bc.teamConfBase) : '₹0'),
            '<strong>Eligibility Target (' + bMultLabel + '):</strong> ' + fmtINR(bc.teamTarget),
            crossNote
          ])}
          ${bc.teamTarget > 0 ? slabVisual(bc.teamTarget, bc.teamConfBase, bc.teamIncentive, bc.teamBelowPct, bc.teamAbovePct, 'Confirmed Incentive (Team)', bTier) : ''}
        </td></tr>`;
        if (bc.teamIncentive > 0) {
          teamSteps += sectionH(nextNo(), 'Per-deal payable (Team)') + `<tr><td style="padding: 4px 0 12px 0;">
            ${buildPerDealTable(bTeamDR, bc.teamIncentive, bc.teamConfBase, 'Team', bc.teamPayable)}
            ${buildBreakupTable(bTeamDR, bc.teamPayable, 0.80 * bc.teamPayable, 0.20 * bc.teamPayable)}
          </td></tr>`;
        }
      } else {
        teamSteps += sectionH(nextNo(), 'Confirmed Incentive (Team) Calculation') + `<tr><td style="padding: 4px 0 12px 0;">${bulletList(['No team deals in this block. Confirmed Incentive (Team) = ₹0.'])}</td></tr>`;
      }

      let selfSteps = sectionDivider('SECTION B · SELF INCENTIVE', T.ORANGE_DEEP);
      selfSteps += sectionH(nextNo(), 'Self Deals') + `<tr><td style="padding: 4px 0 12px 0;">${buildDealTable(bSelfDeals, 'Self')}</td></tr>`;
      if (bSelfDeals.length > 0) {
        const bSPL = bc.selfProvDeals || bSelfDeals.filter(d => d.stage !== 'Not counted');
        const bSCL = bc.selfConfDeals || bSelfDeals.filter(d => d.stage === 'Confirmed' || d.stage === 'Collected');
        const sf = (deals) => deals.map(d => escapeHtml(d.tcfId) + ' (' + fmtL(d.revenue) + ')').join(' + ');
        selfSteps += sectionH(nextNo(), 'Both Incentives — Provisional and Confirmed (Self)') + `<tr><td style="padding: 4px 0 12px 0;">
          ${bulletList([
            'Two incentives computed: <strong>Provisional</strong> (all Self deals) and <strong>Confirmed</strong> (Confirmed/Collected Self deals).',
            '<strong>Rule:</strong> 5% × total self deal revenue (flat rate).'
          ])}
          <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive (Self)</p>
          ${bSPL.length === 0 ? bulletList(['<strong>Provisional Incentive (Self) = ₹0.</strong>'])
            : bulletList([
                '<strong>Total Provisional Self Revenue:</strong> ' + sf(bSPL) + ' = ' + fmtINR(bc.selfProvBase),
                '<strong>Provisional Incentive (Self) = 5% × ' + fmtINR(bc.selfProvBase) + ' = ' + fmtINR(bc.selfProvIncentive) + '</strong>'
              ])}
          <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 16px 0 6px 0; font-weight: 700;">Confirmed Incentive (Self)</p>
          ${bSCL.length === 0 ? bulletList(['No Confirmed/Collected self deals. <strong>Confirmed Incentive (Self) = ₹0.</strong>'])
            : bulletList([
                '<strong>Total Confirmed Self Revenue:</strong> ' + confSumFormula(bSCL) + ' = ' + fmtINR(bc.selfConfBase),
                '<strong>Confirmed Incentive (Self) = 5% × ' + fmtINR(bc.selfConfBase) + ' = ' + fmtINR(bc.selfConfIncentive) + '</strong>'
              ])}
        </td></tr>`;
        if (bc.selfProvIncentive > 0 || bc.selfConfIncentive > 0) {
          let selfPayRows = '';
          bSelfDR.forEach(dr => {
            const d = dr.deal;
            const stg = d.isLoggedIn ? 'Logged In' : d.stage;
            const shareTag = d.sharePct !== 100 ? '<br><span style="font-family: ' + T.FONT + '; font-size: 9px; color: ' + T.ORANGE_DEEP + '; font-weight: 700;">Share ' + d.sharePct + '%</span>' : '';
            let whichCell;
            if (dr.whichApplies === 'provisional') whichCell = '<strong style="color: ' + T.GREEN_DEEP + ';">Provisional</strong>';
            else if (dr.whichApplies === 'confirmed') whichCell = '<strong style="color: ' + T.ORANGE_DEEP + ';">Confirmed</strong>';
            else whichCell = '<strong style="color: ' + T.MUTED + ';">—</strong>' + (dr.noReason ? '<br><span style="font-size: 10px; color: ' + T.MUTED + '; font-style: italic;">' + escapeHtml(dr.noReason) + '</span>' : '');
            selfPayRows += '<tr>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.MONO + '; font-size: 10.5px; color: ' + T.INK + ';">' + tcfCell(d) + shareTag + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.MONO + '; font-size: 12px; text-align: right; color: ' + T.INK + ';">' + fmtINR(d.revenue) + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.FONT + '; font-size: 11px; text-align: center; color: ' + T.INK_SOFT + ';">' + stg + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.FONT + '; font-size: 11px; text-align: center;">' + whichCell + '</td>' +
              '<td style="padding: 8px 10px; border-bottom: 1px solid ' + T.BORDER + '; font-family: ' + T.MONO + '; font-size: 12px; font-weight: 700; text-align: right; color: ' + T.NAVY + ';">' + fmtINR(dr.payable) + '</td>' +
              '</tr>';
          });
          const selfTotalRow = '<tr style="background: ' + T.NAVY_SOFT + ';"><td colspan="4" style="padding: 12px; font-family: ' + T.FONT + '; font-size: 13px; font-weight: 700; color: ' + T.NAVY + ';">Total Self Payable</td><td style="padding: 12px; font-family: ' + T.MONO + '; font-size: 14px; font-weight: 700; color: ' + T.NAVY + '; text-align: right;">' + fmtINR(bc.selfPayable) + '</td></tr>';
          selfSteps += sectionH(nextNo(), 'Per-deal payable (Self)') + `<tr><td style="padding: 4px 0 12px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
              <thead><tr style="background: ${T.NAVY};">
                <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT};">TCF ID</th>
                <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Revenue</th>
                <th style="padding: 9px 10px; text-align: center; font-size: 10.5px; color: white; font-family: ${T.FONT};">Stage</th>
                <th style="padding: 9px 10px; text-align: center; font-size: 10.5px; color: white; font-family: ${T.FONT};">Which Applies</th>
                <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Payable</th>
              </tr></thead>
              <tbody>${selfPayRows}${selfTotalRow}</tbody>
            </table>
            ${buildBreakupTable(bSelfDR, bc.selfPayable, 0.80 * bc.selfPayable, 0.20 * bc.selfPayable)}
          </td></tr>`;
        }
      } else {
        selfSteps += sectionH(nextNo(), 'Both Incentives — Provisional and Confirmed (Self)') + `<tr><td style="padding: 4px 0 12px 0;">${bulletList(['No self deals in this block. Incentive (Self) = ₹0.'])}</td></tr>`;
      }

      const combinedSteps = sectionDivider('COMBINED · BLOCK TOTAL', T.ORANGE_DEEP) +
        sectionH(nextNo(), 'Block ' + (bi + 1) + ' Payable') + `<tr><td style="padding: 4px 0 12px 0;">
          <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
            Self Payable = <strong>${fmtINR(bc.selfPayable)}</strong><br>
            Team Payable = <strong>${fmtINR(bc.teamPayable)}</strong><br>
            <strong>Block ${bi + 1} Total Payable = ${fmtINR(bc.selfPayable)} + ${fmtINR(bc.teamPayable)} = <span style="color: ${T.NAVY};">${fmtINR(blockPay)}</span></strong>
          </div>
        </td></tr>`;

      stepsHtml = teamSteps + selfSteps + combinedSteps;
    }

    const headerNote = bIsT0T1
      ? 'Deals from <strong>' + bRange + '</strong> considered. Calculation uses ' + bTier + ' rules (5× eligibility target).'
      : 'Deals from <strong>' + bRange + '</strong> considered. Calculation uses ' + bTier + ' rules (' + bMultNum + '× team target).';

    return `
        <tr><td style="padding: 18px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.NAVY}; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 16px 20px; background: ${T.NAVY_SOFT}; border-bottom: 2px solid ${T.NAVY};">
                <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.NAVY}; line-height: 1.25;">Block ${bi + 1} · ${bTier} · ${bRange}</div>
                <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 6px 0 0 0;">${headerNote}</p>
              </td>
            </tr>
            <tr><td style="padding: 20px 22px; background: white;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">${stepsHtml}</table>
            </td></tr>
            <tr><td style="padding: 14px 22px; background: #F8FAFC; border-top: 2px solid ${T.NAVY_SOFT};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; color: ${T.MUTED}; letter-spacing: 0.6px; text-transform: uppercase;">Block ${bi + 1} (${bTier}) Total Payable</td>
                <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(blockPay)}</td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>`;
  };

  // =====================================
  // SECTION A: TEAM INCENTIVE (Steps 1-4)
  // =====================================
  // For promo RMs, steps are generated inside buildPromoBlockCard; skip here.
  let step1Html = '', step2Html = '', step3Html = '', step5Html = '', step6Html = '', step7Html = '';
  if (!isPromo) {
  const teamDeals = rm.deals.filter(d => d.selfTeam === 'Team');
  const teamDealResults = c.dealResults.filter(dr => dr.deal.selfTeam === 'Team');
  const multiplierLabel = rm.tier === 'T2' ? 'SMx 4×' : 'SMx 3×';
  const multiplierNum = rm.tier === 'T2' ? '4' : '3';
  const belowLabel = (c.teamBelowPct * 100) + '%';
  const aboveLabel = (c.teamAbovePct * 100) + '%';

  // STEP 1: Team YTD Cost + Target
  step1Html = sectionH(nextNo(), 'Team YTD Cost and Eligibility Target') + `<tr><td style="padding: 4px 0 12px 0;">
    ${bulletList([
      `<strong>Self+Team YTD Cost</strong> = your team's cumulative salary cost (including your own).`,
      `<strong>Eligibility Target</strong> = ${multiplierNum} × (Self+Team YTD Cost).`,
      `Your team's revenue must cross this to earn any incentive.`
    ])}
    <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
      Self+Team YTD Cost = <strong style="color: ${T.NAVY};">${fmtINR(c.teamYtdCost)}</strong><br>
      Eligibility Target (${multiplierLabel}) = ${multiplierNum} × ${fmtINR(c.teamYtdCost)} = <strong style="color: ${T.NAVY};">${fmtINR(c.teamTarget)}</strong>
    </div>
  </td></tr>`;

  // STEP 2: Team Deals
  step2Html = sectionH(nextNo(), 'Team Deals') + `<tr><td style="padding: 4px 0 12px 0;">
    ${buildDealTable(teamDeals, 'Team')}
  </td></tr>`;

  // STEP 3: Team Incentive Calculation + Slab Visual
  // STEP 4: Per-deal payable (Team) — conditional
  if (teamDeals.length > 0) {
    const teamConfDealsList = c.teamConfDeals || teamDeals.filter(d => d.stage === 'Confirmed' || d.stage === 'Collected');
    const crossNote = c.teamCrossed && Math.abs(c.teamConfBase - c.teamTarget) < 0.5
      ? `<strong>Exactly at target</strong> – ${belowLabel} of target applies.`
      : c.teamCrossed
        ? `<strong style="color: ${T.GREEN_DEEP};">Crosses target</strong> by ${fmtINR(c.teamConfBase - c.teamTarget)}`
        : c.teamConfBase > 0
          ? `Revenue is <strong>below target</strong>.`
          : `No confirmed team revenue.`;
    step3Html = sectionH(nextNo(), 'Confirmed Incentive (Team) Calculation') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        `<strong>Confirmed Team Revenue:</strong> ${teamConfDealsList.length > 0 ? confSumFormula(teamConfDealsList) + ' = ' + fmtINR(c.teamConfBase) : '₹0'}`,
        `<strong>Eligibility Target (${multiplierLabel}):</strong> ${fmtINR(c.teamTarget)}`,
        crossNote
      ])}
      ${c.teamTarget > 0 ? slabVisual(c.teamTarget, c.teamConfBase, c.teamIncentive, c.teamBelowPct, c.teamAbovePct, 'Confirmed Incentive (Team)') : ''}
    </td></tr>` + (c.teamIncentive > 0 ? sectionH(nextNo(), 'Per-deal payable') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList(['For each deal we compute a <strong>Deal Incentive Share</strong>, then apply the rule that fits the deal.'])}
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 20px 0 6px 0; font-weight: 700;">Confirmed flow</p>
      ${buildFlowDiagram(c.teamIncentive, 'Confirmed Incentive')}
      ${formulaCard('CONFIRMED PAYABLE FORMULA', [
        'Deal Incentive Share = Confirmed Incentive × (Deal Revenue ÷ Total Confirmed Incentive Deal Revenue)',
        '',
        '<span style="color: rgba(255,255,255,0.7);">Then per-deal:</span>',
        '<span style="color: #FDB744;">Payout will be based on whichever is higher: 50% or actual collection.</span>'
      ])}
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Per-deal payable table</p>
      ${buildPerDealTable(teamDealResults, c.teamIncentive, c.teamConfBase, 'Team', c.teamPayable)}
      ${buildBreakupTable(teamDealResults, c.teamPayable, 0.80 * c.teamPayable, 0.20 * c.teamPayable)}
    </td></tr>` : '');
  } else {
    step3Html = sectionH(nextNo(), 'Confirmed Incentive (Team) Calculation') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList(['No team deals this cycle. Confirmed Incentive (Team) = ₹0.'])}
    </td></tr>`;
  }

  // =====================================
  // SECTION B: SELF INCENTIVE (Steps 5-7)
  // =====================================
  const selfDeals = rm.deals.filter(d => d.selfTeam === 'Self');
  const selfDealResults = c.dealResults.filter(dr => dr.deal.selfTeam === 'Self');

  // STEP 5: Self Deals
  step5Html = sectionH(nextNo(), 'Self Deals') + `<tr><td style="padding: 4px 0 12px 0;">
    ${buildDealTable(selfDeals, 'Self')}
  </td></tr>`;

  // STEP 6: Self Incentive Calculation (Provisional + Confirmed)
  // STEP 7: Per-deal payable (Self) — conditional
  if (selfDeals.length > 0) {
    const selfProvDealsList = c.selfProvDeals || selfDeals.filter(d => d.stage !== 'Not counted');
    const selfConfDealsList = c.selfConfDeals || selfDeals.filter(d => d.stage === 'Confirmed' || d.stage === 'Collected');
    const sumFormula = (deals) => deals.map(d => `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)})`).join(' + ');

    step6Html = sectionH(nextNo(), 'Both Incentives — Provisional and Confirmed (Self)') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        `Two incentives are computed side by side: <strong>Provisional</strong> (all Self deals incl. Counted &amp; Logged In) and <strong>Confirmed</strong> (Confirmed, Collected and Logged In Self deals).`,
        `<strong>Rule:</strong> 5% × total self deal revenue (flat rate, no target threshold).`
      ])}
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive (Self)</p>
      ${selfProvDealsList.length === 0
        ? bulletList([`<strong>Provisional Incentive (Self) = ₹0.</strong>`])
        : bulletList([
            `<strong>Total Provisional Self Revenue:</strong> ${sumFormula(selfProvDealsList)} = ${fmtINR(c.selfProvBase)}`,
            `<strong>Provisional Incentive (Self) = 5% × ${fmtINR(c.selfProvBase)} = ${fmtINR(c.selfProvIncentive)}</strong>`
          ])
      }
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 16px 0 6px 0; font-weight: 700;">Confirmed Incentive (Self)</p>
      ${selfConfDealsList.length === 0
        ? bulletList([`No Confirmed/Collected self deals. <strong>Confirmed Incentive (Self) = ₹0.</strong>`])
        : bulletList([
            `<strong>Total Confirmed Self Revenue:</strong> ${confSumFormula(selfConfDealsList)} = ${fmtINR(c.selfConfBase)}`,
            `<strong>Confirmed Incentive (Self) = 5% × ${fmtINR(c.selfConfBase)} = ${fmtINR(c.selfConfIncentive)}</strong>`
          ])
      }
    </td></tr>` + ((c.selfProvIncentive > 0 || c.selfConfIncentive > 0) ? sectionH(nextNo(), 'Per-deal payable (Self)') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([`For each deal we compute a <strong>Deal Incentive Share</strong> from both bases, then the <strong>higher</strong> payable applies.`])}
      ${c.selfProvIncentive > 0 ? `
        <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 16px 0 6px 0; font-weight: 700;">Provisional flow</p>
        ${buildFlowDiagram(c.selfProvIncentive, 'Provisional Incentive')}
        ${formulaCard('PROVISIONAL PAYABLE FORMULA', [
          'Deal Incentive Share = Provisional Incentive × (Deal Revenue ÷ Total Provisional Self Revenue)',
          '',
          '<span style="color: rgba(255,255,255,0.7);">Then per-deal:</span>',
          '<span style="display: inline-block; width: 19ch;">For Focus deal</span>→ Provisional Payable = <span style="color: #FDB744;">25%</span> × Deal Incentive Share',
          '<span style="display: inline-block; width: 19ch;">For Non-Focus deal</span>→ Provisional Payable = <span style="color: #FDB744;">₹0</span>'
        ])}` : ''}
      ${c.selfConfIncentive > 0 ? `
        <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 20px 0 6px 0; font-weight: 700;">Confirmed flow</p>
        ${buildFlowDiagram(c.selfConfIncentive, 'Confirmed Incentive')}
        ${formulaCard('CONFIRMED PAYABLE FORMULA', [
          'Deal Incentive Share = Confirmed Incentive × (Deal Revenue ÷ Total Confirmed Self Revenue)',
          '',
          '<span style="color: rgba(255,255,255,0.7);">Then per-deal:</span>',
          '<span style="color: #FDB744;">Payout will be based on whichever is higher: 50% or actual collection.</span>'
        ])}` : ''}
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Per-deal payable table</p>
      ${(() => {
        const shareCellHtml = (inc, share, dealRev, base, applies) => {
          if (share <= 0 || base <= 0) return `<td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>`;
          const bgCol = applies ? '#ECFDF5' : 'transparent';
          const borderLeft = applies ? `border-left: 3px solid ${T.GREEN};` : '';
          const resultCol = applies ? T.GREEN_DEEP : T.NAVY;
          return `<td style="padding: 10px 12px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; background: ${bgCol}; ${borderLeft}">
            <div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.MUTED}; text-align: right; line-height: 1.3;">${fmtINR(inc)} × (${fmtL(dealRev)} ÷ ${fmtL(base)})</div>
            <div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${resultCol}; text-align: right; margin-top: 3px;">= ${fmtINR(share)}</div>
          </td>`;
        };
        let rows = '';
        selfDealResults.forEach(dr => {
          const d = dr.deal;
          const shareTag = d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : '';
          if (d.stage === 'Not counted') {
            rows += `<tr>
              <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK};">${tcfCell(d, { withProject: true })}${shareTag}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10.5px; text-align: right; color: ${T.INK}; white-space: nowrap;">${fmtINR(d.revenue)}</td>
              <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle;"><span style="background: ${T.RED_SOFT}; color: ${T.RED_DEEP}; font-size: 10.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px;">Not counted</span></td>
              <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>
              <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>
              <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 10.5px; text-align: center;"><strong style="color: ${T.MUTED};">No incentive</strong><br><span style="color: ${T.MUTED}; font-size: 10.5px; font-style: italic;">Not counted deal</span></td>
              <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; text-align: right; color: ${T.INK};">₹0</td>
            </tr>`;
            return;
          }
          const provApplies = dr.whichApplies === 'provisional';
          const confApplies = dr.whichApplies === 'confirmed';
          const provShareCell = shareCellHtml(c.selfProvIncentive, dr.provShare, d.revenue, c.selfProvBase, provApplies);
          const showConf = d.stage !== 'Counted' && dr.confShare > 0;
          const confDealRev = (d.isLoggedIn && d.collection > 0) ? d.revenue * (d.collection / 100) : d.revenue;
          const confShareCell = showConf
            ? shareCellHtml(c.selfConfIncentive, dr.confShare, confDealRev, c.selfConfBase, confApplies)
            : `<td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>`;
          let whichCell;
          if (dr.whichApplies === 'provisional') {
            whichCell = `<strong style="color: ${T.GREEN_DEEP};">Provisional</strong><br><span style="color: ${T.INK_SOFT}; font-size: 10.5px;">25% focus advance</span>`;
          } else if (dr.whichApplies === 'confirmed') {
            whichCell = d.isLoggedIn
              ? `<strong style="color: #1E40AF;">Logged In</strong><br><span style="color: ${T.INK_SOFT}; font-size: 10.5px;">NR×${fmtPct(d.collection)} in base, 100% payout</span>`
              : `<strong style="color: ${T.ORANGE_DEEP};">Confirmed</strong><br><span style="color: ${T.INK_SOFT}; font-size: 10.5px;">Collection ${fmtPct(d.collection)}</span>`;
          } else {
            whichCell = `<strong style="color: ${T.MUTED};">No incentive</strong>` + (dr.noReason ? `<br><span style="color: ${T.MUTED}; font-size: 10.5px; font-style: italic;">${escapeHtml(dr.noReason)}</span>` : '');
          }
          const payCell = dr.payable > 0
            ? `<div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.MUTED}; text-align: right; line-height: 1.3;">${dr.calcNote}</div><div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${T.NAVY}; text-align: right; margin-top: 3px;">= ${fmtINR(dr.payable)}</div>`
            : `<div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${T.INK}; text-align: right;">₹0</div>`;
          rows += `<tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK};">${tcfCell(d, { withProject: true })}${shareTag}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10.5px; text-align: right; color: ${T.INK}; white-space: nowrap;">${fmtINR(d.revenue)}</td>
            <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT};">${d.isLoggedIn ? 'Logged In' : d.stage}<br>${d.type}</td>
            ${provShareCell}
            ${confShareCell}
            <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 10.5px; text-align: center; line-height: 1.35;">${whichCell}</td>
            <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right;">${payCell}</td>
          </tr>`;
        });
        const totalRow = `<tr style="background: ${T.NAVY_SOFT};">
          <td colspan="6" style="padding: 12px; font-family: ${T.FONT}; font-size: 13px; font-weight: 700; color: ${T.NAVY}; text-align: right;">Total Self Payable</td>
          <td style="padding: 12px; font-family: ${T.MONO}; font-size: 14px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.selfPayable)}</td>
        </tr>`;
        return `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
            <thead><tr style="background: ${T.NAVY};">
              <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">TCF ID</th>
              <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Deal Revenue</th>
              <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Stage &amp; Type</th>
              <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Provisional Deal Incentive Share<div style="font-family: ${T.MONO}; font-size: 9.5px; font-weight: 500; color: rgba(255,255,255,0.6); margin-top: 3px; line-height: 1.35;">Prov Inc × Deal Rev ÷ Total Prov Rev</div></th>
              <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Confirmed Deal Incentive Share<div style="font-family: ${T.MONO}; font-size: 9.5px; font-weight: 500; color: rgba(255,255,255,0.6); margin-top: 3px; line-height: 1.35;">Conf Inc × Deal Rev ÷ Total Conf Rev</div></th>
              <th style="padding: 9px 10px; text-align: center; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Which Incentive applies</th>
              <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT}; vertical-align: top;">Final Payable</th>
            </tr></thead>
            <tbody>${rows}${totalRow}</tbody>
          </table>`;
      })()}
      ${buildBreakupTable(selfDealResults, c.selfPayable, 0.80 * c.selfPayable, 0.20 * c.selfPayable)}
    </td></tr>` : '');
  } else {
    step6Html = sectionH(nextNo(), 'Both Incentives — Provisional and Confirmed (Self)') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList(['No self deals this cycle. Provisional and Confirmed Incentive (Self) = ₹0.'])}
    </td></tr>`;
  }

  // =====================================
  // COMBINED (Steps 7-10)
  // =====================================

  // STEP 7: Combined FY Payable
  step7Html = sectionH(nextNo(), 'Combined ' + c.fy.fyLabel + ' Payable') + `<tr><td style="padding: 4px 0 12px 0;">
    <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
      Self Payable = <strong>${fmtINR(c.selfPayable)}</strong><br>
      Team Payable = <strong>${fmtINR(c.teamPayable)}</strong><br>
      <strong>${c.fy.fyLabel} Total Payable (Self + Team) = ${fmtINR(c.selfPayable)} + ${fmtINR(c.teamPayable)} = <span style="color: ${T.NAVY};">${fmtINR(c.fyPayable)}</span></strong>
    </div>
  </td></tr>`;
  } // end if (!isPromo)

  // Pre-generate promo block cards so their nextNo() calls happen before step 8/9/10
  let preBuiltBlockCardsHtml = '';
  if (isPromo && c.blockCalcs) {
    c.blockCalcs.forEach((bc, bi) => {
      preBuiltBlockCardsHtml += buildPromoBlockCard(bc, rm.blocks[bi], bi);
    });
  }

  // STEP 8: Due Incentive
  const dueColor = c.due < 0 ? T.RED_DEEP : (c.due > 0 ? T.GREEN_DEEP : T.INK);
  const hasBackYears = c.backYear && c.backYear.total > 0;
  const fyL = c.fy.fyLabel;
  const cumulativeBox = hasBackYears
    ? `<div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
        ${fyL} Monetary Payable (80% of ₹${fmtINRnoSym(c.fyPayable)}) = <strong>${fmtINR(c.fyCashPayable)}</strong><br>
        Prior Period Payable = <strong>${fmtINR(c.backYear.total)}</strong><br>
        Cumulative Monetary Payable = ${fmtINR(c.fyCashPayable)} + ${fmtINR(c.backYear.total)} = <strong>${fmtINR(c.cumulativeCash)}</strong><br>
        Total Already Paid = <strong>${fmtINR(c.alreadyPaid)}</strong><br>
        <strong>Due Incentive (cash in bank) = ${fmtINR(c.cumulativeCash)} − ${fmtINR(c.alreadyPaid)} = <span style="color:${dueColor};">${fmtINR(c.due)}</span></strong>
      </div>`
    : `<div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
        ${fyL} Monetary Payable (80% of ₹${fmtINRnoSym(c.fyPayable)}) = <strong>${fmtINR(c.fyCashPayable)}</strong><br>
        Total Already Paid = <strong>${fmtINR(c.alreadyPaid)}</strong><br>
        <strong>Due Incentive (cash in bank) = ${fmtINR(c.fyCashPayable)} − ${fmtINR(c.alreadyPaid)} = <span style="color:${dueColor};">${fmtINR(c.due)}</span></strong>
      </div>`;
  const step8Html = sectionH(nextNo(), 'Due Incentive (cash in bank) after netting Already Paid') + `<tr><td style="padding: 4px 0 12px 0;">
    ${cumulativeBox}
    ${c.due < 0 ? `
      <div style="margin-top: 10px; padding: 12px 14px; background: ${T.RED_SOFT}; border-left: 3px solid ${T.RED}; border-radius: 3px;">
        <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
          <strong style="color: ${T.RED_DEEP};">No clawback:</strong> Nothing is disbursed this cycle, and the amount already paid stays with you. Disbursement will be released whenever the due incentive becomes positive.
        </p>
      </div>
    ` : ''}
  </td></tr>`;

  // STEP 9: PIP Release Check
  let step9Html = '';
  if (c.due > 0) {
    if (!rm.hasPip) {
      step9Html = sectionH(nextNo(), 'PIP release check') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.GREEN_SOFT}; border-left: 3px solid ${T.GREEN}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            <strong style="color: ${T.GREEN_DEEP};">Released ✓.</strong> You are not on PIP, so the Due amount disburses this Dollar Day.
          </p>
        </div>
      </td></tr>`;
    } else {
      step9Html = sectionH(nextNo(), 'PIP release check') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.AMBER_SOFT}; border-left: 3px solid ${T.ORANGE}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            <strong style="color: #A16207;">Incentive Held</strong> you are currently on PIP.<br>Your Due Incentive of <strong>${fmtINR(c.due)}</strong> will release once your PIP status is cleared.
          </p>
        </div>
      </td></tr>`;
    }
  } else {
    step9Html = sectionH(nextNo(), 'PIP release check, not applicable') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.MUTED}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            The PIP check only matters when the Due amount is above ₹0. Your Due amount is not positive this cycle.
          </p>
        </div>
      </td></tr>`;
  }

  // STEP 10: Disbursement
  let step10Html = '';
  if (c.dueForRelease > 0) {
    const cashThisCycle = c.dueForRelease;
    const esopThisCycle = cashThisCycle * 0.25;
    step10Html = sectionH(nextNo(), 'This Dollar Day disbursement') + `<tr><td style="padding: 4px 0 20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td width="49%" style="background: ${T.GREEN_SOFT}; border: 1px solid ${T.GREEN}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.GREEN_DEEP}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">CASH IN BANK</div>
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
      </table>
    </td></tr>`;
  } else {
    const zeroNote = (c.due > 0 && rm.hasPip) ? 'Held, PIP active' : 'No disbursement this cycle';
    step10Html = sectionH(nextNo(), 'This Dollar Day disbursement') + `<tr><td style="padding: 4px 0 20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td width="49%" style="background: ${T.NAVY_SOFT}; border: 1px solid ${T.BORDER_STRONG}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.MUTED}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">CASH IN BANK</div>
            <div style="font-family: ${T.MONO}; font-size: 22px; font-weight: 700; color: ${T.MUTED};">₹0</div>
            <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT}; margin-top: 4px;">${zeroNote}</div>
          </td>
          <td width="2%"></td>
          <td width="49%" style="background: ${T.NAVY_SOFT}; border: 1px solid ${T.BORDER_STRONG}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.MUTED}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">ESOP</div>
            <div style="font-family: ${T.MONO}; font-size: 22px; font-weight: 700; color: ${T.MUTED};">₹0</div>
            <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT}; margin-top: 4px;">${zeroNote}</div>
          </td>
        </tr>
      </table>
    </td></tr>`;
  }

  // Prior Periods Card
  const buildPriorPeriodsCard = () => {
    const priorTotal = c.backYear ? c.backYear.total : 0;
    return `
      <tr><td style="padding: 18px 28px 0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.ORANGE_DEEP}; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 16px 20px; background: #FFFBEB; border-bottom: 2px solid ${T.ORANGE_DEEP};">
              <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.ORANGE_DEEP}; line-height: 1.25;">Prior Period · Before ${c.fy.fyAprilLabel}</div>
              <p style="font-family: ${T.FONT}; font-size: 12.5px; color: ${T.INK_SOFT}; line-height: 1.55; margin: 6px 0 0 0;">Final incentive payable, calculated under the earlier rules.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 20px; background: white;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                <tr>
                  <td style="font-family: ${T.FONT}; font-size: 13.5px; font-weight: 700; color: ${T.INK};">Final Incentive Payable (Self+Team)</td>
                  <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(priorTotal)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>`;
  };

  // Assemble steps into sections
  let fyBlockHtml;
  if (c.overallScenario === 'no_deals') {
    fyBlockHtml = `
        <tr><td style="padding: 18px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.NAVY}; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 16px 20px; background: ${T.NAVY_SOFT}; border-bottom: 2px solid ${T.NAVY};">
                <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.NAVY}; line-height: 1.25;">${c.fy.fyAprilLabel} Onwards · ${c.fy.fyLabel}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 22px; background: white; text-align: center;">
                <div style="font-family: ${T.FONT}; font-size: 15px; color: ${T.INK_SOFT}; line-height: 1.6;">You don't have any deals for this financial year.</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 22px; background: #F8FAFC; border-top: 2px solid ${T.NAVY_SOFT};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; color: ${T.MUTED}; letter-spacing: 0.6px; text-transform: uppercase;">${c.fy.fyLabel} Total Payable (Self + Team)</td>
                    <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.fyPayable)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>`;
  } else if (isPromo && c.blockCalcs) {
    // PROMO: use pre-built block cards + combined FY summary
    const blockCardsHtml = preBuiltBlockCardsHtml;
    const blockSummaryParts = c.blockCalcs.map((bc, bi) => {
      const bp = bc.selfPayable + bc.teamPayable;
      return `Block ${bi + 1} (${bc.tier}) = <strong>${fmtINR(bp)}</strong>`;
    });
    const combinedSummaryHtml = `
        <tr><td style="padding: 18px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.NAVY}; border-radius: 8px; overflow: hidden;">
            <tr><td style="padding: 16px 20px; background: ${T.NAVY_SOFT}; border-bottom: 2px solid ${T.NAVY};">
              <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.NAVY}; line-height: 1.25;">${c.fy.fyLabel} — Combined Payable</div>
            </td></tr>
            <tr><td style="padding: 18px 22px; background: white;">
              <div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
                ${blockSummaryParts.join('<br>')}<br>
                <strong>${c.fy.fyLabel} Total Payable (Self + Team) = <span style="color: ${T.NAVY};">${fmtINR(c.fyPayable)}</span></strong>
              </div>
            </td></tr>
            <tr><td style="padding: 14px 22px; background: #F8FAFC; border-top: 2px solid ${T.NAVY_SOFT};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; color: ${T.MUTED}; letter-spacing: 0.6px; text-transform: uppercase;">${c.fy.fyLabel} Total Payable (Self + Team)</td>
                <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.fyPayable)}</td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>`;
    fyBlockHtml = blockCardsHtml + combinedSummaryHtml;
  } else {
    const teamSectionHtml = sectionDivider('SECTION A · TEAM INCENTIVE', T.ORANGE_DEEP) + step1Html + step2Html + step3Html;
    const selfSectionHtml = sectionDivider('SECTION B · SELF INCENTIVE', T.ORANGE_DEEP) + step5Html + step6Html;
    const combinedSectionHtml = sectionDivider('COMBINED · FINAL CALCULATION', T.ORANGE_DEEP) + step7Html;
    const stepsInsideHtml = teamSectionHtml + selfSectionHtml + combinedSectionHtml;

    fyBlockHtml = `
        <tr><td style="padding: 18px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border: 2px solid ${T.NAVY}; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 16px 20px; background: ${T.NAVY_SOFT}; border-bottom: 2px solid ${T.NAVY};">
                <div style="font-family: ${T.FONT}; font-size: 17px; font-weight: 700; color: ${T.NAVY}; line-height: 1.25;">${c.fy.fyAprilLabel} Onwards · ${c.fy.fyLabel}</div>
                <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 6px 0 0 0;">Deals from <strong>${rangeLabel}</strong> considered. Full calculation breakdown below.</p>
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
                    <td style="font-family: ${T.MONO}; font-size: 10.5px; font-weight: 700; color: ${T.MUTED}; letter-spacing: 0.6px; text-align: left; text-transform: uppercase;">${c.fy.fyLabel} Total Payable (Self + Team)</td>
                    <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right;">${fmtINR(c.fyPayable)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>`;
  }

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

        <tr><td class="pdf-section-start" style="background: #000000; padding: 18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <img src="${LOGO_WHITE}" alt="Square Yards" height="34" style="display: block; height: 34px; width: auto;">
              </td>
              <td style="text-align: right; font-family: ${T.FONT}; font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 600; letter-spacing: 0.5px; vertical-align: middle;"></td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding: 28px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background: ${hero.bg}; border: 1px solid ${hero.border}; border-radius: 8px; overflow: hidden;">
            <tr><td style="padding: 22px 24px;">
              <div style="font-family: ${T.FONT}; font-size: 10.5px; font-weight: 700; color: ${hero.border}; letter-spacing: 1.2px; margin-bottom: 6px;">${hero.label}</div>
              <div style="font-family: ${T.MONO}; font-size: 40px; font-weight: 700; color: ${T.NAVY}; letter-spacing: -0.02em; line-height: 1.1;">₹${hero.big}</div>
              <div style="font-family: ${T.MONO}; font-size: 12.5px; color: ${T.INK_SOFT}; margin-top: 10px; line-height: 1.5;">${hero.formula}</div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding: 22px 28px 4px 28px;">
          <p style="font-family: ${T.FONT}; font-size: 14px; color: ${T.INK}; line-height: 1.6; margin: 0;">Hi ${escapeHtml(first)},</p>
          <p style="font-family: ${T.FONT}; font-size: 14px; color: ${T.INK}; line-height: 1.6; margin: 8px 0 0 0;">Below is your Incentive Statement for <strong>${month} Dollar Day</strong>.</p>
        </td></tr>

        ${fyBlockHtml}

        ${buildPriorPeriodsCard()}

        <tr><td style="padding: 18px 28px 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            ${step8Html}
            ${step9Html}
            ${step10Html}
          </table>
        </td></tr>

        <tr><td style="padding: 24px 28px 24px 28px;">
          <div style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; line-height: 1.6; margin-bottom: 10px;">If you still have any doubts, please first reach out to your P&amp;L. If your doubts remain unresolved, write to <a href="mailto:incentive@squareyards.com" style="color: ${T.NAVY}; font-weight: 700; text-decoration: none;">incentive@squareyards.com</a>.</div>
          <div style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK_SOFT}; margin-top: 16px; line-height: 1.5;">Regards,<br><strong style="font-size: 14px; color: ${T.NAVY};">Incentive Team</strong><br><span style="color: ${T.MUTED};">Square Yards</span></div>
          <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.MUTED}; line-height: 1.55; margin-top: 18px; padding-top: 12px; border-top: 1px solid ${T.BORDER};">This document is confidential and intended solely for the named recipient. Please do not forward or share it with anyone else.</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function generatePlainText(rm) {
  const c = rm.calc;
  const first = rm.name;
  const rangeLabel = c.coverage ? c.coverage.rangeLabel : '';
  const lines = [];
  lines.push(`Hi ${first},`, '');
  lines.push(`Below is your Incentive Statement for ${c.ddLabel} Dollar Day.`);
  lines.push('');
  if (c.overallScenario === 'no_deals') {
    lines.push(`You don't have any deals for this financial year.`);
    lines.push(`Total FY Payable = ${fmtINR(c.fyPayable)}`);
  } else {
    lines.push(`Deals from ${rangeLabel} considered.`);
    lines.push('');
    if (c.overallScenario === 'positive') {
      lines.push(`This-cycle cash in bank = ${fmtINR(c.dueForRelease)} (Due Incentive); ESOP = ${fmtINR(c.dueForRelease * 0.25)} (reverse-calc from cash)`);
    } else if (c.overallScenario === 'held_pip') {
      lines.push(`Held pending PIP clearance: ${fmtINR(c.due)}`);
    } else {
      lines.push(`This Dollar Day payable: Rs. 0`);
    }
    lines.push('');
    lines.push('--- TEAM INCENTIVE ---');
    lines.push(`Self+Team YTD Cost = ${fmtINR(c.teamYtdCost)}`);
    lines.push(`Team Target (${rm.tier === 'T2' ? '4x' : '3x'}) = ${fmtINR(c.teamTarget)}`);
    lines.push(`Confirmed Incentive (Team) = ${fmtINR(c.teamIncentive)}`);
    lines.push(`Team Payable = ${fmtINR(c.teamPayable)}`);
    lines.push('');
    lines.push('--- SELF INCENTIVE ---');
    lines.push(`Provisional Incentive (Self) (5% of all self revenue) = ${fmtINR(c.selfProvIncentive)}`);
    lines.push(`Confirmed Incentive (Self) (5% of confirmed self revenue) = ${fmtINR(c.selfConfIncentive)}`);
    lines.push(`Self Payable = ${fmtINR(c.selfPayable)}`);
    lines.push('');
    lines.push('--- COMBINED ---');
    lines.push(`Total FY Payable = ${fmtINR(c.fyPayable)}`);
  }
  lines.push(`Already Paid = ${fmtINR(c.alreadyPaid)}`);
  lines.push(`Due = ${fmtINR(c.due)}`);
  lines.push('');
  lines.push('If you still have any doubts, please first reach out to your P&L. If your doubts remain unresolved, write to incentive@squareyards.com.');
  lines.push('');
  lines.push('Regards,');
  lines.push('Incentive Team');
  lines.push('Square Yards');
  lines.push('');
  lines.push('This document is confidential and intended solely for the named recipient. Please do not forward or share it with anyone else.');
  return lines.join('\n');
}

// Module exports
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
