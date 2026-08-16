<?php
/**
 * Generate Blingus outcome lines via Anthropic Claude.
 * API key from ANTHROPIC_API_KEY env or api/.anthropic_key (never commit the key file).
 */

$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://blingus.knospe.org',
    'http://blingus.knospe.org',
    'https://bardbook.knospe.org',
    'http://bardbook.knospe.org',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$localOrigin = (bool) preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
if (in_array($origin, $allowedOrigins, true) || $localOrigin) {
    header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : 'http://127.0.0.1'));
} else {
    header('Access-Control-Allow-Origin: ' . ($allowedOrigins[0] ?? '*'));
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'POST required']);
    exit;
}

function jsonFail($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function loadAnthropicKey() {
    $key = getenv('ANTHROPIC_API_KEY') ?: '';
    if ($key !== '') {
        return trim($key);
    }
    $file = __DIR__ . '/.anthropic_key';
    if (is_readable($file)) {
        return trim((string) file_get_contents($file));
    }
    return '';
}

$anthropicKey = loadAnthropicKey();
if ($anthropicKey === '') {
    jsonFail('Anthropic API key not configured on server', 503);
}

$blingusApiKey = getenv('BLINGUS_API_KEY') ?: '';
if ($blingusApiKey !== '') {
    $provided = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $provided, $m)) {
        $provided = $m[1];
    } else {
        $provided = $_GET['key'] ?? '';
    }
    if ($provided === '' || !hash_equals($blingusApiKey, $provided)) {
        jsonFail('Unauthorized', 401);
    }
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '', true);
if (!is_array($body)) {
    jsonFail('Invalid JSON body');
}

$scene = trim((string) ($body['scene'] ?? ''));
$setting = strtolower(trim((string) ($body['setting'] ?? '')));
if (!in_array($setting, ['indoors', 'outdoors', ''], true)) {
    $setting = '';
}
$weather = strtolower(trim((string) ($body['weather'] ?? '')));
$lighting = strtolower(trim((string) ($body['lighting'] ?? '')));
$environmentRaw = $body['environment'] ?? [];
$environment = [];
if (is_array($environmentRaw)) {
    foreach ($environmentRaw as $item) {
        if (!is_string($item)) {
            continue;
        }
        $item = trim($item);
        if ($item !== '' && strlen($item) <= 40) {
            $environment[] = $item;
        }
    }
    $environment = array_values(array_unique($environment));
    $environment = array_slice($environment, 0, 8);
}
$outcome = trim((string) ($body['outcome'] ?? ''));
$attackType = strtolower(trim((string) ($body['attackType'] ?? '')));
$allowedAttackTypes = ['slash', 'pierce', 'blunt', 'magic', ''];
if (!in_array($attackType, $allowedAttackTypes, true)) {
    $attackType = '';
}
$detail = trim((string) ($body['detail'] ?? ''));
$target = trim((string) ($body['target'] ?? 'any'));
$name = trim((string) ($body['name'] ?? ''));
if (strlen($name) > 80) {
    $name = substr($name, 0, 80);
}
$intent = trim((string) ($body['intent'] ?? ''));
if (strlen($intent) > 80) {
    $intent = substr($intent, 0, 80);
}
$partyMemberFlag = !empty($body['partyMember']);
$personality = trim((string) ($body['personality'] ?? ''));
$mood = strtolower(trim((string) ($body['mood'] ?? '')));
$moodPrompt = trim((string) ($body['moodPrompt'] ?? ''));
if (strlen($mood) > 40) {
    $mood = substr($mood, 0, 40);
}
if (strlen($moodPrompt) > 400) {
    $moodPrompt = substr($moodPrompt, 0, 400);
}
$count = (int) ($body['count'] ?? 5);
$combatRound = !empty($body['combatRound']) || (($body['pace'] ?? '') === 'battle');
$pace = strtolower(trim((string) ($body['pace'] ?? '')));
if ($pace !== 'battle' && $pace !== 'roleplay') {
    $pace = $combatRound ? 'battle' : 'roleplay';
}
$forceParody = !empty($body['forceParody']);
$characterBlock = trim((string) ($body['characterBlock'] ?? ''));
if (strlen($characterBlock) > 5000) {
    $characterBlock = substr($characterBlock, 0, 5000);
}
$kitMatch = trim((string) ($body['kitMatch'] ?? ''));
if (strlen($kitMatch) > 800) {
    $kitMatch = substr($kitMatch, 0, 800);
}
$rating = strtolower(trim((string) ($body['rating'] ?? '')));
$allowedRatings = ['g', 'pg', 'pg-13', 'r', 'x'];
if (!in_array($rating, $allowedRatings, true)) {
    $rating = '';
}

/** Blingus table roster — matching names unlock raunchy party mode. */
$partyRoster = [
    'blingus',
    'brawn',
    "brawn o'neil",
    "brawn o'neal",
    'puck',
    'puck pinewhistle',
    'puke',
    'vandan',
    'vadania',
    'vadania amakiir',
    'bo',
    'van damme',
    'vandamme',
];

/** Table-known hooks only (from session notes). No unrevealed module spoilers. */
$partyFlavorByKey = [
    'blingus' => 'Self-roast welcome. L5 Lore fairy bard: vanity, name-amnesia, two daggers and a shortbow, fly speed, Cutting Words, Sir Whats-his-face energy.',
    'puck' => 'Fellow fairy Wild Magic sorcerer. Sparkles, twin-spell mischief, affectionate "Puke" nickname ok, glitter and bad decisions.',
    'brawn' => 'Dwarven monk. Currently wears the Crown of Remembrance. Drinks, thinks, swings. Table-known: Valor\'s Call / Elkhorn adjacent if it fits, but do not invent module plot.',
    'vadania' => 'Elven ranger Vadania Amakiir; the table casually calls them Vandan, Van Damme, or whatever feels right. Paranoid bow-watcher. Checks doors twice, prods chests, got Scorching-Rayed by a "helpful" ally during a mimic-chair fight. Trust issues are comedy gold. Mix nicknames mid-bit.',
    'bo' => 'Toad-cauldron era, enlarge heroics, dragon breath at Granny Nightshade. Closest thing Blingus has to family. Zybilna-silent warlock mentor flavor when it fits. Toad jokes never die.',
];

function isPartyMemberName(string $name, array $roster): bool {
    $needle = strtolower(trim($name));
    if ($needle === '') {
        return false;
    }
    if (in_array($needle, $roster, true)) {
        return true;
    }
    $first = explode(' ', $needle, 2)[0];
    return in_array($first, $roster, true);
}

function partyFlavorKey(string $name): string {
    $needle = strtolower(trim($name));
    if ($needle === '') {
        return '';
    }
    if (str_contains($needle, 'brawn')) {
        return 'brawn';
    }
    if (str_contains($needle, 'puck') || $needle === 'puke') {
        return 'puck';
    }
    if (str_contains($needle, 'vandan') || str_contains($needle, 'vadania') || str_contains($needle, 'van damme') || $needle === 'vandamme') {
        return 'vadania';
    }
    if ($needle === 'bo' || str_starts_with($needle, 'bo ')) {
        return 'bo';
    }
    if (str_contains($needle, 'blingus')) {
        return 'blingus';
    }
    $first = explode(' ', $needle, 2)[0];
    return $first;
}

$isPartySubject = $partyMemberFlag || isPartyMemberName($name, $partyRoster);
if ($count < 1) {
    $count = 1;
}
if ($count > 8) {
    $count = 8;
}

$allowedOutcomes = [
    'roleplay', 'meanwhile', 'hit', 'fail', 'success', 'failure',
    'battleCry', 'mockery', 'cuttingWords', 'insult', 'compliment', 'toast', 'introduction', 'feyGambit',
];
$speechOutcomes = ['battleCry', 'mockery', 'cuttingWords', 'insult', 'compliment', 'toast', 'introduction', 'feyGambit'];
$detailOutcomes = ['hit', 'fail', 'success', 'failure'];

if ($scene === '' || !in_array($outcome, $allowedOutcomes, true)) {
    jsonFail('Missing or invalid scene/outcome');
}
if (in_array($outcome, $detailOutcomes, true) && $detail === '') {
    jsonFail('Missing weapon, spell, or skill');
}
if (in_array($outcome, ['hit', 'fail'], true) && $attackType === '') {
    jsonFail('Missing attack type (slash, pierce, blunt, or magic)');
}
if ($personality === '') {
    jsonFail('Personality text is required');
}

$outcomeLabels = [
    'roleplay' => 'Roleplay action (a directed beat the player chose to do)',
    'meanwhile' => 'Meanwhile / idle beat (the DM asked what Blingus is doing; the player had no plan)',
    'hit' => 'Critical hit description',
    'fail' => 'Critical fail description',
    'success' => 'Skill check success',
    'failure' => 'Skill check failure',
    'battleCry' => 'Battle cry (short shouted line before or during a fight)',
    'mockery' => 'Vicious Mockery (the spoken cantrip the player will deliver at the table)',
    'insult' => 'Insult (witty verbal jab, not the cantrip)',
    'compliment' => 'Compliment (warm but Blingus-flavored praise)',
    'toast' => 'Raised-glass toast the player can speak at the table',
    'introduction' => 'Chaucer-style herald introduction (ornate party/NPC presentation)',
    'cuttingWords' => 'Cutting Words (Lore reaction: spoken barb that subtracts a BI die from a seen creature\'s attack, check, or damage)',
    'feyGambit' => 'Fey gambit (a bluff that the mark is bound by fairy custom: rule of three, reciprocity, true-name, octave)',
];

$detailNote = $detail !== '' ? $detail : '(none)';
$attackTypeNote = $attackType !== '' ? $attackType : '(n/a)';
$settingNote = $setting !== '' ? $setting : '(unspecified)';
$weatherNote = $weather !== '' ? $weather : '(unspecified)';
$lightingNote = $lighting !== '' ? $lighting : '(unspecified)';
$environmentNote = count($environment) ? implode(', ', $environment) : '(none specified)';
$targetNote = ($target === '' || $target === 'any') ? 'any / unspecified' : $target;
$nameNote = $name !== '' ? $name : '(no specific name)';
$intentNote = $intent !== '' ? $intent : '(none)';

$ratingGuides = [
    'g' => 'CONTENT RATING G (ACTIVE, overrides mood and party-raunch for adult content): All-ages family table. No sexual content, no innuendo, no crude slang, no graphic gore. Violence stays cartoon slapstick. Keep Blingus theatrical and funny without dirty jokes. A "lewd" mood at G is playful charm only.',
    'pg' => 'CONTENT RATING PG (ACTIVE, overrides mood and party-raunch for adult content): Mild adventure table. Light language (darn, heck, occasional damn). The faintest wink of innuendo is the ceiling. No explicit sex, no graphic anatomy, no bedroom jokes. Violence stays PG action.',
    'pg-13' => 'CONTENT RATING PG-13 (ACTIVE, overrides mood and party-raunch for adult content): Typical teen D&D table. Suggestive innuendo, damn/hell/ass, implied adult situations are fine. No explicit sex acts, no graphic anatomy, no porn-narration. Do not escalate to R.',
    'r' => 'CONTENT RATING R (ACTIVE): Explicit sexual jokes, strong language, and crude body humor are welcome. Still a funny in-world table line, not a sex scene. Rated R table banter. Do not sanitize to PG-13.',
    'x' => 'CONTENT RATING X (ACTIVE): No ceiling. Graphic sexual content, filthy language, explicit acts, NC-17. Still characterful Blingus, not a medical manual. Do not sanitize or fade to black.',
];

$ratingBlock = '';
$ratingNote = 'unset (use table default: party members get raunch; others follow mood)';
if ($rating !== '') {
    $ratingNote = strtoupper($rating);
    $ratingGuide = $ratingGuides[$rating];
    $ratingBlock = <<<RATE

CONTENT RATING (mandatory for every line in this batch):
Rating: {$ratingNote}
{$ratingGuide}
- Honor this rating even if mood is lewd, flirty, or petty, and even if the subject is a party member.
- Do not exceed this rating. Do not ignore it.
RATE;
}

$partyModeBlock = '';
$partySubjectNote = 'no';
if ($isPartySubject && $name !== '') {
    $partySubjectNote = $rating !== ''
        ? 'yes — party member; honor the content rating for adultness'
        : 'yes — use party raunch mode';
    $partyAdult = $rating !== ''
        ? "- Adultness comes from the CONTENT RATING above, not from this party block. Do not escalate past that rating just because the subject is a PC.\n"
        : "- This table wants exceptionally raunchy, adult, filthy humor aimed at fellow PCs.\n- Lean hard into crude sexual innuendo, explicit jokes, bedroom/body humor, and shameless double entendres in Blingus's theatrical voice.\n- Do not sanitize, soften, or keep it PG-13. Rated R to NC-17 table banter is expected and welcome.\n";
    $partyModeBlock = <<<PARTYMODE

PARTY SUBJECT MODE (active — subject is a table party member):
{$partyAdult}- Still funny and characterful, not just shock for shock's sake. Stay in-world as Blingus.
- Still obey no-em-dash / no-en-dash and JSON-array-only rules.
- Every line must clearly involve the named party member.
PARTYMODE;
    $flavorKey = partyFlavorKey($name);
    $flavor = $partyFlavorByKey[$flavorKey] ?? 'Use established table chemistry and in-jokes for this companion.';
    $partyModeBlock .= "\n- Every line must clearly involve {$name} by name.\n";
    $partyModeBlock .= "- Party-member flavor for {$name}: {$flavor}\n";
    $partyModeBlock .= "- Lean on table-known gags when they fit: toad-Bo, Crown of Remembrance, mimic chairs, Scorching Ray friendly fire, Stinky Court, mud muffins, Sir Whats-his-face, Sir Talavar, marching-band near-wipe, Granny in the oven.\n";
}

$moodNote = $mood !== '' ? $mood : 'playful';
$moodGuide = $moodPrompt !== ''
    ? $moodPrompt
    : 'Match a playful theatrical Blingus register unless the outcome type requires otherwise.';

$sheetBlock = '';
if ($characterBlock !== '') {
    $sheetBlock = <<<SHEET

CURRENT CHARACTER SHEET (authoritative mechanical state):
{$characterBlock}
SHEET;
}
$kitMatchBlock = '';
if ($kitMatch !== '') {
    $kitMatchBlock = <<<KIT

ITEM IN PLAY FOR THIS BATCH (wizard Detail is authoritative):
{$kitMatch}
- Every combat line must be recognizably THIS item. Do not replace it with a different weapon or spell, even if the standing sheet lists something else.
KIT;
}

$forceParodyBlock = '';
if ($forceParody) {
    $forceParodyBlock = <<<'PARODY'

FORCE SONG PARODY MODE (ACTIVE, overrides the occasional parody rule):
- EVERY line in this batch MUST weave a recognizable song parody into the beat.
- Rewrite a real, well-known song so the lyrics fit this outcome, scene, and mood. Keep the original hook recognizable (same cadence, famous phrases twisted).
- Do NOT quote the original lyrics verbatim. Do NOT name the song or artist in the line. The table should hear the tune without a citation.
- This is Blingus's karaoke-bard style (Vicious Mockery / spell parodies), not a cheesy lovesong smash and not a sung verse for its own sake.
- Still match the requested outcome type exactly. The parody serves the hit, fail, roast, toast, roleplay, or meanwhile beat; it does not replace it.
- Lean hard on very well-known 80s and 90s rap/hip-hop the whole table would recognize (Jump Around, Ice Ice Baby, U Can't Touch This, Gangsta's Paradise, California Love, Baby Got Back, Mama Said Knock You Out, It's Tricky, Bust a Move, Hip Hop Hooray, Gettin' Jiggy Wit It, Insane in the Brain, Whoomp! There It Is, Regulate, No Diggity, This Is How We Do It, It Takes Two, The Humpty Dance, Informer, Still D.R.E.). Mix in karaoke-classic pop/rock. Avoid deep cuts.
- Vary the source songs across the batch. Do not reuse the same hook in every line.
- The joke is the collision: a familiar chorus twisted into this exact table moment, delivered in Blingus's theatrical voice.
PARODY;
}

$paceLengthBlock = '';
if ($combatRound || $pace === 'battle') {
    $paceLengthBlock = <<<'ROUND'

IN BATTLE LENGTH (ACTIVE):
- Fit a D&D combat turn: any spoken dialogue Blingus would say aloud must take about 6 seconds or less of real spoken time (roughly 12-18 words of dialogue, one breath / one shout).
- Prefer punchy one-liners. Do not write long speeches, multi-clause lectures, or multi-sentence heralds.
- If a line mixes narration and speech, keep the spoken part inside that ~6s budget; keep the whole string short enough to use mid-round.
- The COUNT_PLACEHOLDER strings are alternative options for the SAME turn. The player will pick one. Do not write a speech split across the array.
- This overrides longer defaults (including Chaucer introductions). Keep theatrical voice; keep length tight.
- Song Parody (if also active) must still fit the same ~6s spoken budget: a short lyric snatch, not a verse.
ROUND;
    $paceLengthBlock = str_replace('COUNT_PLACEHOLDER', (string) $count, $paceLengthBlock);
} else {
    $paceLengthBlock = <<<'ROLEPLAY'

OUT OF BATTLE / ROLEPLAY LENGTH (ACTIVE):
- These are not combat-turn lines. Each of the {$count} strings may be a richer beat: about 3-5 sentences or a short paragraph when speech or narration needs room.
- Still self-contained and usable at the table. Do not write essays.
- Prefer vivid table beats over one-liner quips unless the outcome type is inherently short.
- Song Parody (if also active) may use a fuller parody couplet, still inside that 3-5 sentence beat.
ROLEPLAY;
    // Expand count into the heredoc (single-quoted heredoc does not interpolate).
    $paceLengthBlock = str_replace('{$count}', (string) $count, $paceLengthBlock);
}

$system = <<<SYS
You write short tabletop RPG lines in character as Blingus for a D&D helper app.

PERSONALITY (follow closely):
{$personality}

CURRENT MOOD (mandatory emotional register for every line in this batch):
Mood id: {$moodNote}
{$moodGuide}
- Every line must fit this mood. Do not drift into a conflicting emotional register.
- Mood colors delivery and attitude; it does not change the requested outcome type.

HOUSE RULES:
- Return ONLY a JSON array of exactly {$count} strings. No markdown fences, no commentary.
- Each string is one complete, self-contained option. In battle: keep it to one short spoken beat. Out of battle: a 3-5 sentence beat is welcome.
- Capitalize the pronoun I. Never use em dashes or en dashes; use commas or hyphens.
- Match the outcome type exactly.
- Stay scene-appropriate. Do not force wilderness framing into taverns/shops, or tavern framing into caves.
- Honor indoors vs outdoors, plus any weather, lighting, and environment tags. Fold them into the beat naturally (do not just list the tags).
- Lines in the batch must be structurally distinct from each other (not the same sentence with one noun swapped).
- Roleplay lines: a directed table beat the player chose. Prefer gerund/present-participial prompts (e.g. "Scanning the room...") or short present-tense beats. He is doing something on purpose. If a Situation / intent is set (Busking, Haggling, Hovering nearby, Hanging back, Short rest / tune up, Forgetting a name, Watching the chairs, Eavesdropping, Spending Lucky), every line must be that beat.
- Meanwhile lines: the DM just asked "what is Blingus doing?" and the player froze. Each line is a caught-in-the-act idle habit, already in progress when the camera cuts to him. Hovering, tuning a clarinet/fiddle/pan flute, prestidigitation fidgets, eavesdropping, name-amnesia, watching chairs, looking pretty, snacking, nosing in a bag, humming, fussing with cloth wings. Not a skill check, not an attack, not a speech, not a toast, not a useful job that solves the scene. Mood, place, lighting, and weather color the habit. If a name is given, he may be idle near or about that person. If a Situation / intent is set, every line must be that habit. Present-tense or gerund.
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
- Lean on table-known Prismeer hooks when they fit: Sir Talavar, Stinky Court, mud muffins, mimic chairs, marching-band near-wipe, Skabatha dead in the oven, Bavlorna still owed yarn, Lamorna/Elidon horn, Crown of Remembrance on Brawn. Do not invent unpublished Witchlight spoilers.
- If Scene names a Feywild or Prismeer place, write to THAT place (Hither mud, Loomlurch timber, Yon peaks, a goblin market, etc.). If Name / subject is a creature, aim the beat at that foe. Do not invent unpublished Witchlight plot.
- Battle cries: short, shoutable, 1-2 sentences max. Energetic, theatrical, first person or imperative.
- Vicious Mockery: these lines ARE the cantrip. Write the exact words Blingus speaks as the verbal component, ready for the player to read aloud. First-person spoken roast, psychic sting, WIS-save flavor welcome. Do not narrate "I cast Vicious Mockery"; deliver the mockery itself. In battle: one breath. Out of battle: a longer cantrip delivery (3-5 sentences) is fine. Always aim at the named foe when given. This is not a generic insult.
- Insults: cutting table jab, not the cantrip. Aimed at the focus when specified. In battle: one breath. Out of battle: a longer roast (3-5 sentences) is fine.
- Compliments: sincere-ish praise with Blingus vanity or backhanded warmth. In battle: one breath. Out of battle: a longer toast (3-5 sentences) is fine.
- Toasts: a raised-glass speech the player can read aloud. Not a UI popup, not a compliment-only line, not a herald intro. Cup, mug, or flask up; honor the named subject (person, party, victory, place, or the dead). Mood and rating color the toast (playful, petty, melancholy, lewd, etc.). In battle: one breath. Out of battle: 3-5 sentences, still speakable.
- Chaucer introductions: ornate herald-style presentation suitable to read aloud. In battle: one tight flourish. Out of battle: 3-5 sentences. Use "Behold", "Hark", "Presenting", or similar flourish. Invent flattering or teasing epithets. Do not spoil module plot.
- Cutting Words: these lines ARE the Lore reaction the player speaks. Spend a Bardic Inspiration die to subtract from a seen creature's attack roll, ability check, or damage roll within 60 ft. Write the spoken barb, ready to read aloud. Do not narrate "I use Cutting Words." Do not add to an ally's roll (that is Bardic Inspiration). Do not add to AC (that is Valor Combat Inspiration). In battle: one breath. Out of battle: a longer barb (3-5 sentences) is fine. Aim at the named foe when given.
- Fey gambit: Blingus is bluffing that fairy custom binds the mark. Lean on table-known bits only: rule of three, law of reciprocity, true-name bargains, octave / eight-day cycles. He is theatrical and self-aware; the joke is that he is selling mystique, not that the universe confirmed it. Do not invent unpublished Witchlight law or spoilers. If a Situation chip is set (Rule of three, Reciprocity, True-name bluff, Octave / eight-day cycle), use THAT gambit. Speakable at the table. Out of battle: 3-5 sentences.
- When a specific name is provided, clearly address or present that person by name in every line.
- OCCASIONAL SONG PARODY: in a minority of lines (about 0-1 per batch), Blingus may weave a recognizable song-parody snatch into the beat in his karaoke-bard style. Prefer well-known 80s/90s rap/hip-hop or karaoke classics the table would know on sight. Most lines stay unsung. When Force Song Parody is active, ignore this rarity and do every line.
{$sheetBlock}
{$kitMatchBlock}
{$ratingBlock}
{$partyModeBlock}
{$forceParodyBlock}
{$paceLengthBlock}
SYS;

$user = <<<USR
Write {$count} lines for this selection:

Scene: {$scene}
Setting: {$settingNote}
Weather: {$weatherNote}
Lighting: {$lightingNote}
Environment tags: {$environmentNote}
Current mood: {$moodNote}
Content rating: {$ratingNote}
Pace: {$pace}
Outcome type: {$outcomeLabels[$outcome]}
Attack type: {$attackTypeNote}
Detail (weapon / bard spell / skill): {$detailNote}
Target focus: {$targetNote}
Name / subject: {$nameNote}
Situation / intent: {$intentNote}
Party member subject: {$partySubjectNote}

Respond with a JSON array of {$count} strings only.
USR;

$model = getenv('ANTHROPIC_MODEL') ?: 'claude-sonnet-4-6';
$maxTokens = ($pace === 'roleplay' || $outcome === 'introduction') ? 3200 : 900;

$payload = [
    'model' => $model,
    'max_tokens' => $maxTokens,
    'temperature' => 0.9,
    'system' => $system,
    'messages' => [
        ['role' => 'user', 'content' => $user],
    ],
];

function anthropicRequest(array $payload, string $apiKey) {
    $body = json_encode($payload);
    $headers = [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ];

    // Prefer curl when available; fall back to fopen streams (this host's PHP
    // build does not ship the curl extension).
    if (function_exists('curl_init')) {
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_TIMEOUT => 60,
        ]);
        $response = curl_exec($ch);
        $curlErr = curl_error($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($response === false) {
            return [null, 0, 'Claude request failed: ' . $curlErr];
        }
        return [$response, $httpCode, null];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => 60,
            'ignore_errors' => true,
        ],
    ]);
    $response = @file_get_contents('https://api.anthropic.com/v1/messages', false, $context);
    if ($response === false) {
        return [null, 0, 'Claude request failed (stream). Check allow_url_fopen / outbound HTTPS.'];
    }
    $httpCode = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $httpCode = (int) $m[1];
    }
    return [$response, $httpCode, null];
}

[$response, $httpCode, $reqErr] = anthropicRequest($payload, $anthropicKey);
if ($reqErr !== null) {
    jsonFail($reqErr, 502);
}

$decoded = json_decode($response, true);
if ($httpCode < 200 || $httpCode >= 300) {
    $msg = $decoded['error']['message'] ?? ('Anthropic HTTP ' . $httpCode);
    jsonFail($msg, 502);
}

$text = '';
if (isset($decoded['content']) && is_array($decoded['content'])) {
    foreach ($decoded['content'] as $block) {
        if (($block['type'] ?? '') === 'text') {
            $text .= $block['text'] ?? '';
        }
    }
}
$text = trim($text);
if ($text === '') {
    jsonFail('Empty response from Claude', 502);
}

// Strip optional markdown fences
if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/s', $text, $m)) {
    $text = trim($m[1]);
}

$lines = json_decode($text, true);
if (!is_array($lines)) {
    // Fallback: split numbered/bulleted lines
    $parts = preg_split('/\r?\n+/', $text);
    $lines = [];
    foreach ($parts as $part) {
        $part = trim(preg_replace('/^[\-\*\d\.\)\]]+\s*/', '', $part));
        $part = trim($part, " \t\"'");
        if ($part !== '') {
            $lines[] = $part;
        }
    }
}

$clean = [];
foreach ($lines as $line) {
    if (!is_string($line)) {
        continue;
    }
    $line = trim($line);
    $line = str_replace(["\u{2014}", "\u{2013}"], ', ', $line);
    $line = preg_replace('/\bi\b/', 'I', $line);
    if ($line !== '') {
        $clean[] = $line;
    }
}
$clean = array_values(array_unique($clean));
$clean = array_slice($clean, 0, $count);

if (count($clean) < 1) {
    jsonFail('Could not parse lines from Claude response', 502);
}

echo json_encode([
    'success' => true,
    'lines' => $clean,
    'model' => $model,
]);
