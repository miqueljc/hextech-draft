#!/usr/bin/env node
// Barreja winrates de matchups d'un parc nou amb els que ja hi ha (hextech_matchups_v1).
//
// Ús:  node tools/merge_matchups.mjs <carpeta> [--weight 0.5] [--dry] [--data data.json]
//
// <carpeta> conté un fitxer de text per campió (nom del fitxer = campió, p. ex. "Malphite.txt"),
// amb el winrate DEL CAMPIÓ contra cada rival i les partides, separats per comes:
//   Dr. Mundo 38.5% 122, Renekton 40.8% 76, Sett 41.8% 91, ...
// (és el que mostra metabot.gg/en/league/champion/<campió>/counters, convertit al winrate del campió).
// - Les dades noves pesen 1 i les antigues --weight (0,5 per defecte): el parc nou mana però
//   una mostra petita no esborra la història.
// - També actualitza el matchup invers del rival si el rival no té fitxer propi.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, readData, writeData, canon } from './lib_data.mjs';

const opt = parseArgs(process.argv);
const dir = opt.files[0];
if (!dir) { console.error('Ús: node tools/merge_matchups.mjs <carpeta> [--weight 0.5] [--dry]'); process.exit(1); }
const W = opt.vals.weight != null ? +opt.vals.weight : 0.5;
const data = readData(opt.dataFile);
const m = data.data.hextech_matchups_v1 || {};
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
const own = new Set(files.map(f => canon(f.slice(0, -4))).filter(Boolean));
let blended = 0, added = 0; const unknown = new Set();
files.forEach(f => {
  const c = canon(f.slice(0, -4)); if (!c) { unknown.add(f); return; }
  fs.readFileSync(path.join(dir, f), 'utf8').split(',').forEach(part => {
    const x = part.match(/^\s*(.+?)\s+([\d.]+)%\s+(\d+)/); if (!x) return;
    const o = canon(x[1]); if (!o) { unknown.add(x[1]); return; }
    const wn = +x[2], gn = +x[3];
    m[c] = m[c] || {};
    const old = m[c][o]; let wr = wn, g = gn;
    if (old) { const go = old[1] * W; wr = (wn * gn + old[0] * go) / (gn + go); g = Math.round(gn + go); blended++; } else added++;
    m[c][o] = [Math.round(wr * 10) / 10, g];
    if (!own.has(o) && m[o]) m[o][c] = [Math.round((100 - wr) * 10) / 10, g];
  });
});
data.data.hextech_matchups_v1 = m;
console.log(`${files.length} campions · ${blended} matchups barrejats · ${added} nous${unknown.size ? ' · desconeguts: ' + [...unknown].join(', ') : ''}`);
writeData(opt.dataFile, data, '', opt.dry);
