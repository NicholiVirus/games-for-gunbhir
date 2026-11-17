/* Knesset Combat 26' — game shell: input, save/unlocks, portraits, HUD, menus, select, campaign, results. */
(function () {
  var T = THREE, M = KC.Models;
  var G = KC.Game = {};
  var $ = function (id) { return document.getElementById(id); };
  var STEP = 1 / 60;

  /* =====================================================================
   * SAVE / PROGRESSION
   * ===================================================================== */
  var SAVE_KEY = 'kc26_save_v2', OLD_KEY = 'kc26_save_v1';
  var memoryStore = null;
  function defaults() {
    return { coins: 0, earned: 0, matches: 0, wins: 0, cpuWins: 0, supers: 0, perfects: 0, campaign: 0, tour: 0, ranks: {}, shards: {}, campWins: 0, chests: 0, charWins: {}, owned: ['bengurion'], gold: [],
      settings: { rounds: 2, timer: 99, stage: 'random', music: true, sfx: true, voice: true } };
  }
  var Save = KC.Save = {
    load: function () {
      var d = null, old = null;
      try { var raw = localStorage.getItem(SAVE_KEY); if (raw) d = JSON.parse(raw); else { var o = localStorage.getItem(OLD_KEY); if (o) old = JSON.parse(o); } } catch (e) { d = memoryStore; }
      var base = defaults();
      if (d) { base = Object.assign(base, d); base.settings = Object.assign(defaults().settings, d.settings || {}); }
      else if (old) { // migrate the v1 "Mandates" save: keep fighters, convert Mandates to coins
        base.coins = (old.mandates || 0) * 5; base.earned = base.coins;
        base.owned = (old.unlocked || ['bengurion']).filter(function (id) { return KC.rosterById[id]; });
        base.gold = (old.gold || []).filter(function (id) { return KC.rosterById[id]; });
        base.charWins = old.charWins || {}; base.matches = old.matches || 0; base.cpuWins = old.cpuWins || 0;
        base.settings = Object.assign(defaults().settings, old.settings || {});
      }
      if (base.owned.indexOf('bengurion') < 0) base.owned.push('bengurion');
      Save.data = base;
    },
    write: function () { memoryStore = Save.data; try { localStorage.setItem(SAVE_KEY, JSON.stringify(Save.data)); } catch (e) { /* private mode */ } },
    owns: function (id) { return Save.data.owned.indexOf(id) >= 0; },
    isUnlocked: function (id) { return Save.owns(id); },
    hasGold: function (id) { return Save.data.gold.indexOf(id) >= 0; },
    canAfford: function (n) { return Save.data.coins >= n; },
    buy: function (ch) {
      return false;   // fighters can no longer be bought outright — collect shards instead
      var p = G.recruitPrice(ch);
      if (Save.owns(ch.id) || !Save.canAfford(p)) return false;
      Save.data.coins -= p; Save.data.owned.push(ch.id); delete Save.data.shards[ch.id]; Save.write(); return true;
    },
    shards: function (id) { return (Save.data.shards && Save.data.shards[id]) || 0; },
    /* add shards; recruits automatically when complete; shards of owned fighters become coins */
    addShards: function (ch, n) {
      if (Save.owns(ch.id)) { var c = n * KC.SHARD_DUPE_COINS; Save.addCoins(c); Save.write(); return { dupeCoins: c }; }
      var need = KC.shardsNeeded(ch), have = Save.shards(ch.id) + n;
      if (have >= need) { Save.data.owned.push(ch.id); delete Save.data.shards[ch.id]; Save.write(); return { recruited: true }; }
      Save.data.shards[ch.id] = have; Save.write(); return { have: have, need: need };
    },
    buyShard: function (ch) {
      var p = KC.shardPrice(ch);
      if (Save.owns(ch.id) || !Save.canAfford(p)) return null;
      Save.data.coins -= p; return Save.addShards(ch, 1);
    },
    buyGold: function (ch) {
      if (!Save.owns(ch.id) || Save.hasGold(ch.id) || !Save.canAfford(KC.ALT_SKIN_PRICE)) return false;
      Save.data.coins -= KC.ALT_SKIN_PRICE; Save.data.gold.push(ch.id); Save.write(); return true;
    },
    addCoins: function (n) { Save.data.coins += n; Save.data.earned += n; },
    refreshGold: function () {
      var golds = [], d = Save.data;
      KC.ROSTER.forEach(function (ch) {
        if (Save.owns(ch.id) && !Save.hasGold(ch.id) && (d.charWins[ch.id] || 0) >= KC.ALT_SKIN_WINS) { d.gold.push(ch.id); golds.push(ch); }
      });
      Save.write();
      return golds;
    },
    lockedByPrice: function () {
      return KC.ROSTER.filter(function (c) { return !Save.owns(c.id); }).sort(function (a, b) { return (KC.shardsNeeded(a) - Save.shards(a.id)) - (KC.shardsNeeded(b) - Save.shards(b.id)); });
    },
    unlockAll: function () {
      Save.data.owned = KC.ROSTER.map(function (c) { return c.id; });
      Save.data.gold = KC.ROSTER.map(function (c) { return c.id; });
      Save.addCoins(20000);
      Save.write();
    },
    rank: function (id) { return (Save.data.ranks && Save.data.ranks[id]) || 0; },
    upgrade: function (ch) {
      var r = Save.rank(ch.id);
      if (!Save.owns(ch.id) || r >= KC.UPGRADE.max) return false;
      var c = KC.UPGRADE.cost(ch, r + 1);
      if (!Save.canAfford(c)) return false;
      Save.data.coins -= c; Save.data.ranks[ch.id] = r + 1; Save.write(); return true;
    },
    reset: function () { var s = Save.data.settings; Save.data = defaults(); Save.data.settings = s; Save.write(); }
  };
  G.recruitPrice = function (ch) {
    var need = KC.shardsNeeded(ch); if (!need) return 0;
    return Math.ceil(KC.priceOf(ch) * (1 - Math.min(Save.shards(ch.id), need) / need));
  };
  G.shardBar = function (ch) {
    var need = KC.shardsNeeded(ch), have = Save.shards(ch.id);
    return '<div class="shardbar"><span class="shard"></span><b>' + have + ' / ' + need + '</b> shards<div class="sbar"><div style="width:' + Math.round(have / need * 100) + '%"></div></div></div>';
  };
  G.coin = function (n) { return '<span class="coin"></span>' + n; };

  /* =====================================================================
   * INPUT (keyboard + gamepads mapped to virtual key codes)
   * ===================================================================== */
  var keys = {}, just = {};
  var MAP = [
    { u: ['KeyW', 'Pad0_up'], d: ['KeyS', 'Pad0_down'], l: ['KeyA', 'Pad0_left'], r: ['KeyD', 'Pad0_right'], p: ['KeyF', 'Pad0_a'], k: ['KeyG', 'Pad0_b'], s: ['KeyR', 'Pad0_x'], x: ['KeyT', 'Pad0_y'] },
    { u: ['KeyI', 'ArrowUp', 'Pad1_up'], d: ['KeyK', 'ArrowDown', 'Pad1_down'], l: ['KeyJ', 'ArrowLeft', 'Pad1_left'], r: ['KeyL', 'ArrowRight', 'Pad1_right'], p: ['KeyU', 'Numpad1', 'Pad1_a'], k: ['KeyO', 'Numpad2', 'Pad1_b'], s: ['KeyP', 'Numpad4', 'Pad1_x'], x: ['Semicolon', 'Numpad5', 'Pad1_y'] }
  ];
  var MENU = {
    up: ['KeyW', 'KeyI', 'ArrowUp', 'Pad0_up', 'Pad1_up'], down: ['KeyS', 'KeyK', 'ArrowDown', 'Pad0_down', 'Pad1_down'],
    left: ['KeyA', 'KeyJ', 'ArrowLeft', 'Pad0_left', 'Pad1_left'], right: ['KeyD', 'KeyL', 'ArrowRight', 'Pad0_right', 'Pad1_right'],
    ok: ['Enter', 'NumpadEnter', 'Space', 'KeyF', 'KeyU', 'Numpad1', 'Pad0_a', 'Pad1_a', 'Pad0_start', 'Pad1_start'],
    back: ['Escape', 'Backspace', 'KeyG', 'KeyO', 'Pad0_b', 'Pad1_b'],
    pause: ['Escape', 'Backspace', 'Pad0_start', 'Pad1_start']
  };
  var PREVENT = {};
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Backspace', 'Tab', 'Semicolon'].forEach(function (c) { PREVENT[c] = 1; });
  var cheatBuf = '';
  window.addEventListener('keydown', function (e) {
    if (PREVENT[e.code]) e.preventDefault();
    KC.Audio.init();
    if (e.repeat) return;
    if (!keys[e.code]) just[e.code] = true;
    keys[e.code] = true;
    if (e.key && e.key.length === 1) {
      cheatBuf = (cheatBuf + e.key.toUpperCase()).slice(-7);
      if (cheatBuf === 'KNESSET' && G.screen !== 'fight') { Save.unlockAll(); G.toast('All 120 seats secured — every fighter and skin unlocked, plus ' + G.coin(20000) + '!'); KC.Audio.play('unlock'); if (screens[G.screen] && screens[G.screen].refresh) screens[G.screen].refresh(); }
    }
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  document.addEventListener('click', function (e) {
    var bb = e.target.closest('.backbtn'); if (bb) { just.Escape = true; return; }
    if (e.target.closest('#pauseBtn')) { just.Escape = true; }
  });
  window.addEventListener('blur', function () { keys = {}; });
  window.addEventListener('pointerdown', function () { KC.Audio.init(); });

  var PAD_BTNS = { a: 0, b: 1, x: 2, y: 3, rb: 5, back: 8, start: 9 };
  function pollPads() {
    var pads = [];
    try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { pads = []; }
    for (var i = 0; i < 2; i++) {
      var p = pads && pads[i], st = {};
      if (p && p.connected) {
        var ax = p.axes || [], b = p.buttons || [];
        var pr = function (n) { return !!(b[n] && b[n].pressed); };
        st.up = pr(12) || ax[1] < -0.55; st.down = pr(13) || ax[1] > 0.55; st.left = pr(14) || ax[0] < -0.55; st.right = pr(15) || ax[0] > 0.55;
        st.a = pr(0); st.b = pr(1); st.x = pr(2); st.y = pr(3) || pr(5); st.start = pr(9); st.back = pr(8);
        if (pr(0) || pr(9)) KC.Audio.init();
      }
      ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'start', 'back'].forEach(function (n) {
        var code = 'Pad' + i + '_' + n, v = !!st[n];
        if (v && !keys[code]) just[code] = true;
        keys[code] = v;
      });
    }
  }
  var Input = G.Input = {
    held: function (list) { for (var i = 0; i < list.length; i++) if (keys[list[i]]) return 1; return 0; },
    hit: function (list) { for (var i = 0; i < list.length; i++) if (just[list[i]]) return true; return false; },
    menu: function (name) { return Input.hit(MENU[name]); },
    player: function (i, merged) {
      var m = MAP[i], o = {};
      for (var k in m) o[k] = Input.held(m[k]) || (merged ? Input.held(MAP[1][k]) : 0);
      return o;
    },
    pp: function (i, btn) { return Input.hit(MAP[i][btn]); },
    endFrame: function () { just = {}; }
  };

  /* =====================================================================
   * RENDERER / SCENE
   * ===================================================================== */
  var renderer, scene, camera, stage, fx;
  function initGL() {
    renderer = new T.WebGLRenderer({ canvas: $('view'), antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputEncoding = T.sRGBEncoding;
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 4, 10);
    stage = KC.Stage.build(scene);
    fx = new KC.FX(scene);
    G.renderer = renderer; G.scene = scene; G.camera = camera; G.stage = stage; G.fx = fx;
    window.addEventListener('resize', function () {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    });
  }

  /* ---------- portraits rendered once from the real 3D models ---------- */
  G.portraits = {};
  function makePortraits() {
    var size = 160;
    var r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(size, size); r.outputEncoding = T.sRGBEncoding;
    var sc = new T.Scene();
    sc.add(new T.HemisphereLight(0xffffff, 0x445066, 0.9));
    var d = new T.DirectionalLight(0xffffff, 0.9); d.position.set(1.5, 2, 3); sc.add(d);
    var cam = new T.PerspectiveCamera(30, 1, 0.1, 20);
    KC.ROSTER.forEach(function (ch) {
      G.portraits[ch.id] = {};
      [['n', null], ['g', KC.ALT_SKIN]].forEach(function (v) {
        var mdl = M.buildFighter(ch, { skin: v[1] });
        var pose = M.zeroPose(); pose.lShRz = 0.12; pose.rShRz = 0.12; pose.headRx = -0.05;
        M.applyPose(mdl, pose);
        mdl.root.rotation.y = 0.32;
        sc.add(mdl.root);
        var h = mdl.scale, hy = 1.74 * h;
        cam.position.set(0.32, hy + 0.04, 1.2); cam.lookAt(0, hy - 0.06, 0);
        r.render(sc, cam);
        G.portraits[ch.id][v[0]] = r.domElement.toDataURL('image/png');
        sc.remove(mdl.root);
      });
    });
    try { r.dispose(); r.forceContextLoss(); } catch (e) { /* ignore */ }
  }
  function por(ch, gold) { var p = G.portraits[ch.id]; return p ? (gold ? p.g : p.n) : ''; }
  G.por = por;

  /* =====================================================================
   * UI HELPERS
   * ===================================================================== */
  var toastTimer = null;
  G.toast = function (msg, ms) {
    var t = $('toast'); t.innerHTML = msg; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function statBar(v) { var pct = Math.max(8, Math.min(100, (v - 0.75) / 0.55 * 100)); return '<div class="sb"><div style="width:' + pct.toFixed(0) + '%"></div></div>'; }

  /* =====================================================================
   * HUD
   * ===================================================================== */
  var hudEls = null, trails = [1, 1], trailDelay = [0, 0], lastHp = [1, 1], comboT = [0, 0], calloutT = [0, 0];
  KC.HUD = {
    setup: function (m) {
      var hud = $('hud');
      hudEls = {
        hp: [hud.querySelector('.hp.p1'), hud.querySelector('.hp.p2')],
        meter: [hud.querySelector('.meter.p1'), hud.querySelector('.meter.p2')],
        timer: hud.querySelector('.timer'), combo: [hud.querySelector('.combo.p1'), hud.querySelector('.combo.p2')],
        callout: [hud.querySelector('.callout.p1'), hud.querySelector('.callout.p2')]
      };
      for (var i = 0; i < 2; i++) {
        var f = m.f[i], el = hudEls.hp[i];
        el.querySelector('.por').src = por(f.ch, f.skin === KC.ALT_SKIN);
        el.querySelector('.nm').textContent = (G.matchCfg && G.ai && G.ai[i] ? 'CPU · ' : (i === 0 ? 'P1 · ' : 'P2 · ')) + f.ch.short + (f.rank ? ' ★' + f.rank : '');
        trails[i] = 1; lastHp[i] = 1; trailDelay[i] = 0; comboT[i] = 0; calloutT[i] = 0;
        hudEls.combo[i].classList.remove('on'); hudEls.callout[i].classList.remove('on');
        hudEls.meter[i].querySelector('.mkey').textContent = G.ai && G.ai[i] ? 'CPU' : (i === 0 ? 'T' : ';');
        hudEls.meter[i].classList.toggle('none', !f.hasSuper);
        hudEls.meter[i].querySelector('.mlabel').textContent = f.hasSuper ? 'SUPER' : 'NO SUPER · ' + KC.RARITY[f.ch.rarity].name.toUpperCase();
      }
      KC.HUD.updatePips(m);
      KC.HUD.show(false);
      KC.HUD.banner(null);
    },
    show: function (on) { $('hud').classList.toggle('show', !!on); },
    banner: function (text, sub, cls) {
      var b = $('banner');
      if (!text) { b.className = ''; return; }
      b.querySelector('.big').textContent = text;
      b.querySelector('.sub').textContent = sub || '';
      b.className = ''; void b.offsetWidth; b.className = 'show ' + (cls || '');
    },
    vs: function (a, b) {
      var v = $('vs'), m = G.match;
      v.querySelector('.l img').src = por(a, m.f[0].skin === KC.ALT_SKIN); v.querySelector('.l .vs-name').textContent = a.short; v.querySelector('.l .vs-title').textContent = a.title.toUpperCase();
      v.querySelector('.r img').src = por(b, m.f[1].skin === KC.ALT_SKIN); v.querySelector('.r .vs-name').textContent = b.short; v.querySelector('.r .vs-title').textContent = b.title.toUpperCase();
      v.classList.add('show');
      KC.Audio.say(a.name + '. Versus. ' + b.name + '.', { rate: 1.0 });
    },
    hideVs: function () { $('vs').classList.remove('show'); },
    update: function (m) {
      if (!hudEls) return;
      for (var i = 0; i < 2; i++) {
        var f = m.f[i], ratio = Math.max(0, f.health / f.maxHealth);
        var el = hudEls.hp[i];
        if (ratio < lastHp[i]) trailDelay[i] = 40;
        lastHp[i] = ratio;
        if (trailDelay[i] > 0) trailDelay[i]--; else trails[i] += (ratio - trails[i]) * 0.08;
        if (trails[i] < ratio) trails[i] = ratio;
        var fill = el.querySelector('.fill');
        fill.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        fill.classList.toggle('low', ratio < 0.25);
        el.querySelector('.trail').style.transform = 'scaleX(' + trails[i].toFixed(4) + ')';
        var mt = hudEls.meter[i];
        mt.querySelector('.mfill').style.transform = 'scaleX(' + (f.meter / 100).toFixed(3) + ')';
        mt.classList.toggle('full', f.meter >= 100 && f.hasSuper);
        if (comboT[i] > 0) { comboT[i]--; if (comboT[i] === 0) hudEls.combo[i].classList.remove('on'); }
        if (calloutT[i] > 0) { calloutT[i]--; if (calloutT[i] === 0) hudEls.callout[i].classList.remove('on'); }
      }
      var tl = m.timeLeft;
      var span = hudEls.timer.querySelector('span');
      var txt = tl === Infinity || tl === undefined ? '∞' : String(Math.max(0, tl));
      if (span.textContent !== txt) span.textContent = txt;
      hudEls.timer.classList.toggle('low', tl !== Infinity && tl <= 10);
    },
    combo: function (slot, n) {
      if (!hudEls) return;
      hudEls.combo[slot].innerHTML = n + '<small>HIT COMBO</small>';
      hudEls.combo[slot].classList.add('on'); comboT[slot] = 70;
    },
    callout: function (slot, text, isSuper) {
      if (!hudEls) return;
      var c = hudEls.callout[slot]; c.textContent = text; c.classList.toggle('super', !!isSuper); c.classList.add('on'); calloutT[slot] = isSuper ? 110 : 60;
    },
    superCut: function (f) {
      var s = $('supercut');
      s.querySelector('img').src = por(f.ch, f.skin === KC.ALT_SKIN);
      s.querySelector('.sc-who').textContent = f.ch.name.toUpperCase() + ' — SUPER';
      s.querySelector('.sc-move').textContent = f.ch.super.name.toUpperCase();
      s.className = ''; void s.offsetWidth; s.className = 'show' + (f.slot === 1 ? ' right' : '');
      var fl = $('flash'); fl.style.transition = 'none'; fl.style.opacity = 0.7; void fl.offsetWidth; fl.style.transition = 'opacity 0.35s'; fl.style.opacity = 0;
    },
    superCutHide: function () { $('supercut').className = ''; },
    updatePips: function (m) {
      if (!hudEls) return;
      for (var i = 0; i < 2; i++) {
        var p = hudEls.hp[i].querySelector('.pips'), html = '';
        for (var k = 0; k < m.roundsToWin; k++) html += '<div class="pip' + (m.wins[i] > k ? ' won' : '') + '"></div>';
        p.innerHTML = html;
      }
    }
  };

  /* =====================================================================
   * 3D PREVIEW MODELS (select + collection)
   * ===================================================================== */
  var previews = [null, null];
  function setPreview(slot, ch, skin, sil, x, yaw) {
    clearPreview(slot);
    var mdl = M.buildFighter(ch, { skin: skin, silhouette: sil });
    mdl.root.position.set(x, 0, 2.2); mdl.root.rotation.y = yaw;
    scene.add(mdl.root);
    previews[slot] = { m: mdl, pose: M.poses.idle(0), t: Math.random() * 3, ch: ch, cheer: 0, yaw: yaw, spin: false };
    return previews[slot];
  }
  function clearPreview(slot) { if (previews[slot]) { scene.remove(previews[slot].m.root); previews[slot] = null; } }
  function clearPreviews() { clearPreview(0); clearPreview(1); }
  function updatePreviews(dt) {
    previews.forEach(function (p) {
      if (!p) return;
      p.t += dt;
      var target = p.cheer > 0 ? M.poses.victory(p.ch.victory, p.t) : M.poses.idle(p.t);
      if (p.cheer > 0) p.cheer -= dt;
      M.lerpPose(p.pose, target, Math.min(1, dt * 9));
      M.applyPose(p.m, p.pose);
      if (p.spin) p.m.root.rotation.y += dt * 0.7;
    });
  }

  /* =====================================================================
   * SCREENS
   * ===================================================================== */
  var screens = {};
  G.screen = null;
  G.inputLock = 0;
  var camMode = 'orbit', camT = 0;
  function go(name, arg) {
    var prev = screens[G.screen];
    if (prev && prev.exit) prev.exit();
    document.querySelectorAll('.screen').forEach(function (e) { e.classList.remove('show'); });
    G.screen = name;
    G.inputLock = 0.18;
    var s = screens[name];
    if (s.el) $(s.el).classList.add('show');
    if (s.enter) s.enter(arg);
  }
  G.go = go;
  function highlight(ul, i) { ul.querySelectorAll('li').forEach(function (li, k) { li.classList.toggle('sel', k === i); }); }
  function navList(items, sel) {
    if (Input.menu('up')) { sel = (sel - 1 + items) % items; KC.Audio.play('move'); }
    if (Input.menu('down')) { sel = (sel + 1) % items; KC.Audio.play('move'); }
    return sel;
  }

  /* ---------- title ---------- */
  $('title').addEventListener('click', function () { if (G.screen === 'title') { KC.Audio.init(); KC.Audio.play('gavel'); go('menu'); } });
  screens.title = {
    el: 'title',
    enter: function () { camMode = 'orbit'; stage.setMode('day'); KC.Audio.playMusic('menu'); },
    update: function () { if (Input.menu('ok')) { KC.Audio.init(); KC.Audio.play('gavel'); KC.Audio.playMusic('menu'); go('menu'); } }
  };

  /* ---------- main menu ---------- */
  var MENU_ITEMS = [
    { id: 'tour', label: 'CAMPAIGN · 250 LEVELS', desc: 'Fight through 250 levels of CPU rivals. Every 10th level is a boss. Wins drop tap-to-upgrade chests full of coins and leader shards.' },
    { id: 'versus', label: 'VERSUS · 2 PLAYERS', desc: 'Same keyboard. Player 1 on WASD + F G R T, Player 2 on IJKL + U O P ;. Both players earn coins for the shared wallet.' },
    { id: 'campaign', label: 'ELECTION ARCADE', desc: 'Quick arcade ladder: beat five random rivals, then face the final boss in one run.' },
    { id: 'shop', label: 'SHOP · SHARDS & UPGRADES', desc: 'Buy shards toward locked fighters, upgrade your fighters to Rank 5, and buy gold skins.' },
    { id: 'howto', label: 'HOW TO PLAY', desc: 'Controls, rarity, abilities, blocking and how coins work.' },
    { id: 'settings', label: 'SETTINGS', desc: 'Rounds, round timer, chamber lighting, music, sound and announcer.' }
  ];
  function rarBadge(ch) { var r = KC.RARITY[ch.rarity]; return '<span class="rar r-' + r.id + '">' + r.name.toUpperCase() + '</span>'; }
  G.rarBadge = rarBadge;
  screens.menu = {
    el: 'menu', sel: 0,
    enter: function () { camMode = 'menu'; stage.setMode('day'); clearPreviews(); KC.Audio.playMusic('menu'); this.render(); },
    refresh: function () { this.render(); },
    render: function () {
      var self = this;
      $('menuList').innerHTML = MENU_ITEMS.map(function (it, i) { return '<li class="' + (i === self.sel ? 'sel' : '') + '" data-i="' + i + '">' + it.label + '</li>'; }).join('');
      $('menuList').querySelectorAll('li').forEach(function (li) {
        li.onmouseenter = function () { if (self.sel !== +li.dataset.i) { self.sel = +li.dataset.i; highlight($('menuList'), self.sel); $('menuDesc').textContent = MENU_ITEMS[self.sel].desc; KC.Audio.play('move'); } };
        li.onclick = function () { KC.Audio.init(); self.sel = +li.dataset.i; self.choose(); };
      });
      $('menuDesc').textContent = MENU_ITEMS[this.sel].desc;
      var d = Save.data, locked = Save.lockedByPrice(), own = d.owned.length;
      var html = '<div class="mb-top"><div><div class="mb-lbl">COINS</div><div class="mb-num">' + G.coin(d.coins) + '</div></div><div style="text-align:right"><div class="mb-lbl">FIGHTERS</div><div class="mb-num" style="color:#fff">' + own + '/' + KC.ROSTER.length + '</div></div></div>';
      if (locked.length) {
        var nx = locked[0], need = KC.shardsNeeded(nx), have = Save.shards(nx.id);
        html += '<div class="progress"><div style="width:' + Math.round(have / need * 100) + '%"></div></div><div class="mb-next"><img src="' + por(nx) + '" class="dim" alt=""><div>Closest recruit: <b>' + esc(nx.name) + '</b> ' + rarBadge(nx) + '<br>' +
          '<span style="color:#e6d7ff"><span class="shard"></span> ' + have + ' / ' + need + ' shards — win campaign chests to collect more</span></div></div>';
      } else html += '<div class="mb-next" style="margin-top:8px">Full cabinet: all ' + KC.ROSTER.length + ' fighters recruited.</div>';
      $('mandateBox').innerHTML = html;
    },
    choose: function () {
      var it = MENU_ITEMS[this.sel];
      KC.Audio.play('select');
      switch (it.id) {
        case 'campaign': go('select', { mode: 'campaign' }); break;
        case 'versus': go('select', { mode: 'versus' }); break;
        case 'tour': go('levels'); break;
        case 'shop': go('shop'); break;
        case 'howto': go('howto'); break;
        case 'settings': showSettings(); break;
      }
    },
    update: function () {
      var n = navList(MENU_ITEMS.length, this.sel);
      if (n !== this.sel) { this.sel = n; this.render(); }
      if (Input.menu('ok')) this.choose();
      else if (Input.menu('back')) { KC.Audio.play('back'); go('title'); }
    }
  };

  /* ---------- generic list ---------- */
  var listCfg = null;
  function showList(cfg) { listCfg = cfg; go('list'); }
  G.showList = showList;
  screens.list = {
    el: 'listScreen',
    enter: function () { this.sel = listCfg.sel || 0; this.render(); },
    render: function () {
      var self = this;
      $('listTitle').textContent = listCfg.title;
      $('listSub').innerHTML = listCfg.sub || '';
      $('listItems').innerHTML = listCfg.items.map(function (it, i) {
        var val = typeof it.value === 'function' ? it.value() : it.value;
        return '<li class="' + (i === self.sel ? 'sel' : '') + '" data-i="' + i + '">' + esc(it.label) + (val !== undefined ? '<span class="val">' + esc(val) + '</span>' : '') + '</li>';
      }).join('');
      var cur = listCfg.items[this.sel];
      $('listHint').innerHTML = (cur && cur.desc ? '<div style="color:#dfe7ff;margin-bottom:6px">' + esc(cur.desc) + '</div>' : '') + (listCfg.hint || 'W/S or ↑/↓ to move · ENTER / F / K to choose · ESC to go back');
      $('listItems').querySelectorAll('li').forEach(function (li) {
        li.onmouseenter = function () { if (self.sel !== +li.dataset.i) { self.sel = +li.dataset.i; highlight($('listItems'), self.sel); } };
        li.onclick = function () { KC.Audio.init(); self.sel = +li.dataset.i; self.activate(0); };
      });
    },
    activate: function (dir) {
      var it = listCfg.items[this.sel];
      if (dir && it.change) { it.change(dir); KC.Audio.play('move'); this.render(); return; }
      if (!dir) { if (it.change && !it.action) { it.change(1); KC.Audio.play('move'); this.render(); return; } if (it.action) { KC.Audio.play('select'); it.action(); } }
    },
    update: function () {
      var n = navList(listCfg.items.length, this.sel);
      if (n !== this.sel) { this.sel = n; this.render(); }
      if (Input.menu('left')) this.activate(-1);
      else if (Input.menu('right')) this.activate(1);
      if (Input.menu('ok')) this.activate(0);
      else if (Input.menu('back') && listCfg.back) { KC.Audio.play('back'); listCfg.back(); }
    }
  };

  function showSettings(sel) {
    var s = Save.data.settings;
    function cyc(arr, v, dir) { var i = arr.indexOf(v); return arr[(i + dir + arr.length) % arr.length]; }
    function apply() { KC.Audio.musicOn = s.music; KC.Audio.sfxOn = s.sfx; KC.Audio.voiceOn = s.voice; Save.write(); }
    showList({ title: 'SETTINGS', sub: 'Use ←/→ to change a value.', sel: sel || 0, items: [
      { label: 'ROUNDS TO WIN', value: function () { return s.rounds + (s.rounds === 1 ? ' (single round)' : ' (best of ' + (s.rounds * 2 - 1) + ')'); }, change: function (d) { s.rounds = cyc([1, 2, 3], s.rounds, d); apply(); } },
      { label: 'ROUND TIMER', value: function () { return s.timer >= 1000 ? '∞' : s.timer + 's'; }, change: function (d) { s.timer = cyc([60, 99, 9999], s.timer, d); apply(); } },
      { label: 'CHAMBER LIGHTING', value: function () { return { random: 'RANDOM', day: 'DAY SESSION', night: 'NIGHT SESSION' }[s.stage]; }, change: function (d) { s.stage = cyc(['random', 'day', 'night'], s.stage, d); apply(); stage.setMode(s.stage === 'night' ? 'night' : 'day'); } },
      { label: 'MUSIC', value: function () { return s.music ? 'ON' : 'OFF'; }, change: function () { s.music = !s.music; apply(); } },
      { label: 'SOUND EFFECTS', value: function () { return s.sfx ? 'ON' : 'OFF'; }, change: function () { s.sfx = !s.sfx; apply(); } },
      { label: 'ANNOUNCER VOICE', value: function () { return s.voice ? 'ON' : 'OFF'; }, change: function () { s.voice = !s.voice; apply(); } },
      { label: 'RESET SAVE', desc: 'Delete all coins, fighters, upgrades, shards, chests and campaign progress.', action: function () {
        showList({ title: 'RESET SAVE?', sub: 'This permanently deletes your coins, recruited fighters, upgrade ranks, shards, unopened chests and campaign progress. Your settings are kept.', sel: 0, items: [
          { label: 'NO, KEEP MY SAVE', action: function () { showSettings(6); } },
          { label: 'YES, DELETE EVERYTHING', action: function () { Save.reset(); try { localStorage.removeItem(OLD_KEY); } catch (e) { /* ignore */ } KC.Audio.play('gavel'); G.toast('Save reset. Back to 1948 — Ben-Gurion awaits.'); showSettings(6); } }
        ], back: function () { showSettings(6); } });
      } },
      { label: 'BACK', action: function () { stage.setMode('day'); go('menu'); } }
    ], back: function () { stage.setMode('day'); go('menu'); } });
  }

  /* ---------- how to ---------- */
  screens.howto = {
    el: 'howto',
    enter: function () { camMode = 'menu'; },
    update: function () { if (Input.menu('back') || Input.hit(['Enter', 'Space'])) { KC.Audio.play('back'); go('menu'); } }
  };

  /* ---------- character select ---------- */
  var COLS = 14;
  function cellHTML(ch, i, extraCls, tags) {
    var owned = Save.owns(ch.id);
    var grp = ch.group === 'contender' ? "26'" : ch.group === 'boss' ? 'BOSS' : ch.group === 'icon' ? 'MK' : '';
    var price = owned ? '' : '<span class="price shardp"><span class="shard"></span>' + Save.shards(ch.id) + '/' + KC.shardsNeeded(ch) + '</span>';
    return '<div class="cell r-' + ch.rarity + ' ' + (owned ? '' : 'locked ') + (extraCls || '') + '" data-i="' + i + '"><img src="' + por(ch) + '" alt="">' + (grp ? '<span class="grp">' + grp + '</span>' : '') + price + (tags || '') + '</div>';
  }
  G.cellHTML = cellHTML;
  /* keys: {s: 'R', x: 'T'} for P1, {s: 'O', x: 'P'} for P2, or generic words */
  function abilityHTML(ch, keys) {
    var r = KC.RARITY[ch.rarity];
    var out = '<div class="abils">';
    KC.abilities(ch).forEach(function (a) {
      var k = a.slot === 'special' ? keys.s : a.slot === 'alt' ? '↓+' + keys.s : keys.x;
      out += '<div class="abil"><span class="ak">' + k + '</span>' + (a.slot === 'super' ? '<b>SUPER</b> ' : '') + esc(a.name) + '</div>';
    });
    if (ch.special.type === 'projectile' || (ch.special2 && ch.special2.type === 'projectile')) out += '<div class="abil"><span class="ak">×' + Math.min(6, 3 + Save.rank(ch.id)) + '</span>Projectiles on screen (3 base, +1 per rank, max 6)</div>';
    if (ch.passive) out += '<div class="abil passive"><span class="ak">★</span><b>' + esc(ch.passive.name) + ':</b> ' + esc(KC.PASSIVES[ch.passive.id]) + '</div>';
    out += '</div><div class="rarline">' + r.abilities + ' abilit' + (r.abilities > 1 ? 'ies' : 'y') + (r.power > 1 ? ' · +' + Math.round((r.power - 1) * 100) + '% damage perk' : '') + (ch.passive ? ' · passive' : '') + '</div>';
    return out;
  }
  G.abilityHTML = abilityHTML;
  function panelHTML(ch, who, st) {
    var owned = Save.owns(ch.id), s = ch.stats, price = G.recruitPrice(ch);
    var head = '<div class="who">' + who + (owned ? ' · <span class="rank">RANK ' + Save.rank(ch.id) + '/' + KC.UPGRADE.max + '</span>' : '') + '</div><div class="name">' + esc(ch.name) + '</div><div class="ttl">' + rarBadge(ch) + ' ' + esc(ch.title.toUpperCase()) + ' · ' + esc(ch.years) + '</div>';
    var body = '<div class="bio">' + esc(ch.bio) + '</div>' + abilityHTML(ch, st.keys) +
      '<div class="stats"><span>SPEED</span>' + statBar(s.speed) + '<span>POWER</span>' + statBar(s.power) + '<span>DEFENSE</span>' + statBar(s.defense) + '<span>JUMP</span>' + statBar(s.jump) + '</div>';
    if (!owned) {
      return head + body + G.shardBar(ch) + '<div class="lockinfo">🔒 Locked · collect ' + (KC.shardsNeeded(ch) - Save.shards(ch.id)) + ' more shards from campaign chests (or buy shards in the Shop)</div>';
    }
    var gold = st.gold, goldOk = Save.hasGold(ch.id);
    return head + body +
      '<div class="skin">SKIN: <b>' + (gold ? KC.ALT_SKIN.name : 'Classic') + '</b> ' + (goldOk ? '<span style="opacity:.7">(' + st.skinKey + ' to switch)</span>' : '<span style="opacity:.6">· Gold: win ' + KC.ALT_SKIN_WINS + ' (' + Math.min(KC.ALT_SKIN_WINS, Save.data.charWins[ch.id] || 0) + '/' + KC.ALT_SKIN_WINS + ') or buy in Shop</span>') + '</div>' +
      (st.locked ? '<div class="ready">READY!</div>' : '');
  }
  var sel = null;
  screens.select = {
    el: 'select',
    enter: function (arg) {
      camMode = 'select'; stage.setMode('day');
      KC.Audio.playMusic('menu');
      var mode = arg.mode, two = mode === 'versus';
      var keep = sel && sel.mode === mode ? sel : null;
      sel = { mode: mode, level: arg.level, levelNo: arg.levelNo, two: two, t: 0, startT: 0,
        p: [{ cur: keep ? keep.p[0].cur : 0, locked: false, gold: keep ? keep.p[0].gold : false, confirm: -1, confirmT: 0 },
            { cur: keep ? keep.p[1].cur : 0, locked: false, gold: keep ? keep.p[1].gold : false, confirm: -1, confirmT: 0 }] };
      $('selTitle').textContent = two ? 'CHOOSE YOUR CANDIDATES' : 'CHOOSE YOUR CANDIDATE';
      $('selMode').innerHTML = (mode === 'versus' ? 'VERSUS · 2 PLAYERS' : mode === 'campaign' ? 'ELECTION ARCADE' : mode === 'tour' ? 'CAMPAIGN · LEVEL ' + arg.levelNo : 'VS CPU · ' + (arg.level || 'normal').toUpperCase()) + ' &nbsp;·&nbsp; ' + G.coin(Save.data.coins);
      var st = Save.data.settings;
      $('selStage').innerHTML = 'Chamber: <b>' + { random: 'Random', day: 'Day Session', night: 'Night Session' }[st.stage] + '</b> · First to <b>' + st.rounds + '</b> round' + (st.rounds > 1 ? 's' : '') + ' · Timer <b>' + (st.timer >= 1000 ? '∞' : st.timer) + '</b> <span style="opacity:.6">(change in Settings)</span>';
      $('selHint').innerHTML = two
        ? 'P1: <kbd>WASD</kbd> move · <kbd>F</kbd> pick/buy · <kbd>G</kbd> undo · <kbd>R</kbd> skin &nbsp;|&nbsp; P2: <kbd>IJKL</kbd> move · <kbd>U</kbd> pick/buy · <kbd>O</kbd> undo · <kbd>P</kbd> skin'
        : '<kbd>WASD</kbd>/<kbd>IJKL</kbd> move · <kbd>F</kbd>/<kbd>Enter</kbd> pick or buy · <kbd>R</kbd> skin · <kbd>Esc</kbd> back';
      this.render(true);
    },
    refresh: function () { this.render(true); },
    render: function (rebuild) {
      var html = '';
      KC.ROSTER.forEach(function (ch, i) {
        var c1 = sel.p[0].cur === i, c2 = sel.two && sel.p[1].cur === i;
        var tags = (c1 ? '<span class="tag t1">1P</span>' : '') + (c2 ? '<span class="tag t2">2P</span>' : '');
        html += cellHTML(ch, i, (c1 ? 'c1 ' : '') + (c2 ? 'c2' : ''), tags);
      });
      $('selGrid').innerHTML = html;
      var me = this;
      $('selGrid').querySelectorAll('.cell').forEach(function (c) {
        var i = +c.dataset.i;
        function clickFor(pl) { var p = sel.p[pl]; if (p.locked) return; if (p.cur === i) me.pick(pl); else { p.cur = i; p.gold = p.gold && Save.hasGold(KC.ROSTER[i].id); p.confirm = -1; KC.Audio.play('move'); me.render(true); } }
        c.onclick = function () { clickFor(sel.two && sel.p[0].locked ? 1 : 0); };
        c.oncontextmenu = function (e) { e.preventDefault(); if (sel.two) clickFor(1); };
      });
      $('selMode').innerHTML = $('selMode').innerHTML.replace(/<span class="coin"><\/span>\d+$/, G.coin(Save.data.coins));
      var p1c = KC.ROSTER[sel.p[0].cur];
      $('selP1').innerHTML = panelHTML(p1c, sel.two ? 'PLAYER 1' : 'PLAYER', { gold: sel.p[0].gold, locked: sel.p[0].locked, skinKey: 'R', pickKey: 'F', keys: { s: 'R', x: 'T' }, confirm: sel.p[0].confirm === sel.p[0].cur });
      if (sel.two) {
        $('selP2').innerHTML = panelHTML(KC.ROSTER[sel.p[1].cur], 'PLAYER 2', { gold: sel.p[1].gold, locked: sel.p[1].locked, skinKey: 'P', pickKey: 'U', keys: { s: 'P', x: ';' }, confirm: sel.p[1].confirm === sel.p[1].cur });
      } else {
        if (sel.mode === 'tour') { $('selP2').innerHTML = levelHTML(KC.level(sel.levelNo)); }
        else $('selP2').innerHTML = '<div class="who">' + (sel.mode === 'campaign' ? 'ELECTION ARCADE' : 'CPU OPPONENT') + '</div><div class="name">' + (sel.mode === 'campaign' ? '5 RIVALS + ???' : '???') + '</div><div class="bio">' +
          (sel.mode === 'campaign' ? 'Win five races in a row, then face the final boss. Losing a stop lets you retry it. Clearing it pays ' + G.coin(KC.COINS.campaignClear) + ' bonus plus a Golden chest.' : 'A random rival is drawn from the whole roster — even fighters you have not recruited yet. Beat them to earn coins.') + '</div>';
      }
      ['selP1', 'selP2'].forEach(function (id, pl) { var sk = $(id).querySelector('.skin'); if (sk) { sk.style.cursor = 'pointer'; sk.onclick = function () { me.skin(pl); }; } var li = $(id).querySelector('.lockinfo.can'); if (li) { li.style.cursor = 'pointer'; li.onclick = function () { me.pick(pl); }; } });
      if (rebuild) this.previews();
    },
    previews: function () {
      for (var i = 0; i < 2; i++) {
        if (i === 1 && !sel.two) { clearPreview(1); continue; }
        var ch = KC.ROSTER[sel.p[i].cur];
        var skin = sel.p[i].gold && Save.hasGold(ch.id) ? KC.ALT_SKIN : null;
        var p0skin = sel.p[0].gold && Save.hasGold(ch.id) ? KC.ALT_SKIN : null;
        if (i === 1 && sel.p[0].cur === sel.p[1].cur && skin === p0skin) skin = KC.MIRROR_SKIN;
        setPreview(i, ch, skin, false, i === 0 ? -1.55 : 1.55, i === 0 ? 0.55 : -0.55);
      }
    },
    move: function (i, dx, dy) {
      var p = sel.p[i]; if (p.locked) return;
      var n = KC.ROSTER.length, c = p.cur;
      if (dx) c = (c + dx + n) % n;
      if (dy) { c += dy * COLS; if (c < 0) c += Math.ceil(n / COLS) * COLS; if (c >= n) c = c % COLS; if (c >= n) c = n - 1; }
      p.cur = c; p.gold = p.gold && Save.hasGold(KC.ROSTER[c].id); p.confirm = -1;
      KC.Audio.play('move');
      this.render(true);
    },
    pick: function (i) {
      var p = sel.p[i], ch = KC.ROSTER[p.cur];
      if (p.locked) return;
      if (!Save.owns(ch.id)) {
        KC.Audio.play('deny');
        G.toast('🔒 ' + esc(ch.name) + ' is locked — ' + Save.shards(ch.id) + ' / ' + KC.shardsNeeded(ch) + ' shards. Win campaign chests to collect them.');
        return;
      }
      p.locked = true; KC.Audio.play('select');
      KC.Audio.say(ch.name, { interrupt: true });
      if (previews[i]) previews[i].cheer = 1.6;
      this.render(false);
      if (!sel.two || (sel.p[0].locked && sel.p[1].locked)) sel.startT = 0.9;
    },
    unpick: function (i) { var p = sel.p[i]; if (!p.locked) return false; p.locked = false; sel.startT = 0; KC.Audio.play('back'); this.render(false); return true; },
    skin: function (i) {
      var p = sel.p[i], ch = KC.ROSTER[p.cur];
      if (!Save.hasGold(ch.id)) { KC.Audio.play('deny'); G.toast('Win ' + KC.ALT_SKIN_WINS + ' matches as ' + esc(ch.short) + ' or buy ' + KC.ALT_SKIN.name + ' in the Shop for ' + G.coin(KC.ALT_SKIN_PRICE) + '.'); return; }
      p.gold = !p.gold; KC.Audio.play('select'); this.render(true);
    },
    update: function (dt) {
      if (sel.startT > 0) { sel.startT -= dt; if (sel.startT <= 0) { this.launch(); return; } }
      var one = !sel.two;
      if (Input.pp(0, 'l') || (one && Input.pp(1, 'l'))) this.move(0, -1, 0);
      if (Input.pp(0, 'r') || (one && Input.pp(1, 'r'))) this.move(0, 1, 0);
      if (Input.pp(0, 'u') || (one && Input.pp(1, 'u'))) this.move(0, 0, -1);
      if (Input.pp(0, 'd') || (one && Input.pp(1, 'd'))) this.move(0, 0, 1);
      if (Input.pp(0, 'p') || Input.hit(['Enter', 'NumpadEnter', 'Space', 'Pad0_start']) || (one && Input.pp(1, 'p'))) this.pick(0);
      if (Input.pp(0, 's') || (one && Input.pp(1, 's'))) this.skin(0);
      if (Input.pp(0, 'k') || (one && Input.pp(1, 'k'))) this.unpick(0);
      if (sel.two) {
        if (Input.pp(1, 'l')) this.move(1, -1, 0);
        if (Input.pp(1, 'r')) this.move(1, 1, 0);
        if (Input.pp(1, 'u')) this.move(1, 0, -1);
        if (Input.pp(1, 'd')) this.move(1, 0, 1);
        if (Input.pp(1, 'p')) this.pick(1);
        if (Input.pp(1, 's')) this.skin(1);
        if (Input.pp(1, 'k')) this.unpick(1);
      }
      if (Input.hit(['Escape', 'Backspace'])) {
        if (!this.unpick(1) && !this.unpick(0)) { KC.Audio.play('back'); go('menu'); }
      }
    },
    launch: function () {
      var c0 = KC.ROSTER[sel.p[0].cur];
      var s0 = sel.p[0].gold && Save.hasGold(c0.id) ? KC.ALT_SKIN : null;
      if (sel.mode === 'versus') {
        var c1 = KC.ROSTER[sel.p[1].cur];
        var s1 = sel.p[1].gold && Save.hasGold(c1.id) ? KC.ALT_SKIN : null;
        if (c0 === c1 && s0 === s1) s1 = KC.MIRROR_SKIN;
        startMatch({ mode: 'versus', chars: [c0, c1], skins: [s0, s1], ai: [null, null] });
      } else if (sel.mode === 'tour') {
        G.startLevel(sel.levelNo, c0, s0);
      } else if (sel.mode === 'cpu') {
        var pool = KC.ROSTER.filter(function (c) { return c.id !== c0.id && (c.id !== 'speaker' || Save.owns('speaker')); });
        var opp = pool[(Math.random() * pool.length) | 0];
        startMatch({ mode: 'cpu', chars: [c0, opp], skins: [s0, null], ai: [null, sel.level || 'normal'] });
      } else if (sel.mode === 'campaign') {
        var rivals = KC.ROSTER.filter(function (c) { return c.id !== c0.id && c.id !== 'speaker'; });
        for (var i = rivals.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var tmp = rivals[i]; rivals[i] = rivals[j]; rivals[j] = tmp; }
        var lv = ['easy', 'normal', 'normal', 'hard', 'hard'];
        var stops = rivals.slice(0, 5).map(function (c, k) { return { ch: c, level: lv[k] }; });
        stops.push({ ch: KC.rosterById.speaker, level: 'boss' });
        G.campaign = { player: c0, skin: s0, stops: stops, idx: 0 };
        go('ladder');
      }
    }
  };

  /* ---------- campaign ladder ---------- */
  screens.ladder = {
    el: 'ladder',
    enter: function () {
      camMode = 'select'; clearPreviews();
      var c = G.campaign;
      setPreview(0, c.player, c.skin, false, -1.55, 0.55);
      var stop = c.stops[c.idx];
      var bossLocked = stop.ch.id === 'speaker' && !Save.isUnlocked('speaker');
      setPreview(1, stop.ch, null, bossLocked && false, 1.55, -0.55);
      $('ladderSub').textContent = 'Running as ' + c.player.name + ' · Stop ' + (c.idx + 1) + ' of ' + c.stops.length;
      $('ladderRow').innerHTML = c.stops.map(function (s, i) {
        var cls = i < c.idx ? 'done' : i === c.idx ? 'cur' : '';
        var isBoss = s.ch.id === 'speaker';
        var hide = isBoss && i > c.idx && !Save.isUnlocked('speaker');
        return '<div class="lad ' + cls + '"><img src="' + por(s.ch) + '" style="' + (hide ? 'filter:brightness(0) drop-shadow(0 0 2px #f2c14e)' : '') + '" alt=""><div class="ln">' + (hide ? '???' : esc(s.ch.short)) + '</div><div class="ld">' + (isBoss ? 'FINAL BOSS' : s.level.toUpperCase()) + '</div></div>';
      }).join('');
      $('ladderNext').textContent = 'NEXT: ' + (stop.ch.id === 'speaker' ? 'THE SPEAKER — ORDER INCARNATE' : stop.ch.name.toUpperCase());
      var me = this;
      $('ladBtns').innerHTML = '<button type="button" class="bigbtn" id="ladFight">FIGHT ▸</button><button type="button" class="bigbtn ghost" id="ladQuit">WITHDRAW</button>';
      $('ladFight').onclick = function () { me.fight(); };
      $('ladQuit').onclick = function () { me.quit(); };
      KC.Audio.playMusic('menu');
    },
    fight: function () {
      var c = G.campaign, stop = c.stops[c.idx];
      KC.Audio.play('select');
      startMatch({ mode: 'campaign', chars: [c.player, stop.ch], skins: [c.skin, c.player === stop.ch ? KC.MIRROR_SKIN : null], ai: [null, stop.level] });
    },
    update: function () {
      if (Input.menu('ok')) this.fight();
      else if (Input.menu('back')) this.quit();
    },
    quit: function () {
      {
        KC.Audio.play('back');
        showList({ title: 'WITHDRAW FROM THE ARCADE?', sub: 'Your progress on this run will be lost.', items: [
          { label: 'KEEP GOING', action: function () { go('ladder'); } },
          { label: 'WITHDRAW', action: function () { G.campaign = null; go('menu'); } }
        ], back: function () { go('ladder'); } });
      }
    }
  };

  /* ---------- campaign: 100-level map ---------- */
  function levelHTML(L) {
    var d = Save.data, cleared = L.n <= (d.tour || 0);
    return '<div class="who">' + (L.boss ? 'BOSS LEVEL ' : 'LEVEL ') + L.n + ' / ' + KC.LEVELS + '</div>' +
      '<div class="lv-opp"><img src="' + por(L.ch) + '" alt=""><div><div class="name">' + esc(L.ch.name) + '</div><div class="ttl">' + rarBadge(L.ch) + ' CPU ' + L.ai.toUpperCase() + (L.rank ? ' · ★' + L.rank : '') + '</div></div></div>' +
      '<div class="bio">CPU skill <b>' + Math.round(L.skill * 100) + '%</b> · opponent strength +' + Math.round((L.boost - 1) * 100) + '%' + (L.rank ? ', upgraded to Rank ' + L.rank : '') + '.</div>' +
      '<div class="lv-reward">' + (cleared ? 'Cleared ✔ · replay pays ' + G.coin(Math.round(L.reward * 0.3)) : 'First clear pays ' + G.coin(L.reward)) + ' <span style="opacity:.7">+ normal match coins</span></div>';
  }
  screens.levels = {
    el: 'levels', cur: 1,
    enter: function () {
      camMode = 'menu'; stage.setMode('day'); clearPreviews(); KC.Audio.playMusic('menu');
      this.cur = Math.min(KC.LEVELS, (Save.data.tour || 0) + 1);
      this.render();
    },
    refresh: function () { this.render(); },
    render: function () {
      var self = this, top = Math.min(KC.LEVELS, (Save.data.tour || 0) + 1), html = '';
      for (var n = 1; n <= KC.LEVELS; n++) {
        var L = KC.level(n), cls = n <= (Save.data.tour || 0) ? 'done' : n === top ? 'open' : 'locked';
        html += '<button class="lv ' + cls + (L.boss ? ' boss' : '') + (n === this.cur ? ' sel' : '') + '" data-n="' + n + '" type="button">' + n + '</button>';
      }
      $('lvGrid').innerHTML = html;
      $('lvGrid').querySelectorAll('.lv').forEach(function (b) {
        b.onclick = function () { var n = +b.dataset.n; if (n === self.cur) self.play(); else { self.cur = n; KC.Audio.play('move'); self.render(); } };
      });
      var cw = (Save.data.campWins || 0) % 10, cq = (Save.data.chestQueue || []).length;
      $('lvSub').innerHTML = 'Cleared ' + (Save.data.tour || 0) + ' / ' + KC.LEVELS + ' &nbsp;·&nbsp; Wallet ' + G.coin(Save.data.coins) +
        '<div class="streak"><span>BIG CHEST STREAK</span><div class="sbar"><div style="width:' + (cw * 10) + '%"></div></div><b>' + cw + '/10 wins</b>' +
        (cq ? '<button type="button" id="lvChest" class="lv-chest">🎁 OPEN CHESTS (' + cq + ')</button>' : '') + '</div>';
      var lc = $('lvChest'); if (lc) lc.onclick = function () { KC.Audio.play('select'); go('chest'); };
      var selB = $('lvGrid').querySelector('.lv.sel'); if (selB && selB.scrollIntoView) selB.scrollIntoView({ block: 'nearest' });
      $('lvInfo').innerHTML = levelHTML(KC.level(this.cur)) + (this.cur > top ? '<div class="lockinfo">🔒 Clear level ' + top + ' first.</div>' : '<button class="lv-go" id="lvGo" type="button">FIGHT LEVEL ' + this.cur + ' ▸</button>');
      var go_ = $('lvGo'); if (go_) go_.onclick = function () { self.play(); };
    },
    play: function () {
      var top = Math.min(KC.LEVELS, (Save.data.tour || 0) + 1);
      if (this.cur > top) { KC.Audio.play('deny'); G.toast('Clear level ' + top + ' to unlock this one.'); return; }
      KC.Audio.play('select');
      go('select', { mode: 'tour', levelNo: this.cur });
    },
    update: function () {
      var c = this.cur;
      if (Input.menu('left')) c--; if (Input.menu('right')) c++;
      if (Input.menu('up')) c -= 10; if (Input.menu('down')) c += 10;
      c = Math.max(1, Math.min(KC.LEVELS, c));
      if (c !== this.cur) { this.cur = c; KC.Audio.play('move'); this.render(); }
      if (Input.menu('ok')) this.play();
      else if (Input.hit(['KeyC'])) G.openChests();
      else if (Input.menu('back')) { KC.Audio.play('back'); go('menu'); }
    }
  };

  /* ---------- chests: tap to upgrade, then open ---------- */
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  G.rollChest = function (tierIdx) {
    var t = KC.CHESTS[tierIdx], out = { coins: rnd(t.coins[0], t.coins[1]), items: [] };
    var total = rnd(t.shards[0], t.shards[1]);
    var locked = KC.ROSTER.filter(function (c) { return !Save.owns(c.id) && !c.starter; });
    var picks = Math.min(t.picks, Math.max(1, locked.length));
    var per = Math.max(1, Math.round(total / picks));
    for (var i = 0; i < picks; i++) {
      var pool = locked.filter(function (c) { return !out.items.some(function (it) { return it.ch === c; }); });
      var ch;
      if (pool.length) {
        var weights = pool.map(function (c) { return t.w[c.rarity] || 0; }), sum = weights.reduce(function (a, b) { return a + b; }, 0);
        if (sum <= 0) { weights = pool.map(function () { return 1; }); sum = pool.length; }
        var r = Math.random() * sum; for (var k = 0; k < pool.length; k++) { r -= weights[k]; if (r <= 0) { ch = pool[k]; break; } }
        ch = ch || pool[pool.length - 1];
      } else ch = KC.ROSTER[(Math.random() * KC.ROSTER.length) | 0];
      var n = i === picks - 1 ? Math.max(1, total - per * (picks - 1)) : per;
      out.items.push({ ch: ch, n: n });
    }
    Save.addCoins(out.coins);
    out.items.forEach(function (it) { it.res = Save.addShards(it.ch, it.n); });
    Save.data.chests = (Save.data.chests || 0) + 1;
    Save.write();
    return out;
  };
  var chestObj = null;
  screens.chest = {
    el: 'chestScreen',
    enter: function () {
      camMode = 'chest'; stage.setMode('night'); clearPreviews(); KC.Audio.playMusic('menu');
      var q = Save.data.chestQueue || [];
      this.tier = q.length ? q[0] : 0;
      this.taps = 0; this.phase = 'tap'; this.shake = 0; this.t = 0; this.open = 0; this.flash = 0;
      if (chestObj) scene.remove(chestObj.g);
      chestObj = M.buildChest(); chestObj.g.position.set(0, 0, 2.2); scene.add(chestObj.g);
      chestObj.setTier(KC.CHESTS[this.tier]);
      var self = this;
      $('chestScreen').onclick = function (e) { if (e.target.closest('button')) return; self.tap(); };
      $('chRewards').innerHTML = ''; $('chBtns').innerHTML = '';
      this.ui();
    },
    ui: function () {
      var t = KC.CHESTS[this.tier];
      $('chTier').textContent = t.name.toUpperCase(); $('chTier').style.color = t.color;
      var pips = ''; for (var i = 0; i < KC.TAP_UPGRADE.length; i++) pips += '<span class="tp' + (i < this.taps ? ' used' : '') + '"></span>';
      $('chPips').innerHTML = this.phase === 'tap' ? pips : '';
      $('chHint').innerHTML = this.phase === 'tap' ? 'TAP to shake it — it might <b>upgrade</b>! (' + (KC.TAP_UPGRADE.length - this.taps) + ' taps left)'
        : this.phase === 'ready' ? '<b>OPENING…</b>' : '';
    },
    tap: function () {
      KC.Audio.init();
      if (this.phase === 'tap') {
        var chance = KC.TAP_UPGRADE[this.taps];
        this.taps++; this.shake = 0.45;
        if (this.tier < KC.CHESTS.length - 1 && Math.random() < chance) {
          this.tier++; chestObj.setTier(KC.CHESTS[this.tier]); this.flash = 1;
          KC.Audio.play('unlock'); fx.ring(0, 0.6, KC.CHESTS[this.tier].glow, 2.4, true); fx.hit(0, 0.8, KC.CHESTS[this.tier].glow, 26);
          if (this.tier >= 3) KC.Audio.say(KC.CHESTS[this.tier].id === 'legend' ? 'Legendary!' : KC.CHESTS[this.tier].id === 'mythic' ? 'Mythic!' : 'Epic!');
          var sq = Save.data.chestQueue; if (sq && sq.length) { sq[0] = this.tier; Save.write(); }
        } else { KC.Audio.play('hitL'); fx.hit(0, 0.5, '#ffffff', 6); }
        if (this.taps >= KC.TAP_UPGRADE.length) { this.phase = 'ready'; this.autoOpen = 0.7; }
        this.ui();
      } else if (this.phase === 'ready') {
        this.phase = 'done'; this.open = 0.001;
        (Save.data.chestQueue || []).shift();
        var r = G.rollChest(this.tier);
        KC.Audio.play('boom'); KC.Audio.play('cheer', 1.2); stage.cheer(1, 0);
        fx.hit(0, 1.0, '#ffd166', 40); fx.papers_(0, 1.2, 18, 0); fx.ring(0, 1, KC.CHESTS[this.tier].glow, 3, false);
        var html = '<div class="chr coin-r"><span class="coin big"></span>+' + r.coins + ' coins</div>';
        r.items.forEach(function (it, i) {
          var note = it.res.recruited ? '<b class="new">RECRUITED!</b>' : it.res.dupeCoins ? 'owned → +' + G.coin(it.res.dupeCoins) : it.res.have + ' / ' + it.res.need + ' shards';
          html += '<div class="chr" style="animation-delay:' + (0.25 + i * 0.25) + 's"><img src="' + por(it.ch) + '" alt=""><div><div>' + G.rarBadge(it.ch) + '</div><div class="chn">' + esc(it.ch.name) + '</div><div>+' + it.n + ' shard' + (it.n > 1 ? 's' : '') + ' · ' + note + '</div></div></div>';
          if (it.res.recruited) setTimeout(function () { KC.Audio.say(it.ch.name + ' recruited!'); }, 900 + i * 300);
        });
        $('chRewards').innerHTML = html;
        var self = this, q = Save.data.chestQueue || [], b = '';
        if (q.length) b += '<button type="button" data-a="again">OPEN NEXT CHEST (' + q.length + ')</button>';
        var nxt = Math.min(KC.LEVELS, (Save.data.tour || 0) + 1);
        if (G.tourPick) b += '<button type="button" data-a="next">PLAY LEVEL ' + nxt + '</button>';
        b += '<button type="button" data-a="map">LEVEL MAP</button><button type="button" data-a="shop">SHOP</button>';
        $('chBtns').innerHTML = b; this.btn = 0;
        $('chBtns').querySelectorAll('button').forEach(function (bt) { bt.onclick = function () { self.act(bt.dataset.a); }; });
        this.hl();
        this.ui();
      }
    },
    hl: function () { var self = this; $('chBtns').querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('sel', i === self.btn); }); },
    act: function (a) {
      KC.Audio.play('select');
      if (a === 'again') { go('chest'); return; }
      if (a === 'next' && G.tourPick) { this.exit(); G.startLevel(Math.min(KC.LEVELS, (Save.data.tour || 0) + 1), G.tourPick.ch, G.tourPick.skin); return; }
      if (a === 'shop') { go('shop'); return; }
      go('levels');
    },
    exit: function () { if (chestObj) { scene.remove(chestObj.g); chestObj = null; } stage.setMode('day'); },
    update: function (dt) {
      this.t += dt;
      if (this.phase === 'ready' && this.autoOpen > 0) { this.autoOpen -= dt; if (this.autoOpen <= 0) this.tap(); }
      if (chestObj) {
        var c = chestObj;
        this.shake = Math.max(0, this.shake - dt);
        var sh = this.shake > 0 ? Math.sin(this.t * 60) * this.shake * 0.25 : 0;
        c.body.rotation.z = sh; c.body.position.y = this.phase === 'done' ? 0 : Math.abs(Math.sin(this.t * 2.2)) * 0.06 + (this.shake > 0.3 ? 0.08 : 0);
        c.g.rotation.y = Math.sin(this.t * 0.7) * 0.35;
        c.glow.material.opacity = 0.07 + Math.sin(this.t * 4) * 0.03 + this.flash * 0.3 + this.tier * 0.02 + (this.open > 0 ? 0 : 0);
        c.glow.scale.setScalar(1 + this.flash * 0.4 + (this.phase === 'ready' ? Math.sin(this.t * 10) * 0.05 : 0));
        this.flash = Math.max(0, this.flash - dt * 2);
        if (this.open > 0) { this.open = Math.min(1, this.open + dt * 2.5); c.lid.rotation.x = -this.open * 2.1; c.inner.material.opacity = 0.45 * (1 - this.open); c.inner.scale.setScalar(1 + this.open * 1.2); c.glow.material.opacity *= (1 - this.open * 0.8); }
        if (this.phase !== 'done' && Math.random() < dt * (2 + this.tier * 2)) fx.hit((Math.random() - 0.5) * 1.6, 0.4 + Math.random(), KC.CHESTS[this.tier].glow, 1);
      }
      if (this.phase !== 'done') { if (Input.menu('ok')) this.tap(); }
      else {
        var n = $('chBtns').querySelectorAll('button').length;
        if (Input.menu('left') || Input.menu('up')) { this.btn = (this.btn - 1 + n) % n; this.hl(); KC.Audio.play('move'); }
        if (Input.menu('right') || Input.menu('down')) { this.btn = (this.btn + 1) % n; this.hl(); KC.Audio.play('move'); }
        if (Input.menu('ok')) $('chBtns').querySelectorAll('button')[this.btn].click();
      }
      if (Input.menu('back') && this.phase !== 'ready') go('levels');
    }
  };
  G.openChests = function () { if ((Save.data.chestQueue || []).length) go('chest'); };

  /* ---------- shop (recruit fighters + gold skins) ---------- */
  screens.shop = {
    el: 'collection', cur: 0, gold: false, confirm: null,
    enter: function () { camMode = 'collection'; stage.setMode('day'); clearPreviews(); this.gold = false; this.confirm = null; this.render(true); },
    refresh: function () { this.render(true); },
    render: function (rebuild) {
      var self = this, d = Save.data;
      $('colSub').innerHTML = 'Wallet: <b class="wallet">' + G.coin(d.coins) + '</b> &nbsp;·&nbsp; ' + d.owned.length + ' / ' + KC.ROSTER.length + ' fighters · ' + d.gold.length + ' gold skins';
      $('colGrid').innerHTML = KC.ROSTER.map(function (ch, i) { return cellHTML(ch, i, i === self.cur ? 'c1' : ''); }).join('');
      $('colGrid').querySelectorAll('.cell').forEach(function (c) { c.onclick = function () { if (self.cur === +c.dataset.i) self.buy(); else { self.cur = +c.dataset.i; self.gold = false; self.confirm = null; KC.Audio.play('move'); self.render(true); } }; });
      var ch = KC.ROSTER[this.cur], owned = Save.owns(ch.id), price = G.recruitPrice(ch);
      var wins = d.charWins[ch.id] || 0, goldOk = Save.hasGold(ch.id);
      var html = '<div class="ttl">' + rarBadge(ch) + '</div><div class="name">' + esc(ch.name) + '</div><div class="ttl">' + esc(ch.title) + ' · ' + esc(ch.years) + '</div>';
      html += '<p>' + esc(ch.bio) + '</p>' + abilityHTML(ch, { s: 'Special', x: 'Super' });
      if (!owned) {
        var sp = KC.shardPrice(ch), canS = Save.canAfford(sp);
        html += G.shardBar(ch) + '<div class="req no">🔒 Can\'t be bought outright. Collect ' + KC.shardsNeeded(ch) + ' shards to recruit — they drop from campaign chests.</div>';
        html += '<div class="buybox ' + (canS ? 'can' : '') + '" data-act="shard"><div class="bb-price">' + G.coin(sp) + '</div><div>Buy <b>1 shard</b> — press <b>ENTER / B</b> or click.</div></div>';
      } else {
        var rk = Save.rank(ch.id), pips = '';
        for (var q = 1; q <= KC.UPGRADE.max; q++) pips += '<span class="rp' + (q <= rk ? ' on' : '') + '"></span>';
        html += '<div class="rankbox"><div><b>RANK ' + rk + ' / ' + KC.UPGRADE.max + '</b> <span class="rpips">' + pips + '</span></div><div class="rk-now">' + KC.UPGRADE.describe(rk) + '</div></div>';
        if (rk < KC.UPGRADE.max) {
          var uc = KC.UPGRADE.cost(ch, rk + 1), canU = Save.canAfford(uc);
          html += '<div class="buybox ' + (canU ? 'can' : '') + '" data-act="up"><div class="bb-price">' + G.coin(uc) + '</div><div>Upgrade to <b>Rank ' + (rk + 1) + '</b>: ' + KC.UPGRADE.describe(rk + 1) + '<br>' +
            (canU ? (this.confirm === 'up' ? '<b>Press ENTER / F again to confirm</b>' : 'Press <b>ENTER / F</b> or click to upgrade') : 'You need ' + G.coin(uc - d.coins) + ' more.') + '</div></div>';
        } else html += '<div class="req ok">★ Fully upgraded</div>';
        if (goldOk) html += '<div class="req ok">✔ ' + KC.ALT_SKIN.name + ' skin owned</div>';
        else {
          var canG = Save.canAfford(KC.ALT_SKIN_PRICE);
          html += '<div class="buybox small ' + (canG ? 'can' : '') + '" data-act="gold"><div class="bb-price">' + G.coin(KC.ALT_SKIN_PRICE) + '</div><div>' + KC.ALT_SKIN.name + ' skin — ' +
            (canG ? (this.confirm === 'gold' ? '<b>press B again to confirm</b>' : 'press <b>B</b> or click to buy') : 'or win ' + KC.ALT_SKIN_WINS + ' matches with them (' + Math.min(wins, KC.ALT_SKIN_WINS) + '/' + KC.ALT_SKIN_WINS + ')') + '</div></div>';
        }
      }
      html += '<p style="font-style:italic;opacity:.85">“' + esc(ch.quote) + '”</p>';
      $('colInfo').innerHTML = html;
      var lk = $('colLock');
      if (!owned) {
        var need = KC.shardsNeeded(ch), have = Save.shards(ch.id), full = KC.priceOf(ch);
        lk.innerHTML = '<div class="lk-title">🔒 LOCKED · ' + esc(ch.short) + '</div>' +
          '<div class="lk-row"><span class="shard"></span> Shards <b>' + have + ' / ' + need + '</b></div><div class="lk-bar shards"><div style="width:' + Math.round(have / need * 100) + '%"></div></div>' +
          '<div class="lk-row" style="font-size:14px;color:#c8d3ef">Shards only — from chests or the Shop</div>';
        lk.classList.add('show');
      } else lk.classList.remove('show');
      $('colInfo').querySelectorAll('.buybox').forEach(function (b) { b.onclick = function () { self.buy(b.dataset.act || null); }; });
      if (rebuild) {
        var pv = setPreview(0, ch, this.gold ? KC.ALT_SKIN : null, false, 0.15, 0.3);
        pv.spin = true;
      }
    },
    buy: function (act) {
      var ch = KC.ROSTER[this.cur];
      if (act === 'shard') {
        if (Save.owns(ch.id)) return;
        var sp = KC.shardPrice(ch);
        if (!Save.canAfford(sp)) { KC.Audio.play('deny'); G.toast('A shard costs ' + G.coin(sp) + '.'); return; }
        var res = Save.buyShard(ch);
        KC.Audio.play(res && res.recruited ? 'unlock' : 'select');
        G.toast(res && res.recruited ? 'All shards collected — ' + esc(ch.name) + ' recruited!' : '+1 ' + esc(ch.short) + ' shard (' + Save.shards(ch.id) + '/' + KC.shardsNeeded(ch) + ')');
        if (res && res.recruited && previews[0]) previews[0].cheer = 2.2;
        this.render(false); return;
      }
      if (Save.owns(ch.id) && act !== 'gold') {
        var rk = Save.rank(ch.id);
        if (rk >= KC.UPGRADE.max) { KC.Audio.play('deny'); G.toast(esc(ch.short) + ' is already Rank ' + KC.UPGRADE.max + '.'); return; }
        var uc = KC.UPGRADE.cost(ch, rk + 1);
        if (!Save.canAfford(uc)) { KC.Audio.play('deny'); G.toast('Upgrade costs ' + G.coin(uc) + ' — you have ' + G.coin(Save.data.coins) + '.'); return; }
        if (this.confirm !== 'up') { this.confirm = 'up'; KC.Audio.play('move'); this.render(false); return; }
        Save.upgrade(ch); this.confirm = null;
        KC.Audio.play('unlock'); G.toast(esc(ch.short) + ' upgraded to Rank ' + (rk + 1) + '!');
        if (previews[0]) previews[0].cheer = 2.2;
        this.render(false); return;
      }
      if (!Save.owns(ch.id)) { this.buy('shard'); return; }
      else if (!Save.hasGold(ch.id)) {
        if (!Save.canAfford(KC.ALT_SKIN_PRICE)) { KC.Audio.play('deny'); G.toast('Gold skin costs ' + G.coin(KC.ALT_SKIN_PRICE) + '.'); return; }
        if (this.confirm !== 'gold') { this.confirm = 'gold'; KC.Audio.play('move'); this.render(false); return; }
        Save.buyGold(ch); this.confirm = null; this.gold = true;
        KC.Audio.play('unlock'); G.toast(KC.ALT_SKIN.name + ' unlocked for ' + esc(ch.short) + '!');
        this.render(true);
        if (previews[0]) previews[0].cheer = 2.2;
      } else { KC.Audio.play('deny'); }
    },
    update: function () {
      var n = KC.ROSTER.length, c = this.cur, cols = 6;
      if (Input.menu('left')) c = (c - 1 + n) % n;
      if (Input.menu('right')) c = (c + 1) % n;
      if (Input.menu('up')) c = (c - cols + n) % n;
      if (Input.menu('down')) c = (c + cols) % n;
      if (c !== this.cur) { this.cur = c; this.gold = false; this.confirm = null; KC.Audio.play('move'); this.render(true); }
      if (Input.hit(['Enter', 'NumpadEnter', 'Space', 'KeyF', 'KeyU', 'Pad0_a', 'Pad1_a'])) this.buy();
      if (Input.hit(['KeyB', 'Pad0_y', 'Pad1_y'])) this.buy(Save.owns(KC.ROSTER[this.cur].id) ? 'gold' : 'shard');
      if (Input.hit(['KeyR', 'KeyP', 'Pad0_x', 'Pad1_x'])) { this.gold = !this.gold; KC.Audio.play('select'); this.render(true); }
      if (Input.hit(['Escape', 'Backspace', 'KeyG', 'KeyO', 'Pad0_b', 'Pad1_b'])) { KC.Audio.play('back'); go('menu'); }
    }
  };

  /* ---------- fight ---------- */
  G.ai = [null, null];
  function startMatch(cfg) {
    clearPreviews();
    if (G.match) { G.match.destroy(); G.match = null; }
    document.querySelectorAll('.screen').forEach(function (e) { e.classList.remove('show'); });
    var st = Save.data.settings;
    var mode = st.stage === 'random' ? (Math.random() < 0.5 ? 'day' : 'night') : st.stage;
    G.matchCfg = cfg;
    G.ai = [null, null];
    G.ai = cfg.ai.map(function (lvl) { return lvl ? lvl : null; });
    var ranks = cfg.ranks || cfg.chars.map(function (c, i) { return cfg.ai[i] ? 0 : Save.rank(c.id); });
    var m = new KC.Match(G, { chars: cfg.chars, skins: cfg.skins, roundsToWin: st.rounds, timer: st.timer, stageMode: mode, ranks: ranks, boosts: cfg.boosts });
    G.ai = cfg.ai.map(function (lvl, i) { return lvl ? new KC.AI(m.f[i], lvl, i === 1 && cfg.skill != null ? cfg.skill : null) : null; });
    KC.HUD.setup(m);
    G.match = m;
    G.screen = 'fight';
    G.inputLock = 0.2;
    G.acc = 0;
    KC.Audio.playMusic('fight');
  }
  G.startMatch = startMatch;
  G.startLevel = function (n, ch, skin) {
    var L = KC.level(n);
    G.tourPick = { ch: ch, skin: skin };
    startMatch({ mode: 'tour', levelNo: n, chars: [ch, L.ch], skins: [skin, ch === L.ch ? KC.MIRROR_SKIN : null], ai: [null, L.ai],
      ranks: [Save.rank(ch.id), L.rank], boosts: [1, L.boost], skill: L.skill });
  };
  G.getInput = function (i, m) {
    if (G.ai[i]) return G.ai[i].input(m);
    var oneP = G.ai[1 - i] != null;
    return Input.player(i, oneP && i === 0);
  };
  G.skipClick = false;
  window.addEventListener('mousedown', function (e) { if (G.screen === 'fight' && !e.target.closest('button')) G.skipClick = true; });
  G.skipPressed = function () { if (G.skipClick) { G.skipClick = false; return true; } return Input.hit(['Enter', 'Space', 'KeyF', 'KeyG', 'KeyU', 'KeyO', 'Pad0_a', 'Pad1_a']); };
  screens.fight = {
    update: function () {
      if (Input.menu('pause') && G.match && G.match.phase !== 'matchEnd') pauseMenu();
    }
  };
  function pauseMenu() {
    var m = G.match; m.paused = true;
    KC.HUD.show(false);
    showList({ title: 'RECESS', sub: 'The session is paused.', items: [
      { label: 'RESUME', action: resume },
      { label: 'RESTART MATCH', action: function () { startMatch(G.matchCfg); } },
      { label: G.matchCfg.mode === 'campaign' ? 'BACK TO ARCADE LADDER' : G.matchCfg.mode === 'tour' ? 'LEVEL MAP' : 'CHARACTER SELECT', action: function () { endMatchTo(G.matchCfg.mode === 'campaign' ? 'ladder' : 'select'); } },
      { label: 'MAIN MENU', action: function () { endMatchTo('menu'); } }
    ], back: resume });
    function resume() {
      document.querySelectorAll('.screen').forEach(function (e) { e.classList.remove('show'); });
      G.screen = 'fight'; G.inputLock = 0.15; m.paused = false;
      if (m.phase !== 'intro' && m.phase !== 'matchEnd') KC.HUD.show(true);
    }
  }
  function endMatchTo(where) {
    if (G.match) { G.match.destroy(); G.match = null; }
    KC.HUD.show(false); KC.HUD.banner(null); KC.HUD.hideVs(); KC.HUD.superCutHide();
    stage.setMode('day');
    stage.setVotes('—', 1, '—', 1, "KNESSET COMBAT 26'");
    if (where === 'levels' || (where === 'select' && G.matchCfg.mode === 'tour')) go('levels');
    else if (where === 'select') go('select', { mode: G.matchCfg.mode, level: G.ai[1] ? G.ai[1].level : null });
    else if (where === 'ladder' && G.campaign) go('ladder');
    else if (where === 'shop') go('shop');
    else if (where === 'chest') go('chest');
    else go('menu');
  }

  /* ---------- match end → coins ---------- */
  G.onMatchEnd = function (m) {
    var cfg = G.matchCfg, d = Save.data, C = KC.COINS;
    var human = [!cfg.ai[0], !cfg.ai[1]];
    var r = m.result, lines = [], total = 0, demo = !human[0] && !human[1];
    function add(label, v) { if (v > 0 && !demo) { lines.push([label, v]); total += v; } }
    add('Session attended', C.session);
    var roundsH = r.roundWinners.filter(function (w) { return w >= 0 && human[w]; }).length;
    add('Rounds won × ' + roundsH, C.round * roundsH);
    var w = m.winner, humanWon = w >= 0 && human[w];
    var lvl = cfg.ai[1];
    if (humanWon) add(cfg.mode === 'versus' ? 'Motion passed (match won)' : 'Victory', C.win);
    var perf = (human[0] ? r.perfects[0] : 0) + (human[1] ? r.perfects[1] : 0);
    add('Perfect rounds × ' + perf, C.perfect * perf);
    if (r.superKO && humanWon) add('Super finish', C.superKO);
    if (humanWon && cfg.mode !== 'versus') add('Opposition: ' + lvl.toUpperCase(), C.difficulty[lvl] || 0);
    var finalStop = cfg.mode === 'campaign' && G.campaign && G.campaign.idx === G.campaign.stops.length - 1;
    if (cfg.mode === 'campaign' && humanWon) add('Arcade stop cleared', C.campaignStop);
    if (finalStop && humanWon) { add('ARCADE COMPLETE', C.campaignClear); d.chestQueue = d.chestQueue || []; d.chestQueue.push(2); }
    var firstClear = false;
    if (cfg.mode === 'tour' && humanWon) {
      var LV = KC.level(cfg.levelNo); firstClear = cfg.levelNo > (d.tour || 0);
      add(firstClear ? 'Level ' + cfg.levelNo + ' cleared' + (LV.boss ? ' (BOSS)' : '') : 'Level ' + cfg.levelNo + ' replay', firstClear ? LV.reward : Math.round(LV.reward * 0.3));
    }
    if (demo) { showResults(m, cfg, { lines: [], total: 0, golds: [], humanWon: false, finalStop: false, before: d.coins }); return; }
    var before = d.coins;
    Save.addCoins(total); d.matches++;
    if (humanWon) d.wins++;
    if (cfg.mode !== 'versus' && humanWon) d.cpuWins++;
    for (var i = 0; i < 2; i++) if (human[i]) { d.supers += r.supers[i]; d.perfects += r.perfects[i]; }
    if (humanWon) { var wid = m.f[w].ch.id; d.charWins[wid] = (d.charWins[wid] || 0) + 1; }
    if (finalStop && humanWon) d.campaign++;
    if (firstClear) d.tour = cfg.levelNo;
    var chestDrop = null;
    if (cfg.mode === 'tour' && humanWon) {
      d.campWins = (d.campWins || 0) + 1;
      var LV2 = KC.level(cfg.levelNo), streak = d.campWins % 10 === 0;
      if (LV2.boss || streak || Math.random() < 0.6) {
        chestDrop = { tier: Math.min(KC.CHESTS.length - 1, LV2.chestTier + (streak ? 2 : 0)), streak: streak };
        d.chestQueue = d.chestQueue || []; d.chestQueue.push(chestDrop.tier);
      }
    }
    var golds = Save.refreshGold();
    Save.write();
    showResults(m, cfg, { lines: lines, total: total, golds: golds, humanWon: humanWon, finalStop: finalStop, before: before, chest: chestDrop });
  };

  var resCfg = null;
  function showResults(m, cfg, info) {
    resCfg = { m: m, cfg: cfg, info: info, sel: 0 };
    go('results');
  }
  screens.results = {
    el: 'results',
    enter: function () {
      var R = resCfg, m = R.m, cfg = R.cfg, info = R.info, d = Save.data;
      KC.HUD.banner(null); KC.HUD.show(false);
      var w = m.winner, title, sub;
      if (w < 0) { title = 'HUNG PARLIAMENT'; sub = 'A draw. New elections are called.'; }
      else if (cfg.mode === 'versus') { title = (w === 0 ? 'PLAYER 1' : 'PLAYER 2') + ' WINS'; sub = m.f[w].ch.name + ' forms the government.'; }
      else if (info.humanWon) { title = info.finalStop ? 'ARCADE WON!' : 'VICTORY'; sub = m.f[w].ch.name + ' carries the vote.'; }
      else { title = 'DEFEAT'; sub = m.f[w].ch.name + ' wins this session.'; }
      $('resTitle').textContent = title; $('resSub').textContent = sub;
      var earn = '<h3>COINS EARNED</h3>' + info.lines.map(function (l) { return '<div class="row"><span>' + esc(l[0]) + '</span><b>+' + G.coin(l[1]) + '</b></div>'; }).join('');
      earn += '<div class="total"><span>TOTAL</span><b>+' + G.coin(info.total) + '</b></div><div class="next-unlock" style="margin-top:6px">Wallet: <b class="wallet" style="color:#fff">' + G.coin(info.before) + ' → ' + G.coin(d.coins) + '</b></div>';
      if (info.chest) { var ct = KC.CHESTS[info.chest.tier]; earn += '<div class="chestdrop" style="border-color:' + ct.color + '"><span class="cd-box" style="background:' + ct.color + '"></span><div><b>' + (info.chest.streak ? '10-WIN STREAK! ' : 'CHEST DROP! ') + '</b>' + ct.name + '<br><span style="opacity:.8">Tap it up to 3 times to try to upgrade it.</span></div></div>'; }
      else if (cfg.mode === 'tour' && info.humanWon) earn += '<div class="next-unlock">No chest this time (60% drop rate). Boss levels and every 10th win always drop one.</div>';
      $('resEarn').innerHTML = earn;
      var u = '';
      info.golds.forEach(function (ch, i) { u += '<div class="unl" style="animation-delay:' + (0.3 + i * 0.15) + 's"><img src="' + por(ch, true) + '" alt=""><div><div class="u1">NEW SKIN</div><div class="u2">' + esc(ch.short) + ' — ' + KC.ALT_SKIN.name + '</div></div></div>'; });
      var locked = Save.lockedByPrice();
      var newly = [];
      if (locked.length) {
        u += '<h3>CLOSEST RECRUITS</h3>';
        locked.slice(0, 3).forEach(function (c, i) {
          u += '<div class="unl far" style="animation-delay:' + (0.2 + i * 0.15) + 's"><img src="' + por(c) + '" alt=""><div><div class="u1">' + G.rarBadge(c) + '</div><div class="u2">' + esc(c.name) + '</div><div style="font-size:12px;color:#e6d7ff"><span class="shard"></span> ' + Save.shards(c.id) + ' / ' + KC.shardsNeeded(c) + ' shards</div></div></div>';
        });
      } else u += '<h3>FULL CABINET</h3><div class="next-unlock">Every fighter recruited. All 120 seats are yours.</div>';
      if (info.golds.length || newly.length) setTimeout(function () { KC.Audio.play('unlock'); }, 300);
      $('resUnlocks').innerHTML = u;
      var opts = [];
      if (cfg.mode === 'campaign') {
        if (info.humanWon && !info.finalStop) opts.push({ label: 'NEXT STOP', fn: function () { G.campaign.idx++; endMatchTo('ladder'); } });
        else if (!info.humanWon) opts.push({ label: 'RETRY STOP', fn: function () { endMatchTo('ladder'); } });
        opts.push({ label: info.finalStop && info.humanWon ? 'MAIN MENU' : 'WITHDRAW', fn: function () { G.campaign = null; endMatchTo('menu'); } });
        if (info.finalStop && info.humanWon) { opts.unshift({ label: 'OPEN CHEST', fn: function () { G.campaign = null; endMatchTo('chest'); } }); opts.push({ label: 'SHOP', fn: function () { G.campaign = null; endMatchTo('shop'); } }); }
      } else if (cfg.mode === 'tour') {
        var tp = G.tourPick;
        if ((Save.data.chestQueue || []).length) opts.push({ label: 'OPEN CHEST (' + Save.data.chestQueue.length + ')', fn: function () { endMatchTo('chest'); } });
        if (info.humanWon && cfg.levelNo < KC.LEVELS) opts.push({ label: 'NEXT LEVEL (' + (cfg.levelNo + 1) + ')', fn: function () { G.startLevel(cfg.levelNo + 1, tp.ch, tp.skin); } });
        if (!info.humanWon) opts.push({ label: 'RETRY LEVEL ' + cfg.levelNo, fn: function () { G.startLevel(cfg.levelNo, tp.ch, tp.skin); } });
        opts.push({ label: 'UPGRADE', fn: function () { endMatchTo('shop'); } });
        opts.push({ label: 'LEVEL MAP', fn: function () { endMatchTo('levels'); } });
        opts.push({ label: 'MAIN MENU', fn: function () { endMatchTo('menu'); } });
      } else {
        opts.push({ label: 'REMATCH', fn: function () { startMatch(cfg); } });
        opts.push({ label: 'CHARACTER SELECT', fn: function () { endMatchTo('select'); } });
        opts.push({ label: 'SHOP', fn: function () { endMatchTo('shop'); } });
        opts.push({ label: 'MAIN MENU', fn: function () { endMatchTo('menu'); } });
      }
      R.opts = opts; R.sel = 0;
      this.renderOpts();
      G.inputLock = 0.6;
      this.autoChest = info.chest || (info.finalStop && info.humanWon && cfg.mode === 'campaign') ? 2.2 : 0;
    },
    renderOpts: function () {
      var R = resCfg;
      $('resMenu').innerHTML = R.opts.map(function (o, i) { return '<li class="' + (i === R.sel ? 'sel' : '') + '" data-i="' + i + '">' + o.label + '</li>'; }).join('');
      $('resMenu').querySelectorAll('li').forEach(function (li) { li.onmouseenter = function () { R.sel = +li.dataset.i; highlight($('resMenu'), R.sel); }; li.onclick = function () { R.opts[+li.dataset.i].fn(); }; });
    },
    update: function (dt) {
      var R = resCfg;
      if (this.autoChest > 0) { this.autoChest -= dt; if (this.autoChest <= 0 && (Save.data.chestQueue || []).length) { endMatchTo('chest'); return; } }
      if (Input.menu('left') || Input.menu('up')) { R.sel = (R.sel - 1 + R.opts.length) % R.opts.length; KC.Audio.play('move'); this.renderOpts(); }
      if (Input.menu('right') || Input.menu('down')) { R.sel = (R.sel + 1) % R.opts.length; KC.Audio.play('move'); this.renderOpts(); }
      if (Input.menu('ok')) { KC.Audio.play('select'); R.opts[R.sel].fn(); }
    }
  };

  /* =====================================================================
   * CAMERA FOR NON-FIGHT SCREENS
   * ===================================================================== */
  var camPos = new T.Vector3(0, 6, 12), camLook = new T.Vector3(0, 2, -6);
  function menuCamera(dt) {
    camT += dt;
    var tp = new T.Vector3(), tl = new T.Vector3(), k = Math.min(1, dt * 2.2);
    if (camMode === 'orbit' || camMode === 'menu') {
      var a = Math.sin(camT * 0.07) * 0.9;
      tp.set(Math.sin(a) * 12, 5.2 + Math.sin(camT * 0.13) * 0.8, -2 + Math.cos(a) * 12);
      tl.set(camMode === 'menu' ? -3.2 : 0, 2.2, -6);
      k = Math.min(1, dt * 1.2);
    } else if (camMode === 'select') {
      tp.set(0, 0.95, 7.5); tl.set(0, 0.5, 2.2);
    } else if (camMode === 'chest') {
      tp.set(0, 1.5, 5.6); tl.set(0, 0.75, 2.2);
    } else if (camMode === 'collection') {
      tp.set(0, 1.25, 6.4); tl.set(0.15, 0.85, 2.2);
    }
    camPos.lerp(tp, k); camLook.lerp(tl, k);
    camera.position.copy(camPos); camera.lookAt(camLook);
    stage.followShadow(0);
    if (Math.random() < dt * 0.4) stage.cheer(0.03, (Math.random() - 0.5) * 20);
  }

  /* =====================================================================
   * MAIN LOOP
   * ===================================================================== */
  var last = 0;
  G.acc = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var realDt = last ? (now - last) / 1000 : STEP;
    var dt = Math.min(0.05, realDt); last = now;
    pollPads();
    if (Input.hit(['KeyM']) && G.screen !== 'fight') { Save.data.settings.music = !Save.data.settings.music; KC.Audio.musicOn = Save.data.settings.music; Save.write(); G.toast('Music ' + (KC.Audio.musicOn ? 'ON' : 'OFF'), 1200); }
    else if (Input.hit(['KeyM'])) { Save.data.settings.music = !Save.data.settings.music; KC.Audio.musicOn = Save.data.settings.music; Save.write(); }
    if (G.inputLock > 0) G.inputLock -= Math.min(realDt, 0.1);
    else { var s = screens[G.screen]; if (s && s.update) s.update(dt); }
    var m = G.match;
    if (m) {
      if (!m.paused) {
        G.acc += dt * m.timeScale;
        var n = 0;
        while (G.acc >= STEP && n < 4) { m.tick(); G.acc -= STEP; n++; if (G.match !== m) break; }
        if (n >= 4) G.acc = 0;
      }
      if (G.match === m) {
        m.render(m.paused ? 0 : dt);
        fx.update(m.paused ? 0 : dt * Math.max(0.35, m.timeScale));
      }
    } else {
      stage.update(dt, 0);
      updatePreviews(dt);
      menuCamera(dt);
      fx.update(dt);
    }
    renderer.render(scene, camera);
    Input.endFrame();
  }

  /* =====================================================================
   * BOOT
   * ===================================================================== */
  function boot() {
    Save.load();
    var st = Save.data.settings;
    KC.Audio.musicOn = st.music; KC.Audio.sfxOn = st.sfx; KC.Audio.voiceOn = st.voice;
    try { initGL(); } catch (e) {
      $('loadText').innerHTML = 'WebGL is not available in this browser, so the chamber cannot be rendered.<br>Try a recent Chrome, Edge, Firefox or Safari.';
      return;
    }
    $('loadText').textContent = 'Seating 120 Members of Knesset…';
    setTimeout(function () {
      makePortraits();
      Save.refreshGold();
      document.fonts && document.fonts.ready && document.fonts.ready.then(function () { stage.setVotes('—', 1, '—', 1, "KNESSET COMBAT 26'"); });
      $('loading').classList.remove('show');
      go('title');
      requestAnimationFrame(loop);
      // optional deep link for quick testing: #fight / #versus / #select
      var h = (location.hash || '').replace('#', '');
      if (h === 'versus') startMatch({ mode: 'versus', chars: [KC.ROSTER[0], KC.ROSTER[0]], skins: [null, KC.MIRROR_SKIN], ai: [null, null] });
      else if (h === 'cpu') startMatch({ mode: 'cpu', chars: [KC.ROSTER[0], KC.ROSTER[8]], skins: [null, null], ai: [null, 'normal'] });
      else if (h === 'demo') startMatch({ mode: 'cpu', chars: [KC.ROSTER[(Math.random() * 14) | 0], KC.ROSTER[(Math.random() * 19) | 0]], skins: [null, KC.MIRROR_SKIN], ai: ['hard', 'hard'] });
      else if (h === 'select') go('select', { mode: 'versus' });
      else if (h.indexOf('vs=') === 0) { var ids = h.slice(3).split(','); startMatch({ mode: 'versus', chars: [KC.rosterById[ids[0]] || KC.ROSTER[0], KC.rosterById[ids[1]] || KC.ROSTER[0]], skins: [null, ids[0] === ids[1] ? KC.MIRROR_SKIN : null], ai: [null, null] }); }
    }, 30);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
