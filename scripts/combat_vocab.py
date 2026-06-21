"""Scene-aware critical hit/fail templates for weapons and magic."""

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

CRIT_FAIL_TEMPLATES = {
    'Polearms': [
        'My polearm catches on {overhead_snag}, getting stuck and leaving me exposed',
        'I misjudge the reach in {place} and overextend, losing my balance and stumbling forward',
        'My polearm gets tangled with {ally_tangle}, causing me to pull back awkwardly',
        'I swing too wide and my polearm snags on {snag_behind} behind me',
        'I trip over the haft on {floor_hazard} in {place}, sending myself sprawling',
        'The {light} in {place} hides {overhead_snag} until my polearm hits it',
        'I thrust past my target and bury the point in {backstop} instead',
        'My polearm clatters against {terrain_nat} in {where} and throws me off balance',
    ],
    'Arrows': [
        'My arrow glances off {backstop} in {place} and vanishes into {miss_surface}',
        'I fumble the draw and the shot sails over their head in {where}',
        'My bowstring snaps on {overhead_snag} and the arrow drops harmlessly',
        'I misjudge the wind in {place} and put the shot into {snag_behind}',
        'My quiver catches on {snag_behind} and the release goes wide',
        'I loose too early in {place} and the arrow skitters across {miss_surface}',
        'The arrow pins {backstop} instead of my target in {where}',
        'I slip on {floor_hazard} and send the shot into empty air in {place}',
    ],
    'Crossbolts': [
        'My crossbolt jams in the groove and fires late, clattering off {backstop}',
        'I misalign the shot in {place} and the bolt skids across {miss_surface}',
        'The heavy bolt catches {overhead_snag} and drops straight down in {where}',
        'I overcrank the winch and the bolt sails past them into {snag_behind}',
        'My bolt strikes {backstop} in {place} with a dull thunk instead of flesh',
        'I fumble the trigger in {where} and nearly hit {ally_tangle}',
        'The shot ricochets off {terrain_nat} in {place} and goes wide',
        'I misjudge the angle in {where} and bury the bolt in {backstop}',
    ],
    'Swords': [
        'My swing goes wide in {place} and I nearly clip {ally_tangle}',
        'I overextend in {where} and stumble, leaving my back open',
        'My blade catches {snag_behind} and sticks, pulling me off balance',
        'I slip on {floor_hazard} and carve through empty air in {place}',
        'My sword rings off {backstop} instead of finding a gap in their guard',
        'I misjudge the parry in {where} and leave my wrist exposed',
        'My follow-through in {place} sends sparks off {terrain_nat} and nowhere else',
        'I swing into {overhead_snag} and the blade sticks fast',
    ],
    'Knives': [
        'My dagger slips on {floor_hazard} in {place} and nearly cuts my own hand',
        'I throw too hard in {where} and the knife clatters off {backstop}',
        'My blade catches my sleeve on {snag_behind} and I stumble',
        'I misjudge the throw in {place} and the knife lands handle-first on {miss_surface}',
        'My grip fails in {where} and the dagger spins away toward {ally_tangle}',
        'I fumble the draw in {place} and drop the blade at my feet',
        'The throw sails over their head in {where} and sticks in {snag_behind}',
        'I slip in {place} and the knife skitters across {miss_surface}',
    ],
    'Blunt Weapons': [
        'I swing too hard in {place} and lose my balance on {floor_hazard}',
        'My mace catches {snag_behind} and wrenches my shoulder',
        'I overextend in {where} and the blow bounces harmlessly off their armor',
        'My grip fails and the weapon spins, nearly hitting {ally_tangle}',
        'I trip in {place} and my mace thuds into {miss_surface}',
        'The swing hits {backstop} in {where} with a jarring clang and no damage',
        'I misjudge the arc in {place} and clip {overhead_snag}',
        'My follow-through in {where} sends me stumbling into {terrain_nat}',
    ],
    'Axes and Hammers': [
        'I swing too hard in {place} and my axe bites into {backstop} instead',
        'My weapon catches {overhead_snag} and sticks, leaving me exposed',
        'I overextend in {where} and the blow bounces off armor with a dull thud',
        'My grip slips on {floor_hazard} and the axe nearly flies free',
        'I trip in {place} and carve a useless groove in {miss_surface}',
        'The hammer strike in {where} hits {terrain_nat} and jars my arms',
        'I misjudge the swing in {place} and clip {snag_behind}',
        'My axe rings off {backstop} in {where} and leaves me off balance',
    ],
    'Other Weapons': [
        'My weapon slips in {place} and tumbles across {miss_surface}',
        'I fumble the attack in {where} and hit {backstop} instead of my foe',
        'My grip fails mid-swing in {place} and the weapon spins wrong',
        'I trip on {floor_hazard} and carve through empty air in {where}',
        'My weapon snags on {snag_behind} and refuses to come free',
        'I misjudge the angle in {place} and the strike goes wide',
        'The blow in {where} clatters off {terrain_nat} with no effect',
        'I catch {overhead_snag} in {place} and lose the rhythm entirely',
    ],
    'Fire': [
        'My fire spell fizzles in {place}, leaving only warm air and embarrassment',
        'I misaim in {where} and scorch {backstop} instead of my target',
        'The flames sputter out near {snag_behind} before reaching them',
        'My spell backfires in {place}, singeing my own fingers',
        'The heat dies in {where} and the crowd in {place} notices',
        'I lose concentration in {place} and the fire dies to harmless sparks',
        'The blaze erupts toward {overhead_snag} in {where} instead of my foe',
        'My flames gutter out on {floor_hazard} in {place}',
    ],
    'Cold': [
        'My ice magic produces only a breeze in {place} instead of a freezing blast',
        'I mispronounce the word in {where} and the frost melts on {miss_surface}',
        'The cold spell backfires in {place}, numbing my own fingers',
        'My freezing magic fails against the {light} in {where}',
        'I lose focus in {place} and the ice never forms',
        'The spell hits {backstop} in {where} and does nothing useful',
        'My frost sputters out near {snag_behind} in {place}',
        'The chill dissipates in {where} before it reaches them',
    ],
    'Lightning': [
        'My bolt fizzles into static in {place} and crackles harmlessly',
        'I misaim in {where} and the arc strikes {backstop} instead',
        'The lightning dies in {place} before crossing the gap',
        'My spell backfires in {where}, shocking my own hand',
        'I lose concentration in {place} and only sparks remain',
        'The bolt grounds into {terrain_nat} in {where} with no harm done',
        'My thunderous cast in {place} produces only a faint pop',
        'The electricity flashes toward {overhead_snag} in {where} and fades',
    ],
    'Thunder': [
        'My thunder spell whispers in {place} instead of roaring',
        'I misaim in {where} and the sonic blast rattles {backstop} only',
        'The sound dies in {place} before it reaches them',
        'My ears ring in {where} from my own botched casting',
        'I lose focus in {place} and the spell collapses',
        'The shockwave in {where} kicks up dust on {miss_surface} and nothing else',
        'My voice cracks mid-incantation in {place} and the magic fails',
        'The thunder rolls toward {snag_behind} in {where} and fades',
    ],
    'Psychic': [
        'My psychic assault fizzles in {place}, leaving only a mild headache',
        'I misaim in {where} and the mental push hits {backstop} instead',
        'The thought-blade dies in {place} before reaching their mind',
        'My own thoughts jumble in {where} and the spell collapses',
        'I lose focus in {place} and they barely notice the attempt',
        'The psychic wave in {where} scatters off {terrain_nat} and fades',
        'My concentration breaks in {place} and the magic unravels',
        'The mental strike in {where} feels like a rude suggestion, not a crit fail',
    ],
    'Force': [
        'My force spell pushes only air in {place}',
        'I misaim in {where} and the blast shoves {backstop} instead of them',
        'The magical pressure dies in {place} before landing',
        'My spell backfires in {where} and pushes me a step backward',
        'I lose focus in {place} and the energy dissipates',
        'The blast in {where} kicks dust across {miss_surface} and stops',
        'My gesture falters in {place} and the force never coheres',
        'The push in {where} glances off {snag_behind} and fizzles',
    ],
    'Necrotic': [
        'My necrotic magic sputters in {place}, leaving only a chill',
        'I misaim in {where} and the decay licks {backstop} harmlessly',
        'The dark energy dies in {place} before reaching them',
        'My spell backfires in {where} and my hands feel briefly wrong',
        'I lose focus in {place} and the curse unravels',
        'The withering pulse in {where} fades against {terrain_nat}',
        'My incantation slips in {place} and the magic collapses',
        'The necrotic wave in {where} dissipates near {snag_behind}',
    ],
    'Radiant': [
        'My radiant spell glows dimly in {place} instead of blazing',
        'I misaim in {where} and the light washes {backstop} uselessly',
        'The holy energy dies in {place} before striking true',
        'My own eyes dazzle in {where} from the botched cast',
        'I lose focus in {place} and the brilliance fades',
        'The beam in {where} scatters off {terrain_nat} and fades',
        'My prayer stumbles in {place} and the magic unravels',
        'The radiance in {where} flickers out near {snag_behind}',
    ],
    'Acid': [
        'My acid spell hisses out in {place}, leaving only vapor',
        'I misaim in {where} and the splash eats {backstop} without reaching them',
        'The corrosive bolt dies in {place} before landing',
        'My fingers sting in {where} from my own botched casting',
        'I lose focus in {place} and the acid never forms',
        'The caustic spray in {where} patters harmlessly on {miss_surface}',
        'My gesture falters in {place} and the spell collapses',
        'The acid in {where} sizzles against {terrain_nat} and stops',
    ],
}

CRIT_HIT_TEMPLATES = {
    'Polearms': [
        'My polearm strikes with devastating reach in {place}, the blade finding its mark',
        'I extend past their guard in {where} and drive the point home with a sickening thud',
        'My weapon\'s length gives me the edge in {place} and the strike lands clean',
        'A masterful thrust in {where} sends the tip through their defenses',
        'My polearm finds the gap in {light} and bites deep into my foe',
        'I hook their guard in {place} and follow through with a brutal crit',
        'My reach in {where} keeps me safe while the blade still finds flesh',
        'The polearm strike in {place} connects with unmistakable force against my target',
    ],
    'Arrows': [
        'My arrow finds its mark in {place}, sinking deep with a satisfying thud',
        'I loose a shot in {where} that threads the chaos and nails my target squarely',
        'My arrowhead buries itself in their flesh in {place} with brutal precision',
        'The shot in {where} punches through leather and keeps going until it finds bone',
        'My arrow strikes true in {place}, tearing through fabric and flesh alike',
        'I capitalize on the opening in {where} and put the arrow exactly where it hurts',
        'The arrow in {place} lands with perfect timing and unmistakable force',
        'My shot in {where} finds the gap and my target staggers backward',
    ],
    'Crossbolts': [
        'My bolt strikes in {place} with thunderous impact, piercing deep into my target',
        'A perfectly aimed shot in {where} finds the gap between armor plates',
        'My crossbolt embeds in {place} with force enough to splinter bone',
        'The heavy projectile in {where} tears through their guard and keeps going',
        'My bolt strikes true in {place} and my foe crumples from the impact',
        'I drive the crossbolt home in {where} with devastating precision',
        'The shot in {place} connects cleanly and leaves no doubt it was a crit',
        'My crossbolt in {where} finds flesh where armor failed',
    ],
    'Swords': [
        'My blade cuts deep in {place}, drawing a line of crimson through their guard',
        'A masterful swing in {where} sends steel through their defense with a ringing bite',
        'My sword strikes true in {place}, sparks flying as metal meets flesh',
        'I riposte in {where} so cleanly their weapon skitters away',
        'My blade opens a line across their guard in {place} and blood follows',
        'The sword strike in {where} lands with deadly precision on my foe',
        'I capitalize on the opening in {place} and drive the hit home',
        'My sword in {where} finds the gap and my target reels from the blow',
    ],
    'Knives': [
        'My dagger cuts deep in {place}, sliding along bone with surgical precision',
        'My blade finds the gap in {where} and sinks in up to the hilt',
        'A masterful throw in {place} sends my knife spinning into my target',
        'My dagger strikes true in {where}, the small blade doing outsized damage',
        'I slip the knife between their ribs in {place} with a cruel twist',
        'The throw in {where} embeds deep and my foe gasps',
        'My knife in {place} lands with perfect timing and unmistakable force',
        'I capitalize on the opening in {where} and drive the blade home',
    ],
    'Blunt Weapons': [
        'My mace strikes in {place} with bone-crushing force my target cannot shrug off',
        'A masterful swing in {where} sends my weapon through their guard',
        'My blunt weapon hits in {place} with thunderous force against my foe',
        'The blow in {where} shatters armor and bone alike',
        'My strike in {place} sends them flying from the impact',
        'I drive the mace home in {where} with brutal efficiency',
        'The crit in {place} connects cleanly and leaves no doubt',
        'My weapon in {where} finds flesh with devastating power',
    ],
    'Axes and Hammers': [
        'My axe cleaves in {place} with brutal force, leaving a gaping wound',
        'A masterful swing in {where} sends the blade through their guard',
        'My hammer strikes in {place} with thunderous force against my target',
        'The heavy blow in {where} tears through multiple layers of defense',
        'My weapon finds its mark in {place} with devastating power',
        'I drive the strike home in {where} and my foe spins from the impact',
        'The crit in {place} connects cleanly against my enemy',
        'My axe in {where} bites deep where armor failed',
    ],
    'Other Weapons': [
        'My weapon strikes in {place} with brutal force against my target',
        'An unconventional blow in {where} catches them off guard and lands hard',
        'My strike in {place} finds its mark with deadly precision',
        'I drive the attack home in {where} and my foe reels',
        'The blow in {place} connects with devastating force',
        'My weapon in {where} lands with perfect timing and unmistakable impact',
        'I capitalize on the opening in {where} and the crit lands clean',
        'The strike in {where} sends my target stumbling backward',
    ],
    'Fire': [
        'Flames burst forth in {place} and wrap my target in searing heat',
        'My fire spell in {where} detonates against my foe with explosive force',
        'Heat races across their body in {place}, leaving scorched trails',
        'My flames in {where} find the gap in their armor and cling',
        'The blaze in {place} erupts with crit force against my target',
        'I scorch them in {where} with a bloom of heat they cannot shrug off',
        'My fire strike in {place} lands with devastating precision',
        'The spell in {where} leaves my foe smoking and staggered',
    ],
    'Cold': [
        'Frost erupts in {place} and locks my target in brutal chill',
        'My ice magic in {where} bites deep through their defenses',
        'Cold spreads across them in {place} with crit force',
        'The freezing spell in {where} finds flesh and does not let go',
        'My frost in {place} lands with shattering precision',
        'Ice crawls over my target in {where} and leaves them gasping',
        'The cold strike in {where} connects with devastating force',
        'My spell in {where} leaves rime on their armor and pain beneath it',
    ],
    'Lightning': [
        'Lightning arcs in {place} and strikes my target with crackling force',
        'My bolt in {where} finds them and throws their muscles into spasm',
        'Electricity leaps in {place} and lands with crit precision',
        'The lightning in {where} sears through their guard',
        'My spell in {place} detonates against my foe in a flash',
        'The bolt in {where} connects cleanly and leaves smoke in the air',
        'Thunder follows the strike in {place} as my target staggers',
        'My lightning in {where} lands with unmistakable crit force',
    ],
    'Thunder': [
        'A sonic blast in {place} hits my target like a hammer made of sound',
        'My thunder spell in {where} erupts against my foe with crushing force',
        'The shockwave in {place} lands with crit precision on my target',
        'Sound becomes violence in {where} and my enemy reels',
        'My thunder in {place} connects with devastating force',
        'The blast in {where} rattles their bones and my crit lands clean',
        'I unleash sonic force in {where} and my target crumples',
        'The spell in {where} roars against my foe and leaves ears ringing',
    ],
    'Psychic': [
        'My psychic assault in {place} slams into their mind with crit force',
        'Mental blades in {where} find my target and leave them reeling',
        'The thought-strike in {place} lands with devastating precision',
        'I hammer their will in {where} and they stagger from the impact',
        'My spell in {place} burrows into their mind and does not miss',
        'Psychic force in {where} connects cleanly against my foe',
        'The assault in {place} leaves my target clutching their head',
        'My mental strike in {where} lands with unmistakable crit power',
    ],
    'Force': [
        'A blast of force in {place} slams into my target with crit power',
        'My spell in {where} hits them like an invisible battering ram',
        'Magical pressure in {place} finds my foe and throws them back',
        'The force strike in {where} connects with devastating precision',
        'I unleash raw magic in {place} and my target staggers',
        'The blast in {where} lands cleanly against my enemy',
        'My force spell in {place} hits with unmistakable crit impact',
        'Energy in {where} compresses against my foe and lands hard',
    ],
    'Necrotic': [
        'Dark energy in {place} wracks my target with crit force',
        'My necrotic spell in {where} withers flesh where it lands',
        'Decay in {place} finds my foe and does not let go',
        'The curse in {where} connects with devastating precision',
        'My magic in {place} leaves my target gray and gasping',
        'Necrotic power in {where} lands cleanly against my enemy',
        'The withering strike in {where} hits with unmistakable force',
        'My spell in {place} eats at their strength and my crit lands clean',
    ],
    'Radiant': [
        'Holy light in {place} sears my target with crit brilliance',
        'My radiant spell in {where} finds my foe and burns bright',
        'Divine force in {place} lands with devastating precision',
        'The beam in {where} connects against my enemy with crit power',
        'Radiance in {place} wraps my target and does not miss',
        'My spell in {where} leaves them dazzled and wounded',
        'The holy strike in {where} lands with unmistakable force',
        'Light in {place} becomes a weapon and my crit connects clean',
    ],
    'Acid': [
        'Corrosive magic in {place} eats through armor and finds flesh',
        'My acid spell in {where} splashes my target with crit force',
        'Caustic energy in {place} lands with devastating precision',
        'The acid in {where} finds my foe and hisses where it bites',
        'My spell in {place} leaves smoking trails on their gear and skin',
        'The splash in {where} connects cleanly against my enemy',
        'Acid in {place} lands with unmistakable crit impact',
        'My corrosive strike in {where} melts guard and hurts what is beneath',
    ],
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
