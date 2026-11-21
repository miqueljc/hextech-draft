// ===== Bloc O: Mode partida (una sola persona porta el draft) =====
const MM = { open: false, search: false, editing: false, q: '', why: null, timer: false, t0: 0, lastStep: '', saved: '', copied: false };
try { MM.timer = localStorage.getItem('hextech_mm_timer') === '1'; } catch (e) {}
let _mmTick = null;
const MM_SECS = 30;
const MM_SHORT = { 'Miss Fortune': 'MF', 'Twisted Fate': 'TF', 'Jarvan IV': 'J4', 'Aurelion Sol': 'A. Sol', 'Doctor Mundo': 'Mundo', 'Renata Glasc': 'Renata', 'Tahm Kench': 'Tahm', 'Master Yi': 'Yi', 'Xin Zhao': 'Xin', 'Nunu & Willump': 'Nunu', 'Fiddlesticks': 'Fiddle', 'Heimerdinger': 'Heimer', 'Mordekaiser': 'Morde', 'Blitzcrank': 'Blitz', 'Tryndamere': 'Trynd', 'Gangplank': 'GP', 'Cassiopeia': 'Cassio' };
const MM_ALIAS = { mf: 'Miss Fortune', tf: 'Twisted Fate', j4: 'Jarvan IV', asol: 'Aurelion Sol', yi: 'Master Yi', mundo: 'Doctor Mundo', tk: 'Tahm Kench', ww: 'Warwick', gp: 'Gangplank', kog: "Kog'Maw", morde: 'Mordekaiser', blitz: 'Blitzcrank', cass: 'Cassiopeia', heimer: 'Heimerdinger', fiddle: 'Fiddlesticks', nunu: 'Nunu & Willump', wu: 'Wukong', lb: 'LeBlanc', ks: "K'Sante" };
function mmShort(c) { return MM_SHORT[c] || (c.length > 9 ? c.slice(0, 8) + '…' : c); }
function mmArr(type, side) { return type === 'BAN' ? (side === 'BLUE' ? state.blueBans : state.redBans) : (side === 'BLUE' ? state.bluePicks : state.redPicks); }
function mmComplete() { return TOURNAMENT_ORDER.every(s => mmArr(s.type, s.side)[s.index] !== null); }
function mmStepKey() { const s = state.activeSlot; return s.type + s.side + s.index + '|' + [...state.blueBans, ...state.redBans, ...state.bluePicks, ...state.redPicks].filter(Boolean).length; }
function mmAttr(c) { return `data-c="${escapeHtml(c)}"`; }

function openMatchMode() {
  let el = document.getElementById('matchMode');
  if (!el) { el = document.createElement('div'); el.id = 'matchMode'; document.body.appendChild(el); }
  MM.open = true; MM.lastStep = ''; el.style.display = 'block';
  document.documentElement.classList.add('mm-lock');
  clearInterval(_mmTick); _mmTick = setInterval(mmUpdateTimer, 250);
  renderMatch();
}
function closeMatchMode() {
  MM.open = false; clearInterval(_mmTick);
  const el = document.getElementById('matchMode'); if (el) el.style.display = 'none';
  document.documentElement.classList.remove('mm-lock');
  renderAll();
}
function mmToggleTimer() { MM.timer = !MM.timer; MM.t0 = Date.now(); try { localStorage.setItem('hextech_mm_timer', MM.timer ? '1' : '0'); } catch (e) {} renderMatch(); }
function mmUpdateTimer() {
  const t = document.getElementById('mmTimer'); if (!t) return;
  const left = Math.max(0, MM_SECS - Math.floor((Date.now() - MM.t0) / 1000));
  t.textContent = left + ' s'; t.className = 'mm-timer' + (left <= 5 ? ' mm-late' : left <= 10 ? ' mm-warnt' : '');
}
const _renderAllBaseO = renderAll;
renderAll = function () { _renderAllBaseO.apply(this, arguments); if (MM.open) { try { renderMatch(); } catch (e) { console.warn('renderMatch', e); } } };

// ---- Accions ----
function mmPick(c) { MM.search = false; MM.editing = false; MM.q = ''; pickChampion(c); }
function mmPickPair(a, b) { MM.search = false; pickChampion(a); if (!getOurPicks().includes(b)) pickChampion(b); }
function mmWhy(k) { MM.why = MM.why === k ? null : k; renderMatch(); }
function mmOpenSearch() { MM.search = true; MM.q = ''; renderMatch(); }
function mmCancelSearch() {
  MM.search = false; MM.q = '';
  if (MM.editing) { MM.editing = false; const nx = TOURNAMENT_ORDER.find(s => mmArr(s.type, s.side)[s.index] === null); if (nx) state.activeSlot = { type: nx.type, side: nx.side, index: nx.index }; renderAll(); return; }
  renderMatch();
}
function mmEdit(type, side, i) {
  state.activeSlot = { type, side, index: i };
  MM.editing = true; MM.search = true; MM.q = '';
  MM.lastStep = mmStepKey();
  renderAll();
}
function mmClearSlot() {
  const { type, side, index } = state.activeSlot;
  pushHistory(); mmArr(type, side)[index] = null;
  MM.editing = false; MM.search = false; renderAll();
}
function mmSearch(v) { MM.q = v; const r = document.getElementById('mmRes'); if (r) r.innerHTML = mmResults(); }
function mmResults() {
  const raw = MM.q.trim(); if (!raw) return '<div class="mm-hint">Escriu 2-3 lletres (també àlies: mf, tf, j4, ww…)</div>';
  const q = normName(raw), un = getUnavailableChamps(), alias = MM_ALIAS[q];
  const list = ALL_CHAMPS.filter(c => !un.has(c) && (normName(c).includes(q) || c === alias))
    .sort((a, b) => ((b === alias) - (a === alias)) || (normName(b).startsWith(q) - normName(a).startsWith(q)) || a.localeCompare(b)).slice(0, 15);
  if (!list.length) return '<div class="mm-hint">Cap campió disponible amb aquest nom.</div>';
  return `<div class="mm-chips">${list.map(c => `<button class="mm-chip" ${mmAttr(c)} onclick="mmPick(this.dataset.c)">${champIcon(c, 32)}<span class="mm-chipt"><b>${escapeHtml(c)}</b></span></button>`).join('')}</div>`;
}
function mmSave(res) {
  if (MM.saved) return;
  MM.saved = res;
  if (state.fearless) { closeGame(res); MM.saved = ''; return; }
  recordDraft(res); renderMatch();
}
function mmNewDraft() { MM.saved = ''; MM.copied = false; resetDraft(); }
function mmCopy() {
  let t = '';
  try {
    const s = buildStrategy();
    t = `🎮 **DRAFT** (${state.ourSide === 'BLUE' ? 'blau' : 'vermell'})\n` + s.lanes.map(l => `• ${l.role}: ${l.player.name.split('#')[0]} — ${l.champ || '—'}`).join('\n') + '\n' + buildsDiscordText(s);
  } catch (e) { t = getOurPicks().filter(Boolean).join(', '); }
  const done = () => { MM.copied = true; renderMatch(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => { mmFallbackCopy(t); done(); });
  else { mmFallbackCopy(t); done(); }
}
function mmFallbackCopy(t) { try { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); } catch (e) {} }

// ---- Peces de la pantalla ----
function mmBoard() {
  const st = state.activeSlot, done = mmComplete();
  const row = side => {
    const cell = (type, i, c) => {
      const act = !done && st.type === type && st.side === side && st.index === i;
      return `<button class="mm-cell ${type === 'BAN' ? 'mm-bancell' : ''} ${act ? 'mm-act' : ''} ${c ? 'mm-full' : ''}" onclick="mmEdit('${type}','${side}',${i})">${c ? champIcon(c, 0) + `<span class="mm-cn">${escapeHtml(mmShort(c))}</span>` : (type === 'BAN' ? 'B' : 'P') + (i + 1)}</button>`;
    };
    const ours = side === state.ourSide;
    return `<div class="mm-row ${side === 'BLUE' ? 'mm-blue' : 'mm-red'}"><div class="mm-side">${side === 'BLUE' ? '🔵' : '🔴'} ${ours ? 'Nosaltres' : 'Rival'}</div>
      <div class="mm-bans">${mmArr('BAN', side).map((c, i) => cell('BAN', i, c)).join('')}</div>
      <div class="mm-picks">${mmArr('PICK', side).map((c, i) => cell('PICK', i, c)).join('')}</div></div>`;
  };
  return row('BLUE') + row('RED');
}
function mmReasons(r, n) {
  const pos = r.why.filter(w => w.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, n);
  const warn = r.why.filter(w => w.pts < 0).sort((a, b) => a.pts - b.pts)[0];
  return `<ul class="mm-why">${pos.map(w => `<li>${escapeHtml(w.txt)}</li>`).join('')}</ul>${warn ? `<div class="mm-warn">⚠️ ${escapeHtml(warn.txt)}</div>` : ''}`;
}
function mmFullWhy(r) {
  return `<div class="mm-full">${r.why.slice().sort((a, b) => b.pts - a.pts).map(w => `<div><span class="${w.pts > 0 ? 'mm-plus' : 'mm-minus'}">${w.pts > 0 ? '+' : ''}${w.pts}</span> ${escapeHtml(w.txt)}</div>`).join('')}</div>`;
}
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
function mmOurPick() {
  const st = state.activeSlot, ctx = buildCtx(), pos = draftPos();
  let pairHtml = '';
  if (pos.nextOurs) {
    const p = pairRecs(ctx, st.index, pos.nextIdx, 1)[0];
    if (p) {
      const s = synScore(p.a.champ, p.b.champ);
      pairHtml = `<div class="mm-card mm-pair"><div class="mm-card-h"><span class="mm-ch">${champIcon(p.a.champ, 40)}${champIcon(p.b.champ, 40)}<b>${escapeHtml(p.a.champ)} + ${escapeHtml(p.b.champ)}</b></span><span class="mm-pts">${p.score}</span></div>
        <div class="mm-who">${mmPairWho(p.a.champ, p.b.champ, st.index, pos.nextIdx)}</div><div class="mm-sub">Doble pick: millor parella per a aquest torn i el següent${s && s.real ? ` · sinergia real ${s.wr}% (${s.g} partides)` : ''}</div>
        <div class="mm-btns"><button class="btn btn-primary" data-a="${escapeHtml(p.a.champ)}" data-b="${escapeHtml(p.b.champ)}" onclick="mmPickPair(this.dataset.a,this.dataset.b)">✅ Tria tots dos</button></div></div>`;
    }
  }
  const recs = recommendChamps(ctx, st.index).slice(0, 3);
  return pairHtml + recs.map((r, k) => `<div class="mm-card"><div class="mm-card-h"><span class="mm-ch">${champIcon(r.champ, 44)}<b>${escapeHtml(r.champ)}</b></span><span class="mm-pts">${r.score}</span></div>
      <div class="mm-who">${mmWho(r.champ, st.index)}</div>${mmReasons(r, 2)}
      <div class="mm-btns"><button class="btn btn-primary" ${mmAttr(r.champ)} onclick="mmPick(this.dataset.c)">✅ Tria</button><button class="btn" onclick="mmWhy(${k})">${MM.why === k ? 'Amaga' : 'Per què'}</button></div>
      ${MM.why === k ? mmFullWhy(r) : ''}</div>`).join('') + mmOtherBtn('Un altre campió…');
}
function mmOurBan() {
  const recs = recommendBans(buildCtx()).slice(0, 3);
  return recs.map((r, k) => `<div class="mm-card"><div class="mm-card-h"><span class="mm-ch">${champIcon(r.champ, 44, 'ci-banc')}<b>${escapeHtml(r.champ)}</b></span><span class="mm-pts">${r.score}</span></div>${mmReasons(r, 2)}
      <div class="mm-btns"><button class="btn btn-primary" ${mmAttr(r.champ)} onclick="mmPick(this.dataset.c)">🚫 Bane'l</button><button class="btn" onclick="mmWhy(${k})">${MM.why === k ? 'Amaga' : 'Per què'}</button></div>
      ${MM.why === k ? mmFullWhy(r) : ''}</div>`).join('') + mmOtherBtn('Un altre ban…');
}
function mmEnemyPick() {
  const preds = predictEnemy(buildCtx()).slice(0, 6);
  return `<div class="mm-label">Què ha triat el rival? Els més probables:</div><div class="mm-chips">${preds.map(x => `<button class="mm-chip mm-big" ${mmAttr(x.champ)} onclick="mmPick(this.dataset.c)">${champIcon(x.champ, 36)}<span class="mm-chipt"><b>${escapeHtml(x.champ)}</b></span><span>${Math.round(x.prob * 100)}%</span></button>`).join('')}</div>` + mmOtherBtn('Un altre…');
}
function mmEnemyBan() {
  const ctx = buildCtx(), seen = new Set(), list = [];
  recommendChamps(ctx, -1).slice(0, 4).forEach(r => { if (!seen.has(r.champ)) { seen.add(r.champ); list.push({ c: r.champ, t: 'fort per a vosaltres' }); } });
  recommendBans(ctx).slice(0, 4).forEach(r => { if (!seen.has(r.champ)) { seen.add(r.champ); list.push({ c: r.champ, t: 'fort al meta' }); } });
  return `<div class="mm-label">Què ha banejat el rival? Suggeriments:</div><div class="mm-chips">${list.slice(0, 8).map(x => `<button class="mm-chip mm-big" ${mmAttr(x.c)} onclick="mmPick(this.dataset.c)">${champIcon(x.c, 36)}<span class="mm-chipt"><b>${escapeHtml(x.c)}</b><span>${x.t}</span></span></button>`).join('')}</div>` + mmOtherBtn('Un altre…');
}
function mmOtherBtn(t) { return `<button class="btn mm-other" onclick="mmOpenSearch()">🔎 ${t}</button>`; }
function mmSearchHtml() {
  const st = state.activeSlot, cur = mmArr(st.type, st.side)[st.index];
  return `<div class="mm-label">${MM.editing ? `Corregeix ${st.type === 'BAN' ? 'el ban' : 'el pick'} ${st.index + 1} (${st.side === state.ourSide ? 'vostre' : 'rival'})${cur ? ': ara hi ha ' + escapeHtml(cur) : ''}` : 'Cerca el campió'}</div>
    <input id="mmQ" class="mm-input" type="search" autocomplete="off" placeholder="Nom del campió…" value="${escapeHtml(MM.q)}" oninput="mmSearch(this.value)">
    <div id="mmRes">${mmResults()}</div>
    <div class="mm-btns"><button class="btn" onclick="mmCancelSearch()">✕ Cancel·la</button>${MM.editing && cur ? '<button class="btn" onclick="mmClearSlot()">🗑️ Buida la casella</button>' : ''}</div>`;
}
function mmSummary() {
  let rows = '';
  try {
    const s = buildStrategy();
    rows = s.lanes.map(l => {
      const b = l.build;
      return `<div class="mm-sum"><div><b>${l.role}</b> · ${escapeHtml(l.player.name.split('#')[0])} — <b>${escapeHtml(l.champ || '—')}</b></div>${b ? `<div class="mm-sub">${escapeHtml(b.keystone)} · ${escapeHtml((b.start || '').split(' (')[0])}${b.start ? ' → ' : ''}${escapeHtml((b.core[0] || '').split(' (')[0])}</div>` : ''}</div>`;
    }).join('');
  } catch (e) { rows = `<div class="mm-sum">${getOurPicks().filter(Boolean).map(escapeHtml).join(', ')}</div>`; }
  const saved = MM.saved ? `<div class="mm-hint">✅ Desat a l'historial (${MM.saved === 'W' ? 'victòria' : 'derrota'}).</div>` : '';
  return `<div class="mm-label">Draft complet. Qui juga què:</div>${rows}
    <div class="mm-btns"><button class="btn btn-primary" onclick="mmCopy()">📋 ${MM.copied ? 'Copiat!' : 'Copia per a Discord'}</button><button class="btn" onclick="closeMatchMode();switchTab('analysis')">⚡ Pla de partida</button></div>
    <div class="mm-label" style="margin-top:12px;">${state.fearless ? 'Tanca la partida de la sèrie (Fearless):' : 'Resultat de la partida (per a l\'historial):'}</div>
    <div class="mm-btns"><button class="btn" ${MM.saved ? 'disabled' : ''} onclick="mmSave('W')">✅ Victòria</button><button class="btn" ${MM.saved ? 'disabled' : ''} onclick="mmSave('L')">❌ Derrota</button></div>${saved}
    <div class="mm-btns"><button class="btn" onclick="mmNewDraft()">🔄 Nou draft</button></div>`;
}
function renderMatch() {
  const el = document.getElementById('matchMode'); if (!el || !MM.open) return;
  const key = mmStepKey(), changed = key !== MM.lastStep;
  if (changed) { MM.lastStep = key; MM.t0 = Date.now(); MM.why = null; if (!MM.editing) { MM.search = false; MM.q = ''; } }
  const done = mmComplete(), st = state.activeSlot, ours = st.side === state.ourSide;
  const step = TOURNAMENT_ORDER.find(s => s.type === st.type && s.side === st.side && s.index === st.index);
  const label = done ? '✅ Draft complet' : MM.editing ? '✏️ Correcció' : (step ? step.label : `${st.type === 'BAN' ? 'Ban' : 'Pick'} ${st.side} ${st.index + 1}`);
  let sub = '';
  if (!done && !MM.editing) {
    sub = ours ? (st.type === 'BAN' ? 'Torn vostre: baneja' : 'Torn vostre: tria') : 'Torn rival: registra el que triïn';
    if (st.type === 'PICK') {
      const pos = draftPos();
      if (ours) sub += pos.enemyAfter === 0 ? ' · últim pick: el rival ja no pot respondre' : ` · el rival encara té ${pos.enemyAfter} pick${pos.enemyAfter > 1 ? 's' : ''}`;
    }
  }
  let body;
  if (MM.search) body = mmSearchHtml();
  else if (done) body = mmSummary();
  else if (ours && st.type === 'PICK') body = mmOurPick();
  else if (ours) body = mmOurBan();
  else if (st.type === 'PICK') body = mmEnemyPick();
  else body = mmEnemyBan();
  const y = el.scrollTop;
  el.innerHTML = `<div class="mm-wrap">
    <div class="mm-top"><div class="mm-title">🎮 Mode partida</div>
      <div class="mm-topbtns"><button class="btn" onclick="mmToggleTimer()">⏱️ ${MM.timer ? 'ON' : 'OFF'}</button><button class="btn" onclick="closeMatchMode()">✕ Surt</button></div></div>
    <div class="mm-board">${mmBoard()}</div>
    <div class="mm-turn ${done ? 'mm-done' : ours ? 'mm-ours' : 'mm-enemy'}"><div><div class="mm-turnlabel">${escapeHtml(label)}</div>${sub ? `<div class="mm-sub">${escapeHtml(sub)}</div>` : ''}</div>${MM.timer && !done ? '<span id="mmTimer" class="mm-timer"></span>' : ''}</div>
    <div class="mm-body">${body}</div>
    <div class="mm-foot"><button class="btn mm-undo" onclick="MM.editing=false;MM.search=false;undoLast()" ${state.history.length ? '' : 'disabled'}>↩️ Desfer</button></div>
  </div>`;
  el.scrollTop = changed ? 0 : y;
  mmUpdateTimer();
  if (MM.search) { const q = document.getElementById('mmQ'); if (q) { q.focus(); const v = q.value; q.value = ''; q.value = v; } }
}
(function mmStyles() {
  const css = `
  html.mm-lock, html.mm-lock body { overflow: hidden !important; }
  #matchMode { display:none; position:fixed; inset:0; z-index:9000; background:#050B14; overflow-y:auto; -webkit-overflow-scrolling:touch; color:var(--text-main); }
  #matchMode .mm-wrap { max-width:560px; margin:0 auto; padding:0 12px 96px; }
  #matchMode .mm-top { position:sticky; top:0; z-index:2; background:#050B14; display:flex; justify-content:space-between; align-items:center; padding:10px 0 6px; }
  #matchMode .mm-title { font-weight:800; color:var(--gold); font-size:1rem; }
  #matchMode .mm-topbtns { display:flex; gap:6px; }
  #matchMode .mm-board { position:sticky; top:50px; z-index:2; background:#050B14; padding-bottom:6px; border-bottom:1px solid var(--border-gold); }
  #matchMode .mm-row { padding:4px 0; }
  #matchMode .mm-side { font-size:0.7rem; font-weight:700; margin-bottom:3px; }
  #matchMode .mm-blue .mm-side { color:var(--blue); } #matchMode .mm-red .mm-side { color:#FF8A9B; }
  #matchMode .mm-bans, #matchMode .mm-picks { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; margin-bottom:4px; }
  #matchMode .mm-cell { min-height:34px; padding:2px; border-radius:6px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:var(--text-muted); font-size:0.72rem; font-weight:700; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  #matchMode .mm-bancell { min-height:26px; font-size:0.64rem; }
  #matchMode .mm-blue .mm-full { color:var(--text-main); border-color:rgba(10,200,185,0.5); background:rgba(10,200,185,0.12); }
  #matchMode .mm-red .mm-full { color:var(--text-main); border-color:rgba(255,138,155,0.5); background:rgba(255,70,85,0.12); }
  #matchMode .mm-bancell.mm-full { text-decoration:line-through; opacity:0.85; }
  #matchMode .mm-act { border:2px solid var(--gold) !important; color:var(--gold) !important; box-shadow:0 0 0 2px rgba(200,155,60,0.25); }
  #matchMode .mm-turn { display:flex; justify-content:space-between; align-items:center; gap:8px; margin:10px 0; padding:10px 12px; border-radius:10px; border:1px solid var(--border-gold); }
  #matchMode .mm-ours { background:rgba(10,200,185,0.1); border-color:rgba(10,200,185,0.5); }
  #matchMode .mm-enemy { background:rgba(255,70,85,0.08); border-color:rgba(255,138,155,0.45); }
  #matchMode .mm-done { background:rgba(200,155,60,0.1); }
  #matchMode .mm-turnlabel { font-size:1.05rem; font-weight:800; }
  #matchMode .mm-sub { font-size:0.78rem; color:var(--text-muted); margin-top:2px; }
  #matchMode .mm-timer { font-size:1.4rem; font-weight:800; color:var(--gold); min-width:56px; text-align:right; }
  #matchMode .mm-warnt { color:#F5B041; } #matchMode .mm-late { color:#FF4655; }
  #matchMode .mm-card { border:1px solid rgba(200,155,60,0.35); background:rgba(255,255,255,0.03); border-radius:10px; padding:10px 12px; margin-bottom:8px; }
  #matchMode .mm-pair { border-color:var(--gold); background:rgba(200,155,60,0.08); }
  #matchMode .mm-card-h { display:flex; justify-content:space-between; align-items:baseline; font-size:1.08rem; }
  #matchMode .mm-pts { color:var(--gold); font-size:0.8rem; font-weight:700; }
  #matchMode .mm-who { font-size:0.8rem; color:var(--blue); margin-top:2px; }
  #matchMode .mm-why { margin:6px 0 0 18px; padding:0; font-size:0.8rem; }
  #matchMode .mm-warn { font-size:0.78rem; color:#FF8A9B; margin-top:4px; }
  #matchMode .mm-full { margin-top:8px; font-size:0.76rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px; }
  #matchMode .mm-plus { color:var(--blue); font-weight:700; } #matchMode .mm-minus { color:#FF8A9B; font-weight:700; }
  #matchMode .mm-btns { display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
  #matchMode .mm-btns .btn { flex:1; min-height:44px; }
  #matchMode .mm-label { font-size:0.82rem; color:var(--text-muted); margin:4px 0 8px; }
  #matchMode .mm-chips { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  #matchMode .mm-chip { min-height:46px; border-radius:8px; border:1px solid rgba(200,155,60,0.4); background:rgba(255,255,255,0.04); color:var(--text-main); display:flex; justify-content:space-between; align-items:center; gap:6px; padding:6px 10px; font-size:0.86rem; text-align:left; }
  #matchMode .mm-chip span { font-size:0.7rem; color:var(--text-muted); }
  #matchMode .mm-big { min-height:54px; }
  #matchMode .mm-other { width:100%; margin-top:10px; min-height:44px; }
  #matchMode .mm-input { width:100%; box-sizing:border-box; padding:12px; font-size:1rem; border-radius:8px; background:#0A1428; border:1px solid var(--border-gold); color:var(--text-main); margin-bottom:8px; }
  #matchMode .mm-hint { font-size:0.8rem; color:var(--text-muted); padding:6px 0; }
  #matchMode .mm-sum { padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.88rem; }
  #matchMode .mm-foot { position:fixed; left:0; right:0; bottom:0; padding:10px 12px calc(10px + env(safe-area-inset-bottom)); background:linear-gradient(transparent, #050B14 35%); display:flex; justify-content:center; }
  #matchMode .mm-undo { width:100%; max-width:536px; min-height:50px; font-size:1rem; }
  #matchBtn { width:100%; margin-bottom:12px; min-height:46px; font-size:0.95rem; }
  `;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();
