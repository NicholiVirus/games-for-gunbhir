// usage: node report.js results-0.json results-1.json ...   -> per-fighter and per-rarity win rates
const fs = require('fs'), path = require('path');
global.window = global; eval(fs.readFileSync(path.resolve(__dirname, '../../js/roster.js'), 'utf8'));
let res = []; process.argv.slice(2).forEach(f => { res = res.concat(JSON.parse(fs.readFileSync(f))); });
const S = {}, rar = id => KC.rosterById[id].rarity;
res.forEach(r => { const n = r.wins + r.losses + r.draws;
  [[r.a, r.b, r.wins + r.draws / 2], [r.b, r.a, r.losses + r.draws / 2]].forEach(([x, y, w]) => {
    const s = S[x] = S[x] || { w: 0, n: 0, sw: 0, sn: 0 }; s.w += w; s.n += n; if (rar(x) === rar(y)) { s.sw += w; s.sn += n; } }); });
const T = {};
console.log('fighter       rarity      win%  vs same rarity');
KC.ROSTER.forEach(c => { const s = S[c.id]; if (!s) return; const p = 100 * s.w / s.n; (T[c.rarity] = T[c.rarity] || []).push(p);
  console.log(c.id.padEnd(13), c.rarity.padEnd(10), p.toFixed(0).padStart(4) + '%', s.sn ? (100 * s.sw / s.sn).toFixed(0).padStart(6) + '%' : '     -'); });
console.log('\nrarity      avg   spread');
KC.RARITY_ORDER.forEach(r => { const a = T[r]; if (a) console.log(r.padEnd(10), (a.reduce((x, y) => x + y) / a.length).toFixed(1).padStart(5) + '%', Math.min(...a).toFixed(0) + '-' + Math.max(...a).toFixed(0) + '%'); });
