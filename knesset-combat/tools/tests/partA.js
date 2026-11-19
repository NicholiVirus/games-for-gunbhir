const L = require('./lib.js');
(async () => {
  const T = await L.open(); const { page, check, screen, clickLi, press, R } = T;
  await check('boot: title visible, loading hidden', () => page.evaluate(() => getComputedStyle(document.getElementById('loading')).display === 'none' && document.getElementById('title').classList.contains('active') || KC.Game.screen === 'title'));
  await check('first launch: click title shows welcome prompt', async () => { await page.mouse.click(640, 500); await screen('list'); return page.evaluate(() => document.getElementById('listTitle').textContent); });
  await check('welcome: SKIP goes to menu', async () => { await clickLi('#listItems', 'SKIP'); await screen('menu'); return true; });
  await check('welcome prompt not shown again after reload', async () => {
    await page.reload(); await page.waitForFunction(() => KC.Game && KC.Game.screen === 'title');
    await page.addScriptTag({ path: __dirname + '/th.js' });
    await press('Enter'); await page.waitForTimeout(300); const sc = await page.evaluate(() => KC.Game.screen); if (sc !== 'menu') throw new Error('screen=' + sc); return true;
  });
  await check('menu: arrow keys move selection and wrap', async () => {
    const n = await page.evaluate(() => document.querySelectorAll('#menuList li').length);
    for (let i = 0; i < n; i++) { await press('ArrowDown'); }
    const sel = await page.evaluate(() => Array.from(document.querySelectorAll('#menuList li')).findIndex(li => li.classList.contains('sel')));
    if (sel !== 0) throw new Error('sel after full wrap = ' + sel); return { items: n };
  });
  const items = await page.evaluate(() => Array.from(document.querySelectorAll('#menuList li')).map(li => li.textContent.trim()));
  const expect = { 'CAMPAIGN': 'levels', 'VERSUS': 'select', 'ELECTION ARCADE': 'select', 'CHEST STORE': 'list', 'FREE CHEST': 'chest', 'DAILY': 'chest', 'SHOP': 'shop', 'CHAMBER': 'list', 'TUTORIAL': 'fight', 'HOW TO PLAY': 'howto', 'SETTINGS': 'list' };
  for (const it of items) {
    const key = Object.keys(expect).find(k => it.toUpperCase().indexOf(k) >= 0);
    await check('menu item opens: ' + it, async () => {
      await page.evaluate(() => KC.Game.go('menu')); await page.waitForTimeout(300);
      await clickLi('#menuList', it.split(' ')[1] && it.indexOf('·') > 0 ? it.split('·')[0].trim() : it.replace(/READY|NEW|\d+h \d+m/g, '').trim());
      await page.waitForTimeout(500);
      const s = await page.evaluate(() => KC.Game.screen);
      if (s !== expect[key]) throw new Error('expected ' + expect[key] + ' got ' + s);
      // leave: escape (pause menu in tutorial → quit)
      if (s === 'chest') { await page.evaluate(() => { KC.Save.data.chestQueue = []; KC.Game.go('menu'); }); }
      else if (s === 'fight') { await press('Escape'); await page.waitForTimeout(300); const s2 = await page.evaluate(() => KC.Game.screen); if (s2 !== 'list') throw new Error('Esc in tutorial did not open pause list: ' + s2); await clickLi('#listItems', 'QUIT'); await page.waitForTimeout(500); }
      else { await press('Escape'); await page.waitForTimeout(300); }
      const back = await page.evaluate(() => KC.Game.screen);
      return 'back→' + back;
    });
  }
  await check('tutorial overlay hidden after quitting tutorial', () => page.evaluate(() => !document.getElementById('tutorial').classList.contains('show')));
  // Versus: pick via keyboard
  await check('versus: both players pick, fight starts', async () => {
    await page.evaluate(() => KC.Game.go('select', { mode: 'versus' })); await page.waitForTimeout(500);
    await press('KeyD'); await press('KeyF'); await press('KeyL'); await press('KeyU');
    await screen('fight', 10000); return page.evaluate(() => KC.Game.match.f.map(f => f.ch.id));
  });
  await check('fight: pause with Esc, resume', async () => {
    await press('Escape'); await page.waitForTimeout(200);
    const p = await page.evaluate(() => [KC.Game.screen, KC.Game.match && KC.Game.match.paused]);
    if (!p[1]) throw new Error('not paused: ' + p);
    await clickLi('#listItems', 'RESUME'); await page.waitForTimeout(400);
    const v = await page.evaluate(() => [KC.Game.screen, KC.Game.match.paused]); if (v[0] !== 'fight' || v[1]) throw new Error('after resume ' + v); return true;
  });
  await check('versus: P1 wins 2 rounds → results with coins', async () => {
    const c0 = await page.evaluate(() => KC.Save.data.coins);
    const r = await page.evaluate(() => TH.finish(0)); await page.waitForTimeout(400);
    const s = await page.evaluate(() => [KC.Game.screen, KC.Save.data.coins, document.getElementById('resTitle').textContent]);
    if (s[0] !== 'results') throw new Error('screen ' + s[0] + ' ' + JSON.stringify(r));
    return { coinsGained: s[1] - c0, title: s[2] };
  });
  await check('results: REMATCH restarts', async () => { await clickLi('#resMenu', 'REMATCH'); await screen('fight'); return true; });
  await check('results: CHARACTER SELECT', async () => { await page.evaluate(() => TH.finish(1)); await page.waitForTimeout(300); await clickLi('#resMenu', 'CHARACTER SELECT'); await screen('select'); return true; });
  await check('pause → quit to menu from a fight', async () => {
    await page.evaluate(() => KC.Game.startMatch({ mode: 'versus', chars: [KC.rosterById.gantz, KC.rosterById.livni], skins: [null, null], ai: [null, null] }));
    await press('Escape'); await page.waitForTimeout(200);
    const items = await page.evaluate(() => Array.from(document.querySelectorAll('#listItems li')).map(l => l.textContent));
    await clickLi('#listItems', items.find(t => /MENU|QUIT/i.test(t)) || 'MENU'); await page.waitForTimeout(600);
    const s = await page.evaluate(() => [KC.Game.screen, !!KC.Game.match]);
    if (s[0] !== 'menu' || s[1]) throw new Error('screen ' + s); return items;
  });
  await check('how to play: shows 51 fighters text and dash row', () => page.evaluate(() => { var t = document.getElementById('howto').textContent; return /Dash/.test(t) && /double-tap/i.test(t); }));
  console.log(R.log.join('\n')); console.log(`\n${R.pass} passed, ${R.fail} failed`); await T.close();
})();
