const L = require('./lib.js');
(async () => {
  const sizes = (process.env.SIZES || '1280x720,1024x640,844x390,390x844').split(',').map(s => s.split('x').map(Number));
  const screensToVisit = [
    ['title', 'KC.Game.go("title")'], ['menu', 'KC.Game.go("menu")'], ['select', 'KC.Game.go("select", { mode: "versus" })'],
    ['levels', 'KC.Game.go("levels")'], ['shop', 'KC.Game.go("shop")'], ['howto', 'KC.Game.go("howto")'],
    ['store', 'KC.Game.chestStore("menu")'], ['fight', 'KC.Game.startMatch({ mode: "versus", chars: [KC.rosterById.gantz, KC.rosterById.netanyahu], skins: [null, null], ai: [null, null] })'],
    ['results', 'TH.finish(0)']
  ];
  const out = [];
  for (const [w, h] of sizes) {
    const T = await L.open({ viewport: { width: w, height: h } }); const { page } = T;
    await page.evaluate(() => { KC.Save.data.tutorialPrompted = true; });
    for (const [name, js] of screensToVisit) {
      await page.evaluate(js); await page.waitForTimeout(900);
      const m = await page.evaluate(() => {
        var de = document.documentElement, over = de.scrollWidth > innerWidth + 1 || de.scrollHeight > innerHeight + 1;
        // visible elements sticking out of the viewport
        var bad = [];
        document.querySelectorAll('.screen.show *, #hud *').forEach(function (e) {
          if (!e.offsetParent || e.children.length > 3) return;
          var r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
          if (r.right > innerWidth + 2 || r.left < -2) bad.push((e.id || e.className || e.tagName).toString().slice(0, 30) + '[' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
        });
        return { over: over, sw: de.scrollWidth, sh: de.scrollHeight, bad: bad.slice(0, 5) };
      });
      await page.screenshot({ path: __dirname + '/out/lay-' + w + '-' + name + '.png' });
      out.push(w + 'x' + h + ' ' + name.padEnd(8) + (m.over || m.bad.length ? ' ISSUE ' + JSON.stringify(m) : ' ok'));
    }
    if (T.errs.length) out.push('ERRORS ' + T.errs.join(' | '));
    await T.close();
  }
  console.log(out.join('\n'));
})();
