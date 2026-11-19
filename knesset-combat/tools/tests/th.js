
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
    };