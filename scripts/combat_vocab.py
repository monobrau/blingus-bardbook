"""Scene-aware critical hit/fail templates for weapons and magic."""

import re
from pathlib import Path

from crit_flavor import crit_hit_flavor_lines, crit_fail_flavor_lines
from crit_templates_v2 import CRIT_FAIL_TEMPLATES, CRIT_HIT_TEMPLATES
from outcome_vocab import SCENE_TYPE, vocab_for

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'js' / 'data'
OUTCOME_POOL_SIZE = 32

WEAPON_CATEGORIES = [
    'Arrows', 'Crossbolts', 'Swords', 'Polearms', 'Knives',
    'Blunt Weapons', 'Axes and Hammers', 'Other Weapons',
]

MAGIC_CATEGORIES = [
    'Fire', 'Cold', 'Lightning', 'Thunder', 'Psychic',
    'Force', 'Necrotic', 'Radiant', 'Acid',
]

COMBAT_CATEGORIES = WEAPON_CATEGORIES + MAGIC_CATEGORIES

# Combat-specific nouns layered on top of vocab_for()
CRIT_NOUNS_BY_TYPE = {
    'social': {
        'overhead_snag': 'a low ceiling beam',
        'snag_behind': 'a shelf behind the counter',
        'floor_hazard': 'a slick patch underfoot',
        'ally_tangle': 'a bystander',
        'backstop': 'a table edge',
        'miss_surface': 'the floor',
    },
    'adventure': {
        'overhead_snag': 'a low arch or hanging banner',
        'snag_behind': 'a stone pillar',
        'floor_hazard': 'uneven flagstones',
        'ally_tangle': 'a companion',
        'backstop': 'a tapestry',
        'miss_surface': 'the courtyard stones',
    },
    'dungeon': {
        'overhead_snag': 'a low ceiling or dangling chain',
        'snag_behind': 'a stone pillar',
        'floor_hazard': 'slippery flagstones',
        'ally_tangle': 'a companion',
        'backstop': 'the damp wall',
        'miss_surface': 'the corridor floor',
    },
    'wilderness': {
        'overhead_snag': 'overhead branches',
        'snag_behind': 'a tree trunk',
        'floor_hazard': 'uneven ground',
        'ally_tangle': 'a companion',
        'backstop': 'a fallen log',
        'miss_surface': 'the trail',
    },
    'special': {
        'overhead_snag': 'a rigged carnival prop',
        'snag_behind': 'a tent pole',
        'floor_hazard': 'the shifting midway boards',
        'ally_tangle': 'an onlooker',
        'backstop': 'a mirror maze panel',
        'miss_surface': 'the sawdust floor',
    },
}

SCENE_CRIT_OVERRIDES = {
    'Tavern': {
        'overhead_snag': 'the chandelier chain',
        'snag_behind': 'the bar rail',
        'floor_hazard': 'spilled ale',
        'miss_surface': 'the taproom floor',
        'backstop': 'a table edge',
    },
    'Inn': {
        'overhead_snag': 'a low loft beam',
        'snag_behind': 'a bed frame',
        'floor_hazard': 'a loose floorboard',
    },
    'Dungeon': {
        'overhead_snag': 'a dangling chain or low arch',
        'snag_behind': 'a broken statue',
        'floor_hazard': 'slippery flagstones',
        'miss_surface': 'the corridor floor',
    },
    'Forest': {
        'overhead_snag': 'overhead branches',
        'snag_behind': 'a tree trunk',
        'floor_hazard': 'roots underfoot',
    },
    'Castle': {
        'overhead_snag': 'a great hall rafter',
        'snag_behind': 'a pillar',
        'miss_surface': 'the polished floor',
    },
    'Sewers': {
        'overhead_snag': 'a dripping pipe',
        'snag_behind': 'a rusted ladder',
        'floor_hazard': 'slick slime',
        'miss_surface': 'the wet walkway',
    },
    'Market': {
        'overhead_snag': 'an awning frame',
        'snag_behind': 'a market stall',
        'floor_hazard': 'scattered produce',
    },
}

# Terms that only belong in specific scenes (validated in crit_line_is_valid).
SCENE_EXCLUSIVE_TERMS = {
    'taproom': {'Tavern'},
    'chandelier': {'Tavern'},
    'bar rail': {'Tavern'},
    'barkeep': {'Tavern'},
    "patron's stew": {'Tavern'},
    'spilled ale': {'Tavern'},
}

CRIT_SCENE_BANNED = {
    'social': [
        'overhead branches', 'canopy', 'undergrowth', 'stalactite', 'quicksand',
        'tree trunk', 'treeline', 'mine cart', 'fallen log', 'ravine',
    ],
    'dungeon': [
        'overhead branches', 'canopy', 'chandelier', 'taproom', 'patron', 'barkeep',
        'market stall', 'undergrowth', 'tree trunk', 'awning',
    ],
    'wilderness': [
        'chandelier', 'taproom', 'great hall', 'throne room', 'bar rail',
        'tankard', 'taproom floor', 'stone pillar', 'flagstones',
    ],
    'adventure': ['taproom', 'barkeep', 'overhead branches', 'chandelier', 'tankard'],
    'special': ['bartender', 'barkeep', 'great hall'],
}


HIT_REQUIRED = (
    'my target', 'my foe', 'my enemy', 'their', 'them', 'they', 'foe', 'foes',
    'enemy', 'enemies', 'opponent', 'adversary', 'target',
    'finds its mark', 'finds flesh', 'finds bone', 'finds the gap', 'find flesh',
    'strikes true', 'strike true', 'drive the hit home', 'connects cleanly',
    'bites deep', 'bite deep', 'sinks in', 'sink in', 'punches through',
    'into their', 'through their', 'through fabric', 'through leather', 'through armor',
    'their guard', 'their flesh', 'their ribs', 'their side', 'their armor',
    'their defense', 'their leg', 'they stagger', 'they gasp', 'they drop',
    'they reel', 'they crumple', 'foe crumples', 'target staggers',
    'lands clean', 'lands true', 'connects with', 'buried in their', 'embeds in their',
    'opens a line', 'drawing a line', 'sends steel through', 'sends the blade through',
    'wrap my target', 'wrap them', 'scorch my foe', 'scorch them', 'against my target',
    'sinks deep', 'sink deep', 'hits with crit', 'with crit force', 'lands before anyone',
    'connects', 'lands with perfect timing', 'lands with precision', 'strikes like',
)


def crit_vocab_for(scene_id):
    ctx = vocab_for(scene_id)
    stype = SCENE_TYPE[scene_id]
    ctx.update(CRIT_NOUNS_BY_TYPE.get(stype, CRIT_NOUNS_BY_TYPE['wilderness']))
    ctx.update(SCENE_CRIT_OVERRIDES.get(scene_id, {}))
    return ctx


def crit_line_is_valid(scene_id, category, line, is_hit):
    stype = SCENE_TYPE[scene_id]
    lower = line.lower()
    for term, allowed in SCENE_EXCLUSIVE_TERMS.items():
        if term in lower and scene_id not in allowed:
            return False
    for bad in CRIT_SCENE_BANNED.get(stype, []):
        if bad.lower() in lower:
            return False
    if is_hit and not any(term in lower for term in HIT_REQUIRED):
        return False
    if not is_hit:
        hit_terms = ('sinking deep into my target', 'finds its mark', 'drive the hit home',
                     'connects cleanly and leaves no doubt it was a crit')
        if any(term in lower for term in hit_terms):
            return False
    return True


_GENERIC_CRITS = None


def _parse_string_map(text):
    parsed = {}
    for key, body in re.findall(r'"([^"]+)":\s*\[(.*?)\]', text, re.S):
        parsed[key] = [
            bytes(x, 'utf-8').decode('unicode_escape')
            for x in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)
        ]
    return parsed


def load_generic_crits():
    global _GENERIC_CRITS
    if _GENERIC_CRITS is not None:
        return _GENERIC_CRITS
    text = (DATA / 'criticals-data.js').read_text()
    hits = {}
    fails = {}
    hit_match = re.search(r'const criticalHits = (\{[\s\S]*?\n\});', text)
    fail_match = re.search(r'const criticalFailures = (\{[\s\S]*?\n\});', text)
    if hit_match:
        hits = _parse_string_map(hit_match.group(1))
    if fail_match:
        fails = _parse_string_map(fail_match.group(1))
    _GENERIC_CRITS = (hits, fails)
    return _GENERIC_CRITS


def contextualize_crit_line(line, ctx, variant=0):
    """Give a generic crit line light scene framing. Returns a single line;
    ``variant`` cycles the framing so different generic lines get different
    shapes instead of each line spawning three near-identical copies (which is
    what made whole crit pools read as the same sentence over and over)."""
    place = ctx.get('place', 'here')
    if not line:
        return None
    if line.startswith('I ') or line == 'I':
        lead = line
    elif len(line) > 1:
        lead = line[0].lower() + line[1:]
    else:
        lead = line.lower()
    # Prefix framings only: suffix tags like "{line} in {where}" collide with
    # lines that already end in a phrase ("...in the chest in this place") and
    # "{line}, {place} as ever" just reads awkwardly. A leading clause always
    # scans cleanly regardless of how the generic line ends.
    styles = [
        f'In {place}, {lead}',
        line,
        f'Right here in {place}, {lead}',
    ]
    return styles[variant % len(styles)]


def generate_crit_lines(scene_id, category, suffix):
    is_hit = suffix == 'Crit Hit'
    templates = CRIT_HIT_TEMPLATES if is_hit else CRIT_FAIL_TEMPLATES
    ctx = crit_vocab_for(scene_id)
    lines = []
    for template in templates.get(category, []):
        line = template.format(**ctx)
        if line not in lines and crit_line_is_valid(scene_id, category, line, is_hit):
            lines.append(line)
        if len(lines) >= OUTCOME_POOL_SIZE:
            break
    if len(lines) < OUTCOME_POOL_SIZE:
        # Scene-specific beats as a capped, round-robin minority (each sentence
        # shape used at most twice) so the pool does not collapse into one shape
        # with only the scene detail swapped.
        flavor = (crit_hit_flavor_lines if is_hit else crit_fail_flavor_lines)(
            scene_id, ctx, category, limit=OUTCOME_POOL_SIZE, per_template=2
        )
        for line in flavor:
            if line not in lines and crit_line_is_valid(scene_id, category, line, is_hit):
                lines.append(line)
            if len(lines) >= OUTCOME_POOL_SIZE:
                break
    if len(lines) < OUTCOME_POOL_SIZE:
        hits, fails = load_generic_crits()
        generic_pool = hits.get(category, []) if is_hit else fails.get(category, [])
        # Each generic line at most twice, with a rotating framing so we add
        # distinct sentence bodies rather than four copies of each. We would
        # rather return a smaller, varied pool than pad with repetition.
        for extra in range(2):
            for idx, raw in enumerate(generic_pool):
                variant = contextualize_crit_line(raw, ctx, variant=idx + extra)
                if variant and variant not in lines and crit_line_is_valid(scene_id, category, variant, is_hit):
                    lines.append(variant)
                if len(lines) >= OUTCOME_POOL_SIZE:
                    break
            if len(lines) >= OUTCOME_POOL_SIZE:
                break
    return lines[:OUTCOME_POOL_SIZE]
