"""Beat-driven roleplay actions — distinct character moments, not {place} swaps.

Roleplay lines are observational/character prompts (gerund or first-person),
each anchored to a concrete scene beat so the same opening never repeats with a
different location tacked on. Voice: Blingus the winged bard — theatrical,
nosy, vain, and quietly terrified of rust monsters.
"""

from scene_flavor import SCENE_BEATS

# Each template consumes a concrete {beat}; {who} optional flavor.
# Scene beats are long, clause-heavy observation phrases, so the bard's personality
# lives in the LEAD and the beat is kept terminal (or followed only by a clean,
# collision-proof clause). Putting flavor clauses after the beat caused ambiguous
# attachment ("a couplet about {beat} that nobody asked for") and preposition
# pile-ups ("edging closer to {beat-with-'with'} with the confidence of...").
ROLEPLAY_BEAT_TEMPLATES = [
    "Sidling over, humming something that sounds like a plan, for a better look at {beat}",
    "Very deliberately pretending not to notice {beat}",
    "Making a mental note, surely plot-relevant, about {beat}",
    "Under my breath, already narrating {beat}",
    "Angling for a clear but studiously casual view of {beat}",
    "Telling {who} a long story while keeping one eye on {beat}",
    "Composing an unprompted couplet about {beat}",
    "With the confidence of someone who definitely belongs here, edging closer to {beat}",
    "Asking {who} an innocent question while nodding at {beat}",
    "Privately betting myself what is really going on with {beat}",
    "Striking a casual pose near {beat}",
    "Rust-monster instincts engaged, checking my gear near {beat}",
    "Eavesdropping as I drift slowly past {beat}",
    "Throwing my most dramatic look at {beat}",
    "Privately blaming the Tarrasque for {beat}",
    "Practicing my unbothered face in front of {beat}",
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
