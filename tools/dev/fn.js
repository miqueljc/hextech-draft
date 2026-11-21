// Eina de refactor: opera sobre funcions de primer nivell dels mòduls de src/app (ordre de modules.txt).
//   node tools/dev/fn.js get NOM            mostra el codi (i el fitxer)
//   node tools/dev/fn.js del NOM [NOM...]   l'esborra
//   node tools/dev/fn.js set NOM fitxer.js  substitueix la funció pel contingut del fitxer
//   node tools/dev/fn.js mv NOM modul.js    la mou al final d'un altre mòdul (les declaracions de funció no depenen de l'ordre)
const acorn = require('/opt/npm-tools/node_modules/acorn');
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'src', 'app');
const ORDER = fs.readFileSync(path.join(DIR, 'modules.txt'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
const [op, ...args] = process.argv.slice(2);
function find(name) {
  for (const f of ORDER) {
    const src = fs.readFileSync(path.join(DIR, f), 'utf8');
    let ast; try { ast = acorn.parse(src, { ecmaVersion: 2022, allowReturnOutsideFunction: true }); } catch (e) { continue; }
    const n = ast.body.find(x => x.type === 'FunctionDeclaration' && x.id.name === name);
    if (n) return { f, src, n };
  }
  throw new Error('no trobada: ' + name);
}
const lineEnd = (s, p) => { const i = s.indexOf('\n', p); return i < 0 ? s.length : i + 1; };
if (op === 'get') args.forEach(a => { const { f, src, n } = find(a); console.log(`// ${f}\n` + src.slice(n.start, n.end)); });
else if (op === 'del') args.forEach(a => { const { f, src, n } = find(a); fs.writeFileSync(path.join(DIR, f), src.slice(0, n.start) + src.slice(lineEnd(src, n.end))); console.log('esborrada', a, 'de', f); });
else if (op === 'set') { const { f, src, n } = find(args[0]); const text = fs.readFileSync(args[1], 'utf8').replace(/\n$/, ''); fs.writeFileSync(path.join(DIR, f), src.slice(0, n.start) + text + src.slice(n.end)); console.log('substituïda', args[0], 'a', f); }
else if (op === 'mv') {
  const { f, src, n } = find(args[0]); const text = src.slice(n.start, lineEnd(src, n.end));
  let lead = ''; const before = src.slice(0, n.start); const m = before.match(/((?:\/\/[^\n]*\n)+)$/); // comentaris just a sobre
  const start = m ? n.start - m[1].length : n.start; if (m) lead = m[1];
  fs.writeFileSync(path.join(DIR, f), src.slice(0, start) + src.slice(lineEnd(src, n.end)));
  const dst = path.join(DIR, args[1]); const d = fs.readFileSync(dst, 'utf8');
  fs.writeFileSync(dst, d.replace(/\n*$/, '\n') + lead + text); console.log('moguda', args[0], 'de', f, 'a', args[1]);
}
else console.log('ús: get|del|set|mv');
