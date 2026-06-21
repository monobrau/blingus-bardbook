#!/usr/bin/env python3
"""Generate scene-specific skill outcomes and expand generic outcome pools."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'js' / 'data'
sys.path.insert(0, str(ROOT / 'scripts'))

from outcome_vocab import (  # noqa: E402
    GENERIC_SKILL_LINES,
    SCENE_TYPE,
    SKILL_BANNED,
    SKILL_TEMPLATES,
    SKILLS,
    line_is_valid,
    vocab_for,
)

# Hand-written high-quality overrides (merged first).
CUSTOM = {
    ('Tavern', 'Acrobatics', 'Success'): [
        "I slide across the polished bar and land in a neat crouch to scattered applause",
        "I vault over a pushed-together table without spilling anyone's ale",
        "I hop from stool to stool while the patrons stare in disbelief",
        "I catch a thrown tankard one-handed and bow like it was choreographed",
        "I kick off a chair back, spin once, and land facing the room like I planned it",
        "I duck a swinging tankard, roll under a table, and pop up on the far side grinning",
        "I balance along the rail with empty mugs stacked in my arms and don't drop one",
        "I leap onto the bar, tap-dance two steps, and hop down before the bartender can yell",
    ],
    ('Tavern', 'Acrobatics', 'Failure'): [
        "I try to leap onto the bar and slip on spilled ale, landing hard",
        "My showy cartwheel sends me into a chair that collapses loudly",
        "I misjudge the gap between tables and crash into a patron's dinner",
        "I attempt a flourish and faceplant in front of the entire room",
        "I swing from a lantern hook that wasn't as secure as it looked",
        "My slick-soled boot hits a puddle and I take out two stools on the way down",
        "I try to impress the barmaid with a backflip and clip the ceiling beam",
        "I land my jump on the bar, slide straight into the taps, and soak half the room",
    ],
    ('Tavern', 'Performance', 'Success'): [
        "My song fills the tavern and even the grumpy regulars start tapping along",
        "I launch into a bawdy verse that has the whole room laughing by the second chorus",
        "My juggling act with daggers earns gasps, then cheers, then free drinks",
        "I work the crowd like I own the place and they believe it for a moment",
        "I turn a heckler's insult into a rhyme and the room sides with me instantly",
        "My tale of a ridiculous adventure has strangers buying rounds just to hear the ending",
        "I hit the high note, the room goes quiet, then erupts when I finish",
        "I play three requests in a row and leave with more coin than I arrived with",
    ],
    ('Tavern', 'Stealth', 'Success'): [
        "I slip through the crowded tavern without bumping a single shoulder",
        "I eavesdrop from the perfect shadowy corner near the hearth",
        "I move behind the bar unnoticed long enough to read the chalk tally",
        "I fade into the crowd like I was never standing there",
        "I reach the back booth without the suspicious stranger noticing me",
        "I lift the wanted poster off the wall and nobody looks my way",
        "I pass behind the card game and catch every cheat without being seen",
        "I vanish into the press near the stairs while the brawl breaks out",
    ],
    ('Tavern', 'Persuasion', 'Success'): [
        "I convince the bartender the party deserves a round on the house",
        "My charm turns a suspicious patron into an eager source of rumors",
        "I talk our way into the back room where the real gossip lives",
        "I persuade a local to share more than they meant to",
        "I negotiate a room discount with a smile and a well-timed compliment",
        "I talk the musician into letting me borrow the stage for one song",
        "I convince a wary merchant I'm trustworthy enough for the real prices",
        "I turn a near-fight into a toast and leave everyone on my side",
    ],
    ('Dungeon', 'Perception', 'Success'): [
        "I spot the hair-thin wire across the corridor before anyone steps into it",
        "I notice fresh scuff marks that mean a secret door moved recently",
        "I catch the glint of a needle trap in the lock before fingers reach it",
        "I hear breathing where the wall should be solid stone",
        "I see the dust pattern that proves something passed through here minutes ago",
        "I notice the ceiling tile that sits just a fraction too high",
        "I catch the smell of oil before the party triggers the hinge",
        "I spot the peephole and know we're being watched",
    ],
    ('Dungeon', 'Investigation', 'Success'): [
        "I trace the scratch marks to a hidden latch nobody else noticed",
        "I match the symbols on the floor to a pattern in the wall carvings",
        "I find the loose brick that hides a rusted key",
        "I piece together three small clues and know exactly which door is safe",
        "I read the old chalk tally and understand who was held here last",
        "I find the trigger stone by how the dust lies around it",
        "I identify the poison residue on the arrow slit before anyone touches it",
        "I reconstruct the trap sequence from scorch marks and bent metal",
    ],
    ('Forest', 'Survival', 'Success'): [
        "I read the broken twigs and know which way the trail actually went",
        "I find clean water where the party was about to drink something foul",
        "I identify edible plants and avoid the ones that would ruin the night",
        "I build a shelter that actually keeps the rain out",
        "I spot predator sign early and reroute us before trouble finds us",
        "I find dry kindling despite yesterday's downpour",
        "I recognize the safe ford before we waste an hour at the wrong crossing",
        "I track the lost pack animal's prints through undergrowth others missed",
    ],
    ('Castle', 'Persuasion', 'Success'): [
        "I convince the guard I'm expected in the courtyard without showing papers",
        "I talk my way past a steward who was ready to throw us out",
        "I flatter the right noble and get an invitation to the feast",
        "I negotiate access to the archives with charm instead of coin",
        "I persuade a courtier to introduce us as respectable visitors",
        "I turn a scolding into laughter and leave with directions to the lord",
        "I convince the herald our business is urgent enough to interrupt",
        "I talk the kitchen staff into feeding us while we wait for an audience",
    ],
    ('Tavern', 'Animal Handling', 'Success'): [
        "I coax the tavern cat off the bar with a scrap of fish and a patient hand",
        "I calm the barkeep's hound when a drunk staggers too close to its ears",
        "I talk the stablehand through settling the spooked mule before it kicks a patron",
        "I win over the carrier pigeon on the windowsill with calm clicks and stillness",
        "I keep the tavern cat from yowling during my friend's speech with gentle shooing",
        "I guide the old hound back under its table without anyone losing a finger",
        "I read the mule's panic at the stable door and get it to step back from the crowd",
        "I handle the stray dog begging at the door without getting bitten or chased",
    ],
    ('Tavern', 'Animal Handling', 'Failure'): [
        "I reach for the tavern cat and it shreds my sleeve before vanishing into the rafters",
        "I try to move the spooked mule and it kicks a barrel of ale across the room",
        "I startle the barkeep's hound and it barks until every patron is staring",
        "I offer the wrong food to the stable cat and it hisses like I insulted its mother",
        "I grab at the pigeon and send it flapping through the soup",
        "I misread the mule's ears and nearly take a hoof to the chest",
        "I speak too sharply to the hound and it growls until the bartender intervenes",
        "I try to impress the room by calming the dog and get nipped for my trouble",
    ],
}

SOCIAL_INCOMPATIBLE = [
    'narrow beam', 'undergrowth', 'jungle', 'cliff', 'avalanche', 'treeline',
    'oasis', 'sandstorm', 'tundra', 'quicksand', 'canopy', 'horizon',
    'mountain stream', 'dense vegetation', 'frozen', 'whiteout', 'corridor',
    'secret door', 'stone walls', 'sarcophag',
]
ADVENTURE_INCOMPATIBLE = ['narrow beam', 'bartender', 'barmaid']
DUNGEON_INCOMPATIBLE = ['bartender', 'barmaid', 'market stall']
WILDERNESS_INCOMPATIBLE = ['bartender', 'great hall', 'throne', 'innkeeper']


def generate_lines(scene_id, skill, suffix):
    custom = CUSTOM.get((scene_id, skill, suffix))
    if custom:
        return list(custom)

    ctx = vocab_for(scene_id)
    outcome = 'Success' if suffix == 'Success' else 'Failure'
    templates = SKILL_TEMPLATES[skill][outcome]
    lines = []
    for template in templates:
        line = template.format(**ctx)
        if line not in lines and line_is_valid(skill, line):
            lines.append(line)
        if len(lines) >= 8:
            break
    # Fill from extra templates if validation removed too many
    if len(lines) < 8:
        for template in templates:
            line = template.format(**ctx)
            if line not in lines:
                lines.append(line)
            if len(lines) >= 8:
                break
    return lines[:8]


def generate_scene_outcomes():
    out = {}
    for scene_id in SCENE_TYPE:
        out[scene_id] = {}
        for skill in SKILLS:
            for suffix in ('Success', 'Failure'):
                cat = f'{skill} - {suffix}'
                out[scene_id][cat] = generate_lines(scene_id, skill, suffix)
    return out


def js_string_map(name, data, nested=False):
    lines = [f'const {name} = {{']
    for key, items in data.items():
        if nested:
            lines.append(f'  {json.dumps(key)}: {{')
            for subkey, subitems in items.items():
                lines.append(f'    {json.dumps(subkey)}: [')
                for item in subitems:
                    lines.append(f'      {json.dumps(item)},')
                lines.append('    ],')
            lines.append('  },')
        else:
            lines.append(f'  {json.dumps(key)}: [')
            for item in items:
                lines.append(f'    {json.dumps(item)},')
            lines.append('  ],')
    lines.append('};')
    return '\n'.join(lines)


def parse_string_map(text):
    parsed = {}
    for key, body in re.findall(r'"([^"]+)":\s*\[(.*?)\]', text, re.S):
        parsed[key] = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)
    if parsed:
        return parsed
    for key, body in re.findall(r"'([^']+)':\s*\[(.*?)\]", text, re.S):
        parsed[key] = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)
    return parsed


def write_scene_outcomes():
    data = generate_scene_outcomes()
    header = """/**
 * Scene-specific skill check outcomes for the workflow picker.
 * Generated by scripts/generate-outcomes.py — edit templates there, then re-run.
 */
window.BlingusData = window.BlingusData || {};

"""
    footer = f"""
window.BlingusData.sceneOutcomes = sceneOutcomes;

window.BlingusData.sceneTypes = {json.dumps(SCENE_TYPE)};
window.BlingusData.sceneIncompatiblePatterns = {{
  social: {json.dumps(SOCIAL_INCOMPATIBLE)},
  adventure: {json.dumps(ADVENTURE_INCOMPATIBLE)},
  dungeon: {json.dumps(DUNGEON_INCOMPATIBLE)},
  wilderness: {json.dumps(WILDERNESS_INCOMPATIBLE)},
  special: []
}};
"""
    path = DATA / 'scene-outcomes.js'
    path.write_text(header + js_string_map('sceneOutcomes', data, nested=True) + footer)
    total = sum(len(v2) for v in data.values() for v2 in v.values())
    print(f'Wrote {path.name}: {len(data)} scenes, {total} lines')


def expand_skill_checks():
    expanded = {}
    for skill in SKILLS:
        for suffix in ('Success', 'Failure'):
            key = f'{skill} - {suffix}'
            expanded[key] = list(GENERIC_SKILL_LINES[skill][suffix][:8])

    header = """/**
 * Skill check results (expanded)
 * Scene-specific lines live in scene-outcomes.js; these are generic fallbacks.
 */
window.BlingusData = window.BlingusData || {};

"""
    footer = '\nwindow.BlingusData.skillChecks = skillChecks;\n'
    (DATA / 'skillchecks-data.js').write_text(
        header + js_string_map('skillChecks', expanded) + footer
    )
    print(f'Expanded skillchecks-data.js: {sum(len(v) for v in expanded.values())} lines')


def expand_criticals():
    path = DATA / 'criticals-data.js'
    text = path.read_text()

    extra_hits = {
        'Arrows': [
            "My arrow punches through leather and keeps going until it finds bone",
            "I loose a shot that threads between allies and nails the target square in the chest",
        ],
        'Swords': [
            "My blade opens a line across their guard and blood follows immediately",
            "I riposte so cleanly the steel sings and their weapon skitters away",
        ],
        'Fire': [
            "Flames wrap my target and cling where armor gaps open",
            "My spell detonates in a bloom of heat that leaves scorch marks on stone behind them",
        ],
    }
    extra_fails = {
        'Swords': [
            "My swing goes wide and I nearly take out an ally on the follow-through",
            "I overextend and stumble, leaving my back wide open",
        ],
        'Fire': [
            "The spell fizzles into harmless sparks that drift upward and die",
            "I misaim and scorch the ground between us instead of my target",
        ],
    }

    def parse_section(var_name):
        match = re.search(rf'const {var_name} = (\{{[\s\S]*?\n\}});', text)
        if not match:
            return {}
        return parse_string_map(match.group(1))

    hits = parse_section('criticalHits')
    fails = parse_section('criticalFailures')
    if not hits:
        print('Skipped criticals expansion (parse failed)')
        return

    hit_pad = [
        "My attack lands with perfect timing and unmistakable force",
        "I capitalize on the opening and drive the hit home",
        "The blow connects cleanly and leaves no doubt it was a crit",
    ]
    fail_pad = [
        "My attack goes wrong at the worst possible moment",
        "I fumble the strike and leave myself exposed",
        "The attempt backfires spectacularly in front of everyone",
    ]

    for key, items in hits.items():
        for line in extra_hits.get(key, []):
            if line not in items:
                items.append(line)
        for pad in hit_pad:
            if len(items) >= 8:
                break
            if pad not in items:
                items.append(pad.replace('attack', key.lower()))
        hits[key] = items[:8]

    for key, items in fails.items():
        for line in extra_fails.get(key, []):
            if line not in items:
                items.append(line)
        for pad in fail_pad:
            if len(items) >= 8:
                break
            if pad not in items:
                items.append(pad)
        fails[key] = items[:8]

    header = """/**
 * Critical hit/failure data (expanded)
 */
window.BlingusData = window.BlingusData || {};

"""
    footer = """
window.BlingusData.criticalHits = criticalHits;
window.BlingusData.criticalFailures = criticalFailures;
"""
    (DATA / 'criticals-data.js').write_text(
        header + js_string_map('criticalHits', hits) + '\n\n' + js_string_map('criticalFailures', fails) + footer
    )
    print(f'Expanded criticals-data.js: {sum(len(v) for v in hits.values()) + sum(len(v) for v in fails.values())} lines')


def expand_actions():
    """Add generated roleplay lines to scenes that are light on copy."""
    path = DATA / 'actions-data.js'
    parsed = parse_string_map(path.read_text())
    if not parsed:
        # nested keys with single quotes fallback
        text = path.read_text()
        for key, body in re.findall(r"'([^']+)':\s*\[(.*?)\]", text, re.S):
            parsed[key] = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)
    source_path = DATA / 'actions-source.js'
    if source_path.exists():
        source_text = source_path.read_text()
        source = {}
        for key, body in re.findall(r"'([^']+)':\s*\[(.*?)\]", source_text, re.S):
            source[key] = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)
        alias = {'Walking in a Dungeon': 'Dungeon'}
        for src_key, src_lines in source.items():
            dest = alias.get(src_key, src_key)
            if dest not in parsed:
                parsed[dest] = []
            merged = list(parsed[dest])
            for line in src_lines:
                if line not in merged:
                    merged.append(line)
            parsed[dest] = merged[:20]

    roleplay_templates = [
        "Scanning {place} for trouble while pretending to look casual",
        "Making small talk with {who} to learn what happened here lately",
        "Checking exits in {place} because you're always planning an escape route",
        "Watching {who} while pretending to mind my own business",
        "Trying to look like you belong in {place} (you mostly don't)",
        "Collecting a story from {who} for future performances",
        "Keeping one hand near your gear while exploring {place}",
        "Asking innocent questions that aren't innocent at all",
    ]
    for scene_id in parsed:
        ctx = vocab_for(scene_id)
        extras = []
        for t in roleplay_templates:
            line = t.format(**ctx)
            if line not in extras:
                extras.append(line)
        items = parsed[scene_id]
        merged = list(items)
        for line in extras:
            if line not in merged:
                merged.append(line)
        parsed[scene_id] = merged[:20]

    header = """/**
 * Character action data for Blingus' Bardbook
 * Roleplay lines by scene — expanded for workflow picker
 */
window.BlingusData = window.BlingusData || {};

"""
    footer = '\nwindow.BlingusData.characterActions = characterActions;\n'
    (DATA / 'actions-data.js').write_text(header + js_string_map('characterActions', parsed) + footer)
    print(f'Expanded actions-data.js: {sum(len(v) for v in parsed.values())} lines')


if __name__ == '__main__':
    write_scene_outcomes()
    expand_skill_checks()
    expand_criticals()
    expand_actions()
