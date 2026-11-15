<?php
/**
 * Favorites + per-app exchange tests. Temp dirs only; TTS is mocked and must never be called.
 * Run: php test/test-favorites.php
 */
$root = sys_get_temp_dir() . '/sb-fav-test-' . bin2hex(random_bytes(4));
$exchange = $root . '-exchange';
mkdir($root, 0755, true);
foreach (['blingus', 'galen', 'vadania', 'brawn', 'puck'] as $app) {
    mkdir($exchange . '/inbox/' . $app, 0770, true);
}
putenv('SOUNDBOARD_DIR=' . $root);
putenv('SOUNDBOARD_EXCHANGE_DIR=' . $exchange);
$_SERVER['HTTP_HOST'] = 'puck.knospe.org';

$GLOBALS['ttsCalls'] = 0;
function sbGenerateSpeech($text, $voice) {
    $GLOBALS['ttsCalls']++;
    throw new Exception('TTS must not be called in these tests');
}
require_once __DIR__ . '/../api/soundboard.php';

register_shutdown_function(function () use ($root, $exchange) {
    foreach ([$root, $exchange] as $dir) {
        if (!is_dir($dir)) continue;
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($it as $f) { $f->isDir() ? rmdir($f->getPathname()) : unlink($f->getPathname()); }
        rmdir($dir);
    }
});

$fail = 0;
function check($cond, $msg) {
    global $fail;
    echo ($cond ? "  ok   " : "  FAIL ") . $msg . "\n";
    if (!$cond) $fail++;
}
function throws($fn) { try { $fn(); return false; } catch (Throwable $e) { return true; } }

echo "Host -> app id\n";
foreach (['blingus.knospe.org' => 'blingus', 'vadania.knospe.org' => 'vadania', 'brawn.knospe.org' => 'brawn',
          'bruck.knospe.org' => 'brawn', 'puck.knospe.org:443' => 'puck', 'evil-puck.example' => 'blingus', '' => 'blingus'] as $h => $want) {
    $_SERVER['HTTP_HOST'] = $h;
    check(sbAppIdFromHost() === $want, "$h -> $want");
}
$_SERVER['HTTP_HOST'] = 'puck.knospe.org';

echo "Default voices\n";
check(sbCharacterVoice('blingus') === 'NJf2N7XT2iBE8xJ0XHlo', 'blingus unchanged');
check(sbCharacterVoice('vadania') === '9O1whMWG8xvHut3tc0HB', 'vadania');
check(sbCharacterVoice('bruck') === 'bEkOilmQ8FPV078ZTGFo', 'bruck (brawn)');
check(sbCharacterVoice('puck') === 'Bx8c7yYtFWUdHzKnzHgT', 'puck');

echo "Inbox allowlist, no auto-create\n";
check(throws(fn() => sbInboxDir('evil')), 'unknown app rejected');
check(throws(fn() => sbInboxDir('../x')), 'path app rejected');
rmdir($exchange . '/inbox/vadania');
check(throws(fn() => sbInboxDir('vadania')) && !is_dir($exchange . '/inbox/vadania'), 'missing inbox not created');
mkdir($exchange . '/inbox/vadania', 0770);

echo "Text-only favorite (no audio, no TTS)\n";
$r = sbSaveFavorite(['character' => 'puck', 'text' => 'Glitter is a lifestyle.']);
check($r['created'] === true && $r['favorite']['audioFile'] === null && $r['favorite']['text'] === 'Glitter is a lifestyle.', 'saved text-only');
$id = $r['favorite']['id'];
$r2 = sbSaveFavorite(['character' => 'puck', 'text' => 'Glitter is a lifestyle.']);
check($r2['created'] === false && $r2['favorite']['id'] === $id, 'duplicate text returns existing');
check(count(sbListFavorites('puck')) === 1, 'list has 1');

echo "Favorite with cached audio attaches later\n";
$mp3 = str_repeat("\xFF\xFB\x90\x00", 10);
$r3 = sbSaveFavorite(['character' => 'puck', 'text' => 'Glitter is a lifestyle.', 'audioBase64' => base64_encode($mp3), 'mime' => 'audio/mpeg']);
check($r3['favorite']['audioFile'] === 'fav-' . $id . '.mp3' && is_file($root . '/puck/fav-' . $id . '.mp3'), 'audio attached to existing favorite (small audio allowed)');

echo "Rename / delete\n";
sbUpdateFavoriteDisplayName(['character' => 'puck', 'id' => $id, 'displayName' => 'Sparkle']);
check(sbListFavorites('puck')[0]['displayName'] === 'Sparkle', 'renamed');
sbUpdateFavoriteDisplayName(['character' => 'puck', 'id' => $id, 'displayName' => '']);
check(sbListFavorites('puck')[0]['displayName'] === null, 'cleared name');
check(throws(fn() => sbUpdateFavoriteDisplayName(['character' => 'puck', 'id' => '../../etc', 'displayName' => 'x'])), 'bad id rejected');

echo "Export favorites + clip into bundle, send to galen\n";
$res = sbSendToApp(['character' => 'puck', 'clipIds' => [], 'favoriteIds' => [$id], 'targetApp' => 'galen']);
$bundle = json_decode(file_get_contents($exchange . '/inbox/galen/' . $res['bundleId'] . '.json'), true);
check($bundle['sourceApp'] === 'puck', 'sourceApp puck');
$c = $bundle['clips'][0];
check($c['type'] === 'favorite' && $c['kind'] === 'speech' && $c['text'] === 'Glitter is a lifestyle.' && $c['audioBase64'] === base64_encode($mp3), 'Galen-compatible favorite entry with audio');
check(throws(fn() => sbSendToApp(['character' => 'puck', 'favoriteIds' => [$id], 'targetApp' => 'nope'])), 'unknown target rejected');

sbDeleteFavorite(['character' => 'puck', 'id' => $id]);
check(count(sbListFavorites('puck')) === 0 && !is_file($root . '/puck/fav-' . $id . '.mp3'), 'deleted with audio');

echo "Import Galen bundle into this site's inbox (vadania host)\n";
$_SERVER['HTTP_HOST'] = 'vadania.knospe.org';
$galen = ['format' => 'knospe-soundboard-clips', 'version' => 1, 'sourceApp' => 'galen', 'clips' => [
    ['type' => 'favorite', 'kind' => 'speech', 'name' => 'Oath', 'displayName' => 'Oath', 'text' => 'By the light!', 'voiceId' => null,
     'tags' => ['category' => 'Favorites', 'icon' => '⭐'], 'mime' => null, 'audioBase64' => null, 'sourceId' => 'galen-fav-aaaaaaaaaaaa'],
    ['type' => 'custom', 'kind' => 'audio', 'name' => 'Bell', 'tags' => ['category' => 'Your clips', 'icon' => '🔔'],
     'mime' => 'audio/mpeg', 'audioBase64' => base64_encode($mp3), 'sourceId' => 'galen-clip-bbbbbbbbbbbb'],
]];
$bid = str_repeat('a', 32);
file_put_contents($exchange . '/inbox/vadania/' . $bid . '.json', json_encode($galen));
file_put_contents($exchange . '/inbox/blingus/' . str_repeat('b', 32) . '.json', json_encode($galen));
$inc = sbListIncoming(sbAppIdFromHost());
check(count($inc) === 1 && $inc[0]['bundleId'] === $bid, 'vadania sees only its own inbox');
$imp = sbImportIncoming(['character' => 'vadania', 'bundleId' => $bid]);
check($imp['imported'] === 2 && $imp['favorites'] === 1 && empty($imp['errors']), 'imported favorite (text-only) + audio clip');
check(!is_file($exchange . '/inbox/vadania/' . $bid . '.json'), 'bundle removed after full success');
check(is_file($exchange . '/inbox/blingus/' . str_repeat('b', 32) . '.json'), 'blingus inbox untouched');
check(throws(fn() => sbImportIncoming(['character' => 'vadania', 'bundleId' => str_repeat('b', 32)])), 'cannot import another site\'s bundle');
$favs = sbListFavorites('vadania');
check(count($favs) === 1 && $favs[0]['text'] === 'By the light!' && $favs[0]['sourceApp'] === 'galen', 'favorite stored with text');
$clips = sbListClips('vadania');
check(count($clips) === 1 && $clips[0]['icon'] === '🔔', 'audio clip stored with icon');

echo "Bundle kept when a clip fails\n";
$bad = $galen;
$bad['clips'] = [['type' => 'custom', 'kind' => 'audio', 'name' => 'Broken', 'mime' => 'audio/mpeg', 'audioBase64' => '!!notbase64', 'sourceId' => 'x1']];
$bid2 = str_repeat('c', 32);
file_put_contents($exchange . '/inbox/vadania/' . $bid2 . '.json', json_encode($bad));
$imp2 = sbImportIncoming(['character' => 'vadania', 'bundleId' => $bid2]);
check(!empty($imp2['errors']) && is_file($exchange . '/inbox/vadania/' . $bid2 . '.json'), 'failed bundle kept for retry');

echo "Download filename header helper\n";
check(sbDownloadFileName('Sad Trombone', '/x/abc.mp3') === ['Sad Trombone.mp3', 'Sad Trombone.mp3'], 'plain name');
check(sbDownloadFileName('../../etc/pa"ss\\wd', '/x/a.m4a')[0] === '....etcpasswd.m4a' || strpos(sbDownloadFileName('../../etc/pa"ss\\wd', '/x/a.m4a')[0], '/') === false, 'no slashes/quotes');
check(sbDownloadFileName('Blade ⚔️', '/x/a.mp3') === ['Blade.mp3', 'Blade ⚔️.mp3'], 'emoji kept in utf-8 name only');
check(sbDownloadFileName('', '/x/a.mp3')[0] === 'clip.mp3', 'empty -> clip');

check($GLOBALS['ttsCalls'] === 0, 'no TTS calls');
echo $fail === 0 ? "\nALL PASSED\n" : "\n$fail FAILED\n";
exit($fail === 0 ? 0 : 1);
