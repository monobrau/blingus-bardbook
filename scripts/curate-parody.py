#!/usr/bin/env python3
"""Curate spells/bardic parodies — mirrors scripts/curate-data.mjs scoring."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "js" / "data"

LORE_ARTISTS = {
    "Mockery",
    "D&D Lore",
    "Forgotten Realms Lore",
    "Blingus's Obsession",
    "Blingus's Feywild Reference",
    "Wild Beyond The Witchlight",
}

ITEM_RE = re.compile(
    r'\{t:"((?:\\.|[^"\\])*)",\s*s:"((?:\\.|[^"\\])*)",\s*a:"((?:\\.|[^"\\])*)"(?:,\s*adult:true)?\}'
)


def unescape(s: str) -> str:
    return s.replace('\\"', '"').replace("\\\\", "\\")


def normalize(s: str) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def similarity(a: str, b: str) -> float:
    na, nb = normalize(a), normalize(b)
    if na == nb:
        return 1.0
    wa, wb = set(na.split()), set(nb.split())
    if not wa or not wb:
        return 0.0
    overlap = len(wa & wb)
    return overlap / max(len(wa), len(wb))


def parse_js_map(path: Path, const_name: str) -> dict:
    text = path.read_text(encoding="utf-8")
    start = text.index(f"const {const_name} = {{")
    depth = 0
    end = start
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    block = text[start:end]
    result = {}
    cat = None
    for line in block.splitlines():
        m = re.match(r"\s+'((?:\\'|[^'])*)':\s*\[", line)
        if m:
            cat = m.group(1).replace("\\'", "'")
            result[cat] = []
            continue
        m2 = ITEM_RE.search(line)
        if m2 and cat:
            item = {
                "t": unescape(m2.group(1)),
                "s": unescape(m2.group(2)),
                "a": unescape(m2.group(3)),
            }
            if "adult:true" in line:
                item["adult"] = True
            result[cat].append(item)
    return result


def parody_words(text: str) -> list[str]:
    return [w for w in normalize(text).split() if w]


def last_word(text: str) -> str:
    words = parody_words(text)
    return words[-1] if words else ""


def is_real_song_parody(item: dict) -> bool:
    artist = item.get("a", "")
    if artist in LORE_ARTISTS:
        return False
    if re.search(r"lore|mockery|obsession|witchlight|reference", artist, re.I):
        return False
    return bool(item.get("s"))


def score_parody(item: dict) -> int:
    if not is_real_song_parody(item):
        return -100

    score = 0
    t = item["t"]
    song = item["s"]
    t_norm = normalize(t)
    song_words = [w for w in parody_words(song) if len(w) > 2]

    open_phrase = " ".join(song_words[: min(4, len(song_words))])
    if len(open_phrase) > 4 and t_norm.startswith(open_phrase[: min(len(open_phrase), 18)]):
        score += 4
    elif any(len(w) > 4 and w in t_norm for w in song_words):
        score += 2

    title_hits = sum(1 for w in song_words if len(w) > 3 and w in t_norm)
    score += min(title_hits, 4)

    t_last = last_word(t)
    s_last = last_word(song)
    tail = " ".join(t_norm.split()[-4:])
    if t_last and s_last and (t_last == s_last or s_last in tail):
        score += 3
    elif len(t_last) > 3 and len(s_last) > 3 and t_last[-3:] == s_last[-3:]:
        score += 1

    if re.search(r"[;—]", t):
        score += 1
    if 55 <= len(t) <= 115:
        score += 1
    if len(t) > 130:
        score -= 2
    if len(t) < 45:
        score -= 1

    tail_clause = (t.split(";")[-1] if ";" in t else t.split(".")[-1])
    if re.search(r"\b(cue|jive|folden|dorm|norm|gem|sheen|struts|officious)\b", tail_clause, re.I):
        score -= 2
    if re.search(r"contain 'em.*sustain 'em", t, re.I):
        score -= 3

    return score


def dedupe_parody_entries(items: list[dict], threshold: float = 0.66) -> list[dict]:
    kept = []
    for item in items:
        if any(similarity(k["t"], item["t"]) >= threshold for k in kept):
            continue
        kept.append(item)
    return kept


def curate_parody_map(obj: dict, max_per_category: int = 5, min_score: int = 2) -> dict:
    out = {}
    for key, items in obj.items():
        ranked = [
            (item, score_parody(item))
            for item in items
            if is_real_song_parody(item) and score_parody(item) >= min_score
        ]
        by_song = {}
        for item, sc in ranked:
            song_key = normalize(item["s"])
            if song_key not in by_song or sc > by_song[song_key][1]:
                by_song[song_key] = (item, sc)
        lst = [row[0] for row in sorted(by_song.values(), key=lambda x: x[1], reverse=True)]
        lst = dedupe_parody_entries(lst)
        out[key] = lst[:max_per_category]
    return out


def serialize_map(name: str, obj: dict) -> str:
    lines = [f"const {name} = {{"]
    for key, items in obj.items():
        esc_key = key.replace("'", "\\'")
        lines.append(f"  '{esc_key}': [")
        for item in items:
            adult = ", adult:true" if item.get("adult") else ""
            t = item["t"].replace("\\", "\\\\").replace('"', '\\"')
            s = item["s"].replace("\\", "\\\\").replace('"', '\\"')
            a = item["a"].replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'    {{t:"{t}", s:"{s}", a:"{a}"{adult}}},')
        lines.append("  ],")
    lines.append("};")
    return "\n".join(lines)


def count_entries(obj: dict) -> int:
    return sum(len(v) for v in obj.values())


def main():
    spells_path = DATA / "spells-data.js"
    bardic_path = DATA / "bardic-data.js"

    spells = parse_js_map(spells_path, "spells")
    adult = parse_js_map(spells_path, "adultSpells")
    bardic = parse_js_map(bardic_path, "bardic")

    curated_spells = curate_parody_map(spells, 5, 2)
    curated_adult = curate_parody_map(adult, 3, 1)
    curated_bardic = curate_parody_map(bardic, 6, 2)

    spells_path.write_text(
        "/**\n * Spell parody data (curated revamp — best song-faithful parodies per spell)\n */\n"
        "window.BlingusData = window.BlingusData || {};\n\n"
        + serialize_map("spells", curated_spells)
        + "\n\n"
        + serialize_map("adultSpells", curated_adult)
        + "\n\nwindow.BlingusData.spells = spells;\n"
        "window.BlingusData.adultSpells = adultSpells;\n",
        encoding="utf-8",
    )

    bardic_path.write_text(
        "/**\n * Bardic inspiration data (curated revamp — best song-faithful parodies per type)\n */\n"
        "window.BlingusData = window.BlingusData || {};\n\n"
        + serialize_map("bardic", curated_bardic)
        + "\n\nwindow.BlingusData.bardic = bardic;\n",
        encoding="utf-8",
    )

    print("Parody curation complete.")
    print(f"  spells: {count_entries(spells)} -> {count_entries(curated_spells)}")
    print(f"  adult:  {count_entries(adult)} -> {count_entries(curated_adult)}")
    print(f"  bardic: {count_entries(bardic)} -> {count_entries(curated_bardic)}")


if __name__ == "__main__":
    main()
