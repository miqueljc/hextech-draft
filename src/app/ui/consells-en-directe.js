// ===== Pantalla: consells en directe (text del quadre de recomanació) =====
function phaseAdviceHtml(k) {
  const pos = draftPos();
  if (pos.enemyAfter === 0) return `<br><span style="color:var(--gold);">🧠 Últim pick:</span> el rival ja no pot respondre → counter-pick lliure i omple el rol que falta.`;
  if (k >= 3) return `<br><span style="color:var(--gold);">🧠 Pick final vostre, però el rival encara en té ${pos.enemyAfter}:</span> us pot respondre. Eviteu picks que tinguin counters disponibles al rol que li falta i guardeu el counter-pick per a l'últim slot si en teniu.`;
  if (k <= 1) return `<br><span style="color:var(--gold);">🧠 Fase 1 (informació mínima):</span> tria <strong>flex</strong> i picks <strong>segurs a cegues</strong>; guarda per al final els picks d'un sol rol i els reactius (Pyke, Malphite, Poppy…). Tot el que triïs ho veurà el rival.`;
  if (k <= 3) return `<br><span style="color:var(--gold);">🧠 Fase 2:</span> ja heu mostrat bastant; completa el que falta (frontline / engage / dany) i comença a respondre als seus picks. Deixa <strong>1-2 rols oberts</strong> per decidir el final.`;
  return `<br><span style="color:var(--gold);">🧠 Últim pick:</span> el rival ja no pot respondre → counter-pick lliure i omple el rol que falta.`;
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
function liveAdviceText(rankedComps) {
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
// ================= PREDICCIÓ DE PICKS DEL RIVAL =================
function predictionHtml(ctx, max = 4) {
  if (draftPos().enemyAfter === 0 || ctx.enemyPicks.length >= 5) return '';
  const pr = predictEnemy(ctx).slice(0, max);
  if (!pr.length) return '';
  const line = pr.map(x => {
    const ans = ourAnswersTo(x.champ, ctx);
    return `<strong>${escapeHtml(x.champ)}</strong> ${Math.round(x.prob * 100)}%${ans.length ? ` <span style="color:var(--text-muted);">(guardeu ${ans.map(escapeHtml).join('/')})</span>` : ''}`;
  }).join(' · ');
  return `<br><span style="color:var(--gold);">🔮 Pròxim pick rival més probable:</span> ${line}`;
}
function pairAdviceHtml() {
  const { type, side, index } = state.activeSlot;
  if (type !== 'PICK' || side !== state.ourSide) return '';
  const pos = draftPos(); if (!pos.nextOurs) return '';
  const pairs = pairRecs(buildCtx(), index, pos.nextIdx, 3);
  if (!pairs.length) return '';
  const syn = p => { const s = synScore(p.a.champ, p.b.champ); return s && s.real ? ` · sinergia ${s.wr}%` : ''; };
  return `<br><span style="color:var(--gold);">👥 Doble pick (aquest i el següent):</span> ${pairs.map(p => `<strong>${escapeHtml(p.a.champ)} + ${escapeHtml(p.b.champ)}</strong> <span style="color:var(--gold);">(${p.score})</span>${syn(p)}`).join(' · ')}`;
}
function saveResultHtml() {
  if (state.fearless) return '';
  const all = [...state.bluePicks, ...state.redPicks].filter(Boolean).length;
  if (all < 10) return '';
  return `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;"><span style="color:var(--text-muted);">💾 Desa el resultat al vostre historial:</span><button class="btn" onclick="saveDraftResult('W')">✅ Victòria</button><button class="btn" onclick="saveDraftResult('L')">❌ Derrota</button><span id="histSaved" style="color:var(--text-muted);"></span></div>`;
}
// Línies destacades al quadre de recomanació en directe (torn de pick vostre)
function opCounterAdviceHtml() {
  const st = state.activeSlot;
  if (st.type !== 'PICK' || st.side !== state.ourSide || mmComplete()) return '';
  const recs = recommendChamps(buildCtx(), st.index);
  const ops = recs.filter(r => r.flags && r.flags.op).slice(0, 3);
  const cts = recs.filter(r => r.flags && r.flags.counter).slice(0, 3);
  let h = '';
  if (ops.length) h += `<br><span style="color:var(--gold);">⭐ OP del ${escapeHtml(OP_PICKS.patch || '')} al vostre pool (línia rival encara oculta):</span> ${ops.map(r => `<strong>${escapeHtml(r.champ)}</strong> (${r.flags.op})`).join(' · ')}`;
  if (cts.length) h += `<br><span style="color:var(--blue);">🎯 Counters al vostre pool:</span> ${cts.map(r => `<strong>${escapeHtml(r.champ)}</strong> contra ${escapeHtml(r.flags.counter)}`).join(' · ')}`;
  return h;
}
// Distintius a les targetes (escriptori i mode partida)
function flagBadges(r) {
  if (!r || !r.flags) return '';
  return (r.flags.op ? `<span class="fl-op" title="OP del parc a ${r.flags.op}">OP</span>` : '') + (r.flags.counter ? `<span class="fl-ct" title="Counter contra ${escapeHtml(r.flags.counter)}">Counter</span>` : '');
}
