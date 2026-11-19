const L = require('./lib.js');
(async () => {
  const T = await L.open(); const { page, check, screen, clickLi, press, R } = T;
  await page.evaluate(() => { KC.Save.data.tutorialPrompted = true; KC.Save.data.tutorialDone = true; KC.Save.data.coins = 999999; KC.Save.write(); KC.Game.go('shop'); });
  await page.waitForTimeout(600);
  const shopCur = () => page.evaluate(() => { var t = document.getElementById('colInfo').textContent; var ch = KC.ROSTER.find(c => t.indexOf(c.name) >= 0); return ch ? ch.id : null; });
  async function shopGoto(id) {
    for (let i = 0; i < 60; i++) { if ((await shopCur()) === id) return true; await press('ArrowRight'); }
    throw new Error('could not reach ' + id + ' (at ' + (await shopCur()) + ')');
  }
  await check('shop: opens with info panel and filters', async () => page.evaluate(() => ({ cells: document.querySelectorAll('#collection .cell, #collection [data-i]').length, tabs: Array.from(document.querySelectorAll('#collection button')).map(b => b.textContent).slice(0, 12) })));
  await check('shop: E cycles rarity filters without errors', async () => { for (let i = 0; i < 10; i++) await press('KeyE'); return true; });
  await check('shop: buy shards for a locked Common until recruited', async () => {
    await page.evaluate(() => KC.Game.go('shop')); await page.waitForTimeout(400);
    await shopGoto('golan');
    const need = await page.evaluate(() => KC.shardsNeeded(KC.rosterById.golan));
    for (let i = 0; i < need * 2 + 2 && !(await page.evaluate(() => KC.Save.owns('golan'))); i++) await press('Enter');
    const v = await page.evaluate(() => [KC.Save.owns('golan'), KC.Save.shards('golan')]);
    if (!v[0]) throw new Error('not recruited ' + v); return { need };
  });
  await check('shop: upgrade an owned fighter (confirm, then buy)', async () => {
    const r0 = await page.evaluate(() => KC.Save.rank('golan'));
    await press('Enter'); await press('Enter');
    const r1 = await page.evaluate(() => KC.Save.rank('golan'));
    if (r1 !== r0 + 1) throw new Error(r0 + ' -> ' + r1); return 'rank ' + r1;
  });
  await check('shop: upgrade to max rank stops at 5', async () => {
    for (let i = 0; i < 14; i++) await press('Enter');
    const r = await page.evaluate(() => KC.Save.rank('golan')); if (r !== 5) throw new Error('rank ' + r); return r;
  });
  await check('shop: gold skin purchase (B, confirm)', async () => { await press('KeyB'); await press('KeyB'); const g = await page.evaluate(() => KC.Save.hasGold('golan')); if (!g) throw new Error('no gold'); return true; });
  await check('shop: R previews gold, compare (C, move, C) opens and Esc closes', async () => {
    await press('KeyR'); await press('KeyC'); await press('ArrowRight'); await press('KeyC');
    const open = await page.evaluate(() => document.getElementById('compare').classList.contains('show'));
    if (!open) throw new Error('compare did not open');
    const hp = await page.evaluate(() => document.getElementById('compare').textContent.match(/\d{3,4}/g));
    await press('Escape'); const closed = await page.evaluate(() => !document.getElementById('compare').classList.contains('show') && KC.Game.screen === 'shop');
    if (!closed) throw new Error('compare did not close / left shop'); return { numbers: hp && hp.slice(0, 6) };
  });
  await check('shop: Wild Shard recruits a locked fighter of that rarity', async () => {
    await page.evaluate(() => { KC.Save.data.wild = { rare: 1 }; KC.Game.go('shop'); }); await page.waitForTimeout(400);
    await shopGoto('eisenkot'); await press('Enter'); await press('Enter');
    const v = await page.evaluate(() => [KC.Save.owns('eisenkot'), (KC.Save.data.wild || {}).rare || 0]);
    if (!v[0] || v[1] !== 0) throw new Error(JSON.stringify(v)); return true;
  });
  await check('shop: too few coins for a shard shows a refusal, no change', async () => {
    await page.evaluate(() => { KC.Save.data.coins = 0; KC.Game.go('shop'); }); await page.waitForTimeout(400);
    await shopGoto('netanyahu'); await press('Enter'); await press('Enter');
    const v = await page.evaluate(() => [KC.Save.shards('netanyahu'), KC.Save.data.coins]); if (v[0] !== 0 || v[1] !== 0) throw new Error(JSON.stringify(v)); return true;
  });
  await check('shop: Esc returns to menu', async () => { await press('Escape'); await screen('menu'); return true; });
  // chamber skins
  await check('chamber skins: buy and equip every theme', async () => {
    await page.evaluate(() => { KC.Save.data.coins = 999999; });
    const ids = await page.evaluate(() => KC.THEMES.map(t => t.id)), got = [];
    for (let i = 0; i < ids.length; i++) {
      await page.evaluate(() => KC.Game.chamberStore('menu')); await page.waitForTimeout(300);
      let lis = await page.$$('#listItems li'); await lis[i].click(); await page.waitForTimeout(200);
      let th = await page.evaluate(() => KC.Save.data.theme);
      if (th !== ids[i]) { lis = await page.$$('#listItems li'); await lis[i].click(); await page.waitForTimeout(300); th = await page.evaluate(() => KC.Save.data.theme); }
      got.push(th);
    }
    const owned = await page.evaluate(() => KC.Save.data.themes);
    if (owned.length !== ids.length) throw new Error('owned ' + owned + ' of ' + ids);
    return got;
  });
  await check('chamber skin shows in a fight (Purim) with no errors', async () => {
    await page.evaluate(() => { KC.Save.data.theme = 'purim'; KC.Game.startMatch({ mode: 'versus', chars: [KC.rosterById.gantz, KC.rosterById.livni], skins: [null, null], ai: [null, null] }); });
    await page.waitForTimeout(1500); await page.screenshot({ path: __dirname + '/out/c-purim.png' });
    await page.evaluate(() => { KC.Game.go('menu'); }); return true;
  });
  // settings
  await check('settings: every option changes its value', async () => {
    await page.evaluate(() => { if (KC.Game.match) { KC.Game.match.destroy(); KC.Game.match = null; } KC.Game.go('menu'); });
    await page.waitForTimeout(300);
    await clickLi('#menuList', 'SETTINGS'); await screen('list');
    const before = await page.evaluate(() => JSON.stringify(KC.Save.data.settings));
    const labels = await page.evaluate(() => Array.from(document.querySelectorAll('#listItems li')).map(l => l.textContent));
    for (let i = 0; i < labels.length; i++) {
      if (/RESET|BACK/.test(labels[i])) continue;
      const lis = await page.$$('#listItems li'); await lis[i].click(); await page.waitForTimeout(150);
    }
    const after = await page.evaluate(() => JSON.stringify(KC.Save.data.settings));
    if (before === after) throw new Error('nothing changed');
    return { before: JSON.parse(before), after: JSON.parse(after) };
  });
  await check('settings: RESET SAVE → NO keeps data', async () => {
    await page.evaluate(() => { KC.Save.data.coins = 4321; KC.Save.write(); });
    await clickLi('#listItems', 'RESET SAVE'); await clickLi('#listItems', 'NO');
    const c = await page.evaluate(() => KC.Save.data.coins); if (c !== 4321) throw new Error('coins ' + c); return true;
  });
  await check('settings: RESET SAVE → YES wipes to a fresh save with 5 starters', async () => {
    await clickLi('#listItems', 'RESET SAVE'); await clickLi('#listItems', 'YES');
    const v = await page.evaluate(() => ({ coins: KC.Save.data.coins, owned: KC.Save.data.owned, tour: KC.Save.data.tour || 0, theme: KC.Save.data.theme }));
    if (v.coins !== 0 || v.owned.length !== 5 || v.tour !== 0) throw new Error(JSON.stringify(v)); return v;
  });
  await check('save persists across reload', async () => {
    await page.evaluate(() => { KC.Save.data.coins = 777; KC.Save.data.owned.push('peres'); KC.Save.write(); });
    await page.reload(); await page.waitForFunction(() => KC.Game && KC.Game.screen === 'title');
    const v = await page.evaluate(() => [KC.Save.data.coins, KC.Save.owns('peres')]); if (v[0] !== 777 || !v[1]) throw new Error(JSON.stringify(v)); return true;
  });
  await check('corrupted save falls back to a fresh save instead of crashing', async () => {
    await page.evaluate(() => localStorage.setItem('kc26_save_v2', '{not json'));
    await page.reload(); await page.waitForFunction(() => KC.Game && KC.Game.screen === 'title', null, { timeout: 15000 });
    return page.evaluate(() => [KC.Save.data.coins, KC.Save.data.owned.length]);
  });
  console.log(R.log.join('\n')); console.log('\n' + R.pass + ' passed, ' + R.fail + ' failed'); await T.close();
})();
