<?php
/**
 * Trims a local audio file through the soundboard clip API and checks the bounds.
 * Usage: php scripts/test-soundboard-clips.php
 */

function fail($msg) {
    fwrite(STDERR, "FAIL: $msg\n");
    exit(1);
}

function ok($msg) {
    fwrite(STDOUT, "ok: $msg\n");
}

function rmTree($dir) {
    if (!is_dir($dir)) {
        return;
    }
    foreach (scandir($dir) as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $path = $dir . '/' . $item;
        if (is_dir($path)) {
            rmTree($path);
        } else {
            unlink($path);
        }
    }
    rmdir($dir);
}

$root = sys_get_temp_dir() . '/bardbook-sb-' . getmypid();
rmTree($root);
mkdir($root, 0755, true);
putenv('SOUNDBOARD_DIR=' . $root);
require dirname(__DIR__) . '/api/soundboard.php';

try {
    $cache = $root . '/_cache';
    if (!mkdir($cache, 0755, true) && !is_dir($cache)) {
        fail('could not create cache dir');
    }
    $src = $cache . '/testclip001.mp3';
    $cmd = 'ffmpeg -y -hide_banner -loglevel error -f lavfi -i sine=frequency=440:duration=8 -c:a libmp3lame -q:a 5 '
        . escapeshellarg($src);
    exec($cmd, $unused, $code);
    if ($code !== 0 || !is_file($src)) {
        fail('ffmpeg could not build the source clip');
    }
    ok('built 8s source audio');

    $threw = false;
    try {
        sbSaveClip([
            'character' => '../etc',
            'videoId' => 'testclip001',
            'start' => 0,
            'end' => 1,
        ]);
    } catch (Exception $e) {
        $threw = true;
        ok('rejected a bad character');
    }
    if (!$threw) {
        fail('bad character was accepted');
    }

    $threw = false;
    try {
        sbSaveClip([
            'character' => 'blingus',
            'videoId' => 'testclip001',
            'start' => 3,
            'end' => 1,
        ]);
    } catch (Exception $e) {
        $threw = true;
        ok('rejected an inverted trim');
    }
    if (!$threw) {
        fail('inverted trim was accepted');
    }

    $threw = false;
    try {
        sbSaveClip([
            'character' => 'blingus',
            'videoId' => 'testclip001',
            'start' => 0,
            'end' => 50,
        ]);
    } catch (Exception $e) {
        $threw = true;
        ok('rejected a clip over 45 seconds');
    }
    if (!$threw) {
        fail('overlong clip was accepted');
    }

    $clip = sbSaveClip([
        'character' => 'blingus',
        'videoId' => 'testclip001',
        'start' => 1.25,
        'end' => 3.75,
        'label' => '  Horn blast  ',
        'icon' => '📯',
        'loop' => true,
        'title' => 'Source title',
    ]);
    if (($clip['label'] ?? '') !== 'Horn blast') {
        fail('label was not trimmed: ' . json_encode($clip));
    }
    if (empty($clip['loop']) || ($clip['icon'] ?? '') !== '📯') {
        fail('loop or icon was not stored');
    }
    $file = sbClipFile('blingus', $clip['id']);
    if (!$file || !is_file($file)) {
        fail('saved clip file is missing');
    }
    $probe = shell_exec(
        'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 '
        . escapeshellarg($file)
    );
    $dur = (float)$probe;
    if ($dur < 2.2 || $dur > 2.9) {
        fail('trimmed duration was ' . $dur . ', expected about 2.5s');
    }
    ok('saved a 2.5s clip (' . round($dur, 3) . 's)');

    $listed = sbListClips('blingus');
    if (count($listed) !== 1 || $listed[0]['id'] !== $clip['id']) {
        fail('list did not return the saved clip');
    }
    if (strpos(json_encode($listed), $root) !== false) {
        fail('list leaked a filesystem path');
    }
    ok('listed the clip without a filesystem path');

    $other = sbListClips('vadania');
    if (count($other) !== 0) {
        fail('vadania saw blingus clips');
    }
    ok('clips stay on the character that saved them');

    sbDeleteClip('blingus', $clip['id']);
    if (is_file($file)) {
        fail('deleted clip file is still on disk');
    }
    if (count(sbListClips('blingus')) !== 0) {
        fail('deleted clip is still listed');
    }
    ok('delete removed the file and the pad');

    $threw = false;
    try {
        sbDeleteClip('blingus', $clip['id']);
    } catch (Exception $e) {
        $threw = true;
        ok('delete of a missing clip fails');
    }
    if (!$threw) {
        fail('second delete succeeded');
    }
} finally {
    rmTree($root);
}

ok('all soundboard clip checks passed');
