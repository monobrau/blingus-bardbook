<?php
/**
 * Per-character soundboard clips.
 * Search YouTube, pull audio, trim a short section, store it on the server.
 * Also creates an ElevenLabs sound effect when a separate sound-effects key is set.
 * Personal homelab use. YouTube clips require yt-dlp, ffmpeg, and ffprobe.
 */

$API_KEY = getenv('BLINGUS_API_KEY') ?: '';
$requireAuth = $API_KEY !== '';

$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://blingus.knospe.org',
    'http://blingus.knospe.org',
    'https://bardbook.knospe.org',
    'http://bardbook.knospe.org',
    'https://puck.knospe.org',
    'http://puck.knospe.org',
    'https://vadania.knospe.org',
    'http://vadania.knospe.org',
    'https://brawn.knospe.org',
    'http://brawn.knospe.org',
    'https://bruck.knospe.org',
    'http://bruck.knospe.org',
];

const SB_MAX_CLIP_SECONDS = 45.0;
const SB_MIN_CLIP_SECONDS = 0.3;
const SB_MAX_SOURCE_SECONDS = 10800.0;
const SB_MAX_CLIPS = 40;
const SB_AUDIO_EXTS = ['m4a', 'webm', 'opus', 'ogg', 'mp3', 'mp4', 'mka', 'mkv', 'wav', 'aac'];
const SB_EXCHANGE_MAX_BUNDLE_BYTES = 25 * 1024 * 1024;
const SB_ALLOWED_IMPORT_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/opus', 'audio/webm', 'audio/wav'];

function sbKnownCharacters() {
    return ['blingus', 'vadania', 'bruck', 'puck', 'galen'];
}

function sbJson($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sbRun(array $cmd, &$output = null, &$exitCode = null) {
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $process = proc_open($cmd, $descriptors, $pipes);
    if (!is_resource($process)) {
        $output = '';
        $exitCode = 1;
        return false;
    }
    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $exitCode = proc_close($process);
    $output = $stdout . $stderr;
    return $exitCode === 0;
}

function sbBin($envName, $fallback) {
    $env = getenv($envName);
    return (is_string($env) && $env !== '') ? $env : $fallback;
}

function sbYtdlpBin() {
    return sbBin('YTDLP_PATH', 'yt-dlp');
}

function sbFfmpegBin() {
    return sbBin('FFMPEG_PATH', 'ffmpeg');
}

function sbFfprobeBin() {
    $env = getenv('FFPROBE_PATH');
    if (is_string($env) && $env !== '') {
        return $env;
    }
    $ffmpeg = sbFfmpegBin();
    if (substr($ffmpeg, -6) === 'ffmpeg') {
        $sibling = substr($ffmpeg, 0, -6) . 'ffprobe';
        if ($sibling !== 'ffprobe' && is_file($sibling)) {
            return $sibling;
        }
    }
    return 'ffprobe';
}

function sbCommandWorks($bin) {
    $base = strtolower(basename($bin));
    $flag = (strpos($base, 'yt-dlp') !== false) ? '--version' : '-version';
    $out = '';
    $code = 1;
    sbRun([$bin, $flag], $out, $code);
    return $code === 0;
}

function sbCommandOnPath($name) {
    $out = '';
    $code = 1;
    sbRun(['/bin/sh', '-c', 'command -v ' . escapeshellarg($name)], $out, $code);
    $path = trim($out);
    return ($code === 0 && $path !== '') ? $path : null;
}

function sbJsRuntimeArgs() {
    $env = getenv('YTDLP_JS_RUNTIME');
    if (is_string($env) && $env !== '') {
        return ['--js-runtimes', $env];
    }
    $deno = sbCommandOnPath('deno');
    if ($deno) {
        return ['--js-runtimes', 'deno:' . $deno];
    }
    $node = sbCommandOnPath('node') ?: sbCommandOnPath('nodejs');
    if ($node) {
        return ['--no-js-runtimes', '--js-runtimes', 'node:' . $node];
    }
    return [];
}

function sbYtdlpCacheDir() {
    $base = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
    $dir = $base . '/data/.yt-dlp-cache';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new Exception('Could not create soundboard storage.');
    }
    return $dir;
}

function sbYtdlpBaseArgs() {
    return array_merge(
        [sbYtdlpBin()],
        sbJsRuntimeArgs(),
        ['--cache-dir', sbYtdlpCacheDir()]
    );
}

function sbYtdlpErrorHint($output) {
    if (stripos($output, 'max-filesize') !== false) {
        return 'That video\'s audio is too large to pull.';
    }
    if (stripos($output, 'not a bot') !== false || stripos($output, 'cookies-from-browser') !== false) {
        return 'YouTube blocked the pull and asked for a sign-in. Pass cookies to yt-dlp on the server, the same way karaoke downloads do.';
    }
    if (stripos($output, 'HTTP Error 403') !== false || stripos($output, '403: Forbidden') !== false) {
        return 'YouTube blocked the download (403). The server needs a JS runtime such as deno for yt-dlp.';
    }
    if (preg_match('/^ERROR:\s*(.+)$/m', $output, $m)) {
        $msg = trim($m[1]);
        if (strlen($msg) > 180) {
            $msg = substr($msg, 0, 177) . '...';
        }
        return 'Download failed: ' . $msg;
    }
    return 'Download failed. The video may be restricted or unavailable.';
}

function sbRequireCharacter($id) {
    $id = strtolower(trim((string)$id));
    if (!in_array($id, sbKnownCharacters(), true)) {
        throw new Exception('Unknown character.');
    }
    return $id;
}

function sbRequireVideoId($id) {
    if (!is_string($id) || !preg_match('/^[a-zA-Z0-9_-]{11}$/', $id)) {
        throw new Exception('Invalid video.');
    }
    return $id;
}

function sbRequireClipId($id) {
    if (!is_string($id) || !preg_match('/^[a-f0-9]{12}$/', $id)) {
        throw new Exception('Invalid clip.');
    }
    return $id;
}

function sbRequireSeconds($value, $name) {
    if (is_string($value)) {
        $value = trim($value);
    }
    if (!is_int($value) && !is_float($value) && !(is_string($value) && is_numeric($value))) {
        throw new Exception($name . ' must be a number of seconds.');
    }
    $n = (float)$value;
    if (!is_finite($n)) {
        throw new Exception($name . ' must be a number of seconds.');
    }
    return $n;
}

function sbCleanText($text, $max, $fallback) {
    $text = (string)$text;
    $collapsed = preg_replace('/\s+/u', ' ', $text);
    if (is_string($collapsed)) {
        $text = $collapsed;
    }
    $stripped = preg_replace('/[\x00-\x1F\x7F]/u', '', $text);
    if (is_string($stripped)) {
        $text = $stripped;
    }
    $text = trim($text);
    if (preg_match('/^.{0,' . (int)$max . '}/us', $text, $m)) {
        $text = trim($m[0]);
    }
    return $text === '' ? $fallback : $text;
}

function sbCleanLabel($label) {
    return sbCleanText($label, 40, 'Clip');
}

function sbCleanIcon($icon) {
    $icon = sbCleanText($icon, 8, '🔊');
    return $icon;
}

function sbSoundboardRoot() {
    $override = getenv('SOUNDBOARD_DIR');
    if (is_string($override) && $override !== '') {
        $dir = rtrim($override, '/') . '/';
    } else {
        $base = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
        $dir = $base . '/data/soundboard/';
    }
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new Exception('Could not create soundboard storage.');
    }
    return $dir;
}

function sbEnsureDir($dir) {
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new Exception('Could not create soundboard storage.');
    }
    $real = realpath($dir);
    $root = realpath(sbSoundboardRoot());
    if ($real === false || $root === false || strpos($real . '/', $root . '/') !== 0) {
        throw new Exception('Could not open soundboard storage.');
    }
    return $real . '/';
}

function sbCacheDir() {
    return sbEnsureDir(sbSoundboardRoot() . '_cache/');
}

function sbCharacterDir($character) {
    $character = sbRequireCharacter($character);
    return sbEnsureDir(sbSoundboardRoot() . $character . '/');
}

function sbWithLock($lockPath, $callback) {
    $fh = fopen($lockPath, 'c');
    if (!$fh) {
        throw new Exception('Could not lock soundboard data.');
    }
    try {
        if (!flock($fh, LOCK_EX)) {
            throw new Exception('Could not lock soundboard data.');
        }
        return $callback();
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
    }
}

function sbFindCachedAudio($videoId) {
    $videoId = sbRequireVideoId($videoId);
    $dir = sbCacheDir();
    foreach (SB_AUDIO_EXTS as $ext) {
        $path = $dir . $videoId . '.' . $ext;
        if (is_file($path)) {
            return $path;
        }
    }
    return null;
}

function sbClipFile($character, $id) {
    $dir = sbCharacterDir($character);
    foreach (['mp3', 'm4a'] as $ext) {
        $path = $dir . $id . '.' . $ext;
        if (is_file($path)) {
            return $path;
        }
    }
    return null;
}

function sbMediaDuration($path) {
    $out = '';
    $code = 1;
    $ok = sbRun([
        sbFfprobeBin(),
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        $path,
    ], $out, $code);
    if (!$ok) {
        return null;
    }
    $n = (float)trim($out);
    if (!is_finite($n) || $n <= 0) {
        return null;
    }
    return $n;
}

function sbReadClipsFile($path) {
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['clips']) || !is_array($data['clips'])) {
        throw new Exception('Clip list is unreadable.');
    }
    $clips = [];
    foreach ($data['clips'] as $clip) {
        if (!is_array($clip)) {
            continue;
        }
        $id = $clip['id'] ?? '';
        if (!is_string($id) || !preg_match('/^[a-f0-9]{12}$/', $id)) {
            continue;
        }
        $clips[] = $clip;
    }
    return $clips;
}

function sbPublicClip($clip) {
    $videoId = (string)($clip['videoId'] ?? '');
    if ($videoId !== '') {
        $videoId = sbRequireVideoId($videoId);
    }
    $source = (string)($clip['source'] ?? '');
    if ($source !== 'elevenlabs' && $source !== 'speech') {
        $source = 'youtube';
    }
    $result = [
        'id' => $clip['id'],
        'label' => sbCleanLabel($clip['label'] ?? ''),
        'icon' => sbCleanIcon($clip['icon'] ?? ''),
        'loop' => !empty($clip['loop']),
        'videoId' => $videoId,
        'start' => round((float)($clip['start'] ?? 0), 3),
        'end' => round((float)($clip['end'] ?? 0), 3),
        'title' => sbCleanText($clip['title'] ?? '', 140, ''),
        'source' => $source,
    ];
    if (isset($clip['category']) && is_string($clip['category'])) {
        $result['category'] = sbCleanText($clip['category'], 50, '');
    }
    if (isset($clip['voiceId']) && is_string($clip['voiceId'])) {
        $result['voiceId'] = $clip['voiceId'];
    }
    return $result;
}

function sbSfxKey() {
    $value = getenv('ELEVENLABS_SFX_KEY') ?: '';
    if ($value !== '') {
        return trim($value);
    }
    $candidates = [
        '/etc/blingus/elevenlabs_sfx_key',
        '/etc/blingus/.elevenlabs_sfx_key',
        __DIR__ . '/.elevenlabs_sfx_key',
    ];
    foreach ($candidates as $candidate) {
        if (is_readable($candidate)) {
            return trim((string) file_get_contents($candidate));
        }
    }
    return '';
}

function sbUpstreamMessage($raw, $httpCode) {
    $decoded = json_decode((string) $raw, true);
    $detail = is_array($decoded) ? ($decoded['detail'] ?? null) : null;
    if (is_array($detail) && !empty($detail['message'])) {
        return (string) $detail['message'];
    }
    if (is_string($detail) && $detail !== '') {
        return $detail;
    }
    return 'Sound effect failed (HTTP ' . (int) $httpCode . ')';
}

function sbGenerateSound($text, $duration) {
    $key = sbSfxKey();
    if ($key === '') {
        throw new Exception('Sound effects key is not configured on this server.');
    }
    $body = [
        'text' => $text,
        'model_id' => 'eleven_text_to_sound_v3',
    ];
    if ($duration !== null) {
        $body['duration_seconds'] = $duration;
    }
    $payload = json_encode($body);
    if ($payload === false) {
        throw new Exception('Could not build the sound effect request.');
    }
    $url = 'https://api.elevenlabs.io/v1/sound-generation';
    $headers = [
        'Content-Type: application/json',
        'Accept: audio/mpeg',
        'xi-api-key: ' . $key,
    ];
    $httpCode = 0;
    $audio = false;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 90,
        ]);
        $audio = curl_exec($ch);
        $curlErr = curl_error($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($audio === false) {
            throw new Exception('Sound effect request failed: ' . $curlErr);
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $payload,
                'timeout' => 90,
                'ignore_errors' => true,
            ],
        ]);
        $audio = @file_get_contents($url, false, $context);
        if ($audio === false) {
            throw new Exception('Sound effect request failed. Check outbound HTTPS.');
        }
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $httpCode = (int) $m[1];
        }
    }
    $looksAudio = is_string($audio)
        && strlen($audio) >= 400
        && (strncmp($audio, 'ID3', 3) === 0 || ord($audio[0]) === 0xFF);
    if ($httpCode < 200 || $httpCode >= 300 || !$looksAudio) {
        throw new Exception(sbUpstreamMessage($audio, $httpCode));
    }
    return $audio;
}

function sbUpdateClips($character, $mutator) {
    $dir = sbCharacterDir($character);
    $path = $dir . 'clips.json';
    return sbWithLock($dir . 'clips.lock', function () use ($path, $mutator) {
        $clips = $mutator(sbReadClipsFile($path));
        $json = json_encode(
            ['clips' => array_values($clips)],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        );
        if ($json === false) {
            throw new Exception('Could not store the clip.');
        }
        $tmp = $path . '.tmp';
        if (file_put_contents($tmp, $json) === false) {
            throw new Exception('Could not store the clip.');
        }
        if (!rename($tmp, $path)) {
            @unlink($tmp);
            throw new Exception('Could not store the clip.');
        }
        return $clips;
    });
}

function sbReadCategoriesFile($path) {
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sbWriteCategoriesFile($path, array $categories) {
    $tmp = $path . '.tmp';
    if (file_put_contents($tmp, json_encode($categories, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        throw new Exception('Could not write categories file');
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new Exception('Could not finalize categories file');
    }
}

function sbListClips($character) {
    $character = sbRequireCharacter($character);
    $dir = sbCharacterDir($character);
    $clips = sbReadClipsFile($dir . 'clips.json');
    $public = [];
    foreach ($clips as $clip) {
        try {
            $public[] = sbPublicClip($clip);
        } catch (Exception $e) {
            continue;
        }
    }
    return $public;
}

function sbListWithCategories($character) {
    $character = sbRequireCharacter($character);
    $dir = sbCharacterDir($character);
    $clips = sbListClips($character);
    $categories = sbReadCategoriesFile($dir . 'categories.json');
    return [
        'clips' => $clips,
        'categories' => $categories,
    ];
}

function sbSaveCategories(array $request) {
    $character = sbRequireCharacter($request['character'] ?? '');
    $categories = $request['categories'] ?? null;
    
    if (!is_array($categories)) {
        throw new Exception('Categories must be an array');
    }
    
    $clean = [];
    foreach ($categories as $cat) {
        if (!is_array($cat)) {
            continue;
        }
        $name = sbCleanText($cat['name'] ?? '', 50, '');
        if ($name === '') {
            continue;
        }
        $clean[] = [
            'id' => isset($cat['id']) && preg_match('/^[a-f0-9]{8}$/', $cat['id']) 
                ? $cat['id'] 
                : bin2hex(random_bytes(4)),
            'name' => $name,
            'order' => (int)($cat['order'] ?? 0),
        ];
    }
    
    usort($clean, function ($a, $b) {
        return $a['order'] - $b['order'];
    });
    
    $dir = sbCharacterDir($character);
    sbWriteCategoriesFile($dir . 'categories.json', $clean);
    
    return $clean;
}

function sbUpdateClipCategory(array $request) {
    $character = sbRequireCharacter($request['character'] ?? '');
    $clipId = sbRequireClipId($request['id'] ?? '');
    $category = is_string($request['category'] ?? null) 
        ? sbCleanText($request['category'], 50, '') 
        : null;
    
    sbUpdateClips($character, function ($clips) use ($clipId, $category) {
        foreach ($clips as $i => $clip) {
            if (($clip['id'] ?? '') === $clipId) {
                if ($category === null || $category === '') {
                    unset($clips[$i]['category']);
                } else {
                    $clips[$i]['category'] = $category;
                }
                break;
            }
        }
        return $clips;
    });
    
    return ['updated' => true];
}

function sbTrimAudio($source, $start, $end, $dest) {
    $cmd = [
        sbFfmpegBin(),
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-i', $source,
        '-ss', sprintf('%.3F', $start),
        '-to', sprintf('%.3F', $end),
        '-vn',
        '-ac', '2',
        '-ar', '44100',
        '-c:a', 'libmp3lame',
        '-q:a', '5',
        $dest,
    ];
    $out = '';
    $code = 1;
    if (!sbRun($cmd, $out, $code)) {
        error_log('Soundboard trim failed: ' . substr($out, 0, 800));
        throw new Exception('Could not trim that clip.');
    }
}

function sbSaveClip(array $input) {
    $character = sbRequireCharacter($input['character'] ?? '');
    $videoId = sbRequireVideoId($input['videoId'] ?? '');
    $start = sbRequireSeconds($input['start'] ?? null, 'Start');
    $end = sbRequireSeconds($input['end'] ?? null, 'End');
    $label = sbCleanLabel($input['label'] ?? '');
    $icon = sbCleanIcon($input['icon'] ?? '');
    $loop = !empty($input['loop']);
    $title = sbCleanText($input['title'] ?? '', 140, '');

    $source = sbFindCachedAudio($videoId);
    if (!$source) {
        throw new Exception('Pull the audio before trimming it.');
    }
    if (!sbCommandWorks(sbFfmpegBin()) || !sbCommandWorks(sbFfprobeBin())) {
        throw new Exception('ffmpeg and ffprobe are required to trim clips.');
    }

    $duration = sbMediaDuration($source);
    if ($duration === null) {
        throw new Exception('Could not read that audio.');
    }
    if ($duration > SB_MAX_SOURCE_SECONDS) {
        @unlink($source);
        throw new Exception('That video is longer than 3 hours.');
    }
    if ($start < 0 || $end <= $start) {
        throw new Exception('Trim range is invalid.');
    }
    if ($start >= $duration) {
        throw new Exception('The trim starts after the audio ends.');
    }
    if ($end > $duration + 0.05) {
        throw new Exception('The trim ends after the audio ends.');
    }
    if ($end > $duration) {
        $end = $duration;
    }
    $length = $end - $start;
    if ($length < SB_MIN_CLIP_SECONDS) {
        throw new Exception('Clip must be at least 0.3 seconds.');
    }
    if ($length > SB_MAX_CLIP_SECONDS + 0.001) {
        throw new Exception('Clip must be 45 seconds or shorter.');
    }

    $dir = sbCharacterDir($character);
    $existing = sbReadClipsFile($dir . 'clips.json');
    if (count($existing) >= SB_MAX_CLIPS) {
        throw new Exception('This character already has 40 clips. Remove one first.');
    }

    $id = bin2hex(random_bytes(6));
    $tmp = $dir . '.tmp-' . $id . '.mp3';
    $final = $dir . $id . '.mp3';
    $stored = false;
    try {
        sbTrimAudio($source, $start, $end, $tmp);
        if (!is_file($tmp) || filesize($tmp) < 400) {
            throw new Exception('Could not trim that clip.');
        }
        if (!rename($tmp, $final)) {
            throw new Exception('Could not store the clip.');
        }
        $record = [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'loop' => $loop,
            'videoId' => $videoId,
            'start' => round($start, 3),
            'end' => round($end, 3),
            'title' => $title,
            'createdAt' => gmdate('c'),
        ];
        sbUpdateClips($character, function ($clips) use ($record) {
            if (count($clips) >= SB_MAX_CLIPS) {
                throw new Exception('This character already has 40 clips. Remove one first.');
            }
            $clips[] = $record;
            return $clips;
        });
        $stored = true;
        return sbPublicClip($record);
    } finally {
        if (is_file($tmp)) {
            @unlink($tmp);
        }
        if (!$stored && is_file($final)) {
            @unlink($final);
        }
    }
}

function sbSaveEffect(array $input) {
    $character = sbRequireCharacter($input['character'] ?? '');
    $text = sbCleanText($input['text'] ?? '', 500, '');
    if ($text === '') {
        throw new Exception('Describe the sound effect.');
    }
    $duration = null;
    if (array_key_exists('duration', $input) && $input['duration'] !== '' && $input['duration'] !== null) {
        $duration = sbRequireSeconds($input['duration'], 'Length');
        if ($duration < 0.5 || $duration > 30) {
            throw new Exception('Length must be between 0.5 and 30 seconds.');
        }
        $duration = round($duration, 1);
    }
    $rawLabel = trim((string)($input['label'] ?? ''));
    $label = $rawLabel === '' ? sbCleanLabel($text) : sbCleanLabel($rawLabel);
    $icon = sbCleanIcon($input['icon'] ?? '');
    $loop = !empty($input['loop']);
    $title = sbCleanText($text, 140, '');

    $dir = sbCharacterDir($character);
    $existing = sbReadClipsFile($dir . 'clips.json');
    if (count($existing) >= SB_MAX_CLIPS) {
        throw new Exception('This character already has 40 clips. Remove one first.');
    }

    $audio = sbGenerateSound($text, $duration);
    $id = bin2hex(random_bytes(6));
    $tmp = $dir . '.tmp-' . $id . '.mp3';
    $final = $dir . $id . '.mp3';
    $stored = false;
    try {
        if (file_put_contents($tmp, $audio) === false) {
            throw new Exception('Could not store the clip.');
        }
        if (!rename($tmp, $final)) {
            throw new Exception('Could not store the clip.');
        }
        $record = [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'loop' => $loop,
            'videoId' => '',
            'start' => 0,
            'end' => $duration === null ? 0 : $duration,
            'title' => $title,
            'source' => 'elevenlabs',
            'createdAt' => gmdate('c'),
        ];
        sbUpdateClips($character, function ($clips) use ($record) {
            if (count($clips) >= SB_MAX_CLIPS) {
                throw new Exception('This character already has 40 clips. Remove one first.');
            }
            $clips[] = $record;
            return $clips;
        });
        $stored = true;
        return sbPublicClip($record);
    } finally {
        if (is_file($tmp)) {
            @unlink($tmp);
        }
        if (!$stored && is_file($final)) {
            @unlink($final);
        }
    }
}

function sbLoadKeyFile($envName, array $candidates) {
    $value = getenv($envName) ?: '';
    if ($value !== '') {
        return trim($value);
    }
    foreach ($candidates as $candidate) {
        if (is_readable($candidate)) {
            return trim((string) file_get_contents($candidate));
        }
    }
    return '';
}

function sbTtsKey() {
    return sbLoadKeyFile('ELEVENLABS_API_KEY', [
        '/etc/blingus/elevenlabs_key',
        '/etc/blingus/.elevenlabs_key',
        __DIR__ . '/.elevenlabs_key',
    ]);
}

function sbCleanServerVoice($raw) {
    $raw = trim((string) $raw);
    $raw = preg_replace('/^["\']|["\']$/', '', $raw);
    $raw = trim($raw);
    if (preg_match('/[?&]voiceId=([A-Za-z0-9]{8,40})/', $raw, $m)) {
        return $m[1];
    }
    if (preg_match('/\/voice\/([A-Za-z0-9]{8,40})/', $raw, $m)) {
        return $m[1];
    }
    if (preg_match('/^[A-Za-z0-9]{8,40}$/', $raw)) {
        return $raw;
    }
    return '';
}

function sbCharacterVoice($character) {
    $voices = [
        'blingus' => 'NJf2N7XT2iBE8xJ0XHlo',
    ];
    if (!empty($voices[$character])) {
        return $voices[$character];
    }
    $override = sbCleanServerVoice(sbLoadKeyFile('ELEVENLABS_VOICE_ID', [
        '/etc/blingus/elevenlabs_voice',
        '/etc/blingus/.elevenlabs_voice',
        __DIR__ . '/.elevenlabs_voice',
    ]));
    return $override !== '' ? $override : 'JBFqnCBsd6RMkjVDRZzb';
}

function sbGenerateSpeech($text, $voice) {
    $key = sbTtsKey();
    if ($key === '') {
        throw new Exception('Speech key is not configured on this server.');
    }
    if (!preg_match('/^[A-Za-z0-9]{8,40}$/', $voice)) {
        throw new Exception('No voice is set for that character.');
    }
    $payload = json_encode([
        'text' => $text,
        'model_id' => 'eleven_multilingual_v2',
    ]);
    if ($payload === false) {
        throw new Exception('Could not build the speech request.');
    }
    $url = 'https://api.elevenlabs.io/v1/text-to-speech/' . rawurlencode($voice);
    $headers = [
        'Content-Type: application/json',
        'Accept: audio/mpeg',
        'xi-api-key: ' . $key,
    ];
    $httpCode = 0;
    $audio = false;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 90,
        ]);
        $audio = curl_exec($ch);
        $curlErr = curl_error($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($audio === false) {
            throw new Exception('Speech request failed: ' . $curlErr);
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $payload,
                'timeout' => 90,
                'ignore_errors' => true,
            ],
        ]);
        $audio = @file_get_contents($url, false, $context);
        if ($audio === false) {
            throw new Exception('Speech request failed. Check outbound HTTPS.');
        }
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $httpCode = (int) $m[1];
        }
    }
    $looksAudio = is_string($audio)
        && strlen($audio) >= 400
        && (strncmp($audio, 'ID3', 3) === 0 || ord($audio[0]) === 0xFF);
    if ($httpCode < 200 || $httpCode >= 300 || !$looksAudio) {
        throw new Exception(sbUpstreamMessage($audio, $httpCode));
    }
    return $audio;
}

function sbSaveSpeech(array $input) {
    $character = sbRequireCharacter($input['character'] ?? '');
    $text = sbCleanText($input['text'] ?? '', 500, '');
    if ($text === '') {
        throw new Exception('Write the line to speak.');
    }
    $rawLabel = trim((string)($input['label'] ?? ''));
    $label = $rawLabel === '' ? sbCleanLabel($text) : sbCleanLabel($rawLabel);
    $icon = sbCleanIcon($input['icon'] ?? '🗣️');
    $loop = !empty($input['loop']);
    $title = sbCleanText($text, 140, '');
    $voiceId = isset($input['voiceId']) ? sbCleanServerVoice($input['voiceId']) : '';

    $dir = sbCharacterDir($character);
    $existing = sbReadClipsFile($dir . 'clips.json');
    
    $providedId = isset($input['id']) && is_string($input['id']) ? trim($input['id']) : '';
    $existingClip = null;
    $updateExisting = false;
    
    if ($providedId !== '' && preg_match('/^[a-f0-9]{12}$/', $providedId)) {
        foreach ($existing as $clip) {
            if (($clip['id'] ?? '') === $providedId && ($clip['source'] ?? '') === 'speech') {
                $audioPath = $dir . $providedId . '.mp3';
                if (!is_file($audioPath)) {
                    $existingClip = $clip;
                    $updateExisting = true;
                    break;
                }
            }
        }
    }
    
    if (!$updateExisting && count($existing) >= SB_MAX_CLIPS) {
        throw new Exception('This character already has 40 clips. Remove one first.');
    }

    $defaultVoice = sbCharacterVoice($character);
    $effectiveVoice = $voiceId !== '' ? $voiceId : $defaultVoice;
    $audio = sbGenerateSpeech($text, $effectiveVoice);
    
    $id = $updateExisting ? $providedId : bin2hex(random_bytes(6));
    $tmp = $dir . '.tmp-' . $id . '.mp3';
    $final = $dir . $id . '.mp3';
    $stored = false;
    try {
        if (file_put_contents($tmp, $audio) === false) {
            throw new Exception('Could not store the clip.');
        }
        if (!rename($tmp, $final)) {
            throw new Exception('Could not store the clip.');
        }
        
        if ($updateExisting) {
            if (isset($existingClip['voiceId'])) {
                $existingClip['voiceId'] = $voiceId !== '' ? $voiceId : $existingClip['voiceId'];
            } else if ($voiceId !== '') {
                $existingClip['voiceId'] = $voiceId;
            }
            $stored = true;
            return sbPublicClip($existingClip);
        }
        
        $record = [
            'id' => $id,
            'label' => $label,
            'icon' => $icon,
            'loop' => $loop,
            'videoId' => '',
            'start' => 0,
            'end' => 0,
            'title' => $title,
            'source' => 'speech',
            'createdAt' => gmdate('c'),
        ];
        
        if ($voiceId !== '') {
            $record['voiceId'] = $voiceId;
        }
        
        sbUpdateClips($character, function ($clips) use ($record) {
            if (count($clips) >= SB_MAX_CLIPS) {
                throw new Exception('This character already has 40 clips. Remove one first.');
            }
            $clips[] = $record;
            return $clips;
        });
        $stored = true;
        return sbPublicClip($record);
    } finally {
        if (is_file($tmp)) {
            @unlink($tmp);
        }
        if (!$stored && is_file($final)) {
            @unlink($final);
        }
    }
}

function sbDeleteClip($character, $id) {
    $character = sbRequireCharacter($character);
    $id = sbRequireClipId($id);
    $dir = sbCharacterDir($character);
    $found = false;
    sbUpdateClips($character, function ($clips) use ($id, &$found) {
        $next = [];
        foreach ($clips as $clip) {
            if (($clip['id'] ?? '') === $id) {
                $found = true;
                continue;
            }
            $next[] = $clip;
        }
        return $next;
    });
    if (!$found) {
        throw new Exception('Clip not found.');
    }
    foreach (['mp3', 'm4a'] as $ext) {
        $file = $dir . $id . '.' . $ext;
        if (is_file($file)) {
            @unlink($file);
        }
    }
    return true;
}

function sbParseSearchResults($output) {
    $results = [];
    foreach (preg_split('/\r?\n/', trim($output)) as $line) {
        if ($line === '' || count($results) >= 8) {
            continue;
        }
        $row = json_decode($line, true);
        if (!is_array($row) || empty($row['id']) || !is_string($row['id'])) {
            continue;
        }
        if (!preg_match('/^[a-zA-Z0-9_-]{11}$/', $row['id'])) {
            continue;
        }
        $results[] = [
            'id' => $row['id'],
            'title' => sbCleanText($row['title'] ?? '', 140, 'Untitled'),
            'channel' => sbCleanText($row['channel'] ?? ($row['uploader'] ?? ''), 80, ''),
            'duration' => isset($row['duration']) && is_numeric($row['duration']) ? (int)$row['duration'] : null,
        ];
    }
    return $results;
}

function sbSearchYoutube($query) {
    $query = sbCleanText($query, 200, '');
    if ($query === '') {
        throw new Exception('Search query required.');
    }
    if (!sbCommandWorks(sbYtdlpBin())) {
        throw new Exception('yt-dlp is not installed or not in PATH.');
    }
    $cmd = array_merge(sbYtdlpBaseArgs(), [
        '--flat-playlist',
        '--dump-json',
        '--no-warnings',
        'ytsearch8:' . $query,
    ]);
    set_time_limit(90);
    $output = '';
    $code = 1;
    if (!sbRun($cmd, $output, $code)) {
        error_log('Soundboard search failed: ' . substr($output, 0, 800));
        throw new Exception('YouTube search failed.');
    }
    return sbParseSearchResults($output);
}

function sbPrepareAudio($videoId) {
    $videoId = sbRequireVideoId($videoId);
    if (!sbCommandWorks(sbFfprobeBin())) {
        throw new Exception('ffprobe is required to read pulled audio.');
    }
    $dir = sbCacheDir();
    return sbWithLock($dir . $videoId . '.lock', function () use ($videoId, $dir) {
        $existing = sbFindCachedAudio($videoId);
        if ($existing) {
            return sbDescribePulledAudio($videoId, $existing, true);
        }
        if (!sbCommandWorks(sbYtdlpBin())) {
            throw new Exception('yt-dlp is not installed or not in PATH.');
        }
        foreach (glob($dir . $videoId . '.*') ?: [] as $junk) {
            $ext = strtolower(pathinfo($junk, PATHINFO_EXTENSION));
            if ($ext === 'part' || $ext === 'ytdl') {
                @unlink($junk);
            }
        }
        $cmd = array_merge(sbYtdlpBaseArgs(), [
            '--no-playlist',
            '--no-warnings',
            '--no-progress',
            '-f', 'ba[ext=m4a]/ba[ext=webm]/ba/b',
            '--max-filesize', '150M',
            '-o', $dir . $videoId . '.%(ext)s',
            'https://www.youtube.com/watch?v=' . $videoId,
        ]);
        set_time_limit(900);
        $output = '';
        $code = 1;
        if (!sbRun($cmd, $output, $code)) {
            foreach (glob($dir . $videoId . '.*') ?: [] as $junk) {
                $ext = strtolower(pathinfo($junk, PATHINFO_EXTENSION));
                if ($ext === 'part' || $ext === 'ytdl') {
                    @unlink($junk);
                }
            }
            error_log('Soundboard prepare failed: ' . substr($output, 0, 800));
            throw new Exception(sbYtdlpErrorHint($output));
        }
        $path = sbFindCachedAudio($videoId);
        if (!$path) {
            throw new Exception('Download finished but the audio file was not found.');
        }
        return sbDescribePulledAudio($videoId, $path, false);
    });
}

function sbDescribePulledAudio($videoId, $path, $cached) {
    $duration = sbMediaDuration($path);
    if ($duration === null) {
        throw new Exception('Could not read the pulled audio.');
    }
    if ($duration > SB_MAX_SOURCE_SECONDS) {
        @unlink($path);
        throw new Exception('That video is longer than 3 hours.');
    }
    return [
        'videoId' => $videoId,
        'duration' => round($duration, 3),
        'cached' => $cached,
    ];
}

function sbMediaMime($path) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    switch ($ext) {
        case 'mp3':
            return 'audio/mpeg';
        case 'm4a':
        case 'mp4':
        case 'aac':
            return 'audio/mp4';
        case 'ogg':
        case 'opus':
            return 'audio/ogg';
        case 'webm':
            return 'audio/webm';
        case 'wav':
            return 'audio/wav';
        default:
            return 'application/octet-stream';
    }
}

function sbStreamMediaFile($filePath) {
    if (!is_file($filePath) || !is_readable($filePath)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Audio not found.']);
        exit;
    }

    $size = filesize($filePath);
    header('Content-Type: ' . sbMediaMime($filePath));
    header('Accept-Ranges: bytes');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: private, max-age=86400');

    $start = 0;
    $end = $size - 1;
    $isRange = false;
    if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches)) {
        $isRange = true;
        if ($matches[1] !== '') {
            $start = (int)$matches[1];
        }
        if ($matches[2] !== '') {
            $end = (int)$matches[2];
        }
        if ($end >= $size) {
            $end = $size - 1;
        }
        if ($start > $end || $start < 0) {
            http_response_code(416);
            header("Content-Range: bytes */$size");
            exit;
        }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
    }

    $length = $end - $start + 1;
    header('Content-Length: ' . $length);

    $fp = fopen($filePath, 'rb');
    if (!$fp) {
        http_response_code(404);
        exit;
    }
    fseek($fp, $start);
    $bytesLeft = $length;
    while ($bytesLeft > 0 && !feof($fp)) {
        $read = ($bytesLeft > 8192) ? 8192 : $bytesLeft;
        echo fread($fp, $read);
        $bytesLeft -= $read;
        if (connection_status() !== CONNECTION_NORMAL) {
            break;
        }
    }
    fclose($fp);
    exit;
}

function sbAuthCheck($requireAuth, $API_KEY) {
    if (!$requireAuth) {
        return;
    }
    $providedKey = $_GET['key'] ?? $_POST['key'] ?? '';
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $providedKey = $matches[1];
    }
    if ($providedKey === '' || !hash_equals($API_KEY, $providedKey)) {
        sbJson(['success' => false, 'error' => 'Unauthorized'], 401);
    }
}

function sbExchangeDir() {
    $override = getenv('SOUNDBOARD_EXCHANGE_DIR');
    return is_string($override) && $override !== '' ? rtrim($override, '/') : '/var/lib/knospe-soundboard-exchange';
}

function sbExchangeEnabled() {
    $dir = sbExchangeDir();
    return is_dir($dir) && is_writable($dir);
}

function sbInboxDir($app) {
    if (!preg_match('/^[a-z]{3,20}$/', $app)) {
        throw new Exception('Invalid app name');
    }
    $base = sbExchangeDir();
    $dir = $base . '/inbox/' . $app;
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $dir;
}

function sbExportClips(array $request) {
    $character = sbRequireCharacter($request['character'] ?? '');
    $clipIds = $request['clipIds'] ?? [];
    if (!is_array($clipIds) || empty($clipIds)) {
        throw new Exception('No clips selected for export');
    }
    
    $dir = sbCharacterDir($character);
    $allClips = sbReadClipsFile($dir . 'clips.json');
    $clipsById = [];
    foreach ($allClips as $clip) {
        if (isset($clip['id'])) {
            $clipsById[$clip['id']] = $clip;
        }
    }
    
    $exported = [];
    foreach ($clipIds as $clipId) {
        $clipId = sbRequireClipId($clipId);
        if (!isset($clipsById[$clipId])) {
            continue;
        }
        $clip = $clipsById[$clipId];
        $source = (string)($clip['source'] ?? '');
        if ($source !== 'elevenlabs' && $source !== 'speech') {
            $source = 'youtube';
        }
        
        $tags = ['icon' => (string)($clip['icon'] ?? '🔊'), 'loop' => !empty($clip['loop'])];
        if (isset($clip['category']) && is_string($clip['category'])) {
            $tags['category'] = sbCleanText($clip['category'], 50, '');
        }
        
        $entry = [
            'type' => $source,
            'kind' => ($source === 'speech' || $source === 'elevenlabs') ? 'speech' : 'audio',
            'name' => (string)($clip['label'] ?? ''),
            'displayName' => null,
            'text' => null,
            'voiceId' => isset($clip['voiceId']) ? (string)$clip['voiceId'] : null,
            'tags' => $tags,
            'mime' => null,
            'audioBase64' => null,
            'sourceId' => $clipId,
        ];
        
        if ($entry['kind'] === 'speech') {
            $entry['text'] = (string)($clip['title'] ?? '');
        }
        
        $audioPath = sbClipFile($character, $clipId);
        if ($audioPath && is_file($audioPath)) {
            $audioData = file_get_contents($audioPath);
            if ($audioData !== false) {
                $entry['audioBase64'] = base64_encode($audioData);
                $entry['mime'] = sbMediaMime($audioPath);
            }
        }
        
        $exported[] = $entry;
    }
    
    return [
        'format' => 'knospe-soundboard-clips',
        'version' => 1,
        'sourceApp' => 'blingus',
        'exportedAt' => gmdate('c'),
        'clips' => $exported,
    ];
}

function sbImportBundle(array $request) {
    $character = sbRequireCharacter($request['character'] ?? '');
    $bundle = $request['bundle'] ?? null;
    
    if (!is_array($bundle)) {
        throw new Exception('Invalid bundle format');
    }
    
    if (($bundle['format'] ?? '') !== 'knospe-soundboard-clips') {
        throw new Exception('Unknown bundle format');
    }
    
    if (($bundle['version'] ?? 0) !== 1) {
        throw new Exception('Unsupported bundle version');
    }
    
    $clips = $bundle['clips'] ?? [];
    if (!is_array($clips)) {
        throw new Exception('Bundle contains no clips');
    }
    
    $dir = sbCharacterDir($character);
    $existing = sbReadClipsFile($dir . 'clips.json');
    $existingIds = [];
    foreach ($existing as $clip) {
        $sourceKey = ($bundle['sourceApp'] ?? 'unknown') . ':' . ($clip['sourceId'] ?? '');
        $existingIds[$sourceKey] = true;
    }
    
    $imported = [];
    $errors = [];
    
    foreach ($clips as $clipIndex => $clipData) {
        try {
            if (!is_array($clipData)) {
                $errors[] = "Clip $clipIndex: not an array";
                continue;
            }
            
            $sourceId = (string)($clipData['sourceId'] ?? '');
            $sourceApp = (string)($bundle['sourceApp'] ?? 'unknown');
            $sourceKey = $sourceApp . ':' . $sourceId;
            
            if (isset($existingIds[$sourceKey])) {
                continue;
            }
            
            if (count($existing) + count($imported) >= SB_MAX_CLIPS) {
                break;
            }
            
            $kind = (string)($clipData['kind'] ?? 'audio');
            $name = sbCleanText($clipData['name'] ?? '', 40, 'Imported Clip');
            $text = $clipData['text'] ?? null;
            $voiceId = $clipData['voiceId'] ?? null;
            $tags = is_array($clipData['tags']) ? $clipData['tags'] : [];
            $icon = sbCleanIcon($tags['icon'] ?? '🔊');
            $loop = !empty($tags['loop']);
            $importCategory = isset($tags['category']) && is_string($tags['category']) 
                ? sbCleanText($tags['category'], 50, '') 
                : null;
            
            $dir = sbCharacterDir($character);
            $existingCategories = sbReadCategoriesFile($dir . 'categories.json');
            $categoryNames = array_map(function ($c) { return $c['name'] ?? ''; }, $existingCategories);
            $category = ($importCategory && in_array($importCategory, $categoryNames, true)) 
                ? $importCategory 
                : null;
            
            $newId = bin2hex(random_bytes(6));
            
            if ($kind === 'speech' && is_string($text) && $text !== '') {
                $cleanText = sbCleanText($text, 500, '');
                if ($cleanText === '') {
                    $errors[] = "Clip $sourceId: empty text after cleaning";
                    continue;
                }
                
                if (!empty($clipData['audioBase64'])) {
                    $audioData = base64_decode($clipData['audioBase64'], true);
                    if ($audioData === false) {
                        $errors[] = "Clip $sourceId: invalid base64 audio";
                        continue;
                    }
                    
                    if (strlen($audioData) > SB_EXCHANGE_MAX_BUNDLE_BYTES) {
                        $errors[] = "Clip $sourceId: audio too large";
                        continue;
                    }
                    
                    $mime = (string)($clipData['mime'] ?? '');
                    if (!in_array($mime, SB_ALLOWED_IMPORT_MIMES, true)) {
                        $errors[] = "Clip $sourceId: unsupported MIME type";
                        continue;
                    }
                    
                    $ext = ($mime === 'audio/mp4' || $mime === 'audio/m4a') ? 'm4a' : 'mp3';
                    $tmpPath = $dir . '.tmp-' . $newId . '.' . $ext;
                    $finalPath = $dir . $newId . '.' . $ext;
                    
                    if (file_put_contents($tmpPath, $audioData) === false) {
                        $errors[] = "Clip $sourceId: failed to write audio file";
                        continue;
                    }
                    
                    if (!rename($tmpPath, $finalPath)) {
                        @unlink($tmpPath);
                        $errors[] = "Clip $sourceId: failed to rename audio file";
                        continue;
                    }
                }
                
                $record = [
                    'id' => $newId,
                    'label' => $name,
                    'icon' => $icon,
                    'loop' => $loop,
                    'videoId' => '',
                    'start' => 0,
                    'end' => 0,
                    'title' => $cleanText,
                    'source' => 'speech',
                    'sourceId' => $sourceId,
                    'sourceApp' => $sourceApp,
                    'createdAt' => gmdate('c'),
                ];
                
                if (is_string($voiceId) && $voiceId !== '') {
                    $record['voiceId'] = sbCleanServerVoice($voiceId);
                }
                
                if ($category !== null) {
                    $record['category'] = $category;
                }
                
                $imported[] = $record;
            
            } elseif ($kind === 'audio') {
                if (empty($clipData['audioBase64'])) {
                    $errors[] = "Clip $sourceId: audio kind requires audioBase64";
                    continue;
                }
                
                $audioData = base64_decode($clipData['audioBase64'], true);
                if ($audioData === false) {
                    $errors[] = "Clip $sourceId: invalid base64 audio";
                    continue;
                }
                
                if (strlen($audioData) > SB_EXCHANGE_MAX_BUNDLE_BYTES) {
                    $errors[] = "Clip $sourceId: audio too large";
                    continue;
                }
                
                $mime = (string)($clipData['mime'] ?? '');
                if (!in_array($mime, SB_ALLOWED_IMPORT_MIMES, true)) {
                    $errors[] = "Clip $sourceId: unsupported MIME type";
                    continue;
                }
                
                $ext = ($mime === 'audio/mp4' || $mime === 'audio/m4a') ? 'm4a' : 'mp3';
                $tmpPath = $dir . '.tmp-' . $newId . '.' . $ext;
                $finalPath = $dir . $newId . '.' . $ext;
                
                if (file_put_contents($tmpPath, $audioData) === false) {
                    $errors[] = "Clip $sourceId: failed to write audio file";
                    continue;
                }
                
                if (!rename($tmpPath, $finalPath)) {
                    @unlink($tmpPath);
                    $errors[] = "Clip $sourceId: failed to rename audio file";
                    continue;
                }
                
                $record = [
                    'id' => $newId,
                    'label' => $name,
                    'icon' => $icon,
                    'loop' => $loop,
                    'videoId' => '',
                    'start' => 0,
                    'end' => 0,
                    'title' => sbCleanText($clipData['displayName'] ?? $name, 140, ''),
                    'source' => 'youtube',
                    'sourceId' => $sourceId,
                    'sourceApp' => $sourceApp,
                    'createdAt' => gmdate('c'),
                ];
                
                if ($category !== null) {
                    $record['category'] = $category;
                }
                
                $imported[] = $record;
            } else {
                $errors[] = "Clip $sourceId: unsupported kind '$kind' or missing required data";
            }
        } catch (Exception $e) {
            $errors[] = "Clip $sourceId: " . $e->getMessage();
        }
    }
    
    if (!empty($imported)) {
        sbUpdateClips($character, function ($clips) use ($imported) {
            return array_merge($clips, $imported);
        });
    }
    
    $result = [
        'imported' => count($imported),
        'skipped' => count($clips) - count($imported),
    ];
    
    if (!empty($errors)) {
        $result['errors'] = $errors;
    }
    
    return $result;
}

function sbSendToApp(array $request) {
    if (!sbExchangeEnabled()) {
        throw new Exception('Exchange directory not available');
    }
    
    $targetApp = (string)($request['targetApp'] ?? '');
    if (!preg_match('/^[a-z]{3,20}$/', $targetApp)) {
        throw new Exception('Invalid target app');
    }
    
    $bundle = sbExportClips($request);
    $bundleJson = json_encode($bundle, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($bundleJson === false) {
        throw new Exception('Failed to encode bundle');
    }
    
    if (strlen($bundleJson) > SB_EXCHANGE_MAX_BUNDLE_BYTES) {
        throw new Exception('Bundle too large to send');
    }
    
    $inboxDir = sbInboxDir($targetApp);
    $uuid = bin2hex(random_bytes(16));
    $tmpPath = $inboxDir . '/.tmp-' . $uuid . '.json';
    $finalPath = $inboxDir . '/' . $uuid . '.json';
    
    if (file_put_contents($tmpPath, $bundleJson) === false) {
        throw new Exception('Failed to write bundle');
    }
    
    if (!rename($tmpPath, $finalPath)) {
        @unlink($tmpPath);
        throw new Exception('Failed to finalize bundle');
    }
    
    return ['sent' => true, 'bundleId' => $uuid];
}

function sbListIncoming($app) {
    if (!sbExchangeEnabled()) {
        return [];
    }
    
    if (!preg_match('/^[a-z]{3,20}$/', $app)) {
        throw new Exception('Invalid app name');
    }
    
    $inboxDir = sbInboxDir($app);
    $bundles = [];
    
    foreach (glob($inboxDir . '/*.json') ?: [] as $path) {
        $filename = basename($path);
        if (!preg_match('/^[a-f0-9]{32}\.json$/', $filename)) {
            continue;
        }
        
        $bundleId = substr($filename, 0, -5);
        $size = filesize($path);
        $mtime = filemtime($path);
        
        $preview = null;
        if ($size < SB_EXCHANGE_MAX_BUNDLE_BYTES) {
            $raw = file_get_contents($path);
            if ($raw !== false) {
                $data = json_decode($raw, true);
                if (is_array($data)) {
                    $preview = [
                        'sourceApp' => $data['sourceApp'] ?? 'unknown',
                        'exportedAt' => $data['exportedAt'] ?? null,
                        'clipCount' => is_array($data['clips'] ?? null) ? count($data['clips']) : 0,
                    ];
                }
            }
        }
        
        $bundles[] = [
            'bundleId' => $bundleId,
            'size' => $size,
            'receivedAt' => gmdate('c', $mtime),
            'preview' => $preview,
        ];
    }
    
    usort($bundles, function ($a, $b) {
        return strcmp($b['receivedAt'], $a['receivedAt']);
    });
    
    return $bundles;
}

function sbImportIncoming(array $request) {
    if (!sbExchangeEnabled()) {
        throw new Exception('Exchange directory not available');
    }
    
    $character = sbRequireCharacter($request['character'] ?? '');
    $bundleId = (string)($request['bundleId'] ?? '');
    
    if (!preg_match('/^[a-f0-9]{32}$/', $bundleId)) {
        throw new Exception('Invalid bundle ID');
    }
    
    $inboxDir = sbInboxDir('blingus');
    $bundlePath = $inboxDir . '/' . $bundleId . '.json';
    
    if (!is_file($bundlePath)) {
        throw new Exception('Bundle not found');
    }
    
    $size = filesize($bundlePath);
    if ($size > SB_EXCHANGE_MAX_BUNDLE_BYTES) {
        throw new Exception('Bundle too large');
    }
    
    $raw = file_get_contents($bundlePath);
    if ($raw === false) {
        throw new Exception('Failed to read bundle');
    }
    
    $bundle = json_decode($raw, true);
    if (!is_array($bundle)) {
        throw new Exception('Invalid bundle format');
    }
    
    $result = sbImportBundle([
        'character' => $character,
        'bundle' => $bundle,
    ]);
    
    @unlink($bundlePath);
    
    return $result;
}

function sbDiscardIncoming(array $request) {
    if (!sbExchangeEnabled()) {
        throw new Exception('Exchange directory not available');
    }
    
    $bundleId = (string)($request['bundleId'] ?? '');
    
    if (!preg_match('/^[a-f0-9]{32}$/', $bundleId)) {
        throw new Exception('Invalid bundle ID');
    }
    
    $inboxDir = sbInboxDir('blingus');
    $bundlePath = $inboxDir . '/' . $bundleId . '.json';
    
    if (is_file($bundlePath)) {
        @unlink($bundlePath);
    }
    
    return ['discarded' => true];
}

function sbApplyCors(array $allowedOrigins) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $localOrigin = (bool)preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
    $sameHost = $origin !== '' && $host !== '' && preg_match('#^https?://' . preg_quote($host, '#') . '$#', $origin);
    if (in_array($origin, $allowedOrigins, true) || $localOrigin || $sameHost) {
        header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : 'http://127.0.0.1'));
    } else {
        header('Access-Control-Allow-Origin: ' . ($allowedOrigins[0] ?? '*'));
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

function sbDispatch($requireAuth, $API_KEY, array $allowedOrigins) {
    sbApplyCors($allowedOrigins);
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    $request = [];
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $request = $decoded;
        }
    }
    $action = $request['action'] ?? ($_GET['action'] ?? ($_POST['action'] ?? ''));
    sbAuthCheck($requireAuth, $API_KEY);

    try {
        switch ($action) {
            case 'ping':
                sbJson([
                    'success' => true,
                    'ytdlp' => sbCommandWorks(sbYtdlpBin()),
                    'ffmpeg' => sbCommandWorks(sbFfmpegBin()),
                    'ffprobe' => sbCommandWorks(sbFfprobeBin()),
                    'sfx' => sbSfxKey() !== '',
                    'speech' => sbTtsKey() !== '',
                    'maxClipSeconds' => SB_MAX_CLIP_SECONDS,
                    'exchangeEnabled' => sbExchangeEnabled(),
                ]);

            case 'search':
                $query = trim($_GET['q'] ?? ($request['q'] ?? ''));
                sbJson([
                    'success' => true,
                    'query' => $query,
                    'results' => sbSearchYoutube($query),
                ]);

            case 'prepare':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $pulled = sbPrepareAudio($request['videoId'] ?? '');
                sbJson(['success' => true] + $pulled);

            case 'preview':
                $videoId = sbRequireVideoId($_GET['id'] ?? '');
                $path = sbFindCachedAudio($videoId);
                if (!$path) {
                    sbJson(['success' => false, 'error' => 'Audio is not on the server yet.'], 404);
                }
                sbStreamMediaFile($path);

            case 'list':
                $character = $_GET['character'] ?? ($request['character'] ?? '');
                sbJson([
                    'success' => true,
                    'character' => sbRequireCharacter($character),
                    'clips' => sbListClips($character),
                ]);

            case 'listWithCategories':
                $character = $_GET['character'] ?? ($request['character'] ?? '');
                $data = sbListWithCategories($character);
                sbJson([
                    'success' => true,
                    'character' => sbRequireCharacter($character),
                    'clips' => $data['clips'],
                    'categories' => $data['categories'],
                ]);

            case 'save':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                sbJson([
                    'success' => true,
                    'clip' => sbSaveClip($request),
                ]);

            case 'effect':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                sbJson([
                    'success' => true,
                    'clip' => sbSaveEffect($request),
                ]);

            case 'speak':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                sbJson([
                    'success' => true,
                    'clip' => sbSaveSpeech($request),
                ]);

            case 'delete':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                sbDeleteClip($request['character'] ?? '', $request['id'] ?? '');
                sbJson(['success' => true]);

            case 'file':
                $character = sbRequireCharacter($_GET['character'] ?? '');
                $id = sbRequireClipId($_GET['id'] ?? '');
                $path = sbClipFile($character, $id);
                if (!$path) {
                    sbJson(['success' => false, 'error' => 'Clip not found.'], 404);
                }
                sbStreamMediaFile($path);

            case 'export':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $bundle = sbExportClips($request);
                header('Content-Type: application/json');
                header('Content-Disposition: attachment; filename="blingus-clips-' . gmdate('Ymd-His') . '.json"');
                echo json_encode($bundle, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                exit;

            case 'import':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $result = sbImportBundle($request);
                sbJson(['success' => true] + $result);

            case 'sendTo':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $result = sbSendToApp($request);
                sbJson(['success' => true] + $result);

            case 'incoming':
                $app = $_GET['app'] ?? ($request['app'] ?? 'blingus');
                sbJson([
                    'success' => true,
                    'exchangeEnabled' => sbExchangeEnabled(),
                    'bundles' => sbListIncoming($app),
                ]);

            case 'importIncoming':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $result = sbImportIncoming($request);
                sbJson(['success' => true] + $result);

            case 'discardIncoming':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $result = sbDiscardIncoming($request);
                sbJson(['success' => true] + $result);

            case 'saveCategories':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $categories = sbSaveCategories($request);
                sbJson(['success' => true, 'categories' => $categories]);

            case 'updateClipCategory':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                $result = sbUpdateClipCategory($request);
                sbJson(['success' => true] + $result);

            default:
                throw new Exception('Invalid action. Use: ping, search, prepare, preview, list, listWithCategories, save, effect, speak, delete, file, export, import, sendTo, incoming, importIncoming, discardIncoming, saveCategories, updateClipCategory');
        }
    } catch (Exception $e) {
        sbJson(['success' => false, 'error' => $e->getMessage()], 400);
    }
}

if (PHP_SAPI !== 'cli') {
    sbDispatch($requireAuth, $API_KEY, $allowedOrigins);
}
