// ===== Arrencada del mòbil: taules en targetes, service worker i vista compartida (#j=...) =====
// taules -> targetes (data-label)
function labelTables(){
  document.querySelectorAll('.tab-content table').forEach(t=>{
    t.classList.add('responsive');
    const ths=[...t.querySelectorAll('thead th')].map(h=>h.textContent.trim());
    t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{ if(ths[i]&&td.dataset.label!==ths[i]) td.dataset.label=ths[i]; }));
  });
}
try{
  new MutationObserver(labelTables).observe(document.querySelector('main'),{childList:true,subtree:true});
  labelTables();
}catch(e){}
try{ if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(()=>{}); }catch(e){}
(function(){
  const m=/^#j=(.+)$/.exec(location.hash||'');
  if(m){const d=decodeShare(m[1]); if(d&&d.v===1){showSharedView(d);return;}}
  switchTab('draft');
})();
