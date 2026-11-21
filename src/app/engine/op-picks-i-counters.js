// ===== Bloc U: OP picks del parc (línia rival encara no revelada) i counters disponibles al pool =====
// Dades: data.json → hextech_oppicks_v1 = { patch, source, roles: { Top: [...], Jg: [...], Mid: [...], Bot: [...], Sup: [...] } }
let OP_PICKS = OP_PICKS_DEFAULT;
function loadOpPicks() { const o = lsGet('hextech_oppicks_v1'); OP_PICKS = (o && o.roles) ? o : OP_PICKS_DEFAULT; }
loadOpPicks();
function isOpIn(c, r) { return ((OP_PICKS.roles || {})[r] || []).includes(c); }
function inRolePool(c, r) { return ROSTER.some((pl, p) => poolOf(p, r).includes(c)); }
const OP_BONUS = 14, COUNTER_BONUS = 12;
// Afegeix (no substitueix) dos motius a la recomanació de picks:
//  - OP del parc al vostre pool per a un rol vostre lliure on el rival encara no ha ensenyat el seu pick de línia
//  - counter real (WR de matchup) al vostre pool contra un pick rival del mateix rol
function addOpAndCounterBonus(out, ctx, excludeIdx) {
  try {
    const slots = getOurPicks(), ally = slots.filter((c, i) => c && i !== excludeIdx);
    const open = ourOpenRoles(ally), info = enemyRoleInfo(), miss = enemyMiss(info, ctx.enemyPicks);
    const patch = OP_PICKS.patch || PATCH_META.patch;
    out.forEach(r => {
      const c = r.champ, cd = ourDist(c, open);
      const roles = ROLE_ORDER.filter((R, i) => cd[i] >= 0.3 && open.includes(R) && inRolePool(c, R));
      if (!roles.length) return;
      r.flags = r.flags || {};
      const opR = roles.find(R => isOpIn(c, R) && miss[ROLE_ORDER.indexOf(R)] >= 0.5);
      if (opR) {
        r.score += OP_BONUS; r.flags.op = opR;
        r.why.push({ pts: OP_BONUS, txt: `OP del ${patch} a ${opR} (Skill Capped) i la línia rival encara no s'ha revelat`, style: 'op' });
      }
      let best = null;
      ctx.enemyPicks.forEach(e => {
        const d = (info.dist && info.dist[e]) || roleDistOfChamp(e);
        roles.forEach(R => {
          if (d[ROLE_ORDER.indexOf(R)] < 0.5) return;
          const m = muScore(c, e);
          if (m.adv >= 2.5 && (!best || m.adv > best.m.adv)) best = { e, m, R };
        });
      });
      if (best) {
        r.score += COUNTER_BONUS; r.flags.counter = best.e;
        r.why.push({ pts: COUNTER_BONUS, txt: `counter al vostre pool contra ${best.e} (${best.R}${best.m.real ? ', ' + best.m.wr + '% en ' + best.m.g + ' partides' : ''})`, style: 'counter' });
      }
    });
    out.sort((a, b) => b.score - a.score);
  } catch (e) { console.warn('opCounter', e); }
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
(function uStyles() {
  const css = `.fl-op, .fl-ct { display:inline-block; font-family:'Segoe UI',system-ui,sans-serif; font-size:0.6rem; font-weight:800; padding:1px 5px; border-radius:3px; vertical-align:middle; margin-left:3px; letter-spacing:0; }
  .fl-op { background:var(--gold); color:#010A13; }
  .fl-ct { background:rgba(10,200,185,0.2); color:var(--blue); border:1px solid rgba(10,200,185,0.5); }
  .adv-flags { font-size:0.78rem; line-height:1.5; margin:2px 0 6px; }`;
  try { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); } catch (e) {}
})();

