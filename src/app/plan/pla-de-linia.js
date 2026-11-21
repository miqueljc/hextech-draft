// ================= PLA DE LÍNIA (vídeo Coach Rick: salut efectiva, trading dinàmic i breakpoints) =================
const SUSTAIN_RAW = ['Soraka', 'Nami', 'Sona', 'Yuumi', 'Lulu', 'Seraphine', 'Taric', 'Renata Glasc', 'Milio', 'Janna', 'Aatrox', 'Warwick', 'Swain', 'Vladimir', 'Sylas', 'Dr. Mundo', 'Olaf', 'Illaoi', 'Kayle', 'Sett', 'Fiddlesticks', 'Nasus', 'Mordekaiser'];
const SUSTAIN = new Set(SUSTAIN_RAW.map(canonChamp).filter(Boolean));
// Poder de línia ≈ salut efectiva esperada: abast, poke, sustain i pic early (heurístic, a partir d'etiquetes)
function lanePower(champs) {
  let p = 0;
  champs.filter(Boolean).forEach(c => {
    if (hasTag(c, 'rng')) p += 1;
    if (hasTag(c, 'poke')) p += 1;
    if (hasTag(c, 'early')) p += 1;
    if (SUSTAIN.has(c)) p += 1;
  });
  return p;
}
// Nivell on el campió (o duo) pot completar un kill: early = 2, normal = 3, escalador sense early = 6
function killBreakpoint(champs) {
  const cs = champs.filter(Boolean);
  if (!cs.length) return 3;
  const ear = cs.filter(c => hasTag(c, 'early')).length;
  const sca = cs.filter(c => hasTag(c, 'scale') && !hasTag(c, 'early')).length;
  if (ear >= Math.ceil(cs.length / 2)) return 2;
  if (sca === cs.length) return 6;
  return 3;
}
function topEnemyFor(info, r) {
  let best = null, bp = 0.001;
  (info.champs || []).forEach(e => { const p = info.dist[e][r]; if (p > bp) { bp = p; best = e; } });
  return best;
}
function lanePlanText(ours, theirs, label, verdict) {
  const D = lanePower(ours) - lanePower(theirs) + (verdict === 'good' ? 1 : verdict === 'bad' ? -1 : 0);
  const ob = killBreakpoint(ours), tb = killBreakpoint(theirs);
  const duo = ours.filter(Boolean).length > 1;
  const subj = duo ? 'el duo' : 'ell';
  let txt;
  if (D >= 2) txt = `Pla de línia (${label}): teniu més salut efectiva (abast/poke/sustain). Intercanvieu agressivament, feu push per agafar nivell 2 primer, castigueu cada vegada que recullin CS i feu poke amb els temps de recàrrega alts: si els intercanvis són iguals, us afavoreixen. Voleu tancar la línia abans que ${subj === 'ell' ? 'el rival' : 'el duo rival'} arribi al nivell ${tb}.`;
  else if (D <= -2) txt = `Pla de línia (${label}): ells tenen més salut efectiva. No feu res: no forceu intercanvis ni inicis (un hook/engage sense dany suficient només gasta la teva vida i pocions), conserveu salut i pocions i sobreviviu fins al nivell ${ob}, que és el vostre breakpoint de kill threat. Busqueu moments per fer reset i comprar: basar-se amb vida plena i objectes de dany és la condició de victòria del costat que vol anar-hi all-in. Tanqueu amb all-in tard, no al nivell 1-2.`;
  else txt = `Pla de línia (${label}): salut efectiva igualada. Penseu en trading dinàmic: no jutgeu un intercanvi només pel dany, sinó per salut efectiva restant, pocions, sustain, push esperat i proximitat del jungla; sumeu-hi el nivell 2 primer.`;
  if (ob >= tb + 2 && D <= 0) txt += ` Atenció: el vostre kill threat arriba molt més tard (nivell ${ob} vs ${tb}); si el rival sap jugar-ho, la línia és gairebé injugable: demaneu ajuda del jungla i planifiqueu un swap o prioritat de farm.`;
  else if (ob <= tb - 2 && D >= -1) txt += ` Teniu kill threat molt abans (nivell ${ob} vs ${tb}): un all-in primerenc pot guanyar la línia directament.`;
  else if (tb < ob) txt += ` El rival té kill threat abans (nivell ${tb} vs ${ob}): vigileu all-ins primerencs, no feu push sense visió i no deixeu que us trobin sense salut.`;
  else if (ob < tb) txt += ` Teniu kill threat abans (nivell ${ob} vs ${tb}): busqueu l'all-in just quan el vostre pic arribi.`;
  return txt;
}
function applyLanePlans(lanes, info) {
  const idx = Object.fromEntries(ROLE_ORDER.map((r, i) => [r, i]));
  lanes.forEach(l => { l.plan = ''; });
  ['Top', 'Mid', 'Jg'].forEach(role => {
    const l = lanes[idx[role]];
    if (!l.champ) return;
    const e = topEnemyFor(info, idx[role]);
    if (!e) return;
    if (role === 'Jg') return; // la jungla no té matchup de línia
    l.plan = lanePlanText([l.champ], [e], `${l.champ} vs ${e}`, l.verdict);
  });
  const b = lanes[idx.Bot], s = lanes[idx.Sup];
  if (b.champ && s.champ) {
    const eb = topEnemyFor(info, idx.Bot), es = topEnemyFor(info, idx.Sup);
    if (eb && es && eb !== es) {
      const verdict = b.verdict === s.verdict ? b.verdict : (b.verdict === 'bad' || s.verdict === 'bad') && !(b.verdict === 'good' || s.verdict === 'good') ? 'bad' : (b.verdict === 'good' || s.verdict === 'good') && !(b.verdict === 'bad' || s.verdict === 'bad') ? 'good' : 'even';
      const txt = lanePlanText([b.champ, s.champ], [eb, es], `${b.champ}+${s.champ} vs ${eb}+${es}`, verdict);
      b.plan = txt; s.plan = txt;
    }
  }
  lanes.forEach(l => { if (l.plan) l.tip += ' ' + l.plan; });
}

