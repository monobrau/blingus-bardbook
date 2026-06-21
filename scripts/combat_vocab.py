"""Scene-aware critical hit/fail templates for weapons and magic."""

from crit_templates_v2 import CRIT_FAIL_TEMPLATES, CRIT_HIT_TEMPLATES
from outcome_vocab import SCENE_TYPE, vocab_for

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
        'snag_behind': 'a shelf of tankards',
        'floor_hazard': 'spilled ale',
        'ally_tangle': 'a patron',
        'backstop': 'the bar rail',
        'miss_surface': 'the taproom floor',
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

CRIT_SCENE_BANNED = {
    'social': [
        'overhead branches', 'canopy', 'undergrowth', 'stalactite', 'quicksand',
        'tree trunk', 'treeline', 'mine cart', 'fallen log', 'ravine',
    ],
    'dungeon': [
        'overhead branches', 'canopy', 'chandelier', 'taproom', 'patron', 'barkeep',
        'market stall', 'undergrowth', 'tree trunk', 'awing',
    ],
    'wilderness': [
        'chandelier', 'taproom', 'great hall', 'throne room', 'bar rail',
        'tankard', 'taproom floor', 'stone pillar', 'flagstones',
    ],
    'adventure': ['taproom', 'barkeep', 'overhead branches', 'chandelier', 'tankard'],
    'special': ['bartender', 'barkeep', 'great hall'],
}


HIT_REQUIRED = ('my target', 'my foe', 'their', 'them', 'they', 'foe', 'enemy', 'opponent', 'adversary')


def crit_vocab_for(scene_id):
    ctx = vocab_for(scene_id)
    stype = SCENE_TYPE[scene_id]
    ctx.update(CRIT_NOUNS_BY_TYPE.get(stype, CRIT_NOUNS_BY_TYPE['wilderness']))
    ctx.update(SCENE_CRIT_OVERRIDES.get(scene_id, {}))
    return ctx


def crit_line_is_valid(scene_id, category, line, is_hit):
    stype = SCENE_TYPE[scene_id]
    lower = line.lower()
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


def generate_crit_lines(scene_id, category, suffix):
    is_hit = suffix == 'Crit Hit'
    templates = CRIT_HIT_TEMPLATES if is_hit else CRIT_FAIL_TEMPLATES
    ctx = crit_vocab_for(scene_id)
    lines = []
    for template in templates.get(category, []):
        line = template.format(**ctx)
        if line not in lines and crit_line_is_valid(scene_id, category, line, is_hit):
            lines.append(line)
        if len(lines) >= 8:
            break
    if len(lines) < 8:
        for template in templates.get(category, []):
            line = template.format(**ctx)
            if line not in lines:
                lines.append(line)
            if len(lines) >= 8:
                break
    return lines[:8]
