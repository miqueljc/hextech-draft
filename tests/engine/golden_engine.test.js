// Prova de referència del motor, en Node (sense navegador): els mateixos drafts que tests/golden.test.js
// han de donar exactament les mateixes recomanacions, veredictes, builds i pla (sense comparar l'HTML).
// Molt més ràpida: és la que s'executa a GitHub a cada canvi.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');
const { check, done } = require('../lib');
const loadEngine = require('./harness');
const FILE = path.join(__dirname, '..', 'golden', 'baseline.json.gz');
const N = +process.env.GOLDEN_N || 150;
function capture([g0, n, seed0]) {
  // --- dins del navegador ---
  let seed = seed0;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pickFrom = (list, k) => { const c = list.slice(0, k); return c.length ? c[Math.floor(rnd() * c.length)] : null; };
  const r1 = x => Math.round(x * 10) / 10;
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + ':' + str.length; };
  const html = id => { const e = document.getElementById(id); return e ? hash(e.innerHTML) : null; };
  const bodyHtml = () => hash([...document.body.children].filter(e => e.tagName !== 'SCRIPT').map(e => e.outerHTML).join(''));
  const recs = list => list.slice(0, 12).map(r => [r.champ, r1(r.score !== undefined ? r.score : r.prob * 100), (r.why || []).map(w => r1(w.pts) + ' ' + w.txt).join(' | ')]);
  const out = [];
  for (let g = g0; g < g0 + n; g++) {
    clearDraftState();
    state.ourSide = g % 2 ? 'RED' : 'BLUE';
    state.draftMode = 'ORDER';
    const turns = [];
    for (let guard = 0; guard < 20 && !mmComplete(); guard++) {
      const st = state.activeSlot, ours = st.side === state.ourSide, ctx = buildCtx();
      const unav = new Set(getUnavailableChamps());
      let list, choice;
      if (ours && st.type === 'PICK') { list = recommendChamps(ctx, st.index); choice = pickFrom(list.filter(r => !unav.has(r.champ)), 4); }
      else if (ours) { list = recommendBans(ctx); choice = pickFrom(list.filter(r => !unav.has(r.champ)), 4); }
      else { list = predictEnemy(ctx); choice = pickFrom(list.filter(r => !unav.has(r.champ)), 6); }
      if (!choice) { const free = ALL_CHAMPS.filter(c => !unav.has(c)); choice = { champ: free[Math.floor(rnd() * free.length)] }; }
      turns.push([st.side[0] + st.type[0] + st.index, recs(list), choice.champ]);
      applyPick(choice.champ);
    }
    const s = buildStrategy();
    const lanes = s.lanes.map(l => {
      const b = l.build || {};
      return [l.role, l.champ, l.verdict, l.enemyText, (l.notes || []).join(' | '), b.keystone, b.primary, b.secondary, b.shards, b.summoners, b.start, b.boots,
        (b.core || []).join(', '), (b.order || []).map(o => o.item + ' (' + o.why + ')').join(' > '), (b.notes || []).join(' | '), b.firstBack];
    });
    out.push({
      g, side: state.ourSide, turns, lanes,
      comp: s.comp && s.comp.name,
      deep: s.deep ? { tf: s.deep.tf, obj: s.deep.obj } : null,
      threats: (s.threats || []).map(t => t.champ + ': ' + t.txt),
      individual: (s.individual || []).map(x => x.role + ': ' + x.text),
      phases: s.phasePlan ? (s.phasePlan.phases || []).map(f => f.time + ' ' + f.title + ': ' + f.text) : null,
      win: s.win, laneSummary: s.laneSummary
    });
  }
  return { out, seed };
}

const t0 = Date.now();
const E = loadEngine({ now: '2026-11-21T12:00:00+01:00' });
// la funció de captura s'executa dins del context del motor
const got = [];
let seed = 20261121;
E.__run('globalThis.__capture = ' + capture.toString());
for (let g = 0; g < N; g += 10) { const r = E.__capture([g, Math.min(10, N - g), seed]); got.push(...JSON.parse(JSON.stringify(r.out))); seed = r.seed; }
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const want = JSON.parse(zlib.gunzipSync(fs.readFileSync(FILE))).slice(0, N).map(d => {
  const x = { ...d, turns: d.turns.map(t => t.slice(0, 3)) }; delete x.ui; return x;
});
const diffs = [];
const walk = (a, b, p) => {
  if (diffs.length >= 10 || JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], p + '.' + k); }
  else diffs.push(`${p}\n      navegador: ${JSON.stringify(b)}\n      motor:     ${JSON.stringify(a)}`);
};
walk(got, want, 'drafts');
const changed = got.filter((x, i) => JSON.stringify(x) !== JSON.stringify(want[i])).length;
check(`motor en Node = navegador en els ${N} drafts (${secs} s)`, changed === 0, `${changed} diferents\n    ` + diffs.join('\n    '));
done('motor (Node)');
