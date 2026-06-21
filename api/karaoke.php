<?php
/**
 * Karaoke API — YouTube search, download (yt-dlp), and local streaming
 * Personal/homelab use only. Requires yt-dlp + ffmpeg on the server.
 */

$API_KEY = getenv('BLINGUS_API_KEY') ?: '';
$requireAuth = !empty($API_KEY);

$YTDLP = getenv('YTDLP_PATH') ?: 'yt-dlp';
$FFMPEG = getenv('FFMPEG_PATH') ?: 'ffmpeg';

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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function karaokeAuthCheck($requireAuth, $API_KEY) {
    if (!$requireAuth) {
        return;
    }
    $providedKey = $_GET['key'] ?? $_POST['key'] ?? '';
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $providedKey = $matches[1];
    }
    if (empty($providedKey) || !hash_equals($API_KEY, $providedKey)) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function validateVideoId($id) {
    return is_string($id) && preg_match('/^[a-zA-Z0-9_-]{11}$/', $id);
}

function getKaraokeDir() {
    $baseDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
    $dir = $baseDir . '/data/karaoke/';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function findLocalVideoPath($videoId) {
    $dir = getKaraokeDir();
    foreach (['mp4', 'webm', 'mkv', 'm4a'] as $ext) {
        $path = $dir . $videoId . '.' . $ext;
        if (is_file($path)) {
            return $path;
        }
    }
    // yt-dlp may use different extension — scan directory
    $matches = glob($dir . $videoId . '.*');
    if (!empty($matches)) {
        return $matches[0];
    }
    return null;
}

function runCommand(array $cmd, &$output = null, &$exitCode = null) {
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $process = proc_open($cmd, $descriptors, $pipes);
    if (!is_resource($process)) {
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

function ytdlpAvailable($YTDLP) {
    $out = '';
    $code = 1;
    runCommand([$YTDLP, '--version'], $out, $code);
    return $code === 0;
}

function parseSearchResults($output) {
    $results = [];
    foreach (preg_split('/\r?\n/', trim($output)) as $line) {
        if ($line === '') continue;
        $row = json_decode($line, true);
        if (!$row || empty($row['id'])) continue;
        if (!validateVideoId($row['id'])) continue;
        $results[] = [
            'id' => $row['id'],
            'title' => $row['title'] ?? 'Untitled',
            'channel' => $row['channel'] ?? ($row['uploader'] ?? ''),
            'duration' => isset($row['duration']) ? (int)$row['duration'] : null,
            'thumbnail' => $row['thumbnail'] ?? ('https://i.ytimg.com/vi/' . $row['id'] . '/hqdefault.jpg'),
            'url' => $row['url'] ?? ('https://www.youtube.com/watch?v=' . $row['id']),
        ];
    }
    return $results;
}

function streamVideoFile($filePath) {
    if (!is_file($filePath) || !is_readable($filePath)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Video not found']);
        exit;
    }

    $size = filesize($filePath);
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mime = 'video/mp4';
    if ($ext === 'webm') $mime = 'video/webm';
    if ($ext === 'mkv') $mime = 'video/x-matroska';

    header('Content-Type: ' . $mime);
    header('Accept-Ranges: bytes');
    header('Cache-Control: private, max-age=3600');

    $start = 0;
    $end = $size - 1;

    if (isset($_SERVER['HTTP_RANGE'])) {
        if (preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches)) {
            if ($matches[1] !== '') $start = (int)$matches[1];
            if ($matches[2] !== '') $end = (int)$matches[2];
            if ($end >= $size) $end = $size - 1;
            if ($start > $end) {
                http_response_code(416);
                header("Content-Range: bytes */$size");
                exit;
            }
            http_response_code(206);
            header("Content-Range: bytes $start-$end/$size");
        }
    } else {
        header('Content-Length: ' . $size);
    }

    $length = $end - $start + 1;
    if (isset($_SERVER['HTTP_RANGE'])) {
        header('Content-Length: ' . $length);
    }

    $fp = fopen($filePath, 'rb');
    fseek($fp, $start);
    $bufferSize = 8192;
    $bytesLeft = $length;
    while ($bytesLeft > 0 && !feof($fp)) {
        $read = ($bytesLeft > $bufferSize) ? $bufferSize : $bytesLeft;
        echo fread($fp, $read);
        $bytesLeft -= $read;
        if (connection_status() !== CONNECTION_NORMAL) break;
    }
    fclose($fp);
    exit;
}

// Parse action
$action = $_GET['action'] ?? $_POST['action'] ?? '';
if ($action === '' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    if (is_array($request) && isset($request['action'])) {
        $action = $request['action'];
    }
}

// Stream does not use JSON content-type
if ($action !== 'stream') {
    karaokeAuthCheck($requireAuth, $API_KEY);
}

try {
    switch ($action) {
        case 'ping':
            $available = ytdlpAvailable($YTDLP);
            jsonResponse([
                'success' => true,
                'ytdlp' => $available,
                'karaokeDir' => getKaraokeDir(),
            ]);

        case 'search':
            $song = trim($_GET['song'] ?? $_POST['song'] ?? '');
            $artist = trim($_GET['artist'] ?? $_POST['artist'] ?? '');
            $query = trim($_GET['q'] ?? $_POST['q'] ?? '');
            if ($query === '' && ($song !== '' || $artist !== '')) {
                $query = trim("$song $artist karaoke");
            }
            if ($query === '') {
                throw new Exception('Search query required');
            }
            if (!ytdlpAvailable($YTDLP)) {
                throw new Exception('yt-dlp is not installed or not in PATH');
            }
            $searchTerm = 'ytsearch10:' . $query;
            $cmd = [$YTDLP, '--flat-playlist', '--dump-json', $searchTerm];
            $output = '';
            $code = 1;
            if (!runCommand($cmd, $output, $code)) {
                throw new Exception('YouTube search failed');
            }
            jsonResponse([
                'success' => true,
                'query' => $query,
                'results' => parseSearchResults($output),
            ]);

        case 'download':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('POST required for download');
            }
            $body = json_decode(file_get_contents('php://input'), true) ?: [];
            $videoId = $body['videoId'] ?? $_POST['videoId'] ?? '';
            if (!validateVideoId($videoId)) {
                throw new Exception('Invalid video ID');
            }
            $existing = findLocalVideoPath($videoId);
            if ($existing) {
                jsonResponse([
                    'success' => true,
                    'videoId' => $videoId,
                    'filename' => basename($existing),
                    'size' => filesize($existing),
                    'cached' => true,
                ]);
            }
            if (!ytdlpAvailable($YTDLP)) {
                throw new Exception('yt-dlp is not installed or not in PATH');
            }
            $dir = getKaraokeDir();
            $outTemplate = $dir . $videoId . '.%(ext)s';
            $url = 'https://www.youtube.com/watch?v=' . $videoId;
            $cmd = [
                $YTDLP,
                '-f', 'best[height<=720][ext=mp4]/best[ext=mp4]/best',
                '--no-playlist',
                '-o', $outTemplate,
                $url,
            ];
            set_time_limit(900);
            $output = '';
            $code = 1;
            if (!runCommand($cmd, $output, $code)) {
                error_log('Karaoke download failed: ' . substr($output, 0, 500));
                throw new Exception('Download failed — video may be restricted or unavailable');
            }
            $path = findLocalVideoPath($videoId);
            if (!$path) {
                throw new Exception('Download completed but file not found');
            }
            jsonResponse([
                'success' => true,
                'videoId' => $videoId,
                'filename' => basename($path),
                'size' => filesize($path),
                'cached' => false,
            ]);

        case 'exists':
            $videoId = $_GET['id'] ?? '';
            if (!validateVideoId($videoId)) {
                throw new Exception('Invalid video ID');
            }
            $path = findLocalVideoPath($videoId);
            jsonResponse([
                'success' => true,
                'exists' => $path !== null,
                'videoId' => $videoId,
                'size' => $path ? filesize($path) : null,
            ]);

        case 'stream':
            karaokeAuthCheck($requireAuth, $API_KEY);
            $videoId = $_GET['id'] ?? '';
            if (!validateVideoId($videoId)) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'error' => 'Invalid video ID']);
                exit;
            }
            $path = findLocalVideoPath($videoId);
            if (!$path) {
                http_response_code(404);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'error' => 'Video not downloaded']);
                exit;
            }
            streamVideoFile($path);
            break;

        default:
            throw new Exception('Invalid action. Use: ping, search, download, exists, stream');
    }
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 400);
}
