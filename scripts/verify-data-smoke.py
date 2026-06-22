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
if 'sceneOutcomesManifest' not in scene or 'sceneTypes' not in scene:
    fail('scene-outcomes.js core missing manifest/metadata')
scene_files = list((DATA / 'scenes').glob('*.js')) if (DATA / 'scenes').exists() else []
if len(scene_files) < 25:
    fail(f'expected per-scene files in js/data/scenes/, found {len(scene_files)}')
ok(f'scene-outcomes.js core + {len(scene_files)} per-scene files')

print('Data smoke checks passed.')
