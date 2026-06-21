#!/usr/bin/env python3
"""Audit workflow coverage, category fit, and grammar for scene outcomes."""

import re
import sys
from pathlib import Path

import importlib.util

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'js' / 'data'
sys.path.insert(0, str(ROOT / 'scripts'))

_gen_spec = importlib.util.spec_from_file_location(
    'generate_outcomes', ROOT / 'scripts' / 'generate-outcomes.py'
)
generate_outcomes = importlib.util.module_from_spec(_gen_spec)
_gen_spec.loader.exec_module(generate_outcomes)
parse_string_map = generate_outcomes.parse_string_map
SOCIAL_INCOMPATIBLE = generate_outcomes.SOCIAL_INCOMPATIBLE
ADVENTURE_INCOMPATIBLE = generate_outcomes.ADVENTURE_INCOMPATIBLE
DUNGEON_INCOMPATIBLE = generate_outcomes.DUNGEON_INCOMPATIBLE
WILDERNESS_INCOMPATIBLE = generate_outcomes.WILDERNESS_INCOMPATIBLE

from combat_vocab import COMBAT_CATEGORIES, CRIT_SCENE_BANNED, HIT_REQUIRED  # noqa: E402
from outcome_vocab import SCENE_TYPE, SKILLS, SKILL_BANNED, line_is_valid  # noqa: E402

WEAPON_CATEGORIES = [
    'Arrows', 'Crossbolts', 'Swords', 'Polearms', 'Knives',
    'Blunt Weapons', 'Axes and Hammers', 'Other Weapons',
]
MAGIC_CATEGORIES = [
    'Fire', 'Cold', 'Lightning', 'Thunder', 'Psychic',
    'Force', 'Necrotic', 'Radiant', 'Acid',
]
TARGETS = ['any', 'enemy', 'ally', 'self', 'environment', 'npc', 'object']

INCOMPATIBLE_BY_TYPE = {
    'social': SOCIAL_INCOMPATIBLE,
    'adventure': ADVENTURE_INCOMPATIBLE,
    'dungeon': DUNGEON_INCOMPATIBLE,
    'wilderness': WILDERNESS_INCOMPATIBLE,
    'special': [],
}

SCENE_EXCLUSIVE_TERMS = {
    'taproom': {'Tavern'},
    'chandelier': {'Tavern'},
    'bar rail': {'Tavern'},
    'barkeep': {'Tavern'},
    "patron's stew": {'Tavern'},
    'spilled ale': {'Tavern'},
}

ENEMY_PATTERN = re.compile(
    r'\b(their|them|they|foe|foes|enemy|enemies|opponent|target|adversary|my target|my foe)\b',
    re.I,
)
SELF_HARM_PATTERN = re.compile(
    r'\b(myself|my own|my hand|my fingers|my feet|my face|my knees|my palm|'
    r'cut myself|nearly hitting myself|nearly cuts my own|singed my own|backfires.*my own)\b',
    re.I,
)
FAIL_AS_HIT_PATTERN = re.compile(
    r'\b(nearly hitting an ally|nearly hitting myself|bounces harmlessly|goes wide|miss|'
    r'fizzles|backfires|stumble|trip|fumble|fail|pathetically|useless|empty air|sprawling|'
    r'exposed|awkwardly|harmlessly|instead of my target|instead of my foe|instead of them|'
    r'past my target|bury the point|instead$)\b',
    re.I,
)
SUCCESS_FAILURE_LEAK = re.compile(r'^I attempt .* but ', re.I)
FAILURE_SUCCESS_LEAK = re.compile(
    r'^I gracefully |^My body moves like liquid|^The creature calms|^I recognize the magical',
    re.I,
)
LONG_POSSESSIVE = re.compile(r"\bthe [a-z]+(?: [a-z]+){3,}'s\b", re.I)
BAD_ESCAPE = re.compile(r'\\+u[0-9a-f]{4}', re.I)
DUPLICATE_PLACE = re.compile(r'\bin (?:here|the \w+) in the\b', re.I)

TARGET_PATTERNS = {
    'enemy': re.compile(r'\b(their|them|foe|foes|enemy|enemies|opponent|target|adversary)\b', re.I),
    'ally': re.compile(r'\b(party|ally|allies|friend|companion|teammate|fellow adventurer)\b', re.I),
    'self': re.compile(r'\b(I|my|myself|me)\b'),
    'environment': re.compile(
        r'\b(ground|wall|walls|door|terrain|weather|path|tree|rock|floor|ceiling|'
        r'mountain|forest|dungeon|room|camp|swamp|plain|jungle|desert|trail|obstacle|beam|undergrowth)\b',
        re.I,
    ),
    'npc': re.compile(
        r'\b(bartender|innkeeper|merchant|vendor|guard|clergy|local|patron|blacksmith|'
        r'people|crowd|someone|stranger|creature|animal|beast)\b',
        re.I,
    ),
    'object': re.compile(
        r'\b(equipment|gear|weapon|armor|item|coin|coins|drink|map|chest|bed|furniture|'
        r'merchandise|bedroll|tent|daggers|arrow|bolt|blade)\b',
        re.I,
    ),
}


def load_nested_scene_outcomes():
    text = (DATA / 'scene-outcomes.js').read_text()
    scenes = {}
    for scene_match in re.finditer(r'"([^"]+)":\s*\{', text):
        scene_id = scene_match.group(1)
        start = scene_match.end()
        depth = 1
        i = start
        while i < len(text) and depth:
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
            i += 1
        body = text[start:i - 1]
        scenes[scene_id] = parse_string_map(body)
    return scenes


def load_character_actions():
    return parse_string_map((DATA / 'actions-data.js').read_text())


def scene_incompatible(text, scene_id):
    stype = SCENE_TYPE.get(scene_id, 'social')
    patterns = INCOMPATIBLE_BY_TYPE.get(stype, [])
    lower = text.lower()
    return [p for p in patterns if p.lower() in lower]


def scene_exclusive_violations(text, scene_id):
    lower = text.lower()
    hits = []
    for term, allowed in SCENE_EXCLUSIVE_TERMS.items():
        if term in lower and scene_id not in allowed:
            hits.append(term)
    return hits


def crit_category_ok(text, scene_id, suffix):
    is_hit = suffix == 'Crit Hit'
    lower = text.lower()
    issues = []
    stype = SCENE_TYPE.get(scene_id, 'social')
    for bad in CRIT_SCENE_BANNED.get(stype, []):
        if bad.lower() in lower:
            issues.append(f'banned:{bad}')
    issues.extend(f'exclusive:{t}' for t in scene_exclusive_violations(text, scene_id))
    if is_hit:
        if not any(term in lower for term in HIT_REQUIRED):
            issues.append('crit hit missing foe/target language')
        if SELF_HARM_PATTERN.search(text):
            issues.append('crit hit self-harm')
    else:
        looks_like_hit = (
            ENEMY_PATTERN.search(text)
            and not SELF_HARM_PATTERN.search(text)
            and not FAIL_AS_HIT_PATTERN.search(text)
        )
        if looks_like_hit:
            issues.append('crit fail reads like a hit')
    return issues


def skill_category_ok(text, skill, suffix):
    issues = []
    if suffix == 'Success':
        if SUCCESS_FAILURE_LEAK.search(text):
            issues.append('success line reads like failure')
    else:
        if FAILURE_SUCCESS_LEAK.search(text):
            issues.append('failure line reads like success')
    if not line_is_valid(skill, text):
        issues.append('skill banned substring')
    for bad in SKILL_BANNED.get(skill, []):
        if bad.lower() in text.lower():
            issues.append(f'skill bleed:{bad}')
    return issues


def grammar_issues(text):
    issues = []
    if LONG_POSSESSIVE.search(text):
        issues.append('long possessive phrase')
    if BAD_ESCAPE.search(text):
        issues.append('broken unicode escape')
    if DUPLICATE_PLACE.search(text):
        issues.append('duplicate place phrasing')
    if re.search(r"\b[a-z]+(?: [a-z]+){4,}'s\b", text, re.I):
        issues.append('awkward possessive on long noun phrase')
    return issues


def matches_target(text, target_id):
    if target_id == 'any':
        return True
    pat = TARGET_PATTERNS.get(target_id)
    return bool(pat and pat.search(text))


def js_valid_outcome(text, outcome_mod, scene_id, category, targets, scene_pool=None):
    """Mirror action-workflow.js validation with scene-line trust + target fallback."""
    active = [t for t in targets if t != 'any']
    haystack = str(text)
    in_scene_pool = scene_pool is not None and text in scene_pool

    if outcome_mod == 'hit':
        if in_scene_pool:
            if SELF_HARM_PATTERN.search(haystack):
                return False
        else:
            if not ENEMY_PATTERN.search(haystack):
                return False
            if SELF_HARM_PATTERN.search(haystack):
                return False

    if outcome_mod == 'fail':
        if not in_scene_pool:
            looks_like_hit = (
                ENEMY_PATTERN.search(haystack)
                and not SELF_HARM_PATTERN.search(haystack)
                and not FAIL_AS_HIT_PATTERN.search(haystack)
            )
            if looks_like_hit:
                return False

    if outcome_mod == 'success' and not in_scene_pool and SUCCESS_FAILURE_LEAK.search(haystack):
        return False
    if outcome_mod == 'failure' and not in_scene_pool and FAILURE_SUCCESS_LEAK.search(haystack):
        return False

    if not active:
        return True
    return any(matches_target(haystack, t) for t in active)


def audit():
    scenes = load_nested_scene_outcomes()
    actions = load_character_actions()
    errors = []
    warnings = []

    expected_scenes = set(SCENE_TYPE)
    missing_scenes = expected_scenes - set(scenes)
    extra_scenes = set(scenes) - expected_scenes
    if missing_scenes:
        errors.append(f'Missing scenes in scene-outcomes.js: {sorted(missing_scenes)}')
    if extra_scenes:
        warnings.append(f'Extra scenes in scene-outcomes.js: {sorted(extra_scenes)}')

    for scene_id in sorted(expected_scenes):
        if scene_id not in actions or not actions[scene_id]:
            errors.append(f'No roleplay actions for scene: {scene_id}')
        elif len(actions[scene_id]) < 8:
            warnings.append(f'Few roleplay actions ({len(actions[scene_id])}) for {scene_id}')

    for scene_id, categories in scenes.items():
        for skill in SKILLS:
            for suffix in ('Success', 'Failure'):
                key = f'{skill} - {suffix}'
                lines = categories.get(key, [])
                if not lines:
                    errors.append(f'Empty pool: {scene_id} / {key}')
                elif len(lines) < 32:
                    warnings.append(f'Short pool ({len(lines)}): {scene_id} / {key}')
                outcome_mod = 'success' if suffix == 'Success' else 'failure'
                for line in lines:
                    for issue in skill_category_ok(line, skill, suffix):
                        errors.append(f'{scene_id} / {key}: {issue} → {line[:90]}…')
                    for issue in scene_incompatible(line, scene_id):
                        warnings.append(f'{scene_id} / {key}: incompatible:{issue} → {line[:90]}…')
                    for issue in grammar_issues(line):
                        warnings.append(f'{scene_id} / {key}: grammar:{issue} → {line[:90]}…')

        for cat in COMBAT_CATEGORIES:
            for suffix in ('Crit Hit', 'Crit Fail'):
                key = f'{cat} - {suffix}'
                lines = categories.get(key, [])
                if not lines:
                    errors.append(f'Empty pool: {scene_id} / {key}')
                elif len(lines) < 32:
                    warnings.append(f'Short pool ({len(lines)}): {scene_id} / {key}')
                for line in lines:
                    for issue in crit_category_ok(line, scene_id, suffix):
                        # Scene-generated crit pools are curated; treat as warnings unless exclusive/banned.
                        if issue.startswith('exclusive:') or issue.startswith('banned:'):
                            errors.append(f'{scene_id} / {key}: {issue} → {line[:90]}…')
                        else:
                            warnings.append(f'{scene_id} / {key}: {issue} → {line[:90]}…')
                    for issue in grammar_issues(line):
                        warnings.append(f'{scene_id} / {key}: grammar:{issue} → {line[:90]}…')

    # Workflow empty-output simulation (with target fallback like JS fix)
    empty_combos = []
    narrow_combos = []
    for scene_id in sorted(scenes):
        cats = scenes[scene_id]
        combos = (
            [('roleplay', scene_id, 'actions')]
            + [(f'{s} - Success', 'success', 'skillChecks') for s in SKILLS]
            + [(f'{s} - Failure', 'failure', 'skillChecks') for s in SKILLS]
            + [(f'{c} - Crit Hit', 'hit', 'crit') for c in COMBAT_CATEGORIES]
            + [(f'{c} - Crit Fail', 'fail', 'crit') for c in COMBAT_CATEGORIES]
        )
        for category, outcome_mod, kind in combos:
            if kind == 'actions':
                pool = actions.get(scene_id, [])
            else:
                pool = cats.get(category, [])
            if not pool:
                empty_combos.append((scene_id, category, outcome_mod, 'any'))
                continue
            for target in TARGETS:
                valid = [
                    t for t in pool
                    if js_valid_outcome(t, outcome_mod, scene_id, category, [target], pool)
                ]
                if not valid:
                    valid = [
                        t for t in pool
                        if js_valid_outcome(t, outcome_mod, scene_id, category, ['any'], pool)
                    ]
                    if not valid:
                        empty_combos.append((scene_id, category, outcome_mod, target))
                    elif target != 'any':
                        narrow_combos.append((scene_id, category, outcome_mod, target))

    print('=' * 72)
    print('BLINGUS WORKFLOW AUDIT')
    print('=' * 72)
    print(f'Scenes: {len(scenes)} | Skills: {len(SKILLS)} | Combat cats: {len(COMBAT_CATEGORIES)}')
    print(f'ERRORS: {len(errors)} | WARNINGS: {len(warnings)}')
    print(f'Empty workflow combos (no output even with fallback): {len(empty_combos)}')
    print(f'Target-narrowed combos (fallback would show all): {len(narrow_combos)}')
    print()

    if errors:
        print('--- ERRORS (first 40) ---')
        for msg in errors[:40]:
            print('  •', msg)
        if len(errors) > 40:
            print(f'  … and {len(errors) - 40} more')
        print()

    if warnings:
        print('--- WARNINGS (first 40) ---')
        for msg in warnings[:40]:
            print('  •', msg)
        if len(warnings) > 40:
            print(f'  … and {len(warnings) - 40} more')
        print()

    if empty_combos:
        print('--- EMPTY WORKFLOW COMBOS (first 25) ---')
        for combo in empty_combos[:25]:
            print('  •', combo)
        print()

    return 1 if errors or empty_combos else 0


if __name__ == '__main__':
    raise SystemExit(audit())
