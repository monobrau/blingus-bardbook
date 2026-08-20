#!/usr/bin/env python3
"""
Cross-platform local mode for Blingus's Bardbook.

Prefers PHP's built-in server when `php` is on PATH (full app fidelity).
Otherwise serves the app with Python stdlib and implements Claude generate
plus simple JSON data save/load.

Usage:
  python3 scripts/local_server.py
  python3 scripts/local_server.py --port 8765 --no-browser
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765

MODULE_FILES = [
    "constants.js",
    "shared-utils.js",
    "storage-utils.js",
    "ui-utils.js",
    "tab-navigation.js",
    "search-utils.js",
    "search-enhancements.js",
    "keyboard-shortcuts.js",
    "action-workflow.js",
    "outcome-generate.js",
    "karaoke-manager.js",
    "data/spells-data.js",
    "data/bardic-data.js",
    "data/mockery-data.js",
    "data/actions-data.js",
    "data/criticals-data.js",
    "data/skillchecks-data.js",
    "data/scene-outcomes.js",
    "script.js",
    "styles.css",
]

PARTY_ROSTER = {
    "blingus",
    "brawn",
    "brawn o'neil",
    "brawn o'neal",
    "puck",
    "puck pinewhistle",
    "puke",
    "vandan",
    "vadania",
    "vadania amakiir",
    "bo",
    "van damme",
    "vandamme",
}

PARTY_FLAVOR = {
    "blingus": "Self-roast welcome. L5 Lore fairy bard: vanity, name-amnesia, two daggers and a shortbow, fly speed, Cutting Words, Sir Whats-his-face energy.",
    "puck": 'Fellow fairy Wild Magic sorcerer. Sparkles, twin-spell mischief, affectionate "Puke" nickname ok, glitter and bad decisions.',
    "brawn": "Dwarven monk. Wears the Crown of Remembrance (Geoe: rare, attunement; holly and amber; +1 AC and saves; 1/day Action name Declan/Owen/Tristan: three allies within 20 ft get Advantage on next CON/DEX/WIS save before start of Brawn's next turn). Drinks, thinks, swings.",
    "vadania": "Elven ranger Vadania Amakiir; the table casually calls them Vandan, Van Damme, or whatever feels right. Paranoid bow-watcher. Checks doors twice, prods chests, got Scorching-Rayed by a helpful ally during a mimic-chair fight. Trust issues are comedy gold. Mix nicknames mid-bit.",
    "bo": "Toad-cauldron era, enlarge heroics, dragon breath at Granny Nightshade. Closest thing Blingus has to family. Zybilna-silent warlock mentor flavor when it fits. Toad jokes never die.",
}

OUTCOME_LABELS = {
    "roleplay": "Roleplay action (what Blingus is doing right now)",
    "hit": "Critical hit description",
    "fail": "Critical fail description",
    "success": "Skill check success",
    "failure": "Skill check failure",
    "battleCry": "Battle cry (short shouted line before or during a fight)",
    "mockery": "Vicious Mockery (the spoken cantrip the player will deliver at the table)",
    "insult": "Insult (witty verbal jab, not the cantrip)",
    "compliment": "Compliment (warm but Blingus-flavored praise)",
    "toast": "Raised-glass toast the player can speak at the table",
    "motivation": "Motivational speech the player can deliver at the table (pep talk, rally, Bardic Inspiration energy)",
    "introduction": "Chaucer-style herald introduction (ornate party/NPC presentation)",
    "paulHarvey": "Paul Harvey recap (radio newsman closer)",
    "productPlacement": "Product placement (sudden sponsor read)",
    "infomercial": "Infomercial pitch",
    "wrongSoundtrack": "Wrong soundtrack",
    "pharmaAd": "Pharma ad (benefit pitch, then real side effects, ask-your-cleric)",
    "confessional": "Reality-show confessional",
    "cliffhanger": "Cliffhanger balladeer freeze-frame",
    "standup": "Standup one-liner about this scene",
    "roast": "Comedy-club roast",
    "troyMcClure": "Troy McClure credit-reel intro",
    "showtime": "Showtime (opens a performance)",
    "closer": "Closer (good-night / walk-off)",
    "inspiration": "Bardic Inspiration spend",
    "songOfRest": "Song of Rest",
    "healBuff": "Heal / Buff verbal component",
    "flirt": "Flirt / pickup / dedication",
    "graffiti": "Written graffiti tag",
    "travelBanter": "Travel banter / companion bark",
    "rally": "Cinematic pre-battle rally",
    "downed": "Last Breath (0 HP)",
    "eulogy": "Eulogy (remembrance speech)",
    "yelpReview": "Yelp review",
    "previouslyOn": "Season recap / previously on",
    "natureDoc": "Nature-doc whisper",
}


def find_php() -> str | None:
    return shutil.which("php")


def load_anthropic_key() -> str:
    key = (os.environ.get("ANTHROPIC_API_KEY") or "").strip()
    if key:
        return key
    key_file = ROOT / "api" / ".anthropic_key"
    if key_file.is_file():
        return key_file.read_text(encoding="utf-8").strip()
    return ""


def file_versions() -> dict[str, int]:
    versions: dict[str, int] = {}
    for name in MODULE_FILES:
        if name in ("styles.css", "script.js"):
            path = ROOT / name
        else:
            path = ROOT / "js" / name
        versions[name] = int(path.stat().st_mtime) if path.is_file() else int(time.time())
    return versions


def render_index() -> bytes:
    raw = (ROOT / "index.php").read_text(encoding="utf-8")
    # Drop the opening PHP bootstrap block.
    html = re.sub(r"<\?php\b.*?\?>", "", raw, count=1, flags=re.S)
    versions = file_versions()

    def repl(match: re.Match[str]) -> str:
        key = match.group(1)
        return str(versions.get(key, int(time.time())))

    html = re.sub(
        r"<\?php\s+echo\s+\$versions\['([^']+)'\];\s*\?>",
        repl,
        html,
    )
    # Any leftover PHP tags should not break the page.
    html = re.sub(r"<\?php.*?\?>", "", html, flags=re.S)
    return html.encode("utf-8")


def is_party_member(name: str) -> bool:
    needle = name.strip().lower()
    if not needle:
        return False
    if needle in PARTY_ROSTER:
        return True
    first = needle.split(" ", 1)[0]
    return first in PARTY_ROSTER


def party_flavor_key(name: str) -> str:
    needle = name.strip().lower()
    if not needle:
        return ""
    if "brawn" in needle:
        return "brawn"
    if "puck" in needle or needle == "puke":
        return "puck"
    if "vandan" in needle or "vadania" in needle or "van damme" in needle or needle == "vandamme":
        return "vadania"
    if needle == "bo" or needle.startswith("bo "):
        return "bo"
    if "blingus" in needle:
        return "blingus"
    return needle.split(" ", 1)[0]


def build_generate_prompts(body: dict[str, Any]) -> tuple[str, str, str, int]:
    scene = str(body.get("scene") or "").strip()
    setting = str(body.get("setting") or "").strip().lower()
    if setting not in ("indoors", "outdoors", ""):
        setting = ""
    weather = str(body.get("weather") or "").strip().lower()
    lighting = str(body.get("lighting") or "").strip().lower()
    environment_raw = body.get("environment") or []
    environment: list[str] = []
    if isinstance(environment_raw, list):
        for item in environment_raw:
            if not isinstance(item, str):
                continue
            item = item.strip()
            if item and len(item) <= 40:
                environment.append(item)
        environment = list(dict.fromkeys(environment))[:8]
    outcome = str(body.get("outcome") or "").strip()
    attack_type = str(body.get("attackType") or "").strip().lower()
    if attack_type not in ("slash", "pierce", "blunt", "magic", ""):
        attack_type = ""
    detail = str(body.get("detail") or "").strip()
    target = str(body.get("target") or "any").strip()
    name = str(body.get("name") or "").strip()[:80]
    cast_result = str(body.get("castResult") or "").strip().lower()
    if cast_result not in ("success", "failure", "mixed", "na"):
        cast_result = ""
    spell_targets = str(body.get("spellTargets") or "").strip().lower()
    if spell_targets not in ("multi", "single"):
        spell_targets = ""
    spell_kind = str(body.get("spellKind") or "").strip().lower()
    if spell_kind not in ("attack", "save", "damage", "other"):
        spell_kind = ""
    personality = str(body.get("personality") or "").strip()
    mood = str(body.get("mood") or "").strip().lower()[:40]
    mood_prompt = str(body.get("moodPrompt") or "").strip()[:400]
    count = int(body.get("count") or 5)
    count = max(1, min(8, count))
    party_flag = bool(body.get("partyMember"))

    allowed = set(OUTCOME_LABELS)
    detail_outcomes = {"hit", "fail", "success", "failure"}
    if not scene or outcome not in allowed:
        raise ValueError("Missing or invalid scene/outcome")
    if outcome in detail_outcomes and not detail:
        raise ValueError("Missing weapon, spell, or skill")
    if outcome in ("hit", "fail") and not attack_type:
        raise ValueError("Missing attack type (slash, pierce, blunt, or magic)")
    if not personality:
        raise ValueError("Personality text is required")

    rating = str(body.get("rating") or "").strip().lower()
    if rating not in ("g", "pg", "pg-13", "r", "x"):
        rating = ""
    rating_guides = {
        "g": 'CONTENT RATING G (ACTIVE, overrides mood and party-raunch for adult content): All-ages family table. No sexual content, no innuendo, no crude slang, no graphic gore. Violence stays cartoon slapstick. Keep Blingus theatrical and funny without dirty jokes. A "lewd" mood at G is playful charm only.',
        "pg": "CONTENT RATING PG (ACTIVE, overrides mood and party-raunch for adult content): Mild adventure table. Light language (darn, heck, occasional damn). The faintest wink of innuendo is the ceiling. No explicit sex, no graphic anatomy, no bedroom jokes. Violence stays PG action.",
        "pg-13": "CONTENT RATING PG-13 (ACTIVE, overrides mood and party-raunch for adult content): Typical teen D&D table. Suggestive innuendo, damn/hell/ass, implied adult situations are fine. No explicit sex acts, no graphic anatomy, no porn-narration. Do not escalate to R.",
        "r": "CONTENT RATING R (ACTIVE): Explicit sexual jokes, strong language, and crude body humor are welcome. Still a funny in-world table line, not a sex scene. Rated R table banter. Do not sanitize to PG-13.",
        "x": "CONTENT RATING X (ACTIVE): No ceiling. Graphic sexual content, filthy language, explicit acts, NC-17. Still characterful Blingus, not a medical manual. Do not sanitize or fade to black.",
    }
    rating_block = ""
    rating_note = "unset (use table default: party members get raunch; others follow mood)"
    if rating:
        rating_note = rating.upper()
        rating_block = f"""
CONTENT RATING (mandatory for every line in this batch):
Rating: {rating_note}
{rating_guides[rating]}
- Honor this rating even if mood is lewd, flirty, or petty, and even if the subject is a party member.
- Do not exceed this rating. Do not ignore it.
"""

    is_party = party_flag or is_party_member(name)
    party_mode = ""
    party_subject = "no"
    if is_party and name:
        party_subject = (
            "yes — party member; honor the content rating for adultness"
            if rating
            else "yes — use party raunch mode"
        )
        flavor = PARTY_FLAVOR.get(party_flavor_key(name), "Use established table chemistry and in-jokes for this companion.")
        party_adult = (
            "- Adultness comes from the CONTENT RATING above, not from this party block. Do not escalate past that rating just because the subject is a PC.\n"
            if rating
            else (
                "- This table wants exceptionally raunchy, adult, filthy humor aimed at fellow PCs.\n"
                "- Lean hard into crude sexual innuendo, explicit jokes, bedroom/body humor, and shameless double entendres in Blingus's theatrical voice.\n"
                "- Do not sanitize, soften, or keep it PG-13. Rated R to NC-17 table banter is expected and welcome.\n"
            )
        )
        party_mode = f"""

PARTY SUBJECT MODE (active — subject is a table party member):
{party_adult}- Still funny and characterful, not just shock for shock's sake. Stay in-world as Blingus.
- Still obey no-em-dash / no-en-dash and JSON-array-only rules.
- Every line must clearly involve the named party member.
- Every line must clearly involve {name} by name.
- Party-member flavor for {name}: {flavor}
- Lean on table-known gags when they fit: toad-Bo, Crown of Remembrance, mimic chairs, Scorching Ray friendly fire, Stinky Court, mud muffins, Sir Whats-his-face, Sir Talavar, marching-band near-wipe, Granny in the oven, Mr. Witch and Mr. Light, Misplacer Beast, swan boat What is Joy dunk, Witch's watch pickpocket, Star the displacer cub, Jamie you beautiful bastard and Chris as well (do not invent who they are).
"""

    mood_note = mood or "playful"
    mood_guide = mood_prompt or "Match a playful theatrical Blingus register unless the outcome type requires otherwise."
    env_note = ", ".join(environment) if environment else "(none specified)"
    target_types = [part.strip() for part in target.split(",") if part.strip() and part.strip().lower() != "any"]
    is_multi_spell = spell_targets == "multi"
    spell_kind_note = {
        "attack": "spell attack roll",
        "save": "saving throw",
        "damage": "damage with no spell attack roll",
        "other": "heal / utility (no attack roll)",
    }.get(spell_kind, "(n/a)")
    spell_targets_note = (
        "multi (area / several creatures; no headcounts)"
        if is_multi_spell
        else ("single target" if spell_targets == "single" else "(n/a)")
    )
    if not target_types:
        target_note = (
            "unspecified creatures in the area (do not invent a headcount)"
            if is_multi_spell
            else "any / unspecified"
        )
    elif len(target_types) > 1:
        prefix = (
            "these kinds in the area (include each kind; do not say how many of each): "
            if is_multi_spell
            else "include each of these foci in every line (do not invent a headcount): "
        )
        target_note = prefix + ", ".join(target_types)
    elif is_multi_spell:
        target_note = "this kind in the area (do not invent a headcount): " + target_types[0]
    else:
        target_note = target_types[0]
    if cast_result == "success":
        cast_result_note = (
            "They fail the save. Apply THIS spell's failed-save result (full damage, condition lands, etc.). "
            "Multi-target: do not name how many fail."
            if is_multi_spell
            else "They fail the save. Apply THIS spell's failed-save result (full damage, condition lands, etc.)."
        )
    elif cast_result == "failure":
        cast_result_note = (
            "They make the save. Apply THIS spell's successful-save result (half damage for Fireball/"
            "Thunderwave/Shatter; no effect for Faerie Fire/Bane; whatever the real spell says). "
            "Multi-target: do not name how many make it."
            if is_multi_spell
            else "They make the save. Apply THIS spell's successful-save result (half damage, no effect, or reduced effect — the real spell, not a generic fizzle)."
        )
    elif cast_result == "mixed":
        cast_result_note = (
            "Mixed saves: some fail and some make it. Apply THIS spell's fail result to those who fail "
            "and its success result to those who make it. Show BOTH. Do not name how many."
        )
    elif cast_result == "na":
        cast_result_note = (
            "N/A: no save result given. If THIS spell has no save (Magic Missile, Cloud of Daggers), "
            "the effect just happens. If it has a save, do not invent who passed or failed."
        )
    else:
        cast_result_note = "(n/a)"
    name_note = name or "(no specific name)"
    combat_round = bool(body.get("combatRound")) or str(body.get("pace") or "").strip().lower() == "battle"
    pace = str(body.get("pace") or "").strip().lower()
    if pace not in ("battle", "roleplay"):
        pace = "battle" if combat_round else "roleplay"
    character_block = str(body.get("characterBlock") or "").strip()[:5000]
    kit_match = str(body.get("kitMatch") or "").strip()[:800]
    sheet_block = ""
    if character_block:
        sheet_block = f"""
CURRENT CHARACTER SHEET (authoritative mechanical state):
{character_block}
"""
    kit_match_block = ""
    if kit_match:
        kit_match_block = f"""
ITEM IN PLAY FOR THIS BATCH (wizard Detail is authoritative):
{kit_match}
- Every combat line must be recognizably THIS item. Do not replace it with a different weapon or spell, even if the standing sheet lists something else.
"""

    allow_parody = bool(body.get("allowParody"))
    force_parody = bool(body.get("forceParody")) and allow_parody
    parody_rule = (
        "- OCCASIONAL SONG PARODY: in a minority of lines (about 0-1 per batch), Blingus may weave a recognizable song-parody snatch into the beat in his karaoke-bard style. Most lines stay unsung. When Force Song Parody is active, ignore this rarity and do every line."
        if allow_parody
        else "- Do not write song parodies, karaoke hooks, or sung lyric snatches. This speaker is not a karaoke bard."
    )
    force_parody_block = ""
    if force_parody:
        force_parody_block = """
FORCE SONG PARODY MODE (ACTIVE, overrides the occasional parody rule):
- EVERY line in this batch MUST weave a recognizable song parody into the beat.
- Rewrite a real, well-known song so the lyrics fit this outcome, scene, and mood. Keep the original hook recognizable (same cadence, famous phrases twisted).
- Do NOT quote the original lyrics verbatim. Do NOT name the song or artist in the line. The table should hear the tune without a citation.
- This is Blingus's karaoke-bard style (Vicious Mockery / spell parodies), not a cheesy lovesong smash and not a sung verse for its own sake.
- Still match the requested outcome type exactly. The parody serves the hit, fail, roast, toast, or roleplay beat; it does not replace it.
- Vary the source songs across the batch (pop, rock, karaoke classics, 80s, 90s, 2000s). Do not reuse the same hook in every line.
- The joke is the collision: a familiar chorus twisted into this exact table moment, delivered in Blingus's theatrical voice.
"""

    if combat_round or pace == "battle":
        pace_length = """
IN BATTLE LENGTH (ACTIVE):
- Fit a D&D combat turn: any spoken dialogue Blingus would say aloud must take about 6 seconds or less of real spoken time (roughly 12-18 words of dialogue, one breath / one shout).
- Prefer punchy one-liners. Do not write long speeches, multi-clause lectures, or multi-sentence heralds.
- If a line mixes narration and speech, keep the spoken part inside that ~6s budget; keep the whole string short enough to use mid-round.
- This overrides longer defaults (including Chaucer introductions). Keep theatrical voice; keep length tight.
- Song Parody (if also active) must still fit the same ~6s spoken budget: a short lyric snatch, not a verse.
"""
    else:
        pace_length = f"""
OUT OF BATTLE / ROLEPLAY LENGTH (ACTIVE):
- These are not combat-turn lines. Each of the {count} strings may be a richer beat: about 3-5 sentences or a short paragraph when speech or narration needs room.
- Still self-contained and usable at the table. Do not write essays.
- Prefer vivid table beats over one-liner quips unless the outcome type is inherently short.
- Song Parody (if also active) may use a fuller parody couplet, still inside that 3-5 sentence beat.
"""

    system = f"""You write short tabletop RPG lines in character as Blingus for a D&D helper app.

PERSONALITY (follow closely):
{personality}

CURRENT MOOD (mandatory emotional register for every line in this batch):
Mood id: {mood_note}
{mood_guide}
- Every line must fit this mood. Do not drift into a conflicting emotional register.
- Mood colors delivery and attitude; it does not change the requested outcome type.
{pace_length}
HOUSE RULES:
- Return ONLY a JSON array of exactly {count} strings. No markdown fences, no commentary.
- Each string is one complete, self-contained option. In battle: keep it to one short spoken beat. Out of battle: a 3-5 sentence beat is welcome.
- Capitalize the pronoun I. Never use em dashes or en dashes; use commas or hyphens.
- Match the outcome type exactly.
- Stay scene-appropriate. Do not force wilderness framing into taverns/shops, or tavern framing into caves.
- Honor indoors vs outdoors, plus any weather, lighting, and environment tags. Fold them into the beat naturally (do not just list the tags).
- Lines in the batch must be structurally distinct from each other (not the same sentence with one noun swapped).
- Roleplay lines: prefer gerund/present-participial prompts (e.g. "Scanning the room…") or short present-tense beats.
- Crit hits / skill successes / skill failures / crit fails: prefer first-person "I …" as Blingus.
- Crit hits must clearly land on a foe/target. Crit fails must clearly go wrong (miss, fumble, backfire, self/environment mishap).
- For crit hits/fails: honor the attack type (slash, pierce, blunt, or magic) and the specific weapon or D&D 5.5e/2024 bard spell named in Detail. Magic lines should feel like that spell (psychic mockery, thunder boom, radiant wisp, heated armor, etc.), not a generic blast.
- Detail wins over the standing sheet for THIS batch. If Detail is Longbow, every line is a longbow (arrows, nock, draw, loose), never a spear, dagger, shortbow, or crossbow. If Detail is a spell, use that spell, not a different one and not a weapon.
- Do not mix weapon families: bows fire arrows; crossbows fire bolts; spears and pikes thrust; swords cut; hammers crush. A pierce attack type is not permission to swap weapons inside that type.
- Honor the CURRENT CHARACTER SHEET for abilities, HP, AC, and default kit. The sheet is what he usually carries. If Detail names something else, he is using that item for this roll (borrowed, looted, or hypothetical). Do not invent 4th-level spells unless Detail names one.
- If Detail names a weapon, spell, feature, or skill on the sheet, use THAT item's notes and properties. Do not swap in a generic version.
- Battle cries and in-battle lines should name the Detail weapon or spell when it fits, not a different kit item.
- Roleplay may fold in current HP, fairy flight, an instrument, or a feature when it naturally matters. Do not inventory-dump.
- If HP current is below max, combat lines may acknowledge being hurt when it fits. If HP is about one-third or less, that fragility can color the beat.
- Fairy specifics: Small fey, airborne, vain, name-amnesia. Default kit is two daggers and a shortbow. If Detail names a different weapon or spell, use Detail. Do not invent 4th-level spells unless Detail names one, and do not fly in medium/heavy armor.
- Lean on table-known Prismeer hooks when they fit: Sir Talavar, Clapperclaw the pincer-clawed scarecrow of Downfall (someone forgot his name), Stinky Court, mud muffins, mimic chairs, marching-band near-wipe, Loomlurch hollow tree and portrait room (Bavlorna Endelyn Tasha), Skabatha dead in the oven, Bavlorna still owed yarn, Lamorna/Elidon alicorn, Jabberwock (dragon-like, be careful), palace may need an invitation, Blood-Slick Token, Crown of Remembrance on Brawn, Mr. Witch and Mr. Light on edge, Star the displacer cub, eight unicorn names (Fortune Bold Fall Pride Stone Moss Stitch Nine). Do not invent unpublished Witchlight spoilers.
- If Scene names a Feywild or Prismeer place, write to THAT place (Hither mud, Loomlurch timber, Yon peaks, a goblin market, etc.). If Name / subject is a creature, aim the beat at that foe. Do not invent unpublished Witchlight plot.
- Battle cries: short, shoutable, 1-2 sentences max. Energetic, theatrical, first person or imperative.
- Vicious Mockery: these lines ARE the cantrip. Write the exact words Blingus speaks as the verbal component, ready for the player to read aloud. First-person spoken roast, psychic sting, WIS-save flavor welcome. Do not narrate "I cast Vicious Mockery"; deliver the mockery itself. In battle: one breath. Out of battle: a longer cantrip delivery (3-5 sentences) is fine. Always aim at the named foe when given. This is not a generic insult.
- Insults: cutting table jab, not the cantrip. Aimed at the focus when specified. One or two sentences.
- Compliments: sincere-ish praise with Blingus vanity or backhanded warmth. One or two sentences.
- Motivational speeches: a pep talk the player can read aloud. Not a toast, not a battle cry, not a compliment of one trait. Name / subject is the audience. If it is a group, address that whole group. If it is one person, aim at them. In battle: one breath. Out of battle: 3-5 sentences.
- Chaucer introductions: ornate herald-style presentation suitable to read aloud. Longer is fine (2-5 sentences). Use "Behold", "Hark", "Presenting", or similar flourish. Invent flattering or teasing epithets. Do not spoil module plot.
- When a specific name is provided, clearly address or present that person by name in every line. If other target kinds are also listed, keep those kinds in the beat too; the named person is one definite individual, not the only focus. If this is a multi-target spell, they are one creature in the area, not the only one.
- Saving throw results must follow the official D&D 2024 rules for the Detail spell. Do not treat every made save as "nothing happens."
- Fireball, Thunderwave, Shatter, and similar: fail = full damage, make = half damage. The spell still happens.
- Faerie Fire, Bane, Hideous Laughter, and similar: fail = the effect lands, make = no effect on that creature.
- Magic Missile, Cloud of Daggers, and similar: no save. Do not invent a to-hit or a save unless the player picked fail/make.
- If the save result is "they fail the save": apply THIS spell's failed-save result.
- If the save result is "they make the save": apply THIS spell's successful-save result (half, negated, or whatever the real spell says).
- If the save result is "mixed saves": some fail and some make it. Apply THIS spell to each. Do not write an all-or-nothing result.
- If the save result is "N/A": do not invent who passed or failed. If the real spell has no save, the effect just happens.
- Multi-target spells (area / several creatures): NEVER state a definite number of creatures hit, missed, damaged, who fail a save, or who make a save. No "two goblins", "all three", "one of four", "three fail and two make it." Use some / others / those who / the ones in the glow. A named subject may be named as one definite person; do not count anyone else.
- If Target focus lists more than one kind (enemy and ally, NPC and object, environment, etc.), every line must include those kinds. They are all in play. Do not drop one. Do not assign a headcount to each kind.
- If Spell kind is "damage with no spell attack roll": the harm just happens (darts, a cube of blades, an area pulse). Do NOT write a to-hit, a spell attack roll, or a crit swing. A crit-hit outcome is the effect landing especially hard; a crit-fail is the effect going wrong (wrong spot, fizzle, friendly fire), not a missed attack roll.
- If Spell kind is "saving throw": do not write a spell attack roll. The save result above is authoritative.
{parody_rule}
{sheet_block}{kit_match_block}{rating_block}{party_mode}{force_parody_block}"""

    user = f"""Write {count} lines for this selection:

Scene: {scene}
Setting: {setting or '(unspecified)'}
Weather: {weather or '(unspecified)'}
Lighting: {lighting or '(unspecified)'}
Environment tags: {env_note}
Current mood: {mood_note}
Content rating: {rating_note}
Pace: {pace}
Outcome type: {OUTCOME_LABELS[outcome]}
Attack type: {attack_type or '(n/a)'}
Detail (weapon / bard spell / skill): {detail or '(none)'}
Saving throw result: {cast_result_note}
Spell kind: {spell_kind_note}
Spell area: {spell_targets_note}
Target focus: {target_note}
Name / subject: {name_note}
Party member subject: {party_subject}

Respond with a JSON array of {count} strings only."""

    model = os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-6"
    return system, user, model, count


def call_anthropic(system: str, user: str, model: str, max_tokens: int) -> list[str]:
    api_key = load_anthropic_key()
    if not api_key:
        raise RuntimeError(
            "Anthropic API key not configured. Set ANTHROPIC_API_KEY or create api/.anthropic_key"
        )

    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "temperature": 0.9,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            decoded = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            err_body = json.loads(exc.read().decode("utf-8"))
            msg = err_body.get("error", {}).get("message") or f"Anthropic HTTP {exc.code}"
        except Exception:
            msg = f"Anthropic HTTP {exc.code}"
        raise RuntimeError(msg) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Claude request failed: {exc.reason}") from exc

    text = ""
    for block in decoded.get("content") or []:
        if block.get("type") == "text":
            text += block.get("text") or ""
    text = text.strip()
    if not text:
        raise RuntimeError("Empty response from Claude")

    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, flags=re.S)
    if fence:
        text = fence.group(1).strip()

    lines = json.loads(text) if text.startswith("[") else None
    if not isinstance(lines, list):
        lines = []
        for part in re.split(r"\r?\n+", text):
            part = re.sub(r"^[\-\*\d\.\)\]]+\s*", "", part).strip().strip("\"'")
            if part:
                lines.append(part)

    clean: list[str] = []
    for line in lines:
        if not isinstance(line, str):
            continue
        line = line.strip().replace("\u2014", ", ").replace("\u2013", ", ")
        line = re.sub(r"\bi\b", "I", line)
        if line and line not in clean:
            clean.append(line)
    return clean


def data_file() -> Path:
    data_dir = ROOT / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir / "blingus-data.json"


def handle_blingus_data(method: str, query: dict[str, list[str]], body: dict[str, Any] | None) -> tuple[int, dict[str, Any]]:
    action = (query.get("action") or [""])[0]
    if not action and body:
        action = str(body.get("action") or "")

    path = data_file()
    if action == "load" or (method == "GET" and not action):
        if path.is_file():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                data = {}
        else:
            data = {}
        return 200, {"success": True, "data": data}

    if action == "save" and method == "POST":
        payload = body or {}
        data = payload.get("data", payload)
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return 200, {"success": True}

    if action == "ping":
        return 200, {"success": True, "mode": "python-local"}

    return 400, {"success": False, "error": f"Unknown or unsupported action: {action or '(none)'}"}


class BardbookHandler(BaseHTTPRequestHandler):
    server_version = "BlingusLocal/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, code: int, payload: dict[str, Any]) -> None:
        data = json.dumps(payload).encode("utf-8")
        self._send(code, data, "application/json; charset=utf-8")

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid JSON body") from exc
        if not isinstance(data, dict):
            raise ValueError("Invalid JSON body")
        return data

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path or "/")
        query = parse_qs(parsed.query)

        if path in ("/", "/index.php", "/index.html"):
            self._send(200, render_index(), "text/html; charset=utf-8")
            return

        if path in ("/api/blingus-data.php", "/api/test.php"):
            if path.endswith("test.php"):
                self._send_json(200, {"success": True, "mode": "python-local"})
                return
            code, payload = handle_blingus_data("GET", query, None)
            self._send_json(code, payload)
            return

        if path == "/api/karaoke.php":
            action = (query.get("action") or ["ping"])[0]
            if action == "ping":
                self._send_json(200, {"success": True, "mode": "python-local", "karaoke": False})
                return
            self._send_json(
                501,
                {
                    "success": False,
                    "error": "Karaoke download/search needs the PHP API. Install PHP CLI and re-run start-local, or use the hosted server.",
                },
            )
            return

        if path == "/api/generate-outcome.php":
            self._send_json(405, {"success": False, "error": "POST required"})
            return

        rel = path.lstrip("/")
        if ".." in Path(rel).parts:
            self._send_json(400, {"success": False, "error": "Bad path"})
            return
        file_path = (ROOT / rel).resolve()
        if not str(file_path).startswith(str(ROOT)) or not file_path.is_file():
            self.send_error(404, "Not found")
            return

        ctype, _ = mimetypes.guess_type(str(file_path))
        if file_path.suffix == ".js":
            ctype = "application/javascript; charset=utf-8"
        elif file_path.suffix == ".css":
            ctype = "text/css; charset=utf-8"
        elif not ctype:
            ctype = "application/octet-stream"
        self._send(200, file_path.read_bytes(), ctype)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = unquote(parsed.path or "/")
        query = parse_qs(parsed.query)

        try:
            body = self._read_json()
        except ValueError as exc:
            self._send_json(400, {"success": False, "error": str(exc)})
            return

        if path == "/api/generate-outcome.php":
            try:
                system, user, model, count = build_generate_prompts(body)
                max_tokens = 3200 if (body.get("pace") == "roleplay" or body.get("outcome") == "introduction") else 900
                lines = call_anthropic(system, user, model, max_tokens)[:count]
                if not lines:
                    raise RuntimeError("Could not parse lines from Claude response")
                self._send_json(200, {"success": True, "lines": lines, "model": model})
            except ValueError as exc:
                self._send_json(400, {"success": False, "error": str(exc)})
            except RuntimeError as exc:
                code = 503 if "API key" in str(exc) else 502
                self._send_json(code, {"success": False, "error": str(exc)})
            return

        if path == "/api/blingus-data.php":
            code, payload = handle_blingus_data("POST", query, body)
            self._send_json(code, payload)
            return

        if path == "/api/karaoke.php":
            self._send_json(
                501,
                {
                    "success": False,
                    "error": "Karaoke needs the PHP API. Install PHP CLI and re-run start-local.",
                },
            )
            return

        self._send_json(404, {"success": False, "error": "Not found"})


def open_browser_later(url: str, delay: float = 0.8) -> None:
    def _open() -> None:
        time.sleep(delay)
        webbrowser.open(url)

    threading.Thread(target=_open, daemon=True).start()


def run_php_server(host: str, port: int, open_browser: bool) -> int:
    php = find_php()
    if not php:
        return 1
    router = ROOT / "scripts" / "local-router.php"
    bind = f"{host}:{port}"
    url = f"http://{host}:{port}/"
    print(f"Local mode (PHP): {url}", flush=True)
    print("Press Ctrl+C to stop.\n", flush=True)
    if open_browser:
        open_browser_later(url)
    try:
        return subprocess.call(
            [php, "-S", bind, "-t", str(ROOT), str(router)],
            cwd=str(ROOT),
        )
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)
        return 0


def run_python_server(host: str, port: int, open_browser: bool) -> int:
    url = f"http://{host}:{port}/"
    print(f"Local mode (Python): {url}", flush=True)
    if not load_anthropic_key():
        print(
            "Note: no Anthropic key yet. Outcomes generate needs ANTHROPIC_API_KEY or api/.anthropic_key",
            flush=True,
        )
    print("Press Ctrl+C to stop.\n", flush=True)
    httpd = ThreadingHTTPServer((host, port), BardbookHandler)
    if open_browser:
        open_browser_later(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        httpd.server_close()
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run Blingus's Bardbook locally")
    parser.add_argument("--host", default=os.environ.get("BLINGUS_HOST", DEFAULT_HOST))
    parser.add_argument("--port", type=int, default=int(os.environ.get("BLINGUS_PORT", DEFAULT_PORT)))
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser tab")
    parser.add_argument(
        "--engine",
        choices=("auto", "php", "python"),
        default=os.environ.get("BLINGUS_ENGINE", "auto"),
        help="Server engine (default: auto = PHP if available, else Python)",
    )
    args = parser.parse_args(argv)
    open_browser = not args.no_browser

    if args.engine in ("auto", "php"):
        if find_php():
            return run_php_server(args.host, args.port, open_browser)
        if args.engine == "php":
            print("PHP CLI not found on PATH. Install PHP or use --engine python.", file=sys.stderr)
            return 1

    return run_python_server(args.host, args.port, open_browser)


if __name__ == "__main__":
    raise SystemExit(main())
