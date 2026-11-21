// ================= APP MÒBIL: NAVEGACIÓ, EL MEU JOC I COMPARTIR =================
const MAIN_TABS = ['draft', 'analysis', 'me'];
function closeSheets() {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
  const o = document.getElementById('overlay'); if (o) o.classList.remove('open');
}
function toggleSheet(id) {
  const s = document.getElementById(id), was = s.classList.contains('open');
  closeSheets();
  if (!was) { s.classList.add('open'); document.getElementById('overlay').classList.add('open'); }
}
function switchTab(tabId) {
  closeSheets();
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const t = document.getElementById('tab-' + tabId);
  if (t) t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId || (b.dataset.tab === 'more' && !MAIN_TABS.includes(tabId))));
  window.scrollTo(0, 0);
  if (tabId === 'analysis') generateStrategy();
  if (tabId === 'me') renderMyGame();
}
function openDataTab() { switchTab('data'); }

// Targetes col·lapsables (informe tàctic)
function makeCollapsible(container, openFirst = 3) {
  const cards = [...container.querySelectorAll(':scope > .strat-card')];
  cards.forEach((card, i) => {
    const h = card.querySelector('h4');
    if (!h) return;
    if (i >= openFirst) card.classList.add('collapsed');
    h.onclick = () => card.classList.toggle('collapsed');
  });
}

// ---- Resum per jugador ----
function roleBullets(l, s) {
  const c = l.champ, role = l.role, B = s.B, out = [];
  if (!c) return ['Encara no tens campió assignat: completa l\'assignació al Draft.'];
  const t = x => hasTag(c, x);
  const allies = s.lanes.filter(x => x.champ && x.role !== role);
  const carry = allies.find(x => hasTag(x.champ, 'scale') && (x.role === 'Bot' || x.role === 'Mid')) || allies.find(x => x.role === 'Bot');
  const squishy = B.list.filter(e => hasTag(e, 'rng') && !hasTag(e, 'front'));
  const engagers = B.list.filter(e => hasTag(e, 'eng'));
  const assassins = B.list.filter(e => hasTag(e, 'assn') || hasTag(e, 'dive'));
  const base = {
    Top: 'Línia aïllada: gestiona l\'onada i el TP; decideix cada pocs minuts entre push, split o TP a l\'objectiu.',
    Jg: 'Tu marques el ritme: prioritza la línia amb avantatge i vigila el jungla rival.',
    Mid: 'La prioritat de línia són les rotacions: empeny, mira el mapa i arriba abans als objectius.',
    Bot: 'Farm net i posicionament: al late ets qui més dany fa; evita morts innecessàries.',
    Sup: 'Visió i protecció: ward els objectius 45 s abans i vigila qui et pot flanquejar.'
  };
  out.push(base[role]);
  if (t('eng')) out.push(`Ets l'engage: inicia només amb visió i quan els aliats puguin seguir${squishy.length ? '; objectiu: ' + squishy.join(', ') : ''}.`);
  if (t('peel') && carry) out.push(`Guarda el CC/escut per protegir ${carry.champ}${assassins.length ? ' contra ' + assassins.join(', ') : ''}.`);
  if (t('assn') || t('dive')) out.push(`Entra pel flanc quan el seu CC estigui gastat; ${squishy.length ? 'busca ' + squishy.join(', ') : 'busca el seu backline'}.`);
  if (t('poke')) out.push(`Desgasta amb poke abans de cada objectiu${engagers.length ? ' i no et deixis iniciar per ' + engagers.join(', ') : ''}.`);
  if (t('rng') && !t('front') && !t('poke')) out.push(`Posiciona't darrere de la frontline i guarda el Flash.${assassins.length ? ' Compte amb ' + assassins.join(', ') + '.' : ''}`);
  if (t('front') && !t('eng')) out.push('Ets la frontline: absorbeix dany i protegeix els carries.');
  if (t('split')) out.push('Pots fer splitpush: crea pressió lateral quan l\'equip tingui l\'objectiu segur.');
  if (t('scale')) out.push('Pic de poder amb 2-3 objectes: fins llavors prioritza farm i supervivència.');
  if (t('early')) out.push('Pic de poder al nivell 2-3 i 6: aprofita-ho per prémer abans que ells escalin.');
  return out.slice(0, 6);
}
function myGameData(s, r) {
  const l = s.lanes[r], b = l.build, pIdx = ROSTER.indexOf(l.player);
  const slump = playerSlump(pIdx), hot = playerHot(pIdx);
  return {
    v: 1, name: shortName(pIdx), role: l.role, champ: l.champ || null, comp: s.comp.name, style: s.comp.style,
    enemy: l.enemyText, verdict: l.verdict, tip: l.plan ? l.tip.replace(l.plan, '').trim() : l.tip, lanePlan: l.plan || '', notes: l.notes, flags: l.flags,
    stat: l.champ ? statText(pIdx, l.champ) : '', form: slump ? `mala ratxa (${ROSTER[pIdx].recent}% últimes 20)` : hot ? `en ratxa (${ROSTER[pIdx].recent}% últimes 20)` : '',
    plan: s.comp.plan.individual[l.role] || '', bullets: roleBullets(l, s),
    phases: s.phasePlan.phases, win: s.phasePlan.winConds, lose: s.phasePlan.loseConds,
    threats: s.threats.map(t => ({ champ: t.champ, txt: t.txt })), tf: s.tf.slice(0, 3),
    lanesSummary: s.laneSummary,
    team: s.lanes.map(x => ({ role: x.role, champ: x.champ, player: shortName(ROSTER.indexOf(x.player)) })),
    build: b ? { label: b.label, keystone: b.keystone, keyWhy: b.keyWhy, primary: b.primary, secondary: b.secondary, shards: b.shards, summoners: b.summoners, start: b.start, boots: b.boots, core: b.core, situ: b.situ, notes: b.notes, order: b.order || null, firstBack: b.firstBack || '', laneInfo: b.laneInfo || '' } : null
  };
}
const V_UI = { good: ['✅', 'Avantatge', 'var(--green)'], bad: ['❌', 'Desavantatge', '#FF8A9B'], even: ['➖', 'Igualat', 'var(--text-muted)'], unknown: ['⏳', 'Pendent', 'var(--text-muted)'] };
function myGameHtml(d) {
  const v = V_UI[d.verdict] || V_UI.unknown, b = d.build, E = escapeHtml;
  const sec = (title, body, open = true) => `<details class="mg" ${open ? 'open' : ''}><summary>${title}</summary><div class="mg-body">${body}</div></details>`;
  const ul = a => `<ul>${a.map(x => `<li>${E(x)}</li>`).join('')}</ul>`;
  const head = `<div class="mg-head">
      <div><span class="role-tag">${d.role.toUpperCase()}</span> <strong style="font-size:1.1rem;">${E(d.champ || '—')}</strong></div>
      <div style="color:var(--text-muted);font-size:0.78rem;">${E(d.name)}${d.stat ? ' · historial amb el campió: ' + E(d.stat) : ''}${d.form ? ' · <span style="color:' + (d.form.startsWith('mala') ? '#FF8A9B' : 'var(--green)') + ';">' + E(d.form) + '</span>' : ''}</div>
      <div style="margin-top:6px;">vs <strong>${E(d.enemy)}</strong> <span style="color:${v[2]};">${v[0]} ${v[1]}</span></div>
      <div style="color:var(--text-muted);font-size:0.74rem;margin-top:4px;">Comp: ${E(d.comp)}</div></div>`;
  const play = sec('🎯 Com jugar la partida', `<p>${E(d.tip)}</p>${d.plan ? `<p style="margin-top:6px;">${E(d.plan)}</p>` : ''}${ul(d.bullets)}${d.notes.length ? `<p style="color:var(--text-muted);font-size:0.76rem;margin-top:4px;">${E(d.notes.join(' · '))}</p>` : ''}${d.flags.length ? `<p style="color:var(--orange);font-size:0.76rem;">⚠️ ${E(d.flags.join(' · '))}</p>` : ''}${d.lanesSummary.length ? ul(d.lanesSummary) : ''}`);
  const lp = d.lanePlan ? sec('📐 Pla de línia', `<p>${E(d.lanePlan)}</p>`) : '';
  const runes = b ? sec('📜 Runes', `<p><strong style="color:var(--gold);">${E(b.keystone)}</strong> — ${E(b.keyWhy)}</p><p style="margin-top:4px;"><strong>Principal:</strong> ${E(b.primary)}</p><p><strong>Secundari:</strong> ${E(b.secondary)}</p><p><strong>Shards:</strong> ${E(b.shards)}</p><p><strong>Hechizos:</strong> ${E(b.summoners)}</p>`) : '';
  const items = b ? sec('🛡️ Objectes', `<p><strong>Inici:</strong> ${E(b.start)}</p><p><strong>Botes:</strong> ${E(b.boots)}</p>${b.order ? `<p><strong>Ordre de compra:</strong></p><ol style="margin:2px 0 6px 18px;">${b.order.map(o => `<li><strong>${E(o.item)}</strong> <span style="color:var(--text-muted);">— ${E(o.why)}</span></li>`).join('')}</ol>` : `<p><strong>Core:</strong> ${b.core.map(E).join(' → ')}</p>`}${!b.order && b.situ.length ? `<p style="margin-top:4px;"><strong>Segons el rival:</strong></p>${ul(b.situ.map(z => `${z.item}: ${z.why}`))}` : ''}${b.notes.length ? `<p style="color:var(--text-muted);font-size:0.76rem;margin-top:4px;">${E(b.notes.join(' · '))}</p>` : ''}<p style="color:var(--text-muted);font-size:0.72rem;margin-top:4px;">Plantilla: ${E(b.label)} (heurística per arquetip; confirma amb u.gg/op.gg).</p>`) : sec('📜 Runes i objectes', '<p>Assigna un campió a aquest rol per veure runes i build.</p>');
  const phases = sec('🗺️ Fases de la partida', `<div>${d.phases.map(f => `<div class="ph"><span class="ph-t">${E(f.time)}</span><div><strong>${E(f.title)}</strong><br>${E(f.text)}</div></div>`).join('')}</div>`, false);
  const win = sec('🏆 Com guanyem i com ens poden guanyar', `<strong style="color:var(--green);">Guanyem si…</strong>${ul(d.win)}<strong style="color:#FF8A9B;">Ens guanyen si…</strong>${ul(d.lose)}`, false);
  const thr = d.threats.length || d.tf.length ? sec('🚨 Amenaces i teamfights', `${d.threats.length ? ul(d.threats.map(t => `${t.champ}: ${t.txt}`)) : ''}${d.tf.length ? ul(d.tf) : ''}`, false) : '';
  const team = sec('👥 Equip', `<div>${d.team.map(x => `<div style="font-size:0.8rem;"><span class="role-tag">${x.role.toUpperCase()}</span> ${E(x.champ || '—')} <span style="color:var(--text-muted);">· ${E(x.player)}</span></div>`).join('')}</div>`, false);
  return head + play + lp + runes + items + phases + win + thr + team;
}
function playerSummaryText(d) {
  const b = d.build;
  let t = `🎮 *${d.name} — ${d.role}: ${d.champ || '—'}* vs ${d.enemy} (${(V_UI[d.verdict] || V_UI.unknown)[1]})\n`;
  t += `Comp: ${d.comp}\n\n🎯 COM JUGAR\n• ${d.tip}\n${d.plan ? '• ' + d.plan + '\n' : ''}${d.bullets.map(x => '• ' + x).join('\n')}\n${d.lanePlan ? '• ' + d.lanePlan + '\n' : ''}`;
  if (b) {
    t += `\n📜 RUNES\n• ${b.keystone} (${b.keyWhy})\n• Principal: ${b.primary}\n• Secundari: ${b.secondary}\n• Shards: ${b.shards}\n• Hechizos: ${b.summoners}\n`;
    t += `\n🛡️ OBJECTES\n• Inici: ${b.start}\n• Botes: ${b.boots}\n• ${b.order ? 'Ordre: ' + b.order.map((o, i) => `${i + 1}. ${o.item} (${o.why})`).join(' → ') : 'Core: ' + b.core.join(' → ') + '\n' + b.situ.map(z => `• ${z.item}: ${z.why}`).join('\n')}\n${b.laneInfo ? '• ' + b.laneInfo + '\n' : ''}${b.firstBack ? '• ' + b.firstBack + '\n' : ''}`;
  }
  t += `\n🗺️ FASES\n${d.phases.map(f => `• ${f.time} ${f.title}: ${f.text}`).join('\n')}\n`;
  t += `\n🏆 Guanyem si: ${d.win.join(' | ')}\n⚠️ Ens guanyen si: ${d.lose.join(' | ')}\n`;
  return t;
}
function encodeShare(d) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); } catch (e) { return ''; }
}
function decodeShare(p) {
  try {
    const b = p.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4)))));
  } catch (e) { return null; }
}
function shareLinkFor(d) {
  if (!/^https?:$/.test(location.protocol)) return '';
  return location.origin + location.pathname + '#j=' + encodeShare(d);
}
function mobileToast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(mobileToast._t); mobileToast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
async function shareText(title, text, url) {
  try {
    if (navigator.share) { await navigator.share(url ? { title, text, url } : { title, text }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url ? text + '\n' + url : text); mobileToast('Copiat al porta-retalls'); }
  catch (e) { mobileToast('No s\'ha pogut copiar'); }
}
state.meRole = 0;
function selectMe(r) { state.meRole = r; renderMyGame(); }
function renderMyGame() {
  const chips = document.getElementById('meChips'), box = document.getElementById('meContent');
  const s = buildStrategy();
  state.meStrategy = s;
  const placed = s.lanes.filter(l => l.champ).length;
  chips.innerHTML = s.lanes.map((l, r) => `<button class="mchip ${r === state.meRole ? 'active' : ''}" onclick="selectMe(${r})"><span class="mchip-r">${l.role.toUpperCase()}</span>${escapeHtml(shortName(ROSTER.indexOf(l.player)))}<br><small>${escapeHtml(l.champ || '—')}</small></button>`).join('');
  if (!placed) { box.innerHTML = '<div class="empty">Encara no hi ha cap pick assignat. Fes el draft a la pestanya <strong>Draft</strong> i torna aquí: cada jugador veurà el seu resum amb pla de joc, runes i objectes.</div>'; return; }
  const d = myGameData(s, state.meRole);
  const complete = s.complete ? '' : `<div class="warn">Draft incomplet (${s.A.n}/5 aliats, ${s.B.n}/5 rivals): el resum s'actualitzarà amb cada pick.</div>`;
  box.innerHTML = complete + myGameHtml(d) + `<div class="actions">
      <button class="btn btn-primary" onclick="shareMine()">📤 Comparteix aquest resum</button>
      <button class="btn" onclick="shareAll()">👥 Resum de tots (text)</button>
    </div>`;
}
function shareMine() {
  const d = myGameData(state.meStrategy || buildStrategy(), state.meRole);
  shareText(`Resum ${d.name} — ${d.champ || ''}`, playerSummaryText(d), shareLinkFor(d));
}
function shareAll() {
  const s = state.meStrategy || buildStrategy();
  const all = s.lanes.map((l, r) => playerSummaryText(myGameData(s, r))).join('\n──────────\n');
  shareText('Resum de la partida', all, '');
}
// Vista de només lectura quan s'obre un enllaç #j=...
function showSharedView(d) {
  document.body.classList.add('shared');
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-me').classList.add('active');
  document.getElementById('meChips').innerHTML = `<div class="shared-banner">📲 Resum compartit per a <strong>${escapeHtml(d.name)}</strong></div>`;
  document.getElementById('meContent').innerHTML = myGameHtml(d) + `<div class="actions"><button class="btn" onclick="shareText('Resum ${escapeHtml(d.name)}', decodeURIComponent('${encodeURIComponent(playerSummaryText(d))}'), '')">📤 Comparteix en text</button><button class="btn" onclick="location.hash='';location.reload()">Obre l'app completa</button></div>`;
}

// ---- Counters i sinergies al mòbil: pulsació llarga sobre un campió ----
function showTipSheet(champ) {
  try { document.getElementById('tipBody').innerHTML = counterTipHtml(champ); } catch (e) { return; }
  const s = document.getElementById('sheetTip');
  closeSheets(); s.classList.add('open'); document.getElementById('overlay').classList.add('open');
}
(function initLongPress() {
  let timer = null, fired = false;
  document.addEventListener('touchstart', e => {
    const t = e.target.closest && e.target.closest('[data-ctr]'); if (!t) return;
    fired = false; clearTimeout(timer);
    timer = setTimeout(() => { fired = true; if (navigator.vibrate) { try { navigator.vibrate(15); } catch (_) {} } showTipSheet(t.dataset.ctr); }, 450);
  }, { passive: true });
  ['touchend', 'touchmove', 'touchcancel'].forEach(ev => document.addEventListener(ev, () => clearTimeout(timer), { passive: true }));
  document.addEventListener('click', e => { if (fired) { e.stopPropagation(); e.preventDefault(); fired = false; } }, true);
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('[data-ctr]')) e.preventDefault(); });
})();
