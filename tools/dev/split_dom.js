// Eina de refactor (fase 4): treu d'un mòdul les instruccions de primer nivell que toquen la pantalla
// (estils injectats, escoltadors d'esdeveniments, temporitzadors) i les funcions indicades, i les posa
// en un mòdul nou de ui/ que es carrega just després. L'ordre relatiu de les instruccions mogudes es manté.
//   node tools/dev/split_dom.js <mòdul> <ui/nou.js> [funció ...]
const acorn = require('/opt/npm-tools/node_modules/acorn');
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'src', 'app');
const [mod, out, ...fns] = process.argv.slice(2);
const RX = /\b(document|window|setTimeout|requestAnimationFrame)\b/;
const src = fs.readFileSync(path.join(DIR, mod), 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022 });
const take = [];
for (const n of ast.body) {
  const t = src.slice(n.start, n.end);
  if (n.type === 'FunctionDeclaration') { if (fns.includes(n.id.name)) take.push(n); continue; }
  if (n.type === 'VariableDeclaration') continue; // les dades i l'estat es queden
  if (RX.test(t)) take.push(n);
}
const found = take.filter(n => n.type === 'FunctionDeclaration').map(n => n.id.name);
const missing = fns.filter(f => !found.includes(f));
if (missing.length) throw new Error('funcions no trobades a ' + mod + ': ' + missing.join(', '));
// tram de cada node: comentaris de just a sobre + fins al final de línia
const lineEnd = p => { const i = src.indexOf('\n', p); return i < 0 ? src.length : i + 1; };
const ranges = take.map(n => {
  let s = n.start; const before = src.slice(0, s); const m = before.match(/((?:[ \t]*\/\/[^\n]*\n)+)$/);
  if (m && !/^\/\/ ={3,}/.test(m[1].trim())) s -= m[1].length;
  return [s, lineEnd(n.end)];
});
let rest = '', moved = '', p = 0;
ranges.forEach(([a, b]) => { rest += src.slice(p, a); moved += src.slice(a, b); p = b; });
rest += src.slice(p);
const title = `// ===== Pantalla: ${path.basename(mod, '.js')} (separat del motor) =====\n`;
const dst = path.join(DIR, out);
fs.writeFileSync(path.join(DIR, mod), rest);
if (fs.existsSync(dst)) fs.writeFileSync(dst, fs.readFileSync(dst, 'utf8').replace(/\n*$/, '\n') + moved);
else {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, title + moved);
  const order = fs.readFileSync(path.join(DIR, 'modules.txt'), 'utf8').split('\n');
  const i = order.indexOf(mod); if (i < 0) throw new Error('no és a modules.txt: ' + mod);
  order.splice(i + 1, 0, out);
  fs.writeFileSync(path.join(DIR, 'modules.txt'), order.join('\n'));
}
console.log(`${mod} → ${out}: ${take.length} instruccions (${found.length} funcions)`);
