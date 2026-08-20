/**
 * Editable Blingus character sheet: stats, skills, features, armor, weapons, gear, spells.
 * Feeds Claude generate prompts and Outcomes kit chips.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusCharacterV2';
  const ROSTER_KEY = 'blingusCharacterRosterV1';
  const ACTIVE_KEY = 'blingusActiveCharacterV1';
  const SAVE_DEBOUNCE_MS = 250;
  let saveTimer = null;
  let sheet = null;
  let renderHost = null;
  let activeId = 'blingus';
  const roster = {};

  const CHARACTERS = [
    { id: 'blingus', label: 'Blingus' },
    { id: 'vadania', label: 'Vadania' },
    { id: 'bruck', label: 'Bruck' },
    { id: 'puck', label: 'Puck' },
  ];

  function uid(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }

  function item(name, extras) {
    return Object.assign({ id: uid('i'), name: name, notes: '' }, extras || {});
  }

  const SPELL_KINDS = ['attack', 'save', 'damage', 'other'];
  const SPELL_KIND_LABELS = {
    attack: 'Attack',
    save: 'Save',
    damage: 'Damage',
    other: 'Other',
  };
  const SPELL_TARGET_SCOPES = ['single', 'multi'];
  const SPELL_TARGET_LABELS = { single: 'Single', multi: 'Multi' };
  const SPELL_MULTI_DEFAULTS = {
    'Faerie Fire': true,
    'Bane': true,
    'Thunderclap': true,
    'Thunderwave': true,
    'Earth Tremor': true,
    'Cloud of Daggers': true,
    'Magic Missile': true,
    'Fireball': true,
    'Shatter': true,
    'Synaptic Static': true,
    'Mass Healing Word': true,
    'Hail of Thorns': true,
    'Spike Growth': true,
    'Fog Cloud': true,
    'Web': true,
    'Scorching Ray': true,
  };
  const SPELL_KIND_DEFAULTS = {
    'Vicious Mockery': 'save',
    'Prestidigitation': 'other',
    'True Strike': 'attack',
    'Druidcraft': 'other',
    'Healing Word': 'other',
    'Bane': 'save',
    'Command': 'save',
    "Tasha's Hideous Laughter": 'save',
    'Identify': 'other',
    'Dissonant Whispers': 'save',
    'Faerie Fire': 'save',
    'Silence': 'other',
    'Crown of Madness': 'save',
    'Misty Step': 'other',
    'Enlarge': 'save',
    'Reduce': 'save',
    'Enlarge/Reduce': 'save',
    'Dispel Magic': 'other',
    'Mass Healing Word': 'other',
    'Thunderclap': 'save',
    'Starry Wisp': 'attack',
    'Thunderwave': 'save',
    'Earth Tremor': 'save',
    'Cloud of Daggers': 'damage',
    'Magic Missile': 'damage',
    'Fireball': 'damage',
    'Shatter': 'save',
    'Heat Metal': 'save',
    'Phantasmal Force': 'save',
    'Phantasmal Killer': 'save',
    'Synaptic Static': 'save',
    'Light': 'other',
    'Divine Smite': 'other',
    'Wrathful Smite': 'save',
    'Bless': 'other',
    'Shield of Faith': 'other',
    'Compelled Duel': 'save',
    'Searing Smite': 'save',
    'Thunderous Smite': 'save',
    'Hunter\'s Mark': 'other',
    'Cure Wounds': 'other',
    'Ensnaring Strike': 'save',
    'Hail of Thorns': 'save',
    'Fog Cloud': 'other',
    'Speak with Animals': 'other',
    'Pass without Trace': 'other',
    'Spike Growth': 'save',
    'Lesser Restoration': 'other',
    'Fire Bolt': 'attack',
    'Mage Hand': 'other',
    'Chaos Bolt': 'attack',
    'Shield': 'other',
    'Mage Armor': 'other',
    'Scorching Ray': 'attack',
    'Counterspell': 'other',
    'Web': 'save',
  };

  function inferSpellKind(name, notes) {
    const key = String(name || '').trim();
    const lk = key.toLowerCase();
    if (!lk) return 'other';
    if (SPELL_KIND_DEFAULTS[key]) return SPELL_KIND_DEFAULTS[key];
    const known = Object.keys(SPELL_KIND_DEFAULTS).find((n) => n.toLowerCase() === lk);
    if (known) return SPELL_KIND_DEFAULTS[known];
    const text = String(notes || '');
    if (/\bheal/i.test(lk) || /\bheal/i.test(text)) return 'other';
    if (/\b(WIS|DEX|CON|INT|CHA|STR)\s*\d+/i.test(text)) return 'save';
    if (/\bspell attack\b|\+\d+\b.*\b(attack|radiant)\b/i.test(text)) return 'attack';
    if (/\bmagic missile\b|\bcloud of daggers\b|\bno (spell )?attack( roll)?\b|\bautomatic(ally)? (hits?|damage)\b/i.test(`${lk} ${text}`)) {
      return 'damage';
    }
    return 'other';
  }

  function resolveSpellKind(raw) {
    const inferred = inferSpellKind(raw && raw.name, raw && raw.notes);
    const kind = raw && raw.spellKind;
    if (kind === 'other' && inferred === 'damage') return 'damage';
    if (SPELL_KINDS.includes(kind)) return kind;
    return inferred;
  }

  function inferSpellTargets(name, notes) {
    const key = String(name || '').trim();
    const lk = key.toLowerCase();
    if (!lk) return 'single';
    if (SPELL_MULTI_DEFAULTS[key]) return 'multi';
    const known = Object.keys(SPELL_MULTI_DEFAULTS).find((n) => n.toLowerCase() === lk);
    if (known) return 'multi';
    const text = `${lk} ${notes || ''}`;
    if (/\b(each creature|all creatures|every creature|creatures of your choice|up to \d+|20-foot|15-foot|10-foot cube|sphere|cone|radius)\b/i.test(text)) {
      return 'multi';
    }
    return 'single';
  }

  function resolveSpellTargets(raw) {
    const scope = raw && raw.spellTargets;
    if (SPELL_TARGET_SCOPES.includes(scope)) return scope;
    return inferSpellTargets(raw && raw.name, raw && raw.notes);
  }

  function defaultBlingus() {
    return {
      version: 2,
      characterId: 'blingus',
      identity: {
        name: 'Blingus the Wayfarer',
        aka: 'Blingus',
        level: 5,
        className: 'Bard (College of Lore)',
        race: 'Fairy',
        alignment: 'Chaotic Good',
        background: 'Wayfarer',
      },
      abilities: {
        str: 8,
        dex: 16,
        con: 14,
        int: 10,
        wis: 11,
        cha: 17,
      },
      combat: {
        proficiency: 3,
        ac: 15,
        hpCurrent: 38,
        hpMax: 38,
        hitDice: '5d8',
        speed: '30 ft walk, 30 ft fly (no fly in medium/heavy armor)',
      },
      skills: [
        item('Performance', { notes: 'Expertise +9' }),
        item('Investigation', { notes: 'Expertise +6' }),
        item('Deception', { notes: '+6' }),
        item('Persuasion', { notes: '+6' }),
        item('Stealth', { notes: '+6' }),
        item('Acrobatics', { notes: '+4' }),
        item('Intimidation', { notes: '+4' }),
        item('Sleight of Hand', { notes: '+4' }),
        item('Arcana', { notes: '+3' }),
        item('Insight', { notes: '+3' }),
        item('Perception', { notes: '+3; passive 13' }),
        item('Thieves\' Tools', { notes: '+6 DEX' }),
      ],
      features: [
        item('Bardic Inspiration', { notes: '1d8, 3/short or long rest; Font of Inspiration; can spend a slot to regain one use' }),
        item('Cutting Words', { notes: 'Lore reaction; spend BI to subtract from a seen creature\'s attack, check, or damage within 60 ft' }),
        item('Jack of All Trades', { notes: '+1 (half prof) on untrained ability checks' }),
        item('Spellcasting', { notes: 'CHA; DC 14, spell attack +6; instrument focus', magicUse: true }),
        item('Fairy Magic', { notes: 'Druidcraft; Faerie Fire 1/LR; Enlarge/Reduce 1/LR; CHA', magicUse: true }),
        item('Flight', { notes: 'fly = walk speed; Small fey; no fly in medium/heavy armor' }),
        item('Carnival dash', { notes: '3 times this adventure (total, not per rest). Fly at twice your fly speed for 1 hour and +5 on Charisma checks. Table note from character notes; do not invent extra uses or a source item.' }),
        item('Fey Touched', { notes: 'Dissonant Whispers + Misty Step always prepared; each 1/LR free', magicUse: true }),
        item('Lucky', { notes: '3 luck points / long rest; advantage on your d20 or disadvantage on an attack against you' }),
      ],
      armor: [
        item('Studded Leather', { notes: 'AC 15 with DEX; light armor only' }),
      ],
      weapons: [
        item('Dagger', { notes: '+6, 1d4+3 piercing; finesse, light, thrown 20/60, Nick; True Strike 1d6+3 radiant', attackType: 'pierce' }),
        item('Shortbow', { notes: '+6, 1d6+3 piercing; ammunition, two-handed, Vex, 80/320', attackType: 'pierce' }),
      ],
      gear: [
        item('Clarinet / fiddle / pan flute', { notes: 'spell focus; pick whichever he is showing off' }),
        item('Amulet of Proof against Detection and Location', { notes: 'uncommon, attuned (1 of 3 slots). While worn, you cannot be targeted by Divination spells or seen through scrying sensors unless you allow it.' }),
        item('Bag of Holding', { notes: 'uncommon. 500 lb / 64 cu ft; bag itself 5 lb. Retrieving an item is a Utilize action. 10 minutes of air, split among creatures inside. Hag Eye is stashed in here. Do not put this inside another bag of holding (Astral rupture).' }),
        item('Witchlight Carnival cloth wings', { notes: 'Identified: carnival guest wings. Nonmagical badge that you paid. Fly speed is from being a fairy, not these.' }),
        item('Woodland pixies whistle', { notes: 'Identified: reed whistle from Spiderlily, Cowslip, and Maypole. Magic action, once this adventure. Summons those three pixies for 1 hour; no Concentration; they fly away after. Friendly; they act on their own Initiative and help if asked. 2024 pixie: AC 15, 9 HP, fly 30, Magic Resistance; Faerie Dust +4 (Charm or Poison until their next turn); DC 12; at will Dancing Lights, Druidcraft, Invisibility (self); 1/day Detect Thoughts, Fly, Sleep.' }),
        item('Granny Nightshade\'s iron ring', { notes: 'Identified as Skabatha\'s Ring of Keys. Opens the Loomlurch locks she carried (kitchen, study, cells, and the rest of her ring). Not a combat item. The wind-up key in her back was a separate body-key and is gone with her.' }),
        item('Mirror of Flattering', { notes: 'Identified: carnival prize mirror. Magic action, 1/Long Rest: study your flattering reflection; Advantage on your next Charisma check within 10 minutes.' }),
        item('Conductor\'s baton', { notes: 'Identified, attunable (one of 3 slots). Attuned, Action: give another creature Advantage on all attack rolls until the start of its next turn. Or Action: that creature can use its Reaction to take an extra Attack action. Not attuned: if you cast a healing spell while wielding it, the recipient(s) also gain 1d4+1 Temporary HP.' }),
        item('Pass without trace seed', { notes: 'Identified: 4 uses. Magic action, consume 1 seed: Pass without Trace for 1 hour, no Concentration. 30-ft Emanation; you and chosen creatures get +10 Stealth and leave no tracks.' }),
        item('Hag Eye', { notes: 'Identified: uncommon coven eye. AC 10, 1 HP. 3 charges, all back at dawn. While holding it, spend 1 charge to cast Darkvision (self) or See Invisibility. Remaining coven hags can take a Magic action to see through it (Concentration) if they are on the same plane; in the bag they see the bag\'s dark interior. Destroy it: each remaining coven hag takes 3d10 Psychic and is Blinded for 24 hours. Utilize action to retrieve from the bag.' }),
        item('Cracked mirror-shard locket', { notes: 'Identified: Magic action, 1/Long Rest, touch yourself or a willing creature. Appearance inverts for 1 hour (or until you end it, no action). While inverted, that creature has Disadvantage on attack rolls and Charisma checks.' }),
        item('Button-eye charm', { notes: 'Identified: uncommon, attunement. +1 to Perception checks and passive Perception while attuned (sheet +3 / 13 becomes +4 / 14). Amulet already uses one of three attunement slots.' }),
        item('Potion of Heroism', { notes: 'x2, rare. Drink or administer (Bonus Action): 10 Temporary HP for 1 hour and Bless for 1 hour, no Concentration. Blue, bubbles like it is boiling.' }),
        item('Charm of Heroism', { notes: '1 use, then it vanishes. Action, no components: cast Heroism as a 1st-level spell. Duration 1 minute. Uses your spellcasting ability (Blingus: CHA). 2024 Heroism: Touch, Concentration, willing creature is immune to Frightened and gains Temporary HP equal to your spellcasting modifier (+3) at the start of each of its turns. Not the Potion of Heroism. Charm text does not waive Concentration; do not invent that it does.' }),
        item('Beetle candy from Thither', { notes: 'Identified: Thither snack. Nonmagical food. One piece is a snack, not a potion.' }),
        item('Wanted poster: Will of the Feywild', { notes: 'Skabatha\'s poster. "This little troublemaker belongs to me. Bring him home alive and unharmed, and you\'ll win the heart of one you love." Bring Will home alive and unharmed. Nonmagical paper; the promise is hers.' }),
        item('Crown of Remembrance (Brawn)', { notes: 'Geoe Identify. Brawn wears this; not Blingus\'s attunement. Rare wondrous, attunement. Woven holly boughs, amber stone front and center. +1 AC and saving throws while worn. Once per day, Action: say Declan, Owen, or Tristan. Three allies within twenty feet gain Advantage on the next matching save before the start of Brawn\'s next turn (Declan CON, Owen DEX, Tristan WIS).' }),
        item('Blood-Slick Token', { notes: 'Uncommon wondrous. Flat iron charm etched with tally marks. When you reduce a creature to 0 HP, gain Temporary HP equal to your proficiency bonus (Blingus +3). Once per turn. No attunement listed. Grows warm when violence pleases it. Table-found as the blood-soaked token after the cloaked assassin at Lamorna was KO\'d.' }),
      ],
      spells: [
        item('Vicious Mockery', { notes: 'cantrip; WIS 14; 60 ft; V' }),
        item('Prestidigitation', { notes: 'cantrip' }),
        item('True Strike', { notes: 'cantrip; +6; radiant rider on a weapon' }),
        item('Druidcraft', { notes: 'cantrip; Fairy Magic' }),
        item('Healing Word', { notes: '1st; bonus action' }),
        item('Bane', { notes: '1st; CHA 14' }),
        item('Command', { notes: '1st; WIS 14' }),
        item('Tasha\'s Hideous Laughter', { notes: '1st; WIS 14' }),
        item('Identify', { notes: '1st; ritual' }),
        item('Dissonant Whispers', { notes: '1st; Fey Touched; WIS 14; 1/LR free' }),
        item('Faerie Fire', { notes: '1st; Fairy Magic; DEX 14; 1/LR free' }),
        item('Silence', { notes: '2nd; ritual' }),
        item('Crown of Madness', { notes: '2nd; WIS 14' }),
        item('Misty Step', { notes: '2nd; Fey Touched; bonus action; 1/LR free' }),
        item('Enlarge', { notes: '2nd; Fairy Magic; CON 14; 1/LR free; grow' }),
        item('Reduce', { notes: '2nd; Fairy Magic; CON 14; 1/LR free; shrink' }),
        item('Dispel Magic', { notes: '3rd' }),
        item('Mass Healing Word', { notes: '3rd; bonus action' }),
      ],
      languages: ['Common', 'Goblin'],
      notes: [
        '2024 rules. D&D Beyond sheet (id 142037960). Initiative +3. Passive Insight 13, Investigation 16. 106 gp. Light armor, simple weapons.',
        'Phobias: genuinely afraid and paranoid of the Tarrasque and rust monsters. Treats both as real threats that could be anywhere. The party thinks it is a bit; he does not. Do not invent that either is present unless the scene says so.',
        'Slots: 4 first, 3 second, 2 third.',
        '',
        'TABLE-KNOWN WITCHLIGHT (do not invent unpublished spoilers):',
        'Wild Beyond the Witchlight / Prismeer. DM Geoe. Player characters: Puck Pinewhistle (wild magic sorcerer fairy), Brawn O\'Neil/O\'Neal (dwarven monk; has the Crown of Remembrance), Vadania Amakiir (elven ranger; Vandan / Van Damme). Bo is an NPC: he brought the party together (toad-cauldron era, enlarge, dragon breath at Granny).',
        'Carnival: someone bought the party tickets. Mr. Witch and Mr. Light run it. Quest: find out why they are on edge. Quest: someone stole a locket from someone at the carnival (do not assume it is the cracked mirror-shard locket). Star is a displacer-beast cub; quest to bring him back to another displacer beast at the carnival. Do not invent who bought the tickets or the other beast\'s name. Do not assume Star is the Misplacer Beast.',
        'Midnight Carnival recap (table notes): Misplacer Beast is a fairy-type displacer beast on lost-and-found duty; liked the party and became an ally. Swan boatwoman on the lazy river asked "What is Joy?"; party brushed it off and she dumped them in the water. Witch and Light were reluctant to help. A quiet bugbear stagehand told Blingus they needed Mr. Witch\'s watch; it controls the carnival\'s travel between worlds. During the Carnival Monarch crowning, Blingus pickpocketed the watch. They entrusted it to the Misplacer Beast and used it as leverage to negotiate passage to Prismeer. The portal is behind them; they have crossed. Do not invent the bugbear\'s name or whether the watch was given back.',
        'Opening rumors (as heard): Brawn hears Zybilna (Zilbana / Fairy Godmother) is frozen in time. Blingus hears three hags formed a coven. Vadania hears Bavlorna (Babiatha) lair is a rambling cottage on stilts in the swamp; Skabatha (Zabatha) lair is a hollowed tree in a forest; Endelyn (Indulin) lair is a mountain-top theater. Puck hears hag names Skabatha Nightshade and Endelyn Moongrave (scabatha / indilun); splinter realms are Hither, Thither, and Yon; each hag is convinced her sisters are plotting against her.',
        'Eight unicorn names (collected): Fortune, Bold, Fall, Pride, Stone, Moss, Stitch, Nine.',
        'Hither: Sir Talavar the fairy dragon in a cage; snakes; Glim the goblin pizza-dude / Sir Whats-his-face; Walking Inn druid wants Zybilna back, spits at Bavlorna; mud muffins; drowned will-o-wisps; Clapperclaw the pincer-clawed scarecrow, best guide in Hither, hangs around Downfall and knows the way to Thither (Granny Nightshade); a woman told the party they need that Downfall scarecrow to reach Thither but she could not remember his name (do not invent who she is); bullywug Stinky Court; note "Spittlespew"; Wittershin\'s = run in place counter-clockwise.',
        'Thither: Loomlurch is a giant hollowed-out tree deep in the Thither forest, Skabatha\'s lair. Granny Nightshade (Skabatha) defeated, incinerated in her oven; key in her back shows mood; children making nightmare toys; Will of the Feywild / Getaway Gang / Little Oak; Skabatha wanted poster: "This little troublemaker belongs to me. Bring him home alive and unharmed, and you\'ll win the heart of one you love."; marching-band near-wipe; mimic chairs; Scorching Ray hit Vadania; Bo turned from toad after cauldron food. Circular room in the heart of Loomlurch displays Skabatha\'s portrait beside her three sisters: Bavlorna, Endelyn, and Tasha. Skabatha quirk: she forgets the first creature she sees when she wakes; her memory of it returns each night when she sleeps; a creature forgotten this way is invisible to her. Do not invent that the party used this, or that it still applies now that she is dead.',
        'Coven: Bavlorna Blightstraw (Hither) still alive, party needs her yarn. Skabatha defeated. Endelyn Moongrave (Yon) vulnerable during a (symbolic) eclipse. Zybilna/Tasha frozen in the Palace of Heart\'s Desire by Igwil\'s cauldron.',
        'Session 3: island / Lamorna the unicorn, mate Elidon; his stolen horn (alicorn) is the key to freeing Zybilna. Quest: find the alicorn and free the dormant queen. Jabberwock (jabbawack) is a dragon-like creature; be careful; mist around the lake keeps it off. Amadore the dandelion in Yon can guide to the palace; might need an invitation to the palace. Cloaked assassin with a unicorn horn attacked Lamorna and was KO\'d; blood-soaked token found (Blood-Slick Token). Library on a 2nd floor holds the most treasured tomes; do not invent which building.',
        'Crown of Remembrance (Geoe, Brawn attuned): rare wondrous, attunement. Holly boughs, amber stone. +1 AC and saves. 1/day Action: name Declan (CON), Owen (DEX), or Tristan (WIS); three allies within twenty feet get Advantage on that next save before the start of Brawn\'s next turn.',
        'Riddle of Fortitude (Declan): Stand at his altar, remember my friend. He never faltered ere his end. In memory of Declan\'s name, we shall play a riddle game. What cannot be thrown when opened, what only may land when closed? What should not be given easily, and often strikes the nose?',
        'Riddle of Will (Tristan): Stand at his altar, remember my friend. The cosmos themselves were his to amend. In memory of Tristan\'s name, we shall play a riddle game. When silence breaks, when power calls, what carries your command? What tool or weapon can you wield with nothing in your hand?',
        'Riddle of Reflex (Owen): Stand at his altar, remember my friend. He was someone on whom you could always depend. In memory of Owen\'s name, we shall play a riddle game. What can you get with a knife in the back? A covert assault or a silent attack? What comes with an enemy sworn you have killed? Sweet retribution and blood oath fulfilled?',
        'Blingus backstory (his telling): never fit the High Forest fairies; wanderlust louder than a maybe-family; found purpose under Bo, the NPC who assembled this party, a warlock bound to Zybilna who went silent over a year. Motto: the world\'s a big place, and big problems don\'t solve themselves.',
      ].join('\n'),
    };
  }

  function emptyAbilities() {
    return { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  }

  function emptyCombat(speed) {
    return {
      proficiency: 3,
      ac: 10,
      hpCurrent: 0,
      hpMax: 0,
      hitDice: '',
      speed: speed || '',
    };
  }

  function stubCharacter(id, identity, extras) {
    extras = extras || {};
    return {
      version: 4,
      characterId: id,
      identity: identity,
      abilities: extras.abilities || emptyAbilities(),
      combat: extras.combat || emptyCombat(extras.speed),
      skills: extras.skills || [],
      features: extras.features || [],
      armor: extras.armor || [],
      weapons: extras.weapons || [],
      gear: extras.gear || [],
      spells: extras.spells || [],
      languages: extras.languages || [],
      notes: extras.notes || '',
    };
  }

  function placeholderNotes(lines) {
    return [
      'PLACEHOLDER SHEET. Typical level-5 class array so Outcomes, Attacks, Spells, and Claude have a kit. Confirm scores, HP, AC, DC, bonuses, prepared/known list, and subclass at the table. These numbers are not a D&D Beyond export.',
      '',
    ].concat(lines).join('\n');
  }

  function defaultVadania() {
    return stubCharacter('vadania', {
      name: 'Vadania Amakiir',
      aka: 'Van Damme',
      level: 5,
      className: 'Ranger',
      race: 'Elf',
      alignment: '',
      background: '',
    }, {
      languages: ['Common', 'Elvish'],
      abilities: { str: 12, dex: 16, con: 14, int: 10, wis: 16, cha: 8 },
      combat: {
        proficiency: 3,
        ac: 14,
        hpCurrent: 44,
        hpMax: 44,
        hitDice: '5d10',
        speed: '30 ft',
      },
      skills: [
        item('Perception', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Survival', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Stealth', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Nature', { notes: 'PLACEHOLDER +3; confirm bonus' }),
        item('Athletics', { notes: 'PLACEHOLDER +4; confirm bonus' }),
        item('Insight', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Animal Handling', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Investigation', { notes: 'PLACEHOLDER +3; confirm bonus' }),
      ],
      features: [
        item('Spellcasting', { notes: 'PLACEHOLDER WIS ranger. Typical DC 14, spell attack +6. Confirm at the table.', magicUse: true }),
        item('Hunter\'s Mark', { notes: '2024 ranger mark. Confirm uses at the table.', magicUse: true }),
        item('Extra Attack', { notes: 'Level 5 ranger' }),
        item('Weapon Mastery', { notes: 'Ranger weapons. Confirm which masteries at the table.' }),
        item('Favored Enemy', { notes: 'Ranger. Confirm the table target types.' }),
      ],
      armor: [
        item('Studded Leather', { notes: 'PLACEHOLDER AC 14 with DEX 16. Confirm armor at the table.' }),
      ],
      weapons: [
        item('Longbow', { notes: 'PLACEHOLDER +6, 1d8+3 piercing; 150/600. Confirm bonus, mastery, and ammo at the table.', attackType: 'pierce' }),
        item('Shortsword', { notes: 'PLACEHOLDER +6, 1d6+3 slashing; finesse. Confirm bonus and mastery at the table.', attackType: 'slash' }),
        item('Hunting Knife', { notes: 'PLACEHOLDER +6, 1d4+3 piercing; backup melee. Confirm at the table.', attackType: 'pierce' }),
      ],
      gear: [
        item('Quiver', { notes: 'PLACEHOLDER. Longbow ammo. Confirm count at the table. Do not invent magic arrows.' }),
        item('Traveler\'s pack', { notes: 'PLACEHOLDER ranger kit: bedroll, tinder, rope. Confirm at the table.' }),
      ],
      spells: [
        item('Hunter\'s Mark', { notes: 'ranger feature / 1st; confirm prepared uses', spellKind: 'other' }),
        item('Cure Wounds', { notes: 'ranger 1st; confirm prepared', spellKind: 'other' }),
        item('Ensnaring Strike', { notes: 'ranger 1st; STR save; confirm prepared', spellKind: 'save' }),
        item('Hail of Thorns', { notes: 'ranger 1st; DEX save; confirm prepared', spellKind: 'save' }),
        item('Fog Cloud', { notes: 'ranger 1st; confirm prepared', spellKind: 'other' }),
        item('Speak with Animals', { notes: 'ranger 1st; confirm prepared', spellKind: 'other' }),
        item('Pass without Trace', { notes: 'ranger 2nd; confirm prepared', spellKind: 'other' }),
        item('Spike Growth', { notes: 'ranger 2nd; confirm prepared', spellKind: 'other' }),
        item('Lesser Restoration', { notes: 'ranger 2nd; confirm prepared', spellKind: 'other' }),
      ],
      notes: placeholderNotes([
        'Table-known: Vadania Amakiir, elven ranger. Nicknames: Vandan, Van Damme. The one who notices the door.',
        'Party of Blingus the Wayfarer (Witchlight / Prismeer). Bo is an NPC who brought the party together, not a PC. Do not invent unpublished module plot.',
        'Opening rumor she heard: Bavlorna (Babiatha) lair is a rambling cottage on stilts in the swamp; Skabatha (Zabatha) lair is a hollowed tree in a forest; Endelyn (Indulin) lair is a mountain-top theater.',
        'Thither: Scorching Ray hit Vadania at Loomlurch. Journal of Vandan: she writes that the ray felt aimed; trust scorched; she checks doors twice and the mimic proved her right. Someone slipped her a Sylvan note at the Stinky Court. Do not invent who cast the ray.',
      ]),
    });
  }

  function defaultBruck() {
    return stubCharacter('bruck', {
      name: 'Bruck',
      aka: "Brawn O'Neil",
      level: 5,
      className: 'Monk',
      race: 'Dwarf',
      alignment: '',
      background: '',
    }, {
      languages: ['Common', 'Dwarvish'],
      abilities: { str: 14, dex: 16, con: 14, int: 8, wis: 16, cha: 10 },
      combat: {
        proficiency: 3,
        ac: 16,
        hpCurrent: 43,
        hpMax: 43,
        hitDice: '5d8',
        speed: '35 ft (dwarf 25 plus Unarmored Movement; confirm)',
      },
      skills: [
        item('Acrobatics', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Athletics', { notes: 'PLACEHOLDER +4; confirm bonus' }),
        item('Stealth', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Insight', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('History', { notes: 'PLACEHOLDER +2; confirm bonus' }),
        item('Religion', { notes: 'PLACEHOLDER +2; confirm bonus' }),
      ],
      features: [
        item('Martial Arts', { notes: 'Unarmed strike and monk weapons. Confirm the Martial Arts die at the table.' }),
        item('Unarmored Defense', { notes: 'PLACEHOLDER AC 16 from DEX 16 + WIS 16. Confirm the table formula.' }),
        item('Unarmored Movement', { notes: 'Level 5 monk extra speed. Confirm the bonus at the table.' }),
        item('Extra Attack', { notes: 'Level 5 monk' }),
        item('Flurry of Blows', { notes: 'Bonus Action, spend Focus/Ki. Confirm the 2024 name and cost at the table.' }),
        item('Patient Defense', { notes: 'Monk defensive option. Confirm cost at the table.' }),
        item('Step of the Wind', { notes: 'Monk movement option. Confirm cost at the table.' }),
        item('Stunning Strike', { notes: 'Monk. Confirm save and uses at the table.' }),
        item('Crown of Remembrance', {
          notes: 'Geoe Identify. Rare wondrous, attunement. Holly boughs, amber stone. +1 AC and saves. 1/day Action: name Declan (CON), Owen (DEX), or Tristan (WIS); three allies within twenty feet get Advantage on that next save before the start of Bruck\'s next turn.',
        }),
      ],
      armor: [
        item('Unarmored', { notes: 'PLACEHOLDER monk Unarmored Defense. No armor worn unless the table said otherwise.' }),
      ],
      weapons: [
        item('Unarmed Strike', { notes: 'PLACEHOLDER +6, Martial Arts die + DEX. Confirm die and bonus at the table.', attackType: 'blunt' }),
        item('Quarterstaff', { notes: 'PLACEHOLDER +6, 1d8+3 blunt versatile. Confirm bonus at the table.', attackType: 'blunt' }),
      ],
      gear: [
        item('Crown of Remembrance', {
          notes: 'Worn by Bruck / Brawn. Rare wondrous, attunement. +1 AC and saving throws. 1/day Action: Declan CON, Owen DEX, or Tristan WIS for three allies within twenty feet.',
        }),
        item('Hand wraps', { notes: 'PLACEHOLDER monk wraps. Not armor. Confirm at the table.' }),
        item('Flask', { notes: 'PLACEHOLDER. Something to sip between rounds. Confirm what is in it at the table.' }),
      ],
      notes: placeholderNotes([
        'Table-known: Bruck, also called Brawn O\'Neil / O\'Neal, dwarven monk. No spell list. Crown of Remembrance is his.',
        'Party of Blingus the Wayfarer (Witchlight / Prismeer). Bo is an NPC who brought the party together, not a PC. Do not invent unpublished module plot.',
        'Opening rumor he heard: Zybilna (Zilbana / Fairy Godmother) is frozen in time.',
        'Crown of Remembrance is his. Sundial answers the table used: Revenge / Reflex, a Fist / Fortitude, Words / Will. Lived the grappling chairs at Granny and the marching-band near-wipe.',
      ]),
    });
  }

  function defaultPuck() {
    return stubCharacter('puck', {
      name: 'Puck Pinewhistle',
      aka: 'Puke',
      level: 5,
      className: 'Sorcerer (Wild Magic)',
      race: 'Fairy',
      alignment: '',
      background: '',
    }, {
      languages: ['Common'],
      abilities: { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 17 },
      combat: {
        proficiency: 3,
        ac: 12,
        hpCurrent: 32,
        hpMax: 32,
        hitDice: '5d6',
        speed: '30 ft walk, 30 ft fly',
      },
      skills: [
        item('Arcana', { notes: 'PLACEHOLDER +3; confirm bonus' }),
        item('Deception', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Insight', { notes: 'PLACEHOLDER +4; confirm bonus' }),
        item('Intimidation', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Persuasion', { notes: 'PLACEHOLDER +6; confirm bonus' }),
        item('Religion', { notes: 'PLACEHOLDER +3; confirm bonus' }),
      ],
      features: [
        item('Spellcasting', { notes: 'PLACEHOLDER CHA sorcerer. Typical DC 14, spell attack +6. Slots 4/3/2. Confirm known list at the table.', magicUse: true }),
        item('Wild Magic Surge', { notes: 'Wild Magic sorcerer. Confirm surge rules at the table. Do not invent extra metamagic.' }),
        item('Tides of Chaos', { notes: 'Wild Magic. Confirm uses at the table.' }),
        item('Font of Magic', { notes: 'Sorcery points. Confirm the pool at the table.' }),
        item('Innate Sorcery', { notes: '2024 sorcerer. Confirm at the table.' }),
        item('Flight', { notes: 'Fairy: fly speed equals walk speed unless the table said otherwise.' }),
        item('Fairy Magic', { notes: 'Druidcraft; Faerie Fire 1/LR; Enlarge/Reduce 1/LR; CHA', magicUse: true }),
      ],
      armor: [
        item('Unarmored', { notes: 'PLACEHOLDER AC 12 with DEX 14. Mage Armor on the list if they cast it (AC 15).' }),
      ],
      weapons: [
        item('Dagger', { notes: 'PLACEHOLDER last-resort +5, 1d4+2 piercing. Confirm at the table. Not a Lore bard dagger.', attackType: 'pierce' }),
      ],
      gear: [
        item('Crystal focus', { notes: 'PLACEHOLDER sorcerer focus. Confirm the stone at the table. Not a clarinet.' }),
        item('Component pouch', { notes: 'PLACEHOLDER. Confirm at the table.' }),
      ],
      spells: [
        item('Druidcraft', { notes: 'cantrip; Fairy Magic', spellKind: 'other' }),
        item('Fire Bolt', { notes: 'sorcerer cantrip; confirm known', spellKind: 'attack' }),
        item('Prestidigitation', { notes: 'sorcerer cantrip; confirm known', spellKind: 'other' }),
        item('Mage Hand', { notes: 'sorcerer cantrip; confirm known', spellKind: 'other' }),
        item('Chaos Bolt', { notes: 'sorcerer 1st; confirm known', spellKind: 'attack' }),
        item('Shield', { notes: 'sorcerer 1st; confirm known', spellKind: 'other' }),
        item('Mage Armor', { notes: 'sorcerer 1st; confirm known', spellKind: 'other' }),
        item('Magic Missile', { notes: 'sorcerer 1st; confirm known', spellKind: 'damage' }),
        item('Faerie Fire', { notes: '1st; Fairy Magic; DEX save; 1/LR free', spellKind: 'save' }),
        item('Misty Step', { notes: 'sorcerer 2nd; confirm known', spellKind: 'other' }),
        item('Scorching Ray', { notes: 'sorcerer 2nd; confirm known', spellKind: 'attack' }),
        item('Shatter', { notes: 'sorcerer 2nd; CON save; confirm known', spellKind: 'save' }),
        item('Enlarge', { notes: '2nd; Fairy Magic; 1/LR free; grow', spellKind: 'other' }),
        item('Reduce', { notes: '2nd; Fairy Magic; 1/LR free; shrink', spellKind: 'other' }),
        item('Fireball', { notes: 'sorcerer 3rd; DEX save; confirm known', spellKind: 'save' }),
        item('Counterspell', { notes: 'sorcerer 3rd; confirm known', spellKind: 'other' }),
      ],
      notes: placeholderNotes([
        'Table-known: Puck Pinewhistle, fairy Wild Magic sorcerer. Nickname: Puke. Fellow fairy and friend of Blingus. Not a Lore bard.',
        'Party of Blingus the Wayfarer (Witchlight / Prismeer). Bo is an NPC who brought the party together, not a PC. Do not invent unpublished module plot.',
        'Opening rumor he heard: hag names Skabatha Nightshade and Endelyn Moongrave (scabatha / indilun); splinter realms are Hither, Thither, and Yon; each hag is convinced her sisters are plotting against her.',
        'Flew up with Blingus to the deflated airship and Sir Talavar. Do not invent that he cast the Loomlurch Scorching Ray.',
      ]),
    });
  }

  function defaultCharacter(characterId) {
    const id = knownCharacterId(characterId);
    if (id === 'vadania') return defaultVadania();
    if (id === 'bruck') return defaultBruck();
    if (id === 'puck') return defaultPuck();
    return defaultBlingus();
  }

  function knownCharacterId(id) {
    const key = String(id || '').toLowerCase();
    return CHARACTERS.some((c) => c.id === key) ? key : 'blingus';
  }

  function characterMeta(id) {
    const key = knownCharacterId(id);
    return CHARACTERS.find((c) => c.id === key) || CHARACTERS[0];
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function parseBonusFromNotes(notes) {
    const text = String(notes || '');
    const m = text.match(/(^|[^0-9dD])([+-]\d+)\b/);
    return m ? Number(m[2]) : null;
  }

  function normalizeItem(raw, extras) {
    if (!raw || typeof raw !== 'object') return item('Untitled', extras);
    const out = {
      id: typeof raw.id === 'string' && raw.id ? raw.id : uid('i'),
      name: String(raw.name || 'Untitled').trim() || 'Untitled',
      notes: String(raw.notes || ''),
    };
    if (extras && extras.attackType) {
      out.attackType = ['slash', 'pierce', 'blunt', 'magic'].includes(raw.attackType)
        ? raw.attackType
        : extras.attackType;
    } else if (raw.attackType) {
      out.attackType = raw.attackType;
    }
    if (raw.magicUse != null) out.magicUse = Boolean(raw.magicUse);
    if (extras && extras.spellKind) {
      out.spellKind = resolveSpellKind(raw);
      out.spellTargets = resolveSpellTargets(raw);
    } else {
      if (raw.spellKind && SPELL_KINDS.includes(raw.spellKind)) {
        out.spellKind = raw.spellKind;
      }
      if (raw.spellTargets && SPELL_TARGET_SCOPES.includes(raw.spellTargets)) {
        out.spellTargets = raw.spellTargets;
      }
    }
    if (extras && extras.withBonus) {
      if (raw.bonus != null && raw.bonus !== '' && Number.isFinite(Number(raw.bonus))) {
        out.bonus = Number(raw.bonus);
      } else {
        out.bonus = parseBonusFromNotes(out.notes) || 0;
      }
    }
    return out;
  }

  function normalizeList(list, extras) {
    if (!Array.isArray(list)) return [];
    return list.map((row) => normalizeItem(row, extras));
  }

  const GEAR_NOTE_UPGRADES = {
    'Amulet of Proof against Detection and Location': {
      from: [
        '',
        'attuned',
        'uncommon, attuned. Hidden from Divination; cannot be targeted by those spells or seen through scrying sensors unless you allow it.',
      ],
      to: 'uncommon, attuned (1 of 3 slots). While worn, you cannot be targeted by Divination spells or seen through scrying sensors unless you allow it.',
    },
    'Bag of Holding': {
      from: [
        '',
        'extradimensional; 500 lb / 64 cu ft; bag itself 15 lb. Retrieving an item is an action. Hag Eye is stashed in here. Do not put this inside another bag of holding.',
      ],
      to: 'uncommon. 500 lb / 64 cu ft; bag itself 5 lb. Retrieving an item is a Utilize action. 10 minutes of air, split among creatures inside. Hag Eye is stashed in here. Do not put this inside another bag of holding (Astral rupture).',
    },
    'Witchlight Carnival cloth wings': {
      from: ['', 'Carnival costume wings. Showpiece only; fly speed is from being a fairy, not these.'],
      to: 'Identified: carnival guest wings. Nonmagical badge that you paid. Fly speed is from being a fairy, not these.',
    },
    'Woodland pixies whistle': {
      from: [
        '',
        'summon 3 pixies for 1 hour',
        'Identified: blow to summon 3 pixies for 1 hour.',
        'Identified: 3 pixies for 1 hour. 2024: activating a magic item is a Magic action unless Geoe said otherwise. Recharge, command, and whether they obey you are not in the Identify note. Ask before the blow.',
      ],
      to: 'Identified: reed whistle from Spiderlily, Cowslip, and Maypole. Magic action, once this adventure. Summons those three pixies for 1 hour; no Concentration; they fly away after. Friendly; they act on their own Initiative and help if asked. 2024 pixie: AC 15, 9 HP, fly 30, Magic Resistance; Faerie Dust +4 (Charm or Poison until their next turn); DC 12; at will Dancing Lights, Druidcraft, Invisibility (self); 1/day Detect Thoughts, Fly, Sleep.',
    },
    'Granny Nightshade\'s iron ring': {
      from: [
        '',
        'loot from Skabatha',
        'Taken off Skabatha at Loomlurch. No Identify writeup in the D&D Beyond export; add Geoe\'s table text if you have it.',
      ],
      to: 'Identified as Skabatha\'s Ring of Keys. Opens the Loomlurch locks she carried (kitchen, study, cells, and the rest of her ring). Not a combat item. The wind-up key in her back was a separate body-key and is gone with her.',
    },
    'Mirror of Flattering': {
      from: ['', 'Named carnival/prize mirror. No official item by this name and no Identify writeup in the export.'],
      to: 'Identified: carnival prize mirror. Magic action, 1/Long Rest: study your flattering reflection; Advantage on your next Charisma check within 10 minutes.',
    },
    'Conductor\'s baton': {
      from: [
        '',
        'Carnival/parade baton. No Identify writeup in the export; treat as a prop unless Geoe gave it a power.',
        'Identified: carnival parade baton. Counts as an instrument spell focus. No other power.',
      ],
      to: 'Identified, attunable (one of 3 slots). Attuned, Action: give another creature Advantage on all attack rolls until the start of its next turn. Or Action: that creature can use its Reaction to take an extra Attack action. Not attuned: if you cast a healing spell while wielding it, the recipient(s) also gain 1d4+1 Temporary HP.',
    },
    'Pass without trace seed': {
      from: [
        '',
        'limited uses',
        'Identified Jan 2026: 4 uses. Each seed casts Pass without Trace for 1 hour (+10 Stealth; cannot be tracked except by magic).',
        'Identified Jan 2026: 4 uses (confirm remaining). 2024 Pass without Trace: Action, Concentration up to 1 hour, 30-ft Emanation; you and chosen creatures get +10 Stealth and leave no tracks. Table did not say the seed skips Concentration; ask Geoe if you plant one.',
      ],
      to: 'Identified: 4 uses. Magic action, consume 1 seed: Pass without Trace for 1 hour, no Concentration. 30-ft Emanation; you and chosen creatures get +10 Stealth and leave no tracks.',
    },
    'Hag Eye': {
      from: [
        '',
        'can damage the hag coven; in a bag of holding',
        'Identified: coven focus. Damaging or destroying it can hurt the remaining hags. Kept in the bag of holding.',
        'Identified: coven focus. Damaging or destroying it can hurt the remaining hags. Kept in the bag of holding (Utilize action to retrieve). Whether a hag can peek through it while it is in the bag is a table call.',
      ],
      to: 'Identified: uncommon coven eye. AC 10, 1 HP. 3 charges, all back at dawn. While holding it, spend 1 charge to cast Darkvision (self) or See Invisibility. Remaining coven hags can take a Magic action to see through it (Concentration) if they are on the same plane; in the bag they see the bag\'s dark interior. Destroy it: each remaining coven hag takes 3d10 Psychic and is Blinded for 24 hours. Utilize action to retrieve from the bag.',
    },
    'Cracked mirror-shard locket': {
      from: [
        '',
        'disadvantage 1/long rest; appearance inversion',
        'Identified: 1/long rest, appearance inversion that imposes disadvantage.',
        'Identified: 1/long rest, appearance inversion that imposes disadvantage. Action, whose face, duration, and disadvantage on what are not in the note; ask Geoe before you click it.',
      ],
      to: 'Identified: Magic action, 1/Long Rest, touch yourself or a willing creature. Appearance inverts for 1 hour (or until you end it, no action). While inverted, that creature has Disadvantage on attack rolls and Charisma checks.',
    },
    'Button-eye charm': {
      from: [
        '',
        '+1 Perception; attunable',
        'Identified: attunable; +1 Perception.',
        'Identified: attunable; +1 Perception. If attuned, Perception is +4 / passive 14 (sheet +3 / 13 is the unattuned number). Amulet already uses one of three attunement slots.',
      ],
      to: 'Identified: uncommon, attunement. +1 to Perception checks and passive Perception while attuned (sheet +3 / 13 becomes +4 / 14). Amulet already uses one of three attunement slots.',
    },
    'Potion of Heroism': {
      from: [
        '',
        'x2',
        'x2, rare. Drink (bonus action in 2024): 10 temp HP for 1 hour and Bless for 1 hour, no concentration. Blue, bubbles like it is boiling.',
      ],
      to: 'x2, rare. Drink or administer (Bonus Action): 10 Temporary HP for 1 hour and Bless for 1 hour, no Concentration. Blue, bubbles like it is boiling.',
    },
    'Beetle candy from Thither': {
      from: ['', 'Thither snack. No magic listed on the export; flavor loot unless Geoe said otherwise.'],
      to: 'Identified: Thither snack. Nonmagical food. One piece is a snack, not a potion.',
    },
    'Wanted poster: Will of the Feywild': {
      from: [''],
      to: 'Skabatha\'s poster. "This little troublemaker belongs to me. Bring him home alive and unharmed, and you\'ll win the heart of one you love." Bring Will home alive and unharmed. Nonmagical paper; the promise is hers.',
    },
    'Crown of Remembrance (Brawn)': {
      from: [''],
      to: 'Geoe Identify. Brawn wears this; not Blingus\'s attunement. Rare wondrous, attunement. Woven holly boughs, amber stone front and center. +1 AC and saving throws while worn. Once per day, Action: say Declan, Owen, or Tristan. Three allies within twenty feet gain Advantage on the next matching save before the start of Brawn\'s next turn (Declan CON, Owen DEX, Tristan WIS).',
    },
    'Charm of Heroism': {
      from: [''],
      to: '1 use, then it vanishes. Action, no components: cast Heroism as a 1st-level spell. Duration 1 minute. Uses your spellcasting ability (Blingus: CHA). 2024 Heroism: Touch, Concentration, willing creature is immune to Frightened and gains Temporary HP equal to your spellcasting modifier (+3) at the start of each of its turns. Not the Potion of Heroism. Charm text does not waive Concentration; do not invent that it does.',
    },
    'Blood-Slick Token': {
      from: [''],
      to: 'Uncommon wondrous. Flat iron charm etched with tally marks. When you reduce a creature to 0 HP, gain Temporary HP equal to your proficiency bonus (Blingus +3). Once per turn. No attunement listed. Grows warm when violence pleases it. Table-found as the blood-soaked token after the cloaked assassin at Lamorna was KO\'d.',
    },
  };

  function upgradeGearNotes(list) {
    const rows = Array.isArray(list) ? list.slice() : [];
    const haveBag = rows.some((r) => /^bag of holding$/i.test(r.name || ''));
    if (!haveBag) {
      rows.splice(1, 0, item('Bag of Holding', {
        notes: GEAR_NOTE_UPGRADES['Bag of Holding'].to,
      }));
    }
    const havePoster = rows.some((r) => /wanted poster|will of the (fey)?wild/i.test(r.name || ''));
    if (!havePoster) {
      rows.push(item('Wanted poster: Will of the Feywild', {
        notes: GEAR_NOTE_UPGRADES['Wanted poster: Will of the Feywild'].to,
      }));
    }
    const haveCrown = rows.some((r) => /crown of remembrance/i.test(r.name || ''));
    if (!haveCrown) {
      rows.push(item('Crown of Remembrance (Brawn)', {
        notes: GEAR_NOTE_UPGRADES['Crown of Remembrance (Brawn)'].to,
      }));
    }
    const haveHeroCharm = rows.some((r) => /charm of heroism/i.test(r.name || ''));
    if (!haveHeroCharm) {
      rows.push(item('Charm of Heroism', {
        notes: GEAR_NOTE_UPGRADES['Charm of Heroism'].to,
      }));
    }
    const haveToken = rows.some((r) => /blood-slick token|blood-soaked token/i.test(r.name || ''));
    if (!haveToken) {
      rows.push(item('Blood-Slick Token', {
        notes: GEAR_NOTE_UPGRADES['Blood-Slick Token'].to,
      }));
    }
    return rows.map((row) => {
      const spec = GEAR_NOTE_UPGRADES[row.name];
      if (!spec) return row;
      const old = String(row.notes || '').trim();
      if (spec.from.includes(old)) return Object.assign({}, row, { notes: spec.to });
      return row;
    });
  }

  function upgradeFeatures(list) {
    const rows = Array.isArray(list) ? list.slice() : [];
    const haveDash = rows.some((r) => /carnival dash/i.test(r.name || '') || /fly at twice/i.test(r.notes || ''));
    if (!haveDash) {
      const row = item('Carnival dash', {
        notes: '3 times this adventure (total, not per rest). Fly at twice your fly speed for 1 hour and +5 on Charisma checks. Table note from character notes; do not invent extra uses or a source item.',
      });
      const flightIdx = rows.findIndex((r) => /^flight$/i.test(r.name || ''));
      if (flightIdx >= 0) rows.splice(flightIdx + 1, 0, row);
      else rows.push(row);
    }
    return rows;
  }

  function splitCombinedEnlargeReduce(spells) {
    const list = Array.isArray(spells) ? spells : [];
    let combined = null;
    const kept = [];
    let hasEnlarge = false;
    let hasReduce = false;
    list.forEach((s) => {
      const name = String((s && s.name) || '').trim();
      if (/^enlarge\/reduce$/i.test(name)) {
        combined = s;
        return;
      }
      if (/^enlarge$/i.test(name)) hasEnlarge = true;
      if (/^reduce$/i.test(name)) hasReduce = true;
      kept.push(s);
    });
    if (!combined) return kept;
    const notes = combined.notes || '2nd; Fairy Magic; CON 14; 1/LR free';
    if (!hasEnlarge) kept.push(item('Enlarge', { notes: notes }));
    if (!hasReduce) kept.push(item('Reduce', { notes: notes }));
    return kept;
  }

  function stripRetiredNotes(text) {
    return String(text || '')
      .replace(/\s*Character notes: "Jamie, you beautiful bastard\." And Chris as well\. Do not invent who Jamie or Chris is\./g, '')
      .replace(/\s*Character note: "Jamie, you beautiful bastard\." Do not invent who Jamie is\./g, '')
      .replace(/\s*Player: Thindary\./g, '')
      .replace(/\s*Do not invent 4th-level spells or medium\/heavy armor flight\./g, '');
  }

  const PHOBIA_NOTE = 'Phobias: genuinely afraid and paranoid of the Tarrasque and rust monsters. Treats both as real threats that could be anywhere. The party thinks it is a bit; he does not. Do not invent that either is present unless the scene says so.';

  function ensurePhobiaNote(text) {
    const next = String(text || '');
    if (/\btarrasque\b/i.test(next) && /\brust monsters?\b/i.test(next)) return next;
    if (!next.trim()) return PHOBIA_NOTE;
    if (/^2024 rules\./m.test(next)) {
      return next.replace(/^(2024 rules\.[^\n]*)/m, '$1\n' + PHOBIA_NOTE);
    }
    return PHOBIA_NOTE + '\n' + next;
  }

  function cloneKitItem(row) {
    return item(row.name, {
      notes: row.notes,
      attackType: row.attackType,
      magicUse: row.magicUse,
      bonus: row.bonus,
      spellKind: row.spellKind,
      spellTargets: row.spellTargets,
    });
  }

  function hydrateNamedList(current, fallback) {
    if (current && current.length) return current;
    return (fallback || []).map(cloneKitItem);
  }

  function mergeMissingByName(current, fallback) {
    if (!fallback || !fallback.length) return current || [];
    if (!current || !current.length) return fallback.map(cloneKitItem);
    const have = new Set(current.map((row) => normalizeName(row.name)));
    const extra = fallback.filter((row) => row.name && !have.has(normalizeName(row.name)));
    return current.concat(extra.map(cloneKitItem));
  }

  function mergeKitFields(current, fallback) {
    if (!fallback || !fallback.length) return current || [];
    if (!current || !current.length) return fallback.map(cloneKitItem);
    const byName = new Map(fallback.map((row) => [normalizeName(row.name), row]));
    const merged = current.map((row) => {
      const base = byName.get(normalizeName(row.name));
      if (!base) return row;
      return item(row.name, {
        notes: notesNeedKitRefresh(row.notes) ? (base.notes || row.notes) : (row.notes || base.notes),
        attackType: row.attackType || base.attackType,
        magicUse: row.magicUse != null ? row.magicUse : base.magicUse,
        bonus: row.bonus != null && row.bonus !== 0 ? row.bonus : base.bonus,
        spellKind: row.spellKind || base.spellKind,
        spellTargets: row.spellTargets || base.spellTargets,
      });
    });
    return mergeMissingByName(merged, fallback);
  }

  function abilitiesAreEmpty(ab) {
    if (!ab) return true;
    return ['str', 'dex', 'con', 'int', 'wis', 'cha'].every((k) => !Number(ab[k]));
  }

  function combatNeedsPlaceholder(combat) {
    return !combat || !Number(combat.hpMax);
  }

  function notesNeedKitRefresh(notes) {
    const text = String(notes || '');
    if (!text.trim()) return true;
    if (/Imported from D&D Beyond/.test(text)) return false;
    if (/PLACEHOLDER/.test(text) && /\+\d/.test(text)) return false;
    return /class skill|Ranger kit|Monk kit|confirm known|confirm prepared/.test(text)
      && !/\+\d/.test(text);
  }

  function kitNameBlob(raw) {
    return []
      .concat(raw && raw.spells)
      .concat(raw && raw.features)
      .concat(raw && raw.weapons)
      .concat(raw && raw.gear)
      .map((row) => String(row && row.name || '').toLowerCase())
      .join(' | ');
  }

  function isBlingusShaped(raw, cid) {
    if (!raw || typeof raw !== 'object' || cid === 'blingus') return false;
    const id = raw.identity || {};
    const name = String(id.name || '').toLowerCase();
    const aka = String(id.aka || '').toLowerCase();
    const cls = String(id.className || '').toLowerCase();
    if (/\bblingus\b/.test(name) || /\bblingus\b/.test(aka)) return true;
    const want = { vadania: 'ranger', bruck: 'monk', puck: 'sorcerer' }[cid];
    if (want && /\bbard\b/.test(cls) && !new RegExp('\\b' + want + '\\b').test(cls)) return true;
    const blob = kitNameBlob(raw);
    return /vicious mockery|cutting words|bardic inspiration|clarinet|witchlight carnival cloth wings/.test(blob);
  }

  function incomingCharacterId(raw) {
    if (!raw || typeof raw !== 'object') return '';
    const cid = String(raw.characterId || '').toLowerCase();
    if (CHARACTERS.some((c) => c.id === cid)) return cid;
    const name = String((raw.identity || {}).name || '').toLowerCase();
    if (/vadania|van damme|\bvandan\b/.test(name)) return 'vadania';
    if (/bruck|brawn/.test(name)) return 'bruck';
    if (/\bpuck\b|pinewhistle/.test(name)) return 'puck';
    if (/blingus/.test(name)) return 'blingus';
    return '';
  }

  function acceptsRemoteSheet(raw) {
    const cid = getActiveId();
    if (!raw || typeof raw !== 'object') return false;
    if (isBlingusShaped(raw, cid)) return false;
    const incoming = incomingCharacterId(raw);
    if (incoming && incoming !== cid) return false;
    return true;
  }

  function shouldRefreshNotes(notes) {
    const text = String(notes || '');
    if (!text.trim()) return true;
    if (/Imported from D&D Beyond/.test(text)) return false;
    if (/PLACEHOLDER SHEET/.test(text)) return false;
    if (/Zeros in scores/.test(text)) return true;
    if (/Do not invent combat stats/.test(text)) return true;
    return false;
  }

  function isImportedSheet(raw) {
    if (!raw || typeof raw !== 'object') return false;
    if (raw.importedSheet || raw.importedFromDdb) return true;
    return /Imported from D&D Beyond/.test(String(raw.notes || ''));
  }

  function normalize(raw, characterId) {
    const cid = knownCharacterId(characterId || (raw && raw.characterId) || activeId);
    const base = defaultCharacter(cid);
    const isBlingus = cid === 'blingus';
    if (isBlingusShaped(raw, cid)) return base;
    if (!raw || typeof raw !== 'object') return base;
    const imported = isImportedSheet(raw);
    const id = raw.identity || {};
    const ab = raw.abilities || {};
    const combat = raw.combat || {};
    const features = normalizeList(raw.features);
    const gear = normalizeList(raw.gear);
    const spells = normalizeList(raw.spells, { spellKind: true });
    const notesRaw = raw.notes != null ? raw.notes : base.notes;
    const skills = normalizeList(raw.skills, { withBonus: true });
    const weapons = normalizeList(raw.weapons, { attackType: 'slash', withBonus: true });
    const usePlaceholderStats = !isBlingus && !imported && abilitiesAreEmpty(ab);
    const usePlaceholderCombat = !isBlingus && !imported && combatNeedsPlaceholder(combat);
    const useImportedLists = isBlingus || imported;
    return {
      version: isBlingus ? Math.max(3, Number(raw.version) || 0) : Math.max(4, Number(raw.version) || 0),
      characterId: cid,
      importedSheet: imported,
      identity: {
        name: String(id.name || base.identity.name),
        aka: String(id.aka || base.identity.aka),
        level: Number(id.level) || base.identity.level,
        className: String(id.className || base.identity.className),
        race: String(id.race || base.identity.race),
        alignment: String(id.alignment != null ? id.alignment : base.identity.alignment),
        background: String(id.background != null ? id.background : base.identity.background),
      },
      abilities: usePlaceholderStats ? Object.assign({}, base.abilities) : {
        str: Number(ab.str) || 0,
        dex: Number(ab.dex) || 0,
        con: Number(ab.con) || 0,
        int: Number(ab.int) || 0,
        wis: Number(ab.wis) || 0,
        cha: Number(ab.cha) || 0,
      },
      combat: usePlaceholderCombat ? Object.assign({}, base.combat) : {
        proficiency: Number(combat.proficiency) || 0,
        ac: Number(combat.ac) || 0,
        hpCurrent: Number(combat.hpCurrent) || 0,
        hpMax: Number(combat.hpMax) || 0,
        hitDice: String(combat.hitDice != null ? combat.hitDice : base.combat.hitDice),
        speed: String(combat.speed != null ? combat.speed : base.combat.speed),
      },
      skills: useImportedLists ? skills : normalizeList(mergeKitFields(skills, base.skills), { withBonus: true }),
      features: useImportedLists ? (isBlingus ? upgradeFeatures(features) : features) : mergeKitFields(features, base.features),
      armor: useImportedLists ? normalizeList(raw.armor) : mergeKitFields(normalizeList(raw.armor), base.armor),
      weapons: useImportedLists ? weapons : normalizeList(mergeKitFields(weapons, base.weapons), { attackType: 'slash', withBonus: true }),
      gear: useImportedLists ? (isBlingus ? upgradeGearNotes(gear) : gear) : mergeKitFields(gear, base.gear),
      spells: useImportedLists
        ? (isBlingus ? splitCombinedEnlargeReduce(spells) : spells)
        : normalizeList(mergeKitFields(spells, base.spells), { spellKind: true }),
      languages: Array.isArray(raw.languages)
        ? raw.languages.map((l) => String(l || '').trim()).filter(Boolean)
        : base.languages.slice(),
      notes: isBlingus
        ? ensurePhobiaNote(stripRetiredNotes(notesRaw))
        : (shouldRefreshNotes(notesRaw) ? base.notes : String(notesRaw || '')),
    };
  }

  function readStoredRoster() {
    try {
      const raw = localStorage.getItem(ROSTER_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function readLegacyBlingus() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function lockedCharacterId() {
    return window.BlingusSite?.lockedCharacterId?.() || null;
  }

  function loadActiveId() {
    const locked = lockedCharacterId();
    if (locked) return knownCharacterId(locked);
    try {
      return knownCharacterId(localStorage.getItem(ACTIVE_KEY));
    } catch (e) {
      return 'blingus';
    }
  }

  function load() {
    activeId = loadActiveId();
    const stored = readStoredRoster();
    CHARACTERS.forEach((c) => {
      if (stored[c.id]) roster[c.id] = stored[c.id];
    });
    if (!roster.blingus) {
      const legacy = readLegacyBlingus();
      if (legacy) roster.blingus = legacy;
    }
    const beforeNotes = roster[activeId] ? String(roster[activeId].notes || '') : '';
    let hydrated = false;
    CHARACTERS.forEach((c) => {
      const raw = roster[c.id];
      const rawVersion = raw ? Number(raw.version) : 0;
      roster[c.id] = normalize(raw, c.id);
      if (c.id !== 'blingus' && !isImportedSheet(raw) && (
        !raw
        || isBlingusShaped(raw, c.id)
        || rawVersion < 4
        || !(raw.skills || []).length
        || abilitiesAreEmpty(raw.abilities)
        || combatNeedsPlaceholder(raw.combat)
      )) hydrated = true;
    });
    sheet = roster[activeId];
    if (hydrated || (sheet && sheet.notes !== beforeNotes && beforeNotes)) persistNow();
    return sheet;
  }

  function get() {
    if (!sheet) load();
    return sheet;
  }

  const CLASS_KEYS = [
    'bard', 'sorcerer', 'wizard', 'warlock', 'cleric', 'druid',
    'paladin', 'ranger', 'monk', 'fighter', 'rogue', 'barbarian', 'artificer',
  ];
  const CASTER_KEYS = [
    'bard', 'sorcerer', 'wizard', 'warlock', 'cleric', 'druid',
    'paladin', 'ranger', 'artificer',
  ];
  const KIT_KEYS = ['ranger', 'monk', 'fighter', 'rogue', 'barbarian', 'paladin'];
  const PARTY_CLASS = {
    blingus: 'bard',
    vadania: 'ranger',
    bruck: 'monk',
    puck: 'sorcerer',
  };

  function classKeys(fromSheet) {
    const s = fromSheet || get();
    const id = s?.characterId || activeId;
    const forced = PARTY_CLASS[id];
    const cls = String(s?.identity?.className || '').toLowerCase();
    let found = CLASS_KEYS.filter((key) => new RegExp('\\b' + key + '\\b').test(cls));
    if (forced) {
      if (!found.includes(forced)) found = [forced, ...found];
      if (id !== 'blingus') found = found.filter((key) => key !== 'bard');
      if (!found.length) found = [forced];
    }
    return found.length ? found : (forced ? [forced] : ['generic']);
  }

  function hasClass(name, fromSheet) {
    return classKeys(fromSheet).includes(name);
  }

  function isCaster(fromSheet) {
    return classKeys(fromSheet).some((key) => CASTER_KEYS.includes(key));
  }

  function speakerName(fromSheet) {
    const id = (fromSheet || get())?.identity || {};
    return String(id.aka || id.name || 'Character').trim() || 'Character';
  }

  function namedNonBard(fromSheet) {
    const id = (fromSheet || get())?.characterId || activeId;
    return id === 'vadania' || id === 'bruck' || id === 'puck';
  }

  function hasKaraoke(fromSheet) {
    if (namedNonBard(fromSheet)) return false;
    return hasClass('bard', fromSheet);
  }

  function hasSongbook(fromSheet) {
    return !hasKaraoke(fromSheet);
  }

  function hasBardic(fromSheet) {
    if (namedNonBard(fromSheet)) return false;
    return hasClass('bard', fromSheet);
  }

  function classLinesKey(fromSheet) {
    if (hasClass('ranger', fromSheet)) return 'ranger';
    if (hasClass('monk', fromSheet)) return 'monk';
    if (hasClass('sorcerer', fromSheet)) return 'sorcerer';
    return '';
  }

  function classLinesLabel(fromSheet) {
    const key = classLinesKey(fromSheet);
    if (key === 'ranger') return 'Marks';
    if (key === 'monk') return 'Focus';
    if (key === 'sorcerer') return 'Surges';
    return 'Class';
  }

  function classLinesIcon(fromSheet) {
    const key = classLinesKey(fromSheet);
    if (key === 'ranger') return '🏹';
    if (key === 'monk') return '👊';
    if (key === 'sorcerer') return '🌀';
    return '✨';
  }

  function hasClassLines(fromSheet) {
    return Boolean(classLinesKey(fromSheet)) && !hasBardic(fromSheet);
  }

  function hasCastTab(fromSheet) {
    const s = fromSheet || get();
    const keys = classKeys(s);
    if (hasKaraoke(s) && keys.every((key) => key === 'bard')) return false;
    const fullCasters = ['sorcerer', 'wizard', 'warlock', 'cleric', 'druid'];
    if (keys.some((key) => fullCasters.includes(key))) return true;
    return Array.isArray(s.spells) && s.spells.length > 0;
  }

  function hasKitTab(fromSheet) {
    const s = fromSheet || get();
    if (classKeys(s).some((key) => KIT_KEYS.includes(key))) return true;
    if (hasKaraoke(s) && classKeys(s).every((key) => key === 'bard')) return false;
    return Array.isArray(s.weapons) && s.weapons.length > 0;
  }

  function visibleSections(fromSheet) {
    const s = fromSheet || get();
    const out = [];
    if (hasKaraoke(s)) out.push('spells');
    if (hasSongbook(s)) out.push('songs');
    if (hasBardic(s)) out.push('bardic');
    if (hasClassLines(s)) out.push('classLines');
    if (hasKitTab(s)) out.push('kit');
    if (hasCastTab(s)) out.push('cast');
    out.push('outcomes', 'character');
    return out;
  }

  function defaultSection(fromSheet) {
    return visibleSections(fromSheet)[0] || 'outcomes';
  }

  function listHasName(list, needle) {
    const want = String(needle || '').toLowerCase();
    return (list || []).some((row) => String(row && row.name || '').toLowerCase().includes(want));
  }

  function allowsOutcomeMod(modId, fromSheet) {
    const s = fromSheet || get();
    const race = String(s?.identity?.race || '').toLowerCase();
    const id = s?.characterId || activeId;
    if ((modId === 'mockery' || modId === 'cuttingWords' || modId === 'introduction')
        && id && id !== 'blingus' && PARTY_CLASS[id]) {
      return false;
    }
    if (modId === 'mockery') {
      return hasClass('bard', s) || listHasName(s.spells, 'vicious mockery');
    }
    if (modId === 'cuttingWords') {
      return hasClass('bard', s) || listHasName(s.features, 'cutting words');
    }
    if (modId === 'introduction') return hasClass('bard', s);
    if (modId === 'paulHarvey' || modId === 'productPlacement'
        || modId === 'infomercial' || modId === 'wrongSoundtrack'
        || modId === 'pharmaAd' || modId === 'confessional'
        || modId === 'cliffhanger' || modId === 'standup'
        || modId === 'troyMcClure' || modId === 'showtime'
        || modId === 'closer') {
      return id === 'blingus' || hasClass('bard', s);
    }
    if (modId === 'inspiration' || modId === 'songOfRest') {
      return hasClass('bard', s);
    }
    if (modId === 'healBuff') {
      return hasCastTab(s) || hasKaraoke(s) || (Array.isArray(s.spells) && s.spells.length > 0);
    }
    if (modId === 'trailCall') return hasClass('ranger', s);
    if (modId === 'focus') return hasClass('monk', s);
    if (modId === 'surge') return hasClass('sorcerer', s);
    if (modId === 'feyGambit') return /\bfairy\b|\bfey\b/.test(race);
    if (modId === 'spell') {
      return hasCastTab(s) || hasKaraoke(s) || (Array.isArray(s.spells) && s.spells.length > 0);
    }
    return true;
  }

  function persistNow() {
    if (sheet) {
      sheet.characterId = activeId;
      roster[activeId] = sheet;
    }
    try {
      const payload = {};
      CHARACTERS.forEach((c) => {
        if (roster[c.id]) payload[c.id] = roster[c.id];
      });
      localStorage.setItem(ROSTER_KEY, JSON.stringify(payload));
      localStorage.setItem(ACTIVE_KEY, activeId);
      if (roster.blingus) localStorage.setItem(STORAGE_KEY, JSON.stringify(roster.blingus));
    } catch (e) {
      /* ignore */
    }
    try {
      window.dispatchEvent(new CustomEvent('blingus-character-change', {
        detail: { sheet: clone(sheet), characterId: activeId },
      }));
    } catch (e) {
      /* ignore */
    }
    renderAllSwitchers();
  }

  function save(next) {
    sheet = normalize(next || sheet);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(persistNow, SAVE_DEBOUNCE_MS);
    return sheet;
  }

  function saveImmediate(next) {
    if (saveTimer) clearTimeout(saveTimer);
    sheet = normalize(next || sheet);
    persistNow();
    return sheet;
  }

  function reset() {
    sheet = defaultCharacter(activeId);
    saveImmediate(sheet);
    return sheet;
  }

  function getActiveId() {
    if (!sheet) load();
    return activeId;
  }

  function getRoster() {
    get();
    const out = {};
    CHARACTERS.forEach((c) => {
      if (roster[c.id]) out[c.id] = clone(roster[c.id]);
    });
    return out;
  }

  function listCharacters() {
    return CHARACTERS.map((c) => Object.assign({}, c, { active: c.id === getActiveId() }));
  }

  function setActive(characterId) {
    const locked = lockedCharacterId();
    const next = knownCharacterId(locked || characterId);
    if (!sheet) load();
    if (next === activeId) return sheet;
    persistNow();
    activeId = next;
    sheet = normalize(roster[next], next);
    roster[next] = sheet;
    persistNow();
    if (renderHost) render(renderHost);
    return sheet;
  }

  function setFromData(data) {
    sheet = normalize(data, activeId);
    if (sheet) sheet.characterId = activeId;
    saveImmediate(sheet);
    if (renderHost) render(renderHost);
    return sheet;
  }

  function mergeImportedNotes(existing, imported, meta) {
    const keep = String(existing || '').trim();
    const add = String(imported || '').trim();
    const stamp = 'Imported from D&D Beyond' + (meta && meta.fileName ? ' (' + meta.fileName + ')' : '') + '.';
    const keepIsPlaceholder = /PLACEHOLDER SHEET/.test(keep);
    const preserve = !keepIsPlaceholder && /TABLE-KNOWN|Witchlight|Phobias:|Quirk:/.test(keep);
    if (preserve) {
      const bits = [keep];
      if (add && keep.indexOf(add.slice(0, 80)) === -1) bits.push(add);
      if (keep.indexOf('Imported from D&D Beyond') === -1) bits.push(stamp);
      return bits.join('\n\n');
    }
    if (add) return add + (add.indexOf('Imported from D&D Beyond') === -1 ? '\n\n' + stamp : '');
    return keep || stamp;
  }

  async function importDdbFile(file) {
    if (!file) return null;
    if (!window.DdbSheetImport || !window.DdbSheetImport.parseFile) {
      throw new Error('Importer is not loaded.');
    }
    const result = await window.DdbSheetImport.parseFile(file);
    if (window.DdbSheetImport.sheetLooksPopulated && !window.DdbSheetImport.sheetLooksPopulated(result.sheet)) {
      throw new Error(result.error || 'This PDF has no readable stats. D&D Beyond print PDFs are images. Export the character as JSON and import that instead.');
    }
    const guessed = window.DdbSheetImport.guessRosterId(result.sheet);
    if (guessed && guessed !== activeId && !lockedCharacterId()) setActive(guessed);
    const current = get();
    const next = Object.assign({}, result.sheet, { characterId: activeId, importedSheet: true });
    next.notes = mergeImportedNotes(current.notes, result.sheet.notes, result);
    setFromData(next);
    result.appliedTo = characterMeta(activeId).label;
    return result;
  }

  function abilityMod(score) {
    return Math.floor((Number(score) - 10) / 2);
  }

  function modLabel(score) {
    const m = abilityMod(score);
    return (m >= 0 ? '+' : '') + m;
  }

  function listLine(rows) {
    if (!rows || !rows.length) return '(none)';
    return rows.map((r) => {
      const notes = (r.notes || '').trim();
      return notes ? `${r.name} (${notes})` : r.name;
    }).join('; ');
  }

  function toPersonalityBlock() {
    const c = get();
    const a = c.abilities;
    const combat = c.combat;
    const id = c.identity;
    const speaker = id.name || characterMeta(activeId).label;
    const lines = [
      `ACTIVE SPEAKER: ${speaker}` + (id.aka ? ` (aka ${id.aka})` : '') + `. Write as this character, not as anyone else.`,
      `Name: ${id.name}` + (id.aka ? ` (aka ${id.aka})` : ''),
      `Level ${id.level} ${id.race} ${id.className}, ${id.alignment}, ${id.background}.`,
      `STATS: STR ${a.str} (${modLabel(a.str)}), DEX ${a.dex} (${modLabel(a.dex)}), CON ${a.con} (${modLabel(a.con)}), INT ${a.int} (${modLabel(a.int)}), WIS ${a.wis} (${modLabel(a.wis)}), CHA ${a.cha} (${modLabel(a.cha)}); proficiency +${combat.proficiency}; AC ${combat.ac}; HP ${combat.hpCurrent}/${combat.hpMax}; Hit Dice ${combat.hitDice}; Speed ${combat.speed}.`,
      `SKILLS: ${listLine(c.skills)}.`,
      `FEATURES / FEATS: ${listLine(c.features)}.`,
      `ARMOR: ${listLine(c.armor)}.`,
      `WEAPONS: ${listLine(c.weapons)}.`,
      `GEAR: ${listLine(c.gear)}.`,
      `SPELLS / MAGIC OPTIONS: ${listLine(c.spells)}.`,
      `LANGUAGES: ${(c.languages || []).join(', ') || '(none)'}.`,
    ];
    if ((c.notes || '').trim()) lines.push(`NOTES: ${c.notes.trim()}`);
    lines.push('Honor this CURRENT CHARACTER SHEET over any older mechanical stats elsewhere in the personality text.');
    if (activeId !== 'blingus') {
      lines.push('This is NOT Blingus. Do not use Blingus\'s name-amnesia, clarinet, cloth wings, or Lore bard kit unless this sheet lists them.');
    }
    return lines.join('\n');
  }

  function getRollBonus(kind, name) {
    const c = get();
    const list = kind === 'weapon' ? (c.weapons || []) : (c.skills || []);
    const hit = list.find((row) => namesEqual(row.name, name));
    const n = hit ? Number(hit.bonus) : 0;
    return Number.isFinite(n) ? n : 0;
  }

  function getWeapons() {
    return get().weapons.slice();
  }

  function getWeaponsForAttackType(attackType) {
    const type = String(attackType || '').toLowerCase();
    return get().weapons.filter((w) => (w.attackType || '').toLowerCase() === type);
  }

  function normalizeName(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function namesEqual(a, b) {
    const left = normalizeName(a);
    const right = normalizeName(b);
    if (!left || !right) return false;
    return left === right || left.replace(/ /g, '') === right.replace(/ /g, '');
  }

  function findSheetItem(detail) {
    const needle = String(detail || '').trim();
    if (!needle) return null;
    const c = get();
    const pools = []
      .concat(c.weapons || [])
      .concat(c.spells || [])
      .concat(c.features || [])
      .concat(c.skills || [])
      .concat(c.armor || [])
      .concat(c.gear || []);
    return pools.find((row) => namesEqual(row.name, needle)) || null;
  }

  function matchDetail(detail) {
    const hit = findSheetItem(detail);
    if (!hit) return '';
    const notes = (hit.notes || '').trim();
    return notes ? `${hit.name} (${notes})` : hit.name;
  }

  /** Physics / family hint so Claude does not swap longbow for spear, bolt for arrow, etc. */
  function detailFamilyHint(detail, attackType) {
    const n = normalizeName(detail);
    if (!n) return '';
    if (/crossbow/.test(n)) {
      return 'Ranged CROSSBOW. Fires BOLTS, not arrows. Crank or lock, then shoot. Never a bow, spear, or melee thrust.';
    }
    if (/(^| )bow$|longbow|shortbow/.test(n)) {
      return 'Ranged BOW. Fires ARROWS. Nock, draw, loose. Never a spear, bolt, dagger, or melee thrust.';
    }
    if (/sling/.test(n)) {
      return 'Ranged SLING. Hurls bullets or stones. Not a bow and not a melee club swing.';
    }
    if (/dart/.test(n)) {
      return 'Thrown DART. Small ranged pierce. Not a bow or spear.';
    }
    if (/spear|javelin/.test(n)) {
      return 'SPEAR or JAVELIN. Melee thrust or thrown shaft. Haft and point. Not a bow.';
    }
    if (/trident|pike|glaive|halberd/.test(n)) {
      return 'POLEARM. Reach, thrust or sweep with a long haft. Not a bow or short blade.';
    }
    if (/dagger|sickle/.test(n)) {
      return 'SMALL BLADE. Stab or cut up close, or thrown if a dagger. Not a bow or spear.';
    }
    if (/rapier|shortsword|scimitar|longsword|greatsword/.test(n)) {
      return 'SWORD. Cut or thrust with a blade. Not a bow, spear, or hammer.';
    }
    if (/battleaxe|greataxe|handaxe|\baxe\b/.test(n)) {
      return 'AXE. Chopping blade. Not a bow or hammer.';
    }
    if (/hammer|maul|mace|club|flail|morningstar|war pick|quarterstaff/.test(n)) {
      return 'BLUNT or pick. Crush or punch. Not a bowshot or spear thrust.';
    }
    if (/whip/.test(n)) {
      return 'WHIP. Lash at reach. Not a bow or blade chop.';
    }
    if (/vicious mockery/.test(n)) return 'Cantrip: spoken psychic roast. No physical weapon.';
    if (/true strike/.test(n)) return 'Cantrip: radiant rider on a weapon attack he actually makes (dagger or shortbow unless Detail says otherwise). Not a standalone spear.';
    if (/thunderclap/.test(n)) return 'Cantrip: thunder burst around him. Not a weapon swing.';
    if (/starry wisp/.test(n)) return 'Cantrip: radiant ranged spark. Not a weapon.';
    if (/dissonant whispers/.test(n)) return '1st: psychic whisper that forces a flee. Not a weapon.';
    if (/thunderwave/.test(n)) return '1st: thunder cone shove. CON save; half on success. No spell attack roll.';
    if (/earth tremor/.test(n)) return '1st: ground shake, prone. Not a weapon.';
    if (/cloud of daggers/.test(n)) return '2nd: hovering magic daggers in a cube. No save. Not a held dagger stab.';
    if (/shatter/.test(n)) return '2nd: thunder burst. CON save; half on success. Not a weapon.';
    if (/fireball/.test(n)) return '3rd: fire burst. DEX save; half on success. No spell attack roll.';
    if (/heat metal/.test(n)) return '2nd: heat an enemy\'s metal gear. Not a weapon swing.';
    if (/phantasmal force/.test(n)) return '2nd: one-target illusion. Not a weapon.';
    if (/phantasmal killer/.test(n)) return 'Psychic fear-vision. Use this spell, not a weapon.';
    if (/synaptic static/.test(n)) return 'Psychic burst. Use this spell, not a weapon.';
    if (attackType === 'magic') {
      return `Spell: ${detail}. Use this spell's effect, not a weapon and not a different spell.`;
    }
    if (attackType === 'pierce' || attackType === 'slash' || attackType === 'blunt') {
      return `${detail}: use this exact weapon. Do not swap in a different ${attackType} weapon.`;
    }
    return '';
  }

  function detailBrief(detail, attackType) {
    const name = String(detail || '').trim();
    if (!name) return '';
    const hit = findSheetItem(name);
    const family = detailFamilyHint(name, attackType);
    const parts = [`Item in play: ${name}.`];
    if (hit) {
      const notes = (hit.notes || '').trim();
      parts.push(notes ? `On the standing sheet: ${hit.name} (${notes}).` : `On the standing sheet: ${hit.name}.`);
    } else {
      const keys = classKeys();
      let hint = 'Do not substitute a different kit item.';
      if (keys.includes('bard')) {
        hint = 'Do not substitute Dagger, Shortbow, Vicious Mockery, or any other kit item.';
      } else if (keys.includes('ranger')) {
        hint = 'Do not substitute Longbow, Shortsword, Hunter\'s Mark, or any other kit item.';
      } else if (keys.includes('monk')) {
        hint = 'Do not substitute Unarmed Strike, Quarterstaff, or any other kit item.';
      } else if (keys.includes('sorcerer')) {
        hint = 'Do not substitute Fire Bolt, Chaos Bolt, Fireball, or any other kit item.';
      }
      parts.push('Not on the standing sheet. Still use THIS exact item for every line. ' + hint);
    }
    if (family) parts.push(family);
    return parts.join(' ');
  }

  function getSpells() {
    return get().spells.slice();
  }

  function getSkillNames() {
    const fromSheet = (get().skills || []).map((row) => String(row && row.name || '').trim()).filter(Boolean);
    if (!fromSheet.length) {
      return [
        'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
        'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
        'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
        'Sleight of Hand', 'Stealth', 'Survival', 'Thieves\' Tools',
      ];
    }
    const order = [
      'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
      'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
      'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
      'Sleight of Hand', 'Stealth', 'Survival', 'Thieves\' Tools',
    ];
    const have = new Set(fromSheet.map((name) => name.toLowerCase()));
    const ordered = order.filter((name) => have.has(name.toLowerCase()));
    const extra = fromSheet.filter((name) => !order.some((known) => known.toLowerCase() === name.toLowerCase()));
    return ordered.concat(extra);
  }

  function getClassCombatOptions() {
    const empty = { slash: [], pierce: [], blunt: [], magic: [] };
    const id = getActiveId();
    if (id === 'vadania') {
      empty.pierce.push({ label: "Van Damme's marks", ids: ["Hunter's Mark", "Extra Attack"] });
      empty.slash.push({ label: "Van Damme's marks", ids: ["Hunter's Mark", "Extra Attack"] });
      empty.magic.push({ label: "Van Damme's marks", ids: ["Hunter's Mark"] });
      return empty;
    }
    if (id === 'bruck') {
      empty.blunt.push({
        label: "Brawn's focus",
        ids: ["Flurry of Blows", "Stunning Strike", "Patient Defense", "Step of the Wind", "Crown of Remembrance"],
      });
      return empty;
    }
    if (id === 'puck') {
      empty.magic.push({
        label: "Puke's surges",
        ids: ["Wild Magic Surge", "Tides of Chaos", "Innate Sorcery", "Fairy Magic"],
      });
      return empty;
    }
    return empty;
  }

  function getMagicOptions(options) {
    const kinds = options && options.kinds;
    const allow = Array.isArray(kinds) && kinds.length ? new Set(kinds) : null;
    const c = get();
    const spellRows = (c.spells || []).filter((s) => !allow || allow.has(resolveSpellKind(s)));
    const buckets = { attack: [], save: [], damage: [], other: [] };
    const seen = new Set();
    function addMagic(row) {
      const name = String(row && row.name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      const kind = resolveSpellKind(row);
      if (allow && !allow.has(kind)) return;
      seen.add(key);
      buckets[kind].push(name);
    }
    spellRows.forEach(addMagic);
    (c.features || []).forEach((row) => {
      if (row && row.magicUse) addMagic(row);
    });
    const labels = {
      attack: 'Spell attacks',
      save: 'Saving throws',
      damage: 'Damage (no attack roll)',
      other: 'Other (heal / utility)',
    };
    return SPELL_KINDS
      .filter((k) => !allow || allow.has(k))
      .map((k) => ({ label: labels[k], ids: uniqueNames(buckets[k]) }))
      .filter((g) => g.ids.length);
  }

  function uniqueNames(names) {
    const seen = new Set();
    const out = [];
    names.forEach((n) => {
      const key = n.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(n);
    });
    return out;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function field(labelText, input) {
    const wrap = el('label', 'sheet-field');
    wrap.appendChild(el('span', 'sheet-field__label', labelText));
    wrap.appendChild(input);
    return wrap;
  }

  function numInput(value, onChange, attrs) {
    const input = el('input', 'sheet-input sheet-input--num');
    input.type = 'number';
    input.value = value;
    if (attrs) Object.keys(attrs).forEach((k) => input.setAttribute(k, attrs[k]));
    input.addEventListener('change', () => onChange(Number(input.value)));
    return input;
  }

  function textInput(value, onChange, placeholder) {
    const input = el('input', 'sheet-input');
    input.type = 'text';
    input.value = value || '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('change', () => onChange(input.value));
    input.addEventListener('input', () => {
      /* live-update stored value without full re-render */
    });
    return input;
  }

  function notesInput(value, placeholder) {
    const input = document.createElement('textarea');
    input.className = 'sheet-input sheet-input--notes';
    input.rows = 1;
    input.value = value || '';
    input.title = value || '';
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('input', () => {
      input.title = input.value;
    });
    return input;
  }

  function bindText(input, apply) {
    input.addEventListener('change', () => {
      apply(input.value);
      save(sheet);
    });
  }

  function renderListSection(container, title, key, options) {
    options = options || {};
    const section = el('section', 'sheet-card');
    const head = el('div', 'sheet-card__head');
    head.appendChild(el('h3', 'sheet-card__title', title));
    const addBtn = el('button', 'btn btn--ghost btn--compact', '+ Add');
    addBtn.type = 'button';
    addBtn.addEventListener('click', () => {
      const extras = {};
      if (options.attackType) extras.attackType = options.attackType;
      if (options.magicUse) extras.magicUse = true;
      if (options.showSpellKind) extras.spellKind = 'other';
      if (key === 'weapons' || key === 'skills') extras.bonus = 0;
      sheet[key].push(item(options.defaultName || 'New item', extras));
      saveImmediate(sheet);
      if (renderHost) render(renderHost);
    });
    head.appendChild(addBtn);
    section.appendChild(head);
    if (options.showSpellKind) {
      section.appendChild(el(
        'p',
        'sheet-empty',
        'Attack = spell attack roll. Save = they roll a save. Damage = harm with no attack roll (Fireball, Magic Missile); still gets fail / make / N/A because many of these are save-for-half. Other = heal / utility. Multi = several creatures; Mixed if some fail and some make it.'
      ));
    }

    const list = el('div', 'sheet-list');
    if (!sheet[key].length) {
      list.appendChild(el('p', 'sheet-empty', 'None yet. Add one.'));
    }
    sheet[key].forEach((row, index) => {
      const rowEl = el('div', 'sheet-row');
      const name = textInput(row.name, () => {});
      name.classList.add('sheet-input--name');
      bindText(name, (v) => { sheet[key][index].name = v.trim() || 'Untitled'; });
      const notes = notesInput(row.notes, 'Notes');
      bindText(notes, (v) => { sheet[key][index].notes = v; });
      rowEl.appendChild(name);

      if (options.showAttackType) {
        const type = el('select', 'sheet-input sheet-input--select');
        ['slash', 'pierce', 'blunt', 'magic'].forEach((t) => {
          const opt = el('option', null, t);
          opt.value = t;
          if ((row.attackType || 'slash') === t) opt.selected = true;
          type.appendChild(opt);
        });
        type.addEventListener('change', () => {
          sheet[key][index].attackType = type.value;
          save(sheet);
        });
        rowEl.appendChild(type);
      }

      if (options.showSpellKind) {
        const kind = el('select', 'sheet-input sheet-input--select');
        kind.title = 'Spell attack, save, damage with no attack roll, or other';
        SPELL_KINDS.forEach((t) => {
          const opt = el('option', null, SPELL_KIND_LABELS[t]);
          opt.value = t;
          if (resolveSpellKind(row) === t) opt.selected = true;
          kind.appendChild(opt);
        });
        kind.addEventListener('change', () => {
          sheet[key][index].spellKind = kind.value;
          save(sheet);
        });
        rowEl.appendChild(kind);
        const targets = el('select', 'sheet-input sheet-input--select');
        targets.title = 'One target, or more than one';
        SPELL_TARGET_SCOPES.forEach((t) => {
          const opt = el('option', null, SPELL_TARGET_LABELS[t]);
          opt.value = t;
          if (resolveSpellTargets(row) === t) opt.selected = true;
          targets.appendChild(opt);
        });
        targets.addEventListener('change', () => {
          sheet[key][index].spellTargets = targets.value;
          save(sheet);
        });
        rowEl.appendChild(targets);
      }

      if (key === 'weapons' || key === 'skills') {
        const bonus = document.createElement('input');
        bonus.type = 'number';
        bonus.className = 'sheet-input sheet-input--bonus';
        bonus.title = 'Roll modifier';
        bonus.placeholder = '+0';
        bonus.value = String(Number(row.bonus) || 0);
        bonus.addEventListener('input', () => {
          sheet[key][index].bonus = Number(bonus.value) || 0;
          save(sheet);
        });
        rowEl.appendChild(bonus);
      }

      if (options.showMagicUse) {
        const magicLabel = el('label', 'sheet-check');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = Boolean(row.magicUse);
        cb.addEventListener('change', () => {
          sheet[key][index].magicUse = cb.checked;
          save(sheet);
        });
        magicLabel.appendChild(cb);
        magicLabel.appendChild(document.createTextNode(' Magic chip'));
        rowEl.appendChild(magicLabel);
      }

      rowEl.appendChild(notes);
      const del = el('button', 'btn btn--ghost btn--compact sheet-row__del', '×');
      del.type = 'button';
      del.title = 'Remove';
      del.addEventListener('click', () => {
        sheet[key].splice(index, 1);
        saveImmediate(sheet);
        if (renderHost) render(renderHost);
      });
      if (key === 'weapons' || key === 'skills') {
        const d20Btn = el('button', 'btn btn--ghost btn--compact sheet-row__d20', 'd20');
        d20Btn.type = 'button';
        d20Btn.title = 'Roll d20';
        const padHost = el('div', 'd20-pad-host');
        padHost.hidden = true;
        d20Btn.addEventListener('click', () => {
          const opening = padHost.hidden;
          padHost.hidden = !opening;
          if (opening && window.D20Roll) {
            window.D20Roll.renderPad(padHost, {
              kind: key === 'weapons' ? 'weapon' : 'skill',
              label: sheet[key][index].name,
              attackType: sheet[key][index].attackType || (key === 'weapons' ? 'slash' : ''),
              bonus: Number(sheet[key][index].bonus) || 0,
              onResolved: (payload) => {
                if (window.ActionWorkflow?.beginFromRoll) {
                  window.ActionWorkflow.beginFromRoll(payload);
                }
              },
            });
          }
        });
        rowEl.appendChild(d20Btn);
        rowEl.appendChild(del);
        const wrap = el('div', 'sheet-row-stack');
        wrap.appendChild(rowEl);
        wrap.appendChild(padHost);
        list.appendChild(wrap);
      } else {
        rowEl.appendChild(del);
        list.appendChild(rowEl);
      }
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  function render(host) {
    if (!host) return;
    renderHost = host;
    get();
    host.innerHTML = '';

    const meta = characterMeta(activeId);
    const root = el('div', 'character-sheet');
    const locked = Boolean(lockedCharacterId());
    let switcher = null;
    if (!locked) {
      const cast = el('div', 'character-sheet__cast');
      cast.appendChild(el('span', 'character-switcher__label', 'Playing as'));
      switcher = el('div', 'character-switcher chips chips--pills');
      switcher.setAttribute('data-character-switcher', '1');
      cast.appendChild(switcher);
      root.appendChild(cast);
    }
    const toolbar = el('div', 'character-sheet__toolbar');
    toolbar.appendChild(el('h2', 'character-sheet__heading', meta.label));
    const hint = el('p', 'character-sheet__hint', locked
      ? 'Live sheet for Outcomes and Claude. Edits save automatically.'
      : 'Live sheet for Outcomes and Claude. Switch characters anytime. Edits save automatically.');
    const actions = el('div', 'character-sheet__actions');
    const soundBtn = el('button', 'btn btn--secondary btn--compact', 'Sound off');
    soundBtn.type = 'button';
    if (window.D20Roll?.bindSoundToggle) window.D20Roll.bindSoundToggle(soundBtn);
    actions.appendChild(soundBtn);
    const resetBtn = el('button', 'btn btn--secondary btn--compact', 'Reset this sheet');
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', () => {
      const who = characterMeta(activeId).label;
      if (!confirm('Reset ' + who + '\'s sheet to the starter defaults? Your edits for this character will be lost.')) return;
      reset();
      render(host);
      if (typeof window.showToast === 'function') window.showToast(who + ' sheet reset');
    });
    actions.appendChild(resetBtn);
    const importBtn = el('button', 'btn btn--secondary btn--compact', 'Import D&D Beyond PDF or JSON');
    importBtn.type = 'button';
    importBtn.title = 'Prefer a D&D Beyond character JSON export. Print PDFs are images and usually have no readable stats.';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.json,application/pdf,application/json';
    fileInput.hidden = true;
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (!file) return;
      importBtn.disabled = true;
      importBtn.textContent = 'Reading…';
      try {
        const result = await importDdbFile(file);
        const extra = (result.warnings && result.warnings.length) ? ' ' + result.warnings[0] : '';
        if (typeof window.showToast === 'function') {
          window.showToast('Imported ' + (result.sheet.identity && result.sheet.identity.name || 'sheet') + ' onto ' + result.appliedTo + '.' + extra);
        }
      } catch (err) {
        if (typeof window.showToast === 'function') {
          window.showToast(err && err.message ? err.message : 'Could not import that file.');
        } else {
          alert(err && err.message ? err.message : 'Could not import that file.');
        }
      } finally {
        importBtn.disabled = false;
        importBtn.textContent = 'Import D&D Beyond PDF or JSON';
      }
    });
    importBtn.addEventListener('click', () => fileInput.click());
    actions.appendChild(importBtn);
    actions.appendChild(fileInput);
    toolbar.appendChild(hint);
    toolbar.appendChild(actions);
    root.appendChild(toolbar);

    const top = el('div', 'character-sheet__top');
    const main = el('div', 'character-sheet__main');
    const colLeft = el('div', 'character-sheet__col');
    const colRight = el('div', 'character-sheet__col');

    // Identity + combat
    const stats = el('section', 'sheet-card');
    stats.appendChild(el('h3', 'sheet-card__title', 'Identity & combat'));
    const grid = el('div', 'sheet-grid');
    const id = sheet.identity;
    const combat = sheet.combat;

    function idField(label, key) {
      const input = textInput(id[key], () => {});
      bindText(input, (v) => { sheet.identity[key] = v; });
      return field(label, input);
    }
    function combatNum(label, key) {
      return field(label, numInput(combat[key], (n) => {
        sheet.combat[key] = n;
        save(sheet);
      }));
    }

    grid.appendChild(idField('Name', 'name'));
    grid.appendChild(idField('Also known as', 'aka'));
    grid.appendChild(field('Level', numInput(id.level, (n) => { sheet.identity.level = n; save(sheet); }, { min: '1', max: '20' })));
    grid.appendChild(idField('Class', 'className'));
    grid.appendChild(idField('Race', 'race'));
    grid.appendChild(idField('Alignment', 'alignment'));
    grid.appendChild(idField('Background', 'background'));
    grid.appendChild(combatNum('Proficiency', 'proficiency'));
    grid.appendChild(combatNum('AC', 'ac'));
    grid.appendChild(combatNum('HP current', 'hpCurrent'));
    grid.appendChild(combatNum('HP max', 'hpMax'));
    const hd = textInput(combat.hitDice, () => {});
    bindText(hd, (v) => { sheet.combat.hitDice = v; });
    grid.appendChild(field('Hit dice', hd));
    const spd = textInput(combat.speed, () => {});
    bindText(spd, (v) => { sheet.combat.speed = v; });
    grid.appendChild(field('Speed', spd));
    stats.appendChild(grid);

    const hpRow = el('div', 'sheet-hp-nudge');
    [-1, 1].forEach((delta) => {
      const btn = el('button', 'btn btn--secondary btn--compact', delta > 0 ? 'HP +1' : 'HP −1');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        sheet.combat.hpCurrent = Math.max(0, Number(sheet.combat.hpCurrent) + delta);
        saveImmediate(sheet);
        render(host);
      });
      hpRow.appendChild(btn);
    });
    const full = el('button', 'btn btn--ghost btn--compact', 'Full heal');
    full.type = 'button';
    full.addEventListener('click', () => {
      sheet.combat.hpCurrent = sheet.combat.hpMax;
      saveImmediate(sheet);
      render(host);
    });
    hpRow.appendChild(full);
    stats.appendChild(hpRow);
    top.appendChild(stats);

    // Abilities
    const abCard = el('section', 'sheet-card sheet-card--abilities');
    abCard.appendChild(el('h3', 'sheet-card__title', 'Ability scores'));
    const abGrid = el('div', 'sheet-grid sheet-grid--abilities');
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach((key) => {
      const score = sheet.abilities[key];
      const wrap = field(key.toUpperCase() + ' (' + modLabel(score) + ')', numInput(score, (n) => {
        sheet.abilities[key] = n;
        saveImmediate(sheet);
        render(host);
      }, { min: '1', max: '30' }));
      abGrid.appendChild(wrap);
    });
    abCard.appendChild(abGrid);

    const langCard = el('section', 'sheet-card');
    langCard.appendChild(el('h3', 'sheet-card__title', 'Languages'));
    const langInput = textInput((sheet.languages || []).join(', '), () => {}, 'Common, Draconic, Elvish');
    bindText(langInput, (v) => {
      sheet.languages = v.split(',').map((s) => s.trim()).filter(Boolean);
    });
    langCard.appendChild(field('Languages', langInput));

    const topSide = el('div', 'character-sheet__top-side');
    topSide.appendChild(abCard);
    topSide.appendChild(langCard);
    top.appendChild(topSide);
    root.appendChild(top);

    renderListSection(colLeft, 'Skills', 'skills');
    renderListSection(colLeft, 'Features / feats', 'features', { showMagicUse: true, defaultName: 'New feature' });
    renderListSection(colLeft, 'Armor', 'armor', { defaultName: 'Armor' });
    renderListSection(colRight, 'Weapons', 'weapons', { showAttackType: true, attackType: 'slash', defaultName: 'Weapon' });
    renderListSection(colRight, 'Gear', 'gear', { defaultName: 'Gear' });
    renderListSection(colRight, 'Spells', 'spells', { defaultName: 'Spell', showSpellKind: true });
    main.appendChild(colLeft);
    main.appendChild(colRight);
    root.appendChild(main);

    const notesCard = el('section', 'sheet-card sheet-card--notes');
    const notesHead = el('div', 'sheet-card__head');
    notesHead.appendChild(el('h3', 'sheet-card__title', 'Character notes'));
    notesCard.appendChild(notesHead);
    notesCard.appendChild(el(
      'p',
      'sheet-empty',
      'Paste the real sheet, loot, wounds, or anything Claude should remember about ' + characterMeta(activeId).label + '\'s current status.'
    ));
    const notes = document.createElement('textarea');
    notes.className = 'sheet-input sheet-input--area sheet-input--notes-large';
    notes.rows = 12;
    notes.placeholder = 'Paste freely…';
    notes.value = sheet.notes || '';
    notes.addEventListener('input', () => {
      sheet.notes = notes.value;
      save(sheet);
    });
    notes.addEventListener('change', () => {
      sheet.notes = notes.value;
      saveImmediate(sheet);
    });
    notesCard.appendChild(notes);
    root.appendChild(notesCard);

    host.appendChild(root);
    renderSwitcher(switcher);
  }

  function updateCharacterTabLabel() {
    const tab = document.getElementById('characterTabLabel');
    if (tab) tab.textContent = 'Character · ' + characterMeta(activeId).label;
  }

  function renderSwitcher(host) {
    if (!host) return;
    host.innerHTML = '';
    host.classList.add('character-switcher', 'chips', 'chips--pills');
    host.setAttribute('role', 'tablist');
    host.setAttribute('aria-label', 'Active character');
    CHARACTERS.forEach((c) => {
      const btn = el('button', 'chip chip--pill' + (c.id === activeId ? ' chip--active' : ''), c.label);
      btn.type = 'button';
      btn.setAttribute('aria-pressed', c.id === activeId ? 'true' : 'false');
      btn.addEventListener('click', () => {
        setActive(c.id);
        if (typeof window.showToast === 'function') window.showToast('Playing as ' + c.label);
      });
      host.appendChild(btn);
    });
    updateCharacterTabLabel();
  }

  function renderAllSwitchers() {
    document.querySelectorAll('[data-character-switcher]').forEach(renderSwitcher);
  }

  // Eager load
  load();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAllSwitchers);
  } else {
    renderAllSwitchers();
  }

  window.CharacterSheet = {
    STORAGE_KEY,
    ROSTER_KEY,
    ACTIVE_KEY,
    CHARACTERS,
    defaultCharacter,
    load,
    get,
    getActiveId,
    getRoster,
    acceptsRemoteSheet,
    classKeys,
    hasClass,
    isCaster,
    speakerName,
    namedNonBard,
    hasKaraoke,
    hasSongbook,
    hasBardic,
    hasClassLines,
    classLinesKey,
    classLinesLabel,
    classLinesIcon,
    hasCastTab,
    hasKitTab,
    visibleSections,
    defaultSection,
    allowsOutcomeMod,
    lockedCharacterId,
    getSkillNames,
    listCharacters,
    setActive,
    save,
    saveImmediate,
    reset,
    setFromData,
    importDdbFile,
    toPersonalityBlock,
    renderSwitcher,
    getRollBonus,
    getWeapons,
    getWeaponsForAttackType,
    getSpells,
    getMagicOptions,
    getClassCombatOptions,
    resolveSpellKind,
    resolveSpellTargets,
    matchDetail,
    detailBrief,
    render,
  };

  if (window.TabNavigation?.refreshForCharacter) {
    window.TabNavigation.refreshForCharacter();
  }
})();
