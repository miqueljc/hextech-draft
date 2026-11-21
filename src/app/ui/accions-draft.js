// ===== Pantalla: roster-i-comps (separat del motor) =====
document.addEventListener('click', e => {
  const chip = e.target.closest('.champ-chip');
  if (chip && chip.dataset.champ) pickChampion(chip.dataset.champ);
});
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  btn.classList.add('active');
}
function setOurSide(side) {
  state.ourSide = side;
  document.getElementById('btnSideBlue').className = side === 'BLUE' ? 'btn btn-active-blue' : 'btn';
  document.getElementById('btnSideRed').className = side === 'RED' ? 'btn btn-active-red' : 'btn';
  document.getElementById('blueTag').textContent = side === 'BLUE' ? '(NOSALTRES)' : '(RIVAL)';
  document.getElementById('redTag').textContent = side === 'RED' ? '(NOSALTRES)' : '(RIVAL)';
  renderAll();
}
function setDraftMode(mode) {
  state.draftMode = mode;
  document.getElementById('btnModeOrder').className = mode === 'ORDER' ? 'btn btn-active-blue' : 'btn';
  document.getElementById('btnModeFree').className = mode === 'FREE' ? 'btn btn-active-blue' : 'btn';
  renderAll();
}
function updateEnemyOtps() {
  const raw = document.getElementById('enemyOtpInput').value;
  state.enemyOtps = raw.split(',').map(s => s.trim()).filter(Boolean);
  const container = document.getElementById('enemyOtpBadges');
  container.innerHTML = state.enemyOtps.map(c => `<span class="badge-target">⚠️ ${c}</span>`).join('');
  renderAll();
  const inp = document.getElementById('enemyOtpInput');
  if (inp && state.scout) { state.scout.otps = inp.value; saveScout(); }
}
function pickChampion(champ) {
  if (applyPick(champ)) renderAll();
}
function resetDraft() {
  clearDraftState();
  document.getElementById('strategySection').style.display = 'none';
  renderAll();
}
function init() {
  captureDefaults();
  afterDataChange();
  updateEnemyOtps();
  renderAll();
}
