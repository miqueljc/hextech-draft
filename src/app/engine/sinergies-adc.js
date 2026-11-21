// ===== Sinergies individuals i arquetips d'ADC (vídeo Coach Rogue: "Champion Select Secrets") =====
const _cs = a => new Set(a.map(canonChamp).filter(Boolean));
const ENGAGE_ADC = _cs(['Samira', 'Draven', 'Nilah', 'Kalista']);
const POKE_ADC = _cs(['Caitlyn', 'Ezreal', 'Varus']);
const NEUTRAL_PICKS = _cs(['Jinx', 'Aphelios', 'Syndra', 'Ahri', 'Orianna', 'Ornn', 'Shen', 'Jarvan IV', 'Vi', 'Karma', 'Seraphine', 'Nami', 'Diana', 'LeBlanc']);
const ANTI_PAIRS = [['Karthus', 'Lulu', 'Karthus no aprofita la velocitat d\'atac de Lulu'], ['Samira', 'Soraka', 'Samira necessita un suport engage'], ['Samira', 'Lulu', 'Samira necessita un suport engage'], ['Samira', 'Janna', 'Samira necessita un suport engage']]
  .map(([a, b, w]) => [canonChamp(a), canonChamp(b), w]).filter(x => x[0] && x[1]);
function styleRules2(c, ally, allyProf, enemyProf, add) {
  const t = tag => hasTag(c, tag), cr = champRoles(c);
  // ADC ↔ suport: arquetips (Samira només amb engage, Caitlyn amb poke/enchanter, Jinx/Aphelios neutres)
  const adc = ally.find(a => champRoles(a).includes('Bot') && !champRoles(a).includes('Sup'));
  const sup = ally.find(a => champRoles(a).includes('Sup') && !champRoles(a).includes('Bot'));
  if (adc && cr.includes('Sup') && !cr.includes('Bot')) {
    if (ENGAGE_ADC.has(adc)) { if (t('eng')) add(5, `${adc} només funciona bé amb suport engage`, 'own'); else if (t('peel')) add(-5, `${adc} queda sense engage amb un enchanter`); }
    if (POKE_ADC.has(adc)) { if (t('poke') || (t('peel') && !t('eng'))) add(3, `${adc} vol suport de poke/enchanter`, 'own'); else if (t('eng') && !t('peel')) add(-2, `suport all-in que no encaixa amb el poke de ${adc}`); }
  }
  if (sup && cr.includes('Bot') && !cr.includes('Sup')) {
    if (ENGAGE_ADC.has(c)) { if (hasTag(sup, 'eng')) add(4, `${c} aprofita l'engage de ${sup}`, 'own'); else if (hasTag(sup, 'peel')) add(-5, `${c} necessita engage i el vostre suport és ${sup}`); }
    if (NEUTRAL_PICKS.has(c)) add(1, 'ADC neutral: encaixa amb engage o enchanter', 'own');
  }
  // Sinergies de parella explícites negatives
  ally.forEach(a => ANTI_PAIRS.forEach(([x, y, why]) => { if ((x === a && y === c) || (y === a && x === c)) add(-6, why); }));
  // Jungla ↔ suport (els dos rols que més pesen a skirmishes i objectius)
  const jg = ally.find(a => champRoles(a).length === 1 && champRoles(a)[0] === 'Jg');
  if (jg && cr.includes('Sup') && !cr.includes('Jg')) {
    if (hasTag(jg, 'early') && t('eng')) add(3, `suport engage per al jungla early ${jg}`, 'own');
    if (hasTag(jg, 'early') && t('scale') && !t('early') && !t('eng')) add(-3, `suport passiu de late amb el jungla agressiu ${jg}`);
  }
  if (sup && cr.length === 1 && cr[0] === 'Jg' && hasTag(sup, 'eng') && t('early')) add(3, `jungla early que aprofita l'engage de ${sup}`, 'own');
  // Blind pick: neutral (no et lliga a un estil ni et poden counterpickejar com a one-dimensional)
  if (ally.length <= 1) {
    if (NEUTRAL_PICKS.has(c)) add(3, 'pick neutral: no us compromet amb un estil de comp (vídeo)');
    else if (ENGAGE_ADC.has(c)) add(-3, 'depèn d\'un suport engage: els vostres propis companys el poden "counterpickejar"');
  }
  // Counters d'estil (Darius/Vayne): kiting contra equips melee; però el pick "dolent" funciona si els aliats cobreixen la debilitat
  if (enemyProf.n >= 3) {
    if (enemyProf.melee >= 4 && t('rng') && t('mob') && t('ad')) add(3, 'kitea el seu equip melee');
    if (!t('rng') && !t('mob') && cr.includes('Top') && enemyProf.rng >= 3 && enemyProf.eng + enemyProf.combo >= 2) {
      if (allyProf.rng >= 2 && allyProf.front >= 2) add(2, 'immòbil contra el seu abast, però els vostres carries els superen d\'abast i els tancs els obliguen a entrar (com Darius a BDS)');
      else add(-3, 'immòbil: el kitegen amb abast i CC i mai arriba a ells');
    }
  }
}

// ---- Motor de sinergies: dades externes + etiquetes (cada campió en té 1-3 si en queden de disponibles) ----
const STRUCT_SYN = [
  [x => hasTag(x, 'eng') || hasTag(x, 'dive'), c => hasTag(c, 'rng') && hasTag(c, 'scale'), 2, 'carry que segueix la seva iniciació'],
  [x => hasTag(x, 'eng'), c => hasTag(c, 'combo'), 3, 'ulti en àrea després de la seva iniciació'],
  [x => hasTag(x, 'combo'), c => hasTag(c, 'eng'), 3, 'iniciació que activa el seu ulti'],
  [x => hasTag(x, 'peel'), c => hasTag(c, 'scale') && (hasTag(c, 'ad') || hasTag(c, 'rng')), 3, 'carry que escala protegit'],
  [x => hasTag(x, 'scale') && hasTag(x, 'rng'), c => hasTag(c, 'peel'), 3, 'peel per escalar amb seguretat'],
  [x => hasTag(x, 'assn') || hasTag(x, 'dive'), c => hasTag(c, 'eng'), 3, 'engage/CC que li dóna accés'],
  [x => hasTag(x, 'poke'), c => hasTag(c, 'peel') || hasTag(c, 'front'), 2, 'el protegeix mentre fa poke'],
  [x => hasTag(x, 'front'), c => hasTag(c, 'rng') && hasTag(c, 'scale'), 2, 'carry que aprofita la seva frontline'],
  [x => hasTag(x, 'split'), c => hasTag(c, 'eng') || hasTag(c, 'mob'), 1, 'equip que aguanta mentre ell fa split'],
  [x => hasTag(x, 'ad') && !hasTag(x, 'ap'), c => hasTag(c, 'ap') && !hasTag(c, 'ad'), 1, 'complementa el dany (AD/AP)'],
  [x => hasTag(x, 'ap') && !hasTag(x, 'ad'), c => hasTag(c, 'ad') && !hasTag(c, 'ap'), 1, 'complementa el dany (AD/AP)']
];
const LANE_PAIR = [['Bot', 'Sup'], ['Jg', 'Mid'], ['Jg', 'Sup'], ['Jg', 'Top']];


