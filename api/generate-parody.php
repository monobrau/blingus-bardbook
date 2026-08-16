<?php
/**
 * Generate one Blingus song-parody lyric via Anthropic Claude.
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

$section = strtolower(trim((string) ($body['section'] ?? '')));
$allowedSections = ['spells', 'bardic', 'mockery'];
if (!in_array($section, $allowedSections, true)) {
    jsonFail('section must be spells, bardic, or mockery');
}

$category = trim((string) ($body['category'] ?? ''));
if ($category === '' || strlen($category) > 80) {
    jsonFail('category is required');
}

$mode = strtolower(trim((string) ($body['mode'] ?? 'lyrics')));
if (!in_array($mode, ['lyrics', 'correct'], true)) {
    $mode = 'lyrics';
}

$song = trim((string) ($body['song'] ?? ''));
$artist = trim((string) ($body['artist'] ?? ''));
if ($song === '' || strlen($song) > 80) {
    jsonFail('song is required');
}
if (strlen($artist) > 80) {
    jsonFail('artist is too long');
}
if ($mode === 'lyrics' && $artist === '') {
    jsonFail('artist is required');
}

$guidance = trim((string) ($body['guidance'] ?? ''));
if (strlen($guidance) > 400) {
    $guidance = substr($guidance, 0, 400);
}

$examples = [];
$examplesRaw = $body['examples'] ?? [];
if (is_array($examplesRaw)) {
    foreach ($examplesRaw as $ex) {
        if (!is_string($ex)) {
            continue;
        }
        $ex = trim($ex);
        if ($ex === '' || strlen($ex) > 240) {
            continue;
        }
        $examples[] = $ex;
        if (count($examples) >= 8) {
            break;
        }
    }
}

$rating = strtolower(trim((string) ($body['rating'] ?? '')));
$allowedRatings = ['g', 'pg', 'pg-13', 'r', 'x'];
if (!in_array($rating, $allowedRatings, true)) {
    $rating = '';
}

$kind = $section === 'spells'
    ? 'D&D spell parody'
    : ($section === 'bardic' ? 'bardic inspiration parody' : 'vicious mockery / roast parody');

$exampleBlock = count($examples)
    ? "- Match this house style (short, hook-faithful, usable at the table):\n- " . implode("\n- ", $examples)
    : '- Keep it to one short sung couplet, about one or two sentences.';

$guidanceBlock = $guidance !== ''
    ? "PLAYER GUIDANCE (honor this):\n{$guidance}"
    : 'No extra player guidance. Write a strong default that fits the category.';

$ratingBlock = $rating !== ''
    ? "Content rating ceiling: {$rating}. Do not exceed it."
    : 'Content rating: typical PG-13 table. Suggestive is fine. No explicit sex.';

$artistShown = $artist !== '' ? $artist : '(blank)';

if ($mode === 'correct') {
    $system = <<<SYS
You identify the well-known recording a player almost certainly means.

HOUSE RULES:
- Return ONLY a JSON object: {"song":"...","artist":"..."} with no markdown fences and no commentary.
- Player typed song: {$song}
- Player typed artist: {$artistShown}
- If the artist is wrong, misspelled, missing, a featured-only credit, or a common mixup, return the canonical recording artist.
- If the typed artist recorded a well-known version of this song, KEEP that artist even if another version is more famous.
- If the artist is blank, fill the best-known recording artist for this title.
- Fix only clear song-title typos. Do not rename it to a different track.
- If you are not reasonably sure, keep what the player typed. A blank artist may stay blank.
- Never use em dashes or en dashes.
SYS;
    $user = <<<USR
Confirm the recording for "{$song}" by {$artistShown}.
Correct a wrong, missing, or misspelled artist. Keep the artist if they recorded a real version of this song.
Respond with {"song":"...","artist":"..."} only.
USR;
    $maxTokens = 150;
    $temperature = 0.2;
} else {
    $system = <<<SYS
You write one karaoke-bard song parody lyric as Blingus the Wayfarer, a College of Lore fairy bard.

HOUSE RULES:
- Return ONLY a JSON object: {"lyrics":"...","song":"...","artist":"..."} with no markdown fences and no commentary.
- The lyrics are what Blingus sings at the table for this {$kind}.
- Category / list: {$category}
- Player typed song: {$song}
- Player typed artist: {$artist}
- Confirm the well-known recording the player almost certainly means.
- If the artist is wrong, misspelled, a featured-only credit, or a common mixup, return the canonical recording artist.
- If the typed artist recorded a well-known version of this song, KEEP that artist even if another version is more famous.
- If you are not reasonably sure, keep the player's artist.
- Fix only clear song-title typos. Do not rename it to a different track.
- Rewrite the real, well-known song so the lyrics fit this category. Keep the original hook recognizable (same cadence, famous phrases twisted).
- Do NOT quote the original lyrics verbatim. Do NOT name the song or artist in the lyric.
- Fantasy / D&D table talk is welcome (HP, slots, saves). Avoid modern gadgets, cars, phones, neon, science labs.
- Never use em dashes or en dashes. Always capitalize the pronoun I.
- One complete option only. Not a verse, not a numbered list.
{$exampleBlock}
{$ratingBlock}
SYS;
    $user = <<<USR
Write one parody lyric for "{$song}" by {$artist}, for the {$kind} list "{$category}".

First confirm the recording. Correct a wrong or misspelled artist. Keep the artist if they recorded a real version of this song.

{$guidanceBlock}

Respond with {"lyrics":"...","song":"...","artist":"..."} only.
USR;
    $maxTokens = 400;
    $temperature = 0.95;
}

$model = getenv('ANTHROPIC_MODEL') ?: 'claude-sonnet-4-6';
$payload = [
    'model' => $model,
    'max_tokens' => $maxTokens,
    'temperature' => $temperature,
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

if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/s', $text, $m)) {
    $text = trim($m[1]);
}

function creditKey($value) {
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/\s+/', ' ', $value);
    $value = preg_replace('/^the /', '', $value);
    return $value;
}

function cleanCredit($value, $fallback) {
    $value = trim((string) $value);
    $value = str_replace(["\u{2014}", "\u{2013}"], '-', $value);
    $value = preg_replace('/\s+/', ' ', $value);
    if ($value === '' || strlen($value) > 80) {
        return $fallback;
    }
    return $value;
}

$lyrics = '';
$outSong = $song;
$outArtist = $artist;
$parsed = json_decode($text, true);
if (is_array($parsed)) {
    if (isset($parsed['lyrics']) && is_string($parsed['lyrics'])) {
        $lyrics = $parsed['lyrics'];
    } elseif (isset($parsed['t']) && is_string($parsed['t'])) {
        $lyrics = $parsed['t'];
    } elseif (isset($parsed[0]) && is_string($parsed[0])) {
        $lyrics = $parsed[0];
    }
    if (isset($parsed['song']) && is_string($parsed['song'])) {
        $outSong = cleanCredit($parsed['song'], $song);
    }
    if (isset($parsed['artist']) && is_string($parsed['artist'])) {
        $outArtist = cleanCredit($parsed['artist'], $artist);
    }
}
if ($lyrics === '') {
    $lyrics = trim($text, " \t\"'");
}

$lyrics = trim($lyrics);
$lyrics = str_replace(["\u{2014}", "\u{2013}"], ', ', $lyrics);
$lyrics = preg_replace('/\s+/', ' ', $lyrics);
$lyrics = preg_replace('/\bi\b/', 'I', $lyrics);
if (strlen($lyrics) > 400) {
    $lyrics = substr($lyrics, 0, 400);
}

$creditPayload = [
    'success' => true,
    'song' => $outSong,
    'artist' => $outArtist,
    'artistCorrected' => creditKey($outArtist) !== creditKey($artist),
    'songCorrected' => creditKey($outSong) !== creditKey($song),
    'model' => $model,
];

if ($mode === 'correct') {
    echo json_encode($creditPayload);
    exit;
}

if ($lyrics === '') {
    jsonFail('Could not parse lyrics from Claude response', 502);
}

$creditPayload['lyrics'] = $lyrics;
echo json_encode($creditPayload);
