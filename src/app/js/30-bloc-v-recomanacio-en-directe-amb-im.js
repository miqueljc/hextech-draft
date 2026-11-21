// ===== Bloc V: recomanació en directe amb imatges, classificada per motiu =====
// Substitueix les targetes de text del bloc T; el text complet queda plegat a "Mostra el detall".
const REC_CATS = {
  pick: [
    { id: 'op', label: 'OP a cegues', tip: 'OP del parc al vostre pool i la línia rival encara no s\'ha revelat', test: r => r.flags && r.flags.op, why: w => w.style === 'op' },
    { id: 'ct', label: 'Counters', tip: 'Guanyen la línia contra un pick rival (WR real)', test: r => (r.flags && r.flags.counter) || r.why.some(w => w.style === 'vs' && w.pts > 0), why: w => w.style === 'counter' || (w.style === 'vs' && w.pts > 0) },
    { id: 'syn', label: 'Sinergies', tip: 'Sinergia amb els vostres picks', why: w => w.pts > 0 && /sinergia|combo|parella/i.test(w.txt) },
    { id: 'safe', label: 'Segurs i flex', tip: 'Segurs a cegues o flex: amaguen informació', why: w => w.pts > 0 && /segur a cegues|flex real|flex públic/.test(w.txt), test: r => !r.why.some(w => /counterejable/.test(w.txt)) },
    { id: 'comp', label: 'Encaixen a la comp', tip: 'Encaixen a la comp objectiu o cobreixen el que falta', why: w => w.pts > 0 && /^encaixa a |aporta |equilibra|cobreix un rol/.test(w.txt) },
    { id: 'deny', label: 'Neguen el rival', tip: 'Treuen un pick o una sinergia al rival', why: w => w.pts > 0 && /nega|els treu/.test(w.txt) }
  ],
  ban: [
    { id: 'meta', label: 'Forts al meta', tip: 'Tier alt al rol que encara li falta al rival', why: w => w.pts > 0 && /\(meta\)|buff al/.test(w.txt) },
    { id: 'rival', label: 'Pool del rival', tip: 'Mains o pool de la fitxa del rival', why: w => w.pts > 0 && /pool rival|OTP/.test(w.txt) },
    { id: 'vs', label: 'Contra els vostres picks', tip: 'Counters dels vostres picks o candidats', why: w => w.pts > 0 && /counteja/.test(w.txt) },
    { id: 'syn', label: 'Sinergia rival', tip: 'Encaixarien amb els picks del rival', why: w => w.pts > 0 && /sinergia|frontline que no tenen|els donaria/.test(w.txt) }
  ]
};
let _recMap = new Map(), _recSel = null, _recMode = 'pick';
function recTile(r, size, extra) {
  const v = r.prob !== undefined ? Math.round(r.prob * 100) + '%' : r.score;
  return `<button class="rt ${_recSel === r.champ ? 'rt-sel' : ''} ${extra || ''}" data-c="${escapeHtml(r.champ)}" onclick="recSelect(this.dataset.c)" title="${escapeHtml(r.champ)}">
    ${champIcon(r.champ, size)}${size >= 56 && typeof flagBadges === 'function' ? `<span class="rt-fl">${flagBadges(r)}</span>` : ''}<span class="rt-v">${v}</span>${size >= 56 ? `<span class="rt-n">${escapeHtml(r.champ)}</span>` : ''}</button>`;
}
function recGridHtml() {
  const st = state.activeSlot;
  if (mmComplete()) return '';
  const ours = st.side === state.ourSide, ctx = buildCtx();
  let list, cats, head, act;
  if (ours && st.type === 'PICK') { list = recommendChamps(ctx, st.index); cats = REC_CATS.pick; head = 'Picks recomanats'; act = 'Tria'; }
  else if (ours) { list = recommendBans(ctx); cats = REC_CATS.ban; head = 'Bans recomanats'; act = 'Baneja'; }
  else if (st.type === 'PICK') { list = predictEnemy(ctx); cats = null; head = 'Pick rival més probable'; act = 'Registra'; }
  else return '';
  list = list.filter(r => (r.prob !== undefined || r.score > 0) && !(r.why || []).some(w => /^rol ja cobert/.test(w.txt)));
  if (!list.length) return '';
  _recMode = act; _recMap = new Map(list.map(r => [r.champ, r]));
  if (_recSel && !_recMap.has(_recSel)) _recSel = null;
  const top = list.slice(0, 3);
  let rows = '';
  if (cats) {
    cats.forEach(c => {
      const items = list.filter(r => (!c.test || c.test(r)) && r.why.some(c.why)).slice(0, 7);
      if (!items.length) return;
      rows += `<div class="rr"><div class="rr-l" title="${escapeHtml(c.tip)}">${c.label}</div><div class="rr-i">${items.map(r => recTile(r, 44)).join('')}</div></div>`;
    });
  } else rows = `<div class="rr"><div class="rr-l">Altres probables</div><div class="rr-i">${list.slice(3, 9).map(r => recTile(r, 44)).join('')}</div></div>`;
  return `<div class="rg">
    <div class="rg-h">${head} <span>· toca una imatge per veure el motiu</span></div>
    <div class="rg-top">${top.map((r, k) => recTile(r, 64, k === 0 ? 'rt-first' : '')).join('')}</div>
    ${rows}
    <div id="recInfo" class="rg-info">${_recSel ? recInfoHtml(_recSel) : ''}</div>
  </div>`;
}
function recInfoHtml(c) {
  const r = _recMap.get(c); if (!r) return '';
  const pos = (r.why || []).filter(w => w.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, 4);
  const neg = (r.why || []).filter(w => w.pts < 0).sort((a, b) => a.pts - b.pts).slice(0, 2);
  const who = (() => { try { if (_recMode !== 'Tria') return ''; const st = state.activeSlot, arr = getOurPicks().slice(); arr[st.index] = c; const a = autoAssign(arr.filter(Boolean)), i = a.roleChamp.indexOf(c); return i >= 0 ? ` → ${escapeHtml(shortName(a.rolePlayer[i]))} · ${ROLE_ORDER[i]}` : ''; } catch (e) { return ''; } })();
  return `<div class="ri-h">${champIcon(c, 28)}<strong>${escapeHtml(c)}</strong><span class="ri-who">${who}</span>
      <button class="btn btn-primary ri-go" data-c="${escapeHtml(c)}" onclick="recPick(this.dataset.c)">${_recMode} ${escapeHtml(c)}</button></div>
    <ul>${pos.map(w => `<li>${escapeHtml(w.txt)}</li>`).join('')}${neg.map(w => `<li class="ri-neg">${escapeHtml(w.txt)}</li>`).join('')}</ul>`;
}
function recSelect(c) {
  _recSel = _recSel === c ? null : c;
  document.querySelectorAll('.rg .rt').forEach(b => b.classList.toggle('rt-sel', b.dataset.c === _recSel));
  const el = document.getElementById('recInfo'); if (el) el.innerHTML = _recSel ? recInfoHtml(_recSel) : '';
}
function recPick(c) { _recSel = null; pickChampion(c); }
let _recDetailOpen = false;
function toggleRecDetail() { _recDetailOpen = !_recDetailOpen; const b = document.getElementById('liveAdviceBox'); if (b) b.classList.toggle('rec-open', _recDetailOpen); }
const _getLiveAdviceBaseV = getLiveAdvice;
getLiveAdvice = function (ranked) {
  const h = _getLiveAdviceBaseV(ranked);
  let g = '';
  try { g = recGridHtml(); } catch (e) { console.warn('recGrid', e); }
  try { const b = document.getElementById('liveAdviceBox'); if (b) b.classList.toggle('rec-open', _recDetailOpen || !g); } catch (e) {}
  if (!g) return h;
  return `${g}<button class="rec-toggle" onclick="toggleRecDetail()"><span class="rm">Mostra el detall en text</span><span class="rl">Amaga el detall</span></button><div class="rec-detail">${h}</div>`;
};
(function vStyles() {
  const css = `
  #liveAdviceBox > strong { display: none; }
  .rg { margin: 2px 0 4px; }
  .rg-h { font-size: 0.78rem; color: var(--gold-light); font-weight: 700; margin-bottom: 6px; }
  .rg-h span { color: var(--text-muted); font-weight: 400; }
  .rg-top { display: flex; gap: 10px; margin-bottom: 8px; }
  .rr { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-top: 1px solid rgba(255,255,255,0.06); }
  .rr-l { flex: 0 0 104px; font-size: 0.72rem; color: var(--text-muted); line-height: 1.2; }
  .rr-i { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
  .rt { position: relative; display: inline-flex; flex-direction: column; align-items: center; gap: 2px; padding: 0; background: none; border: 0; cursor: pointer; color: var(--text-main); font-family: inherit; }
  .rt .ci { border-width: 2px; }
  .rt:hover .ci { border-color: var(--gold-light); }
  .rt:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; border-radius: 6px; }
  .rt.rt-sel .ci { border-color: var(--blue); box-shadow: 0 0 0 2px rgba(10,200,185,0.45); }
  .rt.rt-first .ci { border-color: var(--gold); }
  .rt-v { font-size: 0.62rem; color: var(--gold); line-height: 1; }
  .rt-n { font-size: 0.7rem; max-width: 72px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rt-fl { position: absolute; top: -4px; right: -6px; display: flex; flex-direction: column; gap: 1px; align-items: flex-end; }
  .rt-fl .fl-op, .rt-fl .fl-ct { margin: 0; font-size: 0.52rem; padding: 0 3px; }
  .rg-info { margin-top: 6px; }
  .rg-info:empty { display: none; }
  .rg-info { padding: 8px 10px; border-radius: 6px; background: rgba(10,200,185,0.06); border: 1px solid rgba(10,200,185,0.3); font-size: 0.76rem; }
  .ri-h { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ri-who { color: var(--text-muted); font-size: 0.72rem; }
  .ri-go { margin-left: auto; min-height: 34px; }
  .rg-info ul { margin: 6px 0 0 18px; padding: 0; line-height: 1.35; }
  .rg-info .ri-neg { color: #FF8A9B; }
  .rec-toggle { background: none; border: 0; color: var(--blue); font-size: 0.76rem; cursor: pointer; padding: 6px 0 4px; font-family: inherit; }
  .rec-toggle .rl, #liveAdviceBox.rec-open .rec-toggle .rm { display: none; }
  #liveAdviceBox.rec-open .rec-toggle .rl { display: inline; }
  .rec-detail { display: none; font-size: 0.8rem; line-height: 1.45; padding: 8px 10px; border-left: 2px solid rgba(10,200,185,0.4); }
  #liveAdviceBox.rec-open .rec-detail { display: block; }
  @media (max-width: 600px) { .rr-l { flex-basis: 70px; font-size: 0.66rem; } .rg-top { justify-content: space-between; } .rr-i { flex-wrap: nowrap; gap: 5px; } .rr-i .rt:nth-child(n+6) { display: none; } .rr-i .rt .ci { width: 42px !important; height: 42px !important; } }
  `;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();

