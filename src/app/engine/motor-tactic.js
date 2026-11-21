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




