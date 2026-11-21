// Eina de refactor: opera sobre funcions de primer nivell de src/app/js.
//   node tools/dev/fn.js get NOM            mostra el codi (i el fitxer)
//   node tools/dev/fn.js del NOM [NOM...]   l'esborra
//   node tools/dev/fn.js set NOM fitxer.js  substitueix la funció pel contingut del fitxer
const acorn = require('/opt/npm-tools/node_modules/acorn');
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', '..', 'src', 'app', 'js');
const [op, ...args] = process.argv.slice(2);
function find(name) {
  for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.js')).sort()) {
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
else console.log('ús: get|del|set');
