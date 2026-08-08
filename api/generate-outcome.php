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
    'blingus' => 'Self-roast welcome. Fairy bard vanity, name-amnesia, economy-sized blade jokes, Sir Whats-his-face energy.',
    'puck' => 'Fellow fairy sorcerer chaos. Sparkles, twin-spell mischief, affectionate "Puke" nickname ok, glitter and bad decisions.',
    'brawn' => 'Dwarven monk. Fists named Reason and Consequences. Currently wears the Crown of Remembrance. Drinks, thinks, swings.',
    'vadania' => 'Real name Vadania Amakiir; the table casually calls them Vandan, Van Damme, or whatever feels right. Paranoid bow-watcher. Checks doors twice, prods chests, got Scorching-Rayed by a "helpful" ally during a mimic-chair fight. Trust issues are comedy gold. Feel free to mix nicknames mid-bit.',
    'bo' => 'Dwarf who was briefly a toad (cauldron food era). Dragon breath stories, enlarge heroics, Milwaukee energy. Toad jokes never die.',
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
    'roleplay', 'hit', 'fail', 'success', 'failure',
    'battleCry', 'insult', 'compliment', 'introduction',
];
$speechOutcomes = ['battleCry', 'insult', 'compliment', 'introduction'];
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
    'roleplay' => 'Roleplay action (what Blingus is doing right now)',
    'hit' => 'Critical hit description',
    'fail' => 'Critical fail description',
    'success' => 'Skill check success',
    'failure' => 'Skill check failure',
    'battleCry' => 'Battle cry (short shouted line before or during a fight)',
    'insult' => 'Insult (witty verbal jab)',
    'compliment' => 'Compliment (warm but Blingus-flavored praise)',
    'introduction' => 'Chaucer-style herald introduction (ornate party/NPC presentation)',
];

$detailNote = $detail !== '' ? $detail : '(none)';
$attackTypeNote = $attackType !== '' ? $attackType : '(n/a)';
$settingNote = $setting !== '' ? $setting : '(unspecified)';
$weatherNote = $weather !== '' ? $weather : '(unspecified)';
$lightingNote = $lighting !== '' ? $lighting : '(unspecified)';
$environmentNote = count($environment) ? implode(', ', $environment) : '(none specified)';
$targetNote = ($target === '' || $target === 'any') ? 'any / unspecified' : $target;
$nameNote = $name !== '' ? $name : '(no specific name)';

$partyModeBlock = '';
$partySubjectNote = 'no';
if ($isPartySubject && $name !== '') {
    $partySubjectNote = 'yes — use party raunch mode';
    $partyModeBlock = <<<'PARTYMODE'

PARTY SUBJECT MODE (active — subject is a table party member):
- This table wants exceptionally raunchy, adult, filthy humor aimed at fellow PCs.
- Lean hard into crude sexual innuendo, explicit jokes, bedroom/body humor, and shameless double entendres in Blingus's theatrical voice.
- Do not sanitize, soften, or keep it PG-13. Rated R to NC-17 table banter is expected and welcome.
- Still funny and characterful, not just shock for shock's sake. Stay in-world as Blingus.
- Still obey no-em-dash / no-en-dash and JSON-array-only rules.
- Every line must clearly involve the named party member.
PARTYMODE;
    $flavorKey = partyFlavorKey($name);
    $flavor = $partyFlavorByKey[$flavorKey] ?? 'Use established table chemistry and in-jokes for this companion.';
    $partyModeBlock .= "\n- Every line must clearly involve {$name} by name.\n";
    $partyModeBlock .= "- Party-member flavor for {$name}: {$flavor}\n";
    $partyModeBlock .= "- Lean on table-known gags when they fit: toad-Bo, Crown of Remembrance, mimic chairs, Scorching Ray friendly fire, Stinky Court, mud muffins, Sir Whats-his-face name amnesia, fairy dragons.\n";
}

$moodNote = $mood !== '' ? $mood : 'playful';
$moodGuide = $moodPrompt !== ''
    ? $moodPrompt
    : 'Match a playful theatrical Blingus register unless the outcome type requires otherwise.';

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
{$partyModeBlock}
SYS;

$user = <<<USR
Write {$count} lines for this selection:

Scene: {$scene}
Setting: {$settingNote}
Weather: {$weatherNote}
Lighting: {$lightingNote}
Environment tags: {$environmentNote}
Current mood: {$moodNote}
Outcome type: {$outcomeLabels[$outcome]}
Attack type: {$attackTypeNote}
Detail (weapon / bard spell / skill): {$detailNote}
Target focus: {$targetNote}
Name / subject: {$nameNote}
Party member subject: {$partySubjectNote}

Respond with a JSON array of {$count} strings only.
USR;

$model = getenv('ANTHROPIC_MODEL') ?: 'claude-sonnet-4-6';
$maxTokens = $outcome === 'introduction' ? 2500 : 1200;

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
