<?php
/**
 * Per-character soundboard clips.
 * Search YouTube, pull audio, trim a short section, store it on the server.
 * Personal homelab use. Requires yt-dlp, ffmpeg, and ffprobe.
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
    return [
        'id' => $clip['id'],
        'label' => sbCleanLabel($clip['label'] ?? ''),
        'icon' => sbCleanIcon($clip['icon'] ?? ''),
        'loop' => !empty($clip['loop']),
        'videoId' => sbRequireVideoId($clip['videoId'] ?? ''),
        'start' => round((float)($clip['start'] ?? 0), 3),
        'end' => round((float)($clip['end'] ?? 0), 3),
        'title' => sbCleanText($clip['title'] ?? '', 140, ''),
    ];
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
                    'maxClipSeconds' => SB_MAX_CLIP_SECONDS,
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

            case 'save':
                if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
                    throw new Exception('POST required.');
                }
                sbJson([
                    'success' => true,
                    'clip' => sbSaveClip($request),
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

            default:
                throw new Exception('Invalid action. Use: ping, search, prepare, preview, list, save, delete, file');
        }
    } catch (Exception $e) {
        sbJson(['success' => false, 'error' => $e->getMessage()], 400);
    }
}

if (PHP_SAPI !== 'cli') {
    sbDispatch($requireAuth, $API_KEY, $allowedOrigins);
}
