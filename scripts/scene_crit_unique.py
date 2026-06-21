"""Scene-type and scene-specific fully unique crit lines (not generic template swaps)."""

TYPE_CRIT_UNIQUE = {
    'social': {
        'Polearms': {
            'Crit Hit': [
                'My polearm sweeps past a bystander and still finds flesh on the follow-through',
                'I hook their belt on the haft in the crowded room and yank them into my reach',
                'The reach advantage in tight quarters keeps me safe while the point still bites deep',
            ],
            'Crit Fail': [
                'My polearm catches a low beam and I dangle briefly like a bad encore',
                'I misjudge the gap between obstacles and bury the haft in a sack—cloudy, humiliating',
                'The ceiling beam stops my thrust mid-swing and everyone hears the clang',
            ],
        },
        'Arrows': {
            'Crit Hit': [
                'My arrow threads between bystanders and still nails the target square in the chest',
                'I loose from the balcony rail and the shot lands before anyone finishes reacting',
                'The arrow punches through a hanging sign and keeps going into my foe',
            ],
            'Crit Fail': [
                'My arrow pins a poster to the wall while my target stays inconveniently alive',
                'I fumble the draw and send the shot into a soup tureen—splash, groans, no damage',
                'The bowstring snaps on a hook and the arrow drops at my feet',
            ],
        },
        'Swords': {
            'Crit Hit': [
                'My blade opens a line across their guard between the hearth and the crowd',
                'I riposte off a chair back and the steel finds flesh before they recover',
                'The sword strike lands clean amid chaos and even the local cat looks impressed',
            ],
            'Crit Fail': [
                'My swing catches a chair and I nearly take out an ally on the follow-through',
                'I overextend past the target and embed the blade in the wall behind them',
                'I slip on a wet patch and faceplant while my sword skitters under a table',
            ],
        },
        'Fire': {
            'Crit Hit': [
                'My flames wrap them against the stone hearth and cling where armor gaps open',
                'Heat races across them in the crowded room, leaving scorch marks and my smug narrating face',
                'The blaze finds the gap in their guard and clings like a grudge',
            ],
            'Crit Fail': [
                'The spell fizzles into harmless sparks that drift upward—everyone ducks anyway',
                'I misaim and scorch the floor between us instead of my target',
                'The flames die on wet flagstones before reaching them—anticlimax with smoke',
            ],
        },
    },
    'dungeon': {
        'Polearms': {
            'Crit Hit': [
                'My polearm strikes from the darkness between torches before they adjust their guard',
                'I extend past their shield in the narrow corridor and drive the point home with a wet crunch',
                'Reach wins in tight stone—the blade finds flesh while I stay out of their swing',
            ],
            'Crit Fail': [
                'My polearm clangs off the ceiling arch and announces our position to the whole level',
                'I thrust past my target and bury the point in the damp wall—geology wins, I lose',
                'The haft tangles with a companion in the corridor—we share a look that says do not ballad this',
            ],
        },
        'Arrows': {
            'Crit Hit': [
                'My arrow strikes in flickering torchlight and sinks deep before the echo fades',
                'I loose down the corridor and the shot finds the gap in their armor cleanly',
                'The arrow punches through leather in the dim and keeps going until it finds bone',
            ],
            'Crit Fail': [
                'My arrow skitters off wet stone down the corridor and alerts everything listening',
                'I misjudge the angle in the dark and decorate the wall instead of my foe',
                'The bowstring snaps on a rusty hinge and the shot dies mid-flight',
            ],
        },
        'Fire': {
            'Crit Hit': [
                'My flames erupt in the corridor and wrap my target in heat the damp walls cannot smother',
                'I detonate fire down here and scorch my foe against the stone like a dramatic torch',
                'Heat races across them in the dungeon, leaving scorch marks and my smug narrating face',
            ],
            'Crit Fail': [
                'The spell backfires off damp stone and singes my own eyebrows—torchlight shows everything',
                'I misaim in the flicker and scorch the floor between us instead of my target',
                'The flames gutter in the underground air before reaching them—anticlimax with smoke',
            ],
        },
        'Stealth': {
            'Crit Hit': [],
            'Crit Fail': [],
        },
    },
    'wilderness': {
        'Arrows': {
            'Crit Hit': [
                'My arrow cuts through brush and finds the target before the echo leaves the trees',
                'I loose from the ridgeline and the shot drops them on the trail below',
                'The arrow strikes true across open ground with nowhere to hide the miss',
            ],
            'Crit Fail': [
                'My arrow vanishes into the canopy while my target ducks and grins',
                'A gust catches the shot and sends it wide over the ravine',
                'I snag the bowstring on thorn and the arrow plops harmlessly at my feet',
            ],
        },
        'Polearms': {
            'Crit Hit': [
                'My polearm finds them across the ford while they are still mid-crossing',
                'I keep them at haft\'s length on uneven ground and still land the crit clean',
                'Reach and mud work together—the point finds flesh before they close distance',
            ],
            'Crit Fail': [
                'My polearm catches on overhead branches and I stumble into the mud face-first',
                'I misjudge the reach on the trail and bury the point in a fallen log',
                'The haft slips on wet roots and I spin into a bush like a bad exit',
            ],
        },
    },
    'adventure': {
        'Swords': {
            'Crit Hit': [
                'My blade rings off their guard in the courtyard and opens a line across their ribs',
                'I riposte beneath a hanging banner and the steel finds flesh before they recover',
                'The strike lands clean on flagstones that amplify the sound—everyone hears the crit',
            ],
            'Crit Fail': [
                'My swing catches a tapestry and I tangle myself like a stage curtain call gone wrong',
                'I overextend on uneven courtyard stones and offer my back to the room',
                'The blade sticks in a shield display and I tug while my target walks away',
            ],
        },
    },
    'special': {
        'Arrows': {
            'Crit Hit': [
                'My arrow strikes like time distortion—here, then there, then everywhere at once',
                'I loose a shot that threads impossible tents and nails my target square in the chest',
                'The shot bends wrong in fey light and still lands true on my foe',
            ],
            'Crit Fail': [
                'My arrow disappears like a lost thing—here one moment, gone the next',
                'Confetti catches the shaft and veers it into a rigged game booth',
                'The shot vanishes into a tent that is bigger inside than out',
            ],
        },
    },
}

# Per-scene crit extras — fully written, no template feel.
SCENE_CRIT_UNIQUE = {
    ('Tavern', 'Polearms', 'Crit Fail'): [
        'My polearm catches on the chandelier chain with opera-level drama, leaving me exposed',
        'I misjudge the reach between tables and faceplant into a patron\'s stew',
        'My haft knocks tankards off the bar in a percussion solo nobody requested',
    ],
    ('Dungeon', 'Perception', 'Success'): [],
    ('Forest', 'Survival', 'Success'): [
        'I read the broken twigs and know which way the trail actually went',
        'I find clean water where the party was about to drink something foul',
        'I spot predator sign early and reroute us before trouble finds us',
    ],
}


def type_crit_lines(scene_id, category, suffix, stype):
    block = TYPE_CRIT_UNIQUE.get(stype, {}).get(category, {}).get(suffix, [])
    return list(block)


def scene_crit_lines(scene_id, category, suffix):
    return list(SCENE_CRIT_UNIQUE.get((scene_id, category, suffix), []))
