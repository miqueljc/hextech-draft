// ---------- 2. Finestra de compatibilitats amb icones ----------
function compRoleHtml(comp, r, full) {
  const un = getUnavailableChamps(), ours = getOurPicks().filter(Boolean);
  const list = comp.roles[r] || [], alt = (comp.alt && comp.alt[r]) || [];
  // un pick propi només compta al rol on l'assigneu; als altres rols es mostra la millor opció lliure
  let here = null; try { const a = getAssignment(); here = a.roleChamp[ROLE_ORDER.indexOf(r)]; } catch (e) {}
  const mine = here && list.includes(here) ? here : null;
  const main = mine || list.find(c => !un.has(c)) || list[0];
  const st = c => c === mine ? 'cr-mine' : (un.has(c) || ours.includes(c)) ? 'cr-off' : '';
  const rest = list.filter(c => c !== main);
  const smallN = full ? rest.length : 3;
  const small = rest.slice(0, smallN).map(c => `<span class="cr-alt ${st(c)}" title="${escapeHtml(c)}">${champIcon(c, 0)}</span>`).join('');
  const more = !full && rest.length > 3 ? `<span class="cr-more">+${rest.length - 3}</span>` : '';
  const metaAlt = full && alt.length ? `<div class="cr-meta">${alt.map(c => `<span class="cr-alt cr-out ${st(c)}" title="${escapeHtml(c)} (fora del pool)">${champIcon(c, 0)}</span>`).join('')}</div>` : '';
  return `<div class="cr-col"><div class="cr-role">${r}</div>
    <span class="cr-main ${st(main)}" title="${escapeHtml(main || '')}">${main ? champIcon(main, 0) : ''}</span>
    ${full ? `<div class="cr-name">${escapeHtml(main || '')}</div>` : ''}
    <div class="cr-alts">${small}${more}</div>${metaAlt}</div>`;
}
function renderCompsRanking(ranked) {
  const LIMIT = 8;
  const list = state.showAllComps ? ranked : ranked.slice(0, LIMIT);
  const sel = state.selectedCompId && !list.some(c => c.id === state.selectedCompId) ? ranked.find(c => c.id === state.selectedCompId) : null;
  if (sel) list.push(sel);
  const cards = list.map(comp => {
    const isSel = state.selectedCompId === comp.id;
    const nv = (comp.variants || []).length;
    return `<div class="comp-card ${isSel ? 'selected-comp' : ''}" onclick="toggleSelectComp(${comp.id})">
      <div class="comp-top">
        <strong style="font-size:0.84rem;color:var(--gold-light);">${escapeHtml(comp.name)}${nv > 1 ? ` <span class="cr-var">${nv} variants</span>` : ''}</strong>
        <span class="score-pill">${comp.score}% Match</span>
      </div>
      <div class="cr-grid">${ROLE_ORDER.map(r => compRoleHtml(comp, r, isSel)).join('')}</div>
      ${isSel ? `<div class="cr-legend">Icona gran: opció principal disponible · petites: alternatives del vostre pool (vàlides per a la mateixa comp) · amb vora discontínua: alternatives del meta fora del pool · daurat: ja triat · gris: banejat o agafat.${nv > 1 ? ' Agrupa: ' + comp.variants.map(escapeHtml).join(', ') + '.' : ''}</div>` : ''}
      <div class="comp-meta">${comp.reasons.slice(0, 3).join(' • ') || escapeHtml(comp.style)}</div>
    </div>`;
  }).join('');
  const more = ranked.length > LIMIT
    ? `<div style="text-align:center;margin-top:6px;"><button class="btn" onclick="state.showAllComps=!state.showAllComps;renderAll()">${state.showAllComps ? 'Mostra\'n menys' : `Mostra totes (${ranked.length})`}</button></div>` : '';
  document.getElementById('compsRanking').innerHTML = cards + more;
}

