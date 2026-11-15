<?php
/**
 * Test backward compatibility after app-aware rewrite.
 * Ensures existing bundles and clips still load on Blingus host.
 * Uses temp dirs only - no touching real data.
 */

// Setup before loading production code
$testRoot = sys_get_temp_dir() . '/compat-test-' . bin2hex(random_bytes(4));
mkdir($testRoot, 0755, true);
putenv('SOUNDBOARD_DIR=' . $testRoot);

$exchangeRoot = sys_get_temp_dir() . '/exchange-test-' . bin2hex(random_bytes(4));
mkdir($exchangeRoot, 0755, true);
putenv('SOUNDBOARD_EXCHANGE_DIR=' . $exchangeRoot);

// Mock hostname as blingus
$_SERVER['HTTP_HOST'] = 'blingus.knospe.org';

echo "Test environment:\n";
echo "- SOUNDBOARD_DIR: $testRoot\n";
echo "- EXCHANGE_DIR: $exchangeRoot\n";
echo "- HTTP_HOST: blingus.knospe.org\n\n";

// Load production code
require_once __DIR__ . '/../api/soundboard.php';

function cleanup() {
    global $testRoot, $exchangeRoot;
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
    if (is_dir($exchangeRoot)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($exchangeRoot, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($exchangeRoot);
    }
}
register_shutdown_function('cleanup');

// Test 1: App ID detection on Blingus host
echo "Test 1: App ID Detection\n";
echo "-------------------------\n";
$appId = sbAppIdFromHost();
if ($appId !== 'blingus') {
    echo "❌ FAIL: Expected app ID 'blingus', got '$appId'\n";
    exit(1);
}
echo "✅ PASS: App ID is 'blingus'\n\n";

// Test 2: Create existing structure (pre-app-aware)
echo "Test 2: Existing Clips Structure\n";
echo "---------------------------------\n";

$blingusDir = sbCharacterDir('blingus');
$clips = [
    [
        'id' => 'abc123def456',
        'label' => 'Test Clip',
        'icon' => '🎵',
        'loop' => false,
        'videoId' => '',
        'start' => 0,
        'end' => 0,
        'title' => '',
        'source' => 'youtube',
        'category' => 'Music',
        'createdAt' => gmdate('c'),
    ],
    [
        'id' => '789fedcba012',
        'label' => 'Speech Clip',
        'icon' => '🗣️',
        'loop' => false,
        'videoId' => '',
        'start' => 0,
        'end' => 0,
        'title' => 'Test speech',
        'source' => 'speech',
        'createdAt' => gmdate('c'),
    ],
];

file_put_contents($blingusDir . 'clips.json', json_encode($clips, JSON_PRETTY_PRINT));

// Create categories
$categoriesDir = $blingusDir . 'categories/';
if (!is_dir($categoriesDir)) {
    mkdir($categoriesDir, 0755, true);
}
$categories = [
    ['id' => 'cat1', 'label' => 'Music', 'icon' => '🎵', 'position' => 0],
    ['id' => 'cat2', 'label' => 'Speech', 'icon' => '🗣️', 'position' => 1],
];
file_put_contents($categoriesDir . 'categories.json', json_encode($categories, JSON_PRETTY_PRINT));

echo "Created test clips and categories\n";

// Test 3: Load clips via API
echo "\nTest 3: Load Clips via API\n";
echo "---------------------------\n";

try {
    $loadedClips = sbReadClipsFile($blingusDir . 'clips.json');
    if (count($loadedClips) !== 2) {
        echo "❌ FAIL: Expected 2 clips, got " . count($loadedClips) . "\n";
        exit(1);
    }
    
    $clip1 = $loadedClips[0];
    if ($clip1['id'] !== 'abc123def456' || $clip1['category'] !== 'Music') {
        echo "❌ FAIL: First clip data corrupted\n";
        exit(1);
    }
    
    echo "✅ PASS: Clips loaded correctly\n";
    echo "  - Clip 1: {$clip1['label']} (category: {$clip1['category']})\n";
    echo "  - Clip 2: {$loadedClips[1]['label']}\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 4: Inbox for Blingus
echo "\nTest 4: Inbox for Blingus\n";
echo "--------------------------\n";

$inboxDir = $exchangeRoot . '/inbox/blingus';
if (!is_dir($inboxDir)) {
    mkdir($inboxDir, 0755, true);
}

// Create existing bundle
$bundle = [
    'format' => 'knospe-soundboard-clips',
    'version' => 1,
    'sourceApp' => 'galen',
    'exportedAt' => gmdate('c'),
    'clips' => [
        [
            'type' => 'speech',
            'kind' => 'speech',
            'name' => 'Galen Greeting',
            'displayName' => null,
            'text' => 'Hello from Galen',
            'voiceId' => null,
            'tags' => ['icon' => '👋', 'loop' => false],
            'mime' => 'audio/mpeg',
            'audioBase64' => base64_encode('fake audio data'),
            'sourceId' => 'galen123',
        ],
    ],
];

$bundleId = bin2hex(random_bytes(16));
file_put_contents($inboxDir . '/' . $bundleId . '.json', json_encode($bundle, JSON_PRETTY_PRINT));

echo "Created test bundle in inbox/blingus\n";

try {
    $bundles = sbListIncoming('blingus');
    if (count($bundles) !== 1) {
        echo "❌ FAIL: Expected 1 bundle, got " . count($bundles) . "\n";
        exit(1);
    }
    
    $b = $bundles[0];
    if ($b['bundleId'] !== $bundleId) {
        echo "❌ FAIL: Bundle ID mismatch\n";
        exit(1);
    }
    
    if (($b['preview']['sourceApp'] ?? '') !== 'galen') {
        echo "❌ FAIL: Source app not preserved\n";
        exit(1);
    }
    
    echo "✅ PASS: Existing bundle loaded correctly\n";
    echo "  - Bundle ID: {$b['bundleId']}\n";
    echo "  - Source: {$b['preview']['sourceApp']}\n";
    echo "  - Clips: {$b['preview']['clipCount']}\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 5: Export still works
echo "\nTest 5: Export Still Works\n";
echo "---------------------------\n";

try {
    $exported = sbExportClips([
        'character' => 'blingus',
        'clipIds' => ['abc123def456'],
    ]);
    
    if ($exported['sourceApp'] !== 'blingus') {
        echo "❌ FAIL: Expected sourceApp 'blingus', got '{$exported['sourceApp']}'\n";
        exit(1);
    }
    
    if (count($exported['clips']) !== 1) {
        echo "❌ FAIL: Expected 1 clip in export\n";
        exit(1);
    }
    
    $expClip = $exported['clips'][0];
    if (($expClip['tags']['category'] ?? '') !== 'Music') {
        echo "❌ FAIL: Category not preserved in export\n";
        exit(1);
    }
    
    echo "✅ PASS: Export works correctly\n";
    echo "  - Source app: {$exported['sourceApp']}\n";
    echo "  - Clips: " . count($exported['clips']) . "\n";
    echo "  - Category preserved: {$expClip['tags']['category']}\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 6: Categories still accessible
echo "\nTest 6: Categories Still Work\n";
echo "------------------------------\n";

$categoriesFile = $categoriesDir . 'categories.json';
if (!is_file($categoriesFile)) {
    echo "❌ FAIL: Categories file not found\n";
    exit(1);
}

$loadedCats = json_decode(file_get_contents($categoriesFile), true);
if (count($loadedCats) !== 2) {
    echo "❌ FAIL: Expected 2 categories, got " . count($loadedCats) . "\n";
    exit(1);
}

echo "✅ PASS: Categories loaded correctly\n";
echo "  - Category 1: {$loadedCats[0]['label']}\n";
echo "  - Category 2: {$loadedCats[1]['label']}\n";

// Summary
echo "\n========================================\n";
echo "All Backward Compatibility Tests Passed! ✅\n";
echo "========================================\n";
echo "Summary:\n";
echo "- App ID detection works ✅\n";
echo "- Existing clips structure preserved ✅\n";
echo "- Clips load correctly ✅\n";
echo "- Existing bundles in inbox/blingus work ✅\n";
echo "- Export preserves categories ✅\n";
echo "- Categories still accessible ✅\n";
echo "\nNo data corruption detected.\n";
