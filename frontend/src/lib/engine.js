// Verbatim extract (lines 1358-2646) from Incentive_PDF_Tool.html - the calculation
// engine and email/PDF template generator. See the note at the bottom of this file.

const LOGO_WHITE = 'data:image/png;base64,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';
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
  // Strip a trailing year suffix such as "-26", "-2026", "/26" (e.g. "Apr-26" -> "Apr").
  const v = String(s).trim().replace(/[\s\-\/]\d{2,4}$/, '');
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
  } else d = toLocalDate(v);
  if (isNaN(d.getTime())) return String(v);
  const utc = typeof v === 'number';   // Excel serials are built in UTC, everything else is local midnight
  const y = utc ? d.getUTCFullYear() : d.getFullYear();
  const mo = (utc ? d.getUTCMonth() : d.getMonth()) + 1;
  const da = utc ? d.getUTCDate() : d.getDate();
  return y + '-' + String(mo).padStart(2, '0') + '-' + String(da).padStart(2, '0');
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

  rmRows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const empCode = pick(r, 'Employee Code','Emp Code','EmpCode','Code');
    const name = pick(r, 'Full Name','Name');
    const tier = pick(r, 'Tier');
    const vertical = pick(r, 'Vertical') || 'Primary Sales';
    const alreadyPaid = pick(r, 'Total Already Paid','Already Paid YTD','Already Paid');
    const hasCrmRaw = pick(r, 'Has CRM Approved Deal','CRM Deal','CRM');
    const ddDate = pick(r, 'Dollar Day Date','DD Date','Dollar Day');
    // New v10 fields
    const priorPayable = pick(r, 'Prior Period Final Payable','Prior Period Payable','Back Payable FY24');
    const emailId = pick(r, 'EmailIDOfficial','Email ID Official','Email','EmailId','Official Email');
    const costFy2627 = pick(r, 'Cost_FY2627','Cost FY2627','CostFY2627','YTD Cost');

    const salaries = SALARY_MONTHS.map(m => {
      const v = pickSalary(r, m);
      return v === null || v === '' ? null : Number(String(v).replace(/,/g, ''));
    });

    if (!empCode) { issues.push({level:'err',loc:'RMs row '+rowNum,msg:'Missing Employee Code (primary key).'}); return; }
    if (rmMap[empCode]) { issues.push({level:'err',loc:'RMs row '+rowNum,msg:'Duplicate Employee Code "'+empCode+'".'}); return; }
    if (!name) issues.push({level:'err',loc:empCode,msg:'Missing Full Name.'});
    if (!tier || !['T0','T1'].includes(String(tier).trim().toUpperCase())) issues.push({level:'err',loc:empCode,msg:'Tier must be T0 or T1 (got "'+tier+'").'});

    // Months in the period come from the Dollar Day (April to the month before it); the Months Elapsed column is ignored.
    const validMonths = monthsFromDollarDay(fmtDate(ddDate)) || 1;

    // If Cost_FY2627 is provided, use it directly as YTD cost (exact prorated payroll).
    // Otherwise fall back to summing individual salary columns (legacy format).
    const parsedCostFy = costFy2627 !== null ? parseNum(costFy2627) : null;
    const hasCostDirect = parsedCostFy !== null && !isNaN(parsedCostFy) && parsedCostFy >= 0;

    let joinMonthIndex = validMonths;
    if (!hasCostDirect) {
      for (let i = 0; i < validMonths; i++) {
        const s = salaries[i];
        if (s !== null && isNaN(s)) {
          issues.push({level:'err',loc:empCode,msg:'Salary '+SALARY_MONTHS[i]+' missing or invalid - must be filled for every month in the period.'});
        } else if (s !== null && s < 0) {
          issues.push({level:'err',loc:empCode,msg:'Salary '+SALARY_MONTHS[i]+' is negative (got "'+s+'").'});
        } else if (s === null || s === 0) {
          // Not yet joined this month
        } else if (joinMonthIndex === validMonths) {
          joinMonthIndex = i;
        }
      }
      for (let i = validMonths; i < 12; i++) {
        if (salaries[i] !== null && !isNaN(salaries[i])) issues.push({level:'warn',loc:empCode,msg:'Salary '+SALARY_MONTHS[i]+' provided but only '+validMonths+' months in the period - will be ignored.'});
      }
    } else {
      joinMonthIndex = 0;
    }
    const activeMonths = Math.max(0, validMonths - joinMonthIndex);

    const apN = parseNum(alreadyPaid);
    if (alreadyPaid !== null && (isNaN(apN) || apN < 0)) issues.push({level:'warn',loc:empCode,msg:'Total Already Paid treated as 0.'});
    if (hasCrmRaw === null) issues.push({level:'err',loc:empCode,msg:'CRM field missing, defaulting to No.'});
    else if (!['yes','y','true','1','no','n','false','0'].includes(String(hasCrmRaw).trim().toLowerCase())) issues.push({level:'err',loc:empCode,msg:'CRM must be Yes or No (got "'+hasCrmRaw+'").'});
    if (!ddDate) issues.push({level:'err',loc:empCode,msg:'Dollar Day Date missing.'});
    else if (!isReadableDate(ddDate)) issues.push({level:'err',loc:empCode,msg:'Dollar Day Date is not a readable date (got "'+ddDate+'").'});
    if (priorPayable !== null) {
      const ppN = parseNum(priorPayable);
      if (isNaN(ppN) || ppN < 0) issues.push({level:'err',loc:empCode,msg:'Prior Period Final Payable must be a number, 0 or more (got "'+priorPayable+'").'});
    }

    // Parse back-year payables (default 0 if missing)
    const parseBack = (v) => {
      if (v === null || v === '') return 0;
      const n = parseNum(v);   // tolerates commas ("8,69,204") the same as the validation check above
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
      joinMonthIndex,
      activeMonths,
      ytdCostDirect: hasCostDirect ? parsedCostFy : null,
      alreadyPaid: Math.max(0, apN || 0),
      hasCrm: normYesNo(hasCrmRaw),
      ddDate: fmtDate(ddDate),
      backYearPayables,
      email: emailId ? String(emailId).trim() : '',
      deals: [],
    };
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
    const dealMonth = pick(r, 'Deal Month','Month','deal_month');
    const stageRaw = pick(r, 'Stage','DealStatus');
    const typeRaw = pick(r, 'Type');
    const collectionRaw = pick(r, 'Collection %','Collection','Coll %');
    const selfTeamRaw = pick(r, 'Self/Team','SelfTeam','Team Split','Team');
    const sharePctRaw = pick(r, 'Share Percentage','Share %','Share');

    if (!rmId) { issues.push({level:'err',loc:'Deals row '+rowNum,msg:'Missing Employee Code.'}); return; }
    if (!rmMap[rmId]) { issues.push({level:'err',loc:'Deals row '+rowNum,msg:'Orphan deal - Employee Code "'+rmId+'" not found.'}); return; }
    const rev = parseNum(revenue);
    // Revenue can legitimately be 0 (e.g. a deal logged with no revenue yet); only a blank,
    // non-numeric, or negative value is a real problem.
    if (isNaN(rev) || rev < 0) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Revenue invalid.'}); return; }
    let stage = normStage(stageRaw);
    const type = normType(typeRaw);
    const month = normMonth(dealMonth);
    if (!stage) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Stage must be Counted/Logged In, Confirmed, or Collected (with or without "(Count)" suffix).'}); return; }
    if (!type) { issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Type must be Focus or Non-Focus.'}); return; }
    if (!month) issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Deal Month missing or invalid - will show as "-" in the PDF.'});
    else {
      const mi = SALARY_MONTHS.indexOf(month);
      const rmDeal = rmMap[rmId];
      if (mi < rmDeal.joinMonthIndex) { issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Deal Month "'+month+'" is before this RM\'s join month - included in calculation.'}); }
      else if (mi >= rmDeal.months) { issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Deal Month "'+month+'" is outside the '+rmDeal.months+' month(s) in this RM\'s period - included in calculation.'}); }
    }


    let collection = null;
    if (stage === 'Confirmed') {
      // Confirmed accepts 0-99. If input is 100 → suggest Collected instead. If missing/invalid → 0.
      const c = parseNum(collectionRaw);
      if (collectionRaw === null || collectionRaw === '' || isNaN(c)) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed deal has no Collection %; treated as 0%.'});
        collection = 0;
      } else if (c === 100) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed at 100% collection - treating as Collected.'});
        stage = 'Collected';
        collection = 100;
      } else if (c < 0 || c > 99) {
        issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Confirmed needs Collection 0-99 (use Collected for 100%).'}); return;
      } else {
        collection = c;
      }
    } else if (stage === 'Collected') {
      // Collected is always 100%. A different value is an error.
      const c = parseNum(collectionRaw);
      if (collectionRaw !== null && collectionRaw !== '' && !isNaN(c) && c >= 99 && c < 100) {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Collected deal has Collection '+fmtPct(c)+' (not exactly 100%) - treating as 100%.'});
      } else if (collectionRaw !== null && collectionRaw !== '' && (isNaN(c) || c < 99)) {
        issues.push({level:'err',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Collected deal must have Collection 100% (got "'+collectionRaw+'").'}); return;
      }
      if (collectionRaw === null || collectionRaw === '') {
        issues.push({level:'warn',loc:'Deals row '+rowNum+' ('+rmId+')',msg:'Collected deal has no Collection %; treated as 100%.'});
      }
      collection = 100;
    } else if (stage === 'Counted') {
      const c = parseNum(collectionRaw);
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

    // Beats hyperlink only makes sense for a real "TCF-..." code with a plain numeric id
    // behind it (never for an "MCF-..." code, and never when there's no numeric id at all).
    const tcfIdStr = String(tcfId || 'TCF-' + (rmMap[rmId].deals.length + 1));
    const tcfLinkId = (/^tcf/i.test(tcfIdStr.trim()) && tcfLinkIdRaw !== null && /^\d+$/.test(String(tcfLinkIdRaw).trim()))
      ? String(tcfLinkIdRaw).trim() : null;

    const isLoggedIn = /logged\s*in/i.test(String(stageRaw).replace(/\s*\(\s*count\s*\)\s*$/i, '').trim());
    rmMap[rmId].deals.push({
      tcfId: tcfIdStr,
      tcfLinkId,             // numeric Beats id, or null if this deal can't be linked
      projectName: String(projectName || ''),
      revenue: rev,
      month: month || '',
      stage, type, collection,
      selfTeam,             // 'Self' or 'Team'
      sharePct,             // 0-100 (default 100)
      isLoggedIn,           // true if original DealStatus was Logged In / LoggedIn
    });
    joinedCount++;
  });

  return { rms, issues, joinedCount };
}

// ---------- Calc ----------
function calculateIncentive(rm) {
  const ytdCost = rm.ytdCostDirect !== null && rm.ytdCostDirect !== undefined
    ? rm.ytdCostDirect
    : rm.salaries.slice(0, rm.months).reduce((s, v) => s + (v || 0), 0);
  const eligibilityTarget = 5 * ytdCost;

  // Team deals are EXCLUDED from Provisional and Confirmed bases (RM earns no incentive on team deals)
  const provBase = rm.deals.filter(d => d.stage !== 'Not counted' && d.selfTeam !== 'Team').reduce((s, d) => s + d.revenue, 0);
  const provCrossed = provBase >= eligibilityTarget && provBase > 0 && eligibilityTarget > 0;
  const provIncentive = provCrossed ? 0.05 * eligibilityTarget + 0.40 * (provBase - eligibilityTarget) : 0;

  const confDeals = rm.deals.filter(d => (d.stage === 'Confirmed' || d.stage === 'Collected') && d.selfTeam !== 'Team');
  // LOGGEDIN deals with collection>0% contribute NR×coll% to ConfBase (not full NR).
  // LOGGEDIN deals with collection=0% stay provisional and contribute 0 to ConfBase.
  const confBase = confDeals.reduce((s, d) => {
    if (d.isLoggedIn && d.collection > 0) return s + d.revenue * (d.collection / 100);
    if (d.isLoggedIn && d.collection === 0) return s;
    return s + d.revenue;
  }, 0);
  const confCrossed = confBase >= eligibilityTarget && confBase > 0 && eligibilityTarget > 0;
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
    // Confirmed Share only for Confirmed / Collected deals.
    // LOGGEDIN deals contribute NR×coll% to confBase, so their share is based on that contribution.
    const confContrib = (d.isLoggedIn && d.collection > 0) ? d.revenue * (d.collection / 100) : d.revenue;
    const confShare = (d.stage !== 'Counted' && confBase > 0) ? confIncentive * (confContrib / confBase) : 0;

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
        // LOGGEDIN deals with coll>0%: collection is already baked into confContrib/confShare,
        // so earned payout = 100% of confShare. Regular deals use max(50%, collection%).
        const rawPct = d.collection / 100;
        const pct = (d.isLoggedIn && d.collection > 0) ? 1.0 : Math.max(0.5, rawPct);
        const confPay = pct * confShare;
        const advPay = (d.type === 'Focus' && provIncentive > 0) ? 0.25 * provShare : 0;
        if (advPay > confPay) {
          whichApplies = 'provisional';
          payable = advPay;
          calcNote = '25% × ' + fmtINR(provShare);
        } else {
          whichApplies = 'confirmed';
          payable = confPay;
          calcNote = (d.isLoggedIn && d.collection > 0)
            ? '100% × ' + fmtINR(confShare) + ' (Logged In)'
            : fmtPct(pct * 100) + (rawPct < 0.5 ? ' (floor)' : '') + ' × ' + fmtINR(confShare);
        }
      } else if (d.type === 'Focus' && provIncentive > 0) {
        whichApplies = 'provisional';
        payable = 0.25 * provShare;
        calcNote = '25% × ' + fmtINR(provShare);
      } else if (d.type === 'Non-Focus' && provIncentive > 0) {
        whichApplies = 'none';
        noReason = 'Non-focus project';
      } else {
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

  const coverage = computeCoveredRange(rm.ddDate, rm.joinMonthIndex);
  const uniqueSalaries = new Set(rm.salaries.slice(0, rm.months).filter(v => v !== null));
  const salaryConstant = rm.ytdCostDirect !== null && rm.ytdCostDirect !== undefined ? true : uniqueSalaries.size <= 1;

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
  return 'September Dollar Day - Incentive Calculation - ' + rm.empCode;
}
function generateEmailPreheader(rm, c) {
  if (c.overallScenario === 'positive' || c.overallScenario === 'provisional_only') return 'Your ' + c.ddLabel + ' Dollar Day calculation, step by step.';
  if (c.overallScenario === 'held_no_crm') return 'Calculated but pending CRM release.';
  return 'Your ' + c.ddLabel + ' Dollar Day breakdown.';
}

function generateEmailHtml(rm) {
  const c = rm.calc;
  const first = rm.name;   // full name in the greeting, not just the first word
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
      formula: fmtINR(totalForCycle) + ' = ' + fmtINR(cashDue) + ' (Cash in bank, 80%) + ' + fmtINR(esopForDue) + ' (ESOP, 20%)',
    };
  }
  if (c.overallScenario === 'held_no_crm') {
    return {
      bg: T.AMBER_SOFT, border: T.ORANGE,
      label: 'YOUR ' + monthUp + ' DOLLAR DAY INCENTIVE',
      big: '0',
      formula: '₹0 disbursed this Dollar Day. See Step ' + (rm.deals.length > 0 ? 6 : 4) + ' for the held amount.',
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
  // Steps are numbered in the order they are built, so a skipped step never leaves a gap.
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

  // TCF ID cell: a clickable link to Beats for a real TCF-coded deal with a numeric id behind
  // it, plain text otherwise (MCF-coded deals, or anything with no numeric id, never link).
  const tcfCell = (d, opts = {}) => {
    const label = escapeHtml(d.tcfId);
    const linked = d.tcfLinkId
      ? `<a href="https://beats.squareyards.com/sales/tcf.aspx?id=${escapeHtml(d.tcfLinkId)}" style="color: ${T.LINK}; text-decoration: underline; font-weight: 700;">${label}</a>`
      : label;
    return opts.withProject && d.projectName
      ? `${linked}<br><span style="font-family: ${T.FONT}; font-weight: 500; color: ${T.INK_SOFT}; font-size: 9px;">${escapeHtml(d.projectName)}</span>`
      : linked;
  };

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
    const priorTotal = c.backYear ? c.backYear.total : 0;   // always shown, even when it is 0
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
                  <td style="font-family: ${T.MONO}; font-size: 18px; font-weight: 700; color: ${T.NAVY}; text-align: right; line-height: 1.2;">${fmtINR(priorTotal)}</td>
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
          <td width="${targetWidth}%" style="padding: 6px 6px 0 6px; font-family: ${T.MONO}; font-size: 11.5px; color: ${leftTextColor}; text-align: center;">${state === 'below_target' ? '<strong>\u20B90</strong>' : '5% \u00D7 ' + fmtL(targetAmt) + ' = <strong>' + fmtINR(fivePct) + '</strong>'}</td>
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
  const step1Html = sectionH(nextNo(), 'YTD Salary Cost and Eligibility Target') + `<tr><td style="padding: 4px 0 12px 0;">
    ${bulletList([
      `<strong>YTD Salary Cost</strong> = ` + (rm.ytdCostDirect !== null && rm.ytdCostDirect !== undefined ? 'your cumulative salary cost for the period.' : 'sum of your salaries in the elapsed months (' + rm.activeMonths + ' months this cycle' + (rm.joinMonthIndex > 0 ? ', since joining in ' + MONTH_NAMES[SALARY_MONTHS[rm.joinMonthIndex]] : '') + ').'),
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
    step2Html = sectionH(nextNo(), 'Deals in this cycle') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([`You had <strong>no deals</strong> in ${rangeLabel}. Nothing to compute this cycle.`])}
    </td></tr>`;
  } else {
    let rows = '';
    rm.deals.forEach(d => {
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
    step2Html = sectionH(nextNo(), 'Deals in this cycle') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([`These are your ${rm.deals.length} deal(s) booked in <strong>${rangeLabel}</strong>.`])}
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
  const tcfListWithStage = (deals) => deals.map(d => `${escapeHtml(d.tcfId)} (${d.isLoggedIn ? 'Logged In' : d.stage})`).join(', ');
  // Helper: sum formula like "TCF-001 (₹5L) + TCF-002 (₹5L) + ... = ₹25L"
  const sumFormula = (deals) => deals.map(d => `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)})`).join(' + ');
  // For Confirmed base: LOGGEDIN deals show NR×coll% contribution
  const confSumFormula = (deals) => deals.map(d => {
    if (d.isLoggedIn && d.collection > 0) return `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)} × ${fmtPct(d.collection)} = ${fmtL(d.revenue * d.collection / 100)})`;
    return `${escapeHtml(d.tcfId)} (${fmtL(d.revenue)})`;
  }).join(' + ');

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
        `<strong>Deals used:</strong> ${tcfListWithStage(provDeals)} (${provDealCount} deals - all Counted, Confirmed, Collected and Logged In stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Provisional Incentive Deal Revenue:</strong> ${sumFormula(provDeals)} = ${fmtINR(c.provBase)}`,
        `<strong style="color: ${T.RED_DEEP};">Did not cross target</strong> \u2192 Provisional Incentive = \u20B90.`
      ])}
      ${slabVisual(c.eligibilityTarget, c.provBase, 0, 'Provisional Incentive')}`;
  } else {
    provBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 12px 0 6px 0; font-weight: 700;">Provisional Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> ${tcfListWithStage(provDeals)} (${provDealCount} deals - all Counted, Confirmed, Collected and Logged In stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Provisional Incentive Deal Revenue:</strong> ${sumFormula(provDeals)} = ${fmtINR(c.provBase)}`,
        c.provBase > c.eligibilityTarget
          ? `<strong>Crosses target</strong> by ${fmtINR(c.provBase - c.eligibilityTarget)}`
          : `<strong>Exactly at target</strong> - 5% of target applies.`
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
        `<strong>Deals used:</strong> ${tcfListWithStage(confDeals)} (${confDealCount} deals - only Confirmed, Collected and Logged In stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Confirmed Incentive Deal Revenue:</strong> ${confSumFormula(confDeals)} = ${fmtINR(c.confBase)}`,
        `<strong style="color: ${T.RED_DEEP};">Did not cross target</strong> \u2192 Confirmed Incentive = \u20B90.`
      ])}
      ${slabVisual(c.eligibilityTarget, c.confBase, 0, 'Confirmed Incentive')}`;
  } else {
    const crossStatus = c.confBase > c.eligibilityTarget
      ? `<strong>Crosses target</strong> by ${fmtINR(c.confBase - c.eligibilityTarget)}`
      : `<strong>Exactly at target</strong> - 5% of target applies.`;
    confBlock = `
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 22px 0 6px 0; font-weight: 700;">Confirmed Incentive</p>
      ${bulletList([
        `<strong>Deals used:</strong> ${tcfListWithStage(confDeals)} (${confDealCount} deals - only Confirmed, Collected and Logged In stages)`,
        `<strong>Eligibility Target (SMx 5\u00D7):</strong> ${fmtINR(c.eligibilityTarget)}`,
        `<strong>Total Confirmed Incentive Deal Revenue:</strong> ${confSumFormula(confDeals)} = ${fmtINR(c.confBase)}`,
        crossStatus
      ])}
      ${slabVisual(c.eligibilityTarget, c.confBase, c.confIncentive, 'Confirmed Incentive')}`;
  }

  const step3Html = rm.deals.length === 0 ? '' :
    sectionH(nextNo(), 'Both Incentives - Provisional and Confirmed') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        `Two incentives are computed side by side: <strong>Provisional</strong> (all deals incl. Logged In) and <strong>Confirmed</strong> (Confirmed, Collected and Logged In deals).`
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
    const HL = (t) => `<span style="color: ${T.GOLD};">${t}</span>`;
    const confFlow = flowChart([
      { label: 'Confirmed Incentive', sub: fmtINR(c.confIncentive) },
      { label: 'Deal Incentive Share', sub: 'Incentive \u00D7 Rev\u00F7Total' },
      { label: 'Payable', sub: 'Payout will be based on whichever is higher: 50% or actual collection.' }
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
          '<span style="display: inline-block; width: 19ch;">For Focus deal</span>\u2192 Provisional Payable = <span style="color: ' + T.GOLD + ';">25%</span> \u00D7 Deal Incentive Share',
          '<span style="display: inline-block; width: 19ch;">For Non-Focus deal</span>\u2192 Provisional Payable = <span style="color: ' + T.GOLD + ';">\u20B90</span>'
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
          HL('Payout will be based on whichever is higher: 50% or actual collection.'),
          '',
          '<span style="color: rgba(255,255,255,0.7);">Logged In deals:</span>',
          'Revenue \u00D7 Collection% contributes to Confirmed Base. Payout = 100% of Deal Incentive Share.'
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
          <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK};">${tcfCell(d, { withProject: true })}${d.sharePct !== undefined && d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : ''}</td>
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
          <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK};">${tcfCell(d, { withProject: true })}${d.sharePct !== undefined && d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : ''}</td>
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
      // For LOGGEDIN deals, the confirmed contribution is NR×coll%, not full NR
      const confDealRev = (d.isLoggedIn && d.collection > 0) ? d.revenue * (d.collection / 100) : d.revenue;
      const confShareCell = showConf
        ? shareCellHtml(c.confIncentive, dr.confShare, confDealRev, c.confBase, confApplies)
        : `<td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; text-align: right; color: ${T.MUTED}; font-size: 14px;">-</td>`;

      // Which cell
      let whichCell;
      if (dr.whichApplies === 'provisional') {
        whichCell = '<strong style="color: ' + T.GREEN_DEEP + ';">Provisional</strong><br><span style="color: ' + T.INK_SOFT + '; font-size: 10.5px;">25% focus advance</span>';
      } else if (dr.whichApplies === 'confirmed') {
        whichCell = d.isLoggedIn
          ? '<strong style="color: #1E40AF;">Logged In</strong><br><span style="color: ' + T.INK_SOFT + '; font-size: 10.5px;">NR×' + fmtPct(d.collection) + ' in base, 100% payout</span>'
          : '<strong style="color: ' + T.ORANGE_DEEP + ';">Confirmed</strong><br><span style="color: ' + T.INK_SOFT + '; font-size: 10.5px;">Collection ' + fmtPct(d.collection) + '</span>';
      } else {
        whichCell = '<strong style="color: ' + T.MUTED + ';">No incentive</strong>' +
                    (dr.noReason ? '<br><span style="color: ' + T.MUTED + '; font-size: 10.5px; font-style: italic;">' + escapeHtml(dr.noReason) + '</span>' : '');
      }

      // Payable cell - bold amount + small calc note
      const payCell = dr.payable > 0
        ? `<div style="font-family: ${T.MONO}; font-size: 10px; color: ${T.MUTED}; text-align: right; line-height: 1.3;">${dr.calcNote}</div><div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${T.NAVY}; text-align: right; margin-top: 3px; line-height: 1.2;">= ${fmtINR(dr.payable)}</div>`
        : `<div style="font-family: ${T.MONO}; font-size: 13.5px; font-weight: 700; color: ${T.INK}; text-align: right;">\u20B90</div>`;

      rows += `<tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10px; color: ${T.INK};">${tcfCell(d, { withProject: true })}${d.sharePct !== undefined && d.sharePct !== 100 ? `<br><span style="font-family: ${T.FONT}; font-size: 9px; color: ${T.ORANGE_DEEP}; font-weight: 700;">Share ${d.sharePct}%</span>` : ''}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.MONO}; font-size: 10.5px; text-align: right; color: ${T.INK}; white-space: nowrap;">${fmtINR(d.revenue)}</td>
        <td style="padding: 10px; border-bottom: 1px solid ${T.BORDER}; vertical-align: middle; font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT};">${d.isLoggedIn ? 'Logged In' : d.stage}<br>${d.type}</td>
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
        <td style="padding: 8px 10px; border-bottom: 1px solid ${T.BORDER}; font-family: ${T.MONO}; font-size: 10.5px; color: ${T.INK}; white-space: nowrap;">${tcfCell(dr.deal)}</td>
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
      <p style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; margin: 20px 0 6px 0; font-weight: 700;">Monetary &amp; ESOP breakup <span style="font-size: 11px; color: ${T.INK_SOFT}; font-weight: 500;">- 80% cash in bank, 20% ESOP per deal</span></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid ${T.BORDER}; border-radius: 6px; overflow: hidden;">
        <thead><tr style="background: ${T.NAVY};">
          <th style="padding: 9px 10px; text-align: left; font-size: 10.5px; color: white; font-family: ${T.FONT};">TCF ID</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Final Payable</th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">Monetary <span style="font-weight: 500; color: rgba(255,255,255,0.7);">(80%)</span></th>
          <th style="padding: 9px 10px; text-align: right; font-size: 10.5px; color: white; font-family: ${T.FONT};">ESOP <span style="font-weight: 500; color: rgba(255,255,255,0.7);">(20%)</span></th>
        </tr></thead>
        <tbody>${breakupRows}${breakupTotalRow}</tbody>
      </table>` : '';

    step4Html = sectionH(nextNo(), 'Per-deal payable') + `<tr><td style="padding: 4px 0 12px 0;">
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
    step4Html = sectionH(nextNo(), 'Per-deal payable') + `<tr><td style="padding: 4px 0 12px 0;">
      ${bulletList([
        c.overallScenario === 'below_target'
          ? `Neither Provisional nor Confirmed Deal Revenue crossed the Eligibility Target this cycle. All per-deal payables are \u20B90.`
          : `None of your deals qualified for a payable amount this cycle.`,
        `Once your cumulative revenue crosses <strong>${fmtINR(c.eligibilityTarget)}</strong>, the calculation kicks in from the next Dollar Day.`
      ])}
    </td></tr>`;
  }


  // ============ STEP 5: Due Incentive - CASH ONLY ============
  // Due = FY27 Monetary Payable (80% of FY27) + Prior Period Payable (already cash) - Already Paid (cash)
  const dueColor = c.due < 0 ? T.RED_DEEP : (c.due > 0 ? T.GREEN_DEEP : T.INK);
  const hasBackYears = c.backYear && c.backYear.total > 0;
  const cumulativeBox = hasBackYears
    ? `<div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
        FY27 Monetary Payable (80% of \u20B9${fmtINRnoSym(c.fy27Payable)}) = <strong>${fmtINR(c.fy27CashPayable)}</strong><br>
        Prior Period Payable = <strong>${fmtINR(c.backYear.total)}</strong><br>
        Cumulative Monetary Payable = ${fmtINR(c.fy27CashPayable)} + ${fmtINR(c.backYear.total)} = <strong>${fmtINR(c.cumulativeCash)}</strong><br>
        Total Already Paid = <strong>${fmtINR(c.alreadyPaid)}</strong><br>
        <strong>Due Incentive (cash in bank) = ${fmtINR(c.cumulativeCash)} \u2212 ${fmtINR(c.alreadyPaid)} = <span style="color:${dueColor};">${fmtINR(c.due)}</span></strong>
      </div>`
    : `<div style="font-family: ${T.MONO}; font-size: 13px; color: ${T.INK}; padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.NAVY}; border-radius: 3px; line-height: 1.7;">
        FY27 Monetary Payable (80% of \u20B9${fmtINRnoSym(c.fy27Payable)}) = <strong>${fmtINR(c.fy27CashPayable)}</strong><br>
        Total Already Paid = <strong>${fmtINR(c.alreadyPaid)}</strong><br>
        <strong>Due Incentive (cash in bank) = ${fmtINR(c.fy27CashPayable)} \u2212 ${fmtINR(c.alreadyPaid)} = <span style="color:${dueColor};">${fmtINR(c.due)}</span></strong>
      </div>`;
  const step5Html = sectionH(nextNo(), 'Due Incentive (cash in bank) after netting Already Paid') + `<tr><td style="padding: 4px 0 12px 0;">
    ${cumulativeBox}
    ${c.due < 0 ? `
      <div style="margin-top: 10px; padding: 12px 14px; background: ${T.RED_SOFT}; border-left: 3px solid ${T.RED}; border-radius: 3px;">
        <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
          <strong style="color: ${T.RED_DEEP};">No clawback:</strong> Nothing is disbursed this cycle, and the amount already paid stays with you. Disbursement will be released whenever the due incentive becomes positive.
        </p>
      </div>
    ` : ''}
  </td></tr>`;

  // ============ STEP 6: CRM release ============
  let step6Html = '';
  if (c.due > 0) {
    if (rm.hasCrm) {
      step6Html = sectionH(nextNo(), 'CRM release check') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.GREEN_SOFT}; border-left: 3px solid ${T.GREEN}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            <strong style="color: ${T.GREEN_DEEP};">Release \u2713.</strong> You have a CRM-approved deal in the T-1 or T month (T = Dollar Day month), so the Due amount disburses this Dollar Day.
          </p>
        </div>
      </td></tr>`;
    } else {
      step6Html = sectionH(nextNo(), 'CRM release check') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.AMBER_SOFT}; border-left: 3px solid ${T.ORANGE}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            <strong style="color: #A16207;">Incentive Held</strong> as you don't have a CRM-approved deal in the T-1 or T month (T = Dollar Day month).<br>Your Due Incentive of <strong>${fmtINR(c.due)}</strong> will release automatically the next qualifying month.
          </p>
        </div>
      </td></tr>`;
    }
  } else {
    step6Html = sectionH(nextNo(), 'CRM release check - not applicable') + `<tr><td style="padding: 4px 0 12px 0;">
        <div style="padding: 12px 14px; background: ${T.NAVY_SOFT}; border-left: 3px solid ${T.MUTED}; border-radius: 3px;">
          <p style="font-family: ${T.FONT}; font-size: 13px; color: ${T.INK}; line-height: 1.55; margin: 0;">
            The CRM check only matters when the Due amount is above \u20B90. Your Due amount is not positive this cycle, so nothing is disbursed regardless of CRM approval.
          </p>
        </div>
      </td></tr>`;
  }

  // ============ STEP 7: Disbursement + overall incentive summary ============
  let step7Html = '';
  if (c.dueForRelease > 0) {
    // Cash disbursed this cycle = Due Incentive (cash-only)
    // Reverse-calc'd Total Incentive for this disbursement = Due / 0.80
    const cashThisCycle = c.dueForRelease;
    const esopThisCycle = cashThisCycle * 0.25;
    step7Html = sectionH(nextNo(), 'This Dollar Day disbursement') + `<tr><td style="padding: 4px 0 20px 0;">
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
    const zeroNote = (c.due > 0 && !rm.hasCrm) ? 'Held until CRM approval' : 'No disbursement this cycle';
    step7Html = sectionH(nextNo(), 'This Dollar Day disbursement') + `<tr><td style="padding: 4px 0 20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td width="49%" style="background: ${T.NAVY_SOFT}; border: 1px solid ${T.BORDER_STRONG}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.MUTED}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">CASH IN BANK</div>
            <div style="font-family: ${T.MONO}; font-size: 22px; font-weight: 700; color: ${T.MUTED};">\u20B90</div>
            <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT}; margin-top: 4px;">${zeroNote}</div>
          </td>
          <td width="2%"></td>
          <td width="49%" style="background: ${T.NAVY_SOFT}; border: 1px solid ${T.BORDER_STRONG}; border-radius: 6px; padding: 16px; text-align: center;">
            <div style="font-family: ${T.FONT}; font-size: 10.5px; color: ${T.MUTED}; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px;">ESOP</div>
            <div style="font-family: ${T.MONO}; font-size: 22px; font-weight: 700; color: ${T.MUTED};">\u20B90</div>
            <div style="font-family: ${T.FONT}; font-size: 11px; color: ${T.INK_SOFT}; margin-top: 4px;">${zeroNote}</div>
          </td>
        </tr>
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

        <tr><td class="pdf-section-start" style="background: #000000; padding: 18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <img src="${LOGO_WHITE}" alt="Square Yards" height="34" style="display: block; height: 34px; width: auto;">
              </td>
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

        <tr><td style="padding: 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            ${stepsHtmlDue}
          </table>
        </td></tr>

        <tr><td class="pdf-section-start" style="padding: 24px 28px 24px 28px;">
          <div style="font-family: ${T.FONT}; font-size: 13.5px; color: ${T.INK}; line-height: 1.6; margin-bottom: 10px;">If you still have any doubts, please first reach out to your T3 or P&amp;L. If your doubts remain unresolved, write to <a href="mailto:incentive@squareyards.com" style="color: ${T.NAVY}; font-weight: 700; text-decoration: none;">incentive@squareyards.com</a>.</div>
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
  const first = rm.name;   // full name in the greeting, not just the first word
  const rangeLabel = c.coverage ? c.coverage.rangeLabel : '';
  const lines = [];
  lines.push(`Hi ${first},`, '');
  lines.push(`Below is your incentive breakdown for ${c.ddLabel} Dollar Day.`);
  lines.push(`YTD Salary Cost and deals from ${rangeLabel} considered.`);
  lines.push('');
  if (c.overallScenario === 'positive' || c.overallScenario === 'provisional_only') {
    lines.push(`This-cycle cash in bank = ${fmtINR(c.dueForRelease)} (Due Incentive); ESOP = ${fmtINR(c.dueForRelease * 0.25)} (reverse-calc from cash)`);
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
  lines.push('If you still have any doubts, please first reach out to your T3 or P&L. If your doubts remain unresolved, write to incentive@squareyards.com.');
  lines.push('');
  lines.push('Regards,');
  lines.push('Incentive Team');
  lines.push('Square Yards');
  lines.push('');
  lines.push('This document is confidential and intended solely for the named recipient. Please do not forward or share it with anyone else.');
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
