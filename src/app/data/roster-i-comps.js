
// ================= DADES REALS + DRAFT.XLSX =================
const ROSTER = [
  {
    name: "arnauklero#EUW",
    role: "Top",
    excelMains: ["Malphite", "Galio", "Ornn", "Sett", "Garen", "Darius"],
    opggHighlights: [
      { champ: "Malphite", wr: "54% WR (Flex/Premade)", bonus: 18 },
      { champ: "Ornn", wr: "53% WR (Frontline fiable)", bonus: 15 }
    ],
    pool: ["Malphite", "Galio", "Ornn", "Sett", "Garen", "Darius", "Teemo", "Shen", "Kled", "Nasus", "Kayle", "Illaoi", "Smolder", "Zaahen", "Tahm Kench", "Mordekaiser", "Gnar", "Volibear", "Doctor Mundo", "Jax", "Camille"]
  },
  {
    name: "StepOnMeEvelynn#EUW",
    role: "Jg",
    excelMains: ["Vi", "Evelynn", "Nocturne", "Zac", "Fiddlesticks", "Bel'Veth"],
    opggHighlights: [
      { champ: "Zaahen", wr: "55% WR (148 partides)", bonus: 25 },
      { champ: "Evelynn", wr: "51% WR (76 partides)", bonus: 15 },
      { champ: "Bel'Veth", wr: "50% WR (96 partides)", bonus: 12 }
    ],
    pool: ["Zaahen", "Mordekaiser", "Fiddlesticks", "Zac", "Qiyana", "Bel'Veth", "Amumu", "Evelynn", "Sion", "Rammus", "Aurelion Sol", "Malphite"]
  },
  {
    name: "RoninKamui66#PIXAR",
    role: "Mid",
    excelMains: ["Vex", "Ahri", "Diana", "Galio", "Lissandra", "Veigar"],
    opggHighlights: [
      { champ: "Vex", wr: "60% WR en Premade", bonus: 18 },
      { champ: "Ahri", wr: "55% WR en Premade", bonus: 15 }
    ],
    pool: ["Vex", "Ahri", "Diana", "Galio", "Ekko", "Lissandra", "Yasuo", "LeBlanc", "Yone", "Veigar", "Sylas", "Malzahar", "Malphite", "Naafiri", "Neeko", "Lux"]
  },
  {
    name: "vpa2134#EUW",
    role: "Bot",
    excelMains: ["Caitlyn", "Miss Fortune", "Jinx", "Kai'Sa", "Xayah"],
    opggHighlights: [
      { champ: "Kai'Sa", wr: "53% WR (146 partides - Main)", bonus: 22 },
      { champ: "Caitlyn", wr: "50% WR (130 partides - Main)", bonus: 18 }
    ],
    pool: ["Kai'Sa", "Caitlyn", "Miss Fortune", "Jinx", "Xayah", "Smolder", "Ziggs", "Jhin", "Yunara", "Ashe", "Varus", "Sivir", "Mel", "Ezreal"]
  },
  {
    name: "PiltoversTelecom#EUW",
    role: "Sup",
    excelMains: ["Nautilus", "Leona", "Braum", "Milio", "Morgana", "Thresh"],
    opggHighlights: [
      { champ: "Pyke", wr: "72% WR (32 partides - GOD TIER)", bonus: 30 },
      { champ: "Senna", wr: "54% WR (18+ partides)", bonus: 14 }
    ],
    pool: ["Pyke", "Nautilus", "Leona", "Braum", "Milio", "Morgana", "Seraphine", "Rell", "Zyra", "Thresh", "Senna", "Nami", "Bard", "Neeko", "Alistar", "Tahm Kench", "Poppy", "Karma", "Blitzcrank", "Janna", "Lux", "Lulu", "Shen", "Rakan"]
  }
];

const COMPS = [
  {
    id: 1,
    name: "Comp 1: Wombo Combo & Caçades",
    style: "Poca pressió línies, top independent, caçades, combo",
    roles: {
      Top: ["Malphite", "Galio"],
      Jg: ["Zac", "Amumu"],
      Mid: ["Diana", "Vex", "Galio"],
      Sup: ["Nautilus", "Leona", "Poppy"],
      Bot: ["Miss Fortune"]
    },
    goodAgainst: ["Front-to-Back", "Low mobility", "Jinx", "Caitlyn", "Ashe", "Veigar"],
    badAgainst: ["Peel", "Tanks", "Karma", "Soraka", "Morgana", "Braum", "Milio"],
    bans: ["Nocturne", "Poppy", "Morgana"],
    plan: {
      early: "Jugueu segur en línia fins a nivell 6. Malphite i Miss Fortune no necessiten guanyar 1v1; només farmar i esperar el gank amb ultis.",
      mid: "Busqueu caçades a la jungla rival amb Nautilus/Leona + Zac/Amumu. Forçar baralles als passadissos estrets de Drac i Herald.",
      late: "No lluitar mai sense l'Ultimate de Malphite o Miss Fortune. Espereu que el rival s'agrupi i encadeneu CC en àrea.",
      individual: {
        Top: "Aguanta l'onada sota torre i guarda el TP per flanquejar el 2n Drac.",
        Jg: "Prioritza ganks a Bot/Mid a partir de nivell 6 per accelerar la Miss Fortune.",
        Mid: "Empenta i rota amb el jungla; segueix l'engage amb Diana/Vex.",
        Bot: "Posiciona't lluny del rang d'engage rival i tira R només quan Nautilus o Malphite encertin el CC.",
        Sup: "Busca angles des de boira (sweeper) per iniciar sobre els carries sense mobilitat."
      }
    }
  },
  {
    id: 2,
    name: "Comp 2: Pressió de Línies & Jungle Carry",
    style: "Més pressió a línies, jg més carry (Zaahen / Fiddle)",
    roles: {
      Top: ["Kayle", "Ornn"],
      Jg: ["Fiddlesticks", "Zaahen"],
      Mid: ["Galio", "Vex"],
      Sup: ["Neeko", "Morgana", "Milio"],
      Bot: ["Miss Fortune"]
    },
    goodAgainst: ["Front-to-Back", "Melee comps", "Lee Sin", "Wukong"],
    badAgainst: ["Poke", "Peel", "Jinx", "Braum", "Xerath", "Ziggs"],
    bans: ["Braum", "Jinx"],
    plan: {
      early: "Doneu prioritat de línia a Mid/Bot perquè el Jungler (Zaahen/Fiddlesticks) pugui envair i controlar els crancs.",
      mid: "El vostre pic de poder més fort és entre els minuts 14 i 25. Controleu la visió al voltant d'Atakhan i Baró per emboscades.",
      late: "Si teniu Kayle, protegiu-la fins al nivell 16. Si teniu Ornn, milloreu els objectes de Zaahen i MF.",
      individual: {
        Top: "Amb Ornn juga per l'equip; amb Kayle evita morir abans del nivell 11.",
        Jg: "És la teva partida per carrejar: farmeja eficientment i entra des de flancs sense visió.",
        Mid: "Galio/Vex per donar cobertura i seguir l'entrada del jungla amb R.",
        Bot: "Pressiona la torre de bot per alliberar el support i controlar la visió del riu.",
        Sup: "Neeko/Morgana per assegurar el control de zona i bloquejar el peel rival."
      }
    }
  },
  {
    id: 3,
    name: "Comp 3: Front-to-Back Estàndard",
    style: "Línies independents, front to back clàssic",
    roles: {
      Top: ["Shen", "Ornn", "Galio", "Smolder"],
      Jg: ["Zaahen", "Mordekaiser", "Doctor Mundo"],
      Mid: ["Ahri", "Vex", "Galio"],
      Sup: ["Milio", "Nami", "Morgana"],
      Bot: ["Jinx", "Yunara", "Caitlyn"]
    },
    goodAgainst: ["Nocturne", "Melee dive", "Assassins", "Vi"],
    badAgainst: ["Combo", "Poke", "LeBlanc", "Malphite", "Ziggs"],
    bans: ["LeBlanc", "Kai'Sa", "Nocturne"],
    plan: {
      early: "Joc pausat. Botlane ha d'escalar i treure plaques amb Caitlyn/Jinx + Milio/Nami mentre Top juga amb Shen/Ornn.",
      mid: "Agrupeu-vos a mid per empènyer onades i preparar objectius amb 45 segons d'antelació.",
      late: "Guanyeu qualsevol teamfight 5v5 frontal si ningú no és caçat fora de posició. Protegiu l'ADC a tota costa.",
      individual: {
        Top: "Fes de mur frontal (frontline). Amb Shen, mira constantment el mapa per salvar l'ADC amb R.",
        Jg: "Juga davant de l'ADC absorbint dany i castigant el frontline rival amb Zaahen/Morde.",
        Mid: "Controla els flancs perquè ningú arribi fàcilment a la Jinx/Caitlyn.",
        Bot: "Pega sempre a l'objectiu més proper i segur; no facis flash endavant sense resets.",
        Sup: "Guarda tots els escuts i cures (Milio/Nami) exclusivament per a l'ADC."
      }
    }
  },
  {
    id: 4,
    name: "Comp 4: Dive & Rotació (Pyke/Kai'Sa God Comp)",
    style: "Caçades, jg-supp rotar, top independent, dive agressiu",
    roles: {
      Top: ["Kled", "Malphite"],
      Jg: ["Qiyana", "Evelynn", "Zac"],
      Mid: ["Vex", "Diana", "Ahri"],
      Sup: ["Pyke", "Nautilus", "Poppy"],
      Bot: ["Kai'Sa"]
    },
    goodAgainst: ["Squishy comps", "Low mobility", "Katarina", "Yasuo", "Jinx", "Lux"],
    badAgainst: ["Peel", "Tanks", "Poppy", "Taliyah", "Shen", "Lulu"],
    bans: ["Poppy", "Taliyah", "Shen"],
    plan: {
      early: "Aquesta és la vostra composició més letal segons estadístiques reals (Pyke 72% WR + Kai'Sa main). Busqueu kills al nivell 2-3 i al nivell 6.",
      mid: "Pyke + Jungla (Evelynn/Qiyana/Zac) han de dominar el mapa junts fent picks constants abans que surtin els objectius.",
      late: "No jugueu 5v5 frontals llargs. Busqueu flancs i que Kai'Sa entri amb R quan Vex/Diana/Pyke marquin un objectiu tou.",
      individual: {
        Top: "Juga aïllat (weakside) amb Malphite o busca dives amb Kled.",
        Jg: "Coordina't amb Pyke per envair la jungla rival i esborrar el Mid/ADC contrari.",
        Mid: "Vex/Diana per tenir prioritat de push i saltar amb la Kai'Sa al backline.",
        Bot: "Juga agressiu amb Kai'Sa; segueix qualsevol hook de Pyke amb W + R per rematar.",
        Sup: "Mou-te per tot el mapa des del nivell 3-4. Cerca angles amb W + E i assegura resets de R."
      }
    }
  },
  {
    id: 5,
    name: "Comp 5: Skirmish & Escalada de Línies",
    style: "Línies fortes, skirmish 2v2/3v3, bon late game",
    roles: {
      Top: ["Nasus", "Darius"],
      Jg: ["Bel'Veth", "Fiddlesticks"],
      Mid: ["Galio", "Sylas", "Ahri"],
      Sup: ["Seraphine", "Senna", "Neeko"],
      Bot: ["Ashe", "Caitlyn"]
    },
    goodAgainst: ["Melee comps", "No engage", "Viego", "Sion", "Vel'Koz"],
    badAgainst: ["Hard engage", "Combo", "Milio", "Yuumi", "Malphite"],
    bans: ["Milio", "Yuumi"],
    plan: {
      early: "Guanyeu les 3 línies per pressió. Ashe/Caitlyn + Senna/Seraphine castiguen sota torre mentre Bel'Veth pren els Larves del Buit (Grubs).",
      mid: "Aprofiteu l'avantatge d'or per fer snowball amb Bel'Veth i obrir totes les torres exteriors abans del minut 20.",
      late: "Dividiu el mapa (1-3-1 o 1-4) amb Nasus/Darius al splitpush i Ashe iniciant des de lluny amb la fletxa.",
      individual: {
        Top: "Domina el 1v1 i atreu 2 rivals al splitpush perquè l'equip faci Baró gratis.",
        Jg: "Prioritza Void Grubs i Herald per aprofitar que les teves línies tenen pressió.",
        Mid: "Sylas/Ahri/Galio per guanyar qualsevol escaramussa al riu 2v2.",
        Bot: "Utilitza la R d'Ashe per iniciar caçades a Mid o Top des de la teva línia.",
        Sup: "Poke constant i control d'onades per treure plaques ràpid."
      }
    }
  },
  {
    id: 6,
    name: "Comp 6: Anti-Dive & Peel Total (Xayah)",
    style: "Anti dive, peel absolut al carry",
    roles: {
      Top: ["Shen", "Teemo", "Tahm Kench"],
      Jg: ["Rammus", "Evelynn", "Mordekaiser"],
      Mid: ["Vex", "Veigar"],
      Sup: ["Milio", "Braum", "Poppy", "Rakan"],
      Bot: ["Xayah"]
    },
    goodAgainst: ["Hard engage", "Dive comps", "Nocturne", "Malphite", "Jarvan IV", "Zed"],
    badAgainst: ["Poke", "Long range", "Caitlyn", "Lux", "Xerath"],
    bans: ["Caitlyn", "Lux"],
    plan: {
      early: "Deixeu que el rival us empenyi. Xayah + Braum/Milio són gairebé impossibles de divejar.",
      mid: "Obligueu l'equip rival a venir cap a vosaltres als Dracs. La vostra composició brilla quan el rival intenta entrar.",
      late: "Tot gira al voltant de la Xayah. Si sobreviu a la primera onada d'engage rival, guanyeu la baralla per inèrcia.",
      individual: {
        Top: "Tahm Kench o Shen per salvar la Xayah si li salten a sobre.",
        Jg: "Rammus/Morde per frenar el bruiser o assassí principal de l'enemic.",
        Mid: "Vex/Veigar per posar la gàbia o tallar dashes quan l'enemic entri.",
        Bot: "Guarda la R de Xayah exclusivament per esquivar la habilitat clau de l'enemic (ex: R de Malphite/Nocturne).",
        Sup: "No iniciïs; queda't enganxat a la Xayah per aixecar escuts i aplicar CC defensiu."
      }
    }
  }
];

// Llista OFICIAL de campions (només campions reals; abans es barrejaven conceptes com "Peel" o "Front-to-Back")
const ALL_CHAMPS = ["Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Ambessa", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe", "Aurelion Sol", "Aurora", "Azir", "Bard", "Bel'Veth", "Blitzcrank", "Brand", "Braum", "Briar", "Caitlyn", "Camille", "Cassiopeia", "Cho'Gath", "Corki", "Darius", "Diana", "Doctor Mundo", "Draven", "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Hwei", "Illaoi", "Irelia", "Ivern", "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Kha'Zix", "Kindred", "Kled", "Kog'Maw", "K'Sante", "LeBlanc", "Lee Sin", "Leona", "Lillia", "Lissandra", "Locke", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi", "Mel", "Milio", "Miss Fortune", "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nilah", "Nocturne", "Nunu & Willump", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus", "Rek'Sai", "Rell", "Renata Glasc", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "Tahm Kench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz", "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin Zhao", "Yasuo", "Yone", "Yorick", "Yunara", "Yuumi", "Zaahen", "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"].sort((a, b) => a.localeCompare(b));
const CHAMP_SET = new Set(ALL_CHAMPS);

// Avís a la consola si alguna pool/comp té un nom que no és un campió vàlid (typos)
(function validateChampNames() {
  const used = new Set([
    ...ROSTER.flatMap(p => [...p.pool, ...p.excelMains, ...p.opggHighlights.map(h => h.champ)]),
    ...COMPS.flatMap(c => [...Object.values(c.roles).flat(), ...c.bans])
  ]);
  const bad = [...used].filter(c => !CHAMP_SET.has(c));
  if (bad.length) console.warn('Noms de campió no reconeguts:', bad);
})();

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Ordre oficial de torneig (20 passos)
const TOURNAMENT_ORDER = [
  { type: 'BAN', side: 'BLUE', index: 0, label: 'BB1 — Ban Blue (1)' },
  { type: 'BAN', side: 'RED', index: 0, label: 'RB1 — Ban Red (1)' },
  { type: 'BAN', side: 'BLUE', index: 1, label: 'BB2 — Ban Blue (2)' },
  { type: 'BAN', side: 'RED', index: 1, label: 'RB2 — Ban Red (2)' },
  { type: 'BAN', side: 'BLUE', index: 2, label: 'BB3 — Ban Blue (3)' },
  { type: 'BAN', side: 'RED', index: 2, label: 'RB3 — Ban Red (3)' },
  { type: 'PICK', side: 'BLUE', index: 0, label: 'BP1 — First Pick Blue' },
  { type: 'PICK', side: 'RED', index: 0, label: 'RP1 — Pick Red (1)' },
  { type: 'PICK', side: 'RED', index: 1, label: 'RP2 — Pick Red (2)' },
  { type: 'PICK', side: 'BLUE', index: 1, label: 'BP2 — Pick Blue (2)' },
  { type: 'PICK', side: 'BLUE', index: 2, label: 'BP3 — Pick Blue (3)' },
  { type: 'PICK', side: 'RED', index: 2, label: 'RP3 — Pick Red (3)' },
  { type: 'BAN', side: 'RED', index: 3, label: 'RB4 — Ban Red (4)' },
  { type: 'BAN', side: 'BLUE', index: 3, label: 'BB4 — Ban Blue (4)' },
  { type: 'BAN', side: 'RED', index: 4, label: 'RB5 — Ban Red (5)' },
  { type: 'BAN', side: 'BLUE', index: 4, label: 'BB5 — Ban Blue (5)' },
  { type: 'PICK', side: 'RED', index: 3, label: 'RP4 — Pick Red (4)' },
  { type: 'PICK', side: 'BLUE', index: 3, label: 'BP4 — Pick Blue (4)' },
  { type: 'PICK', side: 'BLUE', index: 4, label: 'BP5 — Pick Blue (5)' },
  { type: 'PICK', side: 'RED', index: 4, label: 'RP5 — Last Pick Red (Counter)' }
];

// Estat de l'aplicació
let state = {
  ourSide: 'BLUE',
  draftMode: 'ORDER', // ORDER | FREE
  fearless: false,
  fearlessLocked: [],
  blueBans: [null, null, null, null, null],
  redBans: [null, null, null, null, null],
  bluePicks: [null, null, null, null, null],
  redPicks: [null, null, null, null, null],
  activeSlot: { type: 'BAN', side: 'BLUE', index: 0 },
  history: [],
  roleFilter: 'ALL',
  selectedCompId: null,
  enemyOtps: [],
  assign: { manual: false, rolePlayer: [0, 1, 2, 3, 4], roleChamp: [null, null, null, null, null] },
  enemyLocks: {}
};

function pushHistory() {
  state.history.push(JSON.stringify({
    blueBans: [...state.blueBans],
    redBans: [...state.redBans],
    bluePicks: [...state.bluePicks],
    redPicks: [...state.redPicks],
    activeSlot: { ...state.activeSlot },
    assign: state.assign,
    enemyLocks: state.enemyLocks
  }));
}

const ROLE_ORDER = ['Top', 'Jg', 'Mid', 'Bot', 'Sup'];






function toggleFearless() {
  state.fearless = !state.fearless;
  renderAll();
}




function getUnavailableChamps(side) {
  return new Set([
    ...state.blueBans,
    ...state.redBans,
    ...state.bluePicks,
    ...state.redPicks,
    ...fearlessBlocked(side)
  ].filter(Boolean));
}

function selectSlot(type, side, index) {
  state.activeSlot = { type, side, index };
  renderAll();
}

function clearSlot(e, type, side, index) {
  e.stopPropagation();
  if (type === 'BAN') {
    if (side === 'BLUE') state.blueBans[index] = null;
    else state.redBans[index] = null;
  } else {
    if (side === 'BLUE') state.bluePicks[index] = null;
    else state.redPicks[index] = null;
  }
  state.activeSlot = { type, side, index };
  renderAll();
}


function undoLast() {
  if (!state.history.length) return;
  const prev = JSON.parse(state.history.pop());
  state.blueBans = prev.blueBans;
  state.redBans = prev.redBans;
  state.bluePicks = prev.bluePicks;
  state.redPicks = prev.redPicks;
  state.activeSlot = prev.activeSlot;
  if (prev.assign) state.assign = prev.assign;
  state.enemyLocks = prev.enemyLocks || {};
  renderAll();
}

