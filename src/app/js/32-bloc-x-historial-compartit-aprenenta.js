// ===== Bloc X: historial compartit, aprenentatge per parelles, veredicte de línia i text de Discord =====

// --- 1. Historial compartit: data.json (hextech_history_v1) + el d'aquest dispositiu, sense duplicats ---
function histKey(h) { return [h.date, h.side, (h.us || []).slice().sort().join('+'), (h.enemy || []).slice().sort().join('+')].join('|'); }
function sharedHist() { const s = lsGet('hextech_history_v1'); return Array.isArray(s) ? s : (s && Array.isArray(s.games) ? s.games : []); }
function allHist() {
  const seen = new Set(), out = [];
  [...sharedHist(), ...DRAFT_HIST].forEach(h => { if (!h || !h.result) return; const k = histKey(h); if (seen.has(k)) return; seen.add(k); out.push(h); });
  return out;
}
function teamRec(p, c) {
  if (!_teamRec) {
    _teamRec = new Map();
    allHist().forEach(h => (h.roles || []).forEach(x => {
      if (!x.champ || !x.player) return;
      const k = x.player + '|' + x.champ, v = _teamRec.get(k) || { w: 0, l: 0 };
      if (h.result === 'W') v.w++; else v.l++;
      _teamRec.set(k, v);
    }));
  }
  return _teamRec.get(ROSTER[p].name + '|' + c) || null;
}
let _duoRec = null;
function duoRec(a, b) {
  if (!_duoRec) {
    _duoRec = new Map();
    allHist().forEach(h => {
      const us = (h.roles || []).map(x => x.champ).filter(Boolean);
      for (let i = 0; i < us.length; i++) for (let j = i + 1; j < us.length; j++) {
        const k = [us[i], us[j]].sort().join('|'), v = _duoRec.get(k) || { w: 0, l: 0 };
        if (h.result === 'W') v.w++; else v.l++;
        _duoRec.set(k, v);
      }
    });
  }
  return _duoRec.get([a, b].sort().join('|')) || null;
}

// --- 2. Recomanacions: parelles que ja heu jugat juntes (mínim 2 partides, mostra encongida) ---
function recommendChamps(ctx, excludeIdx) {
  const out = recommendChamps__u(ctx, excludeIdx);
  try {
    const ally = getOurPicks().filter((c, i) => c && i !== excludeIdx);
    if (!ally.length || !allHist().length) return out;
    out.forEach(r => {
      let best = null;
      ally.forEach(a => { const v = duoRec(r.champ, a); if (!v || v.w + v.l < 2) return; const pts = Math.round(((v.w + 2) / (v.w + v.l + 4) - 0.5) * 24); if (!best || Math.abs(pts) > Math.abs(best.pts)) best = { a, v, pts }; });
      if (best && best.pts) {
        r.score += best.pts;
        r.why.push({ pts: best.pts, txt: `parella amb ${best.a} a les vostres partides: ${best.v.w}V-${best.v.l}D` });
      }
    });
    out.sort((a, b) => b.score - a.score);
  } catch (e) { console.warn('duoRec', e); }
  return out;
}

// --- 3. Veredicte de línia: un winrate real clar mana sobre les regles generals ---
function laneMatchup(c, e, role) {
  const r = laneMatchup__n(c, e, role);
  try {
    const m = muScore(c, e);
    if (!m.real || Math.abs(m.adv) < 2.5) return r;
    // part del resultat que ve del winrate real (mateixa fórmula que el bloc N)
    const realPart = Math.max(-4, Math.min(4, Math.round(m.adv / 2))) || Math.sign(m.adv);
    const rest = r.score - realPart;
    // amb un winrate real clar (≥2,5 punts ajustats), les regles generals només poden matisar ±1
    const capped = realPart + Math.max(-1, Math.min(1, rest));
    const sign = Math.sign(m.adv);
    const score = sign > 0 ? Math.max(capped, 2) : Math.min(capped, -2);
    return { score, notes: r.notes };
  } catch (err) { return r; }
}

// --- 4. Text de Discord: instruccions per jugador sense campions aliens + pla detallat ---
function copyDiscordPlan() {
  const s = buildStrategy();
  const { comp, B } = s;
  let text = `🏆 **PLA DE PARTIDA — ${comp.name.toUpperCase()} (${state.ourSide} SIDE)**\n`;
  text += `🆚 **Rival:** ${B.list.join(', ') || 'pendent'}\n`;
  text += `📌 **Estil:** ${comp.style}\n\n`;
  text += `🛣️ **LÍNIES:**\n`;
  s.lanes.forEach(l => {
    text += `• **${l.role}** (${l.player.name.split('#')[0]}): ${l.champ || '—'} vs ${l.enemyText} ${VERDICT_UI[l.verdict].icon}${l.notes.length ? ' (' + l.notes.join(', ') + ')' : ''}\n`;
  });
  if (s.laneSummary.length) text += s.laneSummary.map(t => `↳ ${t}\n`).join('');
  if (s.deep) {
    text += `\n⚔️ **TEAMFIGHTS:**\n` + s.deep.tf.map(t => `• ${t}\n`).join('');
    text += `\n🐉 **OBJECTIUS:**\n` + s.deep.obj.map(t => `• ${t}\n`).join('');
  } else {
    text += `\n⏱️ **TIMINGS:**\n• **Early:** ${s.early}\n• **Mid:** ${s.mid}\n• **Late:** ${s.late}\n`;
    text += `\n⚔️ **WIN CONDITION:** ${s.win.join(' ')}\n` + s.tf.slice(0, 4).map(t => `• ${t}\n`).join('');
  }
  if (s.threats.length) {
    const un = t => String(t).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    text += `\n🚨 **AMENACES:**\n` + s.threats.map(t => `• **${t.champ}:** ${un(t.txt)}\n`).join('');
  }
  text += `\n🎯 **CADA JUGADOR:**\n`;
  s.individual.forEach(x => {
    text += `• **${x.role} (${x.lane.player.name.split('#')[0]} - ${x.lane.champ || '—'}):** ${x.text || comp.plan.individual[x.role] || ''}\n`;
  });
  text += phasePlanDiscord(s.phasePlan);
  text += buildsDiscordText(s);
  const parts = splitDiscord(text);
  const out = parts.map((pt, i) => (i === 0 ? '' : `\n⸻ MISSATGE ${i + 1} ⸻\n`) + pt).join('');
  deliverPlanText(out, parts.length);
  return out;
}
// Escriptori: porta-retalls i avís. El mòbil la substitueix pel full de compartir del sistema.
function deliverPlanText(out, nParts) {
  const done = () => alert(nParts > 1
    ? `✅ Pla copiat en ${nParts} missatges (separats per "⸻ MISSATGE n ⸻", límit de Discord: 2000 caràcters). Enganxa'ls per separat.`
    : '✅ Pla de partida copiat al porta-retalls llest per enganxar a Discord!');
  try { navigator.clipboard.writeText(out).then(done, done); } catch (e) { done(); }
}

// --- 5. Historial: indica quantes partides venen de l'equip (compartides) ---
function renderHistory() {
  renderHistory__base();
  try {
    const el = document.getElementById('histPanel'); if (!el) return;
    const sh = sharedHist().length, all = allHist(), w = all.filter(h => h.result === 'W').length;
    const t = el.querySelector('.panel-title + div');
    if (t) t.innerHTML = `${all.length ? `${all.length} partides en total (${sh} compartides per l'equip, ${DRAFT_HIST.length} d'aquest dispositiu) · ${w}V-${all.length - w}D. El motor en té en compte el resultat per jugador i campió i per parelles de campions (a partir de 2 partides).` : 'Encara no hi ha partides desades. En acabar un draft, desa el resultat (✅/❌).'}<br><span style="color:var(--text-muted);">Per compartir les d'aquest dispositiu amb tot l'equip: «Copia l'historial» i envia-m'ho.</span>`;
  } catch (e) {}
}

init();

