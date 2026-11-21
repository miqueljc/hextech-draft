#!/usr/bin/env node
// Afegeix partides a l'historial compartit de l'equip (hextech_history_v1).
//
// Ús:  node tools/update_history.mjs <historial.json> [més fitxers...] [--dry] [--data data.json]
//
// <historial.json> és el que copia el botó «📋 Copia l'historial» de l'app (pestanya Dades).
// - Es fusionen sense duplicats (data + costat + picks propis + picks rivals).
// - Només es guarden partides amb resultat (W o L).
import fs from 'node:fs';
import { parseArgs, readData, writeData, canon } from './lib_data.mjs';

const opt = parseArgs(process.argv);
if (!opt.files.length) { console.error('Ús: node tools/update_history.mjs <historial.json> [--dry]'); process.exit(1); }
const data = readData(opt.dataFile);
const prev = Array.isArray(data.data.hextech_history_v1) ? data.data.hextech_history_v1 : [];
const key = h => [h.date, h.side, (h.us || []).slice().sort().join('+'), (h.enemy || []).slice().sort().join('+')].join('|');
const seen = new Set(prev.map(key)), out = prev.slice();
let added = 0, skipped = 0;
opt.files.forEach(f => {
  const list = JSON.parse(fs.readFileSync(f, 'utf8'));
  (Array.isArray(list) ? list : []).forEach(h => {
    if (!h || (h.result !== 'W' && h.result !== 'L') || !Array.isArray(h.us)) { skipped++; return; }
    const g = { ...h, us: h.us.map(c => canon(c) || c), enemy: (h.enemy || []).map(c => canon(c) || c),
      roles: (h.roles || []).map(x => ({ ...x, champ: x.champ ? (canon(x.champ) || x.champ) : x.champ })) };
    const k = key(g); if (seen.has(k)) { skipped++; return; }
    seen.add(k); out.push(g); added++;
  });
});
out.sort((a, b) => String(a.date).localeCompare(String(b.date)));
data.data.hextech_history_v1 = out;
const w = out.filter(h => h.result === 'W').length;
console.log(`+${added} partides (${skipped} repetides o sense resultat) · total ${out.length}: ${w}V-${out.length - w}D`);
writeData(opt.dataFile, data, '', opt.dry);
