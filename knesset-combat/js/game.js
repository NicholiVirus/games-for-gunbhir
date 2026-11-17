/* Knesset Combat 26' — game shell: input, save/unlocks, portraits, HUD, menus, select, campaign, results. */
(function () {
  var T = THREE, M = KC.Models;
  var G = KC.Game = {};
  var $ = function (id) { return document.getElementById(id); };
  var STEP = 1 / 60;

  /* =====================================================================
   * SAVE / PROGRESSION
   * ===================================================================== */
  var SAVE_KEY = 'kc26_save_v1';
  var memoryStore = null;
  function defaults() {
    return { mandates: 0, matches: 0, cpuWins: 0, hardWins: 0, supers: 0, perfects: 0, campaign: 0, charWins: {}, unlocked: ['bengurion'], gold: [],
      settings: { rounds: 2, timer: 99, stage: 'random', music: true, sfx: true, voice: true } };
  }
  var Save = KC.Save = {
    load: function () {
      var d = null;
      try { var raw = localStorage.getItem(SAVE_KEY); if (raw) d = JSON.parse(raw); } catch (e) { d = memoryStore; }
      var base = defaults();
      if (d) { base = Object.assign(base, d); base.settings = Object.assign(defaults().settings, d.settings || {}); }
      Save.data = base;
    },
    write: function () { memoryStore = Save.data; try { localStorage.setItem(SAVE_KEY, JSON.stringify(Save.data)); } catch (e) { /* private mode */ } },
    isUnlocked: function (id) { return Save.data.unlocked.indexOf(id) >= 0; },
    hasGold: function (id) { return Save.data.gold.indexOf(id) >= 0; },
    progress: function (ch) {
      var u = ch.unlock, d = Save.data;
      switch (u.type) {
        case 'start': return [1, 1];
        case 'mandates': return [d.mandates, u.value];
        case 'cpuWins': return [d.cpuWins, u.value];
        case 'hardWin': return [d.hardWins, 1];
        case 'supers': return [d.supers, u.value];
        case 'perfect': return [d.perfects, 1];
        case 'campaign': return [d.campaign, 1];
      }
      return [0, 1];
    },
    meets: function (ch) { var p = Save.progress(ch); return p[0] >= p[1]; },
    refresh: function () {
      var chars = [], golds = [], d = Save.data;
      KC.ROSTER.forEach(function (ch) {
        if (!Save.isUnlocked(ch.id) && Save.meets(ch)) { d.unlocked.push(ch.id); chars.push(ch); }
        if (Save.isUnlocked(ch.id) && !Save.hasGold(ch.id) && (d.charWins[ch.id] || 0) >= KC.ALT_SKIN_WINS) { d.gold.push(ch.id); golds.push(ch); }
      });
      Save.write();
      return { chars: chars, golds: golds };
    },
    nextMandate: function () {
      for (var i = 0; i < KC.ROSTER.length; i++) { var c = KC.ROSTER[i]; if (c.unlock.type === 'mandates' && !Save.isUnlocked(c.id)) return c; }
      return null;
    },
    unlockAll: function () {
      Save.data.unlocked = KC.ROSTER.map(function (c) { return c.id; });
      Save.data.gold = KC.ROSTER.map(function (c) { return c.id; });
      Save.write();
    },
    reset: function () { var s = Save.data.settings; Save.data = defaults(); Save.data.settings = s; Save.write(); }
  };

  /* =====================================================================
   * INPUT (keyboard + gamepads mapped to virtual key codes)
   * ===================================================================== */
  var keys = {}, just = {};
  var MAP = [
    { u: ['KeyW', 'Pad0_up'], d: ['KeyS', 'Pad0_down'], l: ['KeyA', 'Pad0_left'], r: ['KeyD', 'Pad0_right'], p: ['KeyF', 'Pad0_a'], k: ['KeyG', 'Pad0_b'], s: ['KeyR', 'Pad0_x'], x: ['KeyT', 'Pad0_y'] },
    { u: ['ArrowUp', 'Pad1_up'], d: ['ArrowDown', 'Pad1_down'], l: ['ArrowLeft', 'Pad1_left'], r: ['ArrowRight', 'Pad1_right'], p: ['KeyK', 'Numpad1', 'Pad1_a'], k: ['KeyL', 'Numpad2', 'Pad1_b'], s: ['KeyO', 'Numpad4', 'Pad1_x'], x: ['KeyP', 'Numpad5', 'Pad1_y'] }
  ];
  var MENU = {
    up: ['KeyW', 'ArrowUp', 'Pad0_up', 'Pad1_up'], down: ['KeyS', 'ArrowDown', 'Pad0_down', 'Pad1_down'],
    left: ['KeyA', 'ArrowLeft', 'Pad0_left', 'Pad1_left'], right: ['KeyD', 'ArrowRight', 'Pad0_right', 'Pad1_right'],
    ok: ['Enter', 'NumpadEnter', 'Space', 'KeyF', 'KeyK', 'Numpad1', 'Pad0_a', 'Pad1_a', 'Pad0_start', 'Pad1_start'],
    back: ['Escape', 'Backspace', 'KeyG', 'KeyL', 'Pad0_b', 'Pad1_b'],
    pause: ['Escape', 'Backspace', 'Pad0_start', 'Pad1_start']
  };
  var PREVENT = {};
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Backspace', 'Tab'].forEach(function (c) { PREVENT[c] = 1; });
  var cheatBuf = '';
  window.addEventListener('keydown', function (e) {
    if (PREVENT[e.code]) e.preventDefault();
    KC.Audio.init();
    if (e.repeat) return;
    if (!keys[e.code]) just[e.code] = true;
    keys[e.code] = true;
    if (e.key && e.key.length === 1) {
      cheatBuf = (cheatBuf + e.key.toUpperCase()).slice(-7);
      if (cheatBuf === 'KNESSET' && G.screen !== 'fight') { Save.unlockAll(); G.toast('🗳️ All 120 Mandates secured — every fighter and skin unlocked!'); KC.Audio.play('unlock'); if (screens[G.screen] && screens[G.screen].refresh) screens[G.screen].refresh(); }
    }
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
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
        el.querySelector('.nm').textContent = (G.matchCfg && G.ai && G.ai[i] ? 'CPU · ' : (i === 0 ? 'P1 · ' : 'P2 · ')) + f.ch.short;
        trails[i] = 1; lastHp[i] = 1; trailDelay[i] = 0; comboT[i] = 0; calloutT[i] = 0;
        hudEls.combo[i].classList.remove('on'); hudEls.callout[i].classList.remove('on');
        hudEls.meter[i].querySelector('.mkey').textContent = G.ai && G.ai[i] ? 'CPU' : (i === 0 ? 'T' : 'P');
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
        mt.classList.toggle('full', f.meter >= 100);
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
  function navList(items, sel) {
    if (Input.menu('up')) { sel = (sel - 1 + items) % items; KC.Audio.play('move'); }
    if (Input.menu('down')) { sel = (sel + 1) % items; KC.Audio.play('move'); }
    return sel;
  }

  /* ---------- title ---------- */
  screens.title = {
    el: 'title',
    enter: function () { camMode = 'orbit'; stage.setMode('day'); KC.Audio.playMusic('menu'); },
    update: function () { if (Input.menu('ok')) { KC.Audio.init(); KC.Audio.play('gavel'); KC.Audio.playMusic('menu'); go('menu'); } }
  };

  /* ---------- main menu ---------- */
  var MENU_ITEMS = [
    { id: 'campaign', label: 'ELECTION CAMPAIGN', desc: 'Arcade ladder vs CPU: beat five rivals, then face the final boss. Big Mandate payouts.' },
    { id: 'versus', label: 'VERSUS · 2 PLAYERS', desc: 'Same keyboard. Player 1 on WASD + F G R T, Player 2 on the arrows + K L O P.' },
    { id: 'cpu', label: 'VS CPU', desc: 'Pick a difficulty and fight the machine. Every match earns Mandates toward your next unlock.' },
    { id: 'collection', label: 'CABINET ROOM', desc: 'Browse every fighter, see what it takes to unlock them, and preview skins.' },
    { id: 'howto', label: 'HOW TO PLAY', desc: 'Controls, blocking, specials, supers and the unlock rules.' },
    { id: 'settings', label: 'SETTINGS', desc: 'Rounds, round timer, chamber lighting, music, sound and announcer.' }
  ];
  screens.menu = {
    el: 'menu', sel: 0,
    enter: function () { camMode = 'menu'; stage.setMode('day'); clearPreviews(); KC.Audio.playMusic('menu'); this.render(); },
    refresh: function () { this.render(); },
    render: function () {
      var self = this;
      $('menuList').innerHTML = MENU_ITEMS.map(function (it, i) { return '<li class="' + (i === self.sel ? 'sel' : '') + '" data-i="' + i + '">' + it.label + '</li>'; }).join('');
      $('menuList').querySelectorAll('li').forEach(function (li) {
        li.onmouseenter = function () { self.sel = +li.dataset.i; self.render(); };
        li.onclick = function () { self.sel = +li.dataset.i; self.choose(); };
      });
      $('menuDesc').textContent = MENU_ITEMS[this.sel].desc;
      var d = Save.data, nx = Save.nextMandate(), un = d.unlocked.length;
      var html = '<div class="mb-top"><div><div class="mb-lbl">MANDATES EARNED</div><div class="mb-num">' + d.mandates + '</div></div><div style="text-align:right"><div class="mb-lbl">FIGHTERS</div><div class="mb-num" style="color:#fff">' + un + '/' + KC.ROSTER.length + '</div></div></div>';
      if (nx) {
        var prev = 0; KC.ROSTER.forEach(function (c) { if (c.unlock.type === 'mandates' && c.unlock.value <= d.mandates && c.unlock.value > prev) prev = c.unlock.value; });
        var pct = Math.min(100, (d.mandates - prev) / Math.max(1, nx.unlock.value - prev) * 100);
        html += '<div class="progress"><div style="width:' + pct.toFixed(0) + '%"></div></div><div class="mb-next"><img src="' + por(nx) + '" alt=""><div>Next Prime Minister unlocks at <b>' + nx.unlock.value + '</b> Mandates<br><span style="color:#9fb0d4">' + (nx.unlock.value - d.mandates) + ' to go — play any mode to earn them</span></div></div>';
      } else html += '<div class="mb-next" style="margin-top:8px">All Prime Ministers unlocked. Contenders and the boss have their own challenges — see the Cabinet Room.</div>';
      $('mandateBox').innerHTML = html;
    },
    choose: function () {
      var it = MENU_ITEMS[this.sel];
      KC.Audio.play('select');
      switch (it.id) {
        case 'campaign': go('select', { mode: 'campaign' }); break;
        case 'versus': go('select', { mode: 'versus' }); break;
        case 'cpu':
          showList({ title: 'VS CPU', sub: 'Choose how tough the opposition is.', items: [
            { label: 'EASY', desc: '+3 bonus Mandates on a win', action: function () { go('select', { mode: 'cpu', level: 'easy' }); } },
            { label: 'NORMAL', desc: '+6 bonus Mandates on a win', action: function () { go('select', { mode: 'cpu', level: 'normal' }); } },
            { label: 'HARD', desc: '+10 bonus — and unlocks a contender', action: function () { go('select', { mode: 'cpu', level: 'hard' }); } }
          ], sel: 1, back: function () { go('menu'); } });
          break;
        case 'collection': go('collection'); break;
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
        li.onmouseenter = function () { self.sel = +li.dataset.i; self.render(); };
        li.onclick = function () { self.sel = +li.dataset.i; self.activate(0); };
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
    var s = Save.data.settings, resetCount = 0;
    function cyc(arr, v, dir) { var i = arr.indexOf(v); return arr[(i + dir + arr.length) % arr.length]; }
    function apply() { KC.Audio.musicOn = s.music; KC.Audio.sfxOn = s.sfx; KC.Audio.voiceOn = s.voice; Save.write(); }
    showList({ title: 'SETTINGS', sub: 'Use ←/→ to change a value.', sel: sel || 0, items: [
      { label: 'ROUNDS TO WIN', value: function () { return s.rounds + (s.rounds === 1 ? ' (single round)' : ' (best of ' + (s.rounds * 2 - 1) + ')'); }, change: function (d) { s.rounds = cyc([1, 2, 3], s.rounds, d); apply(); } },
      { label: 'ROUND TIMER', value: function () { return s.timer >= 1000 ? '∞' : s.timer + 's'; }, change: function (d) { s.timer = cyc([60, 99, 9999], s.timer, d); apply(); } },
      { label: 'CHAMBER LIGHTING', value: function () { return { random: 'RANDOM', day: 'DAY SESSION', night: 'NIGHT SESSION' }[s.stage]; }, change: function (d) { s.stage = cyc(['random', 'day', 'night'], s.stage, d); apply(); stage.setMode(s.stage === 'night' ? 'night' : 'day'); } },
      { label: 'MUSIC', value: function () { return s.music ? 'ON' : 'OFF'; }, change: function () { s.music = !s.music; apply(); } },
      { label: 'SOUND EFFECTS', value: function () { return s.sfx ? 'ON' : 'OFF'; }, change: function () { s.sfx = !s.sfx; apply(); } },
      { label: 'ANNOUNCER VOICE', value: function () { return s.voice ? 'ON' : 'OFF'; }, change: function () { s.voice = !s.voice; apply(); } },
      { label: 'RESET PROGRESS', desc: 'Press ENTER three times to wipe Mandates and unlocks.', value: function () { return resetCount ? 'PRESS ' + (3 - resetCount) + ' MORE' : ''; }, action: function () {
        resetCount++;
        if (resetCount >= 3) { Save.reset(); resetCount = 0; G.toast('Progress reset. Back to 1948.'); }
        screens.list.render();
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
  var COLS = 10;
  function cellHTML(ch, i, extraCls, tags) {
    var locked = !Save.isUnlocked(ch.id);
    var grp = ch.group === 'contender' ? "26'" : ch.group === 'boss' ? 'BOSS' : '';
    return '<div class="cell ' + (locked ? 'locked ' : '') + (extraCls || '') + '" data-i="' + i + '"><img src="' + por(ch) + '" alt="">' + (grp ? '<span class="grp">' + grp + '</span>' : '') + (tags || '') + '</div>';
  }
  function panelHTML(ch, who, st) {
    var locked = !Save.isUnlocked(ch.id);
    if (locked && !st.reveal) {
      var p = Save.progress(ch);
      return '<div class="who">' + who + '</div><div class="name">???</div><div class="ttl">' + (ch.group === 'pm' ? 'PRIME MINISTER' : ch.group === 'boss' ? 'SECRET BOSS' : 'CONTENDER') + ' · LOCKED</div>' +
        '<div class="lockinfo">🔒 ' + KC.unlockText(ch) + '<br><span style="opacity:.8">Progress: ' + Math.min(p[0], p[1]) + ' / ' + p[1] + '</span></div>';
    }
    var s = ch.stats;
    var gold = st.gold, goldOk = Save.hasGold(ch.id);
    return '<div class="who">' + who + '</div><div class="name">' + esc(ch.name) + '</div><div class="ttl">' + esc(ch.title.toUpperCase()) + ' · ' + esc(ch.years) + '</div>' +
      '<div class="bio">' + esc(ch.bio) + '</div>' +
      '<div class="moves"><b>Special:</b> ' + esc(ch.special.name) + '<br><b>Super:</b> ' + esc(ch.super.name) + '</div>' +
      '<div class="stats"><span>SPEED</span>' + statBar(s.speed) + '<span>POWER</span>' + statBar(s.power) + '<span>DEFENSE</span>' + statBar(s.defense) + '<span>JUMP</span>' + statBar(s.jump) + '</div>' +
      '<div class="skin">SKIN: <b>' + (gold ? KC.ALT_SKIN.name : 'Classic') + '</b> ' + (goldOk ? '<span style="opacity:.7">(' + st.skinKey + ' to switch)</span>' : '<span style="opacity:.6">· Gold: win ' + KC.ALT_SKIN_WINS + ' with them (' + Math.min(KC.ALT_SKIN_WINS, Save.data.charWins[ch.id] || 0) + '/' + KC.ALT_SKIN_WINS + ')</span>') + '</div>' +
      (st.locked ? '<div class="ready">READY!</div>' : '');
  }
  var sel = null;
  screens.select = {
    el: 'select',
    enter: function (arg) {
      camMode = 'select'; stage.setMode('day');
      KC.Audio.playMusic('menu');
      var mode = arg.mode, two = mode === 'versus';
      var firstUnl = 0;
      var keep = sel && sel.mode === mode ? sel : null;
      sel = { mode: mode, level: arg.level, two: two, t: 0, startT: 0,
        p: [{ cur: keep ? keep.p[0].cur : firstUnl, locked: false, gold: keep ? keep.p[0].gold : false },
            { cur: keep ? keep.p[1].cur : firstUnl, locked: false, gold: keep ? keep.p[1].gold : false }] };
      $('selTitle').textContent = two ? 'CHOOSE YOUR CANDIDATES' : 'CHOOSE YOUR CANDIDATE';
      $('selMode').textContent = mode === 'versus' ? 'VERSUS · 2 PLAYERS' : mode === 'campaign' ? 'ELECTION CAMPAIGN' : 'VS CPU · ' + (arg.level || 'normal').toUpperCase();
      var st = Save.data.settings;
      $('selStage').innerHTML = 'Chamber: <b>' + { random: 'Random', day: 'Day Session', night: 'Night Session' }[st.stage] + '</b> · First to <b>' + st.rounds + '</b> round' + (st.rounds > 1 ? 's' : '') + ' · Timer <b>' + (st.timer >= 1000 ? '∞' : st.timer) + '</b> <span style="opacity:.6">(change in Settings)</span>';
      $('selHint').innerHTML = two
        ? 'P1: <kbd>WASD</kbd> move · <kbd>F</kbd> pick · <kbd>G</kbd> undo · <kbd>R</kbd> skin &nbsp;|&nbsp; P2: <kbd>Arrows</kbd> move · <kbd>K</kbd> pick · <kbd>L</kbd> undo · <kbd>O</kbd> skin'
        : '<kbd>WASD</kbd>/<kbd>Arrows</kbd> move · <kbd>F</kbd>/<kbd>Enter</kbd> pick · <kbd>R</kbd> skin · <kbd>Esc</kbd> back';
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
      var p1c = KC.ROSTER[sel.p[0].cur];
      $('selP1').innerHTML = panelHTML(p1c, sel.two ? 'PLAYER 1' : 'PLAYER', { gold: sel.p[0].gold, locked: sel.p[0].locked, skinKey: 'R' });
      if (sel.two) {
        $('selP2').style.visibility = 'visible';
        $('selP2').innerHTML = panelHTML(KC.ROSTER[sel.p[1].cur], 'PLAYER 2', { gold: sel.p[1].gold, locked: sel.p[1].locked, skinKey: 'O' });
      } else if (sel.mode === 'cpu' || sel.mode === 'campaign') {
        $('selP2').style.visibility = 'visible';
        $('selP2').innerHTML = '<div class="who">' + (sel.mode === 'campaign' ? 'CAMPAIGN' : 'CPU OPPONENT') + '</div><div class="name">' + (sel.mode === 'campaign' ? '5 RIVALS + ???' : '???') + '</div><div class="bio">' +
          (sel.mode === 'campaign' ? 'Win five races in a row, then face the final boss. Losing a stop lets you retry it.' : 'A random rival is drawn from the whole roster — even ones you have not unlocked yet. Beat them to earn Mandates.') + '</div>';
      }
      if (rebuild) this.previews();
    },
    previews: function () {
      for (var i = 0; i < 2; i++) {
        if (i === 1 && !sel.two) { clearPreview(1); continue; }
        var ch = KC.ROSTER[sel.p[i].cur], unl = Save.isUnlocked(ch.id);
        var skin = sel.p[i].gold && Save.hasGold(ch.id) ? KC.ALT_SKIN : null;
        var p0skin = sel.p[0].gold && Save.hasGold(ch.id) ? KC.ALT_SKIN : null;
        if (i === 1 && sel.p[0].cur === sel.p[1].cur && skin === p0skin) skin = KC.MIRROR_SKIN;
        var x = i === 0 ? -1.55 : 1.55;
        setPreview(i, ch, skin, !unl, x, i === 0 ? 0.55 : -0.55);
      }
    },
    move: function (i, dx, dy) {
      var p = sel.p[i]; if (p.locked) return;
      var n = KC.ROSTER.length, c = p.cur;
      if (dx) c = (c + dx + n) % n;
      if (dy) { c += dy * COLS; if (c < 0) c += Math.ceil(n / COLS) * COLS; if (c >= n) c = c % COLS; if (c >= n) c = n - 1; }
      p.cur = c; p.gold = p.gold && Save.hasGold(KC.ROSTER[c].id);
      KC.Audio.play('move');
      this.render(true);
    },
    pick: function (i) {
      var p = sel.p[i], ch = KC.ROSTER[p.cur];
      if (p.locked) return;
      if (!Save.isUnlocked(ch.id)) { KC.Audio.play('deny'); G.toast('🔒 ' + KC.unlockText(ch) + ' to unlock this fighter.'); return; }
      p.locked = true; KC.Audio.play('select');
      KC.Audio.say(ch.name, { interrupt: true });
      if (previews[i]) previews[i].cheer = 1.6;
      this.render(false);
      if (!sel.two || (sel.p[0].locked && sel.p[1].locked)) sel.startT = 0.9;
    },
    unpick: function (i) { var p = sel.p[i]; if (!p.locked) return false; p.locked = false; sel.startT = 0; KC.Audio.play('back'); this.render(false); return true; },
    skin: function (i) {
      var p = sel.p[i], ch = KC.ROSTER[p.cur];
      if (!Save.hasGold(ch.id)) { KC.Audio.play('deny'); G.toast('Win ' + KC.ALT_SKIN_WINS + ' matches as ' + ch.short + ' to unlock ' + KC.ALT_SKIN.name + '.'); return; }
      p.gold = !p.gold; KC.Audio.play('select'); this.render(true);
    },
    update: function (dt) {
      if (sel.startT > 0) { sel.startT -= dt; if (sel.startT <= 0) { this.launch(); return; } }
      var one = !sel.two;
      // P1
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
      } else if (sel.mode === 'cpu') {
        var pool = KC.ROSTER.filter(function (c) { return c.id !== c0.id && (c.id !== 'speaker' || Save.isUnlocked('speaker')); });
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
    },
    exit: function () { }
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
      KC.Audio.playMusic('menu');
    },
    update: function () {
      if (Input.menu('ok')) {
        var c = G.campaign, stop = c.stops[c.idx];
        KC.Audio.play('select');
        startMatch({ mode: 'campaign', chars: [c.player, stop.ch], skins: [c.skin, c.player === stop.ch ? KC.MIRROR_SKIN : null], ai: [null, stop.level] });
      } else if (Input.menu('back')) {
        KC.Audio.play('back');
        showList({ title: 'WITHDRAW FROM CAMPAIGN?', sub: 'Your progress on this run will be lost.', items: [
          { label: 'KEEP CAMPAIGNING', action: function () { go('ladder'); } },
          { label: 'WITHDRAW', action: function () { G.campaign = null; go('menu'); } }
        ], back: function () { go('ladder'); } });
      }
    }
  };

  /* ---------- collection (cabinet room) ---------- */
  screens.collection = {
    el: 'collection', cur: 0, gold: false,
    enter: function () { camMode = 'collection'; stage.setMode('day'); clearPreviews(); this.gold = false; this.render(true); },
    refresh: function () { this.render(true); },
    render: function (rebuild) {
      var self = this, d = Save.data;
      $('colSub').textContent = d.unlocked.length + ' / ' + KC.ROSTER.length + ' fighters · ' + d.gold.length + ' gold skins · ' + d.mandates + ' Mandates';
      $('colGrid').innerHTML = KC.ROSTER.map(function (ch, i) { return cellHTML(ch, i, i === self.cur ? 'c1' : ''); }).join('');
      $('colGrid').querySelectorAll('.cell').forEach(function (c) { c.onclick = function () { self.cur = +c.dataset.i; self.gold = false; self.render(true); }; });
      var ch = KC.ROSTER[this.cur], unl = Save.isUnlocked(ch.id), p = Save.progress(ch);
      var wins = d.charWins[ch.id] || 0, goldOk = Save.hasGold(ch.id);
      var html = '<div class="name">' + (unl ? esc(ch.name) : '???') + '</div><div class="ttl">' + (unl ? esc(ch.title) + ' · ' + esc(ch.years) : (ch.group === 'pm' ? 'Prime Minister' : ch.group === 'boss' ? 'Secret boss' : 'Contender')) + '</div>';
      html += '<div class="req ' + (unl ? 'ok' : 'no') + '">' + (unl ? '✔ Unlocked' : '🔒 ' + KC.unlockText(ch) + ' — ' + Math.min(p[0], p[1]) + ' / ' + p[1]) + '</div>';
      html += '<div class="req ' + (goldOk ? 'ok' : 'no') + '">' + (goldOk ? '✔ ' : '🔒 ') + KC.ALT_SKIN.name + ' skin — wins with fighter: ' + Math.min(wins, KC.ALT_SKIN_WINS) + ' / ' + KC.ALT_SKIN_WINS + '</div>';
      if (unl) html += '<p>' + esc(ch.bio) + '</p><p><b style="color:#f2c14e">Special:</b> ' + esc(ch.special.name) + '<br><b style="color:#f2c14e">Super:</b> ' + esc(ch.super.name) + '</p><p style="font-style:italic">“' + esc(ch.quote) + '”</p>';
      else html += '<p>Keep playing to reveal this fighter. Every match earns Mandates.</p>';
      $('colInfo').innerHTML = html;
      if (rebuild) {
        var pv = setPreview(0, ch, this.gold && goldOk ? KC.ALT_SKIN : null, !unl, 0.15, 0.3);
        pv.spin = true;
      }
    },
    update: function () {
      var n = KC.ROSTER.length, c = this.cur;
      if (Input.menu('left')) c = (c - 1 + n) % n;
      if (Input.menu('right')) c = (c + 1) % n;
      if (Input.menu('up')) c = (c - 5 + n) % n;
      if (Input.menu('down')) c = (c + 5) % n;
      if (c !== this.cur) { this.cur = c; this.gold = false; KC.Audio.play('move'); this.render(true); }
      if (Input.hit(['KeyR', 'KeyO', 'Pad0_x', 'Pad1_x'])) {
        var ch = KC.ROSTER[this.cur];
        if (Save.hasGold(ch.id)) { this.gold = !this.gold; KC.Audio.play('select'); this.render(true); }
        else { KC.Audio.play('deny'); G.toast('Win ' + KC.ALT_SKIN_WINS + ' matches with this fighter to unlock ' + KC.ALT_SKIN.name + '.'); }
      }
      if (Input.hit(['Escape', 'Backspace', 'KeyG', 'KeyL', 'Pad0_b', 'Pad1_b'])) { KC.Audio.play('back'); go('menu'); }
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
    var m = new KC.Match(G, { chars: cfg.chars, skins: cfg.skins, roundsToWin: st.rounds, timer: st.timer, stageMode: mode });
    G.ai = cfg.ai.map(function (lvl, i) { return lvl ? new KC.AI(m.f[i], lvl) : null; });
    KC.HUD.setup(m);
    G.match = m;
    G.screen = 'fight';
    G.inputLock = 0.2;
    G.acc = 0;
    KC.Audio.playMusic('fight');
  }
  G.startMatch = startMatch;
  G.getInput = function (i, m) {
    if (G.ai[i]) return G.ai[i].input(m);
    var oneP = G.ai[1 - i] != null;
    return Input.player(i, oneP && i === 0);
  };
  G.skipPressed = function () { return Input.hit(['Enter', 'Space', 'KeyF', 'KeyG', 'KeyK', 'KeyL', 'Pad0_a', 'Pad1_a']); };
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
      { label: G.matchCfg.mode === 'campaign' ? 'BACK TO CAMPAIGN' : 'CHARACTER SELECT', action: function () { endMatchTo(G.matchCfg.mode === 'campaign' ? 'ladder' : 'select'); } },
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
    if (where === 'select') go('select', { mode: G.matchCfg.mode, level: G.ai[1] ? G.ai[1].level : null });
    else if (where === 'ladder' && G.campaign) go('ladder');
    else go('menu');
  }

  /* ---------- match end → rewards ---------- */
  G.onMatchEnd = function (m) {
    var cfg = G.matchCfg, d = Save.data;
    var human = [!cfg.ai[0], !cfg.ai[1]];
    var r = m.result, lines = [], total = 0, demo = !human[0] && !human[1];
    function add(label, v) { if (v > 0 && !demo) { lines.push([label, v]); total += v; } }
    add('Session attended', 3);
    var roundsH = r.roundWinners.filter(function (w) { return w >= 0 && human[w]; }).length;
    add('Rounds won × ' + roundsH, 2 * roundsH);
    var w = m.winner, humanWon = w >= 0 && human[w];
    var lvl = cfg.ai[1];
    if (humanWon) add(cfg.mode === 'versus' ? 'Motion passed (match won)' : 'Victory', 5);
    var perf = (human[0] ? r.perfects[0] : 0) + (human[1] ? r.perfects[1] : 0);
    add('Perfect rounds × ' + perf, 3 * perf);
    if (r.superKO && humanWon) add('Super finish', 2);
    if (humanWon && cfg.mode !== 'versus') add('Opposition: ' + lvl.toUpperCase(), { easy: 3, normal: 6, hard: 10, boss: 12 }[lvl] || 0);
    var finalStop = cfg.mode === 'campaign' && G.campaign && G.campaign.idx === G.campaign.stops.length - 1;
    if (cfg.mode === 'campaign' && humanWon) add('Campaign stop cleared', 4);
    if (finalStop && humanWon) add('CAMPAIGN COMPLETE', 25);
    // stats
    if (demo) { showResults(m, cfg, { lines: [], total: 0, unl: { chars: [], golds: [] }, humanWon: false, finalStop: false }); return; }
    d.mandates += total; d.matches++;
    if (cfg.mode !== 'versus' && humanWon) { d.cpuWins++; if (lvl === 'hard' || lvl === 'boss') d.hardWins++; }
    for (var i = 0; i < 2; i++) if (human[i]) { d.supers += r.supers[i]; d.perfects += r.perfects[i]; }
    if (humanWon) { var wid = m.f[w].ch.id; d.charWins[wid] = (d.charWins[wid] || 0) + 1; }
    if (finalStop && humanWon) d.campaign++;
    var unl = Save.refresh();
    showResults(m, cfg, { lines: lines, total: total, unl: unl, humanWon: humanWon, finalStop: finalStop });
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
      else if (info.humanWon) { title = info.finalStop ? 'CAMPAIGN WON!' : 'VICTORY'; sub = m.f[w].ch.name + ' carries the vote.'; }
      else { title = 'DEFEAT'; sub = m.f[w].ch.name + ' wins this session.'; }
      $('resTitle').textContent = title; $('resSub').textContent = sub;
      var earn = info.lines.map(function (l) { return '<div class="row"><span>' + esc(l[0]) + '</span><b>+' + l[1] + '</b></div>'; }).join('');
      earn += '<div class="total"><span>MANDATES</span><b>+' + info.total + '</b></div><div class="next-unlock" style="margin-top:6px">Total: <b style="color:#fff">' + d.mandates + '</b> Mandates</div>';
      var nx = Save.nextMandate();
      if (nx) earn += '<div class="next-unlock">Next Prime Minister at ' + nx.unlock.value + ' (' + (nx.unlock.value - d.mandates) + ' to go)</div>';
      $('resEarn').innerHTML = earn;
      var u = '';
      if (info.unl.chars.length || info.unl.golds.length) {
        u += '<h3>UNLOCKED!</h3>';
        info.unl.chars.forEach(function (ch, i) { u += '<div class="unl" style="animation-delay:' + (0.2 + i * 0.15) + 's"><img src="' + por(ch) + '" alt=""><div><div class="u1">NEW FIGHTER</div><div class="u2">' + esc(ch.name) + '</div><div style="font-size:12px;color:#9fb0d4">' + esc(ch.title) + '</div></div></div>'; });
        info.unl.golds.forEach(function (ch, i) { u += '<div class="unl" style="animation-delay:' + (0.3 + i * 0.15) + 's"><img src="' + por(ch, true) + '" alt=""><div><div class="u1">NEW SKIN</div><div class="u2">' + esc(ch.short) + ' — ' + KC.ALT_SKIN.name + '</div></div></div>'; });
        setTimeout(function () { KC.Audio.play('unlock'); }, 300);
        if (info.unl.chars.length) setTimeout(function () { KC.Audio.say('New fighter unlocked: ' + info.unl.chars.map(function (c) { return c.name; }).join(', ')); }, 900);
      } else {
        // show the closest locked challenge
        var locked = KC.ROSTER.filter(function (c) { return !Save.isUnlocked(c.id); });
        if (locked.length) {
          u += '<h3>NEXT UP</h3>';
          locked.slice(0, 3).forEach(function (c) { var p = Save.progress(c); u += '<div class="unl" style="filter:saturate(.4)"><img src="' + por(c) + '" style="filter:brightness(0) drop-shadow(0 0 2px #7fb2ff)" alt=""><div><div class="u1">LOCKED</div><div style="font-size:13px">' + KC.unlockText(c) + '</div><div style="font-size:12px;color:#9fb0d4">' + Math.min(p[0], p[1]) + ' / ' + p[1] + '</div></div></div>'; });
        } else u += '<h3>FULL HOUSE</h3><div class="next-unlock">Every fighter unlocked. All 120 seats are yours.</div>';
      }
      $('resUnlocks').innerHTML = u;
      // options
      var opts = [];
      if (cfg.mode === 'campaign') {
        if (info.humanWon && !info.finalStop) opts.push({ label: 'NEXT STOP', fn: function () { G.campaign.idx++; endMatchTo('ladder'); } });
        else if (!info.humanWon) opts.push({ label: 'RETRY STOP', fn: function () { endMatchTo('ladder'); } });
        opts.push({ label: info.finalStop && info.humanWon ? 'MAIN MENU' : 'WITHDRAW', fn: function () { G.campaign = null; endMatchTo('menu'); } });
      } else {
        opts.push({ label: 'REMATCH', fn: function () { startMatch(cfg); } });
        opts.push({ label: 'CHARACTER SELECT', fn: function () { endMatchTo('select'); } });
        opts.push({ label: 'MAIN MENU', fn: function () { endMatchTo('menu'); } });
      }
      R.opts = opts; R.sel = 0;
      this.renderOpts();
      G.inputLock = 0.6;
    },
    renderOpts: function () {
      var R = resCfg;
      $('resMenu').innerHTML = R.opts.map(function (o, i) { return '<li class="' + (i === R.sel ? 'sel' : '') + '" data-i="' + i + '">' + o.label + '</li>'; }).join('');
      $('resMenu').querySelectorAll('li').forEach(function (li) { li.onclick = function () { R.opts[+li.dataset.i].fn(); }; });
    },
    update: function () {
      var R = resCfg;
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
      Save.refresh();
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
