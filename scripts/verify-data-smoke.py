#!/usr/bin/env python3
"""Minimal smoke checks when node is unavailable (see verify-revamp.mjs for full suite)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'js' / 'data'


def fail(msg):
    print(f'FAIL: {msg}')
    raise SystemExit(1)


def ok(msg):
    print(f'OK: {msg}')


for path in sorted(DATA.glob('*.js')):
    text = path.read_text(encoding='utf-8')
    if not text.strip():
        fail(f'empty {path.name}')
    ok(f'{path.name} readable')

spells = (DATA / 'spells-data.js').read_text()
bardic = (DATA / 'bardic-data.js').read_text()
if spells.count('{t:') < 40:
    fail('spells pool too small')
if bardic.count('{t:') < 45:
    fail('bardic pool too small')
ok('spells and bardic curated')

scene = (DATA / 'scene-outcomes.js').read_text()
if 'sceneOutcomes' not in scene:
    fail('scene-outcomes.js missing sceneOutcomes export')
ok('scene-outcomes.js structure')

print('Data smoke checks passed.')
