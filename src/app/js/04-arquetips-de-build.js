// ================= ARQUETIPS DE BUILD =================
// Codi: TK tanc · TS tanc support · EN enchanter · MS mag support · MG mag · AA assassí AP · DA assassí AD (letalitat)
//       JG juggernaut · SK skirmisher AD · OH on-hit · AB bruiser AP · MK tirador
const ARCH_RAW = `
Aatrox|JG
Ahri|MG|b
Akali|AA
Akshan|MK
Alistar|TS
Ambessa|SK
Amumu|TK
Anivia|MG|p
Annie|MG|b
Aphelios|MK
Ashe|MK
Aurelion Sol|MG|p
Aurora|MG|b
Azir|MG|o
Bard|EN
Bel'Veth|OH
Blitzcrank|TS
Brand|MS|d
Braum|TS
Briar|SK
Caitlyn|MK
Camille|SK
Cassiopeia|MG|d
Cho'Gath|TK
Corki|MK
Darius|JG
Diana|AB|f
Doctor Mundo|TK
Draven|MK
Ekko|AA
Elise|AA
Evelynn|AA
Ezreal|MK
Fiddlesticks|MG|d
Fiora|SK
Fizz|AA
Galio|AB|f
Gangplank|SK
Garen|JG
Gnar|JG
Gragas|AB|m
Graves|SK
Gwen|AB|f
Hecarim|SK
Heimerdinger|MG|p
Hwei|MG|p
Illaoi|JG
Irelia|SK
Ivern|EN
Janna|EN
Jarvan IV|SK
Jax|SK
Jayce|SK
Jhin|MK
Jinx|MK
Kai'Sa|MK
Kalista|MK
Karma|EN
Karthus|MG|d
Kassadin|AA
Katarina|AA
Kayle|OH
Kayn|DA
Kennen|AB|m
Kha'Zix|DA
Kindred|MK
Kled|JG
Kog'Maw|OH
K'Sante|TK
LeBlanc|AA
Lee Sin|SK
Leona|TS
Lillia|AB|m
Lissandra|MG|b
Locke|AA
Lucian|MK
Lulu|EN
Lux|MS|p
Malphite|TK
Malzahar|MG|d
Maokai|TK
Master Yi|OH
Mel|MG|b
Milio|EN
Miss Fortune|MK
Mordekaiser|AB|f
Morgana|MS|p
Naafiri|DA
Nami|EN
Nasus|JG
Nautilus|TS
Neeko|MG|b
Nidalee|MG|p
Nilah|MK
Nocturne|DA
Nunu & Willump|TK
Olaf|JG
Orianna|MG|b
Ornn|TK
Pantheon|SK
Poppy|TK
Pyke|DA
Qiyana|DA
Quinn|SK
Rakan|TS
Rammus|TK
Rek'Sai|SK
Rell|TS
Renata Glasc|EN
Renekton|JG
Rengar|DA
Riven|SK
Rumble|AB|m
Ryze|MG|b
Samira|MK
Sejuani|TK
Senna|MK
Seraphine|EN
Sett|JG
Shaco|DA
Shen|TK
Shyvana|JG
Singed|AB|d
Sion|TK
Sivir|MK
Skarner|TK
Smolder|MK
Sona|EN
Soraka|EN
Swain|AB|d
Sylas|AB|f
Syndra|MG|b
Tahm Kench|TK
Taliyah|MG|b
Talon|DA
Taric|TS
Teemo|AB|m
Thresh|TS
Tristana|MK
Trundle|JG
Tryndamere|SK
Twisted Fate|MG|b
Twitch|OH
Udyr|JG
Urgot|JG
Varus|MK
Vayne|MK
Veigar|MG|b
Vel'Koz|MS|p
Vex|MG|b
Vi|SK
Viego|SK
Viktor|MG|p
Vladimir|AB|f
Volibear|JG
Warwick|JG
Wukong|SK
Xayah|MK
Xerath|MS|p
Xin Zhao|SK
Yasuo|SK
Yone|SK
Yorick|JG
Yunara|MK
Yuumi|EN
Zaahen|JG
Zac|TK
Zed|DA
Zeri|MK
Ziggs|MG|p
Zilean|MS
Zoe|MG|p
Zyra|MS|d
`;
const ARCH = {};
ARCH_RAW.trim().split('\n').forEach(l => {
  const [n, code, kind] = l.split('|');
  ARCH[n.trim()] = { code: code.trim(), kind: (kind || '').trim() };
});

(function validatePatchData() {
  const bad = [];
  Object.keys(PATCH_TIER).forEach(c => { if (!CHAMP_SET.has(c)) bad.push('tier:' + c); });
  Object.keys(PATCH_CHANGES).forEach(c => { if (!CHAMP_SET.has(c)) bad.push('canvi:' + c); });
  Object.keys(ARCH).forEach(c => { if (!CHAMP_SET.has(c)) bad.push('arch:' + c); });
  ALL_CHAMPS.forEach(c => { if (!ARCH[c]) bad.push('sense arquetip:' + c); });
  if (bad.length) console.warn('Dades de parc/build inconsistents:', bad);
})();

const HEALERS = new Set(['Soraka', 'Yuumi', 'Aatrox', 'Warwick', 'Vladimir', 'Sylas', 'Briar', 'Swain', 'Doctor Mundo', 'Olaf', 'Sona', 'Milio', 'Nami', 'Taric', 'Seraphine']);
const STRONG_HEAL = new Set(['Soraka', 'Yuumi', 'Aatrox', 'Warwick']);
const PEEL_TS = new Set(['Braum', 'Taric', 'Rakan']);
const PROTOPLASM = new Set(['Doctor Mundo', "Cho'Gath", 'Ornn']);
const ACTUALIZER = new Set(['Ryze', 'Cassiopeia', 'Anivia']);
const GUNBLADE = new Set(['Akali', 'Katarina']);
const BASTION = new Set(['Zed', "Kha'Zix", 'Qiyana']);
const FIENDHUNTER = new Set(['Zeri', 'Aphelios', 'Miss Fortune']);
const HEXOPTICS = new Set(['Caitlyn', 'Jinx', 'Senna']);
const DUSKDAWN = new Set(['Gwen', 'Diana', 'Kayle']);
const ENDLESS = new Set(['Aatrox', 'Riven', 'Hecarim']);
const BANDLE = new Set(['Rell', 'Braum', 'Nautilus']);
const CHASERS = new Set(['Darius', 'Nasus', 'Illaoi', 'Mordekaiser']);
const CONQ_ASSN = new Set(['Kayn', 'Nocturne']);

const TREE_OF = {
  'Press the Attack': 'Precision', 'Lethal Tempo': 'Precision', 'Fleet Footwork': 'Precision', 'Conqueror': 'Precision',
  'Electrocute': 'Domination', 'Dark Harvest': 'Domination', 'Hail of Blades': 'Domination',
  'Summon Aery': 'Sorcery', 'Arcane Comet': 'Sorcery', 'Deathfire Touch': 'Sorcery', "Stormraider's Surge": 'Sorcery',
  'Grasp of the Undying': 'Resolve', 'Aftershock': 'Resolve', 'Guardian': 'Resolve',
  'Glacial Augment': 'Inspiration', 'Unsealed Spellbook': 'Inspiration', 'First Strike': 'Inspiration'
};
const TREE_MINORS = {
  Precision: 'Triumph · Legend: Alacrity · Last Stand (o Cut Down contra frontline)',
  Domination: 'Taste of Blood · Grisly Mementos · Treasure Hunter',
  Sorcery: 'Manaflow Band · Transcendence · Gathering Storm',
  Resolve: 'Font of Life o Demolish · Bone Plating · Overgrowth',
  Inspiration: 'Magical Footwear · Biscuit Delivery · Cosmic Insight'
};

const BUILD_T = {
  TK: {
    label: 'Tanc / frontline', boots: 'Plated Steelcaps', start: "Doran's Helm + poció de vida",
    sh: { off: 'Ability Haste', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Magical Footwear · Approach Velocity'], ['Sorcery', 'Transcendence · Gathering Storm']],
    core: ['Sunfire Aegis', 'Kaenic Rookern', "Jak'Sho, The Protean"],
    vs: { ad: "Randuin's Omen / Thornmail", ap: 'Force of Nature / Spirit Visage', heal: 'Thornmail', dive: 'Frozen Heart', poke: 'Spirit Visage' },
    key: (c, role) => role === 'Top' ? ['Grasp of the Undying', 'sustain i vida màxima a la línia'] : ['Aftershock', 'engage i resistències en entrar als fights']
  },
  TS: {
    label: 'Tanc support / engage', boots: 'Ionian Boots of Lucidity', start: "Objecte de suport (la quest de suport l'actualitza) + poció de vida",
    sh: { off: 'Ability Haste', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Biscuit Delivery · Cosmic Insight'], ['Sorcery', 'Transcendence · Gathering Storm']],
    core: ['Zeke\'s Convergence', 'Locket of the Iron Solari', "Knight's Vow"],
    vs: { ad: 'Thornmail', ap: 'Force of Nature', heal: 'Thornmail', dive: "Knight's Vow (protegeix el carry)", poke: 'Locket of the Iron Solari', cc: "Mikael's Blessing (netejar l'aliat)" },
    key: (c, role, x) => {
      if (PEEL_TS.has(c)) return x.dive ? ['Guardian', 'peel contra el seu dive/assassins'] : ['Guardian', 'peel constant al carry'];
      if (x.dive && (c === 'Thresh')) return ['Guardian', 'protecció davant el seu dive'];
      return ['Aftershock', 'engage amb resistències'];
    }
  },
  EN: {
    label: 'Enchanter', boots: 'Ionian Boots of Lucidity', start: "Objecte de suport + poció de vida",
    sh: { off: 'Ability Haste', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Biscuit Delivery · Cosmic Insight'], ['Sorcery', 'Transcendence · Gathering Storm']],
    core: ['Whispering Circlet → Diadem of Songs', 'Ardent Censer', 'Staff of Flowing Water'],
    vs: { ad: 'Locket of the Iron Solari', ap: "Banshee's Veil", heal: 'Morellonomicon (anti-curació AP)', dive: 'Locket of the Iron Solari', poke: 'Moonstone Renewer', cc: "Mikael's Blessing" },
    key: (c, role, x) => {
      if (x.dive) return ['Guardian', 'peel contra el seu dive/assassins'];
      if (x.poke || x.B.mob <= 1) return ['Arcane Comet', 'poke a distància (més dany a rang llarg)'];
      return ['Summon Aery', 'escuts/poke constants sobre el carry'];
    }
  },
  MS: {
    label: 'Mag support', boots: "Sorcerer's Shoes", start: 'Objecte de suport + poció de vida',
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Biscuit Delivery · Cosmic Insight'], ['Sorcery', 'Transcendence · Gathering Storm']],
    core: ["Liandry's Torment", 'Horizon Focus', "Zhonya's Hourglass"],
    vs: { ad: "Zhonya's Hourglass", ap: "Banshee's Veil", heal: 'Morellonomicon', tank: 'Void Staff', squishy: 'Shadowflame', dive: "Zhonya's Hourglass", poke: 'Horizon Focus' },
    key: (c, role, x, kind) => {
      if (kind === 'd') return ['Deathfire Touch', 'el burn de dany sostingut escala amb mags DoT'];
      if (c === 'Morgana' || c === 'Zilean') return x.dive ? ['Summon Aery', 'escuts per sobreviure al dive'] : ['Summon Aery', 'escuts i poke segurs'];
      return ['Arcane Comet', 'poke a distància (més dany a rang llarg)'];
    }
  },
  MG: {
    label: 'Mag', boots: "Sorcerer's Shoes", start: "Doran's Ring + poció de vida",
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Magical Footwear · Cosmic Insight'], ['Sorcery', 'Manaflow Band · Gathering Storm']],
    core: ["Luden's Echo", 'Shadowflame', "Rabadon's Deathcap"],
    vs: { ad: "Zhonya's Hourglass", ap: "Banshee's Veil", heal: 'Morellonomicon', tank: 'Void Staff', squishy: 'Shadowflame', dive: "Zhonya's Hourglass", poke: 'Horizon Focus' },
    key: (c, role, x, kind) => {
      if (c === 'Azir') return x.tanky ? ['Lethal Tempo', 'on-hit sostingut contra frontline (Riot reforça Azir on-hit al 26.23)'] : ['Press the Attack', 'burst on-hit; Riot reforça Azir on-hit al 26.23'];
      if (kind === 'd') return ['Deathfire Touch', 'el burn de dany sostingut escala amb mags DoT'];
      if (kind === 'p') return ['Arcane Comet', 'poke a distància (més dany a rang llarg)'];
      return x.tanky ? ['Arcane Comet', 'dany sostingut contra equips amb frontline'] : ['Electrocute', 'burst contra objectius fràgils'];
    }
  },
  AA: {
    label: 'Assassí AP', boots: "Sorcerer's Shoes", start: "Doran's Ring + poció de vida",
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Magical Footwear · Approach Velocity'], ['Sorcery', 'Manaflow Band · Gathering Storm']],
    core: ["Luden's Echo", 'Shadowflame', "Rabadon's Deathcap"],
    vs: { ad: "Zhonya's Hourglass", ap: "Banshee's Veil", heal: 'Morellonomicon', tank: 'Void Staff', squishy: 'Shadowflame', dive: "Zhonya's Hourglass" },
    key: (c, role, x) => x.squishy ? ['Dark Harvest', 'snowball contra un equip sense frontline'] : ['Electrocute', 'burst per fer kill abans que reaccionin']
  },
  DA: {
    label: 'Assassí AD (letalitat)', boots: 'Ionian Boots of Lucidity', start: "Doran's Blade + poció de vida",
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Magical Footwear · Approach Velocity'], ['Precision', 'Triumph · Last Stand']],
    core: ["Youmuu's Ghostblade", 'Hubris', 'Bastionbreaker'],
    vs: { tank: "Serylda's Grudge", heal: 'Mortal Reminder / Executioner\'s Calling', dive: 'Edge of Night', cc: 'Edge of Night (bloqueja un hechizo)', ap: 'Maw of Malmortius', ad: 'Guardian Angel' },
    key: (c, role, x) => {
      if (CONQ_ASSN.has(c)) return ['Conqueror', 'duels sostinguts de jungla/línia'];
      return x.squishy ? ['Dark Harvest', 'snowball contra un equip fràgil'] : ['Electrocute', 'burst per fer kill ràpid'];
    }
  },
  JG: {
    label: 'Juggernaut / bruiser', boots: 'Plated Steelcaps', start: "Doran's Blade + poció de vida",
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Resolve', 'Bone Plating · Overgrowth'], ['Inspiration', 'Magical Footwear · Approach Velocity']],
    core: ['Stridebreaker', "Sterak's Gage", 'Black Cleaver'],
    vs: { ad: "Death's Dance", ap: 'Maw of Malmortius', heal: 'Mortal Reminder / Executioner\'s Calling', tank: "Lord Dominik's Regards", dive: 'Guardian Angel', poke: "Sterak's Gage" },
    key: (c, role, x) => {
      if (CHASERS.has(c) && x.kite) return ["Stormraider's Surge", 'perseguir un equip mòbil/de rang (record de Riot per a aquest campió)'];
      if (role === 'Top' && x.poke) return ['Grasp of the Undying', 'sustain contra el poke'];
      return ['Conqueror', 'duels i teamfights llargs'];
    }
  },
  SK: {
    label: 'Skirmisher AD', boots: 'Plated Steelcaps', start: "Doran's Blade + poció de vida",
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Resolve', 'Bone Plating · Overgrowth'], ['Inspiration', 'Magical Footwear · Approach Velocity']],
    core: ['Stridebreaker', 'Sundered Sky', "Death's Dance"],
    vs: { ad: "Death's Dance", ap: 'Maw of Malmortius', heal: 'Mortal Reminder / Executioner\'s Calling', tank: 'Black Cleaver', dive: 'Guardian Angel', cc: 'Edge of Night' },
    key: (c, role, x) => {
      if (x.squishy && (c === 'Lee Sin' || c === 'Pantheon')) return ['Electrocute', 'burst contra un equip sense frontline'];
      return ['Conqueror', 'duels sostinguts i bon sustain'];
    }
  },
  OH: {
    label: 'On-hit', boots: "Berserker's Greaves", start: "Doran's Blade + poció de vida",
    sh: { off: 'Attack Speed', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Resolve', 'Bone Plating · Overgrowth'], ['Inspiration', 'Magical Footwear · Biscuit Delivery']],
    core: ['Blade of the Ruined King', 'Statikk Shiv', "Nashor's Tooth"],
    vs: { tank: 'Blade of the Ruined King', heal: 'Mortal Reminder', ad: 'Guardian Angel', ap: 'Maw of Malmortius', dive: 'Guardian Angel' },
    key: () => ['Lethal Tempo', 'atac sostingut: màxim dany on-hit']
  },
  AB: {
    label: 'Bruiser AP', boots: "Mercury's Treads", start: "Doran's Ring + poció de vida",
    sh: { off: 'Adaptive Force', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Inspiration', 'Magical Footwear · Cosmic Insight'], ['Resolve', 'Bone Plating · Overgrowth']],
    core: ["Liandry's Torment", 'Rod of Ages', "Zhonya's Hourglass"],
    vs: { ad: "Zhonya's Hourglass", ap: 'Spirit Visage', heal: 'Morellonomicon', tank: 'Void Staff', dive: "Zhonya's Hourglass", poke: 'Spirit Visage' },
    key: (c, role, x, kind) => {
      if (kind === 'd') return ['Deathfire Touch', 'el burn de dany sostingut beneficia els DoT'];
      if (kind === 'f') return CHASERS.has(c) && x.kite ? ["Stormraider's Surge", 'perseguir un equip mòbil/de rang'] : ['Conqueror', 'duels llargs amb sustain'];
      return x.squishy ? ['Electrocute', 'burst contra un equip fràgil'] : ['Arcane Comet', 'dany a distància contra frontline'];
    }
  },
  MK: {
    label: 'Tirador', boots: "Berserker's Greaves", start: "Doran's Blade + poció de vida",
    sh: { off: 'Attack Speed', flex: 'Adaptive Force', def: 'Health Scaling' },
    sec: [['Domination', 'Taste of Blood · Treasure Hunter'], ['Precision', 'Presence of Mind · Legend: Alacrity'], ['Inspiration', 'Magical Footwear · Biscuit Delivery']],
    core: ['Kraken Slayer', 'Infinity Edge', 'Phantom Dancer'],
    vs: { tank: "Lord Dominik's Regards", heal: 'Mortal Reminder', dive: 'Guardian Angel', squishy: 'Rapid Firecannon', poke: 'Bloodthirster', ad: 'Guardian Angel', ap: 'Maw of Malmortius' },
    key: (c, role, x) => {
      if (c === "Kai'Sa") return x.tanky ? ['Lethal Tempo', 'atac sostingut contra frontline'] : ['Hail of Blades', 'burst d\'entrada contra un equip fràgil'];
      if (x.squishy) return ['Press the Attack', 'burst contra un equip sense frontline'];
      if (x.poke || x.dive) return ['Fleet Footwork', 'sustain i velocitat contra poke/dive'];
      return ['Lethal Tempo', 'dany sostingut'];
    }
  }
};

function archFor(c, role) {
  const d = ARCH[c];
  let a = d ? d.code : ({ Top: 'JG', Jg: 'SK', Mid: 'MG', Bot: 'MK', Sup: 'MS' })[role];
  if (role === 'Sup') {
    if (a === 'MG' || a === 'AA' || a === 'AB') a = 'MS';
    else if (a === 'TK') a = 'TS';
  }
  if (role === 'Mid' && (a === 'MS' || a === 'EN')) a = 'MG';
  if (role !== 'Sup' && a === 'TS') a = 'TK';
  return a;
}

function makeBuildCtx(our, enemy) {
  const A = teamProfile(our), B = teamProfile(enemy);
  const pure = (list, t, o) => list.filter(c => hasTag(c, t) && !hasTag(c, o)).length;
  // El tipus de dany es mesura només en qui el fa de debò (els tancs gairebé no compten)
  const dealers = enemy.filter(c => !['TK', 'TS'].includes((ARCH[c] || {}).code));
  const bAD = pure(dealers, 'ad', 'ap'), bAP = pure(dealers, 'ap', 'ad');
  const healers = enemy.filter(c => HEALERS.has(c));
  return {
    our, enemy, A, B, bAD, bAP, healers,
    adHeavy: B.n >= 3 && bAD >= 3 && bAD - bAP >= 2,
    apHeavy: B.n >= 3 && bAP >= 3 && bAP - bAD >= 2,
    tanky: B.front >= 2,
    squishy: B.n >= 3 && B.front === 0,
    dive: B.dive + B.assn >= 2,
    poke: B.poke >= 2,
    cc: B.eng + B.combo >= 3,
    heal: healers.length >= 2 || healers.some(c => STRONG_HEAL.has(c)),
    kite: B.rng >= 3 || B.mob >= 3
  };
}

function pickSecondary(list, primaryTree) {
  return list.find(([tree]) => tree !== primaryTree) || list[0];
}

function summonersFor(role, arch, x) {
  if (role === 'Jg') return 'Flash + Smite (imprescindible a la jungla)';
  if (role === 'Top') return x.heal ? 'Flash + Ignite (anti-curació a la línia)' : 'Flash + Teleport (flanqueig i pressió de mapa)';
  if (role === 'Mid') return x.dive && (arch === 'MG' || arch === 'MS') ? 'Flash + Barrier (contra el seu dive/assassins)' : 'Flash + Ignite';
  if (role === 'Bot') {
    if (x.dive) return 'Flash + Barrier (contra el seu dive/assassins)';
    if (x.cc) return 'Flash + Cleanse (contra molt CC en cadena)';
    if (x.poke) return 'Flash + Heal (contra el seu poke)';
    return 'Flash + Barrier';
  }
  if (x.dive) return 'Flash + Exhaust (contra el seu dive/assassins)';
  return x.heal ? 'Flash + Ignite (anti-curació)' : 'Flash + Ignite';
}

function bootsFor(c, role, arch, x, T) {
  let b = T.boots;
  if (x.apHeavy || x.cc) b = "Mercury's Treads";
  else if (x.adHeavy && ['TK', 'TS', 'JG', 'SK', 'OH', 'AB'].includes(arch)) b = 'Plated Steelcaps';
  else if (x.adHeavy && arch === 'MK' && x.dive) b = 'Plated Steelcaps';
  if (['JG', 'SK', 'OH'].includes(arch) && b === T.boots && !x.adHeavy && !x.apHeavy && !x.cc) b = 'Gluttonous Greaves (omnivamp) o ' + b;
  if (role === 'Mid') b += ' (o les botes de tier 3 de la quest de mid)';
  return b;
}

function adviseBuild__base(c, role, x) {
  const arch = archFor(c, role), T = BUILD_T[arch];
  const kind = (ARCH[c] || {}).kind || '';
  const [keystone, keyWhy] = T.key(c, role, x, kind);
  const tree = TREE_OF[keystone];
  const [secTree, secMinors] = pickSecondary(T.sec, tree);

  let core = [...T.core];
  if (arch === 'TK' && PROTOPLASM.has(c)) core[0] = 'Protoplasm Harness';
  if (arch === 'TS' && BANDLE.has(c)) core[0] = 'Bandlepipes';
  if (arch === 'MG' && ACTUALIZER.has(c)) core[0] = 'Actualizer';
  if (arch === 'MG' && ARCH[c] && ARCH[c].kind === 'd') { core[0] = "Liandry's Torment"; core[1] = 'Cryptbloom'; }
  if (arch === 'MG' && c === 'Azir') { core[0] = "Nashor's Tooth"; core[1] = 'Statikk Shiv'; core[2] = "Rabadon's Deathcap"; }
  if (arch === 'AA' && GUNBLADE.has(c)) core[0] = 'Hextech Gunblade';
  if (arch === 'DA' && BASTION.has(c)) core = ["Youmuu's Ghostblade", 'Bastionbreaker', 'Hubris'];
  if (arch === 'AB' && DUSKDAWN.has(c)) core[0] = 'Dusk and Dawn';
  if (arch === 'OH' && c === 'Kayle') { core[0] = 'Dusk and Dawn'; core[1] = "Nashor's Tooth"; core[2] = "Rabadon's Deathcap"; }
  if (arch === 'JG' && ENDLESS.has(c)) core[0] = 'Endless Hunger';
  if (arch === 'SK' && ENDLESS.has(c)) core[0] = 'Endless Hunger';
  if (arch === 'MK' && FIENDHUNTER.has(c)) core[0] = 'Fiendhunter Bolts';
  if (arch === 'MK' && HEXOPTICS.has(c)) core[0] = 'Hexoptics C44';

  const conds = [
    ['ad', x.adHeavy, `rival majoritàriament AD (${x.bAD})`],
    ['ap', x.apHeavy, `rival majoritàriament AP (${x.bAP})`],
    ['heal', x.heal, `anti-curació contra ${x.healers.join(', ') || 'el seu sustain'}`],
    ['tank', x.tanky, 'rival amb molta frontline'],
    ['dive', x.dive, 'rival amb dive/assassins'],
    ['poke', x.poke, 'rival amb poke'],
    ['squishy', x.squishy, 'rival sense frontline'],
    ['cc', x.cc, 'rival amb molt CC/engage']
  ];
  const situ = [];
  conds.forEach(([k, on, why]) => {
    if (!on || !T.vs[k]) return;
    const prev = situ.find(z => z.item === T.vs[k]);
    if (prev) prev.why += ' + ' + why; else situ.push({ why, item: T.vs[k] });
  });

  const notes = [];
  const A = x.A;
  if (A.n >= 3 && A.front === 0) {
    if (['JG', 'SK', 'TK', 'AB', 'OH'].includes(arch)) notes.push('El vostre equip no té frontline: la fas tu; posa un objecte de vida/resistències al segon slot.');
    else if (arch === 'MK' || arch === 'DA') notes.push('Sense frontline aliada: prioritza supervivència (Guardian Angel / Immortal Shieldbow) abans del 4t objecte de dany.');
    else if (['MG', 'MS', 'AA'].includes(arch)) notes.push("Sense frontline aliada: Zhonya's Hourglass / Banshee's Veil abans d'un objecte de dany extra.");
  }
  if (arch === 'MK' && A.peel >= 2) notes.push('Teniu peel de sobres: pots maximitzar dany (Infinity Edge + penetració) sense gastar slots defensius.');
  if (arch === 'MK' && A.peel === 0 && A.n >= 3 && x.dive) notes.push('Sense peel i contra dive: la supervivència (Guardian Angel/Barrier) és prioritària.');
  if (['MG', 'MS'].includes(arch) && A.eng >= 2) notes.push('Teniu engage: busca dany en àrea i sostingut (Liandry\'s / Void Staff) un cop entreu.');
  if (['DA', 'SK'].includes(arch)) notes.push('Voltaic Cyclosword nerfejat al 26.23 (Firmament 8%/6%): millor Youmuu\'s, Hubris o Profane Hydra segons Riot.');
  const pc = PATCH_CHANGES[c];
  if (pc) notes.push(`📈 26.23 (${pc.delta > 0 ? 'buff' : 'nerf'}): ${pc.note}`);

  return {
    arch, label: T.label, keystone, keyWhy,
    primary: `${tree}: ${TREE_MINORS[tree]}`,
    secondary: `${secTree}: ${secMinors}`,
    shards: `Ofensiva: ${T.sh.off} · Flex: ${T.sh.flex} · Defensa: ${x.cc ? 'Tenacity and Slow Resist' : T.sh.def}`,
    summoners: summonersFor(role, arch, x),
    start: T.start,
    boots: bootsFor(c, role, arch, x, T),
    core, situ: situ.slice(0, 4), notes
  };
}

function uggUrl(c, role) {
  const special = { 'Nunu & Willump': 'nunu', 'Renata Glasc': 'renata', 'Wukong': 'wukong' };
  const slug = special[c] || c.toLowerCase().replace(/[^a-z]/g, '');
  const r = { Top: 'top', Jg: 'jungle', Mid: 'mid', Bot: 'adc', Sup: 'support' }[role];
  return `https://u.gg/lol/champions/${slug}/build/${r}`;
}


function renderPatchNotesHtml(s) {
  if (!s.patchNotes.length) {
    return `<div class="strat-card"><h4>📈 Canvis del 26.23 als vostres picks</h4><p>Cap dels campions d'aquest draft té canvis anunciats al 26.23.</p></div>`;
  }
  return `<div class="strat-card"><h4>📈 Canvis del 26.23 en aquest draft</h4>
    <ul>${s.patchNotes.map(p => `<li><strong>${escapeHtml(p.champ)}</strong> (${p.team}) <span style="color:${p.delta > 0 ? 'var(--green)' : '#FF8A9B'};">${p.delta > 0 ? '▲ buff' : '▼ nerf'}</span>: ${escapeHtml(p.note)}</li>`).join('')}</ul>
    <p style="color:var(--text-muted);font-size:0.72rem;margin-top:4px;">Preview oficial: els valors poden variar a les notes finals.</p></div>`;
}

function buildsDiscordText(s) {
  let t = `\n🛠️ **RUNES I BUILD (segons els dos drafts):**\n`;
  s.lanes.filter(l => l.build).forEach(l => {
    const b = l.build;
    t += `• **${l.role} ${l.champ}:** ${b.keystone} (${b.primary.split(':')[0]}) + ${b.secondary.split(':')[0]} | ${b.summoners.split(' (')[0]} | ${b.boots.split(' (')[0].split(' o ')[0]} → ${b.core.join(' → ')}`;
    if (b.order) t += ` | Ordre: ${b.order.map(o => o.item.split(' / ')[0].split(' (')[0]).join(' → ')}`;
    else if (b.situ.length) t += ` | Adapta: ${b.situ.map(z => z.item.split(' / ')[0].split(' (')[0]).join(', ')}`;
    t += `\n`;
  });
  return t;
}

function splitDiscord(text, limit = 1900) {
  const parts = [''];
  text.split('\n').forEach(line => {
    if ((parts[parts.length - 1] + line + '\n').length > limit) parts.push('');
    parts[parts.length - 1] += line + '\n';
  });
  return parts;
}

// ---- Pestanya amb el context del parc ----
function renderPatchTab() {
  const el = document.getElementById('patchContent');
  if (!el) return;
  const chg = Object.entries(PATCH_CHANGES).sort((a, b) => b[1].delta - a[1].delta);
  const tierRows = [['Top', 'T'], ['Jungle', 'J'], ['Mid', 'M'], ['ADC', 'B'], ['Support', 'S']].map(([label, k]) => {
    const t = TIER_RAW[k];
    return `<tr><td><strong>${label}</strong></td><td style="color:var(--gold);">${t['S+'].join(', ')}</td><td>${t['S'].join(', ')}</td><td style="color:var(--text-muted);">${t['A'].join(', ')}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <div class="panel-header"><span>📈 Context del parc ${PATCH_META.patch} (${PATCH_META.date})</span></div>
    <p style="font-size:0.8rem;color:var(--orange);margin-bottom:10px;">${PATCH_META.note}</p>
    <h4 style="color:var(--gold);margin:8px 0;">Canvis de campions</h4>
    <table class="data-table"><thead><tr><th>Campió</th><th>Efecte</th><th>Detall</th></tr></thead><tbody>
    ${chg.map(([c, v]) => `<tr><td><strong>${escapeHtml(c)}</strong></td><td style="color:${v.delta > 0 ? 'var(--green)' : '#FF8A9B'};">${v.delta > 0 ? '▲ buff' : '▼ nerf'}</td><td style="font-size:0.78rem;">${escapeHtml(v.note)}</td></tr>`).join('')}
    </tbody></table>
    <h4 style="color:var(--gold);margin:14px 0 8px;">Objectes, runes i sistemes</h4>
    <ul style="font-size:0.8rem;padding-left:18px;">${PATCH_ITEM_NOTES.map(n => `<li style="margin-bottom:4px;">${escapeHtml(n)}</li>`).join('')}</ul>
    <h4 style="color:var(--gold);margin:14px 0 4px;">Meta per rol (tier list 26.23, Skill Capped)</h4>
    <p style="font-size:0.74rem;color:var(--text-muted);margin-bottom:6px;">${PATCH_META.tierNote} Puntuació usada: S+ = +10, S = +6, A = +2 a les recomanacions.</p>
    <table class="data-table"><thead><tr><th>Rol</th><th>S+</th><th>S</th><th>A</th></tr></thead><tbody>${tierRows}</tbody></table>
    <h4 style="color:var(--gold);margin:14px 0 4px;">Fonts</h4>
    <ul style="font-size:0.76rem;padding-left:18px;">
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-23-notes/">Notes oficials del 26.23 (Riot)</a>, <a style="color:var(--blue);" target="_blank" rel="noopener" href="https://gameriv.com/league-of-legends-patch-26-23-preview/">preview (GameRiv)</a> i <a style="color:var(--blue);" target="_blank" rel="noopener" href="https://draftcoach.gg/patch-notes/26-23/">DraftCoach</a></li>
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://www.skill-capped.com/lol/guides/stats">Tier list 26.23 (Skill Capped, Emerald+)</a></li>
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-9-notes">Notes oficials 26.9: runes, botes i objectes de la Season 2</a></li>
      <li><a style="color:var(--blue);" target="_blank" rel="noopener" href="https://wecoach.gg/blog/article/every-new-item-in-lol-season-2026">Objectes nous de la temporada 2026 (WeCoach)</a></li>
    </ul>`;
}

