// ===== Bloc L: personalització de runes i objectes per a ESTA partida =====
const T_BURST_AP = new Set(['LeBlanc', 'Fizz', 'Akali', 'Katarina', 'Evelynn', 'Syndra', 'Veigar', 'Annie', 'Brand', 'Lux', 'Zoe', 'Vex', 'Neeko', 'Sylas', 'Diana', 'Ekko', 'Elise', 'Nidalee', 'Karthus', 'Ahri', 'Hwei', 'Xerath', "Vel'Koz", 'Ziggs', 'Mel', 'Aurora', 'Kassadin', 'Orianna']);
const T_BURST_AD = new Set(['Zed', 'Talon', 'Qiyana', "Kha'Zix", 'Rengar', 'Naafiri', 'Pyke', 'Shaco', 'Akshan', 'Samira']);
const T_SUPPRESS = new Set(['Warwick', 'Skarner', 'Malzahar', 'Urgot']);
const T_CHAIN_CC = new Set(['Nautilus', 'Leona', 'Rell', 'Blitzcrank', 'Amumu', 'Sejuani', 'Lissandra', 'Morgana', 'Zyra', 'Thresh', 'Alistar', 'Maokai', 'Ornn', 'Malphite', 'Rammus', 'Skarner', 'Cassiopeia', 'Neeko']);
const T_BUSTERS = new Set(['Vayne', 'Fiora', "Kog'Maw", 'Gwen', 'Camille', 'Briar']);
const FRAGILE_ARCH = new Set(['MK', 'MG', 'MS', 'EN', 'AA', 'DA']);
const ROLE_TO_IDX = { Top: 0, Jg: 1, Mid: 2, Bot: 3, Sup: 4 };

function laneOppsFor(role) {
  try {
    const info = enemyRoleInfo(), r = ROLE_TO_IDX[role];
    return info.champs.map(e => ({ champ: e, prob: info.dist[e][r] })).filter(x => x.prob >= 0.3).sort((a, b) => b.prob - a.prob).slice(0, role === 'Bot' || role === 'Sup' ? 2 : 2);
  } catch (e) { return []; }
}
function namesOf(list, max = 3) { return list.slice(0, max).join(', ') + (list.length > max ? '…' : ''); }

function adaptBuildToGame(adv, c, role, x) {
  const arch = adv.arch, T = BUILD_T[arch], enemy = x.enemy || [], our = x.our || [];
  const fragile = FRAGILE_ARCH.has(arch), tankish = ['TK', 'TS'].includes(arch);
  const dealers = enemy.filter(e => !['TK', 'TS'].includes((ARCH[e] || {}).code));
  const adNames = dealers.filter(e => hasTag(e, 'ad') && !hasTag(e, 'ap')), apNames = dealers.filter(e => hasTag(e, 'ap') && !hasTag(e, 'ad'));
  const bAD = enemy.filter(e => T_BURST_AD.has(e)), bAP = enemy.filter(e => T_BURST_AP.has(e));
  const susp = enemy.filter(e => T_SUPPRESS.has(e));
  const chain = enemy.filter(e => T_CHAIN_CC.has(e) || hasTag(e, 'eng'));
  const frontN = enemy.filter(e => hasTag(e, 'front'));
  const diveN = enemy.filter(e => hasTag(e, 'dive') || hasTag(e, 'assn') || T_BURST_AD.has(e) || T_BURST_AP.has(e));
  const pokeN = enemy.filter(e => hasTag(e, 'poke'));
  const busters = enemy.filter(e => T_BUSTERS.has(e));
  const peelMul = x.A && x.A.peel >= 2 ? 0.75 : 1;

  // 1) Rivals de línia i matchup concret
  const opps = laneOppsFor(role);
  const oppTxt = opps.map(o => o.champ + (o.prob < 0.999 ? ` (${Math.round(o.prob * 100)}%)` : ''));
  const oppRanged = opps.some(o => hasTag(o.champ, 'rng')), oppMelee = opps.some(o => !hasTag(o.champ, 'rng'));
  const oppBurstAP = opps.some(o => T_BURST_AP.has(o.champ)), oppBurstAD = opps.some(o => T_BURST_AD.has(o.champ));
  const oppPoke = opps.some(o => hasTag(o.champ, 'poke')), oppTank = opps.some(o => hasTag(o.champ, 'front'));
  const real = opps.map(o => realMatchupNote(c, o.champ)).filter(Boolean);
  const laneInfo = opps.length ? `Rival de línia: ${oppTxt.join(' / ')}${real.length ? ' — ' + real.join('; ') : ''}.` : '';

  // 2) Necessitats (pesos) i objectes que les cobreixen
  const pr = [];
  const adW = adNames.length + 0.5 * dealers.filter(e => hasTag(e, 'ad') && hasTag(e, 'ap')).length;
  const apW = apNames.length + 0.5 * dealers.filter(e => hasTag(e, 'ad') && hasTag(e, 'ap')).length;
  const add = (k, w, why, who) => { if (w > 0 && T.vs[k]) pr.push({ k, w, item: T.vs[k], why: `${why}${who && who.length ? ' (' + namesOf(who) + ')' : ''}` }); };
  add('ad', adW >= 2 ? adW * (fragile ? 1.1 : 1) : 0, `dany majoritàriament AD`, adNames);
  add('ap', apW >= 2 ? apW * (fragile ? 1.1 : 1) : 0, `dany majoritàriament AP`, apNames);
  add('heal', x.healers.length >= 2 ? 3 : (x.healers.some(h => STRONG_HEAL.has(h)) ? 2.5 : 0), 'anti-curació', x.healers);
  add('tank', frontN.length >= 2 ? 1.5 + frontN.length * 0.7 : 0, 'molta frontline enemiga', frontN);
  add('dive', fragile ? (bAD.length + bAP.length) * 2.2 * peelMul + Math.max(0, diveN.length - bAD.length - bAP.length) : (diveN.length >= 2 ? diveN.length * 0.8 : 0), 'burst/dive que et pot matar en un combo', [...bAD, ...bAP].length ? [...bAD, ...bAP] : diveN);
  add('squishy', enemy.length >= 3 && frontN.length === 0 ? 2.5 : 0, 'rival sense frontline', []);
  add('poke', pokeN.length >= 2 ? pokeN.length * 1.3 : 0, 'poke constant', pokeN);
  add('cc', chain.length >= 3 ? chain.length * 1.1 : 0, 'CC encadenat', chain);
  // casos específics que no són a la plantilla
  if (susp.length && !tankish) pr.push({ k: 'qss', w: 3.2, item: 'Quicksilver Sash', why: `supressió/pick imparable (${namesOf(susp)}): neteja'l a temps` });
  if (busters.length && tankish) pr.push({ k: 'bust', w: 2.4, item: 'Frozen Heart / Randuin\'s Omen', why: `autoatacs que trenquen tancs (${namesOf(busters)})` });
  // fusiona objectes iguals i ordena per prioritat
  const merged = [];
  pr.sort((a, b) => b.w - a.w).forEach(p => {
    const m = merged.find(z => z.item === p.item);
    if (m) { m.w += p.w * 0.5; m.why += ' + ' + p.why; } else merged.push({ ...p });
  });
  const picks = merged.filter(p => p.w >= 1.6).slice(0, 3);

  // 3) Ordre de compra: core1, (botes), després alternant core/situacionals segons urgència
  const core = adv.core, order = [];
  const cw = i => coreWhy[i] ? ` · també respon a: ${coreWhy[i]}` : '';
  const slots = [core[1], core[2]];
  const late = [];
  const inCore = it => core.findIndex(k => k.split(' / ')[0].split(' (')[0] === it.split(' / ')[0].split(' (')[0]);
  const coreWhy = {};
  picks.forEach(p => { const ci = inCore(p.item); if (ci >= 0) { coreWhy[ci] = (coreWhy[ci] ? coreWhy[ci] + ' + ' : '') + p.why; return; } (p.w >= 4.5 ? order : late).push({ item: p.item, why: p.why, w: p.w, hot: p.w >= 4.5 }); });
  order.unshift({ item: core[0], why: 'primer objecte core: dispara el teu pla de joc' + cw(0) });
  if (order.length > 1) order[1].why = '⚠️ ' + order[1].why + ' — compra\'l abans del 2n core';
  if (slots[0]) order.push({ item: slots[0], why: 'segon core' + cw(1) });
  late.forEach((p, i) => { if (i === 0) order.push(p); });
  if (slots[1]) order.push({ item: slots[1], why: 'tercer core' + cw(2) });
  late.forEach((p, i) => { if (i > 0) order.push(p); });
  if (!picks.length) order.push({ item: 'Sense desviaments', why: 'cap amenaça clara que justifiqui sortir del core: segueix la plantilla' });
  const orderClean = order;

  // 4) Primera tornada i inici segons el rival de línia
  let firstBack = '';
  if (oppBurstAP && fragile && !tankish) firstBack = 'Primera tornada: Null-Magic Mantle abans de l\'objecte core (el teu rival de línia fa burst AP).';
  else if (oppBurstAD && fragile) firstBack = 'Primera tornada: Cloth Armor / Chain Vest parcial abans de l\'objecte core (el teu rival de línia fa burst AD).';
  else if (oppPoke && ['TK', 'JG', 'SK', 'OH', 'DA'].includes(arch)) firstBack = 'Primera tornada: component de vida/sustain (el rival et fa poke a la línia).';
  let start = adv.start;
  if (role === 'Top' && oppRanged && !oppBurstAP && !['MG', 'AA', 'AB'].includes(arch)) start = "Doran's Shield + poció de vida (el rival de línia et fa poke a distància)";
  else if (role === 'Top' && oppMelee && oppTank && ['JG', 'SK'].includes(arch)) start = "Doran's Blade + poció de vida (línia llarga contra un tanc: prioritza trade curt)";

  // 5) Runes i shards ajustades
  let primary = adv.primary, secondary = adv.secondary, shards = adv.shards;
  const rn = [];
  if (primary.includes('Last Stand (o Cut Down contra frontline)')) {
    const tankyEnemy = frontN.length >= 2 || oppTank;
    primary = primary.replace('Last Stand (o Cut Down contra frontline)', tankyEnemy ? 'Cut Down' : 'Last Stand');
    rn.push(tankyEnemy ? `Cut Down: el rival té frontline (${namesOf(frontN.length ? frontN : opps.map(o => o.champ))}).` : 'Last Stand: rival sense tancs grans, el dany extra a poca vida rendeix més.');
  }
  if (primary.includes('Font of Life o Demolish')) {
    const fl = oppRanged || oppPoke || pokeN.length >= 2;
    primary = primary.replace('Font of Life o Demolish', fl ? 'Font of Life' : 'Demolish');
    rn.push(fl ? 'Font of Life: aguantes el poke de la línia.' : 'Demolish: el rival de línia és melee/tanc i voldràs tombar torres aviat.');
  }
  if (!x.cc && fragile && (bAD.length + bAP.length) >= 2) shards = shards.replace(/Defensa: [^·]+/, 'Defensa: Health Scaling (dos assassins al seu equip)');
  if (x.cc && chain.length) rn.push(`Tenacity and Slow Resist: ${namesOf(chain)} t'encadenaran CC.`);

  // 6) Notes personalitzades
  const notes = [...adv.notes];
  if (laneInfo) notes.unshift(laneInfo);
  rn.forEach(t => notes.push('Runes: ' + t));
  if (firstBack) notes.push(firstBack);
  const dupBoots = adv.boots;
  return { ...adv, primary, secondary, shards, start, notes, order: orderClean.map(o => ({ item: o.item, why: o.why })), laneInfo, firstBack,
    situ: picks.map(p => ({ why: p.why, item: p.item })), boots: dupBoots };
}

function adviseBuild(c, role, x) {
  const b = templateBuild(c, role, x);
  try { return personalizeBuild(b, c, role, x); } catch (e) { console.warn('personalizeBuild', e); return b; }
}

