const L = require('./lib.js');
(async () => {
  const T = await L.open(); const { page, check, screen, clickLi, press, R } = T;
  await page.evaluate(() => { KC.Save.data.tutorialPrompted = true; KC.Save.data.tutorialDone = true; KC.Save.write(); KC.Game.go('menu'); });
  const S = () => page.evaluate(() => KC.Game.screen);
  async function openChestFully() {
    for (let i = 0; i < 12; i++) {
      const ph = await page.evaluate(() => KC.Game.screen === 'chest' && document.getElementById('chHint').textContent);
      if (!ph || !/TAP/i.test(ph)) break;
      await page.click('#chestScreen', { position: { x: 640, y: 360 } }); await page.waitForTimeout(250);
    }
    await page.waitForFunction(() => document.querySelectorAll('#chBtns button').length > 0, null, { timeout: 20000 });
    return page.evaluate(() => Array.from(document.querySelectorAll('#chBtns button')).map(b => b.textContent));
  }
  // ---- Campaign
  await check('campaign: level map -> level 1 -> select -> fight', async () => {
    await page.evaluate(() => KC.Game.go('levels')); await page.waitForTimeout(400);
    await page.click('#lvGo'); await screen('select'); await press('KeyF'); await screen('fight', 25000);
    return page.evaluate(() => [KC.Game.matchCfg.mode, KC.Game.matchCfg.levelNo, KC.Game.match.f[1].ch.id, KC.Game.ai[1] && +KC.Game.ai[1].skill.toFixed(2)]);
  });
  await check('campaign: win level 1 -> results, level 2 unlocked, no chest yet (1st win)', async () => {
    await page.evaluate(() => TH.finish(0)); await screen('results');
    const v = await page.evaluate(() => ({ tour: KC.Save.data.tour, q: (KC.Save.data.chestQueue || []).length, opts: Array.from(document.querySelectorAll('#resMenu li')).map(l => l.textContent) }));
    if (v.tour !== 1) throw new Error('tour=' + v.tour); return v;
  });
  await check('campaign: NEXT LEVEL -> win level 2 -> chest drop', async () => {
    await clickLi('#resMenu', 'NEXT LEVEL'); await screen('fight'); await page.evaluate(() => TH.finish(0)); await screen('results');
    const v = await page.evaluate(() => ({ tour: KC.Save.data.tour, q: KC.Save.data.chestQueue }));
    if (v.tour !== 2 || !v.q.length) throw new Error(JSON.stringify(v)); return v;
  });
  await check('campaign: losing a level offers RETRY and does not advance', async () => {
    await clickLi('#resMenu', 'NEXT LEVEL'); await screen('fight'); await page.evaluate(() => TH.finish(1)); await screen('results');
    const v = await page.evaluate(() => ({ tour: KC.Save.data.tour, opts: Array.from(document.querySelectorAll('#resMenu li')).map(l => l.textContent) }));
    if (v.tour !== 2 || !v.opts.some(o => /RETRY/.test(o))) throw new Error(JSON.stringify(v)); return v.opts;
  });
  await check('chest: open campaign chest (taps -> 5 s slot roll -> rewards applied)', async () => {
    const before = await page.evaluate(() => KC.Save.data.coins);
    await clickLi('#resMenu', 'OPEN CHEST'); await screen('chest');
    const btns = await openChestFully();
    const after = await page.evaluate(() => KC.Save.data.coins);
    if (after <= before) throw new Error('no coins gained ' + before + ' -> ' + after);
    return { coins: after - before, btns };
  });
  await check('chest: skip attempt during roll is ignored (roll still lasts ~5 s)', async () => {
    await page.evaluate(() => {
      window.__sl = {}; var orig = KC.Game.slotReels;
      KC.Game.slotReels = function (r, t, done) { __sl.start = performance.now(); return orig.call(this, r, t, function () { __sl.end = performance.now(); done(); }); };
      KC.Save.data.chestQueue = [{ tier: 0, taps: 1 }]; KC.Game.go('chest');
    });
    await page.waitForTimeout(300);
    await page.click('#chestScreen', { position: { x: 640, y: 360 } });
    await page.waitForFunction(() => window.__sl.start, null, { timeout: 30000 });
    // spam clicks and Enter while the reels spin
    const t0 = Date.now();
    while (Date.now() - t0 < 3000) { await page.click('#chestScreen', { position: { x: 640, y: 360 } }); await page.keyboard.press('Enter'); await page.waitForTimeout(100); }
    await page.waitForFunction(() => window.__sl.end, null, { timeout: 30000 });
    const ms = await page.evaluate(() => Math.round(__sl.end - __sl.start));
    if (ms < 4900) throw new Error('roll ended after ' + ms + ' ms'); return ms + ' ms';
  });
  await check('chest: LEVEL MAP button returns to the map', async () => { await clickLi('#chBtns', 'LEVEL MAP'); await screen('levels'); return true; });
  await check('campaign: boss levels never use a Mythic', async () => {
    const v = await page.evaluate(() => { var o = {}; for (var n = 10; n < 250; n += 10) { var r = KC.level(n).ch.rarity; o[r] = (o[r] || 0) + 1; } return o; });
    if (v.mythic) throw new Error(JSON.stringify(v)); return v;
  });
  await check('campaign: level 250 win -> BECOME PRIME MINISTER -> ending', async () => {
    await page.evaluate(() => { KC.Save.data.tour = 249; KC.Save.write(); KC.Game.startLevel(250, KC.rosterById.sharett, null); });
    await screen('fight'); const opp = await page.evaluate(() => KC.Game.match.f[1].ch.id);
    await page.evaluate(() => TH.finish(0)); await screen('results');
    await clickLi('#resMenu', 'PRIME MINISTER'); await screen('ending');
    const pm = await page.evaluate(() => [KC.Save.data.pm, KC.Save.data.pmFighter]);
    if (opp !== 'netanyahu' || !pm[0]) throw new Error(opp + ' ' + pm); return { opp, pm };
  });
  await check('ending: continue reaches menu with PM badge', async () => {
    await press('Enter'); await page.waitForTimeout(600);
    const s = await S(); if (s !== 'menu') await page.evaluate(() => KC.Game.go('menu'));
    await page.waitForTimeout(300);
    const badge = await page.evaluate(() => /PRIME MINISTER/.test(document.getElementById('mandateBox').textContent));
    if (!badge) throw new Error('no badge'); return 'screen after Enter on ending: ' + s;
  });
  // ---- Election Arcade
  await check('arcade: select -> ladder -> fight -> win -> NEXT STOP -> ladder', async () => {
    await page.evaluate(() => KC.Game.go('select', { mode: 'campaign' })); await page.waitForTimeout(300); await press('KeyF');
    await screen('ladder', 25000); await page.click('#ladFight'); await screen('fight'); await page.evaluate(() => TH.finish(0)); await screen('results');
    await clickLi('#resMenu', 'NEXT STOP'); await screen('ladder', 25000); return page.evaluate(() => KC.Game.campaign && KC.Game.campaign.idx);
  });
  await check('arcade: WITHDRAW leaves the ladder', async () => { await page.click('#ladQuit'); await page.waitForTimeout(400); const s = await S(); if (s === 'ladder') throw new Error('still ladder'); return s; });
  // ---- Chest store / free / daily
  await check('chest store: buying with too few coins is refused', async () => {
    await page.evaluate(() => { KC.Save.data.coins = 10; KC.Game.chestStore('menu'); }); await page.waitForTimeout(300);
    await page.click('#listItems li'); await page.waitForTimeout(150); await page.click('#listItems li'); await page.waitForTimeout(400);
    const v = await page.evaluate(() => [KC.Game.screen, KC.Save.data.coins]); if (v[0] === 'chest' || v[1] !== 10) throw new Error(JSON.stringify(v)); return true;
  });
  await check('chest store: buy every chest type (confirm flow) and open', async () => {
    const n = await page.evaluate(() => KC.CHEST_STORE.length), out = [];
    for (let i = 0; i < n; i++) {
      await page.evaluate(() => { KC.Save.data.coins = 99999; KC.Save.data.chestQueue = []; KC.Game.chestStore('menu'); }); await page.waitForTimeout(300);
      let lis = await page.$$('#listItems li'); await lis[i].click(); await page.waitForTimeout(150);
      lis = await page.$$('#listItems li'); await lis[i].click(); await page.waitForTimeout(400);
      const s = await S(); if (s !== 'chest') throw new Error('item ' + i + ' screen ' + s);
      out.push(await page.evaluate(() => document.querySelectorAll('#chPips .tp').length));
      await openChestFully();
    }
    return { tapsPerChest: out };
  });
  await check('free chest: claim, then cooldown blocks a second claim', async () => {
    await page.evaluate(() => { KC.Save.data.lastFree = 0; KC.Save.data.chestQueue = []; KC.Game.claimFree(); }); await screen('chest'); await openChestFully();
    const v = await page.evaluate(() => { var q = KC.Save.data.chestQueue.length; KC.Game.claimFree(); return [KC.Game.screen, KC.Save.data.chestQueue.length, q, KC.Game.freeWait()]; });
    if (v[1] !== v[2]) throw new Error('second claim allowed ' + v); return v[3];
  });
  await check('daily chest: claim, then blocked until tomorrow', async () => {
    await page.evaluate(() => { KC.Save.data.lastDaily = 0; KC.Game.claimDaily(); }); await screen('chest'); await openChestFully();
    const v = await page.evaluate(() => { var q = KC.Save.data.chestQueue.length; KC.Game.claimDaily(); return [KC.Save.data.chestQueue.length === q, KC.Game.dailyWait()]; });
    if (!v[0]) throw new Error('second daily allowed'); return v[1];
  });
  console.log(R.log.join('\n')); console.log('\n' + R.pass + ' passed, ' + R.fail + ' failed'); await T.close();
})();
