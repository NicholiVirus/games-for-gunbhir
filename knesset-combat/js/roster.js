/* Knesset Combat 26' — fighter roster.
 * Every fighter is built procedurally from the "look" block (low-poly, cel-shaded).
 * unlock types:
 *   start      — available from the first boot
 *   mandates   — unlocks automatically once total Mandates >= value
 *   cpuWins    — win N matches against the CPU
 *   hardWin    — win a match against the CPU on Hard
 *   supers     — land N Supers (any mode)
 *   perfect    — win a round without taking damage
 *   campaign   — clear the Election Campaign
 */
window.KC = window.KC || {};

KC.ROSTER = [
  {
    id: 'bengurion', name: 'David Ben-Gurion', short: 'BEN-GURION', title: 'The Founder',
    group: 'pm', years: '1948–54, 1955–63',
    bio: "Israel's founding Prime Minister. Read the Declaration of Independence in 1948 — and famously did headstands on the beach.",
    unlock: { type: 'start' },
    look: { height: 0.9, girth: 1.12, skin: '#eab892', hair: 'tufts', hairColor: '#f4f4f0', outfit: 'shirt', top: '#cdbf8e', pants: '#5d5240', shirt: '#cdbf8e', tie: null, shoes: '#3b2a1a' },
    stats: { speed: 1.0, power: 1.0, defense: 1.0, jump: 1.0 },
    special: { type: 'projectile', name: 'Declaration Scroll', proj: 'scroll' },
    super: { type: 'spin', name: 'Beach Headstand Cyclone', color: '#ffd166' },
    quote: 'This whole chamber was my idea, you know.',
    victory: 'headstand'
  },
  {
    id: 'sharett', name: 'Moshe Sharett', short: 'SHARETT', title: 'The Diplomat',
    group: 'pm', years: '1954–55',
    bio: 'Second Prime Minister and Israel\'s first Foreign Minister. A polyglot diplomat with a very fast pen.',
    unlock: { type: 'mandates', value: 8 },
    look: { height: 0.98, girth: 1.0, skin: '#e5b48e', hair: 'combed', hairColor: '#2b2118', mustache: true, mustacheColor: '#2b2118', outfit: 'suit', top: '#4a4f57', pants: '#40444b', shirt: '#f2f2f2', tie: '#7a2430', shoes: '#1d1d1d' },
    stats: { speed: 1.12, power: 0.92, defense: 0.95, jump: 1.05 },
    special: { type: 'projectile', name: 'Diplomatic Cable', proj: 'envelope' },
    super: { type: 'flurry', name: 'Foreign Office Flurry', color: '#9ad1ff' },
    quote: 'I have expressed my objection in eleven languages.',
    victory: 'bow'
  },
  {
    id: 'eshkol', name: 'Levi Eshkol', short: 'ESHKOL', title: 'The Builder',
    group: 'pm', years: '1963–69',
    bio: 'Third Prime Minister. Built the national water network before he ever led the country.',
    unlock: { type: 'mandates', value: 20 },
    look: { height: 0.96, girth: 1.08, skin: '#e8b996', hair: 'fringe', hairColor: '#bdbdb8', glasses: 'round', glassesColor: '#2a2a2a', outfit: 'suit', top: '#2f3542', pants: '#2a2f3a', shirt: '#f4f4f4', tie: '#3c5a8a', shoes: '#1d1d1d' },
    stats: { speed: 1.0, power: 1.0, defense: 1.05, jump: 0.95 },
    special: { type: 'projectile', name: 'Water Carrier', proj: 'water' },
    super: { type: 'wave', name: 'National Water Wave', color: '#3fa9f5' },
    quote: 'Stay hydrated. And stay down.',
    victory: 'fist'
  },
  {
    id: 'meir', name: 'Golda Meir', short: 'MEIR', title: 'The Iron Grandmother',
    group: 'pm', years: '1969–74',
    bio: 'Fourth Prime Minister and one of the world\'s first female heads of government. Held her famous "kitchen cabinet" meetings at home.',
    unlock: { type: 'mandates', value: 34 },
    look: { height: 0.94, girth: 1.12, skin: '#e4b58f', hair: 'bun', hairColor: '#a9a7a2', outfit: 'dress', top: '#2d3142', pants: '#2d3142', shirt: '#2d3142', tie: null, shoes: '#1d1d1d', prop: 'handbag', propColor: '#3b2a20' },
    stats: { speed: 0.9, power: 1.12, defense: 1.1, jump: 0.9 },
    special: { type: 'projectile', name: 'Handbag Hurl', proj: 'handbag' },
    super: { type: 'rain', name: 'Kitchen Cabinet', color: '#f7f3e8', obj: 'teacup' },
    quote: 'Sit. Have some tea. You have earned it.',
    victory: 'fist'
  },
  {
    id: 'rabin', name: 'Yitzhak Rabin', short: 'RABIN', title: 'The General',
    group: 'pm', years: '1974–77, 1992–95',
    bio: 'Fifth Prime Minister, twice. Former IDF Chief of Staff and Nobel Peace Prize laureate.',
    unlock: { type: 'mandates', value: 50 },
    look: { height: 1.0, girth: 1.0, skin: '#eab28f', hair: 'parted', hairColor: '#b9a38a', outfit: 'suit', top: '#3e4550', pants: '#373d47', shirt: '#f2f2f2', tie: '#26364f', shoes: '#1d1d1d' },
    stats: { speed: 1.05, power: 1.05, defense: 1.0, jump: 1.0 },
    special: { type: 'rush', name: 'Chief of Staff Charge' },
    super: { type: 'beam', name: 'Peace Prize Beam', color: '#ffd76a' },
    quote: 'Discipline wins wars. And fights.',
    victory: 'salute'
  },
  {
    id: 'begin', name: 'Menachem Begin', short: 'BEGIN', title: 'The Orator',
    group: 'pm', years: '1977–83',
    bio: 'Sixth Prime Minister. A thunderous speaker who signed the peace treaty with Egypt and won the Nobel Peace Prize.',
    unlock: { type: 'mandates', value: 68 },
    look: { height: 0.96, girth: 0.98, skin: '#e6b691', hair: 'fringe', hairColor: '#3a3028', glasses: 'thick', glassesColor: '#151515', outfit: 'suit', top: '#2a2a30', pants: '#26262b', shirt: '#f2f2f2', tie: '#5a1f1f', shoes: '#1d1d1d' },
    stats: { speed: 0.97, power: 1.0, defense: 1.0, jump: 1.0, projSpeed: 1.25 },
    special: { type: 'projectile', name: 'Fiery Oration', proj: 'soundring' },
    super: { type: 'wave', name: 'Thunderous Speech', color: '#ff8a3d' },
    quote: 'I yield the floor. You may stay on it.',
    victory: 'point'
  },
  {
    id: 'shamir', name: 'Yitzhak Shamir', short: 'SHAMIR', title: 'The Stalwart',
    group: 'pm', years: '1983–84, 1986–92',
    bio: 'Seventh Prime Minister, twice. Small in stature, famously unbending in style.',
    unlock: { type: 'mandates', value: 88 },
    look: { height: 0.86, girth: 1.08, skin: '#e6b38c', hair: 'short', hairColor: '#e8e8e4', mustache: true, mustacheColor: '#e8e8e4', bushy: true, outfit: 'suit', top: '#3a3d44', pants: '#33363c', shirt: '#f2f2f2', tie: '#4b4b4b', shoes: '#1d1d1d' },
    stats: { speed: 0.92, power: 1.0, defense: 1.18, jump: 0.9 },
    special: { type: 'rush', name: 'Stalwart Shove', armor: true },
    super: { type: 'wave', name: 'Immovable Shockwave', color: '#b8b2a7' },
    quote: 'I did not move an inch.',
    victory: 'fist'
  },
  {
    id: 'peres', name: 'Shimon Peres', short: 'PERES', title: 'The Visionary',
    group: 'pm', years: '1984–86, 1995–96',
    bio: 'Eighth Prime Minister, twice, and later President. A lifelong champion of science, start-ups and big ideas.',
    unlock: { type: 'mandates', value: 110 },
    look: { height: 1.05, girth: 0.96, skin: '#ebbd9a', hair: 'combed', hairColor: '#e9e9e6', outfit: 'suit', top: '#2b2f3a', pants: '#262a34', shirt: '#f4f4f4', tie: '#1f4f8f', shoes: '#1d1d1d' },
    stats: { speed: 1.05, power: 0.95, defense: 1.0, jump: 1.08 },
    special: { type: 'projectile', name: 'Bright Idea', proj: 'bulb' },
    super: { type: 'rain', name: 'Startup Nation Storm', color: '#fff3a0', obj: 'bulb' },
    quote: 'The future belongs to the bold — and the quick.',
    victory: 'wave'
  },
  {
    id: 'netanyahu', name: 'Benjamin Netanyahu', short: 'NETANYAHU', title: 'The Survivor',
    group: 'pm', years: '1996–99, 2009–21, 2022–',
    bio: 'Israel\'s longest-serving Prime Minister. Drew a red line on a cartoon bomb at the UN in 2012.',
    unlock: { type: 'mandates', value: 134 },
    look: { height: 1.0, girth: 1.04, skin: '#e9b48e', hair: 'combed', hairColor: '#d9d9d6', outfit: 'suit', top: '#1e2a44', pants: '#1b263d', shirt: '#f6f6f6', tie: '#2b6cd0', shoes: '#111111' },
    stats: { speed: 1.0, power: 1.05, defense: 1.05, jump: 1.0 },
    special: { type: 'projectile', name: 'Cartoon Bomb', proj: 'bomb' },
    super: { type: 'beam', name: 'The Red Line', color: '#ff2b2b' },
    quote: 'I drew a red line. You crossed it.',
    victory: 'point'
  },
  {
    id: 'barak', name: 'Ehud Barak', short: 'BARAK', title: 'The Commando',
    group: 'pm', years: '1999–2001',
    bio: 'Tenth Prime Minister. Israel\'s most decorated soldier — and an accomplished classical pianist.',
    unlock: { type: 'mandates', value: 160 },
    look: { height: 0.92, girth: 1.0, skin: '#e2ad86', hair: 'short', hairColor: '#9a9a96', glasses: 'thin', glassesColor: '#3a3a3a', outfit: 'suit', top: '#33363d', pants: '#2d3036', shirt: '#f2f2f2', tie: '#7a6a3a', shoes: '#1d1d1d' },
    stats: { speed: 1.18, power: 0.95, defense: 0.92, jump: 1.1 },
    special: { type: 'rush', name: 'Commando Dash' },
    super: { type: 'drop', name: 'Grand Piano Finale', color: '#222222', obj: 'piano' },
    quote: 'That was allegro. You were largo.',
    victory: 'bow'
  },
  {
    id: 'sharon', name: 'Ariel Sharon', short: 'SHARON', title: 'The Bulldozer',
    group: 'pm', years: '2001–06',
    bio: 'Eleventh Prime Minister. A former general whose nickname said it all: "the Bulldozer".',
    unlock: { type: 'mandates', value: 188 },
    look: { height: 0.97, girth: 1.5, skin: '#eab593', hair: 'short', hairColor: '#f2f2ee', outfit: 'suit', top: '#2e3440', pants: '#2a2f3a', shirt: '#f4f4f4', tie: '#40527a', shoes: '#1d1d1d' },
    stats: { speed: 0.82, power: 1.22, defense: 1.2, jump: 0.85 },
    special: { type: 'rush', name: 'Bulldozer Charge', armor: true },
    super: { type: 'vehicle', name: 'The Bulldozer', color: '#f2b705', obj: 'bulldozer' },
    quote: 'Nobody stops the Bulldozer.',
    victory: 'fist'
  },
  {
    id: 'olmert', name: 'Ehud Olmert', short: 'OLMERT', title: 'The Mayor',
    group: 'pm', years: '2006–09',
    bio: 'Twelfth Prime Minister and a former Mayor of Jerusalem.',
    unlock: { type: 'mandates', value: 218 },
    look: { height: 0.98, girth: 1.02, skin: '#e7b590', hair: 'fringe', hairColor: '#b5b5b0', glasses: 'thin', glassesColor: '#444444', outfit: 'suit', top: '#3a3f4b', pants: '#343944', shirt: '#f2f2f2', tie: '#8a2c2c', shoes: '#1d1d1d' },
    stats: { speed: 1.0, power: 1.0, defense: 1.0, jump: 1.0 },
    special: { type: 'projectile', name: 'Municipal Memo', proj: 'folder' },
    super: { type: 'vehicle', name: 'Jerusalem Light Rail', color: '#d9dde3', obj: 'tram' },
    quote: 'Next stop: the floor.',
    victory: 'wave'
  },
  {
    id: 'bennett', name: 'Naftali Bennett', short: 'BENNETT', title: 'The Tech Boss',
    group: 'pm', years: '2021–22',
    bio: 'Thirteenth Prime Minister. A former commando and tech entrepreneur who sold his start-up.',
    unlock: { type: 'mandates', value: 250 },
    look: { height: 1.02, girth: 1.0, skin: '#e8b28c', hair: 'bald', hairColor: '#7a6a5a', kippah: '#2a2a2a', outfit: 'open', top: '#22262e', pants: '#1f232a', shirt: '#f4f4f4', tie: null, shoes: '#111111' },
    stats: { speed: 1.1, power: 1.0, defense: 0.97, jump: 1.05 },
    special: { type: 'projectile', name: 'Cyber Byte', proj: 'byte' },
    super: { type: 'vehicle', name: 'Unicorn Exit', color: '#ffffff', obj: 'unicorn' },
    quote: 'Exit complete. Unicorn achieved.',
    victory: 'fist'
  },
  {
    id: 'lapid', name: 'Yair Lapid', short: 'LAPID', title: 'The Anchor',
    group: 'pm', years: '2022',
    bio: 'Fourteenth Prime Minister. A former TV anchor, columnist and author.',
    unlock: { type: 'mandates', value: 285 },
    look: { height: 1.02, girth: 0.98, skin: '#e7b08a', hair: 'full', hairColor: '#cfcfcb', outfit: 'open', top: '#16171b', pants: '#16171b', shirt: '#1f2026', tie: null, shoes: '#111111' },
    stats: { speed: 1.05, power: 0.98, defense: 1.0, jump: 1.02 },
    special: { type: 'projectile', name: 'Breaking News', proj: 'mic' },
    super: { type: 'beam', name: 'Prime Time Special', color: '#7fd3ff' },
    quote: "And that's the news tonight.",
    victory: 'wave'
  },
  {
    id: 'gantz', name: 'Benny Gantz', short: 'GANTZ', title: 'The Chief',
    group: 'contender', years: 'Contender',
    bio: 'Former IDF Chief of Staff and long-time contender for the top job.',
    unlock: { type: 'cpuWins', value: 3 },
    look: { height: 1.08, girth: 1.0, skin: '#ebb895', hair: 'short', hairColor: '#a8a8a4', outfit: 'open', top: '#2c3a55', pants: '#27344c', shirt: '#f4f4f4', tie: null, shoes: '#1d1d1d' },
    stats: { speed: 1.0, power: 1.02, defense: 1.05, jump: 1.05 },
    special: { type: 'projectile', name: 'Blue & White Banner', proj: 'banner' },
    super: { type: 'spin', name: 'Rotation Agreement', color: '#5aa0ff' },
    quote: 'My turn. It was always going to be my turn.',
    victory: 'salute'
  },
  {
    id: 'eisenkot', name: 'Gadi Eisenkot', short: 'EISENKOT', title: 'The Strategist',
    group: 'contender', years: 'Contender',
    bio: 'Former IDF Chief of Staff who stepped into politics with his eyes on the top job.',
    unlock: { type: 'hardWin', value: 1 },
    look: { height: 0.98, girth: 1.0, skin: '#e0aa82', hair: 'fringe', hairColor: '#8e8e8a', outfit: 'suit', top: '#3b3f47', pants: '#353940', shirt: '#f2f2f2', tie: '#2a4a3a', shoes: '#1d1d1d' },
    stats: { speed: 1.08, power: 1.02, defense: 1.0, jump: 1.0 },
    special: { type: 'rush', name: "Chief's Advance" },
    super: { type: 'flurry', name: 'Strategic Barrage', color: '#9be29b' },
    quote: 'Every move was in the briefing.',
    victory: 'salute'
  },
  {
    id: 'liberman', name: 'Avigdor Liberman', short: 'LIBERMAN', title: 'The Kingmaker',
    group: 'contender', years: 'Contender',
    bio: 'Long-time Yisrael Beiteinu leader, famous for deciding who gets to form a coalition.',
    unlock: { type: 'supers', value: 5 },
    look: { height: 1.0, girth: 1.25, skin: '#e8b590', hair: 'short', hairColor: '#8a8580', beard: '#9a958f', outfit: 'suit', top: '#2b2d33', pants: '#26282d', shirt: '#f2f2f2', tie: '#3a4f8c', shoes: '#1d1d1d' },
    stats: { speed: 0.9, power: 1.12, defense: 1.12, jump: 0.9 },
    special: { type: 'projectile', name: 'Kingmaker Crown', proj: 'crown' },
    super: { type: 'drop', name: 'Coalition Crusher', color: '#ffcc33', obj: 'crown' },
    quote: 'No coalition without me.',
    victory: 'point'
  },
  {
    id: 'golan', name: 'Yair Golan', short: 'GOLAN', title: 'The Democrat',
    group: 'contender', years: 'Contender',
    bio: 'Leader of The Democrats and a former IDF Deputy Chief of Staff.',
    unlock: { type: 'perfect', value: 1 },
    look: { height: 1.0, girth: 1.0, skin: '#e5b08a', hair: 'bald', hairColor: '#9f9f9b', stubble: true, outfit: 'open', top: '#353946', pants: '#2f333f', shirt: '#eef2f7', tie: null, shoes: '#1d1d1d' },
    stats: { speed: 1.06, power: 1.0, defense: 1.0, jump: 1.04 },
    special: { type: 'projectile', name: 'Rally Flag', proj: 'flag' },
    super: { type: 'wave', name: 'Rally Wave', color: '#b07cff' },
    quote: 'The people have spoken. Loudly.',
    victory: 'fist'
  },
  {
    id: 'speaker', name: 'The Speaker', short: 'THE SPEAKER', title: 'Order Incarnate',
    group: 'boss', years: 'Final Boss (fictional)',
    bio: 'The fictional keeper of order in the plenum. Final boss of the Election Campaign.',
    unlock: { type: 'campaign', value: 1 },
    look: { height: 1.1, girth: 1.2, skin: '#d9a37c', hair: 'short', hairColor: '#55504a', beard: '#4a4540', glasses: 'thin', glassesColor: '#d4a017', outfit: 'suit', top: '#14161c', pants: '#121318', shirt: '#f2f2f2', tie: '#d4a017', shoes: '#0d0d0d', prop: 'gavel', propColor: '#6b3e1f' },
    stats: { speed: 1.0, power: 1.2, defense: 1.25, jump: 1.0 },
    special: { type: 'projectile', name: 'Order! Order!', proj: 'gavelwave' },
    super: { type: 'drop', name: 'Session Adjourned', color: '#8a5a2b', obj: 'gavel' },
    quote: 'ORDER. This session is adjourned.',
    victory: 'point'
  }
];

KC.rosterById = {};
KC.ROSTER.forEach(function (c, i) { c.index = i; KC.rosterById[c.id] = c; });

/* Gold "Election Night" alt skin — unlocked per fighter after 3 wins with them. */
KC.ALT_SKIN = { top: '#c9a227', pants: '#3a2f12', shirt: '#fffbea', tie: '#111111', dress: '#c9a227', name: 'Election Night Gold' };
/* Used automatically for P2 in mirror matches when gold is not unlocked. */
KC.MIRROR_SKIN = { top: '#7a1f2b', pants: '#4a141c', shirt: '#f4f4f4', tie: '#f2c14e', dress: '#7a1f2b', name: 'Opposition Red' };
KC.ALT_SKIN_WINS = 3;

KC.unlockText = function (c) {
  var u = c.unlock;
  switch (u.type) {
    case 'start': return 'Starter fighter';
    case 'mandates': return 'Earn ' + u.value + ' Mandates';
    case 'cpuWins': return 'Win ' + u.value + ' matches vs CPU';
    case 'hardWin': return 'Beat the CPU on HARD';
    case 'supers': return 'Land ' + u.value + ' Supers';
    case 'perfect': return 'Win a PERFECT round';
    case 'campaign': return 'Clear the Election Campaign';
  }
  return '???';
};
