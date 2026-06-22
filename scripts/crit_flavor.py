"""Scene-beat crit hit lines — structurally distinct from template swaps."""

from scene_flavor import SCENE_BEATS

CRIT_HIT_BEAT_TEMPLATES = {
    'Polearms': [
        'They flinch at {beat} and I punish the opening with a thrust that lands clean',
        'I use {beat} to mask my reach and drive the point home before they adjust',
        'While everyone watches {beat}, my polearm finds the gap in their guard',
        'I hook their weapon on {beat} and follow through with a crit worth narrating',
        'Reach wins when {beat} steals their attention—I strike before they recover',
    ],
    'Arrows': [
        'They duck toward {beat} and expose the line my arrow was waiting for',
        'I loose while {beat} distracts them and the shot lands with a satisfying thud',
        'The angle off {beat} threads their guard and sinks deep',
        'I capitalize when {beat} makes them look the wrong way—the arrow still finds flesh',
        'My shot ricochets once off {beat} and still nails my target—lucky, artful, mine',
    ],
    'Crossbolts': [
        'The winch sings while {beat} holds their eye—the bolt punches through anyway',
        'I fire as {beat} breaks their concentration and the heavy shot lands true',
        'They step toward {beat} and walk into the crossbolt I already loosed',
        'While {beat} steals the room, the bolt finds armor gaps they forgot',
        'I braced the shot using {beat} as cover—the crit lands before they turn',
    ],
    'Swords': [
        'They glance at {beat} and I riposte through the opening before they recover',
        'I use {beat} to hide my footwork, then open a crimson line across their guard',
        'My blade rings once off {beat} and still finds flesh on the follow-through',
        'They overcommit toward {beat} and I punish the mistake with steel',
        'I feint at {beat}, they flinch, and my sword finds the gap cleanly',
    ],
    'Knives': [
        'They reach for {beat} and leave their ribs open for my blade',
        'I slip past {beat} and bury the knife to the hilt before they react',
        'While {beat} holds their gaze, my dagger finds the soft spot they forgot',
        'I use {beat} as misdirection and the throw lands handle-deep',
        'They turn toward {beat} and feel my knife before they finish turning',
    ],
    'Blunt Weapons': [
        'They brace against {beat} and leave their flank open for my mace',
        'I swing as {beat} cracks—the blow lands with percussion-section force',
        'My weapon connects while they stare at {beat} like the crit was choreographed',
        'They step into {beat} and I meet them with a blow that rewrites posture',
        'I use {beat} to time the swing and crush guard and bone together',
    ],
    'Axes and Hammers': [
        'They hesitate at {beat} and my axe cleaves through before they raise steel',
        'I hook their shield on {beat} and follow with a blow that drops them a knee',
        'The hammer falls while {beat} steals their focus—impact, gasp, crit',
        'They duck toward {beat} and catch the blade they were not watching',
        'I use {beat} to mask the wind-up and split their defense clean',
    ],
    'Other Weapons': [
        'They fix on {beat} and my unconventional strike lands before they adapt',
        'I weaponize the distraction of {beat} and connect with show-off precision',
        'While {beat} breaks their rhythm, my strike finds flesh anyway',
        'They never see past {beat} until my crit connects',
        'I turn {beat} into the setup and the hit into the punchline',
    ],
    'Fire': [
        'Heat blooms around {beat} and wraps my foe before they can step back',
        'I detonate flame off {beat} and scorch them where armor gaps open',
        'They dodge toward {beat} and into the cone I already cast',
        'While {beat} steals their attention, the fire finds flesh and clings',
        'My spell uses {beat} as cover and still burns true on my target',
    ],
    'Cold': [
        'Frost races from {beat} across the floor and locks my foe mid-step for the crit',
        'They slip toward {beat} and my ice finds exposed skin before they recover',
        'I blast cold off {beat} and their breath fogged—then they stagger from the hit',
        'While {beat} distracts them, the freeze lands with brutal precision',
        'My spell turns {beat} into a mirror of ice and shatters their guard with it',
    ],
    'Lightning': [
        'Lightning jumps from {beat} to them before thunder finishes arguing',
        'They touch {beat} and my bolt uses the moment to find flesh',
        'While {beat} holds their eye, the lightning still finds the gap',
        'I call the strike down near {beat} and it arcs into my foe anyway',
        'They flinch at {beat} and the lightning beats the flinch to the punch',
    ],
    'Thunder': [
        'Thunder breaks off {beat} and hits them like a door slammed on their ribs',
        'They shout at {beat} and miss my spell detonating beside them',
        'While {beat} rattles the room, the shockwave still finds my target',
        'I time the blast with {beat} and the crit lands on the downbeat',
        'They cover their ears at {beat} and leave their guard open to thunder',
    ],
    'Psychic': [
        'I wedge pain behind {beat} in their mind and they reel from the crit',
        'They focus on {beat} and leave their thoughts open for me to twist',
        'While {beat} steals the scene, the psychic lash still lands true',
        'I use {beat} as a hook in their memory and pull until they stagger',
        'They blink at {beat} and my spell is already inside their skull',
    ],
    'Force': [
        'Force erupts from {beat} and slams my foe before they finish reacting',
        'They step toward {beat} and into the invisible hammer I already cast',
        'While {beat} distracts them, the telekinetic blow lands clean',
        'I shove off {beat} with magic and crush their guard anyway',
        'They brace against {beat} and leave the angle open for force to punch through',
    ],
    'Necrotic': [
        'Decay spreads from {beat} to them before they notice the smell',
        'They touch {beat} and my curse rides the contact into their veins',
        'While {beat} holds their gaze, the withering still finds flesh',
        'I use {beat} as a focus and drain strength until they crumple',
        'They flinch away from {beat} and into the necrotic wave waiting there',
    ],
    'Radiant': [
        'Holy light flares off {beat} and sears my foe where armor fails',
        'They turn toward {beat} and catch the radiance I already released',
        'While {beat} steals the room, the beam still finds my enemy clean',
        'I use {beat} as a mirror for light and blind them into the crit',
        'They hesitate at {beat} and judgment lands before they raise steel',
    ],
    'Acid': [
        'Acid hisses off {beat} and splashes my foe where leather gaps open',
        'They dodge toward {beat} and into the caustic arc I already cast',
        'While {beat} distracts them, the corrosive bolt still finds flesh',
        'I use {beat} to hide the gesture and melt guard before they notice',
        'They reach for {beat} and get burning hands plus my crit to follow',
    ],
}


CRIT_FAIL_BEAT_TEMPLATES = {
    'Polearms': [
        '{beat} throws off my timing and the thrust sails past, leaving my reach hopelessly overextended',
        'I lunge as {beat} distracts me and the polearm clatters off stone, nowhere near my target',
        'I catch the haft on {beat} mid-swing and the point goes wide of everyone',
        'I plant the butt wrong during {beat} and nearly trip over my own reach',
    ],
    'Arrows': [
        'I loose as {beat} catches my eye and the arrow buries itself in scenery, not flesh',
        '{beat} jostles my draw and the shot wobbles harmlessly over their head',
        'My string fouls on {beat} and the arrow flops to the ground a few feet away',
        'I rush the shot past {beat} and it glances off something solid, gone for good',
    ],
    'Crossbolts': [
        'I overcrank the winch watching {beat} and the bolt snaps off course entirely',
        '{beat} breaks my aim and the heavy bolt thuds into a wall well short of my target',
        'The mechanism jams during {beat} and the shot dribbles out without force',
        'I fire too early past {beat} and the bolt vanishes into the dark, missing clean',
    ],
    'Swords': [
        'I swing wide as {beat} pulls my focus and the blade meets only empty air',
        '{beat} fouls my footwork and I stumble past my target, sword finding nothing',
        'My blade rings off stone during {beat} and the opening closes before I recover',
        'I overcommit toward {beat} and leave myself sprawling, nowhere near a hit',
    ],
    'Knives': [
        'I throw as {beat} distracts me and the dagger sails wide over their head',
        '{beat} jostles my wrist and the knife tumbles handle-first into the dirt',
        'My grip slips during {beat} and the blade skitters off harmlessly',
        'I fumble the draw watching {beat} and the throw goes nowhere useful',
    ],
    'Blunt Weapons': [
        'I swing as {beat} steals my balance and the mace whistles past, hitting nothing',
        '{beat} throws my weight off and the blow thuds uselessly into the ground',
        'My grip fails mid-swing during {beat} and the weapon nearly flies from my hands',
        'I overswing toward {beat} and stagger past my target, wide open and graceless',
    ],
    'Axes and Hammers': [
        'I cleave at {beat} and the axe bites deep into scenery instead of my foe',
        '{beat} ruins my wind-up and the hammer drags me off balance, missing wide',
        'My swing catches on {beat} and the blade wrenches free of my hands',
        'I commit too hard watching {beat} and bury the head harmlessly, leaving myself exposed',
    ],
    'Other Weapons': [
        'I improvise around {beat} and the strike goes embarrassingly wide',
        '{beat} breaks my rhythm and my unconventional swing finds only air',
        'My grip fails during {beat} and the weapon clatters away from my target',
        'I get too clever near {beat} and fumble the whole maneuver loudly',
    ],
    'Fire': [
        'I lose the gesture as {beat} distracts me and the flames gutter out before reaching anyone',
        '{beat} breaks my focus and the fire scorches the ground well short of my target',
        'My spell fizzles during {beat} into harmless sparks that drift up and die',
        'I misaim past {beat} and singe scenery instead of my foe, wide and useless',
    ],
    'Cold': [
        'I lose concentration as {beat} catches me and the frost melts before it reaches them',
        '{beat} fouls the casting and the ice spreads uselessly across the floor',
        'My spell sputters during {beat} into a puff of cold air and nothing more',
        'I misjudge the angle past {beat} and frost a wall instead of my target',
    ],
    'Lightning': [
        'I lose the thread as {beat} distracts me and the bolt dies before reaching them',
        '{beat} jolts my aim and the arc strikes scenery, wrong target, full voltage',
        'My spell fizzles during {beat} into a harmless crackle of static',
        'I miscast past {beat} and the lightning grounds out short of my foe',
    ],
    'Thunder': [
        'I lose the rhythm as {beat} throws me and the sound dies before it reaches them',
        '{beat} swallows my spell and the shockwave fizzles into a dull thump',
        'My casting falters during {beat} and the boom rolls past my target harmlessly',
        'I mistime the blast around {beat} and rattle only myself, missing clean',
    ],
    'Psychic': [
        'I lose the contact as {beat} distracts me and they barely notice the push',
        '{beat} scatters my focus and the mental lash finds empty air, not their mind',
        'My spell slips during {beat} and rebounds into a headache for me alone',
        'I overreach past {beat} and the psychic thread snaps, wide of my target',
    ],
    'Force': [
        'I lose the shape as {beat} catches me and the force blast dies before reaching them',
        '{beat} fouls the gesture and the invisible hammer slams scenery, not my foe',
        'My spell collapses during {beat} into a shove that barely stirs the dust',
        'I misaim past {beat} and the telekinetic blow goes wide and graceless',
    ],
    'Necrotic': [
        'I lose the curse as {beat} distracts me and the decay fizzles before it spreads',
        '{beat} breaks my focus and the withering touch finds nothing but air',
        'My spell sputters during {beat} and the rot crawls harmlessly across stone',
        'I misjudge the reach past {beat} and the necrotic wave dies short of my target',
    ],
    'Radiant': [
        'I lose the light as {beat} catches me and the beam dies before reaching them',
        '{beat} fouls the casting and the radiance flares uselessly into the rafters',
        'My spell gutters during {beat} into a faint glow and nothing more',
        'I misaim past {beat} and sear scenery instead of my foe, wide and bright',
    ],
    'Acid': [
        'I lose the gesture as {beat} distracts me and the acid splashes short of my target',
        '{beat} jostles the cast and the caustic arc hisses into the ground, missing wide',
        'My spell fizzles during {beat} into a thin, harmless dribble',
        'I misjudge the throw past {beat} and the acid eats scenery, not my foe',
    ],
}


def _beat_flavor(templates_by_cat, scene_id, ctx, category, limit):
    beats = SCENE_BEATS.get(scene_id, [])
    templates = templates_by_cat.get(category, [])
    if not beats or not templates:
        return []
    lines = []
    for beat in beats:
        for template in templates:
            fmt = dict(ctx)
            fmt['beat'] = beat
            try:
                line = template.format(**fmt)
            except KeyError:
                continue
            if line not in lines:
                lines.append(line)
            if len(lines) >= limit:
                return lines
    return lines


def crit_hit_flavor_lines(scene_id, ctx, category, limit=16):
    return _beat_flavor(CRIT_HIT_BEAT_TEMPLATES, scene_id, ctx, category, limit)


def crit_fail_flavor_lines(scene_id, ctx, category, limit=16):
    return _beat_flavor(CRIT_FAIL_BEAT_TEMPLATES, scene_id, ctx, category, limit)
