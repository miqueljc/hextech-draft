// Extractor de la pàgina de campions d'op.gg (executar al navegador, a la pestanya
// https://op.gg/lol/summoners/<regió>/<Nom>-<TAG>/champions).
// Retorna { name, updated, champs: [{ champ, w, l, games, wr, kda }] } amb les files principals
// de la taula (les subfiles "vs X" s'ignoren).
(() => {
  const out = [];
  for (const tr of document.querySelectorAll('table tbody tr')) {
    const cells = [...tr.querySelectorAll('td')].map(td => td.innerText.replace(/\s+/g, ' ').trim());
    if (!cells.length || !/^\d+$/.test(cells[0])) continue;
    const m = (cells[2] || '').match(/(\d+)W\s*(\d+)L\s*(\d+)%/);
    if (!cells[1] || !m) continue;
    out.push({ champ: cells[1], w: +m[1], l: +m[2], games: +m[1] + +m[2], wr: +m[3], kda: (cells[3] || '').split(' ')[0] });
  }
  const title = document.title.split(' - ')[0];
  const updated = (document.body.innerText.match(/Last updated: [^\n]+/) || [''])[0];
  return { name: title, updated, champs: out };
})();
