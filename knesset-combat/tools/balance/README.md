# Balance simulator

Runs CPU-vs-CPU best-of-3 matches between every pair of fighters, headless and without rendering. It reports each fighter's win rate overall and against its own rarity.

## Run it
❶ Start 4 shards in parallel, one per CPU core. A full run at 8 matches per pair takes about 4–8 minutes:
```
for k in 0 1 2 3; do node sim.js --skill 0.7 --matches 8 --shard $k/4 --out results-$k.json & done; wait
```
❷ Print the report:
```
node report.js results-*.json
```

## Options
- **`--skill`:** CPU skill from 0 to 1. The 2026 balance pass averaged 0.7 and 0.4.
- **`--matches`:** matches per pairing, split evenly between both sides of the stage.

## Notes
- Needs Playwright with Chromium.
- Per-fighter tuning lives in `js/roster.js`: `stats` (power, defense, speed, jump, projSpeed, hp), `special.dmg`, `special2.dmg` and `super.mult`.
