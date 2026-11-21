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
function saveDraftResult(result) { if (recordDraft(result)) { const el = document.getElementById('histSaved'); if (el) el.textContent = `✅ Desat (${result === 'W' ? 'victòria' : 'derrota'}). Total: ${DRAFT_HIST.length} drafts.`; } }
function deleteHist(i) { DRAFT_HIST.splice(i, 1); saveHist(); renderHistory(); renderAll(); }
function clearHist() { if (!DRAFT_HIST.length) return; DRAFT_HIST = []; saveHist(); renderHistory(); renderAll(); }
function exportHist() {
  const t = JSON.stringify(DRAFT_HIST, null, 1);
  const done = () => { const el = document.getElementById('histMsg'); if (el) el.textContent = '📋 Historial copiat (JSON). Envia-me\'l si vols que el publiqui a les dades compartides.'; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
}
function renderHistory() {
  let el = document.getElementById('histPanel');
  if (!el) { const tab = document.getElementById('tab-data'); if (!tab) return; el = document.createElement('div'); el.id = 'histPanel'; el.className = 'panel'; el.style.marginTop = '12px'; tab.appendChild(el); }
  const w = DRAFT_HIST.filter(h => h.result === 'W').length, n = DRAFT_HIST.length;
  const sh = sharedHist().length, all = allHist(), wAll = all.filter(h => h.result === 'W').length;
  const rows = DRAFT_HIST.slice(-10).reverse().map((h, k) => {
    const i = n - 1 - k;
    return `<div style="font-size:0.74rem;margin-top:4px;display:flex;gap:6px;align-items:flex-start;"><span>${h.result === 'W' ? '✅' : '❌'}</span><span style="flex:1;">${escapeHtml(h.date)} · ${h.side === 'BLUE' ? 'blau' : 'vermell'}${h.rival ? ' vs ' + escapeHtml(h.rival) : ''} — ${h.roles.filter(x => x.champ).map(x => escapeHtml(x.champ)).join(', ')} <span style="color:var(--text-muted);">vs ${h.enemy.map(escapeHtml).join(', ')}</span></span><button class="btn" style="min-height:0;padding:2px 8px;" onclick="deleteHist(${i})">✕</button></div>`;
  }).join('');
  el.innerHTML = `<div class="panel-title">📒 Historial de drafts de l'equip</div>
    <div style="font-size:0.78rem;">${all.length ? `${all.length} partides en total (${sh} compartides per l'equip, ${DRAFT_HIST.length} d'aquest dispositiu) · ${wAll}V-${all.length - wAll}D. El motor en té en compte el resultat per jugador i campió i per parelles de campions (a partir de 2 partides).` : 'Encara no hi ha partides desades. En acabar un draft, desa el resultat (✅/❌).'}<br><span style="color:var(--text-muted);">Per compartir les d'aquest dispositiu amb tot l'equip: «Copia l'historial» i envia-m'ho.</span></div>
    ${rows}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;"><button class="btn" onclick="exportHist()">📋 Copia l'historial</button><button class="btn" onclick="clearHist()">🗑️ Esborra'l tot</button></div>
    <div id="histMsg" style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;"></div>`;
}

