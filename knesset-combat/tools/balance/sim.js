// Knesset Combat 26' balance simulator: CPU vs CPU round-robin (every fighter vs every other, best-of-3 matches).
// usage: node sim.js [--skill 0.7] [--matches 8] [--shard 0/4] [--out results.json]
// Run 4 shards in parallel (one per CPU core), then: node report.js results-*.json
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const skill = +arg('skill', 0.7), matches = +arg('matches', 8), [si, sn] = arg('shard', '0/1').split('/').map(Number);
const out = arg('out', 'results-' + si + '.json');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../../index.html'));
  await page.waitForFunction(() => KC.Game && KC.Game.screen === 'title', null, { timeout: 30000 });
  await page.addScriptTag({ path: path.join(__dirname, 'harness.js') });
  await page.evaluate(() => { KC.Audio.say = function () {}; KC.Audio.play = function () {}; });
  const ids = await page.evaluate(() => KC.ROSTER.map(c => c.id));
  const pairs = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
  const mine = pairs.filter((p, i) => i % sn === si), results = [], t0 = Date.now();
  for (let i = 0; i < mine.length; i++) {
    results.push(await page.evaluate(([a, b, s, n]) => SIM(a, b, n, s), [mine[i][0], mine[i][1], skill, matches]));
    if (i % 50 === 0) process.stderr.write(`${i + 1}/${mine.length} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
  }
  fs.writeFileSync(out, JSON.stringify(results));
  console.log('done', mine.length, 'pairs in', ((Date.now() - t0) / 1000).toFixed(0) + 's', errs.length ? 'ERRORS: ' + errs.slice(0, 3).join(' | ') : '');
  await browser.close();
})();
