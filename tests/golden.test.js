// Prova de referència: juga 150 drafts (60 al mòbil) amb llavor fixa i compara TOTES les sortides del motor
// (picks, bans i predicció rival a cada torn; veredictes, builds i pla de partida al final)
// amb tests/golden/baseline.json. Serveix per refactoritzar sense canviar resultats.
//
//   node tests/golden.test.js            compara amb la referència
//   node tests/golden.test.js --update   regenera la referència (només si el canvi és volgut)
//   afegiu «mobile» per fer el mateix amb index.html
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { PC, MOBILE, check, done, openPage } = require('./lib');
const mobile = process.argv.includes('mobile');
const FILE = path.join(__dirname, 'golden', mobile ? 'baseline_mobile.json.gz' : 'baseline.json.gz');
const N = +process.env.GOLDEN_N || (process.argv.includes('mobile') ? 60 : 150);
const update = process.argv.includes('--update');

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
    resetDraft();
    setOurSide(g % 2 ? 'RED' : 'BLUE');
    setDraftMode('ORDER');
    const turns = [];
    for (let guard = 0; guard < 20 && !mmComplete(); guard++) {
      const st = state.activeSlot, ours = st.side === state.ourSide, ctx = buildCtx();
      const unav = new Set(getUnavailableChamps());
      let list, choice;
      if (ours && st.type === 'PICK') { list = recommendChamps(ctx, st.index); choice = pickFrom(list.filter(r => !unav.has(r.champ)), 4); }
      else if (ours) { list = recommendBans(ctx); choice = pickFrom(list.filter(r => !unav.has(r.champ)), 4); }
      else { list = predictEnemy(ctx); choice = pickFrom(list.filter(r => !unav.has(r.champ)), 6); }
      if (!choice) { const free = ALL_CHAMPS.filter(c => !unav.has(c)); choice = { champ: free[Math.floor(rnd() * free.length)] }; }
      turns.push([st.side[0] + st.type[0] + st.index, recs(list), choice.champ, html('liveAdviceBox'), bodyHtml()]);
      pickChampion(choice.champ);
    }
    generateStrategy();
    const ui = { strategy: html('strategyContent'), body: bodyHtml() };
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
      win: s.win, laneSummary: s.laneSummary, ui
    });
  }
  return { out, seed };
}

(async () => {
  const { browser, page, errors } = await openPage(process.env.HTML || (mobile ? MOBILE : PC), {
    before: async p => { await p.clock.setFixedTime(new Date('2026-11-21T12:00:00+01:00')); }
  });
  const t0 = Date.now();
  const got = [];
  let seed = 20261121;
  for (let g = 0; g < N; g += 10) {
    const r = await page.evaluate(capture, [g, Math.min(10, N - g), seed]);
    got.push(...r.out); seed = r.seed;
    if (process.env.VERBOSE) console.log(`${got.length}/${N}`);
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  await browser.close();
  check('sense errors de pàgina', errors.length === 0, errors.slice(0, 5));
  if (update) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, zlib.gzipSync(JSON.stringify(got)));
    console.log(`Referència desada: ${got.length} drafts (${secs} s)`);
    return done(mobile ? 'referència (mòbil)' : 'referència');
  }
  if (!fs.existsSync(FILE)) { check('existeix la referència (executa amb --update)', false); return done(mobile ? 'referència (mòbil)' : 'referència'); }
  const want = JSON.parse(zlib.gunzipSync(fs.readFileSync(FILE)));
  // Primeres diferències, amb el camí exacte
  const diffs = [];
  const walk = (a, b, p) => {
    if (diffs.length >= 12) return;
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const k of keys) walk(a[k], b[k], p + '.' + k);
    } else diffs.push(`${p}\n      abans: ${JSON.stringify(b)}\n      ara:   ${JSON.stringify(a)}`);
  };
  walk(got, want, 'drafts');
  const changed = got.filter((x, i) => JSON.stringify(x) !== JSON.stringify(want[i])).length;
  check(`els ${want.length} drafts donen exactament el mateix (${secs} s)`, changed === 0 && got.length === want.length, `${changed} drafts diferents\n    ` + diffs.join('\n    '));
  done(mobile ? 'referència (mòbil)' : 'referència');
})();
