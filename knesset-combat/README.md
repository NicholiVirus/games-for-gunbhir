# Knesset Combat 26'

A 3D, same-keyboard, player-vs-player fighting game set inside the Knesset plenum.
Pick an Israeli Prime Minister (or a contender for the job), step into the chamber and
settle the motion the old-fashioned way. Low-poly, cel-shaded 3D in the browser — no install.

## Play

- **Local:** open `index.html` in Chrome, Edge, Firefox or Safari. Double-clicking works; no server needed.
- **GitHub Pages:** enable Pages for the repository and open `/knesset-combat/`.
- **Attract mode:** open `index.html#demo` to watch two random CPUs fight on Hard.

## Controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move / Jump / Crouch | `A` `D` / `W` / `S` | `←` `→` / `↑` / `↓` |
| Punch | `F` | `K` or `Num1` |
| Kick | `G` | `L` or `Num2` |
| Special | `R` | `O` or `Num4` |
| Super (meter full) | `T` | `P` or `Num5` |

- **Block:** hold away from your opponent. Down + away blocks sweeps; jump-ins must be blocked standing.
- **Gamepads:** pad 1 = P1, pad 2 = P2. Stick or D-pad to move, A punch, B kick, X special, Y super.
- `Esc` pauses, `M` toggles music.
- In 1-player modes, the solo player can use either side of the keyboard.

## Modes

- **Election Campaign:** arcade ladder vs 5 CPU rivals, then the secret final boss.
- **Versus:** 2 players, one keyboard.
- **Vs CPU:** Easy / Normal / Hard.
- **Cabinet Room:** every fighter, unlock requirements and skin progress.

## Unlocking fighters and skins

You start as **David Ben-Gurion**, Israel's first Prime Minister. Every match pays out **Mandates**
(session attended, rounds won, wins, perfects, super finishes, CPU difficulty bonus).

- **Prime Ministers** unlock in historical order as your total Mandates grow
  (Sharett at 8, Eshkol at 20 … Lapid at 285). A normal win vs CPU pays about 20.
- **Contenders** have challenges:
  - Gantz: win 3 matches vs CPU.
  - Eisenkot: beat the CPU on Hard.
  - Liberman: land 5 Supers.
  - Golan: win a Perfect round.
- **The Speaker** (fictional final boss): clear the Election Campaign.
- **Election Night Gold** skin: win 3 matches with a fighter. Toggle it on the select screen with `R` / `O`.

Progress saves in your browser (`localStorage`). Settings → Reset Progress wipes it.

## The roster

| # | Fighter | Special | Super |
|---|---|---|---|
| 1 | David Ben-Gurion | Declaration Scroll | Beach Headstand Cyclone |
| 2 | Moshe Sharett | Diplomatic Cable | Foreign Office Flurry |
| 3 | Levi Eshkol | Water Carrier | National Water Wave |
| 4 | Golda Meir | Handbag Hurl | Kitchen Cabinet |
| 5 | Yitzhak Rabin | Chief of Staff Charge | Peace Prize Beam |
| 6 | Menachem Begin | Fiery Oration | Thunderous Speech |
| 7 | Yitzhak Shamir | Stalwart Shove | Immovable Shockwave |
| 8 | Shimon Peres | Bright Idea | Startup Nation Storm |
| 9 | Benjamin Netanyahu | Cartoon Bomb | The Red Line |
| 10 | Ehud Barak | Commando Dash | Grand Piano Finale |
| 11 | Ariel Sharon | Bulldozer Charge | The Bulldozer |
| 12 | Ehud Olmert | Municipal Memo | Jerusalem Light Rail |
| 13 | Naftali Bennett | Cyber Byte | Unicorn Exit |
| 14 | Yair Lapid | Breaking News | Prime Time Special |
| — | Benny Gantz | Blue & White Banner | Rotation Agreement |
| — | Gadi Eisenkot | Chief's Advance | Strategic Barrage |
| — | Avigdor Liberman | Kingmaker Crown | Coalition Crusher |
| — | Yair Golan | Rally Flag | Rally Wave |
| — | The Speaker | Order! Order! | Session Adjourned |

## Tech

- `three.js` r149 (vendored in `lib/`, MIT) — no build step, plain `<script>` tags.
- Every model, prop and the chamber are generated in code (`js/models.js`, `js/stage.js`).
  All 120 seats are there, and the Members react to big hits.
- Audio is synthesized with WebAudio. The original music loops are in E Phrygian-dominant.
  The announcer uses the browser's speech synthesis.
- 60 Hz fixed-step fight logic with hitstop, frame data, chains, blocking, knockdowns, projectiles and supers (`js/fight.js`).

| File | Purpose |
|---|---|
| `js/roster.js` | Fighters, looks, stats, moves, unlock rules |
| `js/models.js` | Procedural low-poly characters, props and pose library |
| `js/stage.js` | Knesset plenum: dais, emblem, flags, live vote boards, 120 seats and MKs |
| `js/fight.js` | Fighter state machine, hit detection, hazards and supers, rounds, camera |
| `js/ai.js` | CPU opponent (Easy, Normal, Hard and Boss) |
| `js/audio.js` | Synthesized SFX, music and announcer |
| `js/game.js` | Menus, select screen, campaign, results, unlocks, save, HUD, input |

Parody game. Characters are stylized caricatures of public figures, presented for fun.
