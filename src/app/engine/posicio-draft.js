// ---- Posició real dins l'ordre de torneig ----
function draftPos() {
  const { type, side, index } = state.activeSlot;
  const eSide = state.ourSide === 'BLUE' ? 'RED' : 'BLUE';
  const ePicks = eSide === 'BLUE' ? state.bluePicks : state.redPicks;
  const i = TOURNAMENT_ORDER.findIndex(s => s.type === type && s.side === side && s.index === index);
  if (state.draftMode === 'FREE' || i < 0) return { enemyAfter: 5 - ePicks.filter(Boolean).length, nextOurs: false, nextIdx: -1 };
  const rest = TOURNAMENT_ORDER.slice(i + 1);
  const enemyAfter = rest.filter(s => s.type === 'PICK' && s.side === eSide && !ePicks[s.index]).length;
  const nx = TOURNAMENT_ORDER[i + 1];
  const ours = type === 'PICK' && side === state.ourSide;
  const nextOurs = Boolean(ours && nx && nx.type === 'PICK' && nx.side === state.ourSide && !getOurPicks()[nx.index] && !getOurPicks()[index]);
  return { enemyAfter, nextOurs, nextIdx: nextOurs ? nx.index : -1 };
}

