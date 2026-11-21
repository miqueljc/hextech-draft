// ===== Bloc T: aspecte de la versió d'escriptori (selecció de campions amb art de càrrega) =====
const IS_DESK = (() => { try { return !document.querySelector('.bottomnav'); } catch (e) { return false; } })();
try { if (IS_DESK) document.body.classList.add('desk'); } catch (e) {}
function champLoadUrl(c) { return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${ddId(c)}_0.jpg`; }
// Subtítol de la casella: qui el juga i a quin rol (nostres) o rol probable (rival)
function slotSub(side, c) {
  try {
    if (side === state.ourSide) {
      const a = getAssignment(), i = a.roleChamp.indexOf(c);
      if (i >= 0) return `${ROLE_ORDER[i]} · ${escapeHtml(shortName(a.rolePlayer[i]))}`;
    } else {
      const info = enemyRoleInfo(), d = info.dist && info.dist[c];
      if (d) { const i = d.indexOf(Math.max(...d)); return `${ROLE_ORDER[i]} ${d[i] < 0.95 ? Math.round(d[i] * 100) + '%' : ''}`.trim(); }
    }
  } catch (e) {}
  return escapeHtml(champRoles(c).join('/'));
}
// Recomanació en directe: 3 targetes clicables + detall plegable (només escriptori)
let _advOpen = false;
function toggleAdvDetail() { _advOpen = !_advOpen; const b = document.getElementById('liveAdviceBox'); if (b) b.classList.toggle('adv-open', _advOpen); }
function advCardsHtml(ranked) {
  const st = state.activeSlot;
  if (!ranked || !ranked.length || !ranked[0].champ || mmComplete()) return '';
  const ours = st.side === state.ourSide;
  const top = ranked.slice(0, 3);
  const label = ours ? (st.type === 'BAN' ? 'Baneja' : 'Tria') : 'Registra el pick rival:';
  return `<div class="adv-cards">${top.map((r, k) => {
    const pos = (r.why || []).filter(w => w.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, 2);
    const warn = (r.why || []).filter(w => w.pts < 0).sort((a, b) => a.pts - b.pts)[0];
    const click = `onclick="pickChampion(this.dataset.c)" title="${label} ${escapeHtml(r.champ)}" role="button" tabindex="0" onkeydown="if(event.key==='Enter')pickChampion(this.dataset.c)"`;
    const pts = r.prob !== undefined ? Math.round(r.prob * 100) + '%' : r.score;
    return `<div class="adv-card adv-click ${k === 0 && ours ? 'adv-first' : ''} ${ours ? '' : 'adv-enemy'}" data-c="${escapeHtml(r.champ)}" ${click}>
      ${champIcon(r.champ, 52)}
      <div class="adv-body"><div class="adv-name">${escapeHtml(r.champ)} <span class="adv-pts">${pts}</span></div>
        <ul>${pos.map(w => `<li>${escapeHtml(w.txt)}</li>`).join('')}</ul>${warn ? `<div class="adv-warn">${escapeHtml(warn.txt)}</div>` : ''}</div>
    </div>`;
  }).join('')}</div>`;
}
if (IS_DESK) {
  const _getLiveAdviceBaseT = getLiveAdvice;
  getLiveAdvice = function (ranked) {
    const h = _getLiveAdviceBaseT(ranked);
    let cards = '', head = '';
    try {
      const st = state.activeSlot, ours = st.side === state.ourSide, ctx = buildCtx();
      let list = null;
      if (ours && st.type === 'BAN') { list = recommendBans(ctx); head = 'Bans recomanats · clic per banejar'; }
      else if (ours) { list = recommendChamps(ctx, st.index); head = 'Picks recomanats · clic per triar'; }
      else if (st.type === 'PICK') { list = predictEnemy(ctx); head = 'Pick rival més probable · clic per registrar-lo'; }
      if (list) cards = advCardsHtml(list);
    } catch (e) { console.warn('advCards', e); }
    if (!cards) return h;
    return `<div class="adv-head">${head}</div>${cards}<button class="adv-toggle" onclick="toggleAdvDetail()"><span class="adv-more">Mostra el detall</span><span class="adv-less">Amaga el detall</span></button><div class="adv-detail">${h}</div>`;
  };
}
(function tStyles() {
  if (!IS_DESK) return;
  try {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Marcellus&display=swap'; document.head.appendChild(l);
  } catch (e) {}
  const css = `
  body.desk { background: radial-gradient(1200px 600px at 50% -200px, rgba(10,200,185,0.08), transparent 70%), #010A13; }
  body.desk h1, body.desk #turnLabel, body.desk .champ-name, body.desk .adv-name, body.desk .panel-header span:first-child { font-family: 'Marcellus', 'Segoe UI', serif; letter-spacing: 0.02em; }
  /* Capçalera: una barra fina amb controls agrupats per funció */
  body.desk header { padding: 10px 18px; margin-bottom: 8px; background: linear-gradient(180deg, #0A1428, #071020); border: 1px solid rgba(200,170,110,0.25); }
  body.desk header h1 { font-size: 1.45rem; font-weight: 400; color: var(--gold-light); text-transform: none; }
  body.desk header .controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  body.desk .seg { display: inline-flex; border: 1px solid var(--border-gold); border-radius: 6px; overflow: hidden; }
  body.desk .seg .btn { border: 0; border-radius: 0; background: transparent; padding: 7px 12px; }
  body.desk .seg .btn + .btn { border-left: 1px solid var(--border-gold); }
  body.desk .seg .btn.btn-active-blue { background: rgba(10,200,185,0.16); color: var(--blue); }
  body.desk #btnSideRed.btn-active-blue { background: rgba(232,64,87,0.16); color: #FF8A9B; }
  body.desk .btn-quiet { background: transparent; border: 0; color: var(--text-muted); text-decoration: underline; text-underline-offset: 3px; }
  body.desk .btn-quiet:hover { color: #FF8A9B; }
  /* Pestanyes subratllades */
  body.desk .tabs { gap: 2px; border-bottom: 1px solid rgba(200,170,110,0.25); margin-bottom: 12px; padding: 0 4px; }
  body.desk .tab-btn { background: transparent; border: 0; border-bottom: 2px solid transparent; border-radius: 0; padding: 9px 14px; color: var(--text-muted); font-size: 0.86rem; }
  body.desk .tab-btn:hover { color: var(--gold-light); background: transparent; }
  body.desk .tab-btn.active { color: var(--gold-light); border-bottom-color: var(--gold); background: transparent; box-shadow: none; }
  /* Columnes */
  body.desk .draft-grid { grid-template-columns: 300px minmax(0, 1fr) 300px; gap: 14px; }
  body.desk .panel { background: rgba(10,20,40,0.72); border-color: rgba(200,170,110,0.18); }
  body.desk .panel-header { border-bottom: 0; margin-bottom: 6px; }
  body.desk .side-lbl { font-size: 0.72rem; color: var(--text-muted); margin: 8px 0 5px; }
  /* Picks: com a la selecció de campions, amb l'art de la pantalla de càrrega */
  body.desk .pick-slot { position: relative; overflow: hidden; min-height: 78px; padding: 10px 12px; margin-bottom: 8px; border-radius: 6px; background: rgba(5,12,24,0.8); border: 1px solid rgba(255,255,255,0.08); }
  body.desk .pick-slot:not(.filled-blue):not(.filled-red) { border-style: dashed; border-color: rgba(200,170,110,0.22); }
  body.desk .pick-slot:not(.filled-blue):not(.filled-red) .champ-name { color: var(--text-muted); font-family: inherit; font-size: 0.82rem; font-weight: 500; }
  body.desk .pick-slot .pk-art { position: absolute; inset: 0; background-size: 125% auto; background-position: 50% 18%; opacity: 0.9; }
  body.desk .pick-slot.filled-red .pk-art { transform: scaleX(-1); }
  body.desk .pick-slot .pk-art::after { content: ''; position: absolute; inset: 0; transform: none; }
  body.desk .pick-slot.filled-blue .pk-art::after { background: linear-gradient(90deg, rgba(1,10,19,0.92) 0%, rgba(1,10,19,0.55) 45%, rgba(1,10,19,0.15) 100%); }
  body.desk .pick-slot.filled-red .pk-art::after { background: linear-gradient(90deg, rgba(1,10,19,0.15) 0%, rgba(1,10,19,0.55) 55%, rgba(1,10,19,0.92) 100%); }
  body.desk .pick-slot > div:first-of-type { position: static; }
  body.desk .pick-slot > div:first-of-type > *:not(.pk-art), body.desk .pick-slot > .btn { position: relative; z-index: 1; }
  body.desk .pick-slot .ci-pick { display: none; }
  body.desk .pick-slot.filled-blue, body.desk .pick-slot.filled-red { min-height: 96px; border: 1px solid rgba(255,255,255,0.12); }
  body.desk .pick-slot.filled-blue { border-left: 3px solid var(--blue); }
  body.desk .pick-slot.filled-red { border-right: 3px solid var(--red); }
  body.desk .pick-slot.filled-red { flex-direction: row-reverse; }
  body.desk .pick-slot.filled-red > div:first-of-type { flex-direction: row-reverse; text-align: right; }
  body.desk .pick-slot .champ-name { font-size: 1.12rem; text-shadow: 0 1px 3px #000; }
  body.desk .pick-slot .player-sub { color: var(--gold-light); opacity: 0.85; text-shadow: 0 1px 3px #000; }
  body.desk .pick-slot.active-turn { border: 1px solid var(--gold) !important; box-shadow: 0 0 0 1px rgba(200,170,110,0.35), 0 0 18px rgba(200,170,110,0.18) inset; }
  body.desk .pick-slot .role-tag { background: rgba(1,10,19,0.7); }
  /* Bans: quadrats grans */
  body.desk .bans-container { gap: 6px; }
  body.desk .ban-slot { min-height: 50px; }
  body.desk .ban-slot .ci-ban { width: 34px !important; height: 34px !important; }
  /* Torn i recomanació */
  body.desk .turn-banner { background: transparent; border: 0; border-bottom: 1px solid rgba(200,170,110,0.2); border-radius: 0; padding: 4px 0 12px; }
  body.desk #turnLabel { font-size: 1.35rem !important; font-weight: 400 !important; color: var(--gold-light); }
  body.desk #matchBtn { min-height: 40px; margin: 10px 0; background: transparent; color: var(--gold); border: 1px solid var(--gold); }
  body.desk #matchBtn:hover { background: rgba(200,170,110,0.12); }
  body.desk #liveAdviceBox { background: transparent !important; border: 0 !important; padding: 0 !important; }
  body.desk #liveAdviceBox > strong { display: none; }
  body.desk .adv-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 2px 0 6px; }
  body.desk .adv-card { display: flex; gap: 10px; padding: 10px; border-radius: 6px; background: rgba(5,12,24,0.75); border: 1px solid rgba(200,170,110,0.22); min-width: 0; }
  body.desk .adv-head { font-size: 0.74rem; color: var(--text-muted); margin: 4px 0 6px; }
  body.desk .adv-enemy { border-color: rgba(232,64,87,0.35); }
  body.desk .adv-card.adv-first { border-color: var(--gold); background: linear-gradient(180deg, rgba(200,170,110,0.10), rgba(5,12,24,0.75)); }
  body.desk .adv-click { cursor: pointer; }
  body.desk .adv-click:hover { border-color: var(--gold-light); }
  body.desk .adv-click:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
  body.desk .adv-body { min-width: 0; }
  body.desk .adv-name { font-size: 1.05rem; color: var(--gold-light); }
  body.desk .adv-pts { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 0.72rem; color: var(--gold); margin-left: 4px; }
  body.desk .adv-body ul { margin: 4px 0 0 16px; padding: 0; font-size: 0.74rem; color: var(--text-main); line-height: 1.3; }
  body.desk .adv-warn { font-size: 0.72rem; color: #FF8A9B; margin-top: 3px; line-height: 1.3; }
  body.desk .adv-toggle { background: none; border: 0; color: var(--blue); font-size: 0.76rem; cursor: pointer; padding: 2px 0 8px; }
  body.desk .adv-toggle .adv-less, body.desk #liveAdviceBox.adv-open .adv-toggle .adv-more { display: none; }
  body.desk #liveAdviceBox.adv-open .adv-toggle .adv-less { display: inline; }
  body.desk .adv-detail { display: none; font-size: 0.8rem; line-height: 1.45; padding: 10px 12px; border-left: 2px solid rgba(10,200,185,0.4); background: rgba(10,200,185,0.05); margin-bottom: 10px; }
  body.desk #liveAdviceBox.adv-open .adv-detail { display: block; }
  /* Cercador, filtres en una sola línia i graella més alta */
  body.desk .filter-pills { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: thin; padding-bottom: 4px; }
  body.desk .filter-pills .pill { flex: 0 0 auto; }
  body.desk .tag-pills .pill { padding: 3px 9px; }
  body.desk .champ-grid { max-height: min(46vh, 460px) !important; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)) !important; }
  body.desk .riot-legal { max-width: 900px; }
  body.desk .scouting-input-row { display: flex; gap: 6px; }
  body.desk .scouting-input-row input { flex: 1 1 auto; min-width: 0; width: auto; }
  body.desk .scouting-input-row .btn { flex: 0 0 auto; }
  `;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();
