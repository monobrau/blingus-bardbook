<?php
/**
 * Test cleanVoiceId function from api/speak.php
 */

function cleanVoiceId($raw) {
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

$cases = [
    ['NJf2N7XT2iBE8xJ0XHlo', 'NJf2N7XT2iBE8xJ0XHlo'],
    ['  NJf2N7XT2iBE8xJ0XHlo  ', 'NJf2N7XT2iBE8xJ0XHlo'],
    ['"NJf2N7XT2iBE8xJ0XHlo"', 'NJf2N7XT2iBE8xJ0XHlo'],
    ["'NJf2N7XT2iBE8xJ0XHlo'", 'NJf2N7XT2iBE8xJ0XHlo'],
    ['https://elevenlabs.io/app/voices?voiceId=NJf2N7XT2iBE8xJ0XHlo', 'NJf2N7XT2iBE8xJ0XHlo'],
    ['https://elevenlabs.io/app/voice/NJf2N7XT2iBE8xJ0XHlo', 'NJf2N7XT2iBE8xJ0XHlo'],
    ['elevenlabs.io/voice/NJf2N7XT2iBE8xJ0XHlo', 'NJf2N7XT2iBE8xJ0XHlo'],
    ['', ''],
    ['invalid', ''],
];

$pass = 0;
$fail = 0;
foreach ($cases as [$input, $expected]) {
    $result = cleanVoiceId($input);
    if ($result === $expected) {
        $pass++;
        echo "✓ cleanVoiceId('$input') = '$result'\n";
    } else {
        echo "✗ FAIL: cleanVoiceId('$input') = '$result', expected '$expected'\n";
        $fail++;
    }
}
echo "\n$pass passed, $fail failed\n";
exit($fail === 0 ? 0 : 1);
