# Knesset Combat 26'

A 3D, same-keyboard, player-vs-player fighting game set inside the Knesset plenum.
Pick an Israeli Prime Minister (or a contender for the job), step into the chamber and
settle the motion the old-fashioned way. Low-poly, cel-shaded 3D in the browser — no install.

## Play

- **Local:** open `index.html` in Chrome, Edge, Firefox or Safari. Double-clicking works; no server needed.
- **GitHub Pages:** enable Pages for the repository and open `/knesset-combat/`.
- **Attract mode:** open `index.html#demo` to watch two random CPUs fight on Hard.

## New in this update

- **Sky beams:** every beam Super now comes down from the sky. A reticle locks onto your opponent, flashes, then the beam crashes down. Dash out from under it to dodge. Used by Saar, Arens, Tommy Lapid, Yair Lapid, Ezer Weizman, Chaim Herzog, Rabin and Netanyahu.

- **Balance pass on all 51 fighters:** tuned and retested over 6 rounds of simulated CPU-vs-CPU matches. Fighters of the same rarity are now within a few points of each other, and Netanyahu is finally the strongest fighter. Full patch notes are in the Balance pass section below.

- **51 fighters**, sorted by rarity on the select screen and in the Shop.
  - **New fighters:** Yitzhak Ben-Zvi, Zalman Shazar, Benny Begin, Yossi Sarid, Shelly Yachimovich, Tommy Lapid, David Levy, Dalia Itzik, Chaim Herzog and Pnina Tamano-Shata, plus the Elite fighters Natan Sharansky and Orna Barbivai.
- **Elite rarity (orange):** sits between Epic and Mythic. It gets 3 abilities and +40 HP. Rabin and Peres moved up to Elite.
- **Shards:** Commons need 10. Single shards in the Shop cost 50% more.
- **✦ Wild Shards:** every chest has a 1% chance to drop one. A Wild Shard unlocks any locked fighter of its rarity (use it in the Shop).
- **Tutorial:** an 11-step, hands-on lesson: move, jump, crouch, dash, punch, kick, combo, block, Special, Down-Special and Super. It's offered on first launch, and finishing it once pays 300 coins plus a Silver chest.
- **🏛️ Chamber skins:** redecorate the plenum. Skins apply in every mode, and you can preview them behind the menu before buying.

 | Skin | Price (coins) | What it adds |
  |---|---|---|
 | Hanukkah | 1,200 | Lit hanukkiot, blue-and-white string lights, spinning dreidels |
 | Independence Day | 1,000 | Flag garlands and fireworks |
 | Purim | 900 | Masks, balloons and confetti |
 | Sukkot | 900 | A palm-frond roof and hanging fruit |

- **🗳️ Daily free chest:** one Silver chest per day.
- **⚖ Compare fighters:** in the Shop, press C (or the ⚖ button) on two fighters. You'll see rarity, rank, health, power, defense, speed, jump, ammo and every ability side by side, with the better value in green.
- **Melee:** every fighter has full melee (punch, kick, sweep and jump attacks), and it's now listed on every fighter panel.
- **Bigger, clearer cooldowns** under each Super meter:
  - an **AMMO** row with pips and a count, turning into a **RELOADING** bar with a countdown
  - a **GUARD** bar showing how much of your 2.5 s block is left, and a **GUARD BROKEN** countdown
  - **SUPER %** on the meter, and **SUPER READY!** when it's full

## Controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move / Jump / Crouch | `A` `D` / `W` / `S` | `J` `L` / `I` / `K` (arrows also work) |
| Punch | `F` | `U` or `Num1` |
| Kick | `G` | `;` or `Num2` |
| Ability 1 · Special | `R` | `P` or `Num4` |
| Ability 2 · Down-Special (Epic and Legendary) | `S` + `R` | `K` + `P` |
| Super (Rare and up, meter full) | `Q` (left of W) | `O` (right of I) or `Num5` |
| Dash / Backdash | double-tap `D` / `A` | double-tap `J` / `L` (or arrows) |

- **Block:** hold away from your opponent. Down + away blocks sweeps; jump-ins must be blocked standing.
- **Guard break:** you can hold block for only 2.5 seconds at a time. Past that, your guard breaks and you're stunned.
- **Dashing:** every fighter can dash.
  - **Forward dash:** covers about 2 m in a quarter second. From its 5th frame you can cancel it into a punch, kick, Special or Super (a dash-in attack), or into a running jump.
  - **Backdash:** hops about 1.8 m back and is invincible for its first 7 frames, so it slips through attacks and projectiles, but its recovery can be punished.
  - **Air dash:** once per jump, double-tap in the air to hover-dash forward or back.
  - A short cooldown (0.2 s) stops endless dash chains.
- **Free chest:** a free Wooden chest (one tier below the daily Silver chest, 3 upgrade taps) every 90 minutes from the main menu. The menu shows READY or a countdown.
- **CPU zoning:** CPUs with projectiles fire them much more often from mid-range. After getting caught in a combo (2+ hits), a CPU backdashes out and keeps its distance for 1–2 s, throwing projectiles, more reliably at higher skill.
  - **Yigal Allon** has a nerfed dash: 25% shorter, cancels into attacks 4 frames later, and a 0.43 s cooldown. CPU opponents dash in, dash-punch, backdash out of pressure and dash to punish, more often at higher skill.
- **Super meter:** it fills from damage you deal (about 330 damage fills it). Blocked hits give the attacker nothing.
- **CPU skill:** in the campaign it climbs every level, from 30% at level 1 (with a gentle early curve) to about 95% at level 250. Boss levels add a little extra. Smarter CPUs react faster, block better, punish missed attacks and let go of block before their guard breaks.
- **Gamepads:** pad 1 = P1, pad 2 = P2. Stick or D-pad to move, A punch, B kick, X special (hold down for Ability 2), Y super, double-tap the stick to dash.
- `Esc` or the ❚❚ button pauses, and `M` toggles music.
- **Mouse:** everything is clickable.
  - Select screen: left-click picks for P1, right-click for P2, and clicking a highlighted fighter again picks or recruits them.
  - Every screen has a ◂ BACK button.
  - Clicking skips intros.
- In 1-player modes, the solo player can use either side of the keyboard.

## Modes

- **Campaign · 250 levels:** fixed CPU rivals that get tougher.
  - Levels 1–30 are Easy, 31–100 Normal, 101–180 Hard and 181–250 Boss.
  - Opponent rarity climbs every 50 levels: Common (1–50), Rare (51–100), Super Rare (101–150), Epic (151–200) and Elite (201–250).
  - Every 10th level is a boss one rarity higher, and every 50th level is two rarities higher.
  - **Level 250 is the Legendary final boss. Beat it to win the game and become Prime Minister.**
  - Opponents also gain strength and upgrade ranks as you climb.
  - The first clear of a level pays 25 + 2 × level coins (+100 on boss levels); replays pay 30%.

## Chest Store

| Chest | Upgrade taps | Price (coins) |
|---|---|---|
| Wooden Ballot Box | 3 | 150 |
| Silver Ballot Box | 3 | 300 |
| Lucky Silver Box | 5 | 450 |
| Golden Ballot Box | 3 | 550 |
| Super Lucky Golden Box | 6 | 850 |
| Epic Ballot Box | 3 | 1,000 |
| Jackpot Epic Box | 8 | 1,600 |

Every chest starts with 3 upgrade taps. Each tap has a **45%** chance to upgrade a bought chest, or a 30% chance for a campaign chest. Lucky chests get extra taps.

## Chests and shards

- **Drops:** every 2nd campaign win drops a ballot-box chest, and boss levels always drop one. Every 10th win gives a **bonus chest** that's 2 tiers better with 5 upgrade taps.
- **Tiers:** Wooden → Silver → Golden → Epic → Mythic → Legendary. The base tier rises every 80 levels, up to Epic. Mythic and Legendary boxes only come from lucky taps.
- **Tap to upgrade:** tap a chest 3 times before opening it. Each tap has a 30% chance to upgrade it one tier, and the chest then opens by itself.
- **Auto-open:** after a chest drops, the results screen jumps to the chest automatically.
- **What's inside:** coins (Wooden gives 10–25, Legendary gives 100–200) plus **shards** of leaders you don't own yet. Better chests favor rarer leaders.
- **Recruiting with shards:** collect 10 (Common), 15 (Rare), 17 (Super Rare), 20 (Epic), 22 (Elite), 25 (Mythic) or 30 (Legendary) shards to recruit a leader for free.
  - You can buy single shards in the Shop with `B`. They cost a premium: about 6× more per shard than recruiting outright.
- **Super Reflect:** Abba Eban's Diplomatic Immunity super raises a mirror shield for 4 seconds that bounces enemy projectiles back faster, for 1.5× damage.
- **Reset save:** Settings → Reset Save, then confirm.
  - Shards of leaders you already own become coins.
- **Projectile ammo:** 3 shots, +1 per upgrade rank (max 6). Mash them all, then they reload together once you're empty, taking 1 second per shot. The HUD shows ammo pips and the reload bar.
- **Election Arcade:** quick ladder vs 5 random CPU rivals, then the fictional final boss. Clearing it pays 250 bonus coins plus a Golden chest.
- **Versus:** 2 players, one keyboard. Coins go to the shared wallet.
- **🎁 Chest Store:** buy chests with coins. Each one spins for coins and shards, and it's the main way to unlock fighters.
- **Shop:** buy single shards (expensive), upgrade fighters, and buy gold skins with coins.
  - Filter tabs: All, Owned, Locked, or any single rarity. Click a tab or press Q/E.

## Upgrades

- Every fighter you own can be upgraded from **Rank 0 to Rank 5** in the Shop, with Enter/F or a click.
- Each rank adds **+5% damage, +5% defense and +50 HP**, in every mode.
- Rank N costs 80 × N coins × the rarity multiplier: Common ×1, Rare ×1.5, Epic ×2, Legendary ×2.5.
- Example: a Legendary fighter's Rank 5 costs 1,000 coins.
- **Rank 5 unlocks Combo Mastery:**
  - chain any punch or kick into any other, for 4-hit strings
  - cancel specials and charges into your Super
  - deal +15% damage from the 4th hit of a combo

## Rarity and abilities

| Rarity | Abilities | Perk | Price |
|---|---|---|---|
| Common | 1 · Special | +14% damage, +50 HP | 100 coins |
| Rare | 2 · Special + Super | — | 200 coins |
| Super Rare | 2 · Special + Super | +3% damage, +20 HP | 300 coins |
| Epic | 3 · Special + Down-Special + Super | — | 400 coins |
| Elite | 3 · Special + Down-Special + Super | +40 HP | 450 coins |
| Mythic | 3 · Special + Down-Special + Super | unique passive | 500 coins |
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

## Balance pass

Every fighter was retuned using a CPU-vs-CPU simulator:

- **Method:** every fighter fought every other fighter in best-of-3 matches, covering all 1,275 pairings.
- **Iteration:** 6 rounds of tune-and-retest at normal CPU skill (70%).
- **Skill levels:** the last two rounds also ran at beginner skill (40%), and the final numbers average both, because the campaign spans both. That's about 25,000 matches for the final check alone.

**Goals:**
- Fighters of the same rarity should be about even with each other.
- Each rarity should be a modest step above the one below. A Legendary should beat a Common more often, not every time.

### System changes (affect everyone)
- **Rarity perks:**
  - Common: +8% damage → **+14% damage and +50 HP** (they have no Super, so they needed more help).
  - Rare: +4% damage → **none**.
  - Super Rare: +2% damage → **+3% damage and +20 HP**, so it now sits above Rare.
  - Elite: +60 HP → **+40 HP**.
- **Rush specials are punishable when blocked.** A blocked charge used to recover almost as fast as the blocker (about 2 frames apart). Now the charger is stuck about 16 frames longer, enough for a punish.
- **New tuning knobs per fighter:** Special and Down-Special damage, Super damage and bonus HP.
- **Beam Supers come from the sky** (added after the pass): a targeting reticle chases the opponent for half a second, locks on and flashes, then the beam crashes down on that spot and slowly drifts after them. Because it can now be dodged, base beam damage went up 11% and each beam fighter's Super was retuned. The simulator puts all 8 within about 2.5 points of their earlier win rates.

### Results (average win rate across all matchups)

| Rarity | Avg win rate before | After | Spread after |
|---|---|---|---|
| Common | 31% | 40% | 39–42% |
| Rare | 53% | 46% | 44–48% |
| Super Rare | 55% | 52% | 48–54% |
| Epic | 55% | 56% | 53–58% |
| Elite | 67% | 59% | 58–60% |
| Mythic | 71% | 65% | 62–67% |
| Legendary | 59% | 70% | 70–70% |
Netanyahu, the only Legendary, was **weaker than the average Elite or Mythic** before this pass. Now he's the strongest fighter, as a Legendary should be.

### Every fighter

The "Power" and "Defense" values are base stats; rarity perks stack on top. Win rates are from the simulator, averaged over both CPU skill levels; the "after" numbers also include the system changes above.

| Fighter | Rarity | Changes | Sim win rate (before → after) |
|---|---|---|---|
| Moshe Sharett | Common | Power 0.95 → 1.03 · Defense 0.95 → 0.98 · Projectile speed 1.00 → 1.10 | 26% → 41% |
| Yigal Allon | Common | Special (Palmach Dash) 95 → 86 dmg | 42% → 39% |
| Benny Gantz | Common | Power 1.02 → 1.00 · Defense 1.05 → 1.10 · +10 HP | 28% → 41% |
| Yair Golan | Common | Power 1.00 → 1.05 · Defense 1.00 → 1.01 · Projectile speed 1.00 → 1.10 | 27% → 41% |
| Tzipi Livni | Common | Special (Negotiation Briefcase) 82 → 80 dmg | 34% → 42% |
| Isaac Herzog | Common | Power 0.98 → 1.00 | 31% → 40% |
| Ayelet Shaked | Common | Power 0.98 → 0.96 · Jump 1.06 → 1.10 · Projectile speed 1.00 → 0.95 · Special (Judicial Memo) 82 → 84 dmg | 34% → 39% |
| Yitzhak Navon | Common | Power 1.00 → 1.04 · Defense 1.00 → 1.04 | 28% → 41% |
| Shulamit Aloni | Common | Power 1.00 → 0.99 · Projectile speed 1.00 → 1.08 · Special (Rights Banner) 82 → 80 dmg | 33% → 39% |
| Merav Michaeli | Common | Power 1.00 → 1.03 · +35 HP | 28% → 41% |
| Moshe Kahlon | Common | Power 1.02 → 1.00 · Defense 1.00 → 1.03 · +40 HP | 28% → 42% |
| Yitzhak Ben-Zvi | Common | Power 1.00 → 1.01 · Defense 1.02 → 1.05 | 32% → 41% |
| Zalman Shazar | Common | Speed 1.02 → 1.04 · Special (Poet's Verse) 82 → 84 dmg | 28% → 41% |
| Benny Begin | Common | Power 1.02 → 1.01 · Projectile speed 1.00 → 0.90 · Special (Rock Sample) 82 → 92 dmg | 30% → 42% |
| Yossi Sarid | Common | Power 1.00 → 1.01 · Defense 1.00 → 1.04 · +20 HP | 27% → 39% |
| Shelly Yachimovich | Common | Power 1.00 → 0.99 · Speed 1.08 → 1.05 · Projectile speed 1.00 → 1.10 | 34% → 39% |
| David Ben-Gurion | Rare | Power 1.00 → 0.99 · Super (Beach Headstand Cyclone) -8% dmg | 51% → 47% |
| Gadi Eisenkot | Rare | Speed 1.08 → 1.10 · Special (Chief's Advance) 95 → 92 dmg | 56% → 47% |
| Chaim Weizmann | Rare | Power 1.02 → 0.94 | 55% → 45% |
| Abba Eban | Rare | +20 HP · Special (Silver Tongue) 82 → 86 dmg | 45% → 48% |
| Gideon Sa'ar | Rare | Power 1.00 → 0.95 · Super (Breakaway Beam) +5% dmg | 51% → 46% |
| Mansour Abbas | Rare | Defense 1.06 → 0.94 | 56% → 45% |
| Moshe Arens | Rare | Power 1.02 → 1.03 · Super (Jet Stream) -5% dmg | 52% → 44% |
| Tommy Lapid | Rare | Power 1.08 → 0.98 · Super (Hot Take) +10% dmg | 57% → 46% |
| David Levy | Rare | Power 1.04 → 0.96 | 55% → 47% |
| Dalia Itzik | Rare | Power 1.02 → 0.99 · Defense 1.02 → 0.98 · Super (Session Order) -10% dmg | 57% → 47% |
| Levi Eshkol | Super Rare | Power 1.00 → 0.91 | 56% → 53% |
| Yitzhak Shamir | Super Rare | Power 1.00 → 0.98 · Defense 1.18 → 1.06 · Special (Stalwart Shove) 95 → 86 dmg | 67% → 54% |
| Ehud Olmert | Super Rare | Power 1.00 → 0.97 · Special (Municipal Memo) 82 → 84 dmg | 50% → 52% |
| Yair Lapid | Super Rare | Power 0.98 → 0.97 · Projectile speed 1.00 → 1.10 · Super (Prime Time Special) +5% dmg | 47% → 51% |
| Avigdor Liberman | Super Rare | Power 1.12 → 1.06 · Defense 1.12 → 1.08 · Super (Coalition Crusher) -8% dmg | 57% → 52% |
| Ezer Weizman | Super Rare | Defense 0.96 → 1.00 · Super (Afterburner) -10% dmg | 51% → 51% |
| Reuven Rivlin | Super Rare | Power 1.00 → 0.95 · Defense 1.06 → 1.00 | 54% → 53% |
| Chaim Herzog | Super Rare | Power 1.04 → 0.96 | 55% → 49% |
| Pnina Tamano-Shata | Super Rare | Power 1.00 → 0.90 · Defense 1.00 → 0.96 | 59% → 48% |
| Menachem Begin | Epic | Power 1.00 → 1.01 · Down-Special (Point of Order) 110 → 118 dmg · Super (Thunderous Speech) -8% dmg | 54% → 57% |
| Ehud Barak | Epic | Power 0.95 → 1.01 · Defense 0.92 → 0.97 · Super (Grand Piano Finale) -10% dmg | 55% → 58% |
| Naftali Bennett | Epic | Power 1.00 → 0.88 · Super (Unicorn Exit) -20% dmg | 68% → 56% |
| Yuli Edelstein | Epic | +15 HP | 51% → 54% |
| Amir Peretz | Epic | Power 1.04 → 1.06 | 50% → 53% |
| Yitzhak Rabin | Elite | Power 1.05 → 0.90 · Defense 1.00 → 0.96 · Speed 1.05 → 1.00 · Special (Chief of Staff Charge) 95 → 80 dmg · Super (Peace Prize Beam) -18% dmg | 78% → 58% |
| Shimon Peres | Elite | Power 0.95 → 0.98 · Defense 1.00 → 1.03 | 52% → 59% |
| Natan Sharansky | Elite | Power 1.04 → 1.01 · Defense 1.08 → 0.97 | 67% → 58% |
| Orna Barbivai | Elite | Power 1.06 → 0.93 | 70% → 60% |
| Golda Meir | Mythic | Power 1.10 → 1.00 · Defense 1.08 → 1.00 | 76% → 65% |
| Ariel Sharon | Mythic | Power 1.20 → 1.04 | 74% → 67% |
| Moshe Dayan | Mythic | Power 1.08 → 1.07 · Defense 1.00 → 1.02 · Special (Desert Raid) 95 → 100 dmg | 68% → 66% |
| Yigael Yadin | Mythic | Power 1.06 → 0.95 | 70% → 67% |
| Donald Trump | Mythic | Power 1.10 → 1.02 | 65% → 62% |
| The Speaker | Mythic | Power 1.15 → 1.01 | 72% → 66% |
| Benjamin Netanyahu | Legendary | Power 1.05 → 1.07 · Special (Cartoon Bomb) 82 → 92 dmg · Super (The Red Line) +8% dmg | 59% → 70% |

## Coins and unlocking

You start with **5 free Common fighters**: Moshe Sharett, Yigal Allon, Tzipi Livni, Benny Gantz and Yitzhak Navon. That's enough for you and a friend to play Versus right away. The other 45 fighters, Ben-Gurion included, unlock with shards. Every match pays coins:

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
- **Fighters can't be bought outright.** The only way to recruit one is to collect their shards, from campaign chests or by buying single shards in the Shop.
- **Election Night Gold** skin: win 3 matches with a fighter, or buy it for 150 coins.

Progress saves in your browser (`localStorage`). Settings → Reset Progress wipes it.

## The roster (51)

Legendary (the only one): Benjamin Netanyahu. Mythic: Golda Meir, Ariel Sharon, Moshe Dayan, Yigael Yadin, The Speaker and special guest Donald Trump.

Added in this update: Yigael Yadin (Mythic), Ezer Weizman, Reuven Rivlin, Mansour Abbas, Moshe Arens (Rare), Amir Peretz (Epic, with the Iron Dome reflect super), Yitzhak Navon, Shulamit Aloni, Merav Michaeli and Moshe Kahlon (Common).


New icons: Chaim Weizmann (Rare), Moshe Dayan (Legendary, Battle Rhythm passive), Abba Eban (Common), Yuli Edelstein (Epic), Gideon Sa'ar (Rare), Ayelet Shaked (Common).


| Fighter | Rarity | Special | Down-Special | Super | Passive |
|---|---|---|---|---|---|
| David Ben-Gurion | Rare | Declaration Scroll | — | Beach Headstand Cyclone | — |
| Moshe Sharett (starter) | Common | Diplomatic Cable | — | — | — |
| Levi Eshkol | Rare | Water Carrier | — | National Water Wave | — |
| Yigal Allon (starter) | Common | Palmach Dash | — | — | — |
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
| Benny Gantz (starter) | Common | Blue & White Banner | — | — | — |
| Gadi Eisenkot | Rare | Chief's Advance | — | Strategic Barrage | — |
| Avigdor Liberman | Rare | Kingmaker Crown | — | Coalition Crusher | — |
| Yair Golan | Common | Rally Flag | — | — | — |
| Tzipi Livni (starter) | Common | Negotiation Briefcase | — | — | — |
| Isaac Herzog | Common | Presidential Seal | — | — | — |
| Donald Trump (special guest) | Mythic | Executive Order | The Art of the Deal (counter) | $4 Billion to Israel (money-bag rain) | Rally Energy (faster meter) |
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
