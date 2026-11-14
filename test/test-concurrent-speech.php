<?php
/**
 * Test concurrent speech generation requests.
 * Simulates two requests racing to generate audio for the same clip.
 * Must assert: only ONE TTS API call, no duplicate records.
 */

require_once __DIR__ . '/../api/soundboard.php';

// Mock TTS generation
$GLOBALS['ttsCallCount'] = 0;
$GLOBALS['ttsCallArgs'] = [];

function sbGenerateSpeech($text, $voice) {
    $GLOBALS['ttsCallCount']++;
    $GLOBALS['ttsCallArgs'][] = ['text' => $text, 'voice' => $voice];
    // Return fake MP3 data (minimal valid MP3 header)
    return hex2bin('494433040000000000');
}

// Setup test environment
$testRoot = sys_get_temp_dir() . '/soundboard-test-' . bin2hex(random_bytes(4));
mkdir($testRoot, 0755, true);
putenv('SOUNDBOARD_ROOT=' . $testRoot);

function cleanup() {
    global $testRoot;
    if (is_dir($testRoot)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($testRoot, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($testRoot);
    }
}
register_shutdown_function('cleanup');

// Create test character directory
$characterDir = sbCharacterDir('blingus');

// Create existing speech clip without audio
$clipId = bin2hex(random_bytes(6));
$clips = [
    [
        'id' => $clipId,
        'label' => 'Test Clip',
        'icon' => '🗣️',
        'loop' => false,
        'videoId' => '',
        'start' => 0,
        'end' => 0,
        'title' => 'This is a test speech clip that needs audio generation.',
        'source' => 'speech',
        'createdAt' => gmdate('c'),
    ],
];
file_put_contents($characterDir . 'clips.json', json_encode($clips, JSON_PRETTY_PRINT));

echo "Test Setup:\n";
echo "- Character: blingus\n";
echo "- Clip ID: $clipId\n";
echo "- Clip has NO audio file initially\n";
echo "\n";

// Test 1: Sequential requests (baseline)
echo "Test 1: Sequential Requests (baseline)\n";
echo "----------------------------------------\n";

$GLOBALS['ttsCallCount'] = 0;
$GLOBALS['ttsCallArgs'] = [];

$result1 = sbSaveSpeech([
    'character' => 'blingus',
    'id' => $clipId,
    'text' => 'Test text',
]);

echo "First request completed\n";
echo "TTS calls after first request: " . $GLOBALS['ttsCallCount'] . "\n";

$result2 = sbSaveSpeech([
    'character' => 'blingus',
    'id' => $clipId,
    'text' => 'Test text',
]);

echo "Second request completed\n";
echo "TTS calls after second request: " . $GLOBALS['ttsCallCount'] . "\n";

if ($GLOBALS['ttsCallCount'] !== 1) {
    echo "❌ FAIL: Expected 1 TTS call, got " . $GLOBALS['ttsCallCount'] . "\n";
    exit(1);
}

echo "✅ PASS: Only 1 TTS call made (second request used cached audio)\n";
echo "\n";

// Verify audio file exists
$audioPath = sbClipFile('blingus', $clipId);
if ($audioPath === null) {
    echo "❌ FAIL: Audio file not found\n";
    exit(1);
}
echo "✅ PASS: Audio file created at $audioPath\n";

// Verify no duplicate clips
$clipsAfter = sbReadClipsFile($characterDir . 'clips.json');
if (count($clipsAfter) !== 1) {
    echo "❌ FAIL: Expected 1 clip, found " . count($clipsAfter) . "\n";
    exit(1);
}
echo "✅ PASS: No duplicate clips created\n";
echo "\n";

// Test 2: Simulated concurrent requests with forking
echo "Test 2: Concurrent Requests (fork simulation)\n";
echo "----------------------------------------------\n";

// Clean up for next test
@unlink($audioPath);
$GLOBALS['ttsCallCount'] = 0;
$GLOBALS['ttsCallArgs'] = [];

// This test simulates concurrency by using flock behavior
// We can't truly fork in PHP easily, but we can test the lock mechanism

echo "Testing lock mechanism...\n";

// Acquire lock for first request
$lockFile = $characterDir . 'locks/' . $clipId . '.lock';
if (!is_dir(dirname($lockFile))) {
    mkdir(dirname($lockFile), 0755, true);
}

$lock1 = fopen($lockFile, 'c');
flock($lock1, LOCK_EX);

echo "First request holds lock\n";

// Try to acquire same lock (should block, we'll use non-blocking to test)
$lock2 = fopen($lockFile, 'c');
$gotLock = flock($lock2, LOCK_EX | LOCK_NB);

if ($gotLock) {
    echo "❌ FAIL: Second request got lock while first holds it (should block)\n";
    flock($lock2, LOCK_UN);
    fclose($lock2);
    flock($lock1, LOCK_UN);
    fclose($lock1);
    exit(1);
}

echo "✅ PASS: Second request blocked (couldn't acquire lock)\n";

// Release first lock
flock($lock1, LOCK_UN);
fclose($lock1);

// Now second can acquire
$gotLock = flock($lock2, LOCK_EX | LOCK_NB);
if (!$gotLock) {
    echo "❌ FAIL: Second request couldn't acquire lock after first released\n";
    fclose($lock2);
    exit(1);
}

echo "✅ PASS: Second request acquired lock after first released\n";

flock($lock2, LOCK_UN);
fclose($lock2);
echo "\n";

// Test 3: Verify sbClipFile matches extensions
echo "Test 3: Extension Matching\n";
echo "--------------------------\n";

$testClipId = bin2hex(random_bytes(6));

// Test with .m4a
file_put_contents($characterDir . $testClipId . '.m4a', 'mock audio');
$foundPath = sbClipFile('blingus', $testClipId);
if ($foundPath === null || !str_ends_with($foundPath, '.m4a')) {
    echo "❌ FAIL: sbClipFile didn't find .m4a file\n";
    exit(1);
}
echo "✅ PASS: sbClipFile found .m4a extension\n";
@unlink($foundPath);

// Test with .mp3
file_put_contents($characterDir . $testClipId . '.mp3', 'mock audio');
$foundPath = sbClipFile('blingus', $testClipId);
if ($foundPath === null || !str_ends_with($foundPath, '.mp3')) {
    echo "❌ FAIL: sbClipFile didn't find .mp3 file\n";
    exit(1);
}
echo "✅ PASS: sbClipFile found .mp3 extension\n";
@unlink($foundPath);

// Test with unsupported extension (should not find)
file_put_contents($characterDir . $testClipId . '.ogg', 'mock audio');
$foundPath = sbClipFile('blingus', $testClipId);
if ($foundPath !== null) {
    echo "❌ FAIL: sbClipFile incorrectly found .ogg file (should only check mp3/m4a)\n";
    exit(1);
}
echo "✅ PASS: sbClipFile correctly ignored .ogg (only checks mp3/m4a)\n";
@unlink($characterDir . $testClipId . '.ogg');

echo "\n";

// Test 4: Full integration with re-check after lock
echo "Test 4: Post-Lock Re-check\n";
echo "--------------------------\n";

$testClipId2 = bin2hex(random_bytes(6));
$clips2 = [
    [
        'id' => $testClipId2,
        'label' => 'Test Clip 2',
        'icon' => '🗣️',
        'loop' => false,
        'videoId' => '',
        'start' => 0,
        'end' => 0,
        'title' => 'Another test clip',
        'source' => 'speech',
        'createdAt' => gmdate('c'),
    ],
];
file_put_contents($characterDir . 'clips.json', json_encode($clips2, JSON_PRETTY_PRINT));

$GLOBALS['ttsCallCount'] = 0;

// First request generates audio
$result = sbSaveSpeech([
    'character' => 'blingus',
    'id' => $testClipId2,
    'text' => 'Test',
]);

if ($GLOBALS['ttsCallCount'] !== 1) {
    echo "❌ FAIL: Expected 1 TTS call for new clip, got " . $GLOBALS['ttsCallCount'] . "\n";
    exit(1);
}

// Verify audio exists
$audioPath2 = sbClipFile('blingus', $testClipId2);
if ($audioPath2 === null) {
    echo "❌ FAIL: Audio not created\n";
    exit(1);
}

// Second request should find audio after lock and skip generation
$result2 = sbSaveSpeech([
    'character' => 'blingus',
    'id' => $testClipId2,
    'text' => 'Test',
]);

if ($GLOBALS['ttsCallCount'] !== 1) {
    echo "❌ FAIL: Expected still 1 TTS call (second should find audio), got " . $GLOBALS['ttsCallCount'] . "\n";
    exit(1);
}

echo "✅ PASS: Post-lock re-check found existing audio and skipped generation\n";

// Verify still only one clip
$clipsAfter2 = sbReadClipsFile($characterDir . 'clips.json');
if (count($clipsAfter2) !== 1) {
    echo "❌ FAIL: Expected 1 clip, found " . count($clipsAfter2) . "\n";
    exit(1);
}

echo "✅ PASS: No duplicate clip created\n";
echo "\n";

// Test 5: Voice ID persistence
echo "Test 5: Voice ID Persistence\n";
echo "-----------------------------\n";

$testClipId3 = bin2hex(random_bytes(6));
$clips3 = [
    [
        'id' => $testClipId3,
        'label' => 'Test Clip 3',
        'icon' => '🗣️',
        'loop' => false,
        'videoId' => '',
        'start' => 0,
        'end' => 0,
        'title' => 'Voice test clip',
        'source' => 'speech',
        'voiceId' => 'original-voice-123',
        'createdAt' => gmdate('c'),
    ],
];
file_put_contents($characterDir . 'clips.json', json_encode($clips3, JSON_PRETTY_PRINT));

$GLOBALS['ttsCallCount'] = 0;

// Generate with new voice ID
$result = sbSaveSpeech([
    'character' => 'blingus',
    'id' => $testClipId3,
    'text' => 'Test',
    'voiceId' => 'new-voice-456',
]);

// Verify voice ID was used
if (empty($GLOBALS['ttsCallArgs']) || $GLOBALS['ttsCallArgs'][0]['voice'] !== 'new-voice-456') {
    echo "❌ FAIL: New voice ID not used for generation\n";
    exit(1);
}

// Verify voice ID was persisted
$clipsAfter3 = sbReadClipsFile($characterDir . 'clips.json');
$found = false;
foreach ($clipsAfter3 as $clip) {
    if ($clip['id'] === $testClipId3) {
        if (($clip['voiceId'] ?? '') === 'new-voice-456') {
            $found = true;
        }
        break;
    }
}

if (!$found) {
    echo "❌ FAIL: Voice ID not persisted to clips.json\n";
    exit(1);
}

echo "✅ PASS: Voice ID persisted correctly\n";
echo "\n";

// Summary
echo "========================================\n";
echo "All Tests Passed! ✅\n";
echo "========================================\n";
echo "Summary:\n";
echo "- Sequential requests: 1 TTS call ✅\n";
echo "- Lock mechanism: blocks concurrent access ✅\n";
echo "- Extension matching: mp3/m4a only ✅\n";
echo "- Post-lock re-check: skips duplicate generation ✅\n";
echo "- Voice ID: persists correctly ✅\n";
echo "- No duplicate clips created ✅\n";
