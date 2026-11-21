// ===== Pantalla: analisi-de-matchup (separat del motor) =====
function generateStrategy() {
  const s = buildStrategy();
  const { comp, A, B } = s;
  const enemyNames = B.list.length ? B.list.join(', ') : 'rival pendent';
  document.getElementById('stratTitle').textContent = `Pla de Partida: ${comp.name} (${state.ourSide} SIDE) vs ${enemyNames}`;

  const warn = [];
  if (!s.complete) warn.push(`Draft incomplet (${A.n}/5 aliats, ${B.n}/5 rivals): l'anàlisi es refinarà amb cada pick.`);
  if (s.unassigned.length) warn.push(`Picks sense assignar a cap rol: ${s.unassigned.join(', ')}.`);
  warn.push(s.manual ? 'Anàlisi feta amb la vostra assignació manual de rols.' : 'Anàlisi feta amb l\'assignació automàtica de rols (podeu ajustar-la a la secció d\'assignació).');
  if (s.ambiguous) warn.push(`Rols rivals incerts: s'han ponderat ${s.enemyCount} repartiments plausibles. Fixeu els rols reals si els sabeu.`);
  const warnHtml = `<ul style="margin-bottom:6px;color:var(--orange);">${warn.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>`;

  const metricRows = s.metrics.map(m => {
    const v = VERDICT_UI[m.verdict];
    return `<tr><td>${m.label}</td><td style="text-align:center;">${m.a}</td><td style="text-align:center;">${m.b}</td><td style="color:${v.color};">${v.icon} ${m.verdict === 'good' ? 'Nostre' : m.verdict === 'bad' ? 'Rival' : 'Igualat'}</td></tr>`;
  }).join('');
  const dmgRow = `<tr><td>Dany AP / AD</td><td style="text-align:center;">${A.ap} / ${A.ad}</td><td style="text-align:center;">${B.ap} / ${B.ad}</td><td style="color:var(--text-muted);">informatiu</td></tr>`;

  const laneRows = s.lanes.map(l => {
    const v = VERDICT_UI[l.verdict];
    return `<tr>
      <td><span class="role-tag">${l.role.toUpperCase()}</span></td>
      <td><strong>${escapeHtml(l.champ || '—')}</strong><br><span style="color:var(--text-muted);font-size:0.72rem;">${escapeHtml(l.player.name.split('#')[0])}</span></td>
      <td><strong>${escapeHtml(l.enemyText)}</strong></td>
      <td style="color:${v.color};white-space:nowrap;">${v.icon} ${v.label}</td>
      <td style="font-size:0.76rem;">${l.notes.length ? escapeHtml(l.notes.join(' · ')) : '—'}${l.flags.length ? `<br><span style="color:var(--orange);">⚠️ ${escapeHtml(l.flags.join(' · '))}</span>` : ''}</td>
    </tr>`;
  }).join('');

  const threatHtml = s.threats.length
    ? '<ul>' + s.threats.map(t => `<li><strong>${escapeHtml(t.champ)}</strong>: ${t.txt}.</li>`).join('') + '</ul>'
    : '<p>Encara no hi ha amenaces identificades.</p>';

  const indivHtml = '<ul>' + s.individual.map(x => {
    const l = x.lane;
    return `<li style="margin-bottom:6px;"><strong>${x.role} (${escapeHtml(l.player.name.split('#')[0])} — ${escapeHtml(l.champ || '—')}):</strong> ${escapeHtml(x.text)}</li>`;
  }).join('') + '</ul>';

  const tdStyle = 'style="padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.06);"';
  document.getElementById('strategyContent').innerHTML = `
    <div class="strat-card" style="grid-column: 1 / -1;">
      <h4>🆚 Matchup d'equips: ${state.ourSide === 'BLUE' ? 'Blue (nosaltres) vs Red' : 'Red (nosaltres) vs Blue'}</h4>
      ${warnHtml}
      <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
        <thead><tr style="color:var(--gold);text-align:left;"><th ${tdStyle}>Aspecte</th><th ${tdStyle}>Nosaltres</th><th ${tdStyle}>Rival</th><th ${tdStyle}>Avantatge</th></tr></thead>
        <tbody>${dmgRow}${metricRows}</tbody>
      </table></div>
    </div>
    <div class="strat-card" style="grid-column: 1 / -1;">
      <h4>🛣️ Matchups per línia (segons els rols assignats)</h4>
      <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
        <thead><tr style="color:var(--gold);text-align:left;"><th ${tdStyle}>Rol</th><th ${tdStyle}>Nosaltres</th><th ${tdStyle}>Rival (prob.)</th><th ${tdStyle}>Veredicte</th><th ${tdStyle}>Motius / alertes</th></tr></thead>
        <tbody>${laneRows}</tbody>
      </table></div>
      ${s.laneSummary.length ? `<ul style="margin-top:8px;">${s.laneSummary.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : ''}
    </div>
    ${phasePlanHtml(s.phasePlan)}${/Pla per fases/.test(phasePlanHtml(s.phasePlan)) ? deepPlanHtml(s) : ''}
    <div class="strat-card">
      <h4>⏱️ Timings segons el matchup</h4>
      <p><strong>Early (Min 1-14):</strong> ${escapeHtml(s.early)}</p>
      <p style="color:var(--text-muted);font-size:0.76rem;">Base comp: ${escapeHtml(comp.plan.early)}</p>
      <p style="margin-top:6px;"><strong>Mid (Min 14-25):</strong> ${escapeHtml(s.mid)}</p>
      <p style="color:var(--text-muted);font-size:0.76rem;">Base comp: ${escapeHtml(comp.plan.mid)}</p>
      <p style="margin-top:6px;"><strong>Late (Min 25+):</strong> ${escapeHtml(s.late)}</p>
      <p style="color:var(--text-muted);font-size:0.76rem;">Base comp: ${escapeHtml(comp.plan.late)}</p>
    </div>
    <div class="strat-card">
      <h4>⚔️ Teamfights i condició de victòria</h4>
      <p><strong>Condició de victòria:</strong> ${escapeHtml(s.win.join(' '))}</p>
      <ul style="margin-top:6px;">${s.tf.map(t => `<li style="margin-bottom:4px;">${escapeHtml(t)}</li>`).join('')}</ul>
      <p style="margin-top:6px;"><strong>Regla d'or:</strong> Prepareu la visió dels Dracs i el Baró 45 segons abans que apareguin.</p>
    </div>
    <div class="strat-card">
      <h4>🚨 Amenaces del draft rival</h4>
      ${threatHtml}
    </div>
    <div class="strat-card">
      <h4>🧩 Identitat de la vostra comp</h4>
      <p><strong>${escapeHtml(comp.name)}</strong> — ${escapeHtml(comp.style)}.</p>
      <p style="margin-top:6px;">Forta contra: <em>${escapeHtml(comp.goodAgainst.slice(0, 4).join(', '))}</em>. Sofreix contra: <em>${escapeHtml(comp.badAgainst.slice(0, 4).join(', '))}</em>.</p>
    </div>
    ${renderPatchNotesHtml(s)}
    ${renderBuildsHtml(s)}
    <div class="strat-card" style="grid-column: 1 / -1;">
      <h4>🎯 Instruccions Individuals per Jugador</h4>
      ${indivHtml}
    </div>
  `;

  const sec = document.getElementById('strategySection');
  sec.style.display = 'block';
  showStrategySection(sec);
}
function renderRosterTable() {
  document.getElementById('rosterTableBody').innerHTML = ROSTER.map((p, pi) => `
    <tr>
      <td><strong>${p.name}</strong>${p.custom ? '<br><span class="badge-pool">pool editat</span>' : ''}</td>
      <td><span class="role-tag">${p.role.toUpperCase()}</span>${playerRoles(pi).filter(r => r !== p.role).map(r => `<br><span class="badge-pool">també ${r}</span>`).join('')}</td>
      <td>${p.excelMains.join(', ')}</td>
      <td>${playerCardHtml(pi)}</td>
      <td style="font-size:0.76rem;color:var(--text-muted);">${playerRoles(pi).map(r => `<div><span class="role-tag">${r.toUpperCase()}</span> ${poolOf(pi, r).join(', ') || '—'}</div>`).join('')}</td>
    </tr>
  `).join('');
  renderRoleEditor();
}
function renderRoleEditor() {
  const el = document.getElementById('roleEditor');
  if (!el) return;
  el.innerHTML = ROSTER.map((p, pi) => `
    <div style="border:1px solid var(--border,#2a3a4a);border-radius:8px;padding:8px;margin-bottom:8px;">
      <strong>${escapeHtml(shortName(pi))}</strong> <span style="font-size:0.72rem;color:var(--text-muted);">(rol principal ${p.role})</span>
      ${ROLE_ORDER.map(r => `<div style="display:flex;gap:6px;align-items:center;margin-top:4px;">
        <span class="role-tag" style="min-width:48px;">${r.toUpperCase()}</span>
        <input type="text" class="search-bar" style="margin:0;flex:1;" id="rp_${pi}_${r}" value="${escapeHtml(poolOf(pi, r).join(', '))}" placeholder="${r === p.role ? 'Pool del rol principal' : 'Buit = no juga aquest rol'}">
      </div>`).join('')}
    </div>`).join('');
}
function saveRolePools() {
  const lc = {}; ALL_CHAMPS.forEach(c => { lc[c.toLowerCase()] = c; });
  const data = {}, unknown = [];
  ROSTER.forEach((p, pi) => {
    data[pi] = {};
    ROLE_ORDER.forEach(r => {
      const el = document.getElementById(`rp_${pi}_${r}`);
      const raw = el ? el.value.split(',').map(s => s.trim()).filter(Boolean) : [];
      const list = [];
      raw.forEach(n => { const c = lc[n.toLowerCase()]; if (c) list.push(c); else unknown.push(n); });
      if (list.length || r === p.role) data[pi][r] = list;
    });
  });
  try { localStorage.setItem(ROLEPOOL_LS_KEY, JSON.stringify(data)); } catch (e) {}
  afterRosterChange();
  document.getElementById('roleEditorMsg').textContent = unknown.length ? `Desat. Noms ignorats (no són campions): ${unknown.join(', ')}` : 'Desat. S\'han regenerat les composicions.';
}
function resetRolePools() {
  try { localStorage.removeItem(ROLEPOOL_LS_KEY); } catch (e) {}
  afterRosterChange();
  document.getElementById('roleEditorMsg').textContent = 'Pools restaurats als valors per defecte.';
}
function renderCompsTable() {
  const nGen = COMPS.filter(c => c.gen).length;
  const t = document.getElementById('compsTitle');
  if (t) t.textContent = `📚 Llibre de Composicions: ${COMPS.length - nGen} oficials (Draft.xlsx) + ${nGen} generades automàticament`;
  document.getElementById('compsTableBody').innerHTML = COMPS.map(c => `
    <tr>
      <td><strong>#${c.id}</strong><br><span class="${c.gen ? 'badge-pool' : 'badge-wr'}">${c.gen ? '🤖 auto' : 'Draft.xlsx'}</span></td>
      <td><strong>${c.name}</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">${c.style}</span></td>
      <td style="font-size:0.78rem;">
        ${ROLE_ORDER.map(r => `<strong>${r}:</strong> ${c.roles[r].join('/')}${c.players ? ` <span style="color:var(--text-muted);">(${escapeHtml(shortName(c.players[r]))})</span>` : ''}`).join('<br>')}
      </td>
      <td style="color:var(--green);font-size:0.78rem;">${c.goodAgainst.join(', ')}</td>
      <td style="color:#FF8A9B;font-size:0.78rem;">${c.badAgainst.join(', ')}</td>
      <td style="font-size:0.78rem;">${c.bans.join(', ')}</td>
    </tr>
  `).join('');
}
function renderProTab() {
  renderPlayerSheets();
  const el = document.getElementById('proContent');
  if (!el) return;
  const champs = [...new Set(ROSTER.flatMap(p => p.pool))].filter(c => CHAMP_DATA[c]);
  const rows = champs.map(c => ({
    c, my: ourRolesFor(c), who: ourPlayersFor(c), pub: champRoles(c), tier: bestTier(c),
    weak: blindWeakness(c), reactive: isReactive(c), fs: flexScoreOf(c), ph: phaseOf(c)
  })).sort((a, b) => b.fs - a.fs);
  const table = (ph, limit) => {
    const list = rows.filter(r => r.ph === ph).slice(0, limit);
    return `<table><thead><tr><th>Campió</th><th>Rols nostres (jugador)</th><th>Rols públics</th><th>Tier 26.23</th><th>Nota</th></tr></thead><tbody>${
      list.map(r => `<tr><td><strong>${escapeHtml(r.c)}</strong></td><td style="font-size:0.76rem;">${r.who.map(escapeHtml).join('<br>')}</td><td style="font-size:0.76rem;">${r.pub.join('/')}</td><td>${r.tier || '—'}</td><td style="font-size:0.74rem;color:var(--text-muted);">${r.reactive ? 'pick reactiu (counter)' : r.my.length >= 2 ? 'flex real: oculta el rol' : r.weak ? r.weak + ' counters coneguts' : ''}</td></tr>`).join('') || '<tr><td colspan="5">—</td></tr>'
    }</tbody></table>`;
  };
  const flexReal = rows.filter(r => r.my.length >= 2).length;
  el.innerHTML = `
    <div class="panel-header"><span>🧠 Draft estil professional: flex i informació</span></div>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:10px;">
      En pro play, els primers picks són <strong>flex</strong> (el rival no sap en quin rol aniran, així que no pot respondre'ls bé) i <strong>segurs a cegues</strong>.
      Els picks d'un sol rol, els reactius i els de suport/ADC es guarden pel final, quan el rival ja no pot respondre. Podeu intercanviar rols després del draft.
      Segons <a href="https://www.dodge.gg/lol/news/champions-multiple-roles-2026" target="_blank" rel="noopener" style="color:var(--blue);">dodge.gg</a>, un flex obliga a gastar diversos bans, fa fallar els counter-picks i us deixa triar lane tard.
      Al <a href="https://www.strafe.com/news/read/lol-worlds-2026-most-picked-champions-and-meta-takeaways/" target="_blank" rel="noopener" style="color:var(--blue);">Worlds 2026</a> es va veure que prioritat alta no és igual a victòria
      (Ezreal i Rumble, molt triats, amb pocs triomfs; Nautilus i Olaf rendiren bé): el motor combina flex + força real al parc.
    </p>
    <p style="font-size:0.8rem;margin-bottom:10px;">Tens <strong>${flexReal}</strong> campions amb flex real dins l'equip (algú el pot jugar en 2+ rols). Edita els rols/pools a la pestanya Roster per millorar-ho.</p>
    <div style="font-weight:700;color:var(--gold);margin:8px 0 4px;">1️⃣ Primera fase (picks 1-2): flex i segurs</div>${table(1, 12)}
    <div style="font-weight:700;color:var(--gold);margin:12px 0 4px;">2️⃣ Fase mitjana: respondre i completar</div>${table(2, 12)}
    <div style="font-weight:700;color:var(--gold);margin:12px 0 4px;">3️⃣ Guardar pel final: reactius i d'un sol rol</div>${table(3, 12)}
    <p style="font-size:0.74rem;color:var(--text-muted);margin-top:10px;">Truc del vídeo (Skill-Capped): si intercanvieu rols <em>després</em> dels bans, el ban deixa de coincidir amb el pick i el rival no endevina la lane; a més, un flex que feu passar per un altre rol (ciclant campions d'aquell rol) confon més. Els picks <em>neutrals</em> (Ornn, Shen, Syndra, Ahri, Jinx, Aphelios, Karma, Nami...) s'adapten a qualsevol comp: ideals per al blind. Ordre de solo queue: ADC, jungla, suport, mid i top al final (el top és on més pesen els matchups). Segon vídeo (Coach Rogue): les sinergies individuals pesen més que la comp "ideal": ganks = dany + CC (un jungla sense CC com Lee Sin necessita laners amb CC), jungla↔suport és la parella més important, i els ADC tenen arquetip (Samira només amb engage, Caitlyn amb poke/enchanter, Jinx/Aphelios neutres). Obriu amb un pick neutral o d'impacte i després copieu el rival: contrapickeu rol a rol fins al final. Un pick dolent contra un estil (Darius contra abast) pot funcionar si els vostres aliats cobreixen la debilitat. Comfort és rei: no forceu un jugador a un pick que no domina.<br>Heurística: puntuació = flex real ×9 + flex públic ×4 + tier 26.22 − counters coneguts ×3 − reactiu −8. Els counters coneguts són una llista editable limitada (LANE_COUNTERS).</p>`;
}
function phasePlanHtml(p) {
  return `<div class="strat-card" style="grid-column: 1 / -1;">
    <h4>🗺️ Pla per fases amb timings d'objectius</h4>
    <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
      <tbody>${p.phases.map(f => `<tr><td style="padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap;color:var(--gold);vertical-align:top;"><strong>${escapeHtml(f.time)}</strong></td><td style="padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;"><strong>${escapeHtml(f.title)}</strong><br><span>${escapeHtml(f.text)}</span></td></tr>`).join('')}</tbody>
    </table></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
      <div><strong style="color:var(--green);">🏆 Condicions de victòria</strong><ul style="margin-top:4px;">${p.winConds.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
      <div><strong style="color:#FF8A9B;">⚠️ Com ens poden guanyar</strong><ul style="margin-top:4px;">${p.loseConds.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
    </div>
    <div style="color:var(--text-muted);font-size:0.72rem;margin-top:6px;">Temps d'objectius de la temporada 2026 segons <a href="https://www.nerfplz.com/2026/08/every-summoners-rift-objective.html" target="_blank" rel="noopener" style="color:var(--blue);">nerfplz.com</a> (Drac 5:00, Grubs 8:00, Herald 15:00, Baró 20:00); comprova-ho si el 26.23 els ha canviat.</div>
  </div>`;
}
function deepPlanHtml(s) {
  if (!s.deep) return '';
  return `<div class="strat-card" data-keep-open="1" style="grid-column: 1 / -1;">
    <h4>📋 Com jugar aquesta partida</h4>
    <div class="dp-grid">
      <div><strong>Teamfights</strong><ul>${s.deep.tf.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
      <div><strong>Objectius</strong><ul>${s.deep.obj.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>
    </div>
    <p class="dp-src">Els winrates de línia són de partides reals (Metabot, Emerald+). La resta són regles a partir de les etiquetes dels campions; feu-les servir com a punt de partida, no com a veritat absoluta.</p>
  </div>`;
}
