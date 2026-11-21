// ================= COUNTERS PER CAMPIÓ, TIPUS DE COMPOSICIÓ I PICKS EN SINTONIA =================
// Dades externes: enemic > els seus millors counters (rol de lane). Editable a Dades i Editors (2c).
// counters ampliats: de fàbrica = data.json (hextech_extcounters_v1), injectat al muntatge
const EXT_DEFAULT = EXT_COUNTERS_DEFAULT;
const EXT_SRC = {
  'Katarina': 'u.gg + LoLTheory (Mid)', 'Nocturne': 'nerfplz 26.19 (Jungla)',
  'Lissandra': 'Lolalytics 16.22 (Mid)', 'Yasuo': 'metabot.gg 26.22 + Skill-Capped (Mid)'
};
const EXT_COUNTERS = {};
function extToText() { return Object.entries(EXT_COUNTERS).map(([e, l]) => `${e} > ${l.join(', ')}`).join('\n'); }
function loadExtCounters() {
  Object.keys(EXT_COUNTERS).forEach(k => delete EXT_COUNTERS[k]);
  const src = lsGet(LS.ext) || EXT_DEFAULT;
  Object.entries(src).forEach(([k, v]) => { const c = canonChamp(k); if (c) EXT_COUNTERS[c] = v.map(canonChamp).filter(Boolean); });
}
function resetExt() { lsSet(LS.ext, null); afterDataChange(); setMsg('extMsg', 'Restaurat al per defecte.'); }

// ---- Counters estructurals (valen per a tots els campions, segons etiquetes) ----
const STRUCT_RULES = [
  [e => hasTag(e, 'assn'), c => hasTag(c, 'front'), 3, 'tanc: el seu burst no el mata'],
  [e => hasTag(e, 'rng') && !hasTag(e, 'front') && !hasTag(e, 'mob'), c => hasTag(c, 'dive') || hasTag(c, 'assn') || hasTag(c, 'eng'), 3, 'arriba al seu squishy sense mobilitat'],
  [e => hasTag(e, 'poke'), c => hasTag(c, 'eng') || hasTag(c, 'dive'), 3, 'tanca la distància al seu poke'],
  [e => hasTag(e, 'eng') && !hasTag(e, 'mob'), c => hasTag(c, 'peel') || hasTag(c, 'mob'), 2, 'peel/mobilitat contra el seu engage'],
  [e => hasTag(e, 'scale') && !hasTag(e, 'early'), c => hasTag(c, 'early'), 3, 'el pressiona abans que escali'],
  [e => hasTag(e, 'early') && !hasTag(e, 'scale'), c => hasTag(c, 'scale') || hasTag(c, 'front'), 2, 'aguanta l\'early i escala millor'],
  [e => hasTag(e, 'split'), c => hasTag(c, 'split') || hasTag(c, 'dive') || hasTag(c, 'eng'), 2, 'respon al splitpush'],
  [e => hasTag(e, 'mob') && !hasTag(e, 'front'), c => hasTag(c, 'eng') || hasTag(c, 'combo'), 2, 'CC en cadena contra un campió mòbil'],
  [e => hasTag(e, 'front') && !hasTag(e, 'eng'), c => hasTag(c, 'rng') && hasTag(c, 'poke'), 2, 'el desgasta des de lluny']
];

// ---- Tipus de composició (trifecta del vídeo: front-to-back / dive / pick-poke + guies) ----
const COMP_TYPES = {
  dive: { name: 'Dive', icon: '🗡️',
    response: 'Responeu amb front-to-back i peel: tancs i CC en cadena, no us agrupeu sense visió i guardeu el CC pels seus assassins. Un poke previ també els desgasta abans d\'iniciar. Objectes: Plated Steelcaps, Zhonya/Randuin segons el dany.',
    want: ['front', 'peel'], avoid: c => hasTag(c, 'rng') && !hasTag(c, 'front') && !hasTag(c, 'mob'), avoidTxt: 'massa vulnerable al seu dive' },
  pickpoke: { name: 'Pick / Poke', icon: '🎯',
    response: 'Cal dive o engage dur que tanqui la distància abans de rebre poke, o disengage + sostre. Evita front-to-back sense engage: quedaria outrangejat i sense forma d\'iniciar.',
    want: ['eng', 'dive'], avoid: c => hasTag(c, 'front') && !hasTag(c, 'eng') && !hasTag(c, 'dive') && !hasTag(c, 'mob'), avoidTxt: 'quedaria outrangejat pel seu poke' },
  engage: { name: 'Engage / Wombo', icon: '💥',
    response: 'Disengage, peel i poke per desgastar-los abans que tanquin (Janna, Azir...). Mobilitat per esquivar la iniciació, i no us agrupeu fora de visió. Mercs si el seu CC és molt.',
    want: ['peel', 'mob', 'poke'], avoid: c => hasTag(c, 'rng') && !hasTag(c, 'mob') && !hasTag(c, 'peel'), avoidTxt: 'sense escapament contra el seu engage' },
  frontback: { name: 'Front-to-back', icon: '🛡️',
    response: 'Pick/poke que els outrangi (no tenen com iniciar) o splitpush. Evita dive sense engage suficient: cau contra els seus tancs i peel.',
    want: ['poke', 'split'], avoid: c => hasTag(c, 'dive') && !hasTag(c, 'eng'), avoidTxt: 'el dive cau contra el seu front-to-back' },
  split: { name: 'Splitpush', icon: '↔️',
    response: 'Teniu un splitter propi o agrupeu-vos per tancar un objectiu (Baró/torres) mentre ells són lluny; TP i visió als laterals.',
    want: ['split', 'eng'], avoid: () => false, avoidTxt: '' },
  protect: { name: 'Protect the carry', icon: '✨',
    response: 'Assassins/dive que aïllin el carry, forçar baralles abans dels seus objectes clau i ferides greus contra les cures.',
    want: ['assn', 'dive', 'early'], avoid: c => hasTag(c, 'peel') && !hasTag(c, 'eng') && !hasTag(c, 'scale') && false, avoidTxt: '' }
};
// qui guanya a qui (vídeo: front-to-back > dive > pick/poke > front-to-back)
const COMP_BEATS = { frontback: ['dive', 'engage'], dive: ['pickpoke', 'protect'], pickpoke: ['frontback'] };
function classifyComp(p) {
  if (!p || p.n < 2) return [];
  const out = [];
  if (p.dive + p.assn >= 2 && p.melee >= Math.ceil(p.n / 2)) out.push({ id: 'dive', s: p.dive + p.assn * 1.5 });
  if (p.poke >= 2 || (p.rng >= 3 && p.front <= 1)) out.push({ id: 'pickpoke', s: p.poke * 1.5 + p.rng * 0.5 });
  if (p.eng >= 2) out.push({ id: 'engage', s: p.eng + p.combo });
  if (p.front >= 2 && p.dive < 2 && p.poke < 2) out.push({ id: 'frontback', s: p.front + p.peel });
  if (p.split >= 2) out.push({ id: 'split', s: p.split * 1.2 });
  if (p.peel >= 2 && p.scale >= 1) out.push({ id: 'protect', s: p.peel + p.scale });
  return out.sort((a, b) => b.s - a.s).map(x => ({ ...COMP_TYPES[x.id], id: x.id, strength: x.s, sure: p.n >= 3 }));
}
// Valor d'objectes (vídeo): no apilar campions que responen al mateix objecte
function itemValueNotes(B) {
  const n = [];
  if (B.n >= 3 && B.eng + B.combo >= 3) n.push('Molt CC rival → els Mercs seran obligatoris per a ells: els campions que depenen d\'un sol burst/CC (p. ex. Syndra, Leona) perden valor; els autoatacants que exploten que no portin Steelcaps en guanyen.');
  if (B.n >= 3 && B.ad >= 3 && B.ap <= 1) n.push('Equip rival quasi tot AD → l\'armadura (Steelcaps, Frozen Heart) és molt eficient: preferiu tancs i evitar apilar autoatacants vostres.');
  if (B.n >= 3 && B.ap >= 3 && B.ad <= 1) n.push('Equip rival quasi tot AP → la MR (Mercs, Force of Nature) és molt eficient: els tancs rendiran molt.');
  return n;
}
const OWN_WANT = { dive: ['dive', 'eng', 'assn', 'front'], pickpoke: ['poke', 'rng', 'peel'], engage: ['combo', 'front', 'peel', 'eng'],
  frontback: ['front', 'peel', 'rng', 'scale'], split: ['split', 'eng'], protect: ['peel', 'scale', 'front'] };
const OWN_AVOID = {
  dive: c => hasTag(c, 'poke') && !hasTag(c, 'eng') && !hasTag(c, 'dive'),
  pickpoke: c => !hasTag(c, 'rng') && !hasTag(c, 'eng') && !hasTag(c, 'dive') && !hasTag(c, 'peel')
};
// Regles de recomanació de pick segons estil de comp, sinergia jungla/suport i valor d'objectes
function styleRules(c, ally, allyProf, enemyProf, add) {
  const t = tag => hasTag(c, tag);
  const et = classifyComp(enemyProf)[0], at = classifyComp(allyProf)[0];
  if (et && enemyProf.n >= 2) {
    if (et.want.some(g => t(g))) add(enemyProf.n >= 3 ? 4 : 2, `respon al seu estil ${et.name}`, 'vs');
    if (et.avoid(c)) add(-3, et.avoidTxt);
  }
  if (at && allyProf.n >= 2) {
    const w = (OWN_WANT[at.id] || []).filter(g => t(g)).length;
    if (w) add(Math.min(6, 2 + w * 2), `en sintonia amb la vostra comp ${at.name}`, 'own');
    else if (OWN_AVOID[at.id] && OWN_AVOID[at.id](c)) add(-4, `desubicat a la vostra comp ${at.name}`);
  }
  const cr = champRoles(c);
  // Jungla agressiu: necessita CC/setup dels laners (vídeo)
  const jg = ally.find(a => { const r = champRoles(a); return r.length === 1 && r[0] === 'Jg' && hasTag(a, 'early'); });
  if (jg && !cr.includes('Jg')) {
    if (t('eng') && allyProf.eng <= 1) add(4, `dóna CC/setup al jungla agressiu (${jg})`, 'own');
    else if (t('scale') && !t('early') && (cr.includes('Sup') || cr.includes('Mid'))) add(-2, `massa passiu amb ${jg} (vol early)`);
  }
  // Duo bot + suport
  const adc = ally.find(a => champRoles(a).includes('Bot') && !champRoles(a).includes('Sup'));
  const sup = ally.find(a => champRoles(a).includes('Sup') && !champRoles(a).includes('Bot'));
  if (adc && cr.includes('Sup') && !cr.includes('Bot')) {
    if ((hasTag(adc, 'dive') || hasTag(adc, 'early')) && t('eng')) add(3, `engage que posa en marxa ${adc}`, 'own');
    if (hasTag(adc, 'scale') && !hasTag(adc, 'early') && t('peel') && !t('eng')) add(3, `peel/enchanter per escalar ${adc}`, 'own');
  }
  if (sup && cr.includes('Bot') && !cr.includes('Sup')) {
    if (hasTag(sup, 'eng') && (t('dive') || t('early'))) add(3, `s'aprofita de l'engage de ${sup}`, 'own');
    if (hasTag(sup, 'peel') && !hasTag(sup, 'eng') && t('scale')) add(3, `escala protegit per ${sup}`, 'own');
  }
  // Valor d'objectes: contra molt CC, el burst dependent d'un sol CC rendeix menys; contra tot AD/AP, tancs
  if (enemyProf.n >= 3) {
    if (enemyProf.eng + enemyProf.combo >= 3) {
      if (t('ap') && (t('combo') || t('assn'))) add(-3, 'els Mercs rivals el neutralitzen');
      if (t('ad') && t('rng') && !t('combo')) add(2, 'autoatacant: explota que paguin Mercs en lloc de Steelcaps');
    }
    if (enemyProf.ad >= 3 && enemyProf.ap <= 1 && t('front')) add(3, 'l\'armadura rendeix molt contra el seu dany AD');
    if (enemyProf.ap >= 3 && enemyProf.ad <= 1 && t('front')) add(3, 'la MR rendeix molt contra el seu dany AP');
  }
}

