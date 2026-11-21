#!/usr/bin/env node
// Actualitza les builds reals (hextech_builds_v1) i, opcionalment, els OP picks del parc (hextech_oppicks_v1).
//
// Ús:  node tools/update_builds.mjs <builds.json> [--oppicks op.json] [--replace] [--dry] [--data data.json]
//
// <builds.json>:
// { "patch": "16.24", "source": "op.gg Emerald+",
//   "builds": {
//     "Malphite|Top": { "keystone": "Arcane Comet", "primary": ["Manaflow Band", "Transcendence", "Scorch"],
//                       "secondary": { "tree": "Resolve", "runes": ["Second Wind", "Overgrowth"] },
//                       "shards": ["Ability Haste", "Health Scaling", "Health Scaling"],
//                       "summoners": "Flash + Teleport", "start": "Doran's Ring + Health Potion",
//                       "boots": "Plated Steelcaps", "core": ["Sunfire Aegis", "Thornmail", "Frozen Heart"],
//                       "alt": [], "fourth": ["Jak'Sho, The Protean"], "patch": "16.24" } } }
// - També accepta cada build en el format compacte de l'app (array de 11 posicions).
// - Valida campió, rol i runes (keystone a la fila 0, minors de files diferents, secundari d'un altre arbre).
// - Per defecte fusiona amb les builds existents; amb --replace les substitueix totes.
// <op.json>: { "patch": "26.24", "source": "Skill Capped", "roles": { "Top": [...], "Jg": [...], ... } }
import fs from 'node:fs';
import { parseArgs, readData, writeData, canon, ROLES, ROLE_ALIAS } from './lib_data.mjs';

const RUNE_ROWS = {
  Precision: [['Press the Attack', 'Lethal Tempo', 'Fleet Footwork', 'Conqueror'], ['Absorb Life', 'Triumph', 'Presence of Mind'], ['Legend: Alacrity', 'Legend: Haste', 'Legend: Bloodline'], ['Coup de Grace', 'Cut Down', 'Last Stand']],
  Domination: [['Electrocute', 'Dark Harvest', 'Hail of Blades'], ['Cheap Shot', 'Taste of Blood', 'Sudden Impact'], ['Sixth Sense', 'Grisly Mementos', 'Deep Ward'], ['Treasure Hunter', 'Relentless Hunter', 'Ultimate Hunter']],
  Sorcery: [['Summon Aery', 'Arcane Comet', "Stormraider's Surge", 'Deathfire Touch'], ['Axiom Arcanist', 'Manaflow Band', 'Nimbus Cloak'], ['Transcendence', 'Celerity', 'Absolute Focus'], ['Scorch', 'Waterwalking', 'Gathering Storm']],
  Resolve: [['Grasp of the Undying', 'Aftershock', 'Guardian'], ['Demolish', 'Font of Life', 'Shield Bash'], ['Conditioning', 'Second Wind', 'Bone Plating'], ['Overgrowth', 'Revitalize', 'Unflinching']],
  Inspiration: [['Glacial Augment', 'Unsealed Spellbook', 'First Strike'], ['Hextech Flashtraption', 'Magical Footwear', 'Cash Back'], ['Triple Tonic', 'Time Warp Tonic', 'Biscuit Delivery'], ['Cosmic Insight', 'Approach Velocity', 'Jack of All Trades']]
};
const SHARDS = ['Adaptive Force', 'Attack Speed', 'Ability Haste', 'Move Speed', 'Health Scaling', 'Health', 'Tenacity and Slow Resist'];
const where = r => { for (const t in RUNE_ROWS) { const i = RUNE_ROWS[t].findIndex(x => x.includes(r)); if (i >= 0) return { t, i }; } return null; };

const opt = parseArgs(process.argv);
if (!opt.files.length && !opt.vals.oppicks) { console.error('Ús: node tools/update_builds.mjs <builds.json> [--oppicks op.json] [--replace] [--dry]'); process.exit(1); }
const data = readData(opt.dataFile);
const errors = [];

function toArray(k, b, patch) {
  if (Array.isArray(b)) return b;
  const sec = b.secondary || {};
  return [b.keystone, (b.primary || []).join(' · '), `${sec.tree}: ${(sec.runes || []).join(' · ')}`, (b.shards || []).join('·'),
    b.summoners, b.start, b.boots, b.core || [], b.alt || [], b.fourth || [], b.patch || patch];
}
function validate(k, a) {
  const [ks, pri, sec, sh, sums, start, boots, core] = a;
  const e = m => errors.push(`${k}: ${m}`);
  const kw = where(ks); if (!kw || kw.i !== 0) e(`keystone desconeguda "${ks}"`);
  const pm = String(pri).split(' · '), rows = pm.map(m => { const w = where(m); if (!w || (kw && w.t !== kw.t)) e(`runa primària "${m}" no és de ${kw ? kw.t : '?'}`); return w && w.i; });
  if (pm.length !== 3 || new Set(rows).size !== 3 || rows.includes(0)) e('les 3 primàries han de ser de files 1, 2 i 3');
  const st = String(sec).slice(0, String(sec).indexOf(': ')), sm = String(sec).slice(String(sec).indexOf(': ') + 2).split(' · ');
  if (!RUNE_ROWS[st] || (kw && st === kw.t)) e(`arbre secundari "${st}" no vàlid`);
  const sr = sm.map(m => { const w = where(m); if (!w || w.t !== st) e(`runa secundària "${m}" no és de ${st}`); return w && w.i; });
  if (sm.length !== 2 || sr[0] === sr[1] || sr.includes(0)) e('les 2 secundàries han de ser de files diferents (1-3)');
  String(sh).split('·').forEach(s => { if (!SHARDS.includes(s)) e(`fragment desconegut "${s}"`); });
  if (!/ \+ /.test(sums || '')) e('summoners han de ser "A + B"');
  if (!start || !boots) e('falta inici o botes');
  if (!Array.isArray(core) || core.length !== 3) e('el core ha de tenir 3 objectes');
}

let msg = [];
if (opt.files[0]) {
  const inp = JSON.parse(fs.readFileSync(opt.files[0], 'utf8'));
  const patch = inp.patch || '';
  const prev = data.data.hextech_builds_v1 || {};
  const builds = opt.flags.has('replace') ? {} : { ...(prev.builds || {}) };
  let n = 0;
  Object.entries(inp.builds || {}).forEach(([k, b]) => {
    const [c0, r0] = k.split('|'), c = canon(c0), r = ROLES.includes(r0) ? r0 : ROLE_ALIAS[String(r0).toLowerCase()];
    if (!c || !r) { errors.push(`${k}: campió o rol desconegut`); return; }
    const key = `${c}|${r}`, a = toArray(key, b, patch);
    validate(key, a); builds[key] = a; n++;
  });
  data.data.hextech_builds_v1 = { patch: patch || prev.patch || '', source: inp.source || prev.source || 'op.gg', updated: new Date().toISOString().slice(0, 10), builds };
  msg.push(`${n} builds (${Object.keys(builds).length} en total, parc ${data.data.hextech_builds_v1.patch})`);
}
if (opt.vals.oppicks) {
  const op = JSON.parse(fs.readFileSync(opt.vals.oppicks, 'utf8')), roles = {};
  ROLES.forEach(r => { roles[r] = (op.roles && op.roles[r] || []).map(c => { const x = canon(c); if (!x) errors.push(`OP ${r}: "${c}" desconegut`); return x; }).filter(Boolean); });
  data.data.hextech_oppicks_v1 = { patch: op.patch || '', source: op.source || 'Skill Capped', roles };
  msg.push(`OP picks ${op.patch || ''}: ${ROLES.map(r => r + ' ' + roles[r].length).join(', ')}`);
}
if (errors.length) { console.error('Errors (no s\'ha escrit res):\n  ' + errors.join('\n  ')); process.exit(2); }
console.log(msg.join(' · '));
writeData(opt.dataFile, data, '', opt.dry);
