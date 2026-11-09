<?php
/**
 * Speak text via ElevenLabs. The key never goes to the browser.
 * Key: ELEVENLABS_API_KEY or api/.elevenlabs_key
 * Voice: ELEVENLABS_VOICE_ID or api/.elevenlabs_voice
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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function jsonFail($message, $code = 400) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function cleanVoiceId($raw) {
    $raw = trim((string) $raw);
    if (preg_match('/voiceId=([A-Za-z0-9]{8,40})/', $raw, $m)) {
        return $m[1];
    }
    if (preg_match('/^[A-Za-z0-9]{8,40}$/', $raw)) {
        return $raw;
    }
    return '';
}

function loadSecret($envName, $file) {
    $value = getenv($envName) ?: '';
    if ($value !== '') {
        return trim($value);
    }
    $candidates = ['/etc/blingus/' . basename($file), $file];
    foreach ($candidates as $candidate) {
        if (is_readable($candidate)) {
            return trim((string) file_get_contents($candidate));
        }
    }
    return '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonFail('POST required', 405);
}

$elevenKey = loadSecret('ELEVENLABS_API_KEY', __DIR__ . '/.elevenlabs_key');
if ($elevenKey === '') {
    jsonFail('ElevenLabs API key not configured on server', 503);
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

$text = trim((string) ($body['text'] ?? ''));
if ($text === '') {
    jsonFail('Text required');
}
if (strlen($text) > 5000) {
    jsonFail('Text is too long to speak (5000 character max)');
}

$voice = cleanVoiceId($body['voiceId'] ?? '');
if ($voice === '') {
    $characterVoices = [
        'blingus' => 'NJf2N7XT2iBE8xJ0XHlo',
    ];
    $speaker = strtolower(trim((string) ($body['speaker'] ?? '')));
    if (!preg_match('/^[a-z0-9]{0,32}$/', $speaker)) {
        $speaker = '';
    }
    $voice = $characterVoices[$speaker] ?? '';
}
if ($voice === '') {
    $voice = loadSecret('ELEVENLABS_VOICE_ID', __DIR__ . '/.elevenlabs_voice');
}
if ($voice === '') {
    $voice = 'JBFqnCBsd6RMkjVDRZzb';
}
if (!preg_match('/^[A-Za-z0-9]{8,40}$/', $voice)) {
    jsonFail('Invalid ElevenLabs voice id on server', 500);
}

$model = getenv('ELEVENLABS_MODEL') ?: 'eleven_multilingual_v2';
if (!preg_match('/^[A-Za-z0-9_]{3,64}$/', $model)) {
    $model = 'eleven_multilingual_v2';
}

$payload = json_encode([
    'text' => $text,
    'model_id' => $model,
]);
$url = 'https://api.elevenlabs.io/v1/text-to-speech/' . rawurlencode($voice);
$headers = [
    'Content-Type: application/json',
    'Accept: audio/mpeg',
    'xi-api-key: ' . $elevenKey,
];

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 60,
    ]);
    $audio = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($audio === false) {
        jsonFail('Speech request failed: ' . $curlErr, 502);
    }
} else {
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $payload,
            'timeout' => 60,
            'ignore_errors' => true,
        ],
    ]);
    $audio = @file_get_contents($url, false, $context);
    if ($audio === false) {
        jsonFail('Speech request failed. Check allow_url_fopen / outbound HTTPS.', 502);
    }
    $httpCode = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $httpCode = (int) $m[1];
    }
}

if ($httpCode < 200 || $httpCode >= 300) {
    $decoded = json_decode($audio, true);
    $detail = is_array($decoded) ? ($decoded['detail'] ?? null) : null;
    $message = 'Speech failed (HTTP ' . $httpCode . ')';
    if (is_array($detail) && !empty($detail['message'])) {
        $message = (string) $detail['message'];
    } elseif (is_string($detail) && $detail !== '') {
        $message = $detail;
    }
    jsonFail($message, 502);
}

header('Content-Type: audio/mpeg');
header('Content-Length: ' . strlen($audio));
header('Cache-Control: no-store');
echo $audio;
