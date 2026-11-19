const L = require('./lib.js');
(async () => {
  const T = await L.open(); const { page, check, R } = T;
  await page.evaluate(() => { KC.Save.data.tutorialPrompted = true; });
  // scripted controller for P1 + per-fighter move test
  await page.addScriptTag({ content: `
    window.MV = function (id, oppId) {
      var G = KC.Game, N = { l: 0, r: 0, u: 0, d: 0, p: 0, k: 0, s: 0, x: 0, e: 0 }, q = [], out = { id: id, moves: {}, problems: [] };
      G.startMatch({ mode: 'versus', chars: [KC.rosterById[id], KC.rosterById[oppId]], skins: [null, null], ai: [null, null] });
      var m = G.match; KC.HUD.hideVs(); m.startRound(); m.setPhase('fight'); KC.HUD.banner(null);
      var cur = {};
      G.ai = [{ input: function () { return Object.assign({}, N, cur); } }, { input: function () { return Object.assign({}, N); } }];
      var f = m.f[0], o = m.f[1];
      function run(n) { m.paused = false; for (var i = 0; i < n; i++) { m.tick(); if (!isFinite(f.x) || !isFinite(f.y) || !isFinite(o.x)) out.problems.push('NaN position'); } m.paused = true; }
      function settle() { cur = {}; for (var i = 0; i < 400 && !(f.actionable() && o.actionable() && f.grounded() && !m.hitstop && !m.superFreeze); i++) run(1); }
      function reset() { settle(); f.x = -1.0; o.x = 0.2; f.facing = 1; o.facing = -1; o.health = o.maxHealth; f.meter = 0; m.timeLeft = 99; }
      function tryMove(name, inp, expect, pre) {
        reset(); if (pre) pre();
        var seen = {}, h0 = o.health;
        if (name === 'JP' || name === 'JK') { cur = { u: 1 }; run(1); cur = {}; run(14); }
        cur = inp; run(1); cur = Object.assign({}, inp); ['p','k','s','x','e'].forEach(function (b) { delete cur[b]; });
        for (var i = 0; i < 160; i++) { run(1); seen[f.state + (f.move ? ':' + f.move.id : '') + (f.sup ? ':' + f.sup.type : '')] = 1; }
        cur = {}; run(30);
        var keys = Object.keys(seen), ok = keys.some(function (k) { return expect.test(k); });
        out.moves[name] = { ok: ok, dmg: h0 - o.health };
        if (!ok) out.problems.push(name + ' never entered ' + expect + ' (saw ' + keys.slice(0, 6).join(',') + ')');
      }
      tryMove('LP', { p: 1 }, /attack:LP/);
      tryMove('HK', { k: 1 }, /attack:HK/);
      tryMove('CP', { d: 1, p: 1 }, /attack:CP/);
      tryMove('CK', { d: 1, k: 1 }, /attack:CK/);
      tryMove('JP', { p: 1 }, /attack:JP/);
      tryMove('JK', { k: 1 }, /attack:JK/);
      var sp = KC.rosterById[id].special.type;
      tryMove('special', { s: 1 }, sp === 'projectile' ? /^special/ : sp === 'rush' ? /^rush/ : sp === 'rising' ? /^rising/ : /^counter/);
      if (f.alt) { var at = f.alt.type; tryMove('special2', { d: 1, s: 1 }, at === 'projectile' ? /^special/ : at === 'rush' ? /^rush/ : at === 'rising' ? /^rising/ : /^counter/); }
      if (f.hasSuper) tryMove('super', { x: 1 }, /^super/, function () { f.meter = 100; });
      else { reset(); f.meter = 100; cur = { x: 1 }; run(5); if (f.state === 'super') out.problems.push('Common used a Super'); cur = {}; }
      // dash both ways
      tryMove('dash', { e: 1 }, /^dash/); tryMove('backdash', { e: 1, l: 1 }, /^dash/);
      settle(); m.positionFighters();
      if (m.hazards.length) out.problems.push('hazards left after reset: ' + m.hazards.length);
      var sc = 0; KC.Game.scene.traverse(function () { sc++; }); out.sceneObjects = sc;
      return out;
    };` });
  const ids = await page.evaluate(() => KC.ROSTER.map(c => c.id));
  const counts = [];
  for (let i = 0; i < (process.env.ONLY_TUT ? 0 : ids.length); i++) {
    const opp = ids[(i + 7) % ids.length];
    await check('fighter ' + ids[i] + ' (vs ' + opp + '): every move works', async () => {
      const r = await page.evaluate(([a, b]) => MV(a, b), [ids[i], opp]);
      counts.push(r.sceneObjects);
      if (r.problems.length) throw new Error(r.problems.join('; '));
      const d = Object.entries(r.moves).map(([k, v]) => k + ':' + v.dmg).join(' ');
      return d;
    });
  }
  if (!process.env.ONLY_TUT) await check('no scene-object leak across 51 matches', async () => {
    const first = counts[2], last = counts[counts.length - 1];
    if (last > first * 1.5) throw new Error('scene objects grew ' + first + ' -> ' + last);
    return { first, last };
  });
  // ---- full tutorial with a scripted controller
  await check('tutorial: all 11 steps complete, then reward + menu', async () => {
    const coins0 = await page.evaluate(() => { KC.Save.data.tutorialDone = false; KC.Save.data.coins = 0; KC.Save.data.chestQueue = []; return 0; });
    const res = await page.evaluate(() => {
      var G = KC.Game; G.startTutorial(); var m = G.match, f = m.f[0], d = m.f[1], N = { l: 0, r: 0, u: 0, d: 0, p: 0, k: 0, s: 0, x: 0, e: 0 }, cur = {};
      G.ai[0] = { input: function () { return Object.assign({}, N, cur); } };
      var log = [];
      function run(n) { m.paused = false; for (var i = 0; i < n && G.match === m; i++) { m.tick(); if (G.tut) G.tutTick(m); } }
      function waitStep(s) { for (var i = 0; i < 300 && G.tut && G.tut.step === s; i++) run(1); }
      function near() { f.x = d.x - 0.9; }
      var plan = [
        function () { cur = { r: 1 }; run(60); cur = { l: 1 }; run(20); cur = {}; },                 // MOVE
        function () { cur = { u: 1 }; run(2); cur = {}; run(60); },                                   // JUMP
        function () { cur = { d: 1 }; run(40); cur = {}; },                                            // CROUCH
        function () { f.x = -3; cur = { r: 1 }; run(2); cur = {}; run(3); cur = { r: 1 }; run(2); cur = {}; run(40); f.x = 0; cur = { l: 1 }; run(2); cur = {}; run(3); cur = { l: 1 }; run(2); cur = {}; run(40); },  // DASH
        function () { for (var k = 0; k < 3; k++) { near(); cur = { p: 1 }; run(1); cur = {}; run(30); } },   // PUNCH x2
        function () { near(); cur = { k: 1 }; run(1); cur = {}; run(40); },                            // KICK
        function () { near(); cur = { p: 1 }; run(1); cur = {}; run(7); cur = { p: 1 }; run(1); cur = {}; run(40); },  // COMBO
        function () { cur = { l: 1 }; run(400); cur = {}; },                                           // BLOCK (dummy attacks)
        function () { f.x = d.x - 2.5; cur = { s: 1 }; run(1); cur = {}; run(60); },                   // SPECIAL
        function () { cur = { d: 1, s: 1 }; run(1); cur = {}; run(60); },                              // DOWN-SPECIAL
        function () { cur = { x: 1 }; run(1); cur = {}; run(200); }                                    // SUPER
      ];
      for (var s = 0; s < plan.length && G.tut && !G.tut.done; s++) {
        var st = G.tut.step, tries = 0;
        while (G.tut && G.tut.step === st && tries++ < 6) { plan[st](); waitStep(st); }
        log.push(st + (G.tut && G.tut.step === st ? ' STUCK' : ' ok'));
        if (G.tut && G.tut.step === st) break;
      }
      run(200);
      return { log: log, done: !!KC.Save.data.tutorialDone, coins: KC.Save.data.coins, chests: KC.Save.data.chestQueue.length, screen: G.screen };
    });
    if (!res.done || res.log.some(l => /STUCK/.test(l))) throw new Error(JSON.stringify(res));
    return res;
  });
  console.log(R.log.join('\n')); console.log('\n' + R.pass + ' passed, ' + R.fail + ' failed'); await T.close();
})();
