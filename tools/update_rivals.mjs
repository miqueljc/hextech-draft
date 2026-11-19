#!/usr/bin/env node
// Afegeix o actualitza la fitxa d'un equip rival a data.json (clau hextech_rivals_v1).
//
// Ús:  node tools/update_rivals.mjs <rival.json> [--data data.json] [--dry]
//
// <rival.json>:
// {
//   "id": "rivals-fc",                 // identificador estable (minúscules, guions)
//   "name": "Rivals FC",
//   "source": "op.gg temporada 2026",  // opcional
//   "players": [
//     { "name": "Nom#TAG", "role": "Top",          // rol opcional: si falta, s'estima
//       "champs": [ { "champ": "Poppy", "w": 25, "l": 18, "wr": 58 } ] }   // o { games, wr }
//   ]
// }
// - Normalitza noms de campió als de l'app (tools/champions.json) i descarta els desconeguts.
// - Estima el rol de cada jugador amb les taxes de pick per rol de data.json (hextech_rolerates_v1)
//   i, si no hi ha rols, reparteix els 5 rols maximitzant l'encaix de tot l'equip.
// - Guarda els 12 campions amb més partides (mínim 2 partides).
// - Puja la versió de data.json i n'actualitza la data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const inFile = args.find(a => !a.startsWith('--'));
const dataFile = (args[args.indexOf('--data') + 1] && args.includes('--data')) ? args[args.indexOf('--data') + 1] : path.join(here, '..', 'data.json');
const dry = args.includes('--dry');
if (!inFile) { console.error('Ús: node tools/update_rivals.mjs <rival.json> [--data data.json] [--dry]'); process.exit(1); }

const ROLES = ['Top', 'Jg', 'Mid', 'Bot', 'Sup'];
const ROLE_ALIAS = { top: 'Top', jungle: 'Jg', jg: 'Jg', jungla: 'Jg', mid: 'Mid', middle: 'Mid', bot: 'Bot', adc: 'Bot', bottom: 'Bot', sup: 'Sup', support: 'Sup', supp: 'Sup' };
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const cat = JSON.parse(fs.readFileSync(path.join(here, 'champions.json'), 'utf8'));
const nameMap = {}; cat.champions.forEach(c => { nameMap[norm(c)] = c; }); Object.assign(nameMap, cat.aliases || {});
const canon = s => nameMap[norm(s)] || null;

const rival = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const dataTxt = fs.readFileSync(dataFile, 'utf8');
const data = JSON.parse(dataTxt);
const rates = (data.data && data.data.hextech_rolerates_v1) || {};
const share = c => { const r = rates[c]; if (!r) return null; const s = r.reduce((a, b) => a + b, 0); return s ? r.map(x => x / s) : null; };

if (!rival.id || !/^[a-z0-9-]+$/.test(rival.id)) { console.error('Cal un "id" en minúscules i guions (p. ex. "rivals-fc").'); process.exit(1); }
if (!Array.isArray(rival.players) || !rival.players.length) { console.error('Cal una llista "players".'); process.exit(1); }

const unknown = new Set();
const players = rival.players.map(p => {
  const champs = (p.champs || []).map(o => {
    const c = canon(o.champ); if (!c) { unknown.add(o.champ); return null; }
    const games = Number.isFinite(+o.games) && +o.games > 0 ? +o.games : (+o.w || 0) + (+o.l || 0);
    const wr = Number.isFinite(+o.wr) ? Math.round(+o.wr) : (games ? Math.round(100 * (+o.w || 0) / games) : 50);
    return { champ: c, games, wr };
  }).filter(o => o && o.games >= 2);
  // fusiona duplicats (p. ex. el mateix campió en dues cues)
  const m = new Map(); champs.forEach(o => { const x = m.get(o.champ); if (x) { const g = x.games + o.games; x.wr = Math.round((x.wr * x.games + o.wr * o.games) / g); x.games = g; } else m.set(o.champ, { ...o }); });
  const list = [...m.values()].sort((a, b) => b.games - a.games).slice(0, 12);
  const fit = ROLES.map((r, i) => list.reduce((s, o) => { const sh = share(o.champ); return s + o.games * (sh ? sh[i] : 0); }, 0));
  const tot = fit.reduce((a, b) => a + b, 0) || 1;
  const role = p.role ? (ROLE_ALIAS[norm(p.role)] || (ROLES.includes(p.role) ? p.role : null)) : null;
  return { name: String(p.name || '').trim(), role, fit: fit.map(x => x / tot), games: list.reduce((s, o) => s + o.games, 0), champs: list };
});

// Rols: els donats es respecten; la resta es reparteixen pel millor encaix conjunt
const free = ROLES.filter(r => !players.some(p => p.role === r));
const todo = players.filter(p => !p.role);
let best = null;
(function perm(i, used, acc, sc) {
  if (i === todo.length) { if (!best || sc > best.sc) best = { sc, acc: acc.slice() }; return; }
  for (const r of free) { if (used.has(r)) continue; used.add(r); acc.push(r); perm(i + 1, used, acc, sc + todo[i].fit[ROLES.indexOf(r)]); acc.pop(); used.delete(r); }
})(0, new Set(), [], 0);
todo.forEach((p, i) => { p.roleAuto = best && best.acc[i] ? best.acc[i] : ROLES[p.fit.indexOf(Math.max(...p.fit))]; });

const today = new Date().toISOString().slice(0, 10);
const team = {
  id: rival.id, name: rival.name || rival.id, updated: today, source: rival.source || 'op.gg',
  players: players.map(p => ({ name: p.name, role: p.role || null, roleAuto: p.role || p.roleAuto, games: p.games, champs: p.champs }))
};

data.data = data.data || {};
const store = data.data.hextech_rivals_v1 && Array.isArray(data.data.hextech_rivals_v1.teams) ? data.data.hextech_rivals_v1 : { teams: [] };
const idx = store.teams.findIndex(t => t.id === team.id);
if (idx >= 0) store.teams[idx] = team; else store.teams.push(team);
data.data.hextech_rivals_v1 = store;
data.version = (+data.version || 0) + 1;
data.updated = today;

// mateix format que la resta de data.json: una entrada per línia
const fmt = v => Array.isArray(v) ? '[\n' + v.map(x => '   ' + JSON.stringify(x)).join(',\n') + '\n  ]'
  : '{\n' + Object.entries(v).map(([a, x]) => '   ' + JSON.stringify(a) + ': ' + JSON.stringify(x)).join(',\n') + '\n  }';
const out = '{\n "version": ' + data.version + ',\n "updated": ' + JSON.stringify(data.updated) + ',\n "source": ' + JSON.stringify(data.source || '') + ',\n "data": {\n'
  + Object.entries(data.data).map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + fmt(v)).join(',\n') + '\n }\n}\n';
JSON.parse(out);

console.log(`Equip: ${team.name} (${team.id}) · data.json v${data.version} · ${today}`);
team.players.forEach(p => console.log(`  ${(p.role || p.roleAuto + '*').padEnd(5)} ${p.name.padEnd(22)} ${p.games} partides: ${p.champs.slice(0, 6).map(o => `${o.champ} ${o.games}p ${o.wr}%`).join(', ')}`));
if (todo.length) console.log('  * rol estimat pels campions jugats');
if (unknown.size) console.log('  Campions no reconeguts (descartats): ' + [...unknown].join(', '));
if (dry) console.log('(--dry: no s\'ha escrit res)');
else { fs.writeFileSync(dataFile, out); console.log('Escrit ' + dataFile); }
