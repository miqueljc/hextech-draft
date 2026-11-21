// ================= PREDICCIÓ DE PICKS DEL RIVAL =================
function predictionHtml(ctx, max = 4) {
  if (draftPos().enemyAfter === 0 || ctx.enemyPicks.length >= 5) return '';
  const pr = predictEnemy(ctx).slice(0, max);
  if (!pr.length) return '';
  const line = pr.map(x => {
    const ans = ourAnswersTo(x.champ, ctx);
    return `<strong>${escapeHtml(x.champ)}</strong> ${Math.round(x.prob * 100)}%${ans.length ? ` <span style="color:var(--text-muted);">(guardeu ${ans.map(escapeHtml).join('/')})</span>` : ''}`;
  }).join(' · ');
  return `<br><span style="color:var(--gold);">🔮 Pròxim pick rival més probable:</span> ${line}`;
}

