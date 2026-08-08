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
    "blingus": "Self-roast welcome. Fairy bard vanity, name-amnesia, economy-sized blade jokes, Sir Whats-his-face energy.",
    "puck": 'Fellow fairy sorcerer chaos. Sparkles, twin-spell mischief, affectionate "Puke" nickname ok, glitter and bad decisions.',
    "brawn": "Dwarven monk. Fists named Reason and Consequences. Currently wears the Crown of Remembrance. Drinks, thinks, swings.",
    "vadania": "Real name Vadania Amakiir; the table casually calls them Vandan, Van Damme, or whatever feels right. Paranoid bow-watcher. Checks doors twice, prods chests, got Scorching-Rayed by a helpful ally during a mimic-chair fight. Trust issues are comedy gold. Feel free to mix nicknames mid-bit.",
    "bo": "Dwarf who was briefly a toad (cauldron food era). Dragon breath stories, enlarge heroics, Milwaukee energy. Toad jokes never die.",
}

OUTCOME_LABELS = {
    "roleplay": "Roleplay action (what Blingus is doing right now)",
    "hit": "Critical hit description",
    "fail": "Critical fail description",
    "success": "Skill check success",
    "failure": "Skill check failure",
    "battleCry": "Battle cry (short shouted line before or during a fight)",
    "insult": "Insult (witty verbal jab)",
    "compliment": "Compliment (warm but Blingus-flavored praise)",
    "introduction": "Chaucer-style herald introduction (ornate party/NPC presentation)",
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

    is_party = party_flag or is_party_member(name)
    party_mode = ""
    party_subject = "no"
    if is_party and name:
        party_subject = "yes — use party raunch mode"
        flavor = PARTY_FLAVOR.get(party_flavor_key(name), "Use established table chemistry and in-jokes for this companion.")
        party_mode = f"""

PARTY SUBJECT MODE (active — subject is a table party member):
- This table wants exceptionally raunchy, adult, filthy humor aimed at fellow PCs.
- Lean hard into crude sexual innuendo, explicit jokes, bedroom/body humor, and shameless double entendres in Blingus's theatrical voice.
- Do not sanitize, soften, or keep it PG-13. Rated R to NC-17 table banter is expected and welcome.
- Still funny and characterful, not just shock for shock's sake. Stay in-world as Blingus.
- Still obey no-em-dash / no-en-dash and JSON-array-only rules.
- Every line must clearly involve the named party member.
- Every line must clearly involve {name} by name.
- Party-member flavor for {name}: {flavor}
- Lean on table-known gags when they fit: toad-Bo, Crown of Remembrance, mimic chairs, Scorching Ray friendly fire, Stinky Court, mud muffins, Sir Whats-his-face name amnesia, fairy dragons.
"""

    mood_note = mood or "playful"
    mood_guide = mood_prompt or "Match a playful theatrical Blingus register unless the outcome type requires otherwise."
    env_note = ", ".join(environment) if environment else "(none specified)"
    target_note = "any / unspecified" if target in ("", "any") else target
    name_note = name or "(no specific name)"

    system = f"""You write short tabletop RPG lines in character as Blingus for a D&D helper app.

PERSONALITY (follow closely):
{personality}

CURRENT MOOD (mandatory emotional register for every line in this batch):
Mood id: {mood_note}
{mood_guide}
- Every line must fit this mood. Do not drift into a conflicting emotional register.
- Mood colors delivery and attitude; it does not change the requested outcome type.

HOUSE RULES:
- Return ONLY a JSON array of exactly {count} strings. No markdown fences, no commentary.
- Each string is one complete, self-contained line (or one complete herald speech for introductions).
- Capitalize the pronoun I. Never use em dashes or en dashes; use commas or hyphens.
- Match the outcome type exactly.
- Stay scene-appropriate. Do not force wilderness framing into taverns/shops, or tavern framing into caves.
- Honor indoors vs outdoors, plus any weather, lighting, and environment tags. Fold them into the beat naturally (do not just list the tags).
- Lines in the batch must be structurally distinct from each other (not the same sentence with one noun swapped).
- Roleplay lines: prefer gerund/present-participial prompts (e.g. "Scanning the room…") or short present-tense beats.
- Crit hits / skill successes / skill failures / crit fails: prefer first-person "I …" as Blingus.
- Crit hits must clearly land on a foe/target. Crit fails must clearly go wrong (miss, fumble, backfire, self/environment mishap).
- For crit hits/fails: honor the attack type (slash, pierce, blunt, or magic) and the specific weapon or D&D 5.5e/2024 bard spell named in Detail. Magic lines should feel like that spell (psychic mockery, thunder boom, radiant wisp, heated armor, etc.), not a generic blast.
- Battle cries: short, shoutable, 1-2 sentences max. Energetic, theatrical, first person or imperative.
- Insults: cutting and funny, aimed at the focus when specified. One or two sentences.
- Compliments: sincere-ish praise with Blingus vanity or backhanded warmth. One or two sentences.
- Chaucer introductions: ornate herald-style presentation suitable to read aloud. Longer is fine (2-5 sentences). Use "Behold", "Hark", "Presenting", or similar flourish. Invent flattering or teasing epithets. Do not spoil module plot.
- When a specific name is provided, clearly address or present that person by name in every line.
{party_mode}"""

    user = f"""Write {count} lines for this selection:

Scene: {scene}
Setting: {setting or '(unspecified)'}
Weather: {weather or '(unspecified)'}
Lighting: {lighting or '(unspecified)'}
Environment tags: {env_note}
Current mood: {mood_note}
Outcome type: {OUTCOME_LABELS[outcome]}
Attack type: {attack_type or '(n/a)'}
Detail (weapon / bard spell / skill): {detail or '(none)'}
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
                max_tokens = 2500 if body.get("outcome") == "introduction" else 1200
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
