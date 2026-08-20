<?php
/**
 * Generate Blingus outcome lines via Anthropic Claude.
 * API key from ANTHROPIC_API_KEY env or api/.anthropic_key (never commit the key file).
 */

$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://blingus.knospe.org',
    'http://blingus.knospe.org',
    'https://bardbook.knospe.org',
    'http://bardbook.knospe.org',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$localOrigin = (bool) preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
if (in_array($origin, $allowedOrigins, true) || $localOrigin) {
    header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : 'http://127.0.0.1'));
} else {
    header('Access-Control-Allow-Origin: ' . ($allowedOrigins[0] ?? '*'));
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'POST required']);
    exit;
}

function jsonFail($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function loadAnthropicKey() {
    $key = getenv('ANTHROPIC_API_KEY') ?: '';
    if ($key !== '') {
        return trim($key);
    }
    $file = __DIR__ . '/.anthropic_key';
    if (is_readable($file)) {
        return trim((string) file_get_contents($file));
    }
    return '';
}

$anthropicKey = loadAnthropicKey();
if ($anthropicKey === '') {
    jsonFail('Anthropic API key not configured on server', 503);
}

$blingusApiKey = getenv('BLINGUS_API_KEY') ?: '';
if ($blingusApiKey !== '') {
    $provided = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $provided, $m)) {
        $provided = $m[1];
    } else {
        $provided = $_GET['key'] ?? '';
    }
    if ($provided === '' || !hash_equals($blingusApiKey, $provided)) {
        jsonFail('Unauthorized', 401);
    }
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '', true);
if (!is_array($body)) {
    jsonFail('Invalid JSON body');
}

$scene = trim((string) ($body['scene'] ?? ''));
$setting = strtolower(trim((string) ($body['setting'] ?? '')));
if (!in_array($setting, ['indoors', 'outdoors', ''], true)) {
    $setting = '';
}
$weather = strtolower(trim((string) ($body['weather'] ?? '')));
$lighting = strtolower(trim((string) ($body['lighting'] ?? '')));
$environmentRaw = $body['environment'] ?? [];
$environment = [];
if (is_array($environmentRaw)) {
    foreach ($environmentRaw as $item) {
        if (!is_string($item)) {
            continue;
        }
        $item = trim($item);
        if ($item !== '' && strlen($item) <= 40) {
            $environment[] = $item;
        }
    }
    $environment = array_values(array_unique($environment));
    $environment = array_slice($environment, 0, 8);
}
$outcome = trim((string) ($body['outcome'] ?? ''));
$attackType = strtolower(trim((string) ($body['attackType'] ?? '')));
$allowedAttackTypes = ['slash', 'pierce', 'blunt', 'magic', ''];
if (!in_array($attackType, $allowedAttackTypes, true)) {
    $attackType = '';
}
$detail = trim((string) ($body['detail'] ?? ''));
$target = trim((string) ($body['target'] ?? 'any'));
$name = trim((string) ($body['name'] ?? ''));
if (strlen($name) > 80) {
    $name = substr($name, 0, 80);
}
$intent = trim((string) ($body['intent'] ?? ''));
if (strlen($intent) > 80) {
    $intent = substr($intent, 0, 80);
}
$partyMemberFlag = !empty($body['partyMember']);
$personality = trim((string) ($body['personality'] ?? ''));
$speakerId = strtolower(trim((string) ($body['speakerId'] ?? '')));
if (!in_array($speakerId, ['blingus', 'vadania', 'bruck', 'puck'], true)) {
    $speakerId = '';
}
$isBlingus = ($speakerId === 'blingus');
$mood = strtolower(trim((string) ($body['mood'] ?? '')));
$moodPrompt = trim((string) ($body['moodPrompt'] ?? ''));
if (strlen($mood) > 40) {
    $mood = substr($mood, 0, 40);
}
if (strlen($moodPrompt) > 400) {
    $moodPrompt = substr($moodPrompt, 0, 400);
}
$count = (int) ($body['count'] ?? 5);
$combatRound = !empty($body['combatRound']) || (($body['pace'] ?? '') === 'battle');
$pace = strtolower(trim((string) ($body['pace'] ?? '')));
if ($pace !== 'battle' && $pace !== 'roleplay') {
    $pace = $combatRound ? 'battle' : 'roleplay';
}
$allowParody = !empty($body['allowParody']);
$forceParody = !empty($body['forceParody']) && $allowParody;
$castResult = strtolower(trim((string) ($body['castResult'] ?? '')));
if ($castResult !== 'success' && $castResult !== 'failure' && $castResult !== 'mixed' && $castResult !== 'na') {
    $castResult = '';
}
$spellTargets = strtolower(trim((string) ($body['spellTargets'] ?? '')));
if ($spellTargets !== 'multi' && $spellTargets !== 'single') {
    $spellTargets = '';
}
$spellKind = strtolower(trim((string) ($body['spellKind'] ?? '')));
if (!in_array($spellKind, ['attack', 'save', 'damage', 'other'], true)) {
    $spellKind = '';
}
$characterBlock = trim((string) ($body['characterBlock'] ?? ''));
if (strlen($characterBlock) > 5000) {
    $characterBlock = substr($characterBlock, 0, 5000);
}
$kitMatch = trim((string) ($body['kitMatch'] ?? ''));
if (strlen($kitMatch) > 800) {
    $kitMatch = substr($kitMatch, 0, 800);
}
$rating = strtolower(trim((string) ($body['rating'] ?? '')));
$allowedRatings = ['g', 'pg', 'pg-13', 'r', 'x'];
if (!in_array($rating, $allowedRatings, true)) {
    $rating = '';
}

/** Blingus table roster — matching names unlock raunchy party mode. */
$partyRoster = [
    'blingus',
    'brawn',
    "brawn o'neil",
    "brawn o'neal",
    'puck',
    'puck pinewhistle',
    'puke',
    'vandan',
    'vadania',
    'vadania amakiir',
    'bo',
    'van damme',
    'vandamme',
];

/** Table-known hooks only (from session notes). No unrevealed module spoilers. */
$partyFlavorByKey = [
    'blingus' => 'Self-roast welcome. L5 Lore fairy bard: vanity, name-amnesia, two daggers and a shortbow, fly speed, Cutting Words, Sir Whats-his-face energy. Fairy-twin insult bit with Puck: they often impersonate each other and say nasty, perverted things about "themselves" in first person. Honor the rating.',
    'puck' => 'Fellow fairy Wild Magic sorcerer. Sparkles, twin-spell mischief, affectionate "Puke" nickname ok, glitter and bad decisions. Flew up with Blingus to Sir Talavar. Do not invent that he cast the Loomlurch Scorching Ray. Fairy-twin insult bit with Blingus: they often impersonate each other and say nasty, perverted things about "themselves" in first person. Honor the rating.',
    'brawn' => 'Dwarven monk. Wears the Crown of Remembrance (Geoe: rare, attunement; holly and amber; +1 AC and saves; 1/day Action name Declan/Owen/Tristan: three allies within 20 ft get Advantage on next CON/DEX/WIS save before start of Brawn\'s next turn). Sundial answers the table used: Revenge / Reflex, a Fist / Fortitude, Words / Will. Drinks, thinks, swings. Lived the grappling chairs and the marching-band near-wipe. Sometimes, after horrific violence he did or watched, he says "Oh well!" like he is indifferent, sarcastic shrug-grin. Do not invent the violence.',
    'vadania' => 'Elven ranger Vadania Amakiir; the table casually calls them Vandan, Van Damme, or whatever feels right. Journal-steady bow-watcher. Checks doors twice, prods chests, got Scorching-Rayed during a mimic-chair fight. Trust scorched, not a bit. Vigilance was right. Do not name who cast the ray.',
    'bo' => 'NPC who brought the party together, not a player character. Toad-cauldron era, enlarge heroics, dragon breath at Granny Nightshade. Mentor. Closest thing Blingus has to family. Zybilna-silent warlock flavor when it fits. Toad jokes never die.',
];

function isPartyMemberName(string $name, array $roster): bool {
    $needle = strtolower(trim($name));
    if ($needle === '') {
        return false;
    }
    if (in_array($needle, $roster, true)) {
        return true;
    }
    $first = explode(' ', $needle, 2)[0];
    return in_array($first, $roster, true);
}

function partyFlavorKey(string $name): string {
    $needle = strtolower(trim($name));
    if ($needle === '') {
        return '';
    }
    if (str_contains($needle, 'brawn')) {
        return 'brawn';
    }
    if (str_contains($needle, 'puck') || $needle === 'puke') {
        return 'puck';
    }
    if (str_contains($needle, 'vandan') || str_contains($needle, 'vadania') || str_contains($needle, 'van damme') || $needle === 'vandamme') {
        return 'vadania';
    }
    if ($needle === 'bo' || str_starts_with($needle, 'bo ')) {
        return 'bo';
    }
    if (str_contains($needle, 'blingus')) {
        return 'blingus';
    }
    $first = explode(' ', $needle, 2)[0];
    return $first;
}

$isPartySubject = $partyMemberFlag || isPartyMemberName($name, $partyRoster);
if ($count < 1) {
    $count = 1;
}
if ($count > 8) {
    $count = 8;
}

$allowedOutcomes = [
    'roleplay', 'meanwhile', 'spell', 'hit', 'fail', 'success', 'failure',
    'battleCry', 'mockery', 'cuttingWords', 'trailCall', 'focus', 'surge',
    'insult', 'compliment', 'toast', 'motivation', 'introduction', 'feyGambit',
    'paulHarvey', 'productPlacement', 'infomercial', 'wrongSoundtrack',
    'pharmaAd', 'confessional', 'cliffhanger', 'standup', 'roast', 'troyMcClure',
    'showtime', 'closer', 'inspiration', 'songOfRest', 'healBuff', 'flirt',
    'graffiti', 'travelBanter', 'rally', 'downed',
    'eulogy', 'yelpReview', 'previouslyOn', 'natureDoc',
];
$speechOutcomes = [
    'battleCry', 'mockery', 'cuttingWords', 'trailCall', 'focus', 'surge',
    'insult', 'compliment', 'toast', 'motivation', 'introduction', 'feyGambit',
    'paulHarvey', 'productPlacement', 'infomercial', 'wrongSoundtrack',
    'pharmaAd', 'confessional', 'cliffhanger', 'standup', 'roast', 'troyMcClure',
    'showtime', 'closer', 'inspiration', 'songOfRest', 'healBuff', 'flirt',
    'graffiti', 'travelBanter', 'rally', 'downed',
    'eulogy', 'yelpReview', 'previouslyOn', 'natureDoc',
];
$detailOutcomes = ['hit', 'fail', 'success', 'failure', 'spell'];

if ($scene === '' || !in_array($outcome, $allowedOutcomes, true)) {
    jsonFail('Missing or invalid scene/outcome');
}
if (in_array($outcome, $detailOutcomes, true) && $detail === '') {
    jsonFail('Missing weapon, spell, or skill');
}
if (in_array($outcome, ['hit', 'fail'], true) && $attackType === '') {
    jsonFail('Missing attack type (slash, pierce, blunt, or magic)');
}
if ($personality === '') {
    jsonFail('Personality text is required');
}

$outcomeLabels = [
    'roleplay' => 'Roleplay action (a directed beat the player chose to do)',
    'meanwhile' => $isBlingus
        ? 'Meanwhile / idle beat (the DM asked what Blingus is doing; the player had no plan)'
        : 'Meanwhile / idle beat (the DM asked what this character is doing; the player had no plan)',
    'spell' => 'Spell cast (the speaker is casting the named spell on purpose; not a skill check and not a weapon crit)',
    'hit' => 'Critical hit description',
    'fail' => 'Critical fail description',
    'success' => 'Skill check success',
    'failure' => 'Skill check failure',
    'battleCry' => 'Battle cry (short shouted line before or during a fight)',
    'mockery' => 'Vicious Mockery (the spoken cantrip the player will deliver at the table)',
    'insult' => 'Insult (witty verbal jab, not the cantrip)',
    'compliment' => $isBlingus
        ? 'Compliment (warm but Blingus-flavored praise)'
        : 'Compliment (warm, in this character\'s voice)',
    'toast' => 'Raised-glass toast the player can speak at the table',
    'motivation' => $isBlingus
        ? 'Motivational speech the player can deliver at the table (pep talk, rally, Bardic Inspiration energy)'
        : 'Motivational speech the player can deliver at the table (pep talk or rally in this character\'s voice)',
    'introduction' => 'Chaucer-style herald introduction (ornate party/NPC presentation)',
    'cuttingWords' => 'Cutting Words (Lore reaction: spoken barb that subtracts a BI die from a seen creature\'s attack, check, or damage)',
    'trailCall' => 'Ranger trail call (spoken warning, mark, or hunt cue the player can read aloud)',
    'focus' => 'Monk Focus beat (ki/Focus spend: Flurry, Stunning Strike, Patient Defense, or Step of the Wind)',
    'surge' => 'Wild Magic surge beat (the weave pops; do not invent a full surge table unless the situation says the spark jumped)',
    'feyGambit' => 'Fey gambit (a bluff that the mark is bound by fairy custom: rule of three, reciprocity, true-name, octave)',
    'paulHarvey' => 'Paul Harvey recap (radio newsman closer: and now you know the rest of the story)',
    'productPlacement' => 'Product placement (sudden sponsor read / brand deal, fourth wall)',
    'infomercial' => 'Infomercial pitch (but wait, there is more; operators standing by)',
    'wrongSoundtrack' => 'Wrong soundtrack (starts the wrong genre and will not apologize)',
    'eulogy' => 'Eulogy (remembrance speech for the named dead or the empty chair; not a toast)',
    'yelpReview' => 'Yelp review (stars, service, bathrooms, would not stay again)',
    'previouslyOn' => 'Season recap / previously on (table-known beats only, no unpublished spoilers)',
    'natureDoc' => 'Nature-doc whisper (hushed wildlife narration; the party or mark is the footage)',
    'pharmaAd' => 'Pharma ad (warm benefit pitch, then a deadpan side-effect rattle from the REAL spell/item, then ask-your-cleric)',
    'confessional' => 'Reality-show confessional (talking head to an unseen camera; his version contradicts what the table saw)',
    'cliffhanger' => 'Cliffhanger (Dukes of Hazzard balladeer freeze-frame: heap of trouble, we will be right back)',
    'standup' => 'Standup (one-sentence vaudeville chestnut about THIS scene; punch last)',
    'roast' => 'Comedy-club roast (a bit, not a one-liner; not Insult and not Vicious Mockery)',
    'troyMcClure' => 'Troy McClure credit-reel intro (you might remember me from such [category] as [title] and [title])',
    'showtime' => 'Showtime (opens a performance and introduces himself to the actual audience; not Chaucer Intro)',
    'closer' => 'Closer (good-night / walk-off; opposite of Showtime)',
    'inspiration' => 'Bardic Inspiration spend (spoken line to the named recipient; not Motivational Speech and not Cutting Words)',
    'songOfRest' => 'Song of Rest (short-rest recovery song; not a Meanwhile tune-up)',
    'healBuff' => 'Heal / Buff verbal component (Healing Word or the Detail-named buff; one breath)',
    'flirt' => 'Flirt / pickup / dedication (not a Compliment)',
    'graffiti' => 'Graffiti (written tag, 2-8 words; not spoken)',
    'travelBanter' => 'Travel banter (overworld companion bark while walking; not Meanwhile, not Nature Doc)',
    'rally' => 'Rally (cinematic pre-battle oratory; not Motivational Speech, not Battle Cry)',
    'downed' => 'Last Breath (speaker is at 0 HP; not a Eulogy or Obituary; do not kill party members)',
];

$detailNote = $detail !== '' ? $detail : '(none)';
$attackTypeNote = $attackType !== '' ? $attackType : '(n/a)';
$settingNote = $setting !== '' ? $setting : '(unspecified)';
$weatherNote = $weather !== '' ? $weather : '(unspecified)';
$lightingNote = $lighting !== '' ? $lighting : '(unspecified)';
$environmentNote = count($environment) ? implode(', ', $environment) : '(none specified)';
$targetTypes = array_values(array_filter(array_map('trim', explode(',', $target)), static function ($part) {
    return $part !== '' && strtolower($part) !== 'any';
}));
$isMultiSpell = $spellTargets === 'multi';
$spellKindNote = [
    'attack' => 'spell attack roll',
    'save' => 'saving throw',
    'damage' => 'damage with no spell attack roll',
    'other' => 'heal / utility (no attack roll)',
][$spellKind] ?? '(n/a)';
$spellTargetsNote = $isMultiSpell
    ? 'multi (area / several creatures; no headcounts)'
    : ($spellTargets === 'single' ? 'single target' : '(n/a)');
if (!$targetTypes) {
    $targetNote = $isMultiSpell
        ? 'unspecified creatures in the area (do not invent a headcount)'
        : 'any / unspecified';
} elseif (count($targetTypes) > 1) {
    $targetNote = ($isMultiSpell
        ? 'these kinds in the area (include each kind; do not say how many of each): '
        : 'include each of these foci in every line (do not invent a headcount): ')
        . implode(', ', $targetTypes);
} elseif ($isMultiSpell) {
    $targetNote = 'this kind in the area (do not invent a headcount): ' . $targetTypes[0];
} else {
    $targetNote = $targetTypes[0];
}
$nameNote = $name !== '' ? $name : '(no specific name)';
$intentNote = $intent !== '' ? $intent : '(none)';
$castResultNote = $castResult === 'success'
    ? ($isMultiSpell
        ? 'They fail the save. Apply THIS spell\'s failed-save result (full damage, condition lands, etc.). Multi-target: do not name how many fail.'
        : 'They fail the save. Apply THIS spell\'s failed-save result (full damage, condition lands, etc.).')
    : ($castResult === 'failure'
        ? ($isMultiSpell
            ? 'They make the save. Apply THIS spell\'s successful-save result (half damage for Fireball/Thunderwave/Shatter; no effect for Faerie Fire/Bane; whatever the real spell says). Multi-target: do not name how many make it.'
            : 'They make the save. Apply THIS spell\'s successful-save result (half damage, no effect, or reduced effect — the real spell, not a generic fizzle).')
        : ($castResult === 'mixed'
            ? 'Mixed saves: some fail and some make it. Apply THIS spell\'s fail result to those who fail and its success result to those who make it. Show BOTH. Do not name how many.'
            : ($castResult === 'na'
                ? 'N/A: no save result given. If THIS spell has no save (Magic Missile, Cloud of Daggers), the effect just happens. If it has a save, do not invent who passed or failed.'
                : '(n/a)')));

$ratingGuides = [
    'g' => $isBlingus
        ? 'CONTENT RATING G (ACTIVE, overrides mood and party-raunch for adult content): All-ages family table. No sexual content, no innuendo, no crude slang, no graphic gore. Violence stays cartoon slapstick. Keep Blingus theatrical and funny without dirty jokes. A "lewd" mood at G is playful charm only.'
        : 'CONTENT RATING G (ACTIVE, overrides mood and party-raunch for adult content): All-ages family table. No sexual content, no innuendo, no crude slang, no graphic gore. Violence stays cartoon slapstick. Stay funny in THIS character\'s voice without dirty jokes. A "lewd" mood at G is playful charm only.',
    'pg' => 'CONTENT RATING PG (ACTIVE, overrides mood and party-raunch for adult content): Mild adventure table. Light language (darn, heck, occasional damn). The faintest wink of innuendo is the ceiling. No explicit sex, no graphic anatomy, no bedroom jokes. Violence stays PG action.',
    'pg-13' => 'CONTENT RATING PG-13 (ACTIVE, overrides mood and party-raunch for adult content): Typical teen D&D table. Suggestive innuendo, damn/hell/ass, implied adult situations are fine. No explicit sex acts, no graphic anatomy, no porn-narration. Do not escalate to R.',
    'r' => 'CONTENT RATING R (ACTIVE): Explicit sexual jokes, strong language, and crude body humor are welcome. Still a funny in-world table line, not a sex scene. Rated R table banter. Do not sanitize to PG-13.',
    'x' => $isBlingus
        ? 'CONTENT RATING X (ACTIVE): No ceiling. Graphic sexual content, filthy language, explicit acts, NC-17. Still characterful Blingus, not a medical manual. Do not sanitize or fade to black.'
        : 'CONTENT RATING X (ACTIVE): No ceiling. Graphic sexual content, filthy language, explicit acts, NC-17. Still this character, not a medical manual. Do not sanitize or fade to black.',
];

$ratingBlock = '';
$ratingNote = 'unset (use table default: party members get raunch; others follow mood)';
if ($rating !== '') {
    $ratingNote = strtoupper($rating);
    $ratingGuide = $ratingGuides[$rating];
    $ratingBlock = <<<RATE

CONTENT RATING (mandatory for every line in this batch):
Rating: {$ratingNote}
{$ratingGuide}
- Honor this rating even if mood is lewd, flirty, or petty, and even if the subject is a party member.
- Do not exceed this rating. Do not ignore it.
RATE;
}

$partyModeBlock = '';
$partySubjectNote = 'no';
if ($isPartySubject && $name !== '') {
    $partySubjectNote = $rating !== ''
        ? 'yes — party member; honor the content rating for adultness'
        : 'yes — use party raunch mode';
    $partyAdult = $rating !== ''
        ? "- Adultness comes from the CONTENT RATING above, not from this party block. Do not escalate past that rating just because the subject is a PC.\n"
        : ($isBlingus
            ? "- This table wants exceptionally raunchy, adult, filthy humor aimed at fellow PCs.\n- Lean hard into crude sexual innuendo, explicit jokes, bedroom/body humor, and shameless double entendres in Blingus's theatrical voice.\n- Do not sanitize, soften, or keep it PG-13. Rated R to NC-17 table banter is expected and welcome.\n"
            : "- This table wants exceptionally raunchy, adult, filthy humor aimed at fellow PCs.\n- Lean hard into crude sexual innuendo, explicit jokes, bedroom/body humor, and shameless double entendres in THIS character's voice.\n- Do not sanitize, soften, or keep it PG-13. Rated R to NC-17 table banter is expected and welcome.\n");
    $stayAs = $isBlingus ? 'Blingus' : 'this character';
    $partyModeBlock = <<<PARTYMODE

PARTY SUBJECT MODE (active — subject is a table party member):
{$partyAdult}- Still funny and characterful, not just shock for shock's sake. Stay in-world as {$stayAs}.
- Still obey no-em-dash / no-en-dash and JSON-array-only rules.
- Every line must clearly involve the named party member.
PARTYMODE;
    $flavorKey = partyFlavorKey($name);
    $flavor = $partyFlavorByKey[$flavorKey] ?? 'Use established table chemistry and in-jokes for this companion.';
    $partyModeBlock .= "\n- Every line must clearly involve {$name} by name.\n";
    $partyModeBlock .= "- Party-member flavor for {$name}: {$flavor}\n";
    $partyModeBlock .= "- Lean on table-known gags when they fit: toad-Bo, Crown of Remembrance, mimic chairs, Scorching Ray friendly fire, Stinky Court, mud muffins, Sir Whats-his-face, Sir Talavar, marching-band near-wipe, Granny in the oven, Mr. Witch and Mr. Light, Misplacer Beast, swan boat What is Joy dunk, Witch's watch pickpocket, Star the displacer cub, Jamie you beautiful bastard and Chris as well (do not invent who they are).\n";
}

$meanwhileHabits = [
    'blingus' => 'Hovering, tuning a clarinet/fiddle/pan flute, prestidigitation fidgets, eavesdropping, name-amnesia, watching chairs, looking pretty, snacking, nosing in a bag, humming, fussing with cloth wings.',
    'vadania' => 'Checking the back trail, counting arrows, restringing a bow, writing a few steady lines in a journal, prodding a too-easy latch, listening farther than the others.',
    'bruck' => 'Wrapping knuckles, stretching, sipping from a flask, counting breaths, planting both feet, cracking the neck, watching the door.',
    'puck' => 'Watching a spark crawl the fingers, listening for a surge, fussing the wings, humming something that wants to explode, sneezing glitter, making a bad plan look pretty.',
];
$meanwhileIdle = $meanwhileHabits[$speakerId] ?? 'An idle habit already in progress that fits THIS character\'s personality, not a bard bit.';
$meanwhileAsk = $isBlingus ? 'what is Blingus doing?' : 'what is this character doing?';
$firstPersonAs = $isBlingus ? 'as Blingus' : 'as this character';
$fairyRule = $isBlingus
    ? '- Fairy specifics: Small fey, airborne, vain, name-amnesia. Default kit is two daggers and a shortbow. If Detail names a different weapon or spell, use Detail. Do not invent 4th-level spells unless Detail names one, and do not fly in medium/heavy armor.'
    : '- Honor THIS character\'s race and class from the sheet. Do not give them Blingus\'s name-amnesia, clarinet, cloth wings, or Lore bard kit unless the sheet lists them.';
$brawnOhWellRule = ($speakerId === 'bruck')
    ? '- Brawn "Oh well": sometimes, after he does horrific violence or watches it done to someone else, he says "Oh well!" like he is indifferent, with a sarcastic shrug-grin. Do not invent that the violence happened unless the scene, Detail, or Name already has it. Not every line. Honor the content rating for how graphic it gets.'
    : '';
$bardSceneBan = $isBlingus
    ? ''
    : '- Do not write bard scene voice. No years of bardic training, bardic timing, bardic confidence, skipped rehearsal, second verse, encore, dropped lute, planned applause, sold tickets to a stunt show, or clarinet. This speaker is not a karaoke bard.';
$roleplayKitRule = $isBlingus
    ? '- Roleplay may fold in current HP, fairy flight, an instrument, or a feature when it naturally matters. Do not inventory-dump.'
    : '- Roleplay may fold in current HP or a feature from THIS sheet when it naturally matters. Do not inventory-dump and do not borrow Blingus\'s instruments.';
$complimentRule = $isBlingus
    ? '- Compliments: sincere-ish praise with Blingus vanity or backhanded warmth. In battle: one breath. Out of battle: a longer toast (3-5 sentences) is fine.'
    : '- Compliments: sincere-ish praise in THIS character\'s voice. In battle: one breath. Out of battle: a longer toast (3-5 sentences) is fine.';
$feyGambitRule = $isBlingus
    ? '- Fey gambit: Blingus is bluffing that fairy custom binds the mark. Lean on table-known bits only: rule of three, law of reciprocity, true-name bargains, octave / eight-day cycles. He is theatrical and self-aware; the joke is that he is selling mystique, not that the universe confirmed it. Do not invent unpublished Witchlight law or spoilers. If a Situation chip is set (Rule of three, Reciprocity, True-name bluff, Octave / eight-day cycle), use THAT gambit. Speakable at the table. Out of battle: 3-5 sentences.'
    : '- Fey gambit: this speaker is bluffing that fairy custom binds the mark. Lean on table-known bits only: rule of three, law of reciprocity, true-name bargains, octave / eight-day cycles. The joke is selling mystique, not that the universe confirmed it. Do not invent unpublished Witchlight law or spoilers. If a Situation chip is set (Rule of three, Reciprocity, True-name bluff, Octave / eight-day cycle), use THAT gambit. Speakable at the table. Out of battle: 3-5 sentences.';
$spokenAs = $isBlingus ? 'Blingus would say aloud' : 'this character would say aloud';
$classSpeechRule = '';
if ($outcome === 'mockery') {
    $classSpeechRule = '- Vicious Mockery: these lines ARE the cantrip. Write the exact words the speaker says as the verbal component, ready for the player to read aloud. First-person spoken roast, psychic sting, WIS-save flavor welcome. Do not narrate "I cast Vicious Mockery"; deliver the mockery itself. In battle: one breath. Out of battle: a longer cantrip delivery (3-5 sentences) is fine. Always aim at the named foe when given. This is not a generic insult.';
} elseif ($outcome === 'cuttingWords') {
    $classSpeechRule = '- Cutting Words: these lines ARE the Lore reaction the player speaks. Spend a Bardic Inspiration die to subtract from a seen creature\'s attack roll, ability check, or damage roll within 60 ft. Write the spoken barb, ready to read aloud. Do not narrate "I use Cutting Words." Do not add to an ally\'s roll (that is Bardic Inspiration). Do not add to AC (that is Valor Combat Inspiration). In battle: one breath. Out of battle: a longer barb (3-5 sentences) is fine. Aim at the named foe when given.';
} elseif ($outcome === 'introduction') {
    $classSpeechRule = '- Chaucer introductions: ornate herald-style presentation suitable to read aloud. In battle: one tight flourish. Out of battle: 3-5 sentences. Use "Behold", "Hark", "Presenting", or similar flourish. Invent flattering or teasing epithets. Do not spoil module plot.';
} elseif ($outcome === 'trailCall') {
    $classSpeechRule = '- Trail Call: a ranger spoken warning, mark, or hunt cue the player can read aloud. Not Vicious Mockery and not a herald intro. Name the focus when given. In battle: one breath. Out of battle: 3-5 sentences. If a Situation chip is set (Mark the target, Hold, Loose, Back trail), every line is that cue.';
} elseif ($outcome === 'focus') {
    $classSpeechRule = '- Focus: a monk ki/Focus beat the player can read or narrate. First person. Flurry of Blows, Stunning Strike, Patient Defense, or Step of the Wind if a Situation chip names one; otherwise a planted-stance Focus spend. Not a bard pep talk and not a spell. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'surge') {
    $classSpeechRule = '- Wild Surge: the weave pops around this sorcerer. If a Situation chip is set (Tides of Chaos, The spark jumps, Ride it, Don\'t ride it), use THAT beat. Do not invent a full random surge table unless the situation says the spark jumped. Not a bard line. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'feyGambit') {
    $classSpeechRule = $feyGambitRule;
} elseif ($outcome === 'paulHarvey') {
    $classSpeechRule = '- Paul Harvey: a radio newsman recap the player can read aloud. Cadence of "and now you know the rest of the story." Warm, grave, a little ad-break. Do not name Paul Harvey in the line. This is the recap bit, not Product Placement and not an infomercial. End like a closer. Table-known beats only; no unpublished spoilers. If a Situation chip is set, fold that closer in. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'productPlacement') {
    $classSpeechRule = '- Product Placement: a sudden sponsor read, as if there is an audience and a brand deal. Sincere, not a wink he is in on. The plug can be mundane (trail mix, rust-proof oil, a local inn) or world-changing (a hag, a god, the Tarrasque). Do not invent that the creature is present unless the scene or Name says so. This is not an infomercial and not Paul Harvey. If a Situation chip is set, use THAT kind of plug. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'infomercial') {
    $classSpeechRule = '- Infomercial: but wait, there is more. Operators standing by, free with purchase, as seen here. Pitch voice. This is not Product Placement and not Paul Harvey (those are already ads). If a Situation chip is set, use THAT pitch beat. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'wrongSoundtrack') {
    $classSpeechRule = '- Wrong soundtrack: he starts the wrong genre for this fight, crit, or rally and will not apologize. Keep going. Not a full karaoke verse unless Force Song Parody is on. If a Situation chip is set (Wrong genre, Keeps going, Battle hymn, Love song), use THAT beat. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'eulogy') {
    $classSpeechRule = $isBlingus
        ? '- Eulogy: a remembrance the player can read aloud. Not a toast (no glass required), not a compliment of one trait, not a Chaucer intro. Honor the named dead, the empty chair, or the fallen foe. Do not invent that someone died unless the scene, Name, or Situation says so. Table-known only. Theatrical and sincere. If a Situation chip is set, fold that occasion in. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Eulogy: a remembrance the player can read aloud. Not a toast (no glass required). Honor the named dead, the empty chair, or the fallen foe in THIS character\'s voice. Do not invent that someone died unless the scene, Name, or Situation says so. Table-known only. If a Situation chip is set, fold that occasion in. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'yelpReview') {
    $classSpeechRule = $isBlingus
        ? '- Yelp review: stars, service, bathrooms, would not stay again. Review an inn, tavern, dungeon, kitchen, shop, or hag cooking in play. First person, speakable. If a Situation chip is set, review THAT kind of place. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Yelp review: stars, service, would not stay again, in THIS character\'s voice. Review the place in play (inn, tavern, dungeon, kitchen, shop). If a Situation chip is set, review THAT kind of place. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'previouslyOn') {
    $classSpeechRule = $isBlingus
        ? '- Previously on: a season recap the player can read aloud after a rest, camp, morning-after, or when catching someone up. Table-known beats only. No unpublished Witchlight spoilers. TV recap energy. If a Situation chip is set, use THAT recap beat. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Recap: catch someone up on table-known beats only, in THIS character\'s voice. No unpublished Witchlight spoilers. If a Situation chip is set, use THAT recap beat. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'natureDoc') {
    $classSpeechRule = $isBlingus
        ? '- Nature doc: hushed Attenborough whisper. The party, the mark, or the room is wildlife. Sneaking, hovering, hiding, or eavesdropping energy. Speakable, low voice. If a Situation chip is set, use THAT footage. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Nature doc: hushed wildlife narration in THIS character\'s voice. The party, the mark, or the room is the footage. Not a karaoke bard bit. If a Situation chip is set, use THAT footage. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'pharmaAd') {
    $classSpeechRule = '- Pharma Ad: warm confident benefit pitch, then a fast deadpan list of alarming side effects drawn from the REAL properties of the spell or item in Detail or Name, then an ask-your-cleric tag (never "ask your doctor"). The side-effect rattle is the punchline. If Detail is empty, pitch a table-known potion or Healing Word, not a made-up product. If a Situation chip is set, use THAT beat. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'confessional') {
    $classSpeechRule = '- Confessional: reality-show talking head to an unseen camera. First person. His version contradicts what the table saw. Do not name the camera or the show. Table-known beats only. If a Situation chip is set, use THAT confession shape. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'cliffhanger') {
    $classSpeechRule = '- Cliffhanger: Dukes of Hazzard balladeer freeze-frame right before commercial. Heap of trouble, don\'t go away, we\'ll be right back. Rotate them / those kids / them Wayfarer kids / them two fairies / them fairy boys (Blingus and Puck only). Do not say "the party." This is NOT a sponsor read. Do not name the Dukes. If a Situation chip is set, use THAT closer. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'standup') {
    $classSpeechRule = '- Standup: one sentence, 8-14 words, punch last, no explain. Voice is vaudeville. Nouns must be D&D 5e and THIS scene. Scene IS the bit. Invent a new chestnut each line. Do not copy Take my wife / Waterdeep wings-tired verbatim. No real-world nightclub nouns (no planes, Cleveland, Vegas, mother-in-law, doctors). Not Insult, Showtime, or Toast. If a Situation chip is set, that is the engine, not a script. In battle and out: one breath.';
} elseif ($outcome === 'roast') {
    $classSpeechRule = $isBlingus
        ? '- Roast: a full-length comedy-club roast, not a one-liner. Target is the chosen Name/subject (ally, NPC, enemy, group, place, thing). Not Insult and not Vicious Mockery. If a Situation chip is set, use THAT roast frame. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Roast: a comedy-club roast in THIS character\'s voice, not a one-liner. Target is the chosen Name/subject. Not Insult. If a Situation chip is set, use THAT roast frame. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'troyMcClure') {
    $classSpeechRule = '- Troy McClure: celebrity credit-reel intro. Shape: Hi I am [speaker], you might remember me from such [category] as [title] and [title]. Fake D&D credits from table-known beats. Not Showtime, not Chaucer. Do not quote movie speeches or name Simpsons/Troy in the line. If a Situation chip is set, use THAT credit frame. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'showtime') {
    $classSpeechRule = '- Showtime: opens a performance and introduces himself to the actual audience or venue. Medium 2-4 sentences. Not Chaucer Intro (that presents other people). If a Situation chip is set, play THAT room. In battle: one breath. Out of battle: 2-4 sentences.';
} elseif ($outcome === 'closer') {
    $classSpeechRule = '- Closer: opposite of Showtime. Good-night, walk-off, last song, tip the jar. Not a eulogy. If a Situation chip is set, use THAT walk-off. In battle: one breath. Out of battle: 2-4 sentences.';
} elseif ($outcome === 'inspiration') {
    $classSpeechRule = '- Inspiration: spoken line when he spends a Bardic Inspiration die. Name is the recipient. Not Motivational Speech and not Cutting Words. First person, speakable. If a Situation chip is set, use THAT spend beat. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'songOfRest') {
    $classSpeechRule = '- Song of Rest: short-rest recovery song the player can read aloud. Not a Meanwhile tune-up and not Showtime. Soft, stay-down-and-listen. If a Situation chip is set, use THAT rest beat. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'healBuff') {
    $classSpeechRule = $isBlingus
        ? '- Heal / Buff: the verbal component while casting Healing Word or the Detail-named buff. One breath. First person. Do not invent a spell not on the sheet or in Detail. If a Situation chip is set, use THAT cast beat.'
        : '- Heal / Buff: the verbal component while casting Healing Word or the Detail-named buff, in THIS character\'s voice. One breath. Do not invent a spell not on the sheet or in Detail. If a Situation chip is set, use THAT cast beat.';
} elseif ($outcome === 'flirt') {
    $classSpeechRule = $isBlingus
        ? '- Flirt: pickup, dedication, or across-the-room line. Honor the humor slider and content rating. Not a Compliment (that is sincere praise). If a Situation chip is set, use THAT approach. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Flirt: pickup, dedication, or across-the-room line in THIS character\'s voice. Honor the humor slider and content rating. Not a Compliment. If a Situation chip is set, use THAT approach. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'graffiti') {
    $classSpeechRule = '- Graffiti: a written tag, 2-8 words. Not spoken. Rotate was-here, dirty rhymes, cryptic phrases, hearts/arrows, crude invitations. Honor the content rating. If a Situation chip is set, use THAT tag shape. Same length in battle and out.';
} elseif ($outcome === 'travelBanter') {
    $classSpeechRule = $isBlingus
        ? '- Travel Banter: overworld companion bark while walking. Random thought, fun fact (maybe wrong), Gold Box/SSI furniture (Attack or Wait/Flee, party travels), or BG1/2 bark cadence (we should rest, Sword Coast). One breath, 8-18 words. Not Meanwhile, not Nature Doc. Do not quote companion lines verbatim. No BG3 plot. No unpublished Witchlight. If a Situation chip is set, use THAT bark engine.'
        : '- Travel Banter: overworld companion bark while walking, in THIS character\'s voice. One breath, 8-18 words. Not Meanwhile, not Nature Doc. No unpublished Witchlight. If a Situation chip is set, use THAT bark engine.';
} elseif ($outcome === 'rally') {
    $classSpeechRule = $isBlingus
        ? '- Rally: cinematic pre-battle oratory (Wallace / Theoden / Aragorn shape: fear, what they fight for, rising shout). Distinct from Motivational Speech (pep talk) and Battle Cry (one mid-fight shout). Humor 1 can be sincere; humor 5 is a 3-foot fairy delivering Pelennor oratory. Do not quote movie speeches. If a Situation chip is set, use THAT oratory beat. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Rally: cinematic pre-battle oratory in THIS character\'s voice (fear, what they fight for, rising shout). Distinct from Motivational Speech and Battle Cry. Do not quote movie speeches. If a Situation chip is set, use THAT oratory beat. In battle: one breath. Out of battle: 3-5 sentences.';
} elseif ($outcome === 'downed') {
    $classSpeechRule = $isBlingus
        ? '- Last Breath: he is at 0 HP. A line from the floor. Not a Eulogy or Obituary. Do not kill party members. Do not invent that anyone else dropped unless Name says so. If a Situation chip is set, use THAT floor beat. In battle: one breath. Out of battle: 3-5 sentences.'
        : '- Last Breath: this speaker is at 0 HP. A line from the floor in THIS character\'s voice. Not a Eulogy. Do not kill party members. If a Situation chip is set, use THAT floor beat. In battle: one breath. Out of battle: 3-5 sentences.';
}
$motivationRule = $isBlingus
    ? '- Motivational speeches: a pep talk the player can read aloud. Not a toast (no glass required), not a battle cry (not just Charge), not a compliment of one trait. Theatrical and vain, but the point is to get them moving. Name / subject is the AUDIENCE. If it is a group (the party, the party and NPCs, a crowd, townsfolk, kids, militia, local allies, or a typed group), address that whole group in every line. Do not shrink a group audience to one person. If Name is one person, aim the speech at them; others may overhear. If a Situation chip is set, fold that occasion in. In battle: one breath. Out of battle: 3-5 sentences, still shoutable or speakable.'
    : '- Motivational speeches: a pep talk the player can read aloud. Not a toast (no glass required), not a battle cry (not just Charge), not a compliment of one trait. In THIS character\'s voice, but the point is to get them moving. Name / subject is the AUDIENCE. If it is a group, address that whole group in every line. If a Situation chip is set, fold that occasion in. In battle: one breath. Out of battle: 3-5 sentences, still shoutable or speakable.';
$battleCryRule = $isBlingus
    ? '- Battle cries: short, shoutable, 1-2 sentences max. Energetic, theatrical, first person or imperative.'
    : '- Battle cries: short, shoutable, 1-2 sentences max. Energetic, in THIS character\'s voice, first person or imperative.';
$targetFlavorKey = partyFlavorKey($name);
$fairyTwinInsult = (
    ($speakerId === 'blingus' && $targetFlavorKey === 'puck')
    || ($speakerId === 'puck' && $targetFlavorKey === 'blingus')
);
$fairyTwinInsultRule = '';
if ($fairyTwinInsult && in_array($outcome, ['insult', 'roast', 'mockery'], true)) {
    $asWho = ($targetFlavorKey === 'puck') ? 'Puck' : 'Blingus';
    $fairyTwinInsultRule = "\n- Fairy-twin insult bit (ACTIVE): a lot of the time you two do this. Pretend you ARE {$asWho}. Speak first person as {$asWho} and say nasty, perverted things about \"yourself\" (meaning {$asWho}). Honor the content rating. This is an impersonation roast, not you narrating as yourself.";
}
$detailKindBySpeaker = [
    'blingus' => 'weapon / bard spell / skill',
    'vadania' => 'weapon / ranger spell / skill',
    'bruck' => 'weapon / monk feature / skill',
    'puck' => 'weapon / sorcerer spell / skill',
];
$detailKind = $detailKindBySpeaker[$speakerId] ?? 'weapon / spell / skill';

$moodNote = $mood !== '' ? $mood : 'playful';
$moodGuide = $moodPrompt !== ''
    ? $moodPrompt
    : ($isBlingus
        ? 'Match a playful theatrical Blingus register unless the outcome type requires otherwise.'
        : 'Match this character\'s standing personality unless the outcome type requires otherwise.');

$sheetBlock = '';
if ($characterBlock !== '') {
    $sheetBlock = <<<SHEET

CURRENT CHARACTER SHEET (authoritative mechanical state):
{$characterBlock}
SHEET;
}
$kitMatchBlock = '';
if ($kitMatch !== '') {
    $kitMatchBlock = <<<KIT

ITEM IN PLAY FOR THIS BATCH (wizard Detail is authoritative):
{$kitMatch}
- Every combat line must be recognizably THIS item. Do not replace it with a different weapon or spell, even if the standing sheet lists something else.
- If this is a spell, honor the official D&D 2024 rules for THAT spell (save-for-half vs save-negates vs no save). Sheet notes are a hint; the published spell wins.
KIT;
}

$parodyRuleBlock = $allowParody
    ? '- OCCASIONAL SONG PARODY: in a minority of lines (about 0-1 per batch), Blingus may weave a recognizable song-parody snatch into the beat in his karaoke-bard style. Prefer well-known 80s/90s rap/hip-hop or karaoke classics the table would know on sight. Most lines stay unsung. When Force Song Parody is active, ignore this rarity and do every line.'
    : '- Do not write song parodies, karaoke hooks, or sung lyric snatches. This speaker is not a karaoke bard.';

$forceParodyBlock = '';
if ($forceParody) {
    $forceParodyBlock = <<<'PARODY'

FORCE SONG PARODY MODE (ACTIVE, overrides the occasional parody rule):
- EVERY line in this batch MUST weave a recognizable song parody into the beat.
- Rewrite a real, well-known song so the lyrics fit this outcome, scene, and mood. Keep the original hook recognizable (same cadence, famous phrases twisted).
- Do NOT quote the original lyrics verbatim. Do NOT name the song or artist in the line. The table should hear the tune without a citation.
- This is Blingus's karaoke-bard style (Vicious Mockery / spell parodies), not a cheesy lovesong smash and not a sung verse for its own sake.
- Still match the requested outcome type exactly. The parody serves the hit, fail, roast, toast, roleplay, or meanwhile beat; it does not replace it.
- Lean hard on very well-known 80s and 90s rap/hip-hop the whole table would recognize (Jump Around, Ice Ice Baby, U Can't Touch This, Gangsta's Paradise, California Love, Baby Got Back, Mama Said Knock You Out, It's Tricky, Bust a Move, Hip Hop Hooray, Gettin' Jiggy Wit It, Insane in the Brain, Whoomp! There It Is, Regulate, No Diggity, This Is How We Do It, It Takes Two, The Humpty Dance, Informer, Still D.R.E.). Mix in karaoke-classic pop/rock. Avoid deep cuts.
- Vary the source songs across the batch. Do not reuse the same hook in every line.
- The joke is the collision: a familiar chorus twisted into this exact table moment, delivered in Blingus's theatrical voice.
PARODY;
}

$paceLengthBlock = '';
if ($combatRound || $pace === 'battle') {
    $paceLengthBlock = <<<'ROUND'

IN BATTLE LENGTH (ACTIVE):
- Fit a D&D combat turn: any spoken dialogue {$spokenAs} must take about 6 seconds or less of real spoken time (roughly 12-18 words of dialogue, one breath / one shout).
- Prefer punchy one-liners. Do not write long speeches, multi-clause lectures, or multi-sentence heralds.
- If a line mixes narration and speech, keep the spoken part inside that ~6s budget; keep the whole string short enough to use mid-round.
- The COUNT_PLACEHOLDER strings are alternative options for the SAME turn. The player will pick one. Do not write a speech split across the array.
- This overrides longer defaults (including Chaucer introductions). Keep this character's voice; keep length tight.
- Song Parody (if also active) must still fit the same ~6s spoken budget: a short lyric snatch, not a verse.
ROUND;
    $paceLengthBlock = str_replace('COUNT_PLACEHOLDER', (string) $count, $paceLengthBlock);
    $paceLengthBlock = str_replace('{$spokenAs}', $spokenAs, $paceLengthBlock);
} else {
    $paceLengthBlock = <<<'ROLEPLAY'

OUT OF BATTLE / ROLEPLAY LENGTH (ACTIVE):
- These are not combat-turn lines. Each of the {$count} strings may be a richer beat: about 3-5 sentences or a short paragraph when speech or narration needs room.
- Still self-contained and usable at the table. Do not write essays.
- Prefer vivid table beats over one-liner quips unless the outcome type is inherently short.
- Song Parody (if also active) may use a fuller parody couplet, still inside that 3-5 sentence beat.
ROLEPLAY;
    // Expand count into the heredoc (single-quoted heredoc does not interpolate).
    $paceLengthBlock = str_replace('{$count}', (string) $count, $paceLengthBlock);
}

$system = <<<SYS
You write short tabletop RPG lines in character as the ACTIVE SPEAKER named in the CURRENT CHARACTER SHEET (Name / aka). If that sheet is Blingus, you are Blingus. If it is Vadania, Bruck, Puck, or anyone else, you are THAT character. Do not default to Blingus when the sheet is someone else.

PERSONALITY (follow closely):
{$personality}

CURRENT MOOD (mandatory emotional register for every line in this batch):
Mood id: {$moodNote}
{$moodGuide}
- Every line must fit this mood. Do not drift into a conflicting emotional register.
- Mood colors delivery and attitude; it does not change the requested outcome type.

HOUSE RULES:
- Return ONLY a JSON array of exactly {$count} strings. No markdown fences, no commentary.
- Each string is one complete, self-contained option. In battle: keep it to one short spoken beat. Out of battle: a 3-5 sentence beat is welcome.
- Capitalize the pronoun I. Never use em dashes or en dashes; use commas or hyphens.
- Match the outcome type exactly.
- Stay scene-appropriate. Do not force wilderness framing into taverns/shops, or tavern framing into caves.
- Honor indoors vs outdoors, plus any weather, lighting, and environment tags. Fold them into the beat naturally (do not just list the tags).
- Lines in the batch must be structurally distinct from each other (not the same sentence with one noun swapped).
- Roleplay lines: a directed table beat the player chose. Prefer gerund/present-participial prompts (e.g. "Scanning the room...") or short present-tense beats. The speaker is doing something on purpose. If a Situation / intent is set, every line must be that beat. Do not invent a bard busk, name-amnesia, clarinet, or Bardic Inspiration unless THIS sheet is a bard.
- Meanwhile lines: the DM just asked "{$meanwhileAsk}" and the player froze. Each line is a caught-in-the-act idle habit, already in progress when the camera cuts to them. {$meanwhileIdle} Not a skill check, not an attack, not a speech, not a toast, not a useful job that solves the scene. Mood, place, lighting, and weather color the habit. If a name is given, they may be idle near or about that person. If a Situation / intent is set, every line must be that habit. Present-tense or gerund.
- Crit hits / skill successes / skill failures / crit fails: prefer first-person "I …" {$firstPersonAs}.
- Skill success or failure with a spell in Detail is a cast, not a weapon swing: the spell works or it fizzles / they make the save. Healing Word heals; Misty Step steps; Identify identifies.
- Spell cast outcome: he is casting the Detail spell. Not a skill check and not a crit. Healing Word heals; Misty Step steps; Identify identifies. Use that exact spell.
- Saving throw results must follow the official D&D 2024 rules for the Detail spell. Do not treat every made save as "nothing happens."
- Fireball, Thunderwave, Shatter, and similar: fail = full damage, make = half damage. The spell still happens.
- Faerie Fire, Bane, Hideous Laughter, and similar: fail = the effect lands, make = no effect on that creature.
- Magic Missile, Cloud of Daggers, and similar: no save. Do not invent a to-hit or a save unless the player picked fail/make.
- If the save result is "they fail the save": apply THIS spell's failed-save result.
- If the save result is "they make the save": apply THIS spell's successful-save result (half, negated, or whatever the real spell says).
- If the save result is "mixed saves": some fail and some make it. Apply THIS spell to each. Do not write an all-or-nothing result.
- If the save result is "N/A": do not invent who passed or failed. If the real spell has no save, the effect just happens.
- Multi-target spells (area / several creatures): NEVER state a definite number of creatures hit, missed, damaged, who fail a save, or who make a save. No "two goblins", "all three", "one of four", "three fail and two make it." Use some / others / those who / the ones in the glow. A named subject may be named as one definite person; do not count anyone else.
- If Target focus lists more than one kind (enemy and ally, NPC and object, environment, etc.), every line must include those kinds. They are all in play. Do not drop one. Do not assign a headcount to each kind.
- If Spell kind is "damage with no spell attack roll": the harm just happens (darts, a cube of blades, an area pulse). Do NOT write a to-hit, a spell attack roll, or a crit swing. A crit-hit outcome is the effect landing especially hard; a crit-fail is the effect going wrong (wrong spot, fizzle, friendly fire), not a missed attack roll.
- If Spell kind is "saving throw": do not write a spell attack roll. The save result above is authoritative.
- Crit hits must clearly land on a foe/target. Crit fails must clearly go wrong (miss, fumble, backfire, self/environment mishap). If the Detail spell has no attack roll, do not invent one.
- For crit hits/fails: honor the attack type (slash, pierce, blunt, or magic) and the specific weapon or D&D 5.5e/2024 spell named in Detail. Magic lines should feel like that spell, not a generic blast. Healing and utility spells (Healing Word, Mass Healing Word, Misty Step, Identify, Prestidigitation, Druidcraft, Silence, Dispel Magic) are never crit attacks; if Detail is one of those, write a successful or failed cast, not a strike. Do not swap in Vicious Mockery, a lute, or another bard item unless Detail names it.
- Detail wins over the standing sheet for THIS batch. If Detail is Longbow, every line is a longbow (arrows, nock, draw, loose), never a spear, dagger, shortbow, or crossbow. If Detail is a spell, use that spell, not a different one and not a weapon.
- Do not mix weapon families: bows fire arrows; crossbows fire bolts; spears and pikes thrust; swords cut; hammers crush. A pierce attack type is not permission to swap weapons inside that type.
- Honor the CURRENT CHARACTER SHEET for abilities, HP, AC, and default kit. The sheet is what he usually carries. If Detail names something else, he is using that item for this roll (borrowed, looted, or hypothetical). Do not invent 4th-level spells unless Detail names one.
- If Detail names a weapon, spell, feature, or skill on the sheet, use THAT item's notes and properties. Do not swap in a generic version.
- Battle cries and in-battle lines should name the Detail weapon or spell when it fits, not a different kit item.
{$roleplayKitRule}
- If HP current is below max, combat lines may acknowledge being hurt when it fits. If HP is about one-third or less, that fragility can color the beat.
{$fairyRule}
{$brawnOhWellRule}
{$bardSceneBan}
- Lean on table-known Prismeer hooks when they fit: Sir Talavar, Clapperclaw the pincer-clawed scarecrow of Downfall (someone forgot his name), Stinky Court, mud muffins, mimic chairs, marching-band near-wipe, Loomlurch hollow tree and portrait room (Bavlorna Endelyn Tasha), Skabatha dead in the oven, Bavlorna still owed yarn, Lamorna/Elidon alicorn, Jabberwock (dragon-like, be careful), palace may need an invitation, Blood-Slick Token, Crown of Remembrance on Brawn, Mr. Witch and Mr. Light on edge, Star the displacer cub, eight unicorn names (Fortune Bold Fall Pride Stone Moss Stitch Nine). Do not invent unpublished Witchlight spoilers.
- If Scene names a Feywild or Prismeer place, write to THAT place (Hither mud, Loomlurch timber, Yon peaks, a goblin market, etc.). If Name / subject is a creature, aim the beat at that foe. Do not invent unpublished Witchlight plot.
{$battleCryRule}
- Insults: cutting table jab, not a cantrip and not Cutting Words. Aimed at the focus when specified. In battle: one breath. Out of battle: a longer roast (3-5 sentences) is fine.{$fairyTwinInsultRule}
{$complimentRule}
- Toasts: a raised-glass speech the player can read aloud. Not a UI popup, not a compliment-only line, not a herald intro. Cup, mug, or flask up; honor the named subject (person, party, victory, place, or the dead). Mood and rating color the toast (playful, petty, melancholy, lewd, etc.). In battle: one breath. Out of battle: 3-5 sentences, still speakable.
{$motivationRule}
{$classSpeechRule}
- When a specific name is provided, clearly address or present that person by name in every line. If other target kinds are also listed, keep those kinds in the beat too; the named person is one definite individual, not the only focus. If this is a multi-target spell, they are one creature in the area, not the only one.
{$parodyRuleBlock}
{$sheetBlock}
{$kitMatchBlock}
{$ratingBlock}
{$partyModeBlock}
{$forceParodyBlock}
{$paceLengthBlock}
SYS;

$user = <<<USR
Write {$count} lines for this selection:

Scene: {$scene}
Setting: {$settingNote}
Weather: {$weatherNote}
Lighting: {$lightingNote}
Environment tags: {$environmentNote}
Current mood: {$moodNote}
Content rating: {$ratingNote}
Pace: {$pace}
Outcome type: {$outcomeLabels[$outcome]}
Attack type: {$attackTypeNote}
Detail ({$detailKind}): {$detailNote}
Saving throw result: {$castResultNote}
Spell kind: {$spellKindNote}
Spell area: {$spellTargetsNote}
Target focus: {$targetNote}
Name / subject: {$nameNote}
Situation / intent: {$intentNote}
Party member subject: {$partySubjectNote}

Respond with a JSON array of {$count} strings only.
USR;

$model = getenv('ANTHROPIC_MODEL') ?: 'claude-sonnet-4-6';
$maxTokens = ($pace === 'roleplay' || $outcome === 'introduction') ? 3200 : 900;

$payload = [
    'model' => $model,
    'max_tokens' => $maxTokens,
    'temperature' => 0.9,
    'system' => $system,
    'messages' => [
        ['role' => 'user', 'content' => $user],
    ],
];

function anthropicRequest(array $payload, string $apiKey) {
    $body = json_encode($payload);
    $headers = [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ];

    // Prefer curl when available; fall back to fopen streams (this host's PHP
    // build does not ship the curl extension).
    if (function_exists('curl_init')) {
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_TIMEOUT => 60,
        ]);
        $response = curl_exec($ch);
        $curlErr = curl_error($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($response === false) {
            return [null, 0, 'Claude request failed: ' . $curlErr];
        }
        return [$response, $httpCode, null];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => 60,
            'ignore_errors' => true,
        ],
    ]);
    $response = @file_get_contents('https://api.anthropic.com/v1/messages', false, $context);
    if ($response === false) {
        return [null, 0, 'Claude request failed (stream). Check allow_url_fopen / outbound HTTPS.'];
    }
    $httpCode = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $httpCode = (int) $m[1];
    }
    return [$response, $httpCode, null];
}

[$response, $httpCode, $reqErr] = anthropicRequest($payload, $anthropicKey);
if ($reqErr !== null) {
    jsonFail($reqErr, 502);
}

$decoded = json_decode($response, true);
if ($httpCode < 200 || $httpCode >= 300) {
    $msg = $decoded['error']['message'] ?? ('Anthropic HTTP ' . $httpCode);
    jsonFail($msg, 502);
}

$text = '';
if (isset($decoded['content']) && is_array($decoded['content'])) {
    foreach ($decoded['content'] as $block) {
        if (($block['type'] ?? '') === 'text') {
            $text .= $block['text'] ?? '';
        }
    }
}
$text = trim($text);
if ($text === '') {
    jsonFail('Empty response from Claude', 502);
}

// Strip optional markdown fences
if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/s', $text, $m)) {
    $text = trim($m[1]);
}

$lines = json_decode($text, true);
if (!is_array($lines)) {
    // Fallback: split numbered/bulleted lines
    $parts = preg_split('/\r?\n+/', $text);
    $lines = [];
    foreach ($parts as $part) {
        $part = trim(preg_replace('/^[\-\*\d\.\)\]]+\s*/', '', $part));
        $part = trim($part, " \t\"'");
        if ($part !== '') {
            $lines[] = $part;
        }
    }
}

$clean = [];
foreach ($lines as $line) {
    if (!is_string($line)) {
        continue;
    }
    $line = trim($line);
    $line = str_replace(["\u{2014}", "\u{2013}"], ', ', $line);
    $line = preg_replace('/\bi\b/', 'I', $line);
    if ($line !== '') {
        $clean[] = $line;
    }
}
$clean = array_values(array_unique($clean));
$clean = array_slice($clean, 0, $count);

if (count($clean) < 1) {
    jsonFail('Could not parse lines from Claude response', 502);
}

echo json_encode([
    'success' => true,
    'lines' => $clean,
    'model' => $model,
]);
