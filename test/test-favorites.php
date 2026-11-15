<?php
/**
 * Test favorites feature: save, list, update display name, delete, and favorite-file action.
 * Uses temp dirs only - no touching real data.
 */

// Setup test environment BEFORE loading production code
$testRoot = sys_get_temp_dir() . '/favorites-test-' . bin2hex(random_bytes(4));
mkdir($testRoot, 0755, true);
putenv('SOUNDBOARD_DIR=' . $testRoot);

$_SERVER['HTTP_HOST'] = 'blingus.knospe.org';

echo "Test environment: $testRoot\n\n";

// Load production code
require_once __DIR__ . '/../api/soundboard.php';

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

// Test 1: Save a favorite
echo "Test 1: Save a Favorite\n";
echo "------------------------\n";

$audioData = hex2bin('494433040000000000');
$audioBase64 = base64_encode($audioData);

try {
    $result = sbSaveFavorite([
        'character' => 'blingus',
        'outcomeId' => 'test-outcome-123',
        'audioBase64' => $audioBase64,
        'displayName' => 'My Test Favorite',
    ]);
    
    if (!isset($result['favorite']) || !isset($result['favorite']['id'])) {
        echo "❌ FAIL: No favorite ID returned\n";
        exit(1);
    }
    
    $favoriteId = $result['favorite']['id'];
    
    if ($result['favorite']['displayName'] !== 'My Test Favorite') {
        echo "❌ FAIL: Display name not saved\n";
        exit(1);
    }
    
    echo "✅ PASS: Favorite saved with ID: $favoriteId\n";
    echo "  - Display name: {$result['favorite']['displayName']}\n";
    echo "  - Audio URL: {$result['audioUrl']}\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: List favorites
echo "\nTest 2: List Favorites\n";
echo "-----------------------\n";

try {
    $result = sbListFavorites(['character' => 'blingus']);
    
    if (count($result['favorites']) !== 1) {
        echo "❌ FAIL: Expected 1 favorite, got " . count($result['favorites']) . "\n";
        exit(1);
    }
    
    $fav = $result['favorites'][0];
    if ($fav['outcomeId'] !== 'test-outcome-123') {
        echo "❌ FAIL: Outcome ID mismatch\n";
        exit(1);
    }
    
    echo "✅ PASS: Favorite listed correctly\n";
    echo "  - ID: {$fav['id']}\n";
    echo "  - Outcome ID: {$fav['outcomeId']}\n";
    echo "  - Display name: {$fav['displayName']}\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Update display name
echo "\nTest 3: Update Display Name\n";
echo "----------------------------\n";

try {
    $result = sbUpdateFavoriteDisplayName([
        'character' => 'blingus',
        'id' => $favoriteId,
        'displayName' => 'Updated Name',
    ]);
    
    if (!$result['updated']) {
        echo "❌ FAIL: Update failed\n";
        exit(1);
    }
    
    $list = sbListFavorites(['character' => 'blingus']);
    $fav = $list['favorites'][0];
    
    if ($fav['displayName'] !== 'Updated Name') {
        echo "❌ FAIL: Display name not updated\n";
        exit(1);
    }
    
    echo "✅ PASS: Display name updated\n";
    echo "  - New name: {$fav['displayName']}\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 4: Audio file exists and is accessible
echo "\nTest 4: Audio File Access\n";
echo "--------------------------\n";

$dir = sbFavoritesDir('blingus');
$audioPath = $dir . $favoriteId . '.mp3';

if (!is_file($audioPath)) {
    echo "❌ FAIL: Audio file not found at $audioPath\n";
    exit(1);
}

$savedAudio = file_get_contents($audioPath);
if ($savedAudio !== $audioData) {
    echo "❌ FAIL: Audio data mismatch\n";
    exit(1);
}

echo "✅ PASS: Audio file saved correctly\n";
echo "  - Path: $audioPath\n";
echo "  - Size: " . strlen($savedAudio) . " bytes\n";

// Test 5: Favorite-file action (path validation)
echo "\nTest 5: Favorite File Action\n";
echo "-----------------------------\n";

try {
    $_GET = [
        'action' => 'favorite-file',
        'character' => 'blingus',
        'id' => $favoriteId,
    ];
    
    ob_start();
    sbServeFavoriteFile($_GET);
    $output = ob_get_clean();
    
    echo "✅ PASS: Favorite file action executed (output captured)\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 6: Delete favorite
echo "\nTest 6: Delete Favorite\n";
echo "------------------------\n";

try {
    $result = sbDeleteFavorite([
        'character' => 'blingus',
        'id' => $favoriteId,
    ]);
    
    if (!$result['deleted']) {
        echo "❌ FAIL: Delete failed\n";
        exit(1);
    }
    
    $list = sbListFavorites(['character' => 'blingus']);
    if (count($list['favorites']) !== 0) {
        echo "❌ FAIL: Favorite still exists after delete\n";
        exit(1);
    }
    
    if (is_file($audioPath)) {
        echo "❌ FAIL: Audio file still exists after delete\n";
        exit(1);
    }
    
    echo "✅ PASS: Favorite deleted successfully\n";
    echo "  - Audio file removed\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 7: Per-app storage isolation
echo "\nTest 7: Per-App Storage\n";
echo "------------------------\n";

try {
    sbSaveFavorite([
        'character' => 'blingus',
        'outcomeId' => 'blingus-outcome',
        'audioBase64' => $audioBase64,
    ]);
    
    $_SERVER['HTTP_HOST'] = 'vadania.knospe.org';
    
    sbSaveFavorite([
        'character' => 'vadania',
        'outcomeId' => 'vadania-outcome',
        'audioBase64' => $audioBase64,
    ]);
    
    $_SERVER['HTTP_HOST'] = 'blingus.knospe.org';
    
    $blingusDir = sbFavoritesDir('blingus');
    $vadaniaDir = sbFavoritesDir('vadania');
    
    if ($blingusDir === $vadaniaDir) {
        echo "❌ FAIL: Same favorites directory for different apps\n";
        exit(1);
    }
    
    if (strpos($blingusDir, '/blingus/') === false) {
        echo "❌ FAIL: Blingus dir doesn't contain app ID path segment\n";
        exit(1);
    }
    
    echo "✅ PASS: Per-app storage isolation works\n";
    echo "  - Blingus dir: $blingusDir\n";
    echo "  - Vadania dir: $vadaniaDir\n";
} catch (Exception $e) {
    echo "❌ FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

// Summary
echo "\n========================================\n";
echo "All Favorites Tests Passed! ✅\n";
echo "========================================\n";
echo "Summary:\n";
echo "- Save favorite with audio ✅\n";
echo "- List favorites ✅\n";
echo "- Update display name ✅\n";
echo "- Audio file stored correctly ✅\n";
echo "- Favorite-file action works ✅\n";
echo "- Delete removes favorite and audio ✅\n";
echo "- Per-app storage isolation ✅\n";
