# Bug-test suite

Automated playthroughs in headless Chromium (Playwright). Each check prints PASS or FAIL, and any console error inside a check fails it.

| File | Covers |
|---|---|
| `partA.js` | First launch and welcome prompt, every main-menu item, Versus picks, pause/resume, results, quitting |
| `partB.js` | Campaign levels, chest drops, the 5-second slot roll (not skippable), level 250 ending, Election Arcade, Chest Store, free and daily chests |
| `partC.js` | Shop shards, upgrades, gold skins, compare, Wild Shards, chamber skins, settings, Reset Save, save persistence, corrupted save |
| `partD.js` | Every move of all 51 fighters (normals, specials, Supers, dashes), scene-object leaks, the full 11-step tutorial |
| `partE.js` | Layout at 1280×720, 1024×640, 844×390 and 390×844. Screenshots go to `out/`. |

## Run
Run one part at a time. Running several in parallel slows the software renderer enough to cause timeouts.
```
node partA.js
```
