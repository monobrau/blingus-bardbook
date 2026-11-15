<?php
/**
 * One shared map of per-character default ElevenLabs voices, used by
 * speak.php (outcome-card Speak) and soundboard.php (speech clips).
 * A voice ID pasted in Settings still overrides these.
 */

if (!function_exists('knospeCharacterVoices')) {
    function knospeCharacterVoices() {
        return [
            'blingus' => 'NJf2N7XT2iBE8xJ0XHlo',
            'vadania' => '9O1whMWG8xvHut3tc0HB',
            'bruck' => 'bEkOilmQ8FPV078ZTGFo',
            'brawn' => 'bEkOilmQ8FPV078ZTGFo',
            'puck' => 'Bx8c7yYtFWUdHzKnzHgT',
        ];
    }

    /** Character a host is locked to (matches index.php), or '' for unlocked hosts. */
    function knospeHostCharacter($host = null) {
        $host = strtolower(preg_replace('/:\d+$/', '', (string) ($host ?? ($_SERVER['HTTP_HOST'] ?? ''))));
        $map = [
            'blingus.knospe.org' => 'blingus',
            'vadania.knospe.org' => 'vadania',
            'brawn.knospe.org' => 'bruck',
            'bruck.knospe.org' => 'bruck',
            'puck.knospe.org' => 'puck',
        ];
        return $map[$host] ?? '';
    }

    /**
     * Model per character voice. Brawn's voice was made with Voice Design v3, which only
     * sounds right on eleven_v3; on eleven_multilingual_v2 it comes out as a generic British male.
     * '' means the default model.
     */
    function knospeCharacterModel($character) {
        $models = [
            'bruck' => 'eleven_v3',
            'brawn' => 'eleven_v3',
        ];
        $character = strtolower(trim((string) $character));
        return $models[$character] ?? '';
    }

    function knospeCharacterVoice($character) {
        $voices = knospeCharacterVoices();
        $character = strtolower(trim((string) $character));
        return $voices[$character] ?? '';
    }
}
