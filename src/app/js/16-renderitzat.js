// ================= RENDERITZAT =================
function renderAll() {
  renderSlots();
  const ranked = evaluateComps();
  document.getElementById('liveAdviceText').innerHTML = getLiveAdvice(ranked);
  renderAssignment();
  renderCompBox();
  renderCompsRanking(ranked);
  renderChampGrid();
  renderFearlessPanel();
}

function renderSlots() {
  const banHtml = (arr, side) => arr.map((c, i) => {
    const active = state.activeSlot.type === 'BAN' && state.activeSlot.side === side && state.activeSlot.index === i;
    return `<div class="ban-slot ${c ? 'filled' : ''} ${active ? 'active-turn' : ''}" onclick="selectSlot('BAN','${side}',${i})">
      ${c ? `${champIcon(c, 28, 'ci-ban')}<span class="ban-name">${escapeHtml(c)}</span><span class="ban-x" onclick="clearSlot(event,'BAN','${side}',${i})">✕</span>` : `${side === 'BLUE' ? 'B' : 'R'}${i + 1}`}
    </div>`;
  }).join('');
  document.getElementById('blueBans').innerHTML = banHtml(state.blueBans, 'BLUE');
  document.getElementById('redBans').innerHTML = banHtml(state.redBans, 'RED');

  const renderPickList = (side, picksArr, containerId) => {
    document.getElementById(containerId).innerHTML = picksArr.map((c, i) => {
      const active = state.activeSlot.type === 'PICK' && state.activeSlot.side === side && state.activeSlot.index === i;
      const roles = c ? champRoles(c).join('/') : '';
      return `<div class="pick-slot ${c ? (side === 'BLUE' ? 'filled-blue' : 'filled-red') : ''} ${active ? 'active-turn' : ''}" ${c ? `data-ctr="${escapeHtml(c)}"` : ''} onclick="selectSlot('PICK','${side}',${i})">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="role-tag">P${i + 1}</span>
          ${c ? champIcon(c, 40, 'ci-pick') : ''}${c && IS_DESK ? `<span class="pk-art" style="background-image:url('${champLoadUrl(c)}')"></span>` : ''}
          <div>
            <div class="champ-name">${c ? escapeHtml(c) : 'Seleccionar campió...'}</div>
            <div class="player-sub">${c ? slotSub(side, c) : `Pick ${i + 1}`}</div>
          </div>
        </div>
        ${c ? `<button class="btn" style="padding:2px 6px;font-size:0.7rem;" onclick="clearSlot(event,'PICK','${side}',${i})">✕</button>` : ''}
      </div>`;
    }).join('');
  };
  renderPickList('BLUE', state.bluePicks, 'bluePicks');
  renderPickList('RED', state.redPicks, 'redPicks');

  const stepObj = TOURNAMENT_ORDER.find(s => s.type === state.activeSlot.type && s.side === state.activeSlot.side && s.index === state.activeSlot.index);
  document.getElementById('turnLabel').textContent = stepObj
    ? `${stepObj.label} (${state.activeSlot.side === state.ourSide ? 'NOSALTRES' : 'RIVAL'})`
    : `${state.activeSlot.type} ${state.activeSlot.side} #${state.activeSlot.index + 1}`;
}

function renderAssignment() {
  const asg = getAssignment();
  const picks = getOurPicks().filter(Boolean);
  const placed = new Set(asg.roleChamp.filter(Boolean));
  const loose = picks.filter(c => !placed.has(c));

  document.getElementById('assignHint').innerHTML = asg.manual
    ? `Mode <strong>manual</strong>. Canviar un jugador o un campió ja assignat a un altre rol els <strong>intercanvia</strong> automàticament.`
    : `Mode <strong>automàtic</strong>: es recalcula amb cada pick segons pool, WR real i rol habitual. Modifica qualsevol selector per passar a manual.`;

  document.getElementById('assignRows').innerHTML = ROLE_ORDER.map((role, r) => {
    const p = asg.rolePlayer[r], pl = ROSTER[p], c = asg.roleChamp[r];
    const flags = [];
    if (!playsRole(p, role)) flags.push(`<span class="badge-target">jugador fora de rol (${pl.role})</span>`);
    else if (pl.role !== role) flags.push(`<span class="badge-pool">rol secundari</span>`);
    if (c && !champRoles(c).includes(role)) flags.push(`<span class="badge-target">${escapeHtml(c)} no és habitual de ${role}</span>`);
    if (c && !poolOf(p, role).includes(c)) flags.push(`<span class="badge-target">${pl.pool.includes(c) ? 'al pool de ' + escapeHtml(shortName(p)) + ' però en un altre rol' : 'fora del pool de ' + escapeHtml(shortName(p))}</span>`);
    if (c && pl.opggHighlights.some(h => h.champ === c)) flags.push(`<span class="badge-wr">🔥 WR real</span>`);
    else if (c && poolOf(p, role).includes(c)) flags.push(`<span class="badge-pool">Pool</span>`);
    if (c && champStat(p, c)) flags.push(`<span class="${champRating(p, c) <= -6 ? 'badge-target' : 'badge-pool'}">${statText(p, c)}</span>`);
    if (playerSlump(p)) flags.push(`<span class="badge-target">mala ratxa (${pl.recent}%)</span>`);
    const playerOpts = ROSTER.map((q, qi) => `<option value="${qi}" ${qi === p ? 'selected' : ''}>${escapeHtml(q.name.split('#')[0])} (${playerRoles(qi).join('/')})</option>`).join('');
    const champOpts = `<option value="">— sense assignar —</option>` + picks.map(x => `<option value="${escapeHtml(x)}" ${x === c ? 'selected' : ''}>${escapeHtml(x)}</option>`).join('');
    return `<div class="assign-row">
      <span class="role-tag">${role.toUpperCase()}</span>
      <select onchange="onAssignChange(${r},'player',this.value)">${playerOpts}</select>
      <select onchange="onAssignChange(${r},'champ',this.value)">${champOpts}</select>
      <div class="assign-flags">${flags.join(' ')}</div>
    </div>`;
  }).join('') + (loose.length ? `<div style="color:var(--orange);font-size:0.78rem;margin-top:6px;">⚠️ Picks sense assignar a cap rol: ${loose.map(escapeHtml).join(', ')}</div>` : '');

  const info = enemyRoleInfo();
  const locks = state.enemyLocks || {};
  const enemyRows = info.champs.map((c, i) => {
    const chips = ROLE_ORDER.map((role, r) => info.dist[c][r] > 0.001 ? `${role} ${Math.round(info.dist[c][r] * 100)}%` : null).filter(Boolean).join(' · ');
    const sel = ['', ...ROLE_ORDER].map(v => `<option value="${v}" ${(locks[c] || '') === v ? 'selected' : ''}>${v || 'Auto (totes les possibilitats)'}</option>`).join('');
    return `<div class="assign-row">
      <strong style="min-width:110px;">${escapeHtml(c)}</strong>
      <select onchange="onEnemyLock(${i},this.value)">${sel}</select>
      <div class="assign-flags"><span class="badge-pool">${chips || '—'}</span></div>
    </div>`;
  }).join('');
  document.getElementById('enemyRoleRows').innerHTML = info.champs.length
    ? enemyRows + `<div style="color:var(--text-muted);font-size:0.74rem;margin-top:6px;">${info.count} repartiment(s) de rols plausible(s) considerats${info.ambiguous ? ' — l\'anàlisi pondera totes les possibilitats' : ' — rols clars'}. Si en sabeu el rol real, fixeu-lo.</div>`
    : '<div style="color:var(--text-muted);font-size:0.78rem;">Encara no hi ha picks rivals.</div>';
}

function renderChampGrid() {
  const q = document.getElementById('champSearch').value.toLowerCase().trim();
  const unavailable = getUnavailableChamps();
  const poolSet = new Set(ROSTER.flatMap(r => r.pool));
  const opggMap = {};
  ROSTER.forEach(r => r.opggHighlights.forEach(h => { opggMap[h.champ] = h.wr; }));
  const recs = getActiveRecs();
  const recRank = new Map(recs.slice(0, 15).map((r, i) => [r.champ, i + 1]));

  const filtered = ALL_CHAMPS.filter(champ => {
    if (q && !champ.toLowerCase().includes(q)) return false;
    if (state.tagFilters && state.tagFilters.size && ![...state.tagFilters].every(t => hasTag(champ, t))) return false;
    if (state.roleFilter === 'REC') return recRank.has(champ);
    if (state.roleFilter === 'POOL') return poolSet.has(champ);
    if (state.roleFilter === 'OPGG') return Boolean(opggMap[champ]);
    if (ROLE_ORDER.includes(state.roleFilter)) return viableRoles(champ).includes(state.roleFilter);
    return true;
  });

  const grid = document.getElementById('champGrid');
  if (state.roleFilter === 'REC' && !filtered.length) {
    grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;padding:8px;">Les recomanacions només apareixen quan és el torn de PICK del vostre equip.</div>';
    return;
  }
  if (state.roleFilter === 'REC') filtered.sort((a, b) => recRank.get(a) - recRank.get(b));

  grid.innerHTML = filtered.map(champ => {
    const isDis = unavailable.has(champ);
    const inPool = poolSet.has(champ);
    const wrInfo = opggMap[champ];
    const rank = recRank.get(champ);
    const isTarget = state.enemyOtps.some(t => t.toLowerCase() === champ.toLowerCase());
    return `<div class="champ-chip ${isDis ? 'disabled' : ''} ${isTarget ? 'cc-target' : ''} ${inPool ? 'cc-inpool' : ''}" data-champ="${escapeHtml(champ)}" data-ctr="${escapeHtml(champ)}">
      <div class="cc-top">${champIcon(champ, 0, 'ci-grid')}
        ${rank && !isDis ? `<span class="cc-tag cc-rec" title="Recomanat #${rank}">⭐${rank}</span>` : ''}
        ${bestTier(champ) ? `<span class="cc-tag cc-tier" title="Tier del parc (millor rol)">${bestTier(champ)}</span>` : ''}
        ${PATCH_CHANGES[champ] ? `<span class="cc-tag cc-patch ${PATCH_CHANGES[champ].delta > 0 ? 'up' : 'down'}" title="${escapeHtml(PATCH_CHANGES[champ].note)}">${PATCH_CHANGES[champ].delta > 0 ? '▲' : '▼'}</span>` : ''}
        ${wrInfo ? `<span class="cc-tag cc-pool cc-hot" title="Bon WR a l'op.gg de l'equip">🔥</span>` : (inPool ? `<span class="cc-tag cc-pool" title="Al pool de l'equip">Pool</span>` : '')}</div>
      <div class="cc-name">${escapeHtml(champ)}</div>

    </div>`;
  }).join('');
}

function toggleSelectComp(id) {
  state.selectedCompId = state.selectedCompId === id ? null : id;
  renderAll();
}

