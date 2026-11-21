// ===== cataleg-icones (estat i lògica, separat de ui/icones-builds.js) =====
// ---------- 3. Icones de runes, encanteris i objectes (catàleg oficial de Data Dragon) ----------
// Catàleg oficial verificat (Data Dragon 16.23.1) inclòs a l'app; s'actualitza sol quan surt una versió nova
const DD_CAT_KEY = 'hextech_ddcat_v2';
let DD_CAT = DD_CAT_DEFAULT;
try { const c = JSON.parse(localStorage.getItem(DD_CAT_KEY) || 'null'); if (c && c.items && c.spells && Object.keys(c.spells).length) DD_CAT = c; } catch (e) {}
function ddNorm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
const ITEM_ALIAS = { ludensecho: ['ludenscompanion', 'ludensecho'], objectedesuport: ['worldatlas', 'runiccompass', 'bountyofworlds'], pociodevida: ['healthpotion'], botesdetier3delaquestdemid: [] };
const SHARD_ICON = { adaptiveforce: 'StatModsAdaptiveForceIcon', attackspeed: 'StatModsAttackSpeedIcon', abilityhaste: 'StatModsCDRScalingIcon', healthscaling: 'StatModsHealthScalingIcon', tenacityandslowresist: 'StatModsTenacityIcon', health: 'StatModsHealthPlusIcon', movespeed: 'StatModsMovementSpeedIcon' };
let _ddCatLoading = false;
function itemUrl(name) {
  if (!DD_CAT) return null;
  const k = ddNorm(name), keys = ITEM_ALIAS[k] || [k];
  for (const kk of keys) { const id = DD_CAT.items[kk]; if (id) return `https://ddragon.leagueoflegends.com/cdn/${DD_CAT.ver}/img/item/${id}.png`; }
  return null;
}
function runeUrl(name) { const p = DD_CAT && (DD_CAT.runes[ddNorm(name)] || DD_CAT.trees[ddNorm(name)]); return p ? `https://ddragon.leagueoflegends.com/cdn/img/${p}` : null; }
// "A / B", "A o B", "A → B", "A + B" amb notes entre parèntesis
function itemTokens(str) {
  const notes = []; const clean = String(str || '').replace(/\(([^)]*)\)/g, (_, n) => { notes.push(n); return ''; }).trim();
  const parts = clean.split(/\s+(\/|o|→|\+)\s+/);
  const out = [];
  for (let i = 0; i < parts.length; i += 2) out.push({ name: parts[i].trim(), sep: parts[i + 1] || '' });
  return { list: out.filter(x => x.name), note: notes.join('; ') };
}
