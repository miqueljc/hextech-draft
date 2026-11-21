// ================= WHAT-IF: COMPARAR CANDIDATS =================
function simulatePick(c, idx) {
  const arr = getOurPicks(), orig = arr[idx], savedAssign = state.assign;
  arr[idx] = c;
  state.assign = { ...state.assign, manual: false };
  try {
    const s = buildStrategy();
    const ranked = evaluateComps();
    const comp = s.comp;
    const lanes = s.lanes.map(l => ({ role: l.role, champ: l.champ, verdict: l.verdict, player: shortName(ROSTER.indexOf(l.player)) }));
    const g = lanes.filter(l => l.verdict === 'good').length, b = lanes.filter(l => l.verdict === 'bad').length;
    const A = s.A;
    const needs = [];
    if (A.n >= 2) {
      if (A.front === 0) needs.push('frontline');
      if (A.eng === 0) needs.push('engage');
      if (A.n >= 3 && A.peel === 0) needs.push('peel');
      if (A.n >= 3 && A.ap === 0) needs.push('dany AP');
      if (A.n >= 3 && A.ad === 0) needs.push('dany AD');
    }
    const asg = getAssignment();
    return { champ: c, comp: comp.name.split(':')[0], compScore: comp.score, good: g, bad: b, lanes, needs, A, feasible: feasibleCount(getOurPicks().filter(Boolean)), nPicks: getOurPicks().filter(Boolean).length, topComp: ranked[0].name.split(':')[0], roles: ROLE_ORDER.map((r, i) => asg.roleChamp[i] ? `${r}: ${asg.roleChamp[i]}` : null).filter(Boolean) };
  } finally {
    arr[idx] = orig;
    state.assign = savedAssign;
  }
}

