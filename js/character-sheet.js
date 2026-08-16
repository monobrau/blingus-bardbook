/**
 * Editable Blingus character sheet: stats, skills, features, armor, weapons, gear, spells.
 * Feeds Claude generate prompts and Outcomes kit chips.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusCharacterV2';
  const SAVE_DEBOUNCE_MS = 250;
  let saveTimer = null;
  let sheet = null;
  let renderHost = null;

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

  function defaultCharacter() {
    return {
      version: 2,
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
        'Wild Beyond the Witchlight / Prismeer. DM Geoe. Party: Puck Pinewhistle (wild magic sorcerer fairy), Brawn O\'Neil/O\'Neal (dwarven monk; has the Crown of Remembrance), Vadania Amakiir (elven ranger; Vandan / Van Damme), Bo (toad-cauldron era, enlarge, dragon breath at Granny).',
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
        'Blingus backstory (his telling): never fit the High Forest fairies; wanderlust louder than a maybe-family; found purpose under Bo, a warlock bound to Zybilna who went silent over a year. Motto: the world\'s a big place, and big problems don\'t solve themselves.',
      ].join('\n'),
    };
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

  function normalize(raw) {
    const base = defaultCharacter();
    if (!raw || typeof raw !== 'object') return base;
    const id = raw.identity || {};
    const ab = raw.abilities || {};
    const combat = raw.combat || {};
    return {
      version: 1,
      identity: {
        name: String(id.name || base.identity.name),
        aka: String(id.aka || base.identity.aka),
        level: Number(id.level) || base.identity.level,
        className: String(id.className || base.identity.className),
        race: String(id.race || base.identity.race),
        alignment: String(id.alignment || base.identity.alignment),
        background: String(id.background || base.identity.background),
      },
      abilities: {
        str: Number(ab.str) || 0,
        dex: Number(ab.dex) || 0,
        con: Number(ab.con) || 0,
        int: Number(ab.int) || 0,
        wis: Number(ab.wis) || 0,
        cha: Number(ab.cha) || 0,
      },
      combat: {
        proficiency: Number(combat.proficiency) || 0,
        ac: Number(combat.ac) || 0,
        hpCurrent: Number(combat.hpCurrent) || 0,
        hpMax: Number(combat.hpMax) || 0,
        hitDice: String(combat.hitDice || base.combat.hitDice),
        speed: String(combat.speed || base.combat.speed),
      },
      skills: normalizeList(raw.skills, { withBonus: true }),
      features: upgradeFeatures(normalizeList(raw.features)),
      armor: normalizeList(raw.armor),
      weapons: normalizeList(raw.weapons, { attackType: 'slash', withBonus: true }),
      gear: upgradeGearNotes(normalizeList(raw.gear)),
      spells: splitCombinedEnlargeReduce(normalizeList(raw.spells, { spellKind: true })),
      languages: Array.isArray(raw.languages)
        ? raw.languages.map((l) => String(l || '').trim()).filter(Boolean)
        : base.languages.slice(),
      notes: ensurePhobiaNote(stripRetiredNotes(raw.notes)),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const beforeNotes = String(parsed.notes || '');
        sheet = normalize(parsed);
        if (sheet.notes !== beforeNotes) persistNow();
        return sheet;
      }
    } catch (e) {
      /* ignore */
    }
    sheet = defaultCharacter();
    return sheet;
  }

  function get() {
    if (!sheet) load();
    return sheet;
  }

  function persistNow() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
    } catch (e) {
      /* ignore */
    }
    try {
      window.dispatchEvent(new CustomEvent('blingus-character-change', { detail: { sheet: clone(sheet) } }));
    } catch (e) {
      /* ignore */
    }
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
    sheet = defaultCharacter();
    saveImmediate(sheet);
    return sheet;
  }

  function setFromData(data) {
    sheet = normalize(data);
    saveImmediate(sheet);
    return sheet;
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
    const lines = [
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
      parts.push('Not on the standing sheet. Still use THIS exact item for every line. Do not substitute Dagger, Shortbow, Vicious Mockery, or any other kit item.');
    }
    if (family) parts.push(family);
    return parts.join(' ');
  }

  function getSpells() {
    return get().spells.slice();
  }

  function getMagicOptions(options) {
    const kinds = options && options.kinds;
    const allow = Array.isArray(kinds) && kinds.length ? new Set(kinds) : null;
    const c = get();
    const spellRows = (c.spells || []).filter((s) => !allow || allow.has(resolveSpellKind(s)));
    const buckets = { attack: [], save: [], damage: [], other: [] };
    spellRows.forEach((s) => {
      const name = String(s.name || '').trim();
      if (!name) return;
      buckets[resolveSpellKind(s)].push(name);
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

    const root = el('div', 'character-sheet');
    const toolbar = el('div', 'character-sheet__toolbar');
    toolbar.appendChild(el('h2', 'character-sheet__heading', 'Character'));
    const hint = el('p', 'character-sheet__hint', 'Live sheet for Outcomes and Claude. Edit freely; changes save automatically.');
    const actions = el('div', 'character-sheet__actions');
    const soundBtn = el('button', 'btn btn--secondary btn--compact', 'Sound off');
    soundBtn.type = 'button';
    if (window.D20Roll?.bindSoundToggle) window.D20Roll.bindSoundToggle(soundBtn);
    actions.appendChild(soundBtn);
    const resetBtn = el('button', 'btn btn--secondary btn--compact', 'Reset to L5 sheet');
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', () => {
      if (!confirm('Reset Blingus\'s sheet to the D&D Beyond level 5 defaults? Your edits will be lost.')) return;
      reset();
      render(host);
      if (typeof window.showToast === 'function') window.showToast('Character sheet reset');
    });
    actions.appendChild(resetBtn);
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
      'Paste the real sheet, loot, wounds, or anything Claude should remember about Blingus\'s current status.'
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
  }

  // Eager load
  load();

  window.CharacterSheet = {
    STORAGE_KEY,
    defaultCharacter,
    load,
    get,
    save,
    saveImmediate,
    reset,
    setFromData,
    toPersonalityBlock,
    getRollBonus,
    getWeapons,
    getWeaponsForAttackType,
    getSpells,
    getMagicOptions,
    resolveSpellKind,
    resolveSpellTargets,
    matchDetail,
    detailBrief,
    render,
  };
})();
