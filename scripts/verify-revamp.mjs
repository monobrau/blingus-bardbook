#!/usr/bin/env node
/**
 * Smoke tests for test/revamp branch (no yt-dlp required for structure checks)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;

function ok(label) {
  console.log('  OK:', label);
  passed++;
}

function fail(label, err) {
  console.error('  FAIL:', label, err?.message || err);
  failed++;
}

function assert(cond, label) {
  if (cond) ok(label);
  else fail(label, 'assertion failed');
}

// Data modules parse
const dataFiles = fs.readdirSync(path.join(root, 'js/data')).filter((f) => f.endsWith('.js'));
for (const file of dataFiles) {
  try {
    const code = fs.readFileSync(path.join(root, 'js/data', file), 'utf8');
    new Function('window', code + '\nreturn true;')({});
    ok('parse ' + file);
  } catch (e) {
    fail('parse ' + file, e);
  }
}

// Spells/bardic not empty (parody lyrics preserved)
const spellsCode = fs.readFileSync(path.join(root, 'js/data/spells-data.js'), 'utf8');
const bardicCode = fs.readFileSync(path.join(root, 'js/data/bardic-data.js'), 'utf8');
assert((spellsCode.match(/\{t:/g) || []).length >= 40, 'spells have curated parody entries');
assert((bardicCode.match(/\{t:/g) || []).length >= 45, 'bardic has curated entries');
assert(!spellsCode.includes('Forgotten Realms Lore'), 'lore one-liners removed from spells');
assert(!bardicCode.includes("Blingus's Obsession"), 'lore one-liners removed from bardic');

// Actions curated (smaller than original ~1063 lines)
const actionsLines = fs.readFileSync(path.join(root, 'js/data/actions-data.js'), 'utf8').split('\n').length;
assert(actionsLines < 550, 'actions curated (' + actionsLines + ' lines)');

// Karaoke API exists
assert(fs.existsSync(path.join(root, 'api/karaoke.php')), 'api/karaoke.php exists');
assert(fs.existsSync(path.join(root, 'js/karaoke-manager.js')), 'karaoke-manager.js exists');
assert(fs.existsSync(path.join(root, 'docker-compose.yml')), 'docker-compose.yml exists');

// Export version bumped in script.js
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
assert(script.includes("version: '1.4'"), 'export schema 1.4');
assert(script.includes('localKaraoke'), 'localKaraoke in script.js');

// index.php loads karaoke-manager
const index = fs.readFileSync(path.join(root, 'index.php'), 'utf8');
assert(index.includes('karaoke-manager.js'), 'index.php loads karaoke-manager');
assert(index.includes('karaokeSearchModal'), 'karaoke search modal in index.php');

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
