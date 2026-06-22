#!/usr/bin/env python3
"""Generate scene-specific skill outcomes and expand generic outcome pools."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'js' / 'data'
sys.path.insert(0, str(ROOT / 'scripts'))

from combat_vocab import (  # noqa: E402
    COMBAT_CATEGORIES,
    generate_crit_lines,
)
from outcome_vocab import (  # noqa: E402
    GENERIC_SKILL_LINES,
    SCENE_TYPE,
    SKILL_BANNED,
    SKILLS,
    TYPE_NOUNS,
    SKILL_TEMPLATES as LEGACY_SKILL_TEMPLATES,
    line_is_valid,
    vocab_for,
)
from skill_templates_v2 import SKILL_TEMPLATES  # noqa: E402

from scene_flavor import flavor_lines_for  # noqa: E402
from scene_crit_unique import scene_crit_lines, type_crit_lines  # noqa: E402

OUTCOME_POOL_SIZE = 32


def line_signature(line, ctx):
    """Normalize a line so near-duplicate templates collapse."""
    sig = line.lower()
    for val in sorted((v for v in ctx.values() if isinstance(v, str)), key=len, reverse=True):
        if len(val) > 3:
            sig = sig.replace(val.lower(), '§')
    sig = re.sub(r'\s+', ' ', sig).strip()
    return sig


def append_line(lines, seen_sigs, line, sig=None):
    if not line or line in lines:
        return False
    if sig and sig in seen_sigs:
        return False
    lines.append(line)
    if sig:
        seen_sigs.add(sig)
    return True


def append_from_templates(lines, seen_sigs, templates, ctx, skill, require_valid=True):
    for template in templates:
        try:
            line = template.format(**ctx)
        except KeyError:
            continue
        sig = line_signature(line, ctx)
        if sig in seen_sigs:
            continue
        if require_valid and not line_is_valid(skill, line):
            continue
        if append_line(lines, seen_sigs, line, sig):
            pass
        if len(lines) >= OUTCOME_POOL_SIZE:
            break

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
        "I talk my way past whoever was ready to throw us out",
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
    ('Tavern', 'Performance', 'Failure'): [
        "My song in the tavern dies before the second verse and takes my ego with it",
        "I forget the chorus near the hearth and fill the silence with aggressive humming",
        "I misread the room and perform a tragic ballad during a birthday party",
        "I trip over a stool mid-act and never recover my rhythm or my dignity",
        "My voice cracks on the high note and the bar cat leaves in protest",
        "I attempt grandeur in the taproom and get pity applause that hurts worse",
        "The tavern stays painfully quiet like I forgot how songs work",
        "I play to patrons who clearly came here to forget I exist",
    ],
    ('Tavern', 'Intimidation', 'Success'): [
        "I lower my voice in the tavern and the brawler reconsiders like I might review him publicly",
        "I make a quiet threat near the bar and the room gives us space without asking why",
        "I stare down the troublemaker until they find their drink suddenly fascinating",
        "I mention what happened last time someone touched my gear and the mood turns cold",
        "I project enough menace that talk replaces fists—cheap, effective, very me",
        "I convince the bully I am not bluffing about the chandelier and my reach",
        "I turn the taproom mood icy and get compliance before pride kicks in",
        "I let silence do the work until the loud patron breaks and mutters an apology",
    ],
    ('Dungeon', 'Stealth', 'Failure'): [
        "I kick a loose brick in the corridor and the echo announces us to the whole level",
        "I step into torchlight like a spotlight found me on purpose",
        "I stumble on a chain and the guard turns with the enthusiasm of payday",
        "My buckles clink in the dungeon and ruin everything including my reputation",
        "I try to hide behind a statue and stand out like a fairy in a crypt",
        "I misjudge the shadows and glow faintly at the worst possible moment",
        "I curse at a rat and the whole corridor hears my vocabulary",
        "I thought I was hidden in the recess—I wasn't, and whoever was listening agrees",
    ],
    ('Forest', 'Nature', 'Success'): [
        "I identify the edible berries and the poisonous look-alike before anyone writes a complaint",
        "I read predator sign in the forest and reroute us before the story gets bloody",
        "I find clean water where the party was about to drink something that would end the chapter early",
        "I predict the weather over the treeline and get us under cover before the sky opens",
        "I know which path through the undergrowth won't eat our boots or our dignity",
        "I hear the woods go quiet and tell everyone to shut up before the quiet gets teeth",
        "I spot the safe ford before we waste an hour at the wrong crossing, heroically",
        "I explain which mushrooms are friends and which are funeral arrangements",
    ],
    ('Castle', 'Deception', 'Success'): [
        "I sell our cover story in the courtyard with the confidence of someone who belongs in tapestries",
        "I convince the guard we are expected guests despite lacking papers, polish, or patience",
        "I misdirect whoever was watching with a dropped gauntlet while the truth walks past",
        "I play the part of respectable visitors so well even I almost believe the lie",
        "I answer the herald's questions without a tell—years of bardic training finally pays rent",
        "I weave a harmless cover story around the nosy courtier and send attention elsewhere",
        "I convince the officer of the watch that stopping us would be more embarrassing than letting us pass",
        "I redirect the conversation before anyone connects dots I'd rather keep loose",
    ],
    ('Inn', 'Stealth', 'Success'): [
        "I slip upstairs without the floorboards betraying me to the guests below",
        "I read the guest ledger while the innkeeper's back is turned and nobody notices",
        "I pass the common room through the press of bodies like I was never there",
        "I reach the linen closet and back away before the creaking stair complains",
        "I hold still in the shadow by the coat rack until the late-night whisperers move on",
        "I lift the spare key from the hook with a misdirection about breakfast",
        "I cross the inn leaving no sign except maybe a good rumor later",
        "I eavesdrop on the argument in 4B without the door latch clicking",
    ],
    ('Inn', 'Investigation', 'Success'): [
        "I find the guest book page torn out and hidden under the blotter",
        "I match the mud on the carpet to boots drying by the wrong door",
        "I notice the window latch scratched from the outside not the inside",
        "I connect the candle wax trail to the room nobody admits is occupied",
        "I find the spare key impression in the wax left on the desk",
        "I read the chalk tally on the kitchen board and know who skipped paying",
        "I spot the luggage tag that does not match the name on the register",
        "I piece together whispers, mud, and wax into one uncomfortable answer",
    ],
    ('Market', 'Sleight of Hand', 'Success'): [
        "I palm a sample coin from the scale while the vendor haggles with someone else",
        "I swap the loaded die for a fair one during the confusion at the spice stall",
        "I lift the merchant's seal ring while they gesture at bolt after bolt of cloth",
        "I plant a folded note on the pickpocket watching us from the awning shade",
        "I tie and untie a sample pouch before the guard's patrol completes its loop",
        "I cheat at the shell game just long enough to learn how they cheat back",
        "I conceal a purchase in my sleeve until the crowd shifts toward the crier",
        "I switch price tags on two stalls while everyone watches the fistfight that is not a fistfight",
    ],
    ('Crypt', 'Religion', 'Success'): [
        "I recognize the burial rite and perform the gesture that keeps the dead quiet",
        "I identify the desecrated symbol and know which prayer calms the air",
        "I read the epitaph and explain why the party should not open that sarcophagus yet",
        "I cite the order's doctrine about uninvited feet in consecrated ground",
        "I interpret the omen of the extinguished candle without inventing heresy",
        "I calm the party with the right verse when the whispers start",
        "I know which taboo we are one step from breaking and steer us sideways",
        "I translate the warning on the lintel accurately and resist adding a joke—mostly",
    ],
    ('Sewers', 'Athletics', 'Success'): [
        "I haul myself up the rusted ladder before the runoff surge catches my boots",
        "I leap the gap between walkways while the party still argues about the smell",
        "I brace the collapsing timber long enough for everyone to scramble through",
        "I swim the channel when the path ends and climb out still complaining poetically",
        "I push through the grate rust with brute stubbornness and a nasty grunt",
        "I carry the torch and the injured both without slipping on the slime",
        "I break the jammed wheel gate before the water level wins",
        "I sprint the straight pipe when the echo behind us grows footsteps",
    ],
    ('Carnival / Feywild (Wild Beyond The Witchlight)', 'Arcana', 'Success'): [
        "I recognize the illusion woven into the ticket stub before we pay twice for one ride",
        "I name the school of magic on the rigged game booth and explain why the dice always win",
        "I sense the time distortion around the carousel and know how long we actually have",
        "I decode the fey sigil on the mirror maze and tell everyone which reflection is real",
        "I spot unstable glamour on the strongman bell and know not to touch the rope",
        "I identify the witchlight residue on the confetti and what it wants from us",
        "I explain the carnival rule about unpaid debts before we owe something worse than coin",
        "I read the impossible geometry of the tent and find the exit that exits",
    ],
    ('Coast', 'Nature', 'Success'): [
        "I read the tide tables from the wet line on the rocks and know when the cave mouth closes",
        "I identify which shellfish are lunch and which are a trip to the medic",
        "I spot the rip current before the party wades in for a shortcut",
        "I predict the fog bank rolling in and get us off the exposed jetty",
        "I know which gull behavior means fish and which means sharks",
        "I find fresh water seeping from the cliff face when the casks run low",
        "I read the wind shift over the harbor and warn the sailors before the squall",
        "I explain why the kelp is laid in a line pointing at the wrong inlet",
    ],
}

SOCIAL_INCOMPATIBLE = [
    'narrow beam', 'undergrowth', 'jungle', 'cliff', 'avalanche', 'treeline',
    'oasis', 'sandstorm', 'tundra', 'quicksand', 'canopy', 'horizon',
    'mountain stream', 'dense vegetation', 'frozen', 'whiteout', 'corridor',
    'secret door', 'stone walls', 'sarcophag', 'overhead branches', 'tree trunk',
    'stalactite', 'fallen log',
]
ADVENTURE_INCOMPATIBLE = ['narrow beam', 'bartender', 'barmaid', 'overhead branches', 'chandelier']
DUNGEON_INCOMPATIBLE = ['bartender', 'barmaid', 'market stall', 'overhead branches', 'chandelier', 'taproom']
WILDERNESS_INCOMPATIBLE = ['bartender', 'great hall', 'throne', 'innkeeper', 'chandelier', 'taproom', 'bar rail']

# Hand-written crit overrides (scene, category, suffix).
CRIT_CUSTOM = {
    ('Tavern', 'Polearms', 'Crit Fail'): [
        'My polearm catches on the chandelier chain with opera-level drama, leaving me exposed',
        'I misjudge the reach between tables and faceplant into a patron\'s stew',
        'My haft knocks tankards off the bar in a percussion solo nobody requested',
        'I swing too wide and snag the bar rail behind me—the whole taproom hears it',
        'I slip on spilled ale and slide across the taproom floor like a bad encore',
        'The low ceiling beam stops my polearm mid-thrust and my dignity with it',
        'I thrust past my target and bury the point in a sack of flour—cloudy, humiliating',
        'My polearm clatters off a table edge and I bow like that was the bit—it wasn\'t',
    ],
    ('Tavern', 'Polearms', 'Crit Hit'): [
        'My polearm finds the gap between bar stools and my target with reach they didn\'t budget for',
        'I extend past their guard in the taproom and drive the point home to scattered gasps',
        'My haft sweeps tankards aside and the blade still finds flesh—priorities',
        'A thrust between tables in the tavern lands clean enough to start a song',
        'My polearm strikes true amid the chaos and even the bar cat looks impressed',
        'I hook their guard on the rail and follow through with a crit worth free drinks',
        'The reach advantage in the taproom keeps me safe while the blade still bites deep',
        'My polearm connects in the tavern with force the bard in me wants to narrate loudly',
    ],
    ('Dungeon', 'Polearms', 'Crit Fail'): [
        'My polearm catches on a dangling chain with commitment, leaving me exposed in the echo',
        'I misjudge the reach in the narrow corridor and stumble forward like a bad tour guide',
        'My weapon tangles with a companion—we share a look that says "don\'t put this in the ballad"',
        'I swing too wide and snag a broken statue behind me; stone and pride crack together',
        'I slip on slippery flagstones and hit the corridor floor with a clang that alerts the level',
        'The low arch catches my polearm mid-swing and the dungeon gets a free sound effect',
        'I thrust past my target and bury the point in the damp wall—geology wins, I lose',
        'My polearm clatters down the corridor and announces our position to everything listening',
    ],
    ('Dungeon', 'Fire', 'Crit Hit'): [
        'My flames erupt in the corridor and wrap my target in heat the damp walls can\'t smother',
        'I detonate fire down here and scorch my foe against the stone like a dramatic torch',
        'Heat races across them in the dungeon, leaving scorch marks and my smug narrating face',
        'My spell finds the gap in their guard in flickering torchlight and clings like a grudge',
        'The blaze in the corridor hits with crit force and echoes off every wall',
        'I scorch them in the depths with a bloom of heat they cannot shrug off',
        'My fire strike in the dungeon lands with precision worth a whispered verse',
        'The spell leaves my foe smoking in the torchlight and me already composing the chorus',
    ],
    ('Carnival / Feywild (Wild Beyond The Witchlight)', 'Arrows', 'Crit Hit'): [
        'My arrow strikes like time distortion in Prismeer—here, then there, then everywhere at once',
        'My arrow finds its mark in the carnival chaos, sinking deep with a satisfying thud',
        'I loose a shot that threads impossible tents and nails my target square in the chest',
        'My arrowhead buries itself in their leg amid calliope music and they drop to one knee',
        'My arrow punches through leather and keeps going until it finds bone in the midway',
        'The shot bends wrong in fey light and still lands true on my foe',
        'My arrow in the carnival lands with perfect timing and unmistakable force',
        'I capitalize on the opening in this strange place and drive the hit home',
    ],
    ('Carnival / Feywild (Wild Beyond The Witchlight)', 'Arrows', 'Crit Fail'): [
        'My arrow disappears like a lost thing in Prismeer—here one moment, gone the next',
        'My arrow gets caught in a burst of confetti and veers wildly off course',
        'My arrow nock breaks mid-draw, sending the arrow spinning into the sawdust',
        'I release too early and my arrow bounces harmlessly off a rigged game booth',
        'I lose my balance on the shifting midway boards and my arrow goes wide',
        'The shot vanishes into a tent that is bigger inside than out',
        'My bowstring snaps on a carnival prop and the arrow drops at my feet',
        'I misaim in the impossible lantern glow and bury the arrow in a mirror maze panel',
    ],
}


def generate_lines(scene_id, skill, suffix):
    custom = CUSTOM.get((scene_id, skill, suffix))
    lines = list(custom) if custom else []
    seen = {line_signature(l, vocab_for(scene_id)) for l in lines}

    ctx = vocab_for(scene_id)
    outcome = 'Success' if suffix == 'Success' else 'Failure'

    # Beat-driven lines first — most distinct per scene.
    for line in flavor_lines_for(scene_id, skill, suffix, ctx, line_is_valid, limit=24):
        sig = line_signature(line, ctx)
        if sig not in seen and line_is_valid(skill, line):
            append_line(lines, seen, line, sig)
        if len(lines) >= OUTCOME_POOL_SIZE:
            return [normalize_line(line) for line in lines[:OUTCOME_POOL_SIZE]]

    append_from_templates(lines, seen, SKILL_TEMPLATES[skill][outcome], ctx, skill)
    if len(lines) < OUTCOME_POOL_SIZE:
        append_from_templates(
            lines, seen, LEGACY_SKILL_TEMPLATES[skill][outcome], ctx, skill, require_valid=True
        )

    return [normalize_line(line) for line in lines[:OUTCOME_POOL_SIZE]]


def generate_crit_outcome_lines(scene_id, category, suffix):
    stype = SCENE_TYPE[scene_id]
    lines = []
    seen = set()

    for source in (
        CRIT_CUSTOM.get((scene_id, category, suffix), []),
        scene_crit_lines(scene_id, category, suffix),
        type_crit_lines(scene_id, category, suffix, stype),
    ):
        for line in source:
            append_line(lines, seen, line)
            if len(lines) >= OUTCOME_POOL_SIZE:
                return [normalize_line(line) for line in lines[:OUTCOME_POOL_SIZE]]

    ctx = vocab_for(scene_id)
    for line in generate_crit_lines(scene_id, category, suffix):
        sig = line_signature(line, ctx)
        if sig in seen:
            continue
        append_line(lines, seen, line, sig)
        if len(lines) >= OUTCOME_POOL_SIZE:
            break
    return [normalize_line(line) for line in lines[:OUTCOME_POOL_SIZE]]


def generate_scene_outcomes():
    out = {}
    for scene_id in SCENE_TYPE:
        out[scene_id] = {}
        for skill in SKILLS:
            for suffix in ('Success', 'Failure'):
                cat = f'{skill} - {suffix}'
                out[scene_id][cat] = generate_lines(scene_id, skill, suffix)
        for category in COMBAT_CATEGORIES:
            for suffix in ('Crit Hit', 'Crit Fail'):
                cat = f'{category} - {suffix}'
                out[scene_id][cat] = generate_crit_outcome_lines(scene_id, category, suffix)
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


def normalize_line(s):
    """Fix over-escaped unicode, quotes, pronoun case, locatives, and casing."""
    if not s:
        return s
    s = re.sub(r'\\+u2014', '\u2014', s)
    s = re.sub(r'\\+u2019', '\u2019', s)
    s = re.sub(r'\\+"', '"', s)
    while '\\\\' in s:
        s = s.replace('\\\\', '\\')
    s = re.sub(r'\bi\b', 'I', s)
    # Collapse accidental function-word doublings from template + value joins
    # ("I recall the the taboo"). Limited to function words so we never merge two
    # distinct content words that happen to collide at a template seam.
    _double = r'\b(the|a|an|in|on|of|to|and|but|or|that|with|down|up|here)\s+\1\b'
    s = re.sub(_double, r'\1', s, flags=re.I)
    # "in out here" / "in down here" read wrong — these adverbs already imply location.
    s = re.sub(r'\bin (out here|down here|out there|up here)\b', r'\1', s)
    # Collapse doubled locatives like "in the air in the desert"/"in the rafters in here".
    s = re.sub(
        r'\b(in (?:the \w+|here|out here|down here)) in '
        r'(?:the [\w ]+?|camp|here|this place|this strange place|down here|out here|up here)\b'
        r'(?= and| before| until| while| when| instantly|,|\u2014|\.|$)',
        r'\1',
        s,
    )
    # Re-collapse in case a de-duplication created a new doubled word ("down down here").
    s = re.sub(_double, r'\1', s, flags=re.I)
    # Every outcome line is a full sentence — capitalize the first letter.
    match = re.search(r'[A-Za-z]', s)
    if match and s[match.start()].islower():
        idx = match.start()
        s = s[:idx] + s[idx].upper() + s[idx + 1:]
    return s


def parse_string_map(text):
    parsed = {}
    for key, body in re.findall(r'"([^"]+)":\s*\[(.*?)\]', text, re.S):
        parsed[key] = [normalize_line(x) for x in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)]
    if parsed:
        return parsed
    for key, body in re.findall(r"'([^']+)':\s*\[(.*?)\]", text, re.S):
        parsed[key] = [normalize_line(x) for x in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)]
    return parsed


def _scene_slug(name):
    """Stable filename slug for a scene name (deterministic, collision-free here)."""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def _js_scene_object(categories):
    lines = ['{']
    for cat, items in categories.items():
        lines.append(f'    {json.dumps(cat)}: [')
        for item in items:
            lines.append(f'      {json.dumps(item)},')
        lines.append('    ],')
    lines.append('  }')
    return '\n'.join(lines)


def write_scene_outcomes():
    """Write a slim core (metadata + manifest) plus one lazy-loaded file per scene.

    The 7.6MB blob blocked page load; scene lines are only read when a player
    drills into a specific scene, so each scene now lives in
    js/data/scenes/<slug>.js and is fetched on demand. The core file keeps the
    small, always-needed metadata and a scene→file manifest.
    """
    data = generate_scene_outcomes()
    scenes_dir = DATA / 'scenes'
    scenes_dir.mkdir(exist_ok=True)

    manifest = {}
    keep = set()
    for scene, categories in data.items():
        slug = _scene_slug(scene)
        manifest[scene] = slug
        keep.add(f'{slug}.js')
        body = (
            f'/**\n * Scene outcomes: {scene}\n'
            ' * Generated by scripts/generate-outcomes.py — lazy-loaded by action-workflow.js.\n */\n'
            'window.BlingusData = window.BlingusData || {};\n'
            'window.BlingusData.sceneOutcomes = window.BlingusData.sceneOutcomes || {};\n'
            f'window.BlingusData.sceneOutcomes[{json.dumps(scene)}] = {_js_scene_object(categories)};\n'
        )
        (scenes_dir / f'{slug}.js').write_text(body)

    # Drop stale per-scene files so regeneration stays idempotent.
    for old in scenes_dir.glob('*.js'):
        if old.name not in keep:
            old.unlink()

    core = f"""/**
 * Scene metadata + lazy-load manifest for the workflow picker.
 * Per-scene outcome lines live in js/data/scenes/<slug>.js and load on demand.
 * Generated by scripts/generate-outcomes.py — edit templates there, then re-run.
 */
window.BlingusData = window.BlingusData || {{}};
window.BlingusData.sceneOutcomes = window.BlingusData.sceneOutcomes || {{}};

window.BlingusData.sceneTypes = {json.dumps(SCENE_TYPE)};
window.BlingusData.sceneIncompatiblePatterns = {{
  social: {json.dumps(SOCIAL_INCOMPATIBLE)},
  adventure: {json.dumps(ADVENTURE_INCOMPATIBLE)},
  dungeon: {json.dumps(DUNGEON_INCOMPATIBLE)},
  wilderness: {json.dumps(WILDERNESS_INCOMPATIBLE)},
  special: []
}};
window.BlingusData.sceneOutcomesManifest = {json.dumps(manifest)};
"""
    (DATA / 'scene-outcomes.js').write_text(core)
    total = sum(len(v2) for v in data.values() for v2 in v.values())
    print(f'Wrote scene-outcomes.js core + {len(data)} per-scene files ({total} lines)')


def expand_skill_checks():
    from skill_templates_v2 import SKILL_TEMPLATES as V2_SKILL_TEMPLATES  # noqa: WPS433

    _neutral = {**TYPE_NOUNS['wilderness'], 'place': 'the area', 'where': 'here',
                'who': 'the party', 'whose': "the party's"}
    expanded = {}
    for skill in SKILLS:
        for suffix in ('Success', 'Failure'):
            key = f'{skill} - {suffix}'
            lines = list(GENERIC_SKILL_LINES.get(skill, {}).get(suffix, []))
            for templates in (V2_SKILL_TEMPLATES[skill][suffix], LEGACY_SKILL_TEMPLATES[skill][suffix]):
                for template in templates:
                    line = normalize_line(template.format(**_neutral))
                    if line not in lines and line_is_valid(skill, line):
                        lines.append(line)
                    if len(lines) >= OUTCOME_POOL_SIZE:
                        break
                if len(lines) >= OUTCOME_POOL_SIZE:
                    break
            expanded[key] = [normalize_line(x) for x in lines[:OUTCOME_POOL_SIZE]]

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

    # Clean up an old non-idempotent bug that appended "My <category> lands with
    # perfect timing..." (plural subject + singular verb) on every run.
    _bad_pad = re.compile(r'^My .+ lands with perfect timing and unmistakable force$')
    for _pool in (hits, fails):
        for _key, _items in _pool.items():
            _pool[_key] = [l for l in _items if not _bad_pad.match(l)]

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
            if len(items) >= OUTCOME_POOL_SIZE:
                break
            if pad not in items:
                items.append(pad)
        hits[key] = items[:OUTCOME_POOL_SIZE]

    for key, items in fails.items():
        for line in extra_fails.get(key, []):
            if line not in items:
                items.append(line)
        for pad in fail_pad:
            if len(items) >= OUTCOME_POOL_SIZE:
                break
            if pad not in items:
                items.append(pad)
        fails[key] = items[:OUTCOME_POOL_SIZE]

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
    """Rebuild roleplay pools: curated source + hand lines + beats + generics.

    Reads actions-source.js (authoritative human copy) and the current
    actions-data.js (hand-curated extras), then prioritizes beat-driven lines
    over generic {place}-swap templates so thin scenes read like distinct
    moments instead of the same sentence with a new location.
    """
    path = DATA / 'actions-data.js'
    parsed = parse_string_map(path.read_text())
    if not parsed:
        # nested keys with single quotes fallback
        text = path.read_text()
        for key, body in re.findall(r"'([^']+)':\s*\[(.*?)\]", text, re.S):
            parsed[key] = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)

    curated_source = {}
    source_path = DATA / 'actions-source.js'
    if source_path.exists():
        source_text = source_path.read_text()
        alias = {'Walking in a Dungeon': 'Dungeon'}
        for key, body in re.findall(r"'([^']+)':\s*\[(.*?)\]", source_text, re.S):
            dest = alias.get(key, key)
            lines = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', body)
            curated_source.setdefault(dest, [])
            for line in lines:
                if line not in curated_source[dest]:
                    curated_source[dest].append(line)

    roleplay_templates = [
        "Scanning {place} for trouble while pretending to look casual (and cataloging exits for the ballad)",
        "Working {who} in {place} for gossip, drinks, or both—journalism with wings",
        "Checking exits in {place} because you're always planning an escape route—and maybe a chorus",
        "Watching {who} while pretending to mind my own business (poorly)",
        "Trying to look like you belong in {place} despite wings, sparkle, and opinions",
        "Collecting material from {who} for a future performance they'll regret encouraging",
        "Keeping one hand near your gear in {place} in case rust monsters—or drama—appears",
        "Asking innocent questions in {place} that aren't innocent at all",
        "Casually mentioning the Tarrasque in conversation to see who flinches first",
        "Polishing your buckles in {place} because rust monsters could be anywhere (you're not paranoid, you're prepared)",
        "Narrating your own actions in {place} under your breath like you're already on stage",
        "Flirting with danger in {place} the way you flirt with a chorus—loudly and on purpose",
        "People-watching in {place} and assigning everyone a chorus name",
        "Rehearsing a dramatic monologue in {place} under your breath",
        "Offering unsolicited performance notes to {who} in {place}",
        "Testing acoustics in {place} with a quiet hum",
        "Looking for a stage, a story, or trouble in {place}— ideally all three",
        "Making up nicknames for {who} in {place} and hoping they stick",
        "Pretending to read labels, signs, or menus in {place} while actually eavesdropping",
    ]
    from roleplay_flavor import roleplay_lines_for  # noqa: WPS433

    # Iterate in canonical scene order so output is deterministic (idempotent).
    rebuilt = {}
    for scene_id in SCENE_TYPE:
        ctx = vocab_for(scene_id)
        generic_lines = {normalize_line(t.format(**ctx)) for t in roleplay_templates}
        existing = [normalize_line(x) for x in parsed.get(scene_id, [])]
        # Hand-curated lines from actions-data.js, minus generic {place} swaps.
        hand_curated = [l for l in existing if l not in generic_lines]

        merged = []

        def add(line):
            line = normalize_line(line)
            if line and line not in merged:
                merged.append(line)

        for line in curated_source.get(scene_id, []):
            add(line)
        for line in hand_curated:
            add(line)
        # Beat-driven lines take priority over generic templates.
        for line in roleplay_lines_for(scene_id, ctx, limit=28):
            add(line)
        for template in roleplay_templates:
            add(template.format(**ctx))

        rebuilt[scene_id] = merged[:40]
    parsed = rebuilt

    header = """/**
 * Character action data for Blingus's Bardbook
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
