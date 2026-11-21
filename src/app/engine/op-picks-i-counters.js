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

