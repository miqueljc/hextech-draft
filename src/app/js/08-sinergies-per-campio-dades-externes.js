// ================= SINERGIES PER CAMPIÓ (dades externes + motor estructural) =================
// Format: "A + B | WR | partides | font"  (duos bot de metabot.gg 26.22)  o  "A + B | w7 | font" (parelles recomanades)
const EXT_SYN_TEXT = `
Sivir + Braum | 69.3 | 101 | metabot 26.22
Miss Fortune + Janna | 64.2 | 120 | metabot 26.22
Vayne + Soraka | 62.1 | 103 | metabot 26.22
Aphelios + Karma | 57.3 | 131 | metabot 26.22
Smolder + Morgana | 59.5 | 131 | metabot 26.22
Samira + Pantheon | 56.1 | 114 | metabot 26.22
Kalista + Braum | 58.7 | 109 | metabot 26.22
Lucian + Yuumi | 54.7 | 404 | metabot 26.22
Caitlyn + Maokai | 58.6 | 116 | metabot 26.22
Miss Fortune + Bard | 55.9 | 145 | metabot 26.22
Kalista + Blitzcrank | 57.2 | 180 | metabot 26.22
Kalista + Leona | 59.3 | 199 | metabot 26.22
Caitlyn + Brand | 56.6 | 175 | metabot 26.22
Xayah + Soraka | 58.6 | 152 | metabot 26.22
Sivir + Yuumi | 56.4 | 181 | metabot 26.22
Kai'Sa + Galio | 56.7 | 134 | metabot 26.22
Jhin + Brand | 58.2 | 249 | metabot 26.22
Tristana + Blitzcrank | 58.1 | 313 | metabot 26.22
Tristana + Pyke | 57.0 | 237 | metabot 26.22
Tristana + Lux | 55.5 | 209 | metabot 26.22
Jhin + Vel'Koz | 58.6 | 532 | metabot 26.22
Miss Fortune + Xerath | 58.1 | 124 | metabot 26.22
Kalista + Pyke | 55.0 | 131 | metabot 26.22
Sivir + Karma | 55.4 | 166 | metabot 26.22
Aphelios + Janna | 55.0 | 120 | metabot 26.22
Samira + Nautilus | 54.2 | 517 | metabot 26.22
Yunara + Rakan | 55.9 | 161 | metabot 26.22
Jinx + Leona | 59.2 | 409 | metabot 26.22
Yunara + Zilean | 56.0 | 134 | metabot 26.22
Tristana + Yuumi | 54.1 | 294 | metabot 26.22
Yasuo + Thresh | 59.0 | 100 | metabot 26.22
Sivir + Leona | 59.9 | 142 | metabot 26.22
Jinx + Blitzcrank | 56.3 | 439 | metabot 26.22
Xayah + Vel'Koz | 58.3 | 103 | metabot 26.22
Xayah + Nami | 56.6 | 196 | metabot 26.22
Smolder + Milio | 55.1 | 138 | metabot 26.22
Xayah + Alistar | 58.5 | 272 | metabot 26.22
Jinx + Rakan | 56.6 | 145 | metabot 26.22
Miss Fortune + Thresh | 56.7 | 541 | metabot 26.22
Corki + Nami | 54.8 | 447 | metabot 26.22
Xayah + Thresh | 57.5 | 473 | metabot 26.22
Yunara + Braum | 54.8 | 389 | metabot 26.22
Kai'Sa + Rell | 55.2 | 654 | metabot 26.22
Zeri + Lulu | 55.4 | 511 | metabot 26.22
Corki + Alistar | 56.6 | 205 | metabot 26.22
Aphelios + Braum | 55.0 | 171 | metabot 26.22
Xayah + Lulu | 55.4 | 280 | metabot 26.22
Samira + Leona | 55.7 | 370 | metabot 26.22
Yasuo + Nautilus | 54.8 | 177 | metabot 26.22
Kog'Maw + Nautilus | 55.0 | 100 | metabot 26.22
Yunara + Alistar | 54.5 | 308 | metabot 26.22
Yasuo + Nami | 55.3 | 103 | metabot 26.22
Zeri + Blitzcrank | 55.4 | 112 | metabot 26.22
Tristana + Rakan | 55.3 | 123 | metabot 26.22
Jinx + Vel'Koz | 55.3 | 132 | metabot 26.22
Zeri + Seraphine | 54.5 | 121 | metabot 26.22
Smolder + Leona | 55.8 | 156 | metabot 26.22
Miss Fortune + Leona | 56.2 | 771 | metabot 26.22
Draven + Leona | 56.2 | 265 | metabot 26.22
Jhin + Maokai | 54.4 | 204 | metabot 26.22
Zeri + Leona | 56.1 | 123 | metabot 26.22
Twitch + Leona | 55.3 | 161 | metabot 26.22
Twitch + Alistar | 54.5 | 112 | metabot 26.22
Sivir + Alistar | 54.4 | 103 | metabot 26.22
Jhin + Zyra | 54.5 | 494 | metabot 26.22
Xayah + Pyke | 54.5 | 209 | metabot 26.22
Xayah + Braum | 56.4 | 188 | metabot 26.22
Xayah + Morgana | 54.3 | 138 | metabot 26.22
Xayah + Rakan | 52.6 | 1740 | metabot 26.22
Ashe + Seraphine | w6 | doble CC; l'E de Seraphine arrela els objectius alentits per Ashe (lolstats)
Jinx + Thresh | w6 | engage sòlid amb bon delta de sinergia (lolstats)
Caitlyn + Thresh | w5 | lane de poke fiable (lolstats)
Jinx + Braum | w6 | molt ben posicionat a U.GG Emerald+
Ashe + Milio | w6 | duo segur: el cleanse de Milio protegeix Ashe
Vayne + Milio | w6 | abast, cures i cleanse per a una carry que escala
Vayne + Nami | w5 | RiftMind High Elo (parch 26.22)
Vayne + Seraphine | w5 | RiftMind High Elo (parch 26.22)
Twitch + Braum | w6 | RiftMind High Elo (parch 26.22)
Jhin + Senna | w5 | RiftMind High Elo (parch 26.22)
Caitlyn + Lux | w5 | RiftMind High Elo i duo molt jugat
Caitlyn + Nami | w6 | l'stun d'Aqua Prison omple el que li falta a Caitlyn
Draven + Thresh | w6 | la llanterna dona a Draven el gap-closer que no té
Rell + Miss Fortune | w6 | Magnet Storm atrau els enemics a Bullet Time
Leona + Samira | w6 | pressió forta al nivell 2 amb Wild Rush
Nautilus + Kai'Sa | w5 | hooks que snowballejen
Soraka + Jinx | w5 | Astral Infusion cobreix la seva fase feble inicial
Sona + Smolder | w5 | Sona el manté viu mentre apila i escala
Jhin + Swain | w5 | root + pull per a all-ins early-mid
Zyra + Ashe | w6 | les slows d'Ashe preparen les vines de Zyra
Lucian + Braum | w5 | Braum bloqueja dany i potencia l'agressivitat de Lucian
Gragas + Yasuo | w8 | el knock-up/desplaçament agrupa enemics per a l'ult de Yasuo (Mobalytics/Dignitas)
Malphite + Yasuo | w7 | knock-ups per a l'ult de Yasuo
Qiyana + Jarvan IV | w6 | gank early i ult per atrapar enemics (Mobalytics)
Twisted Fate + Nocturne | w7 | ultimates per fer roams sense ser vistos (Mobalytics/Dignitas)
Lissandra + Viego | w5 | CC de Lissandra obre els ganks de Viego (Mobalytics)
Sejuani + Irelia | w6 | la Q d'Irelia apila Permafrost i carrega l'stun de Sejuani (Dignitas)
Orianna + Olaf | w6 | escut/velocitat d'Orianna ajuda Olaf i Olaf arriba al backline (Dignitas)
Fiddlesticks + Galio | w6 | la por manté els objectius a l'abast del taunt de Galio (Dignitas)
Sylas + Graves | w5 | sustain i armadura per a skirmishes llargs (Dot Esports)
Zed + Lillia | w6 | el CC de Lillia dona accés a l'all-in de Zed (Dot Esports)
Syndra + Briar | w6 | l'ult de Briar subjecta els enemics pel burst de Syndra (Dot Esports)
Jayce + Maokai | w6 | el lockdown de Maokai fa aterrar les Q de Jayce (Dot Esports)
Fiddlesticks + Zed | w5 | RiftMind High Elo (26.22)
Nautilus + Taliyah | w5 | RiftMind High Elo (26.22)
Shen + Nocturne | w6 | l'ult de Shen deixa Nocturne ultar l'objectiu prioritari (LoL Recommender)
Galio + Jarvan IV | w7 | les ults encadenen CC i burst (LoL Recommender)
Lissandra + Vi | w5 | l'ult de Lissandra complementa l'all-in de Vi
Cassiopeia + Twitch | w5 | la verinosa Twin Fang funciona amb el verí de Twitch
Alistar + Orianna | w5 | W→Q d'Alistar i l'ult d'Orianna (Mobalytics wombo combo)
Amumu + Miss Fortune | w6 | lockdown d'Amumu per al con de l'ult de Miss Fortune
Rakan + Xayah | w8 | els kits s'amplifiquen: un dels millors combos de nivell 1
Wukong + Orianna | w4 | knockup en àrea amb el W de Wukong
Ornn + Miss Fortune | w4 | el knockup d'Ornn agrupa per a l'ult
`;
const SYN_SRC = {};
const synKey = (a, b) => [a, b].sort().join('|');
const EXT_SYN_PAIRS = [];
EXT_SYN_TEXT.trim().split('\n').forEach(l => {
  const p = l.split('|').map(x => x.trim()); if (p.length < 3) return;
  const [a, b] = p[0].split('+').map(x => x.trim());
  let w, src;
  if (/^w\d+$/.test(p[1])) { w = +p[1].slice(1); src = p[2]; }
  else { const wr = parseFloat(p[1]); w = Math.max(3, Math.min(8, Math.round((wr - 48) / 1.6))); src = `${p[3] || 'dades'} · ${wr}% WR, ${p[2]} partides`; }
  EXT_SYN_PAIRS.push([a, b, w]); SYN_SRC[synKey(a, b)] = src;
});

const SYNERGY_PAIRS = [
  ['Orianna', 'Jarvan IV', 8], ['Jarvan IV', 'Miss Fortune', 8], ['Renata Glasc', 'Kalista', 8],
  ['Nautilus', 'Miss Fortune', 6], ['Leona', "Kai'Sa", 6], ['Malphite', 'Yasuo', 6], ['Malphite', 'Orianna', 6],
  ['Malphite', 'Miss Fortune', 5], ['Zac', 'Miss Fortune', 5], ['Amumu', 'Miss Fortune', 6], ['Rell', 'Miss Fortune', 5],
  ['Braum', 'Jinx', 5], ['Braum', 'Caitlyn', 5], ['Lulu', 'Jinx', 5], ['Milio', "Kai'Sa", 5], ['Nami', "Kai'Sa", 5],
  ['Thresh', 'Caitlyn', 4], ['Karthus', 'Nautilus', 6], ['Karthus', 'Leona', 6], ['Rumble', 'Nautilus', 7], ['Rumble', 'Leona', 5], ['Rumble', 'Jarvan IV', 5], ['Viktor', 'Jarvan IV', 4], ['Lulu', 'Olaf', 6], ['Lulu', 'Xin Zhao', 6], ['Lulu', "Kog'Maw", 6], ['Gwen', "Kog'Maw", 5], ['Gwen', 'Lulu', 5], ['Nocturne', 'Orianna', 7], ['Samira', 'Nautilus', 5], ['Samira', 'Leona', 5], ['Nautilus', "Kai'Sa", 4], ['Galio', 'Yasuo', 4], ['Sejuani', 'Miss Fortune', 4], ['Vi', 'Vex', 4]
];
EXT_SYN_PAIRS.forEach(([a, b, w]) => { if (!SYNERGY_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) SYNERGY_PAIRS.push([a, b, w]); });
const GEN_ARCH = [
  { key: 'engage', name: 'Engage i Wombo Combo', style: 'Engage dur, frontline i combos AoE', w: { eng: 5, front: 3, combo: 4, peel: 1 }, need: { eng: 2, front: 2 },
    good: ['low mobility', 'poke', 'long range', 'squishy comps'], bad: ['peel', 'tanks'],
    plan: { early: 'Línies segures fins al 6; el jungla prepara ganks amb CC encadenat i s\'ajusta als objectius.', mid: 'Forceu baralles als passadissos estrets (Drac, Herald) amb l\'engage + combo AoE.', late: 'No lluiteu sense els ultimates clau; espereu que el rival es mogui i encadeneu CC en àrea.',
      ind: { Top: 'Aguanta l\'onada i guarda el TP per flanquejar/engagear a les baralles.', Jg: 'Marca el ritme: ganks amb CC i entra primer als objectius.', Mid: 'Empeny i rota; combo AoE darrere de l\'engage.', Bot: 'Posiciona\'t darrere l\'engage i aprofita el CC per fer dany.', Sup: 'Busca angles des de la boira i inicia sobre els carries sense mobilitat.' } } },
  { key: 'pick', name: 'Pick / Caçades', style: 'Aïllar i matar objectius amb CC + mobilitat', w: { assn: 3, eng: 3, mob: 2, dive: 2, combo: 2 }, need: { eng: 1 },
    good: ['squishy comps', 'low mobility', 'long range'], bad: ['front-to-back', 'peel'],
    plan: { early: 'Control de visió i invasions de jungla per trobar el primer pick.', mid: 'Caceu en grup amb vision advantage; converteix cada mort en Drac/Herald/Torre.', late: 'Evita el 5v5 frontal: dividiu el mapa i caceu per aïllar el carry rival.',
      ind: { Top: 'Teleporta al lloc de la caça o fes de side-lane per estirar-los.', Jg: 'Controla el fog of war i inicia les caçades.', Mid: 'Rota abans que ningú per ajudar a aïllar.', Bot: 'Segueix la caça sense exposar-te; el teu dany remata.', Sup: 'Wards profunds i engage des del flanc.' } } },
  { key: 'poke', name: 'Poke i Setge', style: 'Desgastar amb rang i guanyar torres', w: { poke: 5, rng: 3, peel: 2, scale: 1 }, need: { poke: 2 },
    good: ['front-to-back', 'low mobility', 'melee comps'], bad: ['hard engage', 'dive comps', 'assassins'],
    plan: { early: 'Roba prioritat i pressiona amb poke; cada torre és un objectiu de setge.', mid: 'Setgeu objectius amb poke fins que cedeixin; no accepteu baralles sense vida.', late: 'Poke abans de cada objectiu; si us entren, tothom darrere del peel.',
      ind: { Top: 'Prioritat de línia i TP per sumar-te al setge.', Jg: 'Protegeix els poke i controla els flancs.', Mid: 'Dany a distància constant a objectius i torres.', Bot: 'Farmeja, poke i no t\'exposis; ets el carry de setge.', Sup: 'Poke + peel; vigila els flancs del rival.' } } },
  { key: 'protect', name: 'Protegir el Carry (Front-to-Back)', style: 'Frontline sòlida + carry escalat protegit', w: { front: 3, peel: 4, scale: 3, rng: 2 }, need: { front: 2, peel: 1 },
    good: ['dive comps', 'melee comps', 'assassins'], bad: ['poke', 'long range'],
    plan: { early: 'Sobreviviu a la línia i prioritzeu farm per al carry.', mid: 'Agrupa\'t al voltant dels objectius; la frontline absorbeix i el carry fa dany.', late: 'Lluita en 5v5 ordenat: frontline davant, peel actiu i carry a darrere.',
      ind: { Top: 'Tanca la frontline; absorbeix el seu dive.', Jg: 'Farm segur i peel del carry en baralles.', Mid: 'Control de ones i dany segur des de lluny.', Bot: 'Farm i escala; posiciona\'t darrere la frontline.', Sup: 'Peel i visió; el teu treball és que el carry visqui.' } } },
  { key: 'dive', name: 'Dive i Skirmish', style: 'Mobilitat i entrada al backline', w: { dive: 5, assn: 2, mob: 3, early: 3 }, need: { dive: 2 },
    good: ['squishy comps', 'poke', 'long range'], bad: ['front-to-back', 'peel', 'tanks'],
    plan: { early: 'Pressió de ritme: ganks per les línies i snowball amb la mobilitat.', mid: 'Entreu a les baralles amb diversos angles; desfeu el backline abans que es moguin.', late: 'No allargueu: tanqueu el joc abans que els carries rivals escalin.',
      ind: { Top: 'Aprofita el 1v1 i el TP per entrar de flanc.', Jg: 'Mantén la pressió i connecta les entrades.', Mid: 'Roaming constant per obrir l\'objectiu.', Bot: 'Segueix l\'entrada i aprofita l\'avantatge.', Sup: 'Engage i visió per connectar les entrades.' } } },
  { key: 'scale', name: 'Escalat i Late Game', style: 'Sobreviure i guanyar amb el late', w: { scale: 5, peel: 3, front: 2 }, need: { scale: 2 },
    good: ['melee comps', 'low mobility'], bad: ['dive comps', 'assassins'],
    plan: { early: 'Línies segures, farm i vision; cedir objectius menors si cal.', mid: 'Escala amb farm i espera els vostres ítems; no forceu res.', late: 'A partir dels 3 ítems, agrupeu-vos i guanyeu les baralles per qualitat.',
      ind: { Top: 'Farm i TP segur per als objectius.', Jg: 'Farm a la jungla i controla els ritmes.', Mid: 'Escala i neteja ones.', Bot: 'Farm i dany constant al late.', Sup: 'Visió, peel i protecció.' } } },
  { key: 'split', name: 'Split Push i Pressió de Mapa', style: 'Pressió lateral i 4v5 estratègic', w: { split: 5, mob: 2, eng: 2, peel: 1 }, need: { split: 1 },
    good: ['front-to-back', 'low mobility', 'no engage'], bad: ['assassins', 'dive comps'],
    plan: { early: 'Assegura línies i prepara el side-lane del top/mid.', mid: 'Un jugador pressiona i els altres defensen; el rival ha de dividir-se.', late: 'Splitpush quan hi hagi objectiu de l\'altre costat; agrupeu només si hi ha un engage segur.',
      ind: { Top: 'Splitpush: pressiona i tanca els flancs.', Jg: 'Cobreix l\'splitpush amb visió i objectius.', Mid: 'Neteja ones i rota per ajudar a l\'splitpush.', Bot: 'Escala segur; fixa el rival amb pressió bot.', Sup: 'Visió profunda i protecció del que fa split.' } } }
];
const GEN_TAGS = ['ap', 'ad', 'front', 'eng', 'peel', 'poke', 'dive', 'assn', 'rng', 'mob', 'combo', 'scale', 'early', 'split'];

function genChampStrength(c, role) {
  const pch = PATCH_CHANGES[c];
  return tierPts(c, role) * 0.8 + (pch ? pch.delta : 0);
}
function genRolePerms() {
  const out = [];
  const used = [false, false, false, false, false], cur = [];
  (function rec(r) {
    if (r === 5) { out.push([...cur]); return; }
    for (let p = 0; p < 5; p++) {
      if (used[p] || !playsRole(p, ROLE_ORDER[r])) continue;
      used[p] = true; cur[r] = p; rec(r + 1); used[p] = false;
    }
  })(0);
  return out;
}

// Diferència entre dues comps: rols on canvia el campió o el jugador
function genDiff(a, b) { return a.team.filter((c, i) => c !== b.team[i] || a.perm[i] !== b.perm[i]).length; }

function generateComps() {
  for (let i = COMPS.length - 1; i >= 0; i--) if (COMPS[i].gen) COMPS.splice(i, 1);
  const perms = genRolePerms();
  if (!perms.length) { state.selectedCompId = COMPS.some(c => c.id === state.selectedCompId) ? state.selectedCompId : null; return; }
  const tagVec = {};
  const tv = c => tagVec[c] || (tagVec[c] = GEN_TAGS.map(t => hasTag(c, t) ? 1 : 0));
  const nextId = Math.max(...COMPS.map(c => c.id)) + 1;
  const found = [];

  GEN_ARCH.forEach(arch => {
    const results = [];
    perms.forEach(perm => {
      const permPenalty = perm.reduce((s, p, r) => s + (ROSTER[p].role === ROLE_ORDER[r] ? 0 : -4), 0);
      const cand = ROLE_ORDER.map((role, r) => {
        const p = perm[r], pl = ROSTER[p];
        return poolOf(p, role).filter(c => CHAMP_DATA[c]).map(c => {
          const h = pl.opggHighlights.find(x => x.champ === c);
          const fit = (pl.excelMains.includes(c) ? 6 : 0) + (champStat(p, c) ? champRating(p, c) * 0.9 : (h ? h.bonus * 0.5 : 0)) + genChampStrength(c, role);
          const arc = Object.entries(arch.w).reduce((s, [t, w]) => s + (hasTag(c, t) ? w : 0), 0);
          return { c, fit, rank: fit + arc * 1.2 };
        }).sort((a, b) => b.rank - a.rank).slice(0, 5);
      });
      if (cand.some(l => !l.length)) return;
      const idx = [0, 0, 0, 0, 0];
      (function rec(r, team, fit) {
        if (r === 5) {
          const cnt = new Array(GEN_TAGS.length).fill(0);
          team.forEach(c => tv(c).forEach((v, i) => { cnt[i] += v; }));
          const T = {}; GEN_TAGS.forEach((t, i) => { T[t] = cnt[i]; });
          let s = permPenalty + fit;
          Object.entries(arch.w).forEach(([t, w]) => { s += w * Math.min(T[t], 3); });
          Object.entries(arch.need).forEach(([t, n]) => { if (T[t] < n) s -= 10 * (n - T[t]); });
          if (T.ap >= 1 && T.ad >= 1) s += 8;
          if (T.ap === 0 || T.ad === 0) s -= 12;
          if (T.front === 0 && arch.key !== 'poke' && arch.key !== 'dive') s -= 6;
          SYNERGY_PAIRS.forEach(([a, b, w]) => { if (team.includes(a) && team.includes(b)) s += w; });
          results.push({ s, team: [...team], perm });
          return;
        }
        cand[r].forEach(o => {
          if (team.includes(o.c)) return;
          team.push(o.c); rec(r + 1, team, fit + o.fit); team.pop();
        });
      })(0, [], 0);
    });
    results.sort((a, b) => b.s - a.s);
    const chosen = [];
    for (const r of results) {
      if (chosen.length >= 3) break;
      if (chosen.every(x => genDiff(x, r) >= 2)) chosen.push(r);
    }
    chosen.forEach(r => found.push({ arch, ...r }));
  });

  found.sort((a, b) => b.s - a.s);
  // Retalla comps pràcticament iguals a altres arquetips (≥4 campions idèntics amb mateixos rols)
  const kept = [];
  found.forEach(f => { if (kept.every(k => genDiff(k, f) >= 2)) kept.push(f); });

  const splus = Object.keys(PATCH_TIER).filter(c => bestTier(c) === 'S+');
  kept.forEach((f, n) => {
    const roles = {}, players = {};
    ROLE_ORDER.forEach((role, r) => {
      const p = f.perm[r];
      const others = poolOf(p, role).filter(c => CHAMP_DATA[c] && c !== f.team[r] && !f.team.includes(c))
        .map(c => ({ c, v: genChampStrength(c, role) + Object.entries(f.arch.w).reduce((s, [t, w]) => s + (hasTag(c, t) ? w : 0), 0) }))
        .sort((a, b) => b.v - a.v).slice(0, 2).map(x => x.c);
      roles[role] = [f.team[r], ...others];
      players[role] = p;
    });
    const counterCount = {};
    f.team.forEach(e => Object.keys(LANE_COUNTERS).forEach(c => { if (LANE_COUNTERS[c].includes(e)) counterCount[c] = (counterCount[c] || 0) + 1; }));
    const bans = Object.keys(counterCount).sort((a, b) => counterCount[b] - counterCount[a]).slice(0, 2);
    splus.filter(c => !f.team.includes(c) && !ROSTER.some(p => p.pool.includes(c))).slice(0, 3).forEach(c => { if (bans.length < 4 && !bans.includes(c)) bans.push(c); });
    const fill = s => s.replace(/\{(Top|Jg|Mid|Bot|Sup)\}/g, (_, r) => roles[r][0]);
    const individual = {};
    ROLE_ORDER.forEach(r => { individual[r] = `${roles[r][0]}: ${f.arch.plan.ind[r]}`; });
    COMPS.push({
      id: nextId + n, gen: true, archKey: f.arch.key, genScore: Math.round(f.s), players,
      name: `Comp ${nextId + n}: ${f.arch.name} (auto)`, style: f.arch.style, roles,
      goodAgainst: f.arch.good, badAgainst: f.arch.bad, bans,
      plan: { early: f.arch.plan.early, mid: f.arch.plan.mid, late: f.arch.plan.late, individual }
    });
  });
  if (state.selectedCompId && !COMPS.some(c => c.id === state.selectedCompId)) state.selectedCompId = null;
}

