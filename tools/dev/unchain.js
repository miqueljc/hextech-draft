// Eina d'un sol ús (refactor fase 3): converteix les funcions reassignades (F = function ...) en declaracions úniques.
//  - Substitució completa: s'esborra la declaració antiga i la nova passa a ser `function F(...)`.
//  - Embolcall (crida la versió anterior): cada capa passa a ser una funció amb nom propi
//    (F__base, F__n, F__u...) i l'última es diu F. Les referències a l'alias s'apunten a la capa anterior.
// Treballa sobre src/app/js (els fitxers s'uneixen, es transformen i es tornen a separar pel seu comentari inicial).
const acorn = require('/opt/npm-tools/node_modules/acorn');
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'src', 'app', 'js');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort();
const parts = files.map(f => fs.readFileSync(path.join(DIR, f), 'utf8'));
let js = parts.join('');
const starts = []; { let p = 0; parts.forEach(t => { starts.push(p); p += t.length; }); }
const fileOf = pos => { let k = 0; while (k + 1 < starts.length && starts[k + 1] <= pos) k++; return k; };
const tagOf = pos => { const m = files[fileOf(pos)].match(/bloc-([a-z])-/); return m ? m[1] : files[fileOf(pos)].slice(0, 2); };

const ast = acorn.parse(js, { ecmaVersion: 2022 });
const decl = {};
ast.body.forEach(n => { if (n.type === 'FunctionDeclaration') decl[n.id.name] = n; });
const alias = {}; // nom de l'alias -> {F, node}
const chains = {}; // F -> [{node, right, aliasUsed}]
const only = process.argv.slice(2);
ast.body.forEach(n => {
  if (n.type === 'VariableDeclaration' && n.declarations.length === 1) {
    const d = n.declarations[0];
    if (d.init && d.init.type === 'Identifier' && decl[d.init.name]) alias[d.id.name] = { F: d.init.name, node: n };
  }
  if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression' && n.expression.left.type === 'Identifier' && /Function/.test(n.expression.right.type)) {
    const F = n.expression.left.name;
    if (only.length && !only.includes(F)) return;
    const body = js.slice(n.expression.right.start, n.expression.right.end);
    const used = Object.keys(alias).filter(k => alias[k].F === F && new RegExp('\\b' + k.replace(/\$/g, '\\$') + '\\b').test(body));
    (chains[F] = chains[F] || []).push({ node: n, right: n.expression.right, used });
  }
});
const edits = []; // {start, end, text}
const fnText = (name, right) => {
  const src = js.slice(right.start, right.end);
  if (right.type === 'FunctionExpression') return src.replace(/^function\s*\(/, `function ${name}(`);
  // arrow: (a, b) => {...}  o  (a) => expr
  const params = js.slice(right.params.length ? right.params[0].start : right.start, right.params.length ? right.params[right.params.length - 1].end : right.start);
  const body = js.slice(right.body.start, right.body.end);
  return `function ${name}(${params}) ` + (right.body.type === 'BlockStatement' ? body : `{ return ${body}; }`);
};
const lineEnd = p => { const i = js.indexOf('\n', p); return i < 0 ? js.length : i + 1; };
const report = [];
for (const [F, layers] of Object.entries(chains)) {
  const base = decl[F];
  if (!base) { report.push(`!! ${F}: sense declaració base`); continue; }
  // última substitució completa: tot el que hi ha abans és codi mort
  let lastReplace = -1;
  layers.forEach((L, i) => { if (!L.used.length) lastReplace = i; });
  const live = lastReplace >= 0 ? layers.slice(lastReplace) : layers;
  const dead = lastReplace >= 0 ? layers.slice(0, lastReplace) : [];
  const names = [];
  // la base: morta si hi ha substitució completa; si no, es reanomena
  if (lastReplace >= 0) edits.push({ start: base.start, end: lineEnd(base.end), text: '' });
  else { names.push(`${F}__base`); edits.push({ start: base.id.start, end: base.id.end, text: `${F}__base` }); }
  dead.forEach(L => edits.push({ start: L.node.start, end: lineEnd(L.node.end), text: '' }));
  live.forEach((L, i) => {
    const name = i === live.length - 1 ? F : `${F}__${tagOf(L.node.start)}${live.filter((x, j) => j < i && tagOf(x.node.start) === tagOf(L.node.start)).length || ''}`;
    let text = fnText(name, L.right);
    L.used.forEach(a => { text = text.replace(new RegExp('\\b' + a.replace(/\$/g, '\\$') + '\\b', 'g'), names[names.length - 1]); });
    names.push(name);
    edits.push({ start: L.node.start, end: L.node.end, text });
  });
  // alias: esborrar-los tots (de qualsevol capa, viva o morta)
  Object.entries(alias).filter(([k, v]) => v.F === F).forEach(([k, v]) => edits.push({ start: v.node.start, end: lineEnd(v.node.end), text: '' }));
  report.push(`${F}: ${names.join(' → ')}${dead.length ? `  (${dead.length} capa/es morta/es eliminada/es)` : ''}${lastReplace >= 0 ? '  (base morta eliminada)' : ''}`);
}
// aplicar de darrere cap endavant, sense solapaments
edits.sort((a, b) => b.start - a.start);
for (let i = 1; i < edits.length; i++) if (edits[i].end > edits[i - 1].start) throw new Error('edicions solapades a ' + edits[i].start);
const newStarts = starts.slice();
edits.forEach(e => {
  js = js.slice(0, e.start) + e.text + js.slice(e.end);
  const delta = e.text.length - (e.end - e.start);
  for (let k = 0; k < newStarts.length; k++) if (starts[k] > e.start) newStarts[k] += delta;
});
files.forEach((f, k) => fs.writeFileSync(path.join(DIR, f), js.slice(newStarts[k], k + 1 < files.length ? newStarts[k + 1] : js.length)));
console.log(report.join('\n'));
