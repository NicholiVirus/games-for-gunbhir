/* Knesset Combat 26' — the plenum chamber stage. */
(function () {
  var T = THREE;
  var M = KC.Models;
  var S = KC.Stage = {};

  function lam(color, opts) { var o = Object.assign({ color: new T.Color(color), flatShading: true }, opts || {}); return new T.MeshLambertMaterial(o); }
  function mesh(geo, mat, x, y, z, shadow) {
    var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0);
    m.receiveShadow = true; if (shadow) m.castShadow = true; return m;
  }
  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var ctx = c.getContext('2d'); draw(ctx, w, h);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    t.userData = { canvas: c, ctx: ctx };
    return t;
  }
  function drawStar(ctx, cx, cy, r, lw, color) {
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'miter';
    for (var k = 0; k < 2; k++) {
      ctx.beginPath();
      for (var i = 0; i < 3; i++) {
        var a = -Math.PI / 2 + i * Math.PI * 2 / 3 + k * Math.PI;
        var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
    }
  }
  function drawMenorah(ctx, cx, cy, s, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round';
    ctx.lineWidth = s * 0.07;
    // center stem
    ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s * 0.55); ctx.stroke();
    for (var i = 1; i <= 3; i++) {
      var r = s * 0.28 * i;
      ctx.beginPath(); ctx.arc(cx, cy - s * 0.1, r, 0, Math.PI, false); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy - s * 0.1); ctx.lineTo(cx - r, cy - s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + r, cy - s * 0.1); ctx.lineTo(cx + r, cy - s); ctx.stroke();
    }
    for (var j = -3; j <= 3; j++) { ctx.beginPath(); ctx.arc(cx + j * s * 0.28, cy - s * 1.05, s * 0.06, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillRect(cx - s * 0.35, cy + s * 0.5, s * 0.7, s * 0.12);
    ctx.fillRect(cx - s * 0.2, cy + s * 0.62, s * 0.4, s * 0.1);
  }
  function drawOlive(ctx, cx, cy, s, dir, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = s * 0.03;
    ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.7);
    ctx.quadraticCurveTo(cx + dir * s * 0.55, cy, cx + dir * s * 0.1, cy - s * 0.9); ctx.stroke();
    for (var i = 0; i < 8; i++) {
      var t = i / 8, px = cx + dir * (s * 0.42 * Math.sin(t * Math.PI)) + dir * s * 0.02, py = cy + s * 0.65 - t * s * 1.5;
      ctx.save(); ctx.translate(px, py); ctx.rotate(dir * (0.6 + t * 0.4));
      ctx.beginPath(); ctx.ellipse(dir * s * 0.07, 0, s * 0.08, s * 0.03, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  S.build = function (scene) {
    var st = { group: new T.Group(), flags: [], t: 0, mode: 'day' };
    var G = st.group; scene.add(G);

    /* ---- lights ---- */
    st.hemi = new T.HemisphereLight(0xfff4e0, 0x4a5568, 0.75); G.add(st.hemi);
    var key = new T.DirectionalLight(0xfff1dc, 1.05);
    key.position.set(-5, 14, 10); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    var sc = key.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 10; sc.bottom = -6; sc.near = 1; sc.far = 40;
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    G.add(key); G.add(key.target); st.key = key;
    var rim = new T.DirectionalLight(0x9cc4ff, 0.45); rim.position.set(6, 8, -12); G.add(rim); st.rim = rim;
    st.spot = new T.SpotLight(0xfff0d0, 0, 40, 0.36, 0.55, 1.0);
    st.spot.castShadow = false;
    st.spot.position.set(0, 13, 4); st.spot.target.position.set(0, 0, 0); G.add(st.spot); G.add(st.spot.target);

    scene.background = new T.Color('#1c2433');
    scene.fog = new T.Fog('#1c2433', 28, 62);

    /* ---- floor ---- */
    var carpet = lam('#2c4a73');
    var floor = mesh(new T.CircleGeometry(40, 48), carpet, 0, 0, 0); floor.rotation.x = -Math.PI / 2; G.add(floor);
    var well = mesh(new T.CircleGeometry(1, 40), lam('#cdbd9c'), 0, 0.005, -0.6); well.rotation.x = -Math.PI / 2; well.scale.set(9.6, 3.6, 1); G.add(well);
    var trim = mesh(new T.RingGeometry(0.97, 1.0, 64), new T.MeshBasicMaterial({ color: '#c9a227' }), 0, 0.008, -0.6); trim.rotation.x = -Math.PI / 2; trim.scale.set(9.6, 3.6, 1); G.add(trim);
    var inlayTex = canvasTex(512, 512, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.9; drawMenorah(ctx, w / 2, h / 2 + 20, 150, '#b88d2a');
      drawOlive(ctx, w / 2 - 190, h / 2 + 10, 160, -1, '#b88d2a'); drawOlive(ctx, w / 2 + 190, h / 2 + 10, 160, 1, '#b88d2a');
    });
    var inlay = mesh(new T.PlaneGeometry(4.5, 4.5), new T.MeshLambertMaterial({ map: inlayTex, transparent: true, depthWrite: false }), 0, 0.012, -1.4);
    inlay.rotation.x = -Math.PI / 2; G.add(inlay);

    /* ---- walls ---- */
    var stone = lam('#d6c6a3'), wood = lam('#8f5f36'), woodLight = lam('#b7854f'), woodDark = lam('#5e3b1f');
    var back = mesh(new T.BoxGeometry(44, 14, 0.5), stone, 0, 7, -14.7); G.add(back);
    [-1, 1].forEach(function (s) {
      var side = mesh(new T.BoxGeometry(0.5, 14, 34), stone, s * 20, 7, -2); side.rotation.y = s * 0.12; G.add(side);
    });
    // wood slat panels along back wall
    var slatGeo = new T.BoxGeometry(0.18, 3.4, 0.12);
    var slats = new T.InstancedMesh(slatGeo, woodLight, 120);
    var mtx = new T.Matrix4(), q = new T.Quaternion(), pos = new T.Vector3(), scl = new T.Vector3(1, 1, 1);
    var si = 0;
    for (var i = 0; i < 120; i++) { mtx.makeTranslation(-18 + i * 0.3, 1.7, -14.35); slats.setMatrixAt(si++, mtx); }
    slats.receiveShadow = true; G.add(slats);
    G.add(mesh(new T.BoxGeometry(36, 3.6, 0.1), woodDark, 0, 1.8, -14.45));
    // gallery glass
    var glass = new T.MeshLambertMaterial({ color: '#7fa6c9', transparent: true, opacity: 0.45, emissive: new T.Color('#16324d') });
    G.add(mesh(new T.BoxGeometry(34, 2.2, 0.15), glass, 0, 8.2, -14.2));
    G.add(mesh(new T.BoxGeometry(34, 0.25, 0.6), woodDark, 0, 7.0, -14.1));
    G.add(mesh(new T.BoxGeometry(34, 0.25, 0.6), woodDark, 0, 9.4, -14.1));
    // gallery visitors (silhouettes)
    var vis = new T.InstancedMesh(new T.CapsuleGeometry ? new T.CapsuleGeometry(0.18, 0.4, 3, 6) : new T.CylinderGeometry(0.18, 0.18, 0.7, 6), lam('#2a3240'), 40);
    for (var v = 0; v < 40; v++) { mtx.makeTranslation(-16 + v * 0.82 + Math.random() * 0.3, 7.65 + Math.random() * 0.1, -14.4); vis.setMatrixAt(v, mtx); }
    G.add(vis);
    // ceiling with light panels
    var ceil = mesh(new T.PlaneGeometry(44, 34), lam('#2b2f38'), 0, 12.5, -2); ceil.rotation.x = Math.PI / 2; G.add(ceil);
    var lightMat = new T.MeshBasicMaterial({ color: '#fff3d6' });
    var lamps = new T.InstancedMesh(new T.BoxGeometry(1.6, 0.08, 0.5), lightMat, 48);
    var li = 0;
    for (var lx = 0; lx < 8; lx++) for (var lz = 0; lz < 6; lz++) { mtx.makeTranslation(-14 + lx * 4, 12.4, -13 + lz * 3.6); lamps.setMatrixAt(li++, mtx); }
    G.add(lamps); st.lampMat = lightMat;

    /* ---- emblem ---- */
    var emblemTex = canvasTex(512, 600, function (ctx, w, h) {
      ctx.fillStyle = '#0038b8';
      ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(w - 40, 30); ctx.lineTo(w - 40, 380); ctx.quadraticCurveTo(w - 40, 560, w / 2, h - 20); ctx.quadraticCurveTo(40, 560, 40, 380); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 14; ctx.strokeStyle = '#d4af37'; ctx.stroke();
      drawMenorah(ctx, w / 2, 300, 150, '#f3d77a');
      drawOlive(ctx, w / 2 - 175, 280, 170, -1, '#f3d77a'); drawOlive(ctx, w / 2 + 175, 280, 170, 1, '#f3d77a');
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 64px Rubik, Arial, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('הכנסת', w / 2, 505);
    });
    var emblem = mesh(new T.PlaneGeometry(3.4, 4.0), new T.MeshBasicMaterial({ map: emblemTex, transparent: true }), 0, 5.0, -14.4);
    G.add(emblem);

    /* ---- live vote boards ---- */
    st.boards = [];
    [-1, 1].forEach(function (s) {
      var tex = canvasTex(512, 256, function () {});
      var frame = mesh(new T.BoxGeometry(4.6, 2.5, 0.2), lam('#111318'), s * 6.4, 5.0, -14.35); G.add(frame);
      var scr = new T.Mesh(new T.PlaneGeometry(4.3, 2.15), new T.MeshBasicMaterial({ map: tex }));
      scr.position.set(s * 6.4, 5.0, -14.23); G.add(scr);
      st.boards.push({ tex: tex, side: s });
    });

    /* ---- speaker's dais ---- */
    var dais = new T.Group(); dais.position.set(0, 0, -10.8); G.add(dais);
    dais.add(mesh(new T.BoxGeometry(8.4, 0.5, 3.4), woodDark, 0, 0.25, 0, true));
    dais.add(mesh(new T.BoxGeometry(6.6, 0.7, 2.4), wood, 0, 0.85, -0.3, true));
    dais.add(mesh(new T.BoxGeometry(5.2, 1.0, 1.2), woodLight, 0, 1.7, -0.6, true));
    dais.add(mesh(new T.BoxGeometry(5.4, 0.1, 1.4), woodDark, 0, 2.25, -0.6, true));
    dais.add(mesh(new T.BoxGeometry(1.2, 0.08, 0.02), new T.MeshBasicMaterial({ color: '#d4af37' }), 0, 1.75, 0.01));
    // speaker chair + clerks table
    dais.add(mesh(new T.BoxGeometry(0.9, 1.6, 0.25), lam('#1f3f73'), 0, 2.6, -1.35, true));
    dais.add(mesh(new T.BoxGeometry(6.2, 0.75, 0.9), woodLight, 0, 0.88, 1.15, true));
    // rostrum
    var rost = new T.Group(); rost.position.set(0, 0, -8.0); G.add(rost);
    rost.add(mesh(new T.CylinderGeometry(0.55, 0.65, 1.2, 8), wood, 0, 0.6, 0, true));
    rost.add(mesh(new T.BoxGeometry(1.3, 0.08, 0.7), woodDark, 0, 1.24, 0.05, true));
    var micStand = mesh(new T.CylinderGeometry(0.015, 0.015, 0.45, 5), lam('#222'), 0, 1.45, 0.2); micStand.rotation.x = 0.4; rost.add(micStand);
    rost.add(mesh(new T.SphereGeometry(0.04, 6, 4), lam('#333'), 0, 1.66, 0.29));

    /* ---- Israeli flags ---- */
    var flagTex = canvasTex(320, 220, function (ctx, w, h) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0038b8'; ctx.fillRect(0, h * 0.1, w, h * 0.15); ctx.fillRect(0, h * 0.75, w, h * 0.15);
      drawStar(ctx, w / 2, h / 2 + 4, h * 0.2, 9, '#0038b8');
    });
    [-1, 1].forEach(function (s) {
      var pole = mesh(new T.CylinderGeometry(0.04, 0.05, 4.6, 6), lam('#c9a227'), s * 4.4, 2.3, -12.0, true); G.add(pole);
      G.add(mesh(new T.SphereGeometry(0.09, 8, 6), lam('#e5c35a'), s * 4.4, 4.65, -12.0));
      var geo = new T.PlaneGeometry(1.7, 1.15, 14, 6);
      geo.translate(0.85, 0, 0);
      var fl = new T.Mesh(geo, new T.MeshLambertMaterial({ map: flagTex, side: T.DoubleSide }));
      fl.position.set(s * 4.4, 3.85, -12.0);
      fl.rotation.y = s > 0 ? Math.PI : 0;
      fl.castShadow = true;
      G.add(fl);
      st.flags.push({ mesh: fl, base: geo.attributes.position.array.slice(), phase: s });
    });

    /* ---- government table ---- */
    var gov = new T.Group(); gov.position.set(0, 0, -4.8); G.add(gov);
    for (var gi = -4; gi <= 4; gi++) {
      var ang = gi * 0.07;
      var seg = mesh(new T.BoxGeometry(1.25, 0.08, 0.75), woodLight, gi * 1.2, 0.78, -Math.abs(gi) * Math.abs(gi) * 0.05, true);
      seg.rotation.y = -ang; gov.add(seg);
      var front = mesh(new T.BoxGeometry(1.25, 0.72, 0.06), wood, gi * 1.2, 0.38, 0.33 - Math.abs(gi) * Math.abs(gi) * 0.05, true);
      front.rotation.y = -ang; gov.add(front);
    }

    /* ---- MK seating: 120 seats ---- */
    var CENTER_Z = 0.0, ROWS = 5, PER_ROW = 12;
    var seats = [];
    var platMat = lam('#3b5d8c');
    for (var side = -1; side <= 1; side += 2) {
      for (var r = 0; r < ROWS; r++) {
        var rad = 10.2 + r * 1.3, h = 0.3 + r * 0.38;
        var a0 = -1.0, a1 = 0.0;
        // annular platform
        var shp = new T.Shape();
        var ri = rad - 0.66, ro = rad + 0.66, N = 18;
        for (var k = 0; k <= N; k++) { var a = a0 + (a1 - a0) * k / N; var pt = [side * ro * Math.cos(a), -(CENTER_Z + ro * Math.sin(a))]; if (k === 0) shp.moveTo(pt[0], pt[1]); else shp.lineTo(pt[0], pt[1]); }
        for (k = N; k >= 0; k--) { a = a0 + (a1 - a0) * k / N; shp.lineTo(side * ri * Math.cos(a), -(CENTER_Z + ri * Math.sin(a))); }
        var pg = new T.ExtrudeGeometry(shp, { depth: h, bevelEnabled: false });
        pg.rotateX(-Math.PI / 2);
        var plat = new T.Mesh(pg, platMat); plat.receiveShadow = true; G.add(plat);
        for (var p = 0; p < PER_ROW; p++) {
          var aa = a0 + 0.03 + (a1 - a0 - 0.06) * (p + 0.5) / PER_ROW;
          var sx = side * rad * Math.cos(aa), sz = CENTER_Z + rad * Math.sin(aa);
          var yaw = Math.atan2(-sx, CENTER_Z - sz); // face center
          seats.push({ x: sx, z: sz, y: h, yaw: yaw, row: r });
        }
      }
    }
    var nSeats = seats.length;
    var deskM = new T.InstancedMesh(new T.BoxGeometry(0.8, 0.12, 0.5), woodLight, nSeats);
    var deskF = new T.InstancedMesh(new T.BoxGeometry(0.8, 0.68, 0.06), wood, nSeats);
    var chairB = new T.InstancedMesh(new T.BoxGeometry(0.55, 0.85, 0.12), lam('#1f6fb2'), nSeats);
    var chairS = new T.InstancedMesh(new T.BoxGeometry(0.55, 0.12, 0.55), lam('#1f6fb2'), nSeats);
    var e = new T.Euler();
    function place(im, i, s, dx, dy, dz) {
      e.set(0, s.yaw, 0); q.setFromEuler(e);
      var off = new T.Vector3(dx, dy, dz).applyQuaternion(q);
      pos.set(s.x + off.x, s.y + off.y, s.z + off.z);
      mtx.compose(pos, q, scl); im.setMatrixAt(i, mtx);
    }
    seats.forEach(function (s, i) {
      place(deskM, i, s, 0, 0.78, 0.45); place(deskF, i, s, 0, 0.36, 0.69);
      place(chairS, i, s, 0, 0.45, -0.1); place(chairB, i, s, 0, 0.85, -0.38);
    });
    [deskM, deskF, chairB, chairS].forEach(function (im) { im.receiveShadow = true; G.add(im); });

    /* ---- NPC Members of Knesset (instanced) ---- */
    var npcs = [];
    seats.forEach(function (s) { if (Math.random() < 0.86) npcs.push({ seat: s }); });
    // ministers at the government table
    for (var mi = -4; mi <= 4; mi += 1) {
      if (Math.random() < 0.75) npcs.push({ seat: { x: mi * 1.2, z: -4.8 - 0.75 - mi * mi * 0.05, y: 0, yaw: 0, row: -1 } });
    }
    var nN = npcs.length;
    var suitCols = ['#1e2a44', '#2b2d33', '#3a3f4b', '#4a4f57', '#202020', '#5b4636', '#f2f2f2', '#7a1f2b', '#2f5d50', '#6d5a8a', '#e8d9b5', '#3f6fb5'];
    var skinCols = ['#f1c7a3', '#e5b48e', '#d9a37c', '#c68a63', '#a96f4b', '#eab892'];
    var hairCols = ['#1d1612', '#3a2a1e', '#6b4e33', '#9a9a96', '#d9d9d6', '#2a2a2a', '#b07a3c'];
    var torsoIM = new T.InstancedMesh(new T.BoxGeometry(0.44, 0.52, 0.27).toNonIndexed(), M.toon('#ffffff'), nN);
    var headIM = new T.InstancedMesh(new T.SphereGeometry(0.125, 8, 6).toNonIndexed(), M.toon('#ffffff'), nN);
    var hairIM = new T.InstancedMesh(new T.SphereGeometry(0.135, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).toNonIndexed(), M.toon('#ffffff'), nN);
    var armIM = new T.InstancedMesh(new T.BoxGeometry(0.1, 0.44, 0.1).toNonIndexed(), M.toon('#ffffff'), nN * 2);
    [torsoIM, headIM, hairIM, armIM].forEach(function (im) { im.geometry.computeVertexNormals(); im.castShadow = false; im.receiveShadow = false; G.add(im); });
    var col = new T.Color();
    npcs.forEach(function (n, i) {
      n.suit = suitCols[(Math.random() * suitCols.length) | 0];
      n.phase = Math.random() * Math.PI * 2;
      n.cheer = 0; n.stand = 0; n.look = 0;
      n.bald = Math.random() < 0.18;
      torsoIM.setColorAt(i, col.set(n.suit));
      headIM.setColorAt(i, col.set(skinCols[(Math.random() * skinCols.length) | 0]));
      hairIM.setColorAt(i, col.set(hairCols[(Math.random() * hairCols.length) | 0]));
      armIM.setColorAt(i * 2, col.set(n.suit)); armIM.setColorAt(i * 2 + 1, col.set(n.suit));
    });
    st.npcs = npcs;
    st.npcMeshes = { torso: torsoIM, head: headIM, hair: hairIM, arm: armIM };

    st.lookX = 0;
    var U = { euler: new T.Euler(0, 0, 0, 'YXZ'), qq: new T.Quaternion(), qh: new T.Quaternion(), qa: new T.Quaternion(), v: new T.Vector3(), off: new T.Vector3(), hang: new T.Vector3(), one: new T.Vector3(1, 1, 1), zero: new T.Vector3(0, 0, 0) };
    st.update = function (dt, focusX) {
      st.t += dt;
      var t = st.t;
      st.lookX += ((focusX || 0) - st.lookX) * Math.min(1, dt * 3);
      // flags
      st.flags.forEach(function (f) {
        var arr = f.mesh.geometry.attributes.position.array, b = f.base;
        for (var i = 0; i < arr.length; i += 3) {
          var x = b[i];
          arr[i + 2] = Math.sin(x * 3.2 - t * 4.2 + f.phase) * 0.09 * x + Math.sin(b[i + 1] * 2 + t * 2.6) * 0.02 * x;
        }
        f.mesh.geometry.attributes.position.needsUpdate = true;
        f.mesh.geometry.computeVertexNormals();
      });
      // npcs
      var euler = U.euler, qq = U.qq, qh = U.qh, v = U.v, one = U.one, zero = U.zero;
      for (var i = 0; i < npcs.length; i++) {
        var n = npcs[i], s = n.seat;
        if (n.cheer > 0) n.cheer -= dt;
        var wantStand = n.cheer > 0 ? 1 : 0;
        n.stand += (wantStand - n.stand) * Math.min(1, dt * 8);
        var bob = Math.sin(t * 1.3 + n.phase) * 0.012 + (n.cheer > 0 ? Math.abs(Math.sin(t * 12 + n.phase)) * 0.08 : 0);
        var baseY = s.y + 0.45 + 0.3 + n.stand * 0.42 + bob;
        euler.set(0, s.yaw, 0); qq.setFromEuler(euler);
        // torso
        v.set(0, 0, -0.12).applyQuaternion(qq);
        mtx.compose(pos.set(s.x + v.x, baseY, s.z + v.z), qq, one); torsoIM.setMatrixAt(i, mtx);
        // head looks at action
        var dx = st.lookX - s.x, dz = 0 - s.z;
        var lookYaw = Math.atan2(dx, dz);
        var rel = lookYaw - s.yaw; while (rel > Math.PI) rel -= Math.PI * 2; while (rel < -Math.PI) rel += Math.PI * 2;
        rel = Math.max(-1.1, Math.min(1.1, rel));
        euler.set(-0.1, s.yaw + rel, 0); qh.setFromEuler(euler);
        mtx.compose(pos.set(s.x + v.x, baseY + 0.4, s.z + v.z), qh, one); headIM.setMatrixAt(i, mtx);
        mtx.compose(pos.set(s.x + v.x, baseY + 0.43, s.z + v.z), qh, n.bald ? zero : one); hairIM.setMatrixAt(i, mtx);
        // arms
        for (var a = 0; a < 2; a++) {
          var sd = a === 0 ? 1 : -1;
          var up = n.cheer > 0 ? 1 : 0;
          var wave = n.cheer > 0 ? Math.sin(t * 14 + n.phase + a) * 0.25 : 0;
          euler.set(up ? 0 : -1.1, s.yaw, sd * (up ? 2.7 + wave : 0.15));
          var qa = U.qa.setFromEuler(euler);
          var off = U.off.set(sd * 0.28, 0.18, -0.12).applyQuaternion(qq);
          var hang = U.hang.set(0, -0.2, 0).applyQuaternion(qa);
          mtx.compose(pos.set(s.x + off.x + hang.x, baseY + off.y + hang.y, s.z + off.z + hang.z), qa, one);
          armIM.setMatrixAt(i * 2 + a, mtx);
        }
      }
      torsoIM.instanceMatrix.needsUpdate = true; headIM.instanceMatrix.needsUpdate = true;
      hairIM.instanceMatrix.needsUpdate = true; armIM.instanceMatrix.needsUpdate = true;
    };

    st.cheer = function (power, x) {
      for (var i = 0; i < npcs.length; i++) {
        var n = npcs[i];
        var near = 1 - Math.min(1, Math.abs(n.seat.x - (x || 0)) / 22);
        if (Math.random() < power * (0.35 + 0.65 * near)) n.cheer = Math.max(n.cheer, 0.6 + Math.random() * 0.9 * power);
      }
    };

    var lastVote = '';
    st.setVotes = function (p1Name, p1Ratio, p2Name, p2Ratio, label) {
      var forV = Math.round(60 * Math.max(0, p1Ratio) + 60 * (1 - Math.max(0, p2Ratio)));
      forV = Math.max(0, Math.min(120, forV));
      var key = forV + p1Name + p2Name + (label || '');
      if (key === lastVote) return; lastVote = key;
      var against = 120 - forV;
      st.boards.forEach(function (b) {
        var ctx = b.tex.userData.ctx, w = 512, h = 256;
        ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#16233a'; ctx.fillRect(0, 0, w, 48);
        ctx.font = 'bold 28px Rubik, Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd166'; ctx.fillText(label || 'MOTION: WHO RUNS THE CHAMBER?', w / 2, 34);
        var leftName = b.side < 0 ? p1Name : p2Name, rightName = b.side < 0 ? p2Name : p1Name;
        var lv = b.side < 0 ? forV : against, rv = 120 - lv;
        ctx.font = 'bold 30px Rubik, Arial, sans-serif';
        ctx.fillStyle = '#7fb2ff'; ctx.fillText(leftName, w * 0.27, 96);
        ctx.fillStyle = '#ff8a8a'; ctx.fillText(rightName, w * 0.73, 96);
        ctx.font = 'bold 92px Rubik, Arial, sans-serif';
        ctx.fillStyle = '#ffffff'; ctx.fillText(String(lv), w * 0.27, 190); ctx.fillText(String(rv), w * 0.73, 190);
        ctx.fillStyle = '#2a3a55'; ctx.fillRect(30, 214, w - 60, 18);
        ctx.fillStyle = '#3d7bff'; ctx.fillRect(30, 214, (w - 60) * lv / 120, 18);
        ctx.fillStyle = '#ff5a5a'; ctx.fillRect(30 + (w - 60) * lv / 120, 214, (w - 60) * rv / 120, 18);
        ctx.fillStyle = '#ffd166'; ctx.fillRect(w / 2 - 2, 208, 4, 30);
        b.tex.needsUpdate = true;
      });
    };
    st.setVotes('—', 1, '—', 1, 'KNESSET COMBAT 26\'');

    st.setMode = function (mode) {
      st.mode = mode;
      if (mode === 'night') {
        st.hemi.intensity = 0.16; st.hemi.color.set('#8aa2ff'); st.key.intensity = 0.12; st.rim.intensity = 0.75; st.rim.color.set('#6f8cff');
        st.spot.intensity = 2.6; st.spot.angle = 0.36; st.spot.penumbra = 0.55; scene.background.set('#05070e'); scene.fog.color.set('#05070e'); st.lampMat.color.set('#7a6440');
      } else {
        st.hemi.intensity = 0.75; st.hemi.color.set('#fff4e0'); st.key.intensity = 1.05; st.rim.intensity = 0.45; st.rim.color.set('#9cc4ff');
        st.spot.intensity = 0; scene.background.set('#1c2433'); scene.fog.color.set('#1c2433'); st.lampMat.color.set('#fff3d6');
      }
    };
    st.followShadow = function (x) {
      st.key.position.set(x - 5, 14, 10); st.key.target.position.set(x, 0, 0);
      st.spot.position.set(x, 12, 5); st.spot.target.position.set(x, 0.5, 0);
    };
    return st;
  };
})();
