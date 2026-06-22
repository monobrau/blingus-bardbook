"""Beat-driven roleplay actions — distinct character moments, not {place} swaps.

Roleplay lines are observational/character prompts (gerund or first-person),
each anchored to a concrete scene beat so the same opening never repeats with a
different location tacked on. Voice: Blingus the winged bard — theatrical,
nosy, vain, and quietly terrified of rust monsters.
"""

from scene_flavor import SCENE_BEATS

# Each template consumes a concrete {beat}; {who}/{place} optional flavor.
ROLEPLAY_BEAT_TEMPLATES = [
    "Sidling toward {beat} for a better look while humming something that sounds like a plan",
    "Pretending to ignore {beat} while absolutely cataloging it for the second verse",
    "Making a mental note about {beat} in case it becomes a plot point (it usually does)",
    "Narrating {beat} under my breath like the ballad has already started",
    "Angling for a clear view of {beat} without looking like I care at all",
    "Telling {who} a long story so I can keep one eye on {beat}",
    "Composing a couplet about {beat} that nobody asked for and everyone will hear",
    "Edging closer to {beat} with the confidence of someone who definitely belongs here",
    "Asking {who} an innocent question while nodding at {beat} like it means nothing",
    "Quietly betting myself what {beat} is really about, then doubling the stakes",
    "Striking a casual pose near {beat} in case this turns into a story worth retelling",
    "Checking my gear twice because {beat} has the exact energy a rust monster would fake",
    "Drifting past {beat} slow enough to eavesdrop, fast enough to look busy",
    "Giving {beat} a dramatic look and {who} an even more dramatic one",
    "Filing {beat} away next to the Tarrasque rumor I refuse to stop mentioning",
    "Practicing my unbothered face while {beat} tries very hard to bother me",
]


def roleplay_lines_for(scene_id, ctx, limit=28):
    """Build distinct beat-driven roleplay actions for a scene."""
    beats = SCENE_BEATS.get(scene_id, [])
    if not beats:
        return []
    lines = []
    # Beats outer so each new line leads with a fresh situation.
    for offset in range(len(ROLEPLAY_BEAT_TEMPLATES)):
        for index, beat in enumerate(beats):
            template = ROLEPLAY_BEAT_TEMPLATES[(index + offset) % len(ROLEPLAY_BEAT_TEMPLATES)]
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
