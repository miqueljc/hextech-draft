// Carrega el motor (tots els mòduls de src/app excepte ui/) en Node, sense navegador ni pantalla.
// Ús: const E = require('./harness')(); E.recommendChamps(...)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const APP = path.join(ROOT, 'src', 'app');

function dataBlock() {
  // el mateix bloc que injecta src/muntatge.py (surt de data.json)
  return require('child_process').execFileSync('python3', [path.join(ROOT, 'src', 'muntatge.py'), '--data-block'], { encoding: 'utf8', maxBuffer: 1 << 26 });
}

module.exports = function loadEngine(opts = {}) {
  const order = fs.readFileSync(path.join(APP, 'modules.txt'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  // el motor: tot menys la pantalla (ui/) i les peces d'una sola versió (@escriptori / @mobil)
  const engine = order.filter(f => !f.startsWith('ui/') && !f.startsWith('@'));
  let code = engine.map(f => fs.readFileSync(path.join(APP, f), 'utf8')).join('').replace('/*@DATA@*/\n', dataBlock());
  // exporta totes les declaracions de primer nivell (const/let no van al context global)
  const names = [...code.matchAll(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gm)].map(m => m[1]);
  code += '\n;globalThis.__ENGINE__ = {' + [...new Set(names)].map(n => `get ${n}() { return ${n}; }, set ${n}(v) { ${n} = v; }`).join(',') + '};';
  const store = new Map();
  const ctx = {
    console: opts.quiet === false ? console : { log() {}, warn() {}, error() {}, info() {} },
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  };
  vm.createContext(ctx);
  if (opts.now) vm.runInContext(`(() => { const T = new Date(${JSON.stringify(opts.now)}).getTime(); const D = Date; globalThis.Date = class extends D { constructor(...a) { if (a.length) super(...a); else super(T); } static now() { return T; } }; })();`, ctx);
  vm.runInContext(code, ctx, { filename: 'motor.js' });
  ctx.__run = src => vm.runInContext(src, ctx);
  const E = new Proxy(ctx, { get: (t, k) => (k in t ? t[k] : t.__ENGINE__[k]), set: (t, k, v) => { if (k in t) t[k] = v; else t.__ENGINE__[k] = v; return true; } });
  // mateix inici que la pàgina: dades per defecte, i després data.json com si arribés de la xarxa
  E.captureDefaults();
  E.applyDataChange();
  E.state.enemyOtps = [];
  if (opts.data !== false) {
    const json = opts.data || JSON.parse(fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8'));
    E.setShared(json);
    E.applyDataChange();
    try { E.refreshSharedRival(); } catch (e) {}
  }
  return E;
};
