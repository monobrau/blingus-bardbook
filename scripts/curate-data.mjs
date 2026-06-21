/**
 * One-time curation script for test/revamp branch.
 * Keeps spell/bardic untouched; trims overlap in other data files.
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

function curateStringMap(obj, maxPerCategory = 5) {
  const out = {};
  for (const [key, items] of Object.entries(obj)) {
    const deduped = dedupeStrings(items, 0.65);
    const ranked = [...deduped].sort((a, b) => scoreAction(b) - scoreAction(a));
    const picked = [];
    let obsCount = 0;
    for (const item of ranked) {
      if (picked.length >= maxPerCategory) break;
      const obs = /tarrasque|rust monster|checking your gear|polishing/i.test(item);
      if (obs && obsCount >= 1) continue;
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
 * Character action data for Blingus' Bardbook (curated revamp)
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

// Run
const actions = loadModuleExport(path.join(dataDir, 'actions-data.js'), 'characterActions');
const criticalHits = loadModuleExport(path.join(dataDir, 'criticals-data.js'), 'criticalHits');
const criticalFailures = loadModuleExport(path.join(dataDir, 'criticals-data.js'), 'criticalFailures');
const skillChecks = loadModuleExport(path.join(dataDir, 'skillchecks-data.js'), 'skillChecks');
const mockery = loadModuleExport(path.join(dataDir, 'mockery-data.js'), 'mockery');
const battleCries = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'battleCries');
const insults = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'insults');
const introductions = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'introductions');
const compliments = loadModuleExport(path.join(dataDir, 'generators-data.js'), 'compliments');

writeActions(curateStringMap(actions, 5));
writeCriticals(curateStringMap(criticalHits, 5), curateStringMap(criticalFailures, 5));
writeSkillChecks(curateStringMap(skillChecks, 4));
writeMockery(curateMockery(mockery, 12));
writeGenerators(battleCries, insults, introductions, compliments);

console.log('Curation complete.');
