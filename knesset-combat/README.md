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
| Ability 1 · Special | `R` | `O` or `Num4` |
| Ability 2 · Down-Special (Epic and Legendary) | `S` + `R` | `↓` + `O` |
| Super (Rare and up, meter full) | `T` | `P` or `Num5` |

- **Block:** hold away from your opponent. Down + away blocks sweeps; jump-ins must be blocked standing.
- **Gamepads:** pad 1 = P1, pad 2 = P2. Stick or D-pad to move, A punch, B kick, X special (hold down for Ability 2), Y super.
- `Esc` pauses, `M` toggles music.
- In 1-player modes, the solo player can use either side of the keyboard.

## Modes

- **Election Campaign:** arcade ladder vs 5 CPU rivals, then the fictional final boss. Clearing it pays 250 bonus coins.
- **Versus:** 2 players, one keyboard. Coins go to the shared wallet.
- **Vs CPU:** Easy / Normal / Hard. Harder pays more.
- **Shop:** recruit fighters and buy gold skins with coins.

## Rarity and abilities

| Rarity | Abilities | Perk | Price |
|---|---|---|---|
| Common | 1 · Special | +8% damage | 100 coins |
| Rare | 2 · Special + Super | +4% damage | 200 coins |
| Epic | 3 · Special + Down-Special + Super | — | 400 coins |
| Legendary | 3 · Special + Down-Special + Super | unique passive | 600 coins (The Speaker: 800) |

Down-Special types:
- **Uppercut:** a rising anti-air that's briefly invulnerable.
- **Counter:** a parry stance that strikes back if hit.
- **A second projectile or charge.**

Legendary passives:
- **Survivor:** survive one KO blow per match.
- **Iron Will:** take 12% less damage.
- **Momentum:** the Super meter fills 35% faster.
- **Filibuster:** slowly regain health after 2 seconds without being hit, up to 60%.

## Coins and unlocking

You start with **David Ben-Gurion**, Israel's first Prime Minister (Rare). Every match pays coins:

| Source | Coins |
|---|---|
| Playing a match | 20 |
| Each round won | 15 |
| Winning the match | 30 |
| Each Perfect round | 20 |
| Super finish | 15 |
| CPU win bonus | 10 / 25 / 45 (Easy / Normal / Hard) |
| Campaign | 20 per stop, 250 for clearing it |

- A normal 2–0 win vs CPU pays about 100 coins, and a loss still pays 20–35.
- Spend coins in the **Shop**, or buy a locked fighter straight from the select screen by pressing pick twice.
- **Election Night Gold** skin: win 3 matches with a fighter, or buy it for 150 coins.

Progress saves in your browser (`localStorage`). Settings → Reset Progress wipes it.

## The roster (22)

| Fighter | Rarity | Special | Down-Special | Super | Passive |
|---|---|---|---|---|---|
| David Ben-Gurion (starter) | Rare | Declaration Scroll | — | Beach Headstand Cyclone | — |
| Moshe Sharett | Common | Diplomatic Cable | — | — | — |
| Levi Eshkol | Rare | Water Carrier | — | National Water Wave | — |
| Yigal Allon | Common | Palmach Dash | — | — | — |
| Golda Meir | Legendary | Handbag Hurl | Iron Retort (counter) | Kitchen Cabinet | Iron Will |
| Yitzhak Rabin | Epic | Chief of Staff Charge | Olive Branch | Peace Prize Beam | — |
| Menachem Begin | Epic | Fiery Oration | Point of Order (counter) | Thunderous Speech | — |
| Yitzhak Shamir | Rare | Stalwart Shove | — | Immovable Shockwave | — |
| Shimon Peres | Epic | Bright Idea | Visionary Leap (uppercut) | Startup Nation Storm | — |
| Benjamin Netanyahu | Legendary | Cartoon Bomb | Comeback Uppercut | The Red Line | Survivor |
| Ehud Barak | Epic | Commando Dash | Commando Flip Kick (uppercut) | Grand Piano Finale | — |
| Ariel Sharon | Legendary | Bulldozer Charge | Bulldozer Block (counter) | The Bulldozer | Momentum |
| Ehud Olmert | Rare | Municipal Memo | — | Jerusalem Light Rail | — |
| Naftali Bennett | Epic | Cyber Byte | Startup Sprint | Unicorn Exit | — |
| Yair Lapid | Rare | Breaking News | — | Prime Time Special | — |
| Benny Gantz | Common | Blue & White Banner | — | — | — |
| Gadi Eisenkot | Rare | Chief's Advance | — | Strategic Barrage | — |
| Avigdor Liberman | Rare | Kingmaker Crown | — | Coalition Crusher | — |
| Yair Golan | Common | Rally Flag | — | — | — |
| Tzipi Livni | Common | Negotiation Briefcase | — | — | — |
| Isaac Herzog | Common | Presidential Seal | — | — | — |
| The Speaker (fictional boss) | Legendary | Order! Order! | Gavel Uppercut | Session Adjourned | Filibuster |

## Tech

- `three.js` r149 (vendored in `lib/`, MIT) — no build step, plain `<script>` tags.
- Every model, prop and the chamber are generated in code (`js/models.js`, `js/stage.js`).
  All 120 seats are there, and the Members react to big hits.
- Audio is synthesized with WebAudio. The original music loops are in E Phrygian-dominant.
  The announcer uses the browser's speech synthesis.
- 60 Hz fixed-step fight logic with hitstop, frame data, chains, blocking, knockdowns, projectiles and supers (`js/fight.js`).

| File | Purpose |
|---|---|
| `js/roster.js` | Fighters, looks, stats, rarity, abilities, prices and coin payouts |
| `js/models.js` | Procedural low-poly characters, props and pose library |
| `js/stage.js` | Knesset plenum: dais, emblem, flags, live vote boards, 120 seats and MKs |
| `js/fight.js` | Fighter state machine, hit detection, hazards and supers, rounds, camera |
| `js/ai.js` | CPU opponent (Easy, Normal, Hard and Boss) |
| `js/audio.js` | Synthesized SFX, music and announcer |
| `js/game.js` | Menus, select screen, Shop, campaign, results, coins, save, HUD, input |

Parody game. Characters are stylized caricatures of public figures, presented for fun.
