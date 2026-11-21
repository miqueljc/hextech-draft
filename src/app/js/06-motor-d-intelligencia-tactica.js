// ================= MOTOR D'INTEL·LIGÈNCIA TÀCTICA =================
function evaluateComps() {
  const ourPicks = getOurPicks().filter(Boolean);
  const enemyPicks = getEnemyPicks().filter(Boolean);
  const enemyProf = teamProfile(enemyPicks);
  const allBans = [...state.blueBans, ...state.redBans].filter(Boolean);

  return COMPS.map(comp => {
    let score = 50;
    const reasons = [];

    // 1. Encaix dels nostres picks (sense mirar rol ni jugador)
    ourPicks.forEach(pick => {
      if (Object.values(comp.roles).some(list => list.includes(pick))) {
        score += 18;
        reasons.push(`✅ ${pick} encaixa`);
      } else score -= 12;
    });

    // 2. Bonus OP.GG / winrates reals disponibles
    ROSTER.forEach((player, pi) => {
      const roleChamps = ROLE_ORDER.filter(rr => playsRole(pi, rr)).flatMap(rr => (comp.roles[rr] || []).filter(c => poolOf(pi, rr).includes(c)));
      player.opggHighlights.forEach(h => {
        if (roleChamps.includes(h.champ) && !allBans.includes(h.champ)) {
          score += Math.round(h.bonus * 0.5);
          if (!reasons.some(r => r.includes(h.champ))) reasons.push(`🔥 ${h.champ} disponible (${h.wr})`);
        }
      });
    });

    // 3. Opcions banejades / robades
    Object.entries(comp.roles).forEach(([role, champs]) => {
      const available = champs.filter(c => !allBans.includes(c) && !enemyPicks.includes(c));
      if (available.length === 0) {
        score -= 25;
        reasons.push(`⚠️ Sense opcions a ${role}`);
      }
    });

    // 4. Matchup contra el draft rival (campions i arquetips)
    comp.goodAgainst.forEach(g => {
      const r = entryHit(g, enemyProf);
      if (!r.hit) return;
      score += r.kind === 'champ' ? 14 : 10;
      reasons.push(r.kind === 'champ' ? `💪 Forta contra ${g}` : `💪 Forta contra el seu ${g}`);
    });
    comp.badAgainst.forEach(b => {
      const r = entryHit(b, enemyProf);
      if (!r.hit) return;
      score -= r.kind === 'champ' ? 16 : 12;
      reasons.push(r.kind === 'champ' ? `❌ Sofreix contra ${b}` : `❌ Sofreix contra el seu ${b}`);
    });

    // 5. Meta del parc: força dels millors picks disponibles de la comp (tier 26.22 + canvis 26.23)
    let metaSum = 0, metaN = 0;
    Object.entries(comp.roles).forEach(([role, champs]) => {
      const avail = champs.filter(c => !allBans.includes(c) && !enemyPicks.includes(c));
      if (!avail.length) return;
      metaSum += Math.max(...avail.map(c => tierPts(c, role) + ((PATCH_CHANGES[c] || {}).delta || 0)));
      metaN++;
    });
    if (metaN) {
      const mp = Math.round(metaSum / metaN * 0.6);
      if (mp >= 3) { score += mp; reasons.push(`📈 Picks forts al meta del parc (+${mp})`); }
    }

    score = Math.max(5, Math.min(99, score));
    return { ...comp, score, reasons };
  }).sort((a, b) => b.score - a.score);
}

function buildCtx() {
  const ranked = evaluateComps();
  return {
    ranked,
    comp: pickComp(ranked),
    ourPicks: getOurPicks().filter(Boolean),
    enemyPicks: getEnemyPicks().filter(Boolean),
    unavailable: getUnavailableChamps()
  };
}

// ---- Recomanació de campions: només depèn dels picks aliats i enemics ----

function getActiveRecs(ctx) {
  const { type, side, index } = state.activeSlot;
  if (type !== 'PICK' || side !== state.ourSide) return [];
  return recommendChamps(ctx || buildCtx(), index);
}

function recReasons(r, max = 3) {
  const pos = r.why.filter(w => w.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, max).map(w => w.txt);
  const neg = r.why.filter(w => w.pts < 0).sort((a, b) => a.pts - b.pts)[0];
  return pos.join(', ') + (neg ? ` <span style="color:#FF8A9B;">(⚠️ ${neg.txt})</span>` : '');
}

function draftSnapshotText(A, B, ourChamps) {
  const needs = [];
  if (A.n >= 1) {
    if (A.front === 0) needs.push('frontline');
    if (A.eng === 0) needs.push('engage');
    if (A.n >= 3 && A.peel === 0) needs.push('peel');
    if (A.n >= 3 && A.ap === 0) needs.push('dany AP');
    if (A.n >= 3 && A.ad === 0) needs.push('dany AD');
  }
  const en = [];
  if (B.poke >= 2) en.push(`poke ×${B.poke}`);
  if (B.dive + B.assn >= 2) en.push(`dive/assassins ×${B.dive + B.assn}`);
  if (B.eng >= 2) en.push(`engage ×${B.eng}`);
  if (B.peel >= 2) en.push(`peel ×${B.peel}`);
  if (B.front >= 2) en.push(`frontline ×${B.front}`);
  if (B.n >= 3 && B.mob <= 1) en.push('poca mobilitat');
  if (B.n >= 3 && B.front === 0) en.push('sense frontline');
  const parts = [];
  if (needs.length) parts.push(`Al vostre draft us falta: <strong>${needs.join(', ')}</strong>.`);
  if (en.length) parts.push(`El rival mostra: <strong>${en.join(', ')}</strong>.`);
  if (ourChamps.length >= 2 && maxRoleMatching(ourChamps) < ourChamps.length) {
    parts.push(`<span style="color:var(--orange);">⚠️ Els vostres picks no poden cobrir 5 rols diferents.</span>`);
  }
  return parts.length ? `<br><span style="color:var(--text-muted);">${parts.join(' ')}</span>` : '';
}

function getLiveAdvice__base(rankedComps) {
  const ctx = buildCtx();
  ctx.ranked = rankedComps;
  ctx.comp = pickComp(rankedComps);
  const unavailable = ctx.unavailable, topComp = ctx.comp;
  const A = teamProfile(ctx.ourPicks), B = teamProfile(ctx.enemyPicks);
  const snap = draftSnapshotText(A, B, ctx.ourPicks);
  const { type, side, index } = state.activeSlot;
  const isOurTurn = side === state.ourSide;

  if (type === 'BAN') {
    const phase2 = ctx.ourPicks.length + ctx.enemyPicks.length > 0;
    if (isOurTurn) {
      const lines = recommendBans(ctx).slice(0, 4).map((b, k) => `<br>${k + 1}. <strong>${escapeHtml(b.champ)}</strong> <span style="color:var(--gold);">(${b.score} pts)</span> — ${recReasons(b)}`).join('');
      return `<strong>Torn de BAN nostre</strong> <span style="color:var(--text-muted);">(${phase2 ? 'ronda 2: respon als seus picks, als rols que els falten i a les sinergies' : 'ronda 1: força al meta, OTPs i flex; poc counter concret per no revelar el pla'}):</span>${lines}${snap}`;
    }
    const all = recommendChamps(ctx, -1);
    const risk = all.slice(0, 3).map(r => r.champ);
    const backup = all.slice(3).find(r => !risk.includes(r.champ));
    return `<strong>Torn de BAN rival:</strong> els vostres millors candidats ara són <strong>${risk.map(escapeHtml).join(', ') || '—'}</strong> i els poden banejar.${backup ? ` Pla B ja preparat: <strong>${escapeHtml(backup.champ)}</strong>.` : ''} Si cauen, pivota cap a <strong>${escapeHtml(rankedComps[1].name)}</strong>.${snap}`;
  }

  const recs = recommendChamps(ctx, isOurTurn ? index : -1);
  const line = (r, k) => `<br>${k + 1}. <strong>${escapeHtml(r.champ)}</strong> <span style="color:var(--gold);">(${r.score} pts)</span> — ${recReasons(r)}`;
  if (isOurTurn) {
    const html = recs.length
      ? recs.slice(0, 4).map(line).join('')
      : ' cap candidat disponible.';
    return `<strong>Torn de PICK nostre</strong> <span style="color:var(--text-muted);">(sense mirar jugador ni rol; l'assignació va després):</span>${html}${snap}${phaseAdviceHtml(ctx.ourPicks.filter((c, i) => i !== index && getOurPicks()[i]).length)}${predictionHtml(ctx, 3)}<br><span style="color:var(--text-muted);">Comp objectiu: ${escapeHtml(topComp.name)} (${topComp.score}%).</span>`;
  }
  const prev = recs.slice(0, 3).map(r => `<strong>${escapeHtml(r.champ)}</strong>`).join(', ');
  return `<strong>Torn de PICK rival:</strong> si us toqués ara, les millors respostes serien → ${prev || '—'}. Es reavaluarà quan triïn.${snap}${predictionHtml(ctx, 4)}`;
}

