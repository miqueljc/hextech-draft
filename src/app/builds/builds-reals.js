// ===== Bloc W: builds reals (op.gg, Emerald+, parc 16.23 = 26.23) + pla de partida detallat =====
// Cada entrada: [keystone, minors primàries, "Arbre: r1 · r2", shards (ofensiva·flex·defensa), summoners, inici, botes, [core x3], [alternativa], [4t objecte], pegat]
// Les builds viuen a data.json (hextech_builds_v1) per poder-les actualitzar cada parc sense tocar el codi;
// REAL_BUILDS_DEFAULT (còpia per quan no hi ha connexió) la genera el muntatge a partir de data.json.
let REAL_BUILDS = REAL_BUILDS_DEFAULT, REAL_BUILDS_PATCH = REAL_BUILDS_PATCH_DEFAULT, REAL_BUILDS_SRC = REAL_BUILDS_SRC_DEFAULT;
function loadRealBuilds() {
  const o = lsGet('hextech_builds_v1');
  if (o && o.builds && typeof o.builds === 'object') { REAL_BUILDS = { ...REAL_BUILDS_DEFAULT, ...o.builds }; REAL_BUILDS_PATCH = o.patch || REAL_BUILDS_PATCH_DEFAULT; REAL_BUILDS_SRC = o.source || REAL_BUILDS_SRC_DEFAULT; }
  else { REAL_BUILDS = REAL_BUILDS_DEFAULT; REAL_BUILDS_PATCH = REAL_BUILDS_PATCH_DEFAULT; REAL_BUILDS_SRC = REAL_BUILDS_SRC_DEFAULT; }
}
loadRealBuilds();
// Icones que el catàleg desat encara no tenia (Data Dragon les afegeix sol si hi ha connexió)
(function addItemIds() {
  try {
    const add = { hextechrocketbelt: '3152', rylaiscrystalscepter: '3116', terminus: '3302', overlordsbloodmail: '2501', yuntalwildarrows: '3032', muramana: '3042', tearofthegoddess: '3070', essencereaver: '3508', darkseal: '1082', mejaissoulstealer: '3041', bootsofswiftness: '3009', gustwalkerhatchling: '1102', mosstomperseedling: '1103', scorchclawpup: '1101', seraphsembrace: '3040', doransbow: '1086', fimbulwinter: '3121', bloodletterscurse: '8010' };
    [DD_CAT_DEFAULT, typeof DD_CAT !== 'undefined' ? DD_CAT : null].forEach(c => { if (c && c.items) Object.keys(add).forEach(k => { if (!c.items[k]) c.items[k] = add[k]; }); });
  } catch (e) {}
})();
const RUNE_ROWS = {
  Precision: [['Press the Attack', 'Lethal Tempo', 'Fleet Footwork', 'Conqueror'], ['Absorb Life', 'Triumph', 'Presence of Mind'], ['Legend: Alacrity', 'Legend: Haste', 'Legend: Bloodline'], ['Coup de Grace', 'Cut Down', 'Last Stand']],
  Domination: [['Electrocute', 'Dark Harvest', 'Hail of Blades'], ['Cheap Shot', 'Taste of Blood', 'Sudden Impact'], ['Sixth Sense', 'Grisly Mementos', 'Deep Ward'], ['Treasure Hunter', 'Relentless Hunter', 'Ultimate Hunter']],
  Sorcery: [['Summon Aery', 'Arcane Comet', "Stormraider's Surge", 'Deathfire Touch'], ['Axiom Arcanist', 'Manaflow Band', 'Nimbus Cloak'], ['Transcendence', 'Celerity', 'Absolute Focus'], ['Scorch', 'Waterwalking', 'Gathering Storm']],
  Resolve: [['Grasp of the Undying', 'Aftershock', 'Guardian'], ['Demolish', 'Font of Life', 'Shield Bash'], ['Conditioning', 'Second Wind', 'Bone Plating'], ['Overgrowth', 'Revitalize', 'Unflinching']],
  Inspiration: [['Glacial Augment', 'Unsealed Spellbook', 'First Strike'], ['Hextech Flashtraption', 'Magical Footwear', 'Cash Back'], ['Triple Tonic', 'Time Warp Tonic', 'Biscuit Delivery'], ['Cosmic Insight', 'Approach Velocity', 'Jack of All Trades']]
};
function runeRowOf(name) {
  for (const t of Object.keys(RUNE_ROWS)) { const i = RUNE_ROWS[t].findIndex(r => r.includes(name)); if (i >= 0) return { tree: t, row: i }; }
  return null;
}
function realBuildOf(c, role) { const r = REAL_BUILDS[c + '|' + role]; return r ? { ks: r[0], pri: r[1], sec: r[2], sh: r[3], sums: r[4], start: r[5], boots: r[6], core: r[7], alt: r[8], fourth: r[9], patch: r[10] } : null; }
const JG_PET = { TK: 'Mosstomper Seedling', TS: 'Mosstomper Seedling', DA: 'Scorchclaw Pup', AA: 'Scorchclaw Pup', SK: 'Scorchclaw Pup' };
const CARRY_ARCH = new Set(['MK', 'MG', 'AA', 'DA', 'MS', 'OH']);
// Aplica la build real com a base abans de la personalització per aquesta partida
function personalizeBuild(adv, c, role, x) {
  const rb = realBuildOf(c, role);
  let a = adv;
  if (rb) {
    const sh = rb.sh.split('·');
    a = { ...adv, keystone: rb.ks, keyWhy: `la més jugada a ${c} ${role} (op.gg Emerald+, ${rb.patch === REAL_BUILDS_PATCH ? 'parc ' + REAL_BUILDS_PATCH.replace('16.', '26.') : 'dades ' + rb.patch.replace('16.', '26.')})`,
      primary: `${TREE_OF[rb.ks] || (runeRowOf(rb.ks) || {}).tree}: ${rb.pri}`, secondary: rb.sec,
      shards: `Ofensiva: ${sh[0]} · Flex: ${sh[1]} · Defensa: ${sh[2]}`,
      start: rb.start, boots: rb.boots + (role === 'Mid' ? ' (o les botes de tier 3 de la quest de mid)' : ''), core: rb.core.slice(), real: rb };
  } else if (role === 'Jg') {
    a = { ...adv, start: `${JG_PET[adv.arch] || 'Gustwalker Hatchling'} + Health Potion` };
  }
  const r = adaptBuildToGame(a, c, role, x);
  return finishBuild(r, a, c, role, x);
}
function finishBuild(r, a, c, role, x) {
  const rb = a.real, out = { ...r };
  // Inici: l'ajust per rival de rang a top es manté; la jungla sempre comença amb mascota
  if (role === 'Jg') out.start = a.start;
  else if (rb && !/rival de línia/.test(r.start || '')) out.start = rb.start;
  if (rb) {
    // Summoners: els més jugats, amb l'alternativa contextual de la plantilla si és diferent
    const ctxS = r.summoners || '', ctxPair = ctxS.replace(/\s*\(.*\)$/, '');
    out.summoners = rb.sums;
    if (role !== 'Jg' && ctxPair && ctxPair !== rb.sums && /\(/.test(ctxS)) out.notes = [...(out.notes || []), `Summoners: ${rb.sums} és el més jugat; valora ${ctxPair} ${ctxS.match(/\(.*\)/)[0]}.`];
  }
  // Jungla: fora els consells de "línia" pensats per a laners
  if (role === 'Jg') {
    out.firstBack = '';
    out.notes = (out.notes || []).filter(n => !/^Primera tornada|aguantes el poke de la línia|tombar torres aviat/.test(n)).map(n => n.replace(/^Rival de línia:/, 'Jungla rival:'));
  }
  // Resistències del core segons el dany rival (només si és clarament d'un tipus)
  try {
    const dealers = (x.enemy || []).filter(e => !['TK', 'TS'].includes((ARCH[e] || {}).code));
    const adN = dealers.filter(e => hasTag(e, 'ad') && !hasTag(e, 'ap')).length, apN = dealers.filter(e => hasTag(e, 'ap') && !hasTag(e, 'ad')).length;
    const ARM = ['Thornmail', 'Frozen Heart', "Randuin's Omen"], MR = ['Force of Nature', 'Kaenic Rookern', 'Spirit Visage', 'Abyssal Mask'];
    const swapTo = apN >= 3 && apN - adN >= 2 ? MR : adN >= 3 && adN - apN >= 2 ? ARM : null, from = swapTo === MR ? ARM : swapTo === ARM ? MR : null;
    if (swapTo && ['TK', 'TS', 'JG', 'AB'].includes(a.arch)) {
      const used = new Set([...(a.core || []), ...(r.order || []).map(o => o.item)]);
      (r.order || []).forEach(o => {
        if (!from.includes(o.item) || !isCoreW(a, o.item)) return;
        const rep = swapTo.find(i => !used.has(i)); if (!rep) return;
        used.add(rep); const old = o.item; o.item = rep; o.why = `${old} canviat per ${rep}: el rival fa sobretot dany ${swapTo === MR ? 'AP' : 'AD'}`;
        a.core = a.core.map(k => k === old ? rep : k);
      });
    }
  } catch (e) {}
  // Ordre de compra: els carries tanquen 2 objectes core abans de desviar-se; màxim 2 situacionals
  const isCore = it => isCoreW(a, it);
  const ord = (r.order || []).filter(o => o.item !== 'Sense desviaments');
  const cores = ord.filter(o => isCore(o.item)), sit = ord.filter(o => !isCore(o.item));
  const clean = o => ({ item: o.item, why: o.why.replace(/^⚠️\s*/, '').replace(/ — compra'l abans del 2n core/, '') });
  const urgent = sit.length && /^⚠️/.test(sit[0].why);
  const carry = CARRY_ARCH.has(a.arch);
  const newOrd = [];
  if (cores[0]) newOrd.push(cores[0]);
  if (carry) {
    if (cores[1]) newOrd.push(cores[1]);
    if (sit[0]) newOrd.push({ ...clean(sit[0]), why: (urgent ? '⚠️ ' : '') + clean(sit[0]).why + (urgent ? ' — just després dels 2 core (si et maten en combo, compra abans el component defensiu)' : '') });
    if (cores[2]) newOrd.push(cores[2]);
  } else {
    if (sit[0] && urgent) newOrd.push({ ...clean(sit[0]), why: '⚠️ ' + clean(sit[0]).why + ' — abans del 2n core' });
    if (cores[1]) newOrd.push(cores[1]);
    if (sit[0] && !urgent) newOrd.push(clean(sit[0]));
    if (cores[2]) newOrd.push(cores[2]);
  }
  if (sit[1]) newOrd.push(clean(sit[1]));
  for (let k = newOrd.length - 1; k >= 0; k--) {
    const parts = String(newOrd[k].item).split(' / ');
    const others = newOrd.filter((_, j) => j !== k).map(o => o.item);
    const left = parts.filter(p => !others.includes(p));
    if (!left.length) newOrd.splice(k, 1); else if (left.length < parts.length) newOrd[k] = { ...newOrd[k], item: left.join(' / ') };
  }
  const extra = sit.slice(2).map(o => o.item);
  if (!sit.length) newOrd.push({ item: rb ? rb.fourth[0] : 'Sense desviaments', why: rb ? `4t objecte més jugat (${rb.fourth.slice(1).join(', ')} també)` : 'cap amenaça clara que justifiqui sortir del core: segueix la plantilla' });
  out.order = newOrd;
  const notes = [...(out.notes || [])];
  if (extra.length) notes.push(`Si la partida s'allarga, també: ${extra.join(', ')}.`);
  if (rb) {
    if (rb.alt && rb.alt.length) notes.push(`Variant habitual: ${rb.alt.join(', ')}.`);
    notes.push(`Base de dades reals: ${REAL_BUILDS_SRC}${rb.patch !== REAL_BUILDS_PATCH ? ' (aquest campió encara mostra dades del ' + rb.patch.replace('16.', '26.') + ')' : ''}.`);
  } else notes.push('Sense dades reals per a aquest campió i rol: plantilla per arquetip (comprova-la a u.gg).');
  if (role === 'Jg') notes.unshift(jgPlanNote(c, x));
  out.notes = notes;
  out.realData = !!rb;
  return out;
}
function isCoreW(a, it) { const n = v => String(v).split(' (')[0].trim(); return (a.core || []).some(k => n(k) === n(it)); }
function jgPlanNote(c, x) {
  try {
    const info = enemyRoleInfo();
    const our = getAssignment(), lanes = ['Top', 'Mid', 'Bot'];
    const opp = r => { const i = ROLE_ORDER.indexOf(r), e = info.champs.map(z => ({ z, p: info.dist[z][i] })).sort((a, b) => b.p - a.p)[0]; return e && e.p >= 0.4 ? e.z : null; };
    const gankable = lanes.map(r => {
      const ally = our.roleChamp[ROLE_ORDER.indexOf(r)], e = opp(r);
      if (!ally || !e) return null;
      let s = 0; if (!hasTag(e, 'mob')) s += 2; if (hasTag(ally, 'eng') || hasTag(ally, 'combo')) s += 1.5; if (hasTag(ally, 'early')) s += 1; if (r === 'Bot' && our.roleChamp[4] && hasTag(our.roleChamp[4], 'eng')) s += 1.5;
      const m = muScore(ally, e); if (m.adv > 0) s += 1;
      return { r, e, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s);
    if (!gankable.length) return 'Ruta: comença pel costat de la línia amb més prioritat i juga al voltant del primer objectiu.';
    const g = gankable[0], other = g.r === 'Top' ? 'Bot' : 'Top';
    return `Ruta: full clear acabant a ${g.r} (gank nivell 3-4 contra ${g.e}${hasTag(g.e, 'mob') ? '' : ', que no té escapament'}); després controla el costat ${g.r === 'Top' ? 'de Grubs' : 'del Drac'} i no regalis l'altre (${other}) sense visió.`;
  } catch (e) { return ''; }
}

