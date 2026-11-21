// Executa totes les proves. Ús: node tests/run.js  (VERBOSE=1 per veure-ho tot)
const { spawnSync } = require('child_process');
const path = require('path');
const runs = [
  ['engine_draft.test.js'], ['engine_strategy.test.js'], ['builds.test.js'],
  ['learning.test.js'], ['match.test.js'], ['match.test.js', 'mobile'],
  ['golden.test.js'], ['golden.test.js', 'mobile']
];
let failed = 0;
const t0 = Date.now();
for (const [f, ...args] of runs) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f), ...args], { stdio: 'inherit', env: process.env });
  if (r.status !== 0) { failed++; console.log(`✗ ${f} ${args.join(' ')}`); }
}
console.log(`\n${runs.length - failed}/${runs.length} proves superades (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
process.exitCode = failed ? 1 : 0;
