// ================= DADES REALS D'OP.GG (captura del 17/11/2026, temporada 2026, rànquing solo+flex+5s) =================
const OPGG_SNAPSHOT_DATE = '17/11/2026';
const OPGG_SNAPSHOT = [
  { rank: 'Gold 2 · 75 LP (solo 91V-81D, 53%)', roleShare: { Top: 7, Jg: 4, Mid: 1, Bot: 4, Sup: 83 }, recent: 60, season: 51,
    champs: 'Poppy 23-17, Milio 23-15, Neeko 13-17, Renata Glasc 13-14, Alistar 12-14, Morgana 11-13, Seraphine 7-17, Nautilus 12-3, Rell 8-4, Thresh 7-4, Tahm Kench 4-7, Maokai 7-3, Miss Fortune 6-4, Sejuani 5-5, Zyra 5-5, Kled 6-3, Caitlyn 4-4, Nami 4-4, Swain 4-3, Bard 1-6, Shen 4-2, Ashe 2-4, Galio 1-5, Blitzcrank 4-1, Sett 4-1, Lillia 2-3, Karma 2-3, Smolder 2-3' },
  { rank: 'Gold 4 · 52 LP (solo 95V-107D, 47%)', roleShare: { Top: 3, Jg: 96, Mid: 1, Bot: 0, Sup: 0 }, recent: 55, season: 50,
    champs: "Zaahen 81-67, Bel'Veth 48-48, Evelynn 49-43, Qiyana 13-13, Fiddlesticks 9-12, Zac 8-12, Rammus 6-5, Naafiri 1-10, Doctor Mundo 3-7, Aurelion Sol 3-2, Akali 0-3, Shyvana 1-1, Ambessa 1-1, Amumu 1-0, Pantheon 0-1" },
  { rank: 'Gold 3 · 51 LP (solo 36V-41D, 47%)', roleShare: { Top: 13, Jg: 0, Mid: 87, Bot: 0, Sup: 0 }, recent: 35, season: 46,
    champs: 'Ahri 14-15, Naafiri 9-9, Vex 11-6, Illaoi 2-3, Diana 1-1, Sylas 1-1, LeBlanc 0-2, Azir 0-2, Volibear 0-2, Sett 1-0, Lillia 0-1, Locke 0-1, Galio 0-1, Nasus 0-1, Yone 0-1' },
  { rank: 'Platinum 1 · 25 LP (solo 81V-69D, 54%)', roleShare: { Top: 6, Jg: 0, Mid: 1, Bot: 93, Sup: 1 }, recent: 50, season: 51,
    champs: "Kai'Sa 41-42, Caitlyn 36-41, Miss Fortune 17-10, Ashe 13-9, Tristana 10-7, Samira 10-4, Xayah 7-7, Ezreal 3-7, Jinx 4-3, Smolder 1-6, Sivir 5-1, Yunara 2-4, Draven 2-3, Darius 2-3, Teemo 2-2, Jhin 2-1, Yasuo 1-2, Leona 2-0, Jax 2-0, Nasus 1-1" },
  { rank: 'Platinum 3 · 37 LP (solo 110V-115D, 49%)', roleShare: { Top: 1, Jg: 8, Mid: 0, Bot: 39, Sup: 52 }, recent: 45, season: 50,
    champs: "Caitlyn 28-22, Pyke 24-15, Senna 18-16, Miss Fortune 18-14, Thresh 16-11, Ezreal 10-16, Poppy 8-14, Lee Sin 8-9, Jinx 11-5, Ashe 5-7, Bard 2-10, Zilean 6-3, Morgana 6-3, Kai'Sa 5-4, Milio 5-4, Nautilus 4-4, Varus 3-5, Nami 5-2, Swain 5-2, Jhin 4-3, Leona 4-3, Vayne 2-5, Mel 4-2, Lulu 2-4" }
];

function champStat(p, c) { const s = ROSTER[p].stats && ROSTER[p].stats[c]; return s || null; }
// Valoració històrica d'un jugador amb un campió: winrate suavitzat (prior 50% amb pes 20) + volum de partides
function champRating(p, c) {
  const s = champStat(p, c);
  if (!s) return 0;
  const g = s.w + s.l, shr = (s.w + 10) / (g + 20);
  return Math.max(-20, Math.min(25, (shr - 0.5) * 160 + Math.min(g, 100) / 10));
}
function statText(p, c) {
  const s = champStat(p, c);
  if (!s) return '';
  const g = s.w + s.l;
  return `${s.w}V-${s.l}D (${Math.round(100 * s.w / g)}%)`;
}
function playerSlump(p) { const pl = ROSTER[p]; return pl.recent != null && pl.recent - pl.season <= -8; }
function playerHot(p) { const pl = ROSTER[p]; return pl.recent != null && pl.recent - pl.season >= 8; }
function formMul(p) { return playerSlump(p) ? 1.25 : 1; }

function applyOpggSnapshot() {
  OPGG_SNAPSHOT.forEach((d, pi) => {
    const pl = ROSTER[pi];
    pl.rank = d.rank; pl.roleShare = d.roleShare; pl.recent = d.recent; pl.season = d.season;
    pl.baseStats = {};
    d.champs.split(',').forEach(x => {
      const m = x.trim().match(/^(.+) (\d+)-(\d+)$/);
      if (!m) return;
      const c = canonChamp(m[1]);
      if (c) pl.baseStats[c] = { w: +m[2], l: +m[3] };
    });
    // Highlights per defecte derivats de les dades reals (≥8 partides i valoració ≥6)
    pl.opggHighlights = Object.entries(pl.baseStats).map(([c, s]) => ({ champ: c, g: s.w + s.l, rate: champRatingRaw(s) }))
      .filter(h => h.g >= 8 && h.rate >= 6)
      .sort((a, b) => b.rate - a.rate).slice(0, 6)
      .map(h => ({ champ: h.champ, wr: `${statTextRaw(pl.baseStats[h.champ])} · op.gg ${OPGG_SNAPSHOT_DATE}`, bonus: Math.min(30, Math.round(h.rate * 1.3)) }));
    // Campions amb ≥4 partides i historial no negatiu s'afegeixen al pool
    Object.entries(pl.baseStats).forEach(([c, s]) => {
      if (s.w + s.l >= 4 && champRatingRaw(s) > -8 && !pl.pool.includes(c)) pl.pool.push(c);
    });
  });
}
function champRatingRaw(s) { const g = s.w + s.l, shr = (s.w + 10) / (g + 20); return Math.max(-20, Math.min(25, (shr - 0.5) * 160 + Math.min(g, 100) / 10)); }
function statTextRaw(s) { const g = s.w + s.l; return `${s.w}V-${s.l}D (${Math.round(100 * s.w / g)}%)`; }

function synergyOf(a, b) { const f = SYNERGY_PAIRS.find(([x, y]) => (x === a && y === b) || (x === b && y === a)); return f ? f[2] : 0; }
function duoSuggestions(rA, rB, limit) {
  const out = [], perms = genRolePerms(), ia = ROLE_ORDER.indexOf(rA), ib = ROLE_ORDER.indexOf(rB);
  ROSTER.forEach((_, p) => ROSTER.forEach((__, q) => {
    // només parelles de jugadors que permeten una alineació completa dels 5 rols
    if (p === q || !perms.some(pm => pm[ia] === p && pm[ib] === q)) return;
    poolOf(p, rA).forEach(c1 => poolOf(q, rB).forEach(c2 => {
      if (c1 === c2 || !CHAMP_DATA[c1] || !CHAMP_DATA[c2]) return;
      const s = champRating(p, c1) + champRating(q, c2) + synergyOf(c1, c2) + (tierPts(c1, rA) + tierPts(c2, rB)) * 0.4;
      out.push({ s, p, q, c1, c2 });
    }));
  }));
  out.sort((a, b) => b.s - a.s);
  const seen = new Set(), res = [];
  for (const o of out) { const k = o.c1 + '|' + o.c2; if (seen.has(k)) continue; seen.add(k); res.push(o); if (res.length >= limit) break; }
  return res;
}

