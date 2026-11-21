// ===== Bloc S: fitxes de rivals compartides (data.json → hextech_rivals_v1) =====
// Format: { teams: [ { id, name, updated: 'AAAA-MM-DD', source, players: [ { name: 'Nom#TAG', role, roleAuto, games, champs: [ { champ, games, wr } ] } ] } ] }
function sharedRivals() {
  const r = lsGet('hextech_rivals_v1');
  return r && Array.isArray(r.teams) ? r.teams.filter(t => t && t.id && Array.isArray(t.players)) : [];
}
function rivalToScout(t) {
  const byRole = {};
  t.players.forEach(p => { const r = ROLE_ORDER.includes(p.role) ? p.role : (ROLE_ORDER.includes(p.roleAuto) ? p.roleAuto : null); if (r && !byRole[r]) byRole[r] = p; });
  const rest = t.players.filter(p => !Object.values(byRole).includes(p));
  const players = ROLE_ORDER.map(r => {
    const p = byRole[r] || rest.shift();
    if (!p) return { name: '', role: r, text: '', champs: [] };
    const champs = (p.champs || []).map(o => ({ champ: canonChamp(o.champ) || o.champ, games: +o.games || 0, wr: +o.wr || 50 })).filter(o => CHAMP_DATA[o.champ]).slice(0, 12);
    return { name: p.name || '', role: r, text: champs.map(o => `${o.champ} ${o.wr}% ${o.games} partides`).join('\n'), champs };
  });
  return { team: t.name || t.id, otps: (state.scout && state.scout.otps) || '', sharedId: t.id, updated: t.updated || '', source: t.source || '', players };
}
function loadSharedRival(id) {
  const t = sharedRivals().find(x => x.id === id); if (!t) return;
  state.scout = rivalToScout(t);
  _scoutCache = null; saveScout(); renderScout(); renderAll();
}
// Si la fitxa carregada té una versió més nova a les dades compartides, s'actualitza sola
function refreshSharedRival() {
  const s = state.scout; if (!s || !s.sharedId) return false;
  const t = sharedRivals().find(x => x.id === s.sharedId);
  if (!t || !t.updated || t.updated <= (s.updated || '')) return false;
  state.scout = rivalToScout(t); _scoutCache = null; saveScout(); return true;
}

