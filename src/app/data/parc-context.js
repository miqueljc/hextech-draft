// ================= CONTEXT DEL PARC 26.23 (dades contrastades amb fonts externes) =================
const PATCH_META = {
  patch: '26.23',
  date: '20/11/2026',
  note: 'Els canvis del 26.23 són la PREVIEW oficial de Riot (11/11/2026): els valors poden canviar a les notes finals.',
  tierNote: 'Tier list del 26.23 (Skill Capped, Emerald+): OP → S+, S i A. Els campions que no hi surten són B o inferior.'
};

// tier list: de fàbrica = data.json (hextech_tier_v1), injectat al muntatge
const TIER_RAW = JSON.parse(JSON.stringify(TIER_DEFAULT));
const TIER_PTS = { 'S+': 10, 'S': 6, 'A': 2 };
const PATCH_TIER = {};
Object.entries(TIER_RAW).forEach(([letter, tiers]) => Object.entries(tiers).forEach(([tier, list]) => list.forEach(c => {
  (PATCH_TIER[c] = PATCH_TIER[c] || {})[letter] = tier;
})));
function tierIn(c, role) { const t = PATCH_TIER[c]; return t ? (t[ROLE_LETTER[role]] || null) : null; }
function bestTier(c) {
  const t = PATCH_TIER[c];
  return t ? Object.values(t).sort((a, b) => TIER_PTS[b] - TIER_PTS[a])[0] : null;
}
function tierPts(c, role) { const t = role ? tierIn(c, role) : bestTier(c); return t ? TIER_PTS[t] : 0; }

// Canvis del 26.23 (preview). delta = ajust orientatiu de força (+ buff / - nerf)
const PATCH_CHANGES = {
  'Annie': { delta: 3, note: "R (Tibbers): vida 1275-4000 (+150% vida bonus), aura 10-20 per segon, AD 30/50/70." },
  'Azir': { delta: 4, note: "Rang d'atac 525→550; dany on-hit de la W 50%→67%. Riot vol reforçar les interaccions on-hit (Nashor's Tooth, Lethal Tempo)." },
  'Bard': { delta: 2, note: "Q: dany 80-260 i ràtio AP 80%→100%." },
  'Ezreal': { delta: 2, note: "W: 115% AD bonus / 100% AP. R: 350-850, 110% AD bonus / 120% AP." },
  'Galio': { delta: 4, note: "Escut de W/R: 8-20% de la vida màxima (abans 7,5-13,5%)." },
  'Gnar': { delta: 2, note: "Q: ràtio AD 135% (mini) i 150% (mega)." },
  "K'Sante": { delta: 4, note: "W: mana 45 fix i dany base 45-205 (abans 45-165)." },
  'Mel': { delta: 3, note: "Q màxim 90/126/172/228/294 amb més ràtios AP; W: escut 50-210 i represàlia 35-75." },
  "Vel'Koz": { delta: 1, note: "R: dany total de rang 3 passa a 950 (correcció d'un bug)." },
  'Vi': { delta: 3, note: "E: dany base 10-110 (abans 10-90)." },
  'LeBlanc': { delta: -3, note: "Q: ràtio AP 40%→35%." },
  'Master Yi': { delta: -4, note: "Q: ràtio AD 70%→60%; dany màxim a un objectiu 122,5%→105% AD." },
  'Syndra': { delta: -3, note: "E: mana 50→60 i cooldown 15s→17/16,5/16/15,5/15s." }
};
const PATCH_ITEM_NOTES = [
  "Voltaic Cyclosword nerfejat: Firmament passa de 9%/7% a 8%/6% de la vida actual (melee/ranged). Riot vol més espai per a Umbral Glaive, Hubris, Profane Hydra i Youmuu's Ghostblade.",
  "Sense canvis de runes anunciats al 26.23. Sistema vigent des del 26.9: Phase Rush eliminada; noves Deathfire Touch i Stormraider's Surge; Arcane Comet i Hail of Blades retocades.",
  "Team Voice (xat de veu a tot l'equip, opcional) arriba primer a Amèrica del Nord i Oceania."
];

