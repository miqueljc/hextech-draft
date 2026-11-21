// ===== Pantalla: counters-i-tipus-comp (separat del motor) =====
function saveExt() {
  const { out, bad } = parseCounters(document.getElementById('extText').value);
  lsSet(LS.ext, out); afterDataChange();
  setMsg('extMsg', bad.length ? `Desat. Ignorat: ${bad.join(' · ')}` : `Desat: ${Object.keys(out).length} campions amb counters.`);
}
(function initCounterTip() {
  let tip = null;
  const get = () => tip || (tip = document.getElementById('counterTip'));
  document.addEventListener('mouseover', ev => {
    const t = ev.target.closest && ev.target.closest('[data-ctr]'); const el = get();
    if (!t || !el) return;
    try { el.innerHTML = counterTipHtml(t.dataset.ctr); el.style.display = 'block'; } catch (e) { el.style.display = 'none'; }
  });
  document.addEventListener('mousemove', ev => {
    const el = get(); if (!el || el.style.display !== 'block') return;
    const w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.min(ev.clientX + 14, window.innerWidth - w - 8) + 'px';
    el.style.top = Math.min(ev.clientY + 14, window.innerHeight - h - 8) + 'px';
  });
  document.addEventListener('mouseout', ev => {
    const t = ev.target.closest && ev.target.closest('[data-ctr]'); const el = get();
    if (t && el && !(ev.relatedTarget && t.contains(ev.relatedTarget))) el.style.display = 'none';
  });
})();
function renderCompBox() {
  const el = document.getElementById('compBox'); if (!el) return;
  const A = teamProfile(getOurPicks().filter(Boolean)), B = teamProfile(getEnemyPicks().filter(Boolean));
  const et = classifyComp(B), at = classifyComp(A);
  let html = '', recsAll = null;
  if (et.length) {
    const t = et[0];
    recsAll = recsAll || recommendChamps(buildCtx());
    const counters = recsAll.filter(r => r.score > 0 && !r.why.some(w => w.txt.startsWith('rol ja cobert')) && r.why.some(w => w.style === 'vs')).slice(0, 4).map(r => r.champ);
    html += `<div class="compbox enemy">${t.icon} <strong>Comp rival: ${t.name}${t.sure ? '' : ' (tendència, ' + B.n + ' picks)'}</strong>${et[1] ? ` <small>· també ${et[1].name}</small>` : ''}<br><span>${escapeHtml(t.response)}</span>${counters.length ? `<br>✅ Disponibles que la responen: <strong>${counters.map(escapeHtml).join(', ')}</strong>` : ''}</div>`;
    const ours = at[0];
    if (ours && ours.sure && (COMP_BEATS[t.id] || []).includes(ours.id)) html += `<div class="compbox warn2">⚠️ El seu estil (${t.name}) counteja el vostre (${ours.name}). Canvieu el pla: ${escapeHtml(t.response.split('.')[0])}.</div>`;
    itemValueNotes(B).forEach(x => { html += `<div class="compbox item">🧮 ${escapeHtml(x)}</div>`; });
  }
  if (at.length && A.n >= 2) {
    const t = at[0];
    recsAll = recsAll || recommendChamps(buildCtx());
    const fit = recsAll.filter(r => r.score > 0 && !r.why.some(w => w.txt.startsWith('rol ja cobert')) && r.why.some(w => w.style === 'own')).slice(0, 4).map(r => r.champ);
    html += `<div class="compbox ally">${t.icon} <strong>La vostra comp: ${t.name}${t.sure ? '' : ' (tendència)'}</strong>${fit.length ? `<br>🧩 Picks en sintonia disponibles: <strong>${fit.map(escapeHtml).join(', ')}</strong>` : ''}</div>`;
  }
  el.innerHTML = html;
}
function synergyTipHtml(x) {
  const list = synergyCandidates(x, 3);
  const enemy = getEnemyPicks().includes(x);
  const rows = list.length ? list.map(s => `<div class="ct-row"><strong>${escapeHtml(s.champ)}</strong>${s.who.length ? ` <span class="badge-pool">👤 ${escapeHtml(s.who.join('/'))}</span>` : ''}<br><span>${escapeHtml(s.why.join(' · '))}${s.src ? ` <em>(${escapeHtml(s.src)})</em>` : ''}</span></div>`).join('')
    : '<div class="ct-row" style="color:var(--text-muted);">Cap parella clara disponible.</div>';
  return `<div class="ct-head" style="margin-top:6px;">🤝 Sinergies de <strong>${escapeHtml(x)}</strong>${enemy ? ' <small>(les voldran ells: considereu banejar/robar)</small>' : ''}</div>${rows}`;
}
