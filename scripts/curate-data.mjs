/**
 * Curation script for test/revamp branch.
 * Trims overlap in actions/mockery/etc.; scores and keeps best song parodies for spells/bardic.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'js', 'data');

function loadModuleExport(filePath, exportName) {
  const code = fs.readFileSync(filePath, 'utf8');
  const fn = new Function('window', `${code}\nreturn ${exportName};`);
  return fn({});
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const wordsA = new Set(na.split(' '));
  const wordsB = new Set(nb.split(' '));
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.max(wordsA.size, wordsB.size);
}

function dedupeStrings(items, threshold = 0.72) {
  const kept = [];
  for (const item of items) {
    if (kept.some((k) => similarity(k, item) >= threshold)) continue;
    kept.push(item);
  }
  return kept;
}

function scoreAction(line) {
  let score = 0;
  const l = line.toLowerCase();
  if (/tarrasque|rust monster|brawn|puck|vadania|blingus|feywild|prismeer|carnival|zybilna|bo\b/.test(l)) score += 2;
  if (/bardic charm|practicing your|trying to use your bardic/.test(l)) score -= 3;
  if (/asking if anyone|checking if anyone|they don't, but/.test(l)) score -= 2;
  if (/checking your gear|polishing your gear|rust monsters/.test(l)) score -= 1;
  if (line.length < 100) score += 1;
  if (line.length > 130) score -= 1;
  return score;
}

function curateStringMap(obj, maxPerCategory = 5, maxObsessive = 1) {
  const out = {};
  for (const [key, items] of Object.entries(obj)) {
    const deduped = dedupeStrings(items, 0.65);
    const ranked = [...deduped].sort((a, b) => scoreAction(b) - scoreAction(a));
    const picked = [];
    let obsCount = 0;
    for (const item of ranked) {
      if (picked.length >= maxPerCategory) break;
      const obs = /tarrasque|rust monster|checking your gear|polishing/i.test(item);
      if (obs && obsCount >= maxObsessive) continue;
      if (obs) obsCount++;
      picked.push(item);
    }
    out[key] = picked;
  }
  return out;
}

function curateMockeryItem(item) {
  return item.t || item;
}

function dedupeMockeryEntries(items, threshold = 0.68) {
  const kept = [];
  for (const item of items) {
    const text = curateMockeryItem(item);
    if (kept.some((k) => similarity(curateMockeryItem(k), text) >= threshold)) continue;
    kept.push(item);
  }
  return kept;
}

function filterMockeryBadPatterns(items) {
  const bad = [
    /satisfy a (dragon|goblin|training dummy)/i,
    /finish before you (start|begin)/i,
    /flaccid/i,
    /more penetration/i,
    /more staying power than your entire/i,
  ];
  return items.filter((item) => {
    const t = curateMockeryItem(item);
    const hits = bad.filter((re) => re.test(t)).length;
    return hits === 0;
  });
}

function curateMockery(mockery, maxPerCategory = 12) {
  const out = {};
  for (const [key, items] of Object.entries(mockery)) {
    let list = filterMockeryBadPatterns(items);
    list = dedupeMockeryEntries(list, 0.68);
    // Deprioritize obsessive Tarrasque/rust unless signature category
    if (key !== 'Blingus — Signature Lines') {
      const tarrasque = list.filter((i) => /tarrasque|rust monster/i.test(curateMockeryItem(i)));
      const other = list.filter((i) => !/tarrasque|rust monster/i.test(curateMockeryItem(i)));
      list = [...other, ...tarrasque.slice(0, 2)];
      list = dedupeMockeryEntries(list, 0.68);
    }
    out[key] = list.slice(0, maxPerCategory);
  }
  return out;
}

function serializeStringMap(name, obj) {
  const lines = [`const ${name} = {`];
  for (const [key, items] of Object.entries(obj)) {
    lines.push(`  '${key.replace(/'/g, "\\'")}': [`);
    for (const item of items) {
      lines.push(`    ${JSON.stringify(item)},`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  return lines.join('\n');
}

function serializeMockery(mockery) {
  const lines = ['const mockery = {'];
  for (const [key, items] of Object.entries(mockery)) {
    lines.push(`  '${key.replace(/'/g, "\\'")}': [`);
    for (const item of items) {
      lines.push(`    {t:${JSON.stringify(item.t)}, s:${JSON.stringify(item.s)}, a:${JSON.stringify(item.a)}${item.adult ? ', adult:true' : ''}},`);
    }
    lines.push('  ],');
  }
  lines.push('};');
  return lines.join('\n');
}

function writeActions(data) {
  const header = `/**
 * Character action data for Blingus's Bardbook (curated revamp)
 * Organized by action category — top picks per situation
 */
window.BlingusData = window.BlingusData || {};

`;
  const footer = `
window.BlingusData.characterActions = characterActions;
`;
  fs.writeFileSync(path.join(dataDir, 'actions-data.js'), header + serializeStringMap('characterActions', data) + footer);
}

function writeCriticals(hits, fails) {
  const header = `/**
 * Critical hit/failure data (curated revamp)
 */
window.BlingusData = window.BlingusData || {};

`;
  const footer = `
window.BlingusData.criticalHits = criticalHits;
window.BlingusData.criticalFailures = criticalFailures;
`;
  fs.writeFileSync(
    path.join(dataDir, 'criticals-data.js'),
    header + serializeStringMap('criticalHits', hits) + '\n\n' + serializeStringMap('criticalFailures', fails) + footer
  );
}

function writeSkillChecks(data) {
  const header = `/**
 * Skill check results (curated revamp)
 */
window.BlingusData = window.BlingusData || {};

`;
  const footer = `
window.BlingusData.skillChecks = skillChecks;
`;
  fs.writeFileSync(path.join(dataDir, 'skillchecks-data.js'), header + serializeStringMap('skillChecks', data) + footer);
}

function writeMockery(data) {
  const header = `/**
 * Vicious mockery data (curated revamp)
 */
window.BlingusData = window.BlingusData || {};

`;
  const footer = `
window.BlingusData.mockery = mockery;
`;
  fs.writeFileSync(path.join(dataDir, 'mockery-data.js'), header + serializeMockery(data) + footer);
}

function writeStringArray(name, items) {
  const lines = [`const ${name} = [`];
  for (const item of items) lines.push(`  ${JSON.stringify(item)},`);
  lines.push('];');
  return lines.join('\n');
}

function writeGenerators(battleCries, insults, introductions, compliments) {
  const dedupedInsults = dedupeStrings(insults, 0.7).slice(0, 35);
  const header = `/**
 * Generator data (curated revamp)
 */
window.BlingusData = window.BlingusData || {};

`;
  const body = [
    writeStringArray('battleCries', battleCries),
    writeStringArray('insults', dedupedInsults),
    writeStringArray('introductions', introductions.slice(0, 8)),
    writeStringArray('compliments', compliments.slice(0, 25)),
  ].join('\n\n');
  const footer = `
window.BlingusData.battleCries = battleCries;
window.BlingusData.insults = insults;
window.BlingusData.introductions = introductions;
window.BlingusData.compliments = compliments;
`;
  fs.writeFileSync(path.join(dataDir, 'generators-data.js'), header + body + footer);
}

const LORE_ARTISTS = new Set([
  'Mockery',
  'D&D Lore',
  'Forgotten Realms Lore',
  "Blingus's Obsession",
  "Blingus's Feywild Reference",
  'Wild Beyond The Witchlight',
]);

function parodyWords(text) {
  return normalize(text).split(' ').filter((w) => w.length > 0);
}

function lastWord(text) {
  const words = parodyWords(text);
  return words[words.length - 1] || '';
}

function isRealSongParody(item) {
  if (!item?.s || !item?.a) return false;
  if (LORE_ARTISTS.has(item.a)) return false;
  if (/lore|mockery|obsession|witchlight|reference/i.test(item.a)) return false;
  return true;
}

function scoreParody(item) {
  if (!isRealSongParody(item)) return -100;

  let score = 0;
  const t = item.t;
  const song = item.s;
  const tNorm = normalize(t);
  const songNorm = normalize(song);

  // Opening line echoes song title/hook
  const songWords = parodyWords(song).filter((w) => w.length > 2);
  const openPhrase = songWords.slice(0, Math.min(4, songWords.length)).join(' ');
  if (openPhrase.length > 4 && tNorm.startsWith(openPhrase.slice(0, Math.min(openPhrase.length, 18)))) {
    score += 4;
  } else if (songWords.some((w) => w.length > 4 && tNorm.includes(w))) {
    score += 2;
  }

  // Song-title words appear in parody
  let titleWordHits = 0;
  for (const w of songWords) {
    if (w.length > 3 && tNorm.includes(w)) titleWordHits++;
  }
  score += Math.min(titleWordHits, 4);

  // End rhyme / hook word near end of line
  const tLast = lastWord(t);
  const sLast = lastWord(song);
  const tail = tNorm.split(' ').slice(-4).join(' ');
  if (tLast && sLast && (tLast === sLast || tail.includes(sLast))) {
    score += 3;
  } else if (tLast.length > 3 && sLast.length > 3 && tLast.slice(-3) === sLast.slice(-3)) {
    score += 1;
  }

  // Song-like phrasing
  if (/[;—]/.test(t)) score += 1;
  if (t.length >= 55 && t.length <= 115) score += 1;
  if (t.length > 130) score -= 2;
  if (t.length < 45) score -= 1;

  // Weak AI rhyme crutches
  if (/\b(cue|jive|folden|dorm|norm|gem|sheen|struts|officious)\b/i.test(t.split(/[.;]/).pop() || '')) {
    score -= 2;
  }
  if (/contain 'em.*sustain 'em/i.test(t)) score -= 3;
  if (/story checks out|checks out/i.test(t) && !/no diggity/i.test(tNorm)) score -= 1;

  return score;
}

function dedupeParodyEntries(items, threshold = 0.68) {
  const kept = [];
  for (const item of items) {
    const text = item.t || '';
    if (kept.some((k) => similarity(k.t, text) >= threshold)) continue;
    kept.push(item);
  }
  return kept;
}

function curateParodyMap(obj, maxPerCategory = 5, minScore = 2) {
  const out = {};
  for (const [key, items] of Object.entries(obj)) {
    const ranked = items
      .filter(isRealSongParody)
      .map((item) => ({ item, score: scoreParody(item) }))
      .filter(({ score }) => score >= minScore);

    // One best line per song title
    const bySong = new Map();
    for (const row of ranked) {
      const songKey = normalize(row.item.s);
      const prev = bySong.get(songKey);
      if (!prev || row.score > prev.score) bySong.set(songKey, row);
    }

    let list = [...bySong.values()]
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);

    list = dedupeParodyEntries(list, 0.66);
    out[key] = list.slice(0, maxPerCategory);
  }
  return out;
}

function serializeParodyMap(name, obj) {
  const lines = [`const ${name} = {`];
  for (const [key, items] of Object.entries(obj)) {
    lines.push(`  '${key.replace(/'/g, "\\'")}': [`);
    for (const item of items) {
      lines.push(
        `    {t:${JSON.stringify(item.t)}, s:${JSON.stringify(item.s)}, a:${JSON.stringify(item.a)}${item.adult ? ', adult:true' : ''}},`
      );
    }
    lines.push('  ],');
  }
  lines.push('};');
  return lines.join('\n');
}

function writeSpells(spells, adultSpells) {
  const header = `/**
 * Spell parody data (curated revamp — best song-faithful parodies per spell)
 */
window.BlingusData = window.BlingusData || {};

`;
  const footer = `
window.BlingusData.spells = spells;
window.BlingusData.adultSpells = adultSpells;
`;
  fs.writeFileSync(
    path.join(dataDir, 'spells-data.js'),
    header + serializeParodyMap('spells', spells) + '\n\n' + serializeParodyMap('adultSpells', adultSpells) + footer
  );
}

function writeBardic(bardic) {
  const header = `/**
 * Bardic inspiration data (curated revamp — best song-faithful parodies per type)
 */
window.BlingusData = window.BlingusData || {};

`;
  const footer = `
window.BlingusData.bardic = bardic;
`;
  fs.writeFileSync(path.join(dataDir, 'bardic-data.js'), header + serializeParodyMap('bardic', bardic) + footer);
}

function countParodyEntries(obj) {
  return Object.values(obj).reduce((n, list) => n + list.length, 0);
}

// Run
const spells = loadModuleExport(path.join(dataDir, 'spells-data.js'), 'spells');
const adultSpells = loadModuleExport(path.join(dataDir, 'spells-data.js'), 'adultSpells');
const bardic = loadModuleExport(path.join(dataDir, 'bardic-data.js'), 'bardic');
const actionsSourcePath = path.join(dataDir, 'actions-source.js');
const actions = fs.existsSync(actionsSourcePath)
  ? loadModuleExport(actionsSourcePath, 'characterActionsSource')
  : loadModuleExport(path.join(dataDir, 'actions-data.js'), 'characterActions');
const criticalHits = loadModuleExport(path.join(dataDir, 'criticals-data.js'), 'criticalHits');
const criticalFailures = loadModuleExport(path.join(dataDir, 'criticals-data.js'), 'criticalFailures');
const skillChecks = loadModuleExport(path.join(dataDir, 'skillchecks-data.js'), 'skillChecks');
const mockery = loadModuleExport(path.join(dataDir, 'mockery-data.js'), 'mockery');
const battleCries = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'battleCries');
const insults = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'insults');
const introductions = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'introductions');
const compliments = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'compliments');

const curatedSpells = curateParodyMap(spells, 5, 2);
const curatedAdultSpells = curateParodyMap(adultSpells, 3, 1);
const curatedBardic = curateParodyMap(bardic, 6, 2);

writeSpells(curatedSpells, curatedAdultSpells);
writeBardic(curatedBardic);
writeActions(curateStringMap(actions, 12, 2));
writeCriticals(curateStringMap(criticalHits, 5), curateStringMap(criticalFailures, 5));
writeSkillChecks(curateStringMap(skillChecks, 4));
writeMockery(curateMockery(mockery, 12));
writeGenerators(battleCries, insults, introductions, compliments);

console.log('Curation complete.');
console.log(
  '  spells:',
  countParodyEntries(spells),
  '->',
  countParodyEntries(curatedSpells),
  '| adult:',
  countParodyEntries(adultSpells),
  '->',
  countParodyEntries(curatedAdultSpells),
  '| bardic:',
  countParodyEntries(bardic),
  '->',
  countParodyEntries(curatedBardic)
);
