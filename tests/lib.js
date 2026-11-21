// Utilitats comunes de les proves
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PC = path.join(ROOT, 'pc.html'), MOBILE = path.join(ROOT, 'index.html');
const DATA = fs.readFileSync(path.join(ROOT, 'data.json'), 'utf8');
const FIX = path.join(__dirname, 'fixtures');
let ok = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) ok++; else { fail++; console.log('  ✗ ' + name + (extra !== undefined ? ' → ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)) : '')); }
}
function done(label) { console.log(`${label}: ${ok} ok, ${fail} errors`); process.exitCode = fail ? 1 : 0; }
// Pàgina amb data.json local i imatges falses (sense xarxa)
async function openPage(file, opts = {}) {
  const { chromium, devices } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext(opts.device ? { ...devices[opts.device], permissions: ['clipboard-read', 'clipboard-write'] } : { viewport: { width: 1366, height: 850 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.dismiss().catch(() => {}));
  const body = opts.data || DATA;
  // les rutes registrades després tenen prioritat: primer bloqueja la xarxa, després permet data.json i imatges
  await page.route(/^https:\/\/(?!ddragon)/, r => r.abort());
  await page.route('**/data.json*', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body }));
  await page.route('https://ddragon.leagueoflegends.com/**', r => { const jpg = r.request().url().endsWith('.jpg'); r.fulfill({ status: 200, contentType: jpg ? 'image/jpeg' : 'image/png', body: fs.readFileSync(path.join(FIX, jpg ? 'fakeload.jpg' : 'fakeicon.png')) }); });
  await page.goto('file://' + file);
  await page.waitForTimeout(1200);
  return { browser, page, errors };
}
module.exports = { ROOT, PC, MOBILE, DATA, check, done, openPage };
