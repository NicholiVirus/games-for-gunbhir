// In-page balance simulator: CPU vs CPU best-of-3 matches (meter carries between rounds, Survivor once per match), no rendering
window.SIM = function (aId, bId, matches, skill) {
  var G = KC.Game, out = { a: aId, b: bId, wins: 0, losses: 0, draws: 0, mw: 0, ml: 0, frames: 0, kos: 0, dmgDealt: 0, dmgTaken: 0, supers: 0 };
  for (var side = 0; side < 2; side++) {
    var chars = side === 0 ? [aId, bId] : [bId, aId], me = side;
    G.startMatch({ mode: 'versus', chars: [KC.rosterById[chars[0]], KC.rosterById[chars[1]]], skins: [null, null], ai: ['hard', 'hard'] });
    var m = G.match; KC.HUD.hideVs();
    for (var k = 0; k < matches / 2; k++) {
      m.f.forEach(function (f) { f.meter = 0; f.survived = false; });
      var rw = [0, 0], guard = 0;
      while (rw[0] < 2 && rw[1] < 2 && guard++ < 5) {
        m.startRound(); m.setPhase('fight'); m.timeLeft = 99; m.timerFrames = 0; m.hitstop = 0; m.superFreeze = 0; m.timeScale = 1;
        m.result.supers = [0, 0];
        G.ai = [new KC.AI(m.f[0], 'hard', skill), new KC.AI(m.f[1], 'hard', skill)];
        m.paused = false;
        var n = 0;
        while (m.phase === 'fight' && n < 6200) { m.tick(); n++; }
        m.paused = true;
        var A = m.f[me], B = m.f[1 - me];
        var ra = A.health / A.maxHealth, rb = B.health / B.maxHealth;
        if (ra > rb) { out.wins++; rw[me]++; } else if (rb > ra) { out.losses++; rw[1 - me]++; } else { out.draws++; rw[0]++; rw[1]++; }
        if (A.health <= 0 || B.health <= 0) out.kos++;
        out.frames += n;
        out.dmgDealt += B.maxHealth - B.health; out.dmgTaken += A.maxHealth - A.health;
        out.supers += m.result.supers[me];
      }
      if (rw[me] > rw[1 - me]) out.mw++; else if (rw[me] < rw[1 - me]) out.ml++;
    }
  }
  return out;
};
