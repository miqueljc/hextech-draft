// Utilitats compartides per les eines que actualitzen data.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const here = path.dirname(fileURLToPath(import.meta.url));
export const ROLES = ['Top', 'Jg', 'Mid', 'Bot', 'Sup'];
export const ROLE_ALIAS = { top: 'Top', jungle: 'Jg', jg: 'Jg', jungla: 'Jg', mid: 'Mid', middle: 'Mid', bot: 'Bot', adc: 'Bot', bottom: 'Bot', sup: 'Sup', support: 'Sup', supp: 'Sup' };
export const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const cat = JSON.parse(fs.readFileSync(path.join(here, 'champions.json'), 'utf8'));
const nameMap = {}; cat.champions.forEach(c => { nameMap[norm(c)] = c; });
Object.entries(cat.aliases || {}).forEach(([a, c]) => { nameMap[norm(a)] = c; });
export const canon = s => nameMap[norm(s)] || null;
export const today = new Date().toISOString().slice(0, 10);

export function parseArgs(argv) {
  const args = argv.slice(2), opt = { files: [], flags: new Set(), vals: {} };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--data' || a === '--oppicks' || a === '--patch' || a === '--weight') opt.vals[a.slice(2)] = args[++i];
    else if (a.startsWith('--')) opt.flags.add(a.slice(2));
    else opt.files.push(a);
  }
  opt.dataFile = opt.vals.data || path.join(here, '..', 'data.json');
  opt.dry = opt.flags.has('dry');
  return opt;
}
export function readData(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
// Mateix format que la resta de data.json: una entrada per línia
export function writeData(file, data, note, dry) {
  data.version = (+data.version || 0) + 1;
  data.updated = today;
  if (note) data.source = String(data.source || '').replace(/\s*$/, '') + ' ' + note;
  const fmt = v => Array.isArray(v) ? '[\n' + v.map(x => '   ' + JSON.stringify(x)).join(',\n') + '\n  ]'
    : (v && typeof v === 'object') ? '{\n' + Object.entries(v).map(([a, x]) => '   ' + JSON.stringify(a) + ': ' + JSON.stringify(x)).join(',\n') + '\n  }' : JSON.stringify(v);
  const out = '{\n "version": ' + data.version + ',\n "updated": ' + JSON.stringify(data.updated) + ',\n "source": ' + JSON.stringify(data.source || '') + ',\n "data": {\n'
    + Object.entries(data.data).map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + fmt(v)).join(',\n') + '\n }\n}\n';
  JSON.parse(out);
  if (dry) console.log(`(--dry: no s'ha escrit res; seria data.json v${data.version})`);
  else {
    fs.writeFileSync(file, out); console.log(`Escrit ${file} (v${data.version}, ${today})`);
    // data.json és l'única font: l'app en porta una còpia per quan no hi ha connexió, que es torna a muntar
    const root = path.join(here, '..');
    if (path.resolve(file) === path.join(root, 'data.json')) {
      try { execFileSync('python3', [path.join(root, 'build.py')], { cwd: root, stdio: 'ignore' }); console.log('Tornats a muntar pc.html i index.html (còpia sense connexió al dia)'); }
      catch (e) { console.log('AVÍS: no s\'han pogut tornar a muntar pc.html i index.html; executa python3 build.py'); }
    }
  }
}
