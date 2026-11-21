// ===== Pantalla: what-if (separat del motor) =====
function runWhatIf() {
  const box = document.getElementById('whatIfBox');
  const { type, side, index } = state.activeSlot;
  box.style.display = 'block';
  if (type !== 'PICK' || side !== state.ourSide) { box.innerHTML = '<span style="color:var(--text-muted);">El what-if funciona al vostre torn de pick: seleccioneu un slot de pick aliat.</span>'; return; }
  const ctx = buildCtx();
  const recs = recommendChamps(ctx, index).slice(0, 4);
  if (!recs.length) { box.innerHTML = 'Cap candidat disponible.'; return; }
  const rows = recs.map(r => {
    const s = simulatePick(r.champ, index);
    const total = r.score + (s.good - s.bad) * 6 + Math.round((s.compScore - 50) / 10);
    return { r, s, total };
  }).sort((a, b) => b.total - a.total);
  const V = { good: '✅', bad: '❌', even: '➖', unknown: '⏳' };
  const td = 'style="padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.06);vertical-align:top;"';
  box.innerHTML = `<div style="display:flex;justify-content:space-between;"><strong style="color:var(--gold);">🔀 What-if: què passa si trieu cadascun dels millors candidats</strong><a href="#" onclick="document.getElementById('whatIfBox').style.display='none';return false;" style="color:var(--text-muted);">tanca</a></div>
    <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.78rem;margin-top:6px;">
    <thead><tr style="color:var(--gold);text-align:left;"><th ${td}>Candidat</th><th ${td}>Pts motor</th><th ${td}>Comp objectiu</th><th ${td}>Línies (assignació auto)</th><th ${td}>Equilibri</th><th ${td}>Total</th></tr></thead>
    <tbody>${rows.map((x, i) => `<tr style="${i === 0 ? 'background:rgba(10,200,185,0.10);' : ''}">
      <td ${td}><strong>${escapeHtml(x.r.champ)}</strong>${i === 0 ? ' ⭐' : ''}</td>
      <td ${td}>${x.r.score}</td>
      <td ${td}>${escapeHtml(x.s.topComp)} <span style="color:var(--text-muted);">(${x.s.compScore}%)</span></td>
      <td ${td}>${x.s.lanes.map(l => `${V[l.verdict]} ${l.role}${l.champ ? ' ' + escapeHtml(l.champ) : ''}`).join('<br>')}</td>
      <td ${td}>${x.s.needs.length ? 'Falta: ' + x.s.needs.join(', ') : 'Sense buits clars'}<br><span style="color:var(--text-muted);">viable ${x.s.feasible}/${x.s.nPicks} dins pools</span></td>
      <td ${td}><strong>${x.total}</strong></td></tr>`).join('')}</tbody></table></div>
    <div style="color:var(--text-muted);font-size:0.72rem;margin-top:4px;">Total = punts del motor + 6 per cada línia guanyada − 6 per cada perduda + ajust de la comp objectiu. Les línies sense rival conegut compten com a pendents.</div>`;
}
