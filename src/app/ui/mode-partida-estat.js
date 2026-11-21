// ===== Mode partida: estat de la pantalla i accions =====
const MM = { open: false, search: false, editing: false, q: '', why: null, timer: false, t0: 0, lastStep: '', saved: '', copied: false };
try { MM.timer = localStorage.getItem('hextech_mm_timer') === '1'; } catch (e) {}
let _mmTick = null;
const MM_SECS = 30;
const MM_SHORT = { 'Miss Fortune': 'MF', 'Twisted Fate': 'TF', 'Jarvan IV': 'J4', 'Aurelion Sol': 'A. Sol', 'Doctor Mundo': 'Mundo', 'Renata Glasc': 'Renata', 'Tahm Kench': 'Tahm', 'Master Yi': 'Yi', 'Xin Zhao': 'Xin', 'Nunu & Willump': 'Nunu', 'Fiddlesticks': 'Fiddle', 'Heimerdinger': 'Heimer', 'Mordekaiser': 'Morde', 'Blitzcrank': 'Blitz', 'Tryndamere': 'Trynd', 'Gangplank': 'GP', 'Cassiopeia': 'Cassio' };
const MM_ALIAS = { mf: 'Miss Fortune', tf: 'Twisted Fate', j4: 'Jarvan IV', asol: 'Aurelion Sol', yi: 'Master Yi', mundo: 'Doctor Mundo', tk: 'Tahm Kench', ww: 'Warwick', gp: 'Gangplank', kog: "Kog'Maw", morde: 'Mordekaiser', blitz: 'Blitzcrank', cass: 'Cassiopeia', heimer: 'Heimerdinger', fiddle: 'Fiddlesticks', nunu: 'Nunu & Willump', wu: 'Wukong', lb: 'LeBlanc', ks: "K'Sante" };
function mmShort(c) { return MM_SHORT[c] || (c.length > 9 ? c.slice(0, 8) + '…' : c); }
function mmStepKey() { const s = state.activeSlot; return s.type + s.side + s.index + '|' + [...state.blueBans, ...state.redBans, ...state.bluePicks, ...state.redPicks].filter(Boolean).length; }
function mmAttr(c) { return `data-c="${escapeHtml(c)}"`; }
// ---- Accions ----
function mmPick(c) { MM.search = false; MM.editing = false; MM.q = ''; pickChampion(c); }
function mmPickPair(a, b) { MM.search = false; pickChampion(a); if (!getOurPicks().includes(b)) pickChampion(b); }
function mmNewDraft() { MM.saved = ''; MM.copied = false; resetDraft(); }
function mmWho(c, idx) {
  try {
    const arr = getOurPicks().slice(); arr[idx] = c;
    const a = autoAssign(arr.filter(Boolean)), i = a.roleChamp.indexOf(c);
    if (i >= 0) return `→ ${escapeHtml(shortName(a.rolePlayer[i]))} · ${ROLE_ORDER[i]}`;
  } catch (e) {}
  return '';
}
function mmPairWho(a, b, i1, i2) {
  try {
    const arr = getOurPicks().slice(); arr[i1] = a; arr[i2] = b;
    const asg = autoAssign(arr.filter(Boolean));
    return [a, b].map(c => { const i = asg.roleChamp.indexOf(c); return i >= 0 ? `${escapeHtml(c)} → ${escapeHtml(shortName(asg.rolePlayer[i]))} · ${ROLE_ORDER[i]}` : escapeHtml(c); }).join(' &nbsp;|&nbsp; ');
  } catch (e) { return ''; }
}
