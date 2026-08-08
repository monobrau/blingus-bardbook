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
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
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
$outcome = trim((string) ($body['outcome'] ?? ''));
$detail = trim((string) ($body['detail'] ?? ''));
$target = trim((string) ($body['target'] ?? 'any'));
$personality = trim((string) ($body['personality'] ?? ''));
$count = (int) ($body['count'] ?? 5);
if ($count < 1) {
    $count = 1;
}
if ($count > 8) {
    $count = 8;
}

$allowedOutcomes = ['roleplay', 'hit', 'fail', 'success', 'failure'];
if ($scene === '' || !in_array($outcome, $allowedOutcomes, true)) {
    jsonFail('Missing or invalid scene/outcome');
}
if (in_array($outcome, ['hit', 'fail', 'success', 'failure'], true) && $detail === '') {
    jsonFail('Missing weapon, magic type, or skill');
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
];

$detailNote = $detail !== '' ? $detail : '(none — roleplay)';
$targetNote = ($target === '' || $target === 'any') ? 'any / unspecified' : $target;

$system = <<<SYS
You write short tabletop RPG outcome lines in character as Blingus for a D&D helper app.

PERSONALITY (follow closely):
{$personality}

HOUSE RULES:
- Return ONLY a JSON array of exactly {$count} strings. No markdown fences, no commentary.
- Each string is one complete, self-contained line.
- Capitalize the pronoun I. Never use em dashes or en dashes; use commas or hyphens.
- Match the outcome type exactly (success vs failure, crit hit vs crit fail, roleplay).
- Stay scene-appropriate. Do not force wilderness framing into taverns/shops, or tavern framing into caves.
- Lines in the batch must be structurally distinct from each other (not the same sentence with one noun swapped).
- Roleplay lines: prefer gerund/present-participial prompts (e.g. "Scanning the room…") or short present-tense beats.
- Crit hits / skill successes / skill failures / crit fails: prefer first-person "I …" as Blingus.
- Crit hits must clearly land on a foe/target. Crit fails must clearly go wrong (miss, fumble, backfire, self/environment mishap).
SYS;

$user = <<<USR
Write {$count} outcome lines for this selection:

Scene: {$scene}
Outcome type: {$outcomeLabels[$outcome]}
Detail (weapon / magic / skill): {$detailNote}
Target focus: {$targetNote}

Respond with a JSON array of {$count} strings only.
USR;

$model = getenv('ANTHROPIC_MODEL') ?: 'claude-sonnet-4-6';

$payload = [
    'model' => $model,
    'max_tokens' => 1200,
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
