// ================= ANÀLISI DE MATCHUP (amb rols assignats) =================

function buildStrategy__base() {
  const ranked = evaluateComps();
  const comp = pickComp(ranked);
  const asg = getAssignment();
  const info = enemyRoleInfo();
  const ourPicks = getOurPicks().filter(Boolean);
  const enemyPicks = getEnemyPicks().filter(Boolean);
  const A = teamProfile(ourPicks);
  const B = teamProfile(enemyPicks);
  const unassigned = ourPicks.filter(c => !asg.roleChamp.includes(c));

  const lanes = ROLE_ORDER.map((role, r) => {
    const pl = ROSTER[asg.rolePlayer[r]];
    const c = asg.roleChamp[r];
    const cands = info.champs.map(e => ({ champ: e, prob: info.dist[e][r] })).filter(x => x.prob > 0.001).sort((a, b) => b.prob - a.prob);
    const mass = cands.reduce((s, x) => s + x.prob, 0);
    let verdict = 'unknown', notes = [], score = 0;
    if (c && mass > 0) {
      const parts = [];
      cands.forEach(x => {
        const m = laneMatchup(c, x.champ, role);
        score += m.score * x.prob / mass;
        m.notes.forEach(n => parts.push(x.prob < 0.999 ? `${n} (${Math.round(x.prob * 100)}%)` : n));
      });
      notes = [...new Set(parts)];
      verdict = score >= 1.5 ? 'good' : score <= -1.5 ? 'bad' : 'even';
    }
    const pIdx = asg.rolePlayer[r];
    if (c && champStat(pIdx, c)) notes = [...notes, `historial ${shortName(pIdx)}: ${statText(pIdx, c)}`];
    const enemyText = cands.length
      ? cands.map(x => x.prob >= 0.999 ? x.champ : `${x.champ} ${Math.round(x.prob * 100)}%`).join(' / ')
      : '—';
    const flags = [];
    if (!playsRole(asg.rolePlayer[r], role)) flags.push(`${pl.name.split('#')[0]} juga fora de rol (${pl.role})`);
    if (c && !champRoles(c).includes(role)) flags.push(`${c} no és habitual de ${role}`);
    if (c && !poolOf(asg.rolePlayer[r], role).includes(c)) flags.push(`${c} fora del pool de ${pl.name.split('#')[0]}`);
    if (c && champStat(asg.rolePlayer[r], c) && champRating(asg.rolePlayer[r], c) <= -6) flags.push(`historial dolent de ${pl.name.split('#')[0]} amb ${c} (${statText(asg.rolePlayer[r], c)})`);
    if (playerSlump(asg.rolePlayer[r])) flags.push(`${pl.name.split('#')[0]} en mala ratxa (${pl.recent}% últimes 20): jugueu-li un pick de comfort i protegiu la seva línia`);
    let tip;
    if (verdict === 'good') tip = 'Aprofita la línia: demana prioritat i busca jugades agressives als nivells 2-3 i 6.';
    else if (verdict === 'bad') tip = 'Joc segur: farmeja, ward profund i demana ajuda al jungla; no forcis duels 1v1.';
    else if (verdict === 'even') tip = 'Línia igualada: guanya amb control d\'ones i suport de l\'equip.';
    else tip = !c ? 'Cap campió assignat a aquest rol.' : 'Rival per determinar: reavalua quan el tingueu.';
    if (cands.length > 1 && mass > 0) tip += ` Rival incert (${enemyText}): confirma qui t'arriba abans de fer jugades.`;
    return { role, player: pl, champ: c, enemyText, verdict, notes, flags, tip, uncertain: cands.length > 1 };
  });

  const metrics = [
    ['Frontline', 'front'], ['Engage', 'eng'], ['Peel', 'peel'], ['Poke', 'poke'],
    ['Dive / Assassins', p => p.dive + p.assn], ['Mobilitat', 'mob'],
    ['Poder early', 'early'], ['Escalat (late)', 'scale'], ['Splitpush', 'split']
  ].map(([label, k]) => {
    const a = typeof k === 'function' ? k(A) : A[k];
    const b = typeof k === 'function' ? k(B) : B[k];
    return { label, a, b, verdict: a - b >= 1 ? 'good' : a - b <= -1 ? 'bad' : 'even' };
  });

  const namesWith = (champs, tag) => champs.filter(c => hasTag(c, tag));
  const fmt = arr => arr.length ? arr.join(', ') : '—';
  const complete = A.n === 5 && B.n === 5;

  const earlyDiff = A.early - B.early, scaleDiff = A.scale - B.scale;
  const early = earlyDiff >= 1
    ? `Teniu més pic early (${fmt(namesWith(A.list, 'early'))}) que ells (${fmt(namesWith(B.list, 'early'))}): ataqueu primer, forceu prioritat i objectius primerencs (Herald/Grubs).`
    : earlyDiff <= -1
      ? `El rival és més fort early (${fmt(namesWith(B.list, 'early'))}): jugueu segur, ward profund i cediu objectius petits fins al vostre power spike.`
      : `Early igualat: ningú té un avantatge clar; guanyeu amb visió, cangrejos i prioritat de jungla.`;
  const ourInit = A.eng + A.dive + A.mob, theirInit = B.eng + B.dive + B.mob;
  const mid = ourInit - theirInit >= 2
    ? `Teniu més iniciació i mobilitat que ells: forceu skirmishes i objectius (Drac/Baró) amb visió prèvia.`
    : ourInit - theirInit <= -2
      ? `Ells tenen més iniciació/mobilitat: no us moveu sols fora de visió, agrupeu-vos als objectius i guardeu els CC defensius.`
      : `Mid game equilibrat: l'equip que prepari visió 45 segons abans dels objectius tindrà l'avantatge.`;
  const late = scaleDiff >= 1
    ? `Escaleu millor (${fmt(namesWith(A.list, 'scale'))}): allargueu la partida, eviteu skirmishes innecessaris i protegiu els carries.`
    : scaleDiff <= -1
      ? `El rival escala millor (${fmt(namesWith(B.list, 'scale'))}): heu de tancar abans del minut 25, forçant Dracs, Baró i torres.`
      : `Late game parell: les teamfights decidiran; no inicieu sense CC en cadena.`;

  // Línies que decideixen la partida (segons els veredictes per rol)
  const goodLanes = lanes.filter(l => l.verdict === 'good').map(l => l.role);
  const badLanes = lanes.filter(l => l.verdict === 'bad').map(l => l.role);
  const laneSummary = [];
  if (goodLanes.length) laneSummary.push(`Teniu avantatge a ${goodLanes.join(', ')}: feu-ne servir per generar prioritat i ajudes cap a les altres línies.`);
  if (badLanes.length) laneSummary.push(`Sofriu a ${badLanes.join(', ')}: protegiu aquestes línies amb ganks/visió del jungla i no hi gasteu recursos.`);
  const jgIdx = ROLE_ORDER.indexOf('Jg'), jgChamp = asg.roleChamp[jgIdx];
  if (jgChamp && (goodLanes.length || badLanes.length)) {
    const side = goodLanes.filter(x => x !== 'Jg')[0] || badLanes.filter(x => x !== 'Jg')[0];
    if (side) laneSummary.push(`El jungla (${jgChamp}) hauria de prioritzar ${goodLanes.includes(side) ? side + ' (snowball)' : side + ' (assegurar-la)'}.`);
  }

  const tf = [];
  if (B.poke >= 2 && A.eng < 1) tf.push(`El rival us pot pokejar (${fmt(namesWith(B.list, 'poke'))}) i vosaltres no teniu engage clar: eviteu assetjaments llargs i busqueu fer waveclear + rotar.`);
  if (B.poke >= 2 && A.eng >= 1) tf.push(`Contra el seu poke (${fmt(namesWith(B.list, 'poke'))}) obligueu l'engage de ${fmt(namesWith(A.list, 'eng'))} abans que us desgastin.`);
  if (A.poke >= 2 && B.eng >= 1) tf.push(`El vostre poke és bo però ells tenen engage (${fmt(namesWith(B.list, 'eng'))}): controleu la visió i no us deixeu sorprendre.`);
  if (B.eng >= 2 && A.peel >= 1) tf.push(`Contra el seu engage (${fmt(namesWith(B.list, 'eng'))}) guardeu el peel de ${fmt(namesWith(A.list, 'peel'))} exclusivament pel carry.`);
  if (B.eng >= 2 && A.peel === 0 && A.n >= 3) tf.push(`Sense peel contra el seu engage: no us agrupeu en camp obert ni en passadissos estrets.`);
  if (A.eng >= 2 && B.peel >= 2) tf.push(`El rival té peel (${fmt(namesWith(B.list, 'peel'))}): busqueu picks i flancs; no inicieu sense CC en cadena.`);
  if (A.front - B.front >= 2) tf.push(`La vostra frontline és superior: lluiteu front-to-back i obligueu-los a entrar.`);
  if (B.front - A.front >= 2) tf.push(`El rival té molta més frontline: eviteu front-to-back llargs i busqueu flancs o escalat.`);
  if (B.dive + B.assn >= 3) tf.push(`El rival té molt dive/assassins (${fmt([...namesWith(B.list, 'dive'), ...namesWith(B.list, 'assn')].filter((v, k, a) => a.indexOf(v) === k))}): mantingueu visió als flancs i guardeu Flash/CC pels carries.`);
  if (A.dive + A.assn >= 2 && B.n >= 3 && B.front === 0) tf.push(`El rival no té frontline: aprofiteu el vostre dive per anar directes al backline.`);
  if (B.ap >= 4 && B.ad <= 1) tf.push(`El rival és gairebé tot AP: prioritzeu resistència màgica.`);
  if (B.ad >= 4 && B.ap <= 1) tf.push(`El rival és gairebé tot AD: prioritzeu armadura.`);
  if (A.n >= 4 && (A.ap === 0 || A.ad === 0)) tf.push(`El vostre equip fa quasi un sol tipus de dany: el rival pot stackejar ${A.ap === 0 ? 'armadura' : 'resistència màgica'}.`);
  if (!tf.length) tf.push(`Cap desequilibri clar: guanyeu amb millor visió, timing d'objectius i execució de teamfights.`);

  const win = [];
  if (scaleDiff >= 1 && earlyDiff <= 0) win.push('Sobreviu al mid game i guanya al late.');
  if (earlyDiff >= 1 && scaleDiff <= 0) win.push('Snowball d\'early game: tanqueu abans que ells escalin.');
  if (earlyDiff >= 1 && scaleDiff >= 1) win.push('Teniu bon early i bon late: jugueu a controlar tota la partida.');
  if (A.split > B.split) win.push(`Splitpush amb ${fmt(namesWith(A.list, 'split'))} per crear 1-3-1.`);
  if (A.eng >= 2 && B.mob <= 1 && B.n >= 3) win.push('Rival poc mòbil: una iniciació encertada decideix la teamfight.');
  if (!win.length) win.push('Pla base de la composició seleccionada (veure timings).');

  const prio = [['assn', 'assassí: guardeu peel/visió als flancs'], ['eng', 'engage: no us agrupeu fora de visió, guardeu CC/Flash'],
    ['dive', 'dive: protegiu el backline'], ['poke', 'poke: forceu engage o rotació'], ['split', 'splitpusher: tingueu TP/resposta preparada'],
    ['scale', 'escala: tanqueu la partida abans']];
  const threats = [];
  B.list.forEach(c => {
    const p = prio.find(([tag]) => hasTag(c, tag));
    if (p) threats.push({ champ: c, txt: p[1] });
  });

  // Runes i build per rol segons la composició dels dos equips
  const bctx = makeBuildCtx(ourPicks, enemyPicks);
  lanes.forEach(l => { l.build = l.champ ? adviseBuild(l.champ, l.role, bctx) : null; });

  // Força al meta (tier 26.22) de cada equip, amb els rols assignats / probables
  const metaOur = lanes.reduce((sum, l) => sum + (l.champ ? tierPts(l.champ, l.role) : 0), 0);
  const metaEnemy = Math.round(info.champs.reduce((sum, e) => sum + ROLE_ORDER.reduce((a, role, r) => a + info.dist[e][r] * tierPts(e, role), 0), 0));
  metrics.push({ label: 'Força al meta (tier del parc)', a: metaOur, b: metaEnemy, verdict: metaOur - metaEnemy >= 6 ? 'good' : metaOur - metaEnemy <= -6 ? 'bad' : 'even' });

  const patchNotes = [];
  asg.roleChamp.filter(Boolean).forEach(c => { if (PATCH_CHANGES[c]) patchNotes.push({ champ: c, team: 'nosaltres', ...PATCH_CHANGES[c] }); });
  enemyPicks.forEach(c => { if (PATCH_CHANGES[c]) patchNotes.push({ champ: c, team: 'rival', ...PATCH_CHANGES[c] }); });

  applyLanePlans(lanes, info);
  const individual = lanes.map(l => ({
    role: l.role,
    text: `${comp.plan.individual[l.role] || ''} Davant teu: ${l.enemyText} — ${l.tip}`,
    lane: l
  }));

  const phasePlan = buildPhasePlan({ A, B, lanes, comp, earlyDiff, scaleDiff, ourInit, theirInit, ourPicks, enemyPicks });

  return { phasePlan, comp, A, B, lanes, metrics, patchNotes, early, mid, late, tf, win, laneSummary, threats: threats.slice(0, 5), individual, complete, unassigned, manual: asg.manual, ambiguous: info.ambiguous, enemyCount: info.count };
}

const VERDICT_UI = {
  good: { icon: '✅', color: 'var(--green)', label: 'Avantatge' },
  bad: { icon: '❌', color: '#FF8A9B', label: 'Desavantatge' },
  even: { icon: '➖', color: 'var(--text-muted)', label: 'Igualat' },
  unknown: { icon: '⏳', color: 'var(--text-muted)', label: 'Pendent' }
};

function generateStrategy__base() {
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
    ${phasePlanHtml(s.phasePlan)}
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
  sec.scrollIntoView({ behavior: 'smooth' });
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
function afterRosterChange() { afterDataChange(); }

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


