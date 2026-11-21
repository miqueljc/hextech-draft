// ===== Bloc R: comps flexibles (famílies amb alternatives) + icones de runes, encanteris i objectes =====
// ---------- 1. Famílies de composicions ----------
const COMP_ARCH_KW = [[/anti-dive|peel|protegir|front-to-back/i, 'protect'], [/wombo|engage/i, 'engage'], [/dive|skirmish/i, 'dive'], [/poke|setge/i, 'poke'], [/split/i, 'split'], [/escal/i, 'scale'], [/caçad|pick/i, 'pick']];
function compArchKey(c) {
  if (c.archKey) return c.archKey;
  const hit = COMP_ARCH_KW.find(([re]) => re.test(c.name + ' ' + (c.style || '')));
  if (hit) return hit[1];
  let best = null, bv = -1;
  GEN_ARCH.forEach(a => { const v = ROLE_ORDER.reduce((s, r) => s + Object.entries(a.w).reduce((t, [tg, w]) => t + (hasTag(c.roles[r][0], tg) ? w : 0), 0), 0); if (v > bv) { bv = v; best = a.key; } });
  return best;
}
// coincidència de rols comparant només les alineacions principals (2 primeres opcions)
function compOverlap(a, b) { return ROLE_ORDER.filter(r => (a[r] || []).slice(0, 2).some(x => (b[r] || []).slice(0, 2).includes(x))).length; }
function archOf(key) { return GEN_ARCH.find(a => a.key === key) || null; }
function archFit(c, arch) { return arch ? Object.entries(arch.w).reduce((s, [t, w]) => s + (hasTag(c, t) ? w : 0), 0) : 0; }
// Substituts funcionals: mateix rol viable, comparteix la funció clau del titular a l'arquetip i el tipus de dany als carries
function compSubstitutes(main, role, arch, exclude) {
  const keyTags = arch ? Object.entries(arch.w).filter(([t]) => hasTag(main, t)).sort((a, b) => b[1] - a[1]) : [];
  const top = keyTags.length ? keyTags[0][0] : null;
  const fm = archFit(main, arch);
  const dmg = ['ap', 'ad'].filter(t => hasTag(main, t));
  const needDmg = (role === 'Mid' || role === 'Bot') && dmg.length === 1 ? dmg[0] : null;
  const ok = c => c !== main && CHAMP_DATA[c] && !exclude.has(c) && viableRoles(c).includes(role)
    && (!top || hasTag(c, top)) && archFit(c, arch) >= fm - 3 && (!needDmg || hasTag(c, needDmg));
  const teamPool = [...new Set(ROSTER.flatMap((pl, p) => playsRole(p, role) ? poolOf(p, role) : []))];
  const rank = c => archFit(c, arch) + tierPts(c, role) * 0.6;
  const pool = teamPool.filter(ok).sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  const meta = ALL_CHAMPS.filter(c => ok(c) && !teamPool.includes(c) && ['S+', 'S', 'A'].includes(tierIn(c, role)) && roleDistOfChamp(c)[ROLE_ORDER.indexOf(role)] >= 0.15).sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  return { pool, meta };
}
function groupComps() {
  COMPS.forEach(c => { if (!c.gen) { if (!c.baseRoles) c.baseRoles = JSON.parse(JSON.stringify(c.roles)); c.roles = JSON.parse(JSON.stringify(c.baseRoles)); c.variants = [c.name]; } });
  const manual = COMPS.filter(c => !c.gen), autos = COMPS.filter(c => c.gen);
  // 1) les auto del mateix arquetip són variants d'una sola comp
  const fams = [];
  autos.forEach(a => {
    const f = fams.find(x => x.archKey === a.archKey);
    if (f) f.members.push(a); else fams.push({ archKey: a.archKey, members: [a] });
  });
  const mergeRoles = (into, list) => ROLE_ORDER.forEach(r => {
    const cnt = new Map();
    list.forEach((m, k) => (m.roles[r] || []).forEach((c, i) => cnt.set(c, (cnt.get(c) || 0) + (k === 0 ? 100 : 0) + 3 - Math.min(i, 2))));
    into.roles[r] = [...cnt.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]);
  });
  const out = manual.slice();
  fams.forEach(f => {
    const head = { ...f.members[0], roles: JSON.parse(JSON.stringify(f.members[0].roles)) };
    mergeRoles(head, f.members);
    // 2) si s'assembla molt a una comp oficial, s'hi afegeix com a variants
    let best = null, bo = 0;
    manual.forEach(m => {
      const o = Math.max(...f.members.map(x => compOverlap(m.baseRoles || m.roles, x.roles))), same = compArchKey(m) === f.archKey;
      if ((same && o >= 3) || o >= 5) { const v = o + (same ? 0.5 : 0); if (v > bo) { bo = v; best = m; } }
    });
    if (best) {
      mergeRoles(best, [{ roles: best.roles }, head]);
      best.variants.push(...f.members.map(m => m.name));
    } else {
      head.variants = f.members.map(m => m.name);
      head.name = head.name.replace(' (auto)', '') + ' (auto)';
      out.push(head);
    }
  });
  // 3) substituts funcionals per rol (del pool de l'equip i del meta)
  out.forEach(c => {
    const arch = archOf(compArchKey(c));
    c.alt = {};
    ROLE_ORDER.forEach(r => {
      const main = c.roles[r][0]; if (!main) return;
      const s = compSubstitutes(main, r, arch, new Set(c.roles[r]));
      s.pool.forEach(x => { if (!c.roles[r].includes(x)) c.roles[r].push(x); });
      c.alt[r] = s.meta.filter(x => !c.roles[r].includes(x));
    });
  });
  COMPS.length = 0; out.forEach(c => COMPS.push(c));
  if (state.selectedCompId && !COMPS.some(c => c.id === state.selectedCompId)) state.selectedCompId = null;
}
function generateComps() {
  // restaura les oficials abans de regenerar (les auto es tornen a crear)
  COMPS.forEach(c => { if (!c.gen && c.baseRoles) c.roles = JSON.parse(JSON.stringify(c.baseRoles)); });
  generateAutoComps();
  try { groupComps(); } catch (e) { console.warn('groupComps', e); }
}

