// ===== Estat del draft: operacions sense pantalla =====
// Registra un campió al torn actiu i avança el torn. Retorna false si no està disponible.
function applyPick(champ) {
  const unavailable = getUnavailableChamps();
  if (unavailable.has(champ)) return false;

  const { type, side, index } = state.activeSlot;
  pushHistory();

  if (type === 'BAN') {
    if (side === 'BLUE') state.blueBans[index] = champ;
    else state.redBans[index] = champ;
  } else {
    if (side === 'BLUE') state.bluePicks[index] = champ;
    else state.redPicks[index] = champ;
  }

  // Avançar al següent slot buit segons ordre de torneig
  const nextStep = TOURNAMENT_ORDER.find(step => {
    const arr = step.type === 'BAN'
      ? (step.side === 'BLUE' ? state.blueBans : state.redBans)
      : (step.side === 'BLUE' ? state.bluePicks : state.redPicks);
    return arr[step.index] === null;
  });

  if (state.draftMode === 'FREE') {
    // Mode lliure: segueix al següent slot buit del mateix tipus i costat
    const arr = type === 'BAN' ? (side === 'BLUE' ? state.blueBans : state.redBans) : (side === 'BLUE' ? state.bluePicks : state.redPicks);
    const nextIdx = arr.findIndex((v, i) => i > index && v === null);
    if (nextIdx !== -1) state.activeSlot = { type, side, index: nextIdx };
  } else if (nextStep) {
    state.activeSlot = { type: nextStep.type, side: nextStep.side, index: nextStep.index };
  }
  return true;
}
// Buida el draft (bans, picks, historial i assignació) i torna al primer torn.
function clearDraftState() {
  state.blueBans = [null, null, null, null, null];
  state.redBans = [null, null, null, null, null];
  state.bluePicks = [null, null, null, null, null];
  state.redPicks = [null, null, null, null, null];
  state.history = [];
  state.assign = { manual: false, rolePlayer: [0, 1, 2, 3, 4], roleChamp: [null, null, null, null, null] };
  state.enemyLocks = {};
  state.activeSlot = { type: 'BAN', side: 'BLUE', index: 0 };
}
function mmComplete() { return TOURNAMENT_ORDER.every(s => mmArr(s.type, s.side)[s.index] !== null); }
function mmArr(type, side) { return type === 'BAN' ? (side === 'BLUE' ? state.blueBans : state.redBans) : (side === 'BLUE' ? state.bluePicks : state.redPicks); }
