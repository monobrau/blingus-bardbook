"""Scene-beat crit hit lines — structurally distinct from template swaps."""

from scene_flavor import SCENE_BEATS

CRIT_HIT_BEAT_TEMPLATES = {
    'Polearms': [
        'I use {beat} as cover for my reach and drive the point home before they adjust',
        'With everyone watching {beat}, my polearm finds the gap in their guard',
        'I hook their weapon near {beat} and follow through with a crit worth narrating',
        'I let {beat} steal their attention and strike before they recover',
        'I time the thrust to {beat} and the point lands clean against my foe',
    ],
    'Arrows': [
        'I loose past {beat} and the shot lands in my foe with a satisfying thud',
        'The angle off {beat} threads their guard and sinks deep',
        'I capitalize on {beat} pulling their eye—the arrow still finds flesh',
        'My shot ricochets once off {beat} and still nails my target—lucky, artful, mine',
        'I read {beat} for the opening and the arrow buries itself in their side',
    ],
    'Crossbolts': [
        'I brace the shot against {beat} and the bolt punches through anyway',
        'I fire past {beat} and the heavy shot lands true in my enemy',
        'I use {beat} as cover and the bolt finds armor gaps they forgot',
        'With {beat} stealing the room, the crit lands before they turn',
        'I crank and loose behind {beat} and the bolt sinks deep into my foe',
    ],
    'Swords': [
        'I riposte past {beat} and open a crimson line across their guard',
        'I use {beat} to hide my footwork, then find flesh on the follow-through',
        'My blade rings once off {beat} and still bites into my foe',
        'I feint toward {beat} and my sword finds the gap cleanly',
        'I let {beat} pull their guard and punish the mistake with steel',
    ],
    'Knives': [
        'I slip past {beat} and bury the knife to the hilt before they react',
        'With their gaze caught on {beat}, my dagger finds the soft spot they forgot',
        'I use {beat} as misdirection and the throw lands handle-deep in my foe',
        'I read {beat} for the angle and the blade slides between their ribs',
        'I cut past {beat} and feel the knife find its mark',
    ],
    'Blunt Weapons': [
        'I swing past {beat} and the blow lands with percussion-section force',
        'My weapon connects while they stare at {beat} like the crit was choreographed',
        'I use {beat} to time the swing and crush guard and bone together',
        'I let {beat} steal their footing and meet them with a posture-rewriting blow',
        'I read {beat} for the opening and the mace finds their flank',
    ],
    'Axes and Hammers': [
        'I cleave past {beat} before they raise steel and the axe lands clean',
        'I hook their shield near {beat} and follow with a blow that drops them a knee',
        'With {beat} stealing their focus, the hammer falls—impact, gasp, crit',
        'I use {beat} to mask the wind-up and split their defense clean',
        'I time the swing to {beat} and the blade bites into my foe',
    ],
    'Other Weapons': [
        'I weaponize the distraction of {beat} and connect with show-off precision',
        'With {beat} breaking their rhythm, my strike finds flesh anyway',
        'They never see past {beat} until my crit connects',
        'I turn {beat} into the setup and the hit into the punchline',
        'I use {beat} as cover and my unconventional strike lands before they adapt',
    ],
    'Fire': [
        'I detonate flame past {beat} and scorch them where armor gaps open',
        'With {beat} stealing their attention, the fire finds flesh and clings',
        'I use {beat} as cover and the spell still burns true on my target',
        'I read {beat} for the angle and the cone wraps my foe before they step back',
        'Heat blooms past {beat} and catches my enemy mid-turn',
    ],
    'Cold': [
        'I blast cold past {beat} and the ice finds exposed skin on my foe',
        'With {beat} distracting them, the freeze lands with brutal precision',
        'I use {beat} as cover and frost locks my enemy mid-step for the crit',
        'I read {beat} for the opening and the ice shatters their guard',
        'Frost races past {beat} and catches my foe before they recover',
    ],
    'Lightning': [
        'I read {beat} for the line and the bolt finds flesh',
        'With their eye caught on {beat}, the lightning still finds the gap',
        'I call the strike down near {beat} and it arcs into my foe anyway',
        'I loose the bolt past {beat} and it beats their flinch to the punch',
        'Lightning jumps past {beat} and into my enemy before thunder finishes arguing',
    ],
    'Thunder': [
        'With {beat} rattling the room, the shockwave still finds my target',
        'I time the blast to {beat} and the crit lands on the downbeat',
        'I read {beat} for the moment and the boom hits them like a slammed door',
        'I loose the wave past {beat} and it crushes my foe mid-shout',
        'Thunder breaks past {beat} and slams into my enemy',
    ],
    'Psychic': [
        'I read {beat} for the opening and the psychic lash lands true',
        'With {beat} stealing the scene, the spell still finds their mind',
        'I use {beat} as a hook in their memory and pull until they stagger',
        'I wedge pain behind {beat} and they reel from the crit',
        'I slip past {beat} and the spell is already inside their skull',
    ],
    'Force': [
        'I shove off {beat} with magic and crush their guard anyway',
        'With {beat} distracting them, the telekinetic blow lands clean',
        'I read {beat} for the angle and force punches through their guard',
        'Force erupts past {beat} and slams my foe before they react',
        'I time the blast to {beat} and the invisible hammer finds my enemy',
    ],
    'Necrotic': [
        'I use {beat} as a focus and drain strength until they crumple',
        'With their gaze caught on {beat}, the withering still finds flesh',
        'I read {beat} for the contact and the curse rides into their veins',
        'Decay spreads past {beat} and into my foe before they notice the smell',
        'I cast behind {beat} and the necrotic wave catches my enemy',
    ],
    'Radiant': [
        'I use {beat} as a mirror for light and blind them into the crit',
        'With {beat} stealing the room, the beam still finds my enemy clean',
        'I read {beat} for the angle and holy light sears my foe where armor fails',
        'Radiance flares past {beat} and judgment lands before they raise steel',
        'I loose the beam behind {beat} and it burns true on my target',
    ],
    'Acid': [
        'I use {beat} to hide the gesture and melt their guard before they notice',
        'With {beat} distracting them, the corrosive bolt still finds flesh',
        'I read {beat} for the opening and acid splashes my foe where leather gaps',
        'Acid hisses past {beat} and eats into my enemy',
        'I cast behind {beat} and the caustic arc catches my target clean',
    ],
}


CRIT_FAIL_BEAT_TEMPLATES = {
    'Polearms': [
        'Thrown by {beat}, I overextend and the thrust sails past, nowhere near my target',
        'Distracted by {beat}, I lunge and the polearm clatters off stone',
        'I catch the haft against {beat} mid-swing and the point goes wide of everyone',
        'Fumbling near {beat}, I plant the butt wrong and nearly trip over my own reach',
    ],
    'Arrows': [
        'Caught watching {beat}, I loose and the arrow buries itself in scenery, not flesh',
        'With {beat} jostling my draw, the shot wobbles harmlessly over their head',
        'My string fouls near {beat} and the arrow flops to the ground a few feet away',
        'I rush the shot past {beat} and it glances off something solid, gone for good',
    ],
    'Crossbolts': [
        'Overcranking the winch over {beat}, I send the bolt snapping off course entirely',
        'With {beat} breaking my aim, the heavy bolt thuds into a wall short of my target',
        'The mechanism jams as I fuss over {beat} and the shot dribbles out without force',
        'I fire too early past {beat} and the bolt vanishes into the dark, missing clean',
    ],
    'Swords': [
        'Thrown by {beat}, I swing wide and the blade meets only empty air',
        'With {beat} fouling my footwork, I stumble past my target, sword finding nothing',
        'My blade rings off stone near {beat} and the opening closes before I recover',
        'Overcommitting toward {beat}, I leave myself sprawling, nowhere near a hit',
    ],
    'Knives': [
        'Distracted by {beat}, I throw and the dagger sails wide over their head',
        'With {beat} jostling my wrist, the knife tumbles handle-first into the dirt',
        'My grip slips near {beat} and the blade skitters off harmlessly',
        'Fumbling the draw over {beat}, I send the knife skittering off harmlessly',
    ],
    'Blunt Weapons': [
        'Thrown off by {beat}, I swing and the mace whistles past, hitting nothing',
        'With {beat} stealing my weight, the blow thuds uselessly into the ground',
        'My grip fails mid-swing near {beat} and the weapon nearly flies from my hands',
        'Overswinging toward {beat}, I stagger past my target, wide open and graceless',
    ],
    'Axes and Hammers': [
        'I cleave toward {beat} and the axe bites deep into scenery instead of my foe',
        'With {beat} ruining my wind-up, the hammer drags me off balance, missing wide',
        'My swing catches near {beat} and the blade wrenches free of my hands',
        'Committing too hard over {beat}, I bury the head harmlessly and leave myself exposed',
    ],
    'Other Weapons': [
        'Improvising around {beat}, I send the strike embarrassingly wide',
        'With {beat} breaking my rhythm, my unconventional swing finds only air',
        'My grip fails near {beat} and the weapon clatters away from my target',
        'Getting too clever over {beat}, I fumble the whole maneuver loudly',
    ],
    'Fire': [
        'Distracted by {beat}, I lose the gesture and the flames gutter out before reaching anyone',
        'With {beat} breaking my focus, the fire scorches the ground short of my target',
        'My spell fizzles near {beat} into harmless sparks that drift up and die',
        'I misaim past {beat} and singe scenery instead of my foe, wide and useless',
    ],
    'Cold': [
        'Caught by {beat}, I lose concentration and the frost melts before it reaches them',
        'With {beat} fouling the casting, the ice spreads uselessly across the floor',
        'My spell sputters near {beat} into a puff of cold air and nothing more',
        'Misjudging the angle past {beat}, I frost a wall instead of my target',
    ],
    'Lightning': [
        'Distracted by {beat}, I lose the thread and the bolt dies before reaching them',
        'With {beat} jolting my aim, the arc strikes scenery, wrong target, full voltage',
        'My spell fizzles near {beat} into a harmless crackle of static',
        'I miscast past {beat} and the lightning grounds out short of my foe',
    ],
    'Thunder': [
        'Thrown by {beat}, I lose the rhythm and the sound dies before it reaches them',
        'With {beat} swallowing my spell, the shockwave fizzles into a dull thump',
        'My casting falters near {beat} and the boom rolls past my target harmlessly',
        'Mistiming the blast around {beat}, I rattle only myself, missing clean',
    ],
    'Psychic': [
        'Distracted by {beat}, I lose the contact and they barely notice the push',
        'With {beat} scattering my focus, the mental lash finds empty air, not their mind',
        'My spell slips near {beat} and rebounds into a headache for me alone',
        'Overreaching past {beat}, I let the psychic thread snap, wide of my target',
    ],
    'Force': [
        'Caught by {beat}, I lose the shape and the force blast dies before reaching them',
        'With {beat} fouling the gesture, the invisible hammer slams scenery, not my foe',
        'My spell collapses near {beat} into a shove that barely stirs the dust',
        'I misaim past {beat} and the telekinetic blow goes wide and graceless',
    ],
    'Necrotic': [
        'Distracted by {beat}, I lose the curse and the decay fizzles before it spreads',
        'With {beat} breaking my focus, the withering touch finds nothing but air',
        'My spell sputters near {beat} and the rot crawls harmlessly across stone',
        'Misjudging the reach past {beat}, I let the necrotic wave die short of my target',
    ],
    'Radiant': [
        'Caught by {beat}, I lose the light and the beam dies before reaching them',
        'With {beat} fouling the casting, the radiance flares uselessly into the rafters',
        'My spell gutters near {beat} into a faint glow and nothing more',
        'I misaim past {beat} and sear scenery instead of my foe, wide and bright',
    ],
    'Acid': [
        'Distracted by {beat}, I lose the gesture and the acid splashes short of my target',
        'With {beat} jostling the cast, the caustic arc hisses into the ground, missing wide',
        'My spell fizzles near {beat} into a thin, harmless dribble',
        'Misjudging the throw past {beat}, I let the acid eat scenery, not my foe',
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
