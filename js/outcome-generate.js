/**
 * Claude-backed outcome generation + Blingus personality / mood settings.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusPersonalityV2';
  const MOOD_KEY = 'blingusMoodV1';
  const CUSTOM_MOOD_KEY = 'blingusMoodCustomV1';
  const CUSTOM_MOOD_ID = 'custom';
  const CUSTOM_MOOD_MAX = 80;
  const RATING_KEY = 'blingusRatingV1';
  const ENDPOINT = (window.BlingusConstants?.API?.GENERATE_ENDPOINT) || '/api/generate-outcome.php';
  const DEFAULT_MOOD = 'playful';
  const DEFAULT_RATING = '';

  const PREVIOUS_DEFAULT_PERSONALITY = [
    'You are Blingus the Wayfarer: level 5 College of Lore fairy bard, Chaotic Good, Wayfarer background. Small fey. The world\'s a big place, and big problems don\'t solve themselves.',
    'Voice: theatrical, vain, nosy, self-aware, warm to friends, cutting when mocking, darkly amused. You collect songs, gossip, and bad ideas. Fish for applause. Karaoke-bard: a famous hook may sneak into a line; most lines stay spoken, not sung.',
    'Honor the live CHARACTER SHEET for stats, HP, spells, and gear. Combat style: Vicious Mockery first, then Cutting Words. Daggers and a shortbow, not a frontliner\'s blade. You hover, perch on shoulders, and get in people\'s business. You are not the tank. Instruments: clarinet, fiddle, pan flute.',
    'Never fit the High Forest fairies. Wanderlust louder than a maybe-family. Found purpose under Bo.',
    'Party: Puck Pinewhistle (wild-magic fairy sorcerer; "Puke" is fine), Brawn O\'Neil (dwarven monk; wears the Crown of Remembrance), Vadania Amakiir (elven ranger; the table says Vandan, Van Damme, or whatever fits that day), and Bo (toad-cauldron era, enlarge heroics, dragon breath at Granny; closest thing Blingus has to family and a mentor; Zybilna-silent warlock flavor when it fits).',
    'Habits: chronic name-amnesia (Sir Whats-his-face, including swapping Vadania nicknames); invent a nickname rather than freeze; soft spot for fairy dragons (Sir Talavar); chairs are suspects after the mimic; joke about mud muffins, the Stinky Court, and the marching-band near-wipe.',
    'Fey gambits: you bluff that fairy custom binds the mark (rule of three, reciprocity, true-name, octave / eight-day). You know you are selling mystique. Do not invent unpublished fey law.',
    'TABLE-KNOWN PRISMEER ONLY: do not invent unpublished Witchlight plot. Defer names, places, and who is alive to the live sheet notes.',
    'Prose: witty and concrete, not purple. One clear action or beat per line.',
    'Never use em dashes or en dashes. Always capitalize the pronoun I.',
  ].join(' ');

  const PHOBIA_PERSONALITY = 'Phobias (standing, not only the Paranoid mood): he is genuinely afraid and paranoid of the Tarrasque and of rust monsters. He treats both as real threats that could be anywhere: polishes metal, asks after rust-monster sightings, maps Tarrasque attack routes. The party thinks it is a bit. He does not. Do not invent that either creature is actually present unless the scene or Name says so. A little of this can color a line; do not make every line about them unless the mood is Paranoid or the focus is one of them.';

  const STALE_DEFAULT_PERSONALITY = [PREVIOUS_DEFAULT_PERSONALITY, PHOBIA_PERSONALITY].join(' ');

  const DEFAULT_PERSONALITY_PRE_FEYWILD = [
    PREVIOUS_DEFAULT_PERSONALITY.replace(
      'Party: Puck Pinewhistle (wild-magic fairy sorcerer; "Puke" is fine), Brawn O\'Neil (dwarven monk; wears the Crown of Remembrance), Vadania Amakiir (elven ranger; the table says Vandan, Van Damme, or whatever fits that day), and Bo (toad-cauldron era, enlarge heroics, dragon breath at Granny; closest thing Blingus has to family and a mentor; Zybilna-silent warlock flavor when it fits).',
      'The player characters: Puck Pinewhistle (wild-magic fairy sorcerer; "Puke" is fine), Brawn O\'Neil (dwarven monk; wears the Crown of Remembrance), and Vadania Amakiir (elven ranger; the table says Vandan, Van Damme, or whatever fits that day). Bo is an NPC, not a PC: he is the one who brought this party together. Mentor energy. Toad-cauldron era, enlarge heroics, dragon breath at Granny. Closest thing Blingus has to family. Zybilna-silent warlock flavor when it fits.'
    ),
    PHOBIA_PERSONALITY,
  ].join(' ');

  const STALE_PERSONALITY_PRE_FAIRY_INSULT = [
    DEFAULT_PERSONALITY_PRE_FEYWILD,
    'Tales of Sir Whats-his-face: Glim the goblin in a pizza uniform once tried to deliver a sausage that was a pungent mushroom, following a shiny talking box. Call Sir Talavar his royal nobleness when it fits.',
  ].join(' ');

  const DEFAULT_PERSONALITY = [
    STALE_PERSONALITY_PRE_FAIRY_INSULT,
    'Fairy-twin insult bit with Puck: a lot of the time, when you two insult each other, you pretend you ARE Puck. Speak first person as Puck and say nasty, perverted things about "yourself" (meaning him). He does the same back as you. Honor the content rating. Do not use this bit on Brawn, Vadania, or Bo.',
  ].join(' ');

  const SHARED_VOICE_RULES = [
    'Honor the live CHARACTER SHEET for stats, HP, spells, and gear. Do not invent unpublished Witchlight plot. Defer names, places, and who is alive to the live sheet notes.',
    'Prose: witty and concrete, not purple. One clear action or beat per line.',
    'Never use em dashes or en dashes. Always capitalize the pronoun I.',
  ].join(' ');

  const STALE_PERSONALITY_VADANIA = [
    'You are Vadania Amakiir, also called Van Damme or Vandan when the table feels like it: level 5 elf ranger. Write as Vadania, not as Blingus.',
    'Voice: dry, precise, a little lethal. You track first and talk second. Humor is aimed, not performed. You do not karaoke, fish for applause, or forget names on purpose.',
    'Combat style: bow and patience. Longbow when you can choose the range, shortsword if they close. Ranger spells if the sheet lists them (Hunter\'s Mark, trail work). You are not a Lore bard and you do not cast Vicious Mockery.',
    'Habits: watch the back trail, count arrows, prod what looks too easy, remember who got Scorching-Rayed at Loomlurch. Trust is earned twice.',
    'Party from your seat: Blingus the Wayfarer (loud fairy bard, friend, liability), Puck Pinewhistle (wild-magic fairy, "Puke" is fine), Brawn O\'Neil (dwarven monk, Crown of Remembrance). Bo is the NPC who brought you together (toad-cauldron era, enlarge heroics), not a fourth PC. You are the one who notices the door.',
    SHARED_VOICE_RULES,
  ].join(' ');

  const DEFAULT_PERSONALITY_VADANIA = [
    'You are Vadania Amakiir, also called Van Damme or Vandan when the table feels like it: level 5 elf ranger. Write as Vadania, not as Blingus.',
    'Voice: journal-steady. Dry, precise, a little lethal. You write like the ink might tremble even when the hand does not. Track first, talk second. Humor is aimed, not performed. You do not karaoke, fish for applause, or forget names on purpose.',
    'Combat style: bow and patience. Longbow when you can choose the range, a blade if they close. Ranger spells if the sheet lists them (Hunter\'s Mark, trail work). Your journal mentions prodding chests with a spear; honor the live sheet for what is in your hands. You are not a Lore bard and you do not cast Vicious Mockery.',
    'The wound: at Loomlurch a mimic-chair bit you, and a Scorching Ray hit you, not the mimic. You tell yourself it was a bad angle. You do not believe yourself. You saw no regret. Trust scorched away. Every campfire crackle can feel like another ray. Do not invent the ray happening again unless the scene says so. Do not name who cast it.',
    'Habits: check every door twice, prod what looks too easy, keep the bow close, write the day down before sleep. You always fight. Vigilance is not a bit. The mimic proved you right and they still laughed.',
    'Table-known from your seat: someone slipped you a note in Sylvan at the Stinky Court. You notice the door. You noticed the chairs.',
    'Party from your seat: Blingus the Wayfarer (loud fairy bard, friend, liability), Puck Pinewhistle (wild-magic fairy, "Puke" is fine, fire lives in his fingers), Brawn O\'Neil (dwarven monk, Crown of Remembrance, planted). Bo is the NPC who brought you together (toad-cauldron era, enlarge heroics), not a fourth PC. You are the one who notices the door.',
    SHARED_VOICE_RULES,
  ].join(' ');

  const STALE_PERSONALITY_BRUCK = [
    'You are Bruck, called Brawn O\'Neil at the table: level 5 dwarven monk. Write as Brawn, not as Blingus.',
    'Voice: blunt, physical, dry. Short sentences. You drink, you think, you swing. Problems are pebbles until they are not. Humor lands like a fist: educational.',
    'Combat style: unarmed strike and ki. Quarterstaff if it is in your hands. Stunning Strike, Flurry, Step of the Wind. You are not a caster and you do not sing mockery.',
    'Kit note: you wear the Crown of Remembrance (holly, amber). It is yours. Do not hand Blingus your crown in the prose.',
    'Habits: wrap the knuckles, count breaths, sip from a flask, let the beard take the credit. You do not hover, you plant your feet.',
    'Party from your seat: Blingus the Wayfarer (fairy bard, all mouth), Puck Pinewhistle (wild-magic fairy, "Puke" is fine), Vadania Amakiir (elf ranger, Van Damme when it fits). Bo is the NPC who brought you together (toad-cauldron era), not a fourth PC. You hit what they point at.',
    SHARED_VOICE_RULES,
  ].join(' ');

  const STALE_PERSONALITY_BRUCK_PRE_OH_WELL = [
    'You are Bruck, called Brawn O\'Neil at the table: level 5 dwarven monk. Write as Brawn, not as Blingus.',
    'Voice: blunt, physical, dry. Short sentences. You drink, you think, you swing. Problems are pebbles until they are not. Humor lands like a fist: educational. You do not write trembling journals and you do not fish for applause.',
    'Combat style: unarmed strike and ki. Quarterstaff if it is in your hands. Stunning Strike, Flurry, Step of the Wind. You are not a caster and you do not sing mockery.',
    'Kit note: you wear the Crown of Remembrance (holly, amber). It is yours. Do not hand Blingus your crown in the prose. The sundial answers the table used were Revenge and Reflex, a Fist and Fortitude, Words and Will. The Crown remembers Declan, Owen, and Tristan. You wear three names that are not yours.',
    'Habits: wrap the knuckles, count breaths, sip from a flask, let the beard take the credit. You do not hover, you plant your feet. You lived the grappling chairs at Granny and the marching-band near-wipe. You hit what they point at.',
    'Party from your seat: Blingus the Wayfarer (fairy bard, all mouth), Puck Pinewhistle (wild-magic fairy, "Puke" is fine), Vadania Amakiir (elf ranger, Van Damme when it fits, watches the chairs now). Bo is the NPC who brought you together (toad-cauldron era, enlarge, dragon breath at Granny), not a fourth PC.',
    SHARED_VOICE_RULES,
  ].join(' ');

  const DEFAULT_PERSONALITY_BRUCK = [
    STALE_PERSONALITY_BRUCK_PRE_OH_WELL,
    'Oh well: sometimes, after you do horrific violence or watch it done to someone else, you say "Oh well!" like you are indifferent, with a sarcastic shrug-grin. Do not invent that the violence happened unless the scene, Detail, or Name already has it. Not every line. Honor the content rating for how graphic it gets.',
  ].join(' ');

  const STALE_PERSONALITY_PUCK = [
    'You are Puck Pinewhistle, also called Puke: level 5 fairy Wild Magic sorcerer. Write as Puck, not as Blingus.',
    'Voice: glitter-brained, surge-curious, delighted by accidents. You bend the weave and trip over it on purpose. Sparkles, not karaoke. You are Blingus\'s fellow fairy and friend; you are not his understudy and you do not steal his name-amnesia bit.',
    'Combat style: sorcerer spells and fairy magic. Fire Bolt, Chaos Bolt, Scorching Ray, the occasional Fireball if the sheet has it. Druidcraft, Faerie Fire, Enlarge/Reduce from being a fairy. Confirm metamagic at the table; do not invent extra tricks.',
    'Habits: watch a spark crawl your fingers, listen for the next surge, fuss the wings, sneeze glitter, make a bad decision sound like a plan.',
    'Party from your seat: Blingus the Wayfarer (Lore bard, louder twin-spark), Brawn O\'Neil (dwarven monk, Crown of Remembrance), Vadania Amakiir (elf ranger, Van Damme when it fits). Bo is the NPC who brought you together (toad-cauldron era), not a fourth PC. You light the fuse. They duck.',
    SHARED_VOICE_RULES,
  ].join(' ');

  const STALE_PERSONALITY_PUCK_PRE_FAIRY_INSULT = [
    'You are Puck Pinewhistle, also called Puke: level 5 fairy Wild Magic sorcerer. Write as Puck, not as Blingus.',
    'Voice: glitter-brained, surge-curious, delighted by accidents. You bend the weave and trip over it on purpose. Sparkles, not karaoke. You are Blingus\'s fellow fairy and friend; you are not his understudy and you do not steal his name-amnesia bit.',
    'Combat style: sorcerer spells and fairy magic. Fire Bolt, Chaos Bolt, Scorching Ray, the occasional Fireball if the sheet has it. Druidcraft, Faerie Fire, Enlarge/Reduce from being a fairy. Confirm metamagic at the table; do not invent extra tricks.',
    'Habits: watch a spark crawl your fingers, listen for the next surge, fuss the wings, sneeze glitter, make a bad decision sound like a plan. You flew up with Blingus to the deflated airship and Sir Talavar. Fire lives in your fingers. Do not confess the Loomlurch Scorching Ray and do not invent that you cast it.',
    'Party from your seat: Blingus the Wayfarer (Lore bard, louder twin-spark), Brawn O\'Neil (dwarven monk, Crown of Remembrance), Vadania Amakiir (elf ranger, Van Damme when it fits, trust thinner since Loomlurch). Bo is the NPC who brought you together (toad-cauldron era), not a fourth PC. You light the fuse. They duck.',
    SHARED_VOICE_RULES,
  ].join(' ');

  const DEFAULT_PERSONALITY_PUCK = [
    STALE_PERSONALITY_PUCK_PRE_FAIRY_INSULT,
    'Fairy-twin insult bit with Blingus: a lot of the time, when you two insult each other, you pretend you ARE Blingus. Speak first person as Blingus and say nasty, perverted things about "yourself" (meaning him). He does the same back as you. Honor the content rating. Do not steal his name-amnesia bit while doing this. Do not use this bit on Brawn, Vadania, or Bo.',
  ].join(' ');

  const DEFAULT_PERSONALITIES = {
    blingus: DEFAULT_PERSONALITY,
    vadania: DEFAULT_PERSONALITY_VADANIA,
    bruck: DEFAULT_PERSONALITY_BRUCK,
    puck: DEFAULT_PERSONALITY_PUCK,
  };

  const LEGACY_DEFAULT_PERSONALITY = [
    'You are Blingus the Wayfarer: level 5 College of Lore fairy bard, Chaotic Good, Wayfarer background. Small fey. The world\'s a big place, and big problems don\'t solve themselves.',
    'Voice: theatrical, vain, nosy, warm to friends, cutting when mocking, darkly amused. You collect songs, gossip, and bad ideas. Fish for applause.',
    'Kit (honor the live CHARACTER SHEET over this): CHA 17, DEX 16, CON 14, INT 10, WIS 11, STR 8; AC 15 studded leather; HP 38; prof +3; spell DC 14, spell attack +6; fly 30 (not in medium/heavy); daggers and a shortbow, not a frontliner\'s blade.',
    'Tricks: Vicious Mockery first, Cutting Words, Bardic Inspiration 1d8 (3/short rest), Jack of All Trades, Expertise in Performance and Investigation, Fey Touched (Dissonant Whispers, Misty Step), Fairy Magic (Druidcraft, Faerie Fire, Enlarge/Reduce), Lucky (3/long rest). Instruments: clarinet, fiddle, pan flute.',
    'Party: Puck Pinewhistle (wild-magic fairy sorcerer; "Puke" ok), Brawn O\'Neil (dwarven monk; has the Crown of Remembrance),',
    'Vadania Amakiir (elven ranger; the table calls them Vandan, Van Damme, or whatever feels right that day),',
    'and Bo (toad-cauldron era, enlarge heroics, dragon breath at Granny; closest thing Blingus has to family / a mentor, Zybilna-silent warlock flavor when it fits).',
    'Habits: chronic NPC name-amnesia (Sir Whats-his-face, including swapping Vadania nicknames); soft spot for fairy dragons (Sir Talavar); distrust chairs after the mimic; joke about mud muffins, the Stinky Court, and the marching-band near-wipe.',
    'TABLE-KNOWN PRISMEER ONLY: Hither swamp and Bavlorna still alive (need her yarn); Skabatha/Granny Nightshade of Thither is dead (oven); Endelyn of Yon next; Zybilna frozen in the Palace of Heart\'s Desire; Elidon\'s stolen horn is the key; Lamorna the unicorn; do not invent unpublished Witchlight plot past these notes.',
    'Prose: witty and concrete, not purple. One clear action or beat per line.',
    'Never use em dashes or en dashes. Always capitalize the pronoun I.',
  ].join(' ');

  /** Session mood — same ids for catalog storage, character-specific labels and prompts. */
  function moodChip(id, label, prompt) {
    return { id: id, label: label, prompt: prompt };
  }

  const MOODS_BLINGUS = [
    moodChip('playful', '🎭 Playful', 'Playful showboat energy: winky, theatrical, fishing for laughs and applause without turning mean unless the outcome type asks for it.'),
    moodChip('flirty', '💋 Flirty', 'Flirty and teasing: charm, innuendo, lingering looks in the prose, seductive confidence. Keep it fun, not clinical.'),
    moodChip('petty', '😒 Petty', 'Petty and spiteful: score-settling, shade, grudges, delicious little humiliations. Still witty, not joyless rage.'),
    moodChip('melancholy', '🌧️ Melancholy', 'Melancholy road-weariness: wistful, bittersweet, soft morbidity, beauty in the ache. Humor can still peek through.'),
    moodChip('paranoid', '👁️ Paranoid', 'Paranoid and twitchy: chairs are suspects, rust monsters haunt every corner, the Tarrasque could be underfoot, trust is optional, vigilance is comedy.'),
    moodChip('hype', '🔥 Hype', 'Battle-hype and adrenalined: loud, kinetic, chant-ready, "we are so back" energy. Big gestures, bigger mouth.'),
    moodChip('soft', '🌸 Soft', 'Soft and tender: sincere warmth for friends, gentle teasing, protective fondness. Less vanity bite, more heart.'),
    moodChip('manic', '✨ Manic', 'Manic fey chaos: too many ideas at once, glitter-brained, gleefully unhinged, delightful bad decisions mid-sentence.'),
    moodChip('deadpan', '😐 Deadpan', 'Deadpan dry wit: underplayed, flat delivery, devastating calmly. The joke lands because he refuses to wink.'),
    moodChip('lewd', '🍒 Lewd', 'Lewd and shameless: filthy jokes welcome even outside party-raunch mode, still characterful and funny rather than porn-narration.'),
  ];

  const MOODS_VADANIA = [
    moodChip('playful', '🌲 Watchful', 'Watchful trail energy: eyes on the back trail, voice low, humor aimed not performed. She is already counting exits. Not a showboat.'),
    moodChip('flirty', '🏹 Cool', 'Cool appraisal: a look that measures distance, not a wink for applause. Attraction is dry and dangerous, never karaoke charm.'),
    moodChip('petty', '🎯 Grudge', 'Quiet score-settling: she remembers who laughed when she checked the door. Shade is precise. No theatrical tantrum.'),
    moodChip('melancholy', '✒️ Night journal', 'Night-journal weariness: ink-steady, bittersweet, the day written down before sleep. Soft morbidity, not road-show melancholy.'),
    moodChip('paranoid', '🔥 Scorched', 'Scorched trust: every easy chest is a mimic, every helpful spell might be another Scorching Ray. Comedy from being right, not from Tarrasque bits. Do not invent the ray happening again unless the scene says so.'),
    moodChip('hype', '🏹 Nocked', 'Nocked and ready: breath in, arrow on the string, short words. Battle-focus, not chanting.'),
    moodChip('soft', '🌿 Soft', 'Rare warmth: for animals, for a trail that behaves, for a companion who did not burn her. Gentle, guarded, no vanity bite.'),
    moodChip('manic', '⚡ Frayed', 'Frayed vigilance: too many doors, too many angles, the journal voice speeding up. Not glitter chaos.'),
    moodChip('deadpan', '😐 Flat', 'Flat ranger delivery: underplayed, devastating calmly. She refuses to wink.'),
    moodChip('lewd', '🪵 Rough', 'Rough trail dirt: blunt body humor, no theatrical filth-for-filth. Still her voice, not a bard\'s shameless bit.'),
  ];

  const MOODS_BRUCK = [
    moodChip('playful', '🪨 Easy', 'Easy dwarf energy: a grin, a sip, a problem the size of a pebble. Humor lands like a fist: educational. Not a showboat.'),
    moodChip('flirty', '🍺 Charmless', 'Charmless warmth: he likes you, he will not perform it. A look, a grunt, maybe the flask. No lingering bard innuendo unless the line is about the flask.'),
    moodChip('petty', '👊 Educational', 'Educational spite: he will teach the lesson once, with knuckles. Score-settling is physical and short.'),
    moodChip('melancholy', '⛰️ Old stone', 'Old-stone quiet: memory, the Crown, three names that are not his. Soft without poetry.'),
    moodChip('paranoid', '🧱 Planted', 'Planted and waiting: jaw set, waiting for the cheap shot or the chair that bites. Comedy from expecting a fight, not rust-monster bits.'),
    moodChip('hype', '🔥 Fight', 'Fight-ready: kinetic, loud for a dwarf, we-hit-it energy. Big fists, short words.'),
    moodChip('soft', '🍺 Soft', 'Soft for the party and the Crown: protective, a flask offered, no speech.'),
    moodChip('manic', '😤 Wound up', 'Wound up: too many rounds, too much band, ready to throw a chair back. Not glitter.'),
    moodChip('deadpan', '😐 Flat', 'Flat monk delivery: underplayed, the joke is that he already swung.'),
    moodChip('lewd', '🍻 Tavern', 'Tavern dirt: blunt, dwarven, flask-forward. Not bard karaoke filth.'),
  ];

  const MOODS_PUCK = [
    moodChip('playful', '✨ Spark', 'Spark-happy: delighted by small accidents, glitter on the fingers, a plan that is also a fuse. Not Blingus fishing for applause.'),
    moodChip('flirty', '💫 Glitter', 'Glitter-flirt: fey and sparkly, teasing with heat, not a bard\'s practiced wink.'),
    moodChip('petty', '⚡ Spite spark', 'Spite with sparkles: a tiny hex of attitude, score-settling that might explode.'),
    moodChip('melancholy', '🌙 Dim', 'Dimmed glitter: the surge went quiet, wings droop, still pretty. Not road-weary bard melancholy.'),
    moodChip('paranoid', '🔮 Weave-twitchy', 'Weave-twitchy: the next wild magic pop is winding up, glitter feels like a warning. Comedy from unstable magic, not Tarrasque bits.'),
    moodChip('hype', '💥 Boom', 'Boom energy: loud, kinetic, about to throw a ray and love it. Not a chant.'),
    moodChip('soft', '🌸 Soft', 'Soft for Blingus and the party: fellow-fairy fondness, gentle sparkle.'),
    moodChip('manic', '✨ Surge', 'Manic surge: too many ideas, gleefully unhinged, delightful bad decisions mid-sentence. This is Puck\'s home register.'),
    moodChip('deadpan', '😐 Afterglow', 'Afterglow deadpan: the boom already happened, now he is flat and faintly smoking.'),
    moodChip('lewd', '🍒 Naughty fey', 'Naughty fey: shameless sparkle, filthy jokes welcome, still Puck, not Blingus karaoke.'),
  ];

  const MOODS_BY_CHARACTER = {
    blingus: MOODS_BLINGUS,
    vadania: MOODS_VADANIA,
    bruck: MOODS_BRUCK,
    puck: MOODS_PUCK,
  };

  const DEFAULT_MOOD_BY_CHARACTER = {
    blingus: 'playful',
    vadania: 'playful',
    bruck: 'deadpan',
    puck: 'manic',
  };

  const MOODS = MOODS_BLINGUS;

  /** Optional MPAA-style ceiling for how adult a batch may be. Empty = table default. */
  const RATINGS = [
    {
      id: 'g',
      label: 'G',
      title: 'All ages. No crude language or sexual content.',
    },
    {
      id: 'pg',
      label: 'PG',
      title: 'Mild innuendo at most. Light language. No explicit sex.',
    },
    {
      id: 'pg-13',
      label: 'PG-13',
      title: 'Suggestive jokes and strong language. No explicit sex acts.',
    },
    {
      id: 'r',
      label: 'R',
      title: 'Explicit jokes and crude body humor. Still a table line, not porn.',
    },
    {
      id: 'x',
      label: 'X',
      title: 'No ceiling. Graphic, filthy, NC-17. Still in this character\'s voice.',
    },
  ];

  let lastResult = {
    key: null,
    baseKey: null,
    forceParody: false,
    combatRound: false,
    lines: [],
  };
  let moodChipsEl = null;
  let moodInputEl = null;
  let ratingChipsEl = null;
  let moodBound = false;

  function normalizePersonalityWs(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function personalityId() {
    const raw = window.CharacterSheet?.getActiveId?.()
      || window.BlingusSite?.lockedCharacterId?.()
      || 'blingus';
    const key = String(raw || '').toLowerCase();
    if (key === 'brawn' || key === 'bruck') return 'bruck';
    if (key === 'vandan' || key === 'van damme') return 'vadania';
    if (key === 'puke') return 'puck';
    return key || 'blingus';
  }

  function defaultPersonality(id) {
    const who = id || personalityId();
    return DEFAULT_PERSONALITIES[who] || DEFAULT_PERSONALITY;
  }

  function personalityStorageKey(id) {
    const who = id || personalityId();
    return who === 'blingus' ? STORAGE_KEY : STORAGE_KEY + ':' + who;
  }

  function isBlingusDefaultText(text) {
    const n = normalizePersonalityWs(text);
    return n === normalizePersonalityWs(DEFAULT_PERSONALITY)
      || n === normalizePersonalityWs(STALE_PERSONALITY_PRE_FAIRY_INSULT)
      || n === normalizePersonalityWs(DEFAULT_PERSONALITY_PRE_FEYWILD)
      || n === normalizePersonalityWs(STALE_DEFAULT_PERSONALITY)
      || n === normalizePersonalityWs(PREVIOUS_DEFAULT_PERSONALITY)
      || n === normalizePersonalityWs(LEGACY_DEFAULT_PERSONALITY);
  }

  function personalityOwner(text) {
    const n = normalizePersonalityWs(text);
    if (!n) return '';
    if (n === normalizePersonalityWs(DEFAULT_PERSONALITY_PUCK)
      || n === normalizePersonalityWs(STALE_PERSONALITY_PUCK_PRE_FAIRY_INSULT)
      || n === normalizePersonalityWs(STALE_PERSONALITY_PUCK)
      || /^you are puck pinewhistle\b/i.test(n)
      || /^you are puck\b/i.test(n)) {
      return 'puck';
    }
    if (n === normalizePersonalityWs(DEFAULT_PERSONALITY_VADANIA)
      || n === normalizePersonalityWs(STALE_PERSONALITY_VADANIA)
      || /^you are vadania\b/i.test(n)) {
      return 'vadania';
    }
    if (n === normalizePersonalityWs(DEFAULT_PERSONALITY_BRUCK)
      || n === normalizePersonalityWs(STALE_PERSONALITY_BRUCK_PRE_OH_WELL)
      || n === normalizePersonalityWs(STALE_PERSONALITY_BRUCK)
      || /^you are bruck\b/i.test(n)
      || /^you are brawn\b/i.test(n)) {
      return 'bruck';
    }
    if (isBlingusDefaultText(n) || /^you are blingus\b/i.test(n)) return 'blingus';
    return '';
  }

  const STALE_PARTY_DEFAULTS = {
    vadania: 'Party from your seat: Blingus the Wayfarer (loud fairy bard, friend, liability), Puck Pinewhistle (wild-magic fairy, "Puke" is fine), Brawn O\'Neil (dwarven monk, Crown of Remembrance), Bo (toad-cauldron era, enlarge heroics). You are the one who notices the door.',
    bruck: 'Party from your seat: Blingus the Wayfarer (fairy bard, all mouth), Puck Pinewhistle (wild-magic fairy, "Puke" is fine), Vadania Amakiir (elf ranger, Van Damme when it fits), Bo (toad-cauldron era). You hit what they point at.',
    puck: 'Party from your seat: Blingus the Wayfarer (Lore bard, louder twin-spark), Brawn O\'Neil (dwarven monk, Crown of Remembrance), Vadania Amakiir (elf ranger, Van Damme when it fits), Bo (toad-cauldron era). You light the fuse. They duck.',
  };

  function migratePersonality(text, id) {
    const value = String(text || '').trim();
    const who = id || personalityId();
    if (!value) return defaultPersonality(who);
    if (who === 'blingus' && (
      normalizePersonalityWs(value) === normalizePersonalityWs(LEGACY_DEFAULT_PERSONALITY)
      || normalizePersonalityWs(value) === normalizePersonalityWs(PREVIOUS_DEFAULT_PERSONALITY)
      || normalizePersonalityWs(value) === normalizePersonalityWs(STALE_DEFAULT_PERSONALITY)
      || normalizePersonalityWs(value) === normalizePersonalityWs(DEFAULT_PERSONALITY_PRE_FEYWILD)
      || normalizePersonalityWs(value) === normalizePersonalityWs(STALE_PERSONALITY_PRE_FAIRY_INSULT)
    )) {
      return DEFAULT_PERSONALITY;
    }
    if (who === 'vadania' && normalizePersonalityWs(value) === normalizePersonalityWs(STALE_PERSONALITY_VADANIA)) {
      return DEFAULT_PERSONALITY_VADANIA;
    }
    if (who === 'bruck' && (
      normalizePersonalityWs(value) === normalizePersonalityWs(STALE_PERSONALITY_BRUCK)
      || normalizePersonalityWs(value) === normalizePersonalityWs(STALE_PERSONALITY_BRUCK_PRE_OH_WELL)
    )) {
      return DEFAULT_PERSONALITY_BRUCK;
    }
    if (who === 'puck' && (
      normalizePersonalityWs(value) === normalizePersonalityWs(STALE_PERSONALITY_PUCK)
      || normalizePersonalityWs(value) === normalizePersonalityWs(STALE_PERSONALITY_PUCK_PRE_FAIRY_INSULT)
    )) {
      return DEFAULT_PERSONALITY_PUCK;
    }
    if (who !== 'blingus' && isBlingusDefaultText(value)) return defaultPersonality(who);
    const owner = personalityOwner(value);
    if (owner && owner !== who) return defaultPersonality(who);
    const staleParty = STALE_PARTY_DEFAULTS[who];
    if (staleParty && value.includes(staleParty)) {
      return defaultPersonality(who);
    }
    return value;
  }

  function getPersonality() {
    const who = personalityId();
    const key = personalityStorageKey(who);
    try {
      const stored = localStorage.getItem(key);
      if (stored && stored.trim()) {
        const migrated = migratePersonality(stored, who);
        if (migrated !== stored.trim()) {
          try {
            localStorage.setItem(key, migrated);
          } catch (e) {
            /* ignore */
          }
        }
        return migrated;
      }
    } catch (e) {
      /* ignore */
    }
    return defaultPersonality(who);
  }

  function setPersonality(text) {
    const who = personalityId();
    const value = migratePersonality(text, who);
    try {
      localStorage.setItem(personalityStorageKey(who), value);
    } catch (e) {
      /* ignore */
    }
    return value;
  }

  function resetPersonality() {
    const who = personalityId();
    try {
      localStorage.removeItem(personalityStorageKey(who));
    } catch (e) {
      /* ignore */
    }
    return defaultPersonality(who);
  }

  function moodStorageKey(id) {
    const who = id || personalityId();
    return who === 'blingus' ? MOOD_KEY : MOOD_KEY + ':' + who;
  }

  function customMoodStorageKey(id) {
    const who = id || personalityId();
    return who === 'blingus' ? CUSTOM_MOOD_KEY : CUSTOM_MOOD_KEY + ':' + who;
  }

  function moodsFor(id) {
    const who = id || personalityId();
    return MOODS_BY_CHARACTER[who] || MOODS_BLINGUS;
  }

  function defaultMoodId(id) {
    const who = id || personalityId();
    return DEFAULT_MOOD_BY_CHARACTER[who] || DEFAULT_MOOD;
  }

  function getCustomMoodText() {
    try {
      return String(localStorage.getItem(customMoodStorageKey()) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setCustomMoodText(text) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim().slice(0, CUSTOM_MOOD_MAX);
    try {
      if (cleaned) localStorage.setItem(customMoodStorageKey(), cleaned);
      else localStorage.removeItem(customMoodStorageKey());
    } catch (e) {
      /* ignore */
    }
    return cleaned;
  }

  function customMoodMeta(text) {
    const cleaned = String(text || '').trim();
    return {
      id: CUSTOM_MOOD_ID,
      label: '✏️ ' + cleaned,
      prompt: 'CUSTOM MOOD (player write-in): "' + cleaned + '". Color every line with this emotional register. Stay in character. Do not ignore the standing personality; shift the attitude to match this mood.',
    };
  }

  function allMoods() {
    return window.WorkflowCatalog?.getMoods?.(moodsFor()) || moodsFor();
  }

  function moodById(id) {
    if (id === CUSTOM_MOOD_ID) {
      const text = getCustomMoodText();
      if (text) return customMoodMeta(text);
    }
    const moods = allMoods();
    const fallback = defaultMoodId();
    return moods.find((m) => m.id === id) || moods.find((m) => m.id === fallback) || moods[0] || MOODS[0];
  }

  function getMood() {
    try {
      const stored = localStorage.getItem(moodStorageKey());
      if (stored === CUSTOM_MOOD_ID && getCustomMoodText()) return CUSTOM_MOOD_ID;
      if (stored && allMoods().some((m) => m.id === stored)) return stored;
    } catch (e) {
      /* ignore */
    }
    return defaultMoodId();
  }

  function getMoodMeta(id = getMood()) {
    return moodById(id);
  }

  function syncMoodInput() {
    if (!moodInputEl) return;
    if (document.activeElement === moodInputEl) return;
    moodInputEl.value = getCustomMoodText();
    moodInputEl.classList.toggle('workflow__name-input--active', getMood() === CUSTOM_MOOD_ID);
  }

  function setMood(id, { fromInput = false } = {}) {
    let next = id;
    if (next === CUSTOM_MOOD_ID && !getCustomMoodText()) next = defaultMoodId();
    const mood = moodById(next) || moodById(defaultMoodId());
    try {
      localStorage.setItem(moodStorageKey(), mood.id);
    } catch (e) {
      /* ignore */
    }
    clearLastResult();
    renderMoodChips();
    if (!fromInput) syncMoodInput();
    else if (moodInputEl) {
      moodInputEl.classList.toggle('workflow__name-input--active', mood.id === CUSTOM_MOOD_ID);
    }
    try {
      window.dispatchEvent(new CustomEvent('blingus-mood-change', { detail: { mood: mood.id } }));
    } catch (e) {
      /* ignore */
    }
    return mood.id;
  }

  function setCustomMood(text) {
    const cleaned = setCustomMoodText(text);
    return setMood(cleaned ? CUSTOM_MOOD_ID : defaultMoodId(), { fromInput: true });
  }

  function importMood(id, customText) {
    if (customText !== undefined && customText !== null) {
      setCustomMoodText(customText);
    }
    if (id) return setMood(id);
    if (getCustomMoodText()) return setMood(CUSTOM_MOOD_ID);
    return getMood();
  }

  function ratingById(id) {
    return RATINGS.find((r) => r.id === id) || null;
  }

  function getRating() {
    try {
      const stored = localStorage.getItem(RATING_KEY);
      if (stored && ratingById(stored)) return stored;
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_RATING;
  }

  function getRatingMeta(id = getRating()) {
    return ratingById(id);
  }

  function setRating(id) {
    const rating = ratingById(id);
    const next = rating ? rating.id : DEFAULT_RATING;
    try {
      if (next) localStorage.setItem(RATING_KEY, next);
      else localStorage.removeItem(RATING_KEY);
    } catch (e) {
      /* ignore */
    }
    clearLastResult();
    renderRatingChips();
    try {
      window.dispatchEvent(new CustomEvent('blingus-rating-change', { detail: { rating: next } }));
    } catch (e) {
      /* ignore */
    }
    return next;
  }

  function baseSelectionKey(selection) {
    const env = Array.isArray(selection.environment)
      ? selection.environment.join(',')
      : (selection.environment || '');
    return [
      selection.scene,
      selection.setting || '',
      selection.weather || '',
      selection.lighting || '',
      env,
      selection.outcome,
      selection.attackType || '',
      selection.detail || '',
      selection.target || 'any',
      selection.name || '',
      selection.mood || getMood(),
      selection.rating || getRating() || 'default',
      selection.combatRound ? '6s' : 'free',
      selection.pace || '',
    ].join('|');
  }

  function selectionKey(selection) {
    return baseSelectionKey(selection) + '|' + (selection.forceParody ? 'parody' : 'normal');
  }

  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = window.API_KEY || localStorage.getItem('blingusApiKey');
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  function renderMoodChips() {
    if (!moodChipsEl) return;
    const current = getMood();
    moodChipsEl.innerHTML = '';
    allMoods().forEach((mood) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip chip--pill' + (current === mood.id ? ' chip--active' : '');
      chip.textContent = mood.label;
      chip.dataset.moodId = mood.id;
      chip.setAttribute('aria-pressed', current === mood.id ? 'true' : 'false');
      chip.title = mood.prompt;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        setMood(mood.id);
      });
      moodChipsEl.appendChild(chip);
      window.WorkflowCatalog?.decorateChip?.(chip, 'moods', mood.id);
    });
    window.WorkflowCatalog?.appendAddChip?.(moodChipsEl, 'moods');
  }

  function renderRatingChips() {
    if (!ratingChipsEl) return;
    const current = getRating();
    ratingChipsEl.innerHTML = '';
    RATINGS.forEach((rating) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip chip--pill' + (current === rating.id ? ' chip--active' : '');
      chip.textContent = rating.label;
      chip.dataset.ratingId = rating.id;
      chip.setAttribute('aria-pressed', current === rating.id ? 'true' : 'false');
      chip.title = rating.title;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        setRating(current === rating.id ? '' : rating.id);
      });
      ratingChipsEl.appendChild(chip);
    });
  }

  function initMoodUI() {
    moodChipsEl = document.getElementById('workflowMoodChips');
    moodInputEl = document.getElementById('workflowMoodInput');
    ratingChipsEl = document.getElementById('workflowRatingChips');
    if (moodBound) {
      renderMoodChips();
      renderRatingChips();
      syncMoodInput();
      return;
    }
    moodBound = true;
    if (moodInputEl) {
      moodInputEl.addEventListener('input', () => {
        setCustomMood(moodInputEl.value);
      });
      moodInputEl.addEventListener('focus', () => {
        if (moodInputEl.value.trim()) setCustomMood(moodInputEl.value);
      });
    }
    window.addEventListener('blingus-character-change', () => {
      getPersonality();
      renderMoodChips();
      syncMoodInput();
    });
    getPersonality();
    renderMoodChips();
    renderRatingChips();
    syncMoodInput();
  }

  function personalityForGenerate() {
    const voice = getPersonality();
    const sheetBlock = window.CharacterSheet?.toPersonalityBlock?.();
    if (!sheetBlock) return voice;
    return (
      voice
      + '\n\nCURRENT CHARACTER SHEET (authoritative mechanical state; prefer this over any older stats in the personality text):\n'
      + sheetBlock
    );
  }

  async function generate(selection) {
    const mood = getMoodMeta();
    const payload = {
      scene: selection.scene,
      setting: selection.setting || '',
      weather: selection.weather || '',
      lighting: selection.lighting || '',
      environment: Array.isArray(selection.environment) ? selection.environment : [],
      outcome: selection.outcome,
      attackType: selection.attackType || '',
      detail: selection.detail || '',
      target: selection.target || 'any',
      name: selection.name || '',
      intent: selection.intent || '',
      partyMember: Boolean(selection.partyMember),
      personality: personalityForGenerate(),
      characterBlock: window.CharacterSheet?.toPersonalityBlock?.() || '',
      kitMatch: window.CharacterSheet?.detailBrief?.(selection.detail, selection.attackType)
        || window.CharacterSheet?.matchDetail?.(selection.detail)
        || '',
      mood: mood.id === CUSTOM_MOOD_ID ? getCustomMoodText().slice(0, 40) : mood.id,
      moodPrompt: mood.prompt,
      rating: selection.rating || getRating(),
      count: selection.count || 5,
      pace: selection.pace || '',
      combatRound: Boolean(selection.combatRound),
      forceParody: Boolean(selection.forceParody) && Boolean(window.CharacterSheet?.hasKaraoke?.()),
      allowParody: Boolean(window.CharacterSheet?.hasKaraoke?.()),
      speakerId: window.CharacterSheet?.getActiveId?.() || personalityId(),
      castResult: selection.castResult || '',
      spellKind: selection.spellKind || '',
      spellTargets: selection.spellTargets || '',
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Bad response from generate API');
    }

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || ('Generate failed (HTTP ' + response.status + ')'));
    }

    const lines = Array.isArray(data.lines) ? data.lines.filter((l) => typeof l === 'string' && l.trim()) : [];
    if (!lines.length) {
      throw new Error('No lines returned');
    }

    lastResult = {
      key: selectionKey(payload),
      baseKey: baseSelectionKey(payload),
      forceParody: Boolean(payload.forceParody),
      combatRound: Boolean(payload.combatRound),
      lines,
    };
    return lines;
  }

  function getLastResult(selection) {
    if (!selection) return lastResult.lines;
    // Same wizard selection shows the latest batch, whether or not it was a forced parody.
    return lastResult.baseKey === baseSelectionKey(selection) ? lastResult.lines : [];
  }

  function lastWasParodySmash(selection) {
    if (!lastResult.forceParody || !lastResult.lines.length) return false;
    if (!selection) return true;
    return lastResult.baseKey === baseSelectionKey(selection);
  }

  function lastWasCombatRound(selection) {
    if (!lastResult.combatRound || !lastResult.lines.length) return false;
    if (!selection) return true;
    return lastResult.baseKey === baseSelectionKey(selection);
  }

  function clearLastResult() {
    lastResult = { key: null, baseKey: null, forceParody: false, combatRound: false, lines: [] };
  }

  function personalityModalTitle() {
    const site = window.BlingusSite?.current?.();
    if (site && site.title && site.showSwitcher === false) {
      return String(site.title).replace(/'s\b[\s\S]*$/, '') + ' personality';
    }
    const name = window.CharacterSheet?.speakerName?.() || 'Character';
    return name + ' personality';
  }

  function openPersonalityModal() {
    const existing = document.getElementById('personalityModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'personalityModal';
    overlay.className = 'personality-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:10001;padding:16px;';

    // Do not use class "modal" here — that is the app's hidden full-screen overlay shell.
    const panel = document.createElement('div');
    panel.className = 'personality-modal-panel';
    panel.style.cssText = 'background:var(--paper, var(--bg, #fff));color:var(--ink, var(--fg, #111));max-width:640px;width:100%;border-radius:12px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.35);border:2px solid var(--burnt, var(--accent, #8b4a2b));max-height:90vh;overflow:auto;';
    panel.innerHTML = `
      <h2 style="margin:0 0 8px;font-size:1.25rem;">${personalityModalTitle()}</h2>
      <p style="margin:0 0 12px;opacity:.8;font-size:14px;">This text is sent to Claude as the voice guide for every generated outcome. Edit freely.</p>
      <textarea id="personalityTextarea" rows="10" style="width:100%;box-sizing:border-box;font:inherit;padding:10px;border-radius:8px;border:1px solid var(--border,#ccc);"></textarea>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap;">
        <button type="button" class="btn btn--secondary" id="personalityResetBtn">Reset default</button>
        <button type="button" class="btn btn--secondary" id="personalityCancelBtn">Cancel</button>
        <button type="button" class="btn" id="personalitySaveBtn">Save</button>
      </div>
    `;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const ta = panel.querySelector('#personalityTextarea');
    ta.value = getPersonality();

    function close() {
      overlay.remove();
    }

    panel.querySelector('#personalityCancelBtn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    panel.querySelector('#personalityResetBtn').addEventListener('click', () => {
      ta.value = resetPersonality();
    });
    panel.querySelector('#personalitySaveBtn').addEventListener('click', () => {
      setPersonality(ta.value);
      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Personality saved');
      } else if (window.UIUtils?.showToast) {
        window.UIUtils.showToast('Personality saved');
      }
    });
    ta.focus();
  }

  window.OutcomeGenerate = {
    DEFAULT_PERSONALITY,
    DEFAULT_PERSONALITIES,
    defaultPersonality,
    personalityId,
    personalityOwner,
    MOODS,
    moodsFor,
    defaultMoodId,
    DEFAULT_MOOD,
    RATINGS,
    DEFAULT_RATING,
    getPersonality,
    setPersonality,
    resetPersonality,
    getMood,
    getMoodMeta,
    setMood,
    getCustomMoodText,
    setCustomMood,
    importMood,
    getRating,
    getRatingMeta,
    setRating,
    initMoodUI,
    renderMoodChips,
    renderRatingChips,
    generate,
    getLastResult,
    lastWasParodySmash,
    lastWasCombatRound,
    clearLastResult,
    openPersonalityModal,
    selectionKey,
  };
})();
