// ---- Historial de drafts propis (resultat) ----
const HIST_KEY = 'hextech_drafthist_v1';
function loadHist() { try { const h = JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); return Array.isArray(h) ? h : []; } catch (e) { return []; } }
let DRAFT_HIST = loadHist(), _teamRec = null;
function saveHist() { try { localStorage.setItem(HIST_KEY, JSON.stringify(DRAFT_HIST)); } catch (e) {} _teamRec = null; _duoRec = null; _assignCache.clear(); }
function teamRecBonus(p, c) { const r = teamRec(p, c); if (!r || r.w + r.l < 2) return 0; return Math.round(((r.w + 3) / (r.w + r.l + 6) - 0.5) * 30); }
function recordDraft(result) {
  const us = getOurPicks().filter(Boolean);
  if (!us.length) return false;
  const a = getAssignment();
  DRAFT_HIST.push({
    date: new Date().toISOString().slice(0, 10), side: state.ourSide, result, rival: (state.scout && state.scout.team) || '',
    us, enemy: getEnemyPicks().filter(Boolean), bans: { blue: state.blueBans.filter(Boolean), red: state.redBans.filter(Boolean) },
    roles: ROLE_ORDER.map((r, i) => ({ role: r, player: ROSTER[a.rolePlayer[i]].name, champ: a.roleChamp[i] }))
  });
  saveHist(); renderHistory(); return true;
}
function deleteHist(i) { DRAFT_HIST.splice(i, 1); saveHist(); renderHistory(); renderAll(); }
function clearHist() { if (!DRAFT_HIST.length) return; DRAFT_HIST = []; saveHist(); renderHistory(); renderAll(); }

