const { chromium } = require('playwright');
const path = require('path');
exports.open = async function (opts = {}) {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: opts.viewport || { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '../../index.html'));
  await page.waitForFunction(() => window.KC && KC.Game && KC.Game.screen === 'title', null, { timeout: 30000 });
  await page.addScriptTag({ content: `
    window.TH = {
      finish: function (w) { var G = KC.Game, m = G.match, n = 0;
        while (G.match === m && !m.ended && n++ < 6000) {
          m.paused = false;
          if (m.phase === 'intro') { KC.HUD.hideVs(); m.startRound(); }
          if (m.phase === 'fight') m.koFighter(m.f[w], m.f[1 - w], w === 0 ? 1 : -1, { dmg: 999 });
          m.tick();
        }
        return { screen: G.screen, n: n };
      },
      screen: function () { return KC.Game.screen; },
      save: function () { return KC.Save.data; }
    };` });
  const R = { pass: 0, fail: 0, log: [] };
  async function check(name, fn) {
    const before = errs.length;
    try {
      const v = await fn();
      if (v === false) throw new Error('check returned false');
      if (errs.length > before) throw new Error('errors: ' + errs.slice(before).join(' | '));
      R.pass++; R.log.push('PASS ' + name + (v && v !== true ? '  ' + JSON.stringify(v).slice(0, 160) : ''));
    } catch (e) { R.fail++; R.log.push('FAIL ' + name + ' :: ' + e.message.slice(0, 400)); }
  }
  async function screen(name, t = 8000) { await page.waitForFunction(n => KC.Game.screen === n, name, { timeout: t }); return true; }
  async function clickLi(listSel, text) {
    const ok = await page.evaluate(([s, t]) => { var li = Array.from(document.querySelectorAll(s + ' li, ' + s + ' button')).find(e => e.textContent.toUpperCase().indexOf(t.toUpperCase()) >= 0 && e.offsetParent !== null); if (!li) return false; li.click(); return true; }, [listSel, text]);
    if (!ok) throw new Error('no clickable "' + text + '" in ' + listSel);
    await page.waitForTimeout(250);
  }
  async function press(key) {
    await page.waitForFunction(() => !(KC.Game.inputLock > 0), null, { timeout: 5000 });
    await page.keyboard.press(key);
    // wait until the game has processed at least one frame after the key
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(50);
  }
  return { b, page, errs, R, check, screen, clickLi, press, close: async () => { await b.close(); } };
};
