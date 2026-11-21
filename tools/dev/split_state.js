// Eina de refactor (fase 4): d'un mòdul de ui/, treu l'estat i les dades de primer nivell que no toquen la pantalla
// i les funcions indicades (o totes les que no toquen la pantalla amb --pure), i les posa en un mòdul nou
// que es carrega just ABANS. L'ordre relatiu de les instruccions mogudes es manté.
//   node tools/dev/split_state.js <ui/mòdul.js> <engine|data/nou.js> [--pure] [funció ...]
const acorn = require('/opt/npm-tools/node_modules/acorn');
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'src', 'app');
const args = process.argv.slice(2);
const [mod, out] = args; const pure = args.includes('--pure'); const fns = args.slice(2).filter(a => a !== '--pure');
const DOM = /\b(document|window|navigator|alert|confirm|location|setTimeout|innerHTML|getElementById|IS_DESK|renderAll|render[A-Z]\w*)\b|<(div|span|strong|br|ul|li|table|button|b|h4|em|td|tr|th|p|small|select|option|input|label|img|a|style)\b/;
const src = fs.readFileSync(path.join(DIR, mod), 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 2022 });
const take = [];
for (const n of ast.body) {
  const t = src.slice(n.start, n.end);
  if (n.type === 'FunctionDeclaration') { if (fns.includes(n.id.name) || (pure && !DOM.test(t))) take.push(n); continue; }
  if (!DOM.test(t)) take.push(n);
}
const lineEnd = p => { const i = src.indexOf('\n', p); return i < 0 ? src.length : i + 1; };
const ranges = take.map(n => {
  let s = n.start; const before = src.slice(0, s); const m = before.match(/((?:[ \t]*\/\/[^\n]*\n)+)$/);
  if (m && !/^\/\/ ={3,}/.test(m[1].trim())) s -= m[1].length;
  // si una altra instrucció comença a la mateixa línia, tallem just al final d'aquesta
  const le = lineEnd(n.end), next = ast.body.find(x => x.start >= n.end && x.start < le);
  return [s, next ? next.start : le];
}).filter(([a], i, arr) => i === 0 || a >= arr[i - 1][1]);
let rest = '', moved = '', p = 0;
ranges.forEach(([a, b]) => { rest += src.slice(p, a); let t = src.slice(a, b); if (!t.endsWith('\n')) t += '\n'; moved += t; p = b; });
rest += src.slice(p);
const dst = path.join(DIR, out);
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(path.join(DIR, mod), rest);
fs.writeFileSync(dst, `// ===== ${path.basename(out, '.js')} (estat i lògica, separat de ${mod}) =====\n` + moved);
const order = fs.readFileSync(path.join(DIR, 'modules.txt'), 'utf8').split('\n');
const i = order.indexOf(mod); if (i < 0) throw new Error('no és a modules.txt: ' + mod);
order.splice(i, 0, out);
fs.writeFileSync(path.join(DIR, 'modules.txt'), order.join('\n'));
console.log(`${mod} → ${out}: ${take.length} instruccions (${take.filter(n => n.type === 'FunctionDeclaration').map(n => n.id.name).join(' ')})`);
