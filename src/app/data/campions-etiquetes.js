// ================= DADES TÀCTIQUES PER CAMPIÓ (editables) =================
// Format per línia: Nom|rols naturals (T J M B S)|etiquetes
// Etiquetes: front eng peel poke dive assn rng mob combo scale early split ap ad
// (sense 'rng' = campió melee). Són heurístiques: pots ajustar-les lliurement.
const CHAMP_DATA_RAW = `
Aatrox|T|ad front early eng
Ahri|M|ap rng mob assn
Akali|M T|ap mob assn dive
Akshan|M B|ad rng mob
Alistar|S|front eng peel
Ambessa|T|ad dive front early mob
Amumu|J|ap front eng combo
Anivia|M|ap rng poke scale peel
Annie|M S|ap rng eng combo
Aphelios|B|ad rng scale
Ashe|B|ad rng peel eng
Aurelion Sol|M|ap rng scale poke
Aurora|M T|ap rng mob assn
Azir|M|ap rng scale poke peel
Bard|S|ap rng peel eng
Bel'Veth|J|ad dive mob scale
Blitzcrank|S|ap eng rng
Brand|S M|ap rng poke combo
Braum|S|front peel eng
Briar|J|ad dive eng early
Caitlyn|B|ad rng poke early
Camille|T|ad dive mob eng
Cassiopeia|M|ap rng scale peel
Cho'Gath|J T|ap front eng
Corki|M B|ad rng poke scale
Darius|T|ad front early
Diana|J M|ap dive eng combo
Doctor Mundo|T J|ad front scale
Draven|B|ad rng early
Ekko|J M|ap dive assn mob
Elise|J|ap dive early
Evelynn|J|ap assn mob scale
Ezreal|B|ad ap rng poke mob
Fiddlesticks|J|ap eng combo
Fiora|T|ad split mob
Fizz|M|ap assn mob
Galio|M T S|ap front eng combo peel
Gangplank|T|ad poke scale split
Garen|T|ad front split
Gnar|T|ad front eng combo rng poke
Gragas|J T|ap front eng combo
Graves|J|ad early
Gwen|T|ap split dive scale
Hecarim|J|ad dive eng mob
Heimerdinger|T M|ap rng poke
Hwei|M|ap rng poke
Illaoi|T|ad front split
Irelia|T M|ad dive mob front
Ivern|J|ap peel
Janna|S|ap peel rng
Jarvan IV|J|ad dive eng front
Jax|T J|ad split scale
Jayce|T M|ad poke early
Jhin|B|ad rng poke
Jinx|B|ad rng scale
Kai'Sa|B|ad ap rng dive scale
Kalista|B|ad rng early
Karma|S M|ap rng poke peel
Karthus|J M|ap rng scale
Kassadin|M|ap mob assn scale
Katarina|M|ap assn mob
Kayle|T|ad ap rng scale peel
Kayn|J|ad dive assn mob
Kennen|T|ap eng combo rng
Kha'Zix|J|ad assn mob
Kindred|J|ad rng scale
Kled|T|ad dive eng front
Kog'Maw|B|ad rng scale
K'Sante|T|ad front eng
LeBlanc|M|ap assn mob
Lee Sin|J|ad dive eng mob early
Leona|S|front eng
Lillia|J|ap mob scale
Lissandra|M|ap eng combo
Locke|M T|ap assn dive mob
Lucian|B|ad rng early
Lulu|S|ap peel rng
Lux|S M|ap rng poke
Malphite|T|ap front eng combo
Malzahar|M|ap rng scale
Maokai|J S T|ap front eng peel
Master Yi|J|ad scale
Mel|M S|ap rng poke
Milio|S|ap rng peel
Miss Fortune|B|ad rng combo early
Mordekaiser|T J|ap front scale
Morgana|S|ap rng peel
Naafiri|J M|ad assn mob
Nami|S|ap rng peel
Nasus|T|ad front scale split
Nautilus|S|front eng
Neeko|S M|ap rng eng combo
Nidalee|J|ap rng poke early
Nilah|B|ad scale
Nocturne|J|ad dive eng assn
Nunu & Willump|J|ap front eng
Olaf|J T|ad front early
Orianna|M|ap rng combo peel
Ornn|T|ap front eng combo
Pantheon|T S|ad dive early
Poppy|T J S|front peel eng
Pyke|S|ad assn eng mob
Qiyana|J M|ad assn mob eng
Quinn|T|ad rng early mob
Rakan|S|peel eng mob
Rammus|J|front eng
Rek'Sai|J|ad dive early
Rell|S|front eng
Renata Glasc|S|ap rng peel combo
Renekton|T|ad front early
Rengar|J|ad assn
Riven|T|ad mob dive early
Rumble|T M|ap combo
Ryze|M T|ap scale
Samira|B|ad dive mob
Sejuani|J|front eng
Senna|S B|ad rng peel scale
Seraphine|S B M|ap rng peel combo
Sett|T|ad front early
Shaco|J|ad assn early
Shen|T|front peel
Shyvana|J|ad front scale
Singed|T|ap front split
Sion|T|ad front eng
Sivir|B|ad rng peel
Skarner|J|ad front eng
Smolder|B T M|ad rng scale
Sona|S|ap rng peel scale
Soraka|S|ap rng peel
Swain|M S T|ap front rng
Sylas|M J|ap dive mob
Syndra|M|ap rng poke combo
Tahm Kench|T S|front peel
Taliyah|M J|ap rng mob
Talon|M J|ad assn mob
Taric|S|front peel
Teemo|T|ap rng poke split
Thresh|S|eng peel
Tristana|B|ad rng mob
Trundle|T J|ad front
Tryndamere|T|ad split
Twisted Fate|M|ap rng
Twitch|B|ad rng assn
Udyr|J T|ad front
Urgot|T|ad front early
Varus|B M|ad ap rng poke
Vayne|B|ad rng scale
Veigar|M|ap rng scale
Vel'Koz|M S|ap rng poke
Vex|M|ap rng combo
Vi|J|ad dive eng
Viego|J|ad dive scale
Viktor|M|ap rng poke scale
Vladimir|M T|ap front scale
Volibear|T J|ad front eng early
Warwick|J|ad front dive early
Wukong|J T|ad dive eng combo
Xayah|B|ad rng peel
Xerath|M S|ap rng poke
Xin Zhao|J|ad dive early
Yasuo|M B T|ad mob
Yone|M T|ad mob
Yorick|T|ad front split
Yunara|B|ad rng scale
Yuumi|S|ap rng peel
Zaahen|J T|ad front scale
Zac|J|front eng combo mob
Zed|M|ad assn mob
Zeri|B|ad rng mob
Ziggs|B M|ap rng poke
Zilean|S M|ap rng peel
Zoe|M|ap rng poke
Zyra|S J|ap rng poke combo
`;

const CHAMP_DATA = {};
CHAMP_DATA_RAW.trim().split('\n').forEach(line => {
  const [name, roles, tags] = line.split('|');
  CHAMP_DATA[name.trim()] = { roles: roles.trim().split(/\s+/), tags: new Set(tags.trim().split(/\s+/)) };
});
const CHAMP_LC = new Set(ALL_CHAMPS.map(c => c.toLowerCase()));
const ROLE_LETTER = { Top: 'T', Jg: 'J', Mid: 'M', Bot: 'B', Sup: 'S' };

(function validateChampData() {
  const missing = ALL_CHAMPS.filter(c => !CHAMP_DATA[c]);
  if (missing.length) console.warn('Campions sense dades tàctiques:', missing);
})();

// Counters de lane coneguts (campió -> campions als quals guanya la línia). Heurístic i editable.
const LANE_COUNTERS = {
  'Malphite': ['Yasuo', 'Yone', 'Tryndamere', 'Fiora', 'Jax', 'Master Yi', 'Riven', 'Camille'],
  'Poppy': ['Yasuo', 'Yone', 'Camille', 'Riven', 'Irelia', 'Fiora', 'Hecarim', 'Kayn', 'Katarina', 'Zed', 'Fizz', 'Akali'],
  'Shen': ['Fiora', 'Tryndamere', 'Jax', 'Yasuo', 'Master Yi'],
  'Teemo': ['Fiora', 'Tryndamere', 'Jax', 'Master Yi'],
  'Vex': ['Yasuo', 'Yone', 'Zed', 'Fizz', 'Kassadin', 'Akali', 'Katarina'],
  'Galio': ['Katarina', 'Akali', 'Fizz', 'LeBlanc', 'Kassadin'],
  'Leona': ['Soraka', 'Sona', 'Janna', 'Lulu', 'Yuumi', 'Nami', 'Karma'],
  'Nautilus': ['Soraka', 'Sona', 'Janna', 'Lulu', 'Yuumi', 'Nami', 'Karma', 'Zyra', 'Lux'],
  'Pyke': ['Soraka', 'Sona', 'Yuumi', 'Lux', 'Zyra', 'Brand', 'Xerath', "Vel'Koz", 'Zilean'],
  'Morgana': ['Blitzcrank', 'Nautilus', 'Leona', 'Thresh', 'Pyke', 'Rell']
};

// Conceptes que apareixen a goodAgainst / badAgainst de les comps, avaluats contra el draft rival real
const CONCEPTS = {
  'front-to-back': p => p.n >= 3 && p.front >= 2 && p.dive < 2,
  'low mobility': p => p.n >= 3 && p.mob <= 1,
  'peel': p => p.peel >= 2,
  'tanks': p => p.front >= 2,
  'poke': p => p.poke >= 2,
  'combo': p => p.combo >= 2,
  'hard engage': p => p.eng >= 2,
  'melee comps': p => p.n >= 3 && p.melee >= 3,
  'melee dive': p => p.melee >= 3 && p.dive >= 2,
  'dive comps': p => p.dive >= 2,
  'assassins': p => p.assn >= 2,
  'squishy comps': p => p.n >= 3 && p.front === 0,
  'no engage': p => p.n >= 3 && p.eng === 0,
  'long range': p => p.n >= 3 && p.rng >= 3
};

function hasTag(c, t) { return Boolean(c && CHAMP_DATA[c] && CHAMP_DATA[c].tags.has(t)); }

function teamProfile(champs) {
  const list = champs.filter(Boolean);
  const p = { n: list.length, list, melee: 0 };
  ['ap', 'ad', 'front', 'eng', 'peel', 'poke', 'dive', 'assn', 'rng', 'mob', 'combo', 'scale', 'early', 'split'].forEach(k => { p[k] = 0; });
  list.forEach(c => {
    Object.keys(p).forEach(k => { if (k !== 'n' && k !== 'list' && k !== 'melee' && hasTag(c, k)) p[k]++; });
    if (!hasTag(c, 'rng')) p.melee++;
  });
  return p;
}

function entryHit(entry, prof) {
  const k = entry.toLowerCase();
  if (CHAMP_LC.has(k)) return { kind: 'champ', hit: prof.list.some(c => c.toLowerCase() === k) };
  const f = CONCEPTS[k];
  return { kind: 'concept', hit: f ? f(prof) : false };
}

function getOurPicks() { return state.ourSide === 'BLUE' ? state.bluePicks : state.redPicks; }
function getEnemyPicks() { return state.ourSide === 'BLUE' ? state.redPicks : state.bluePicks; }
function pickComp(ranked) {
  return state.selectedCompId ? (ranked.find(c => c.id === state.selectedCompId) || ranked[0]) : ranked[0];
}

