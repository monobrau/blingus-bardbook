/**
 * Progressive Outcomes wizard (pill questions):
 * 1. What do you need? (outcome type)
 * 2. Where are you? (scene pills)
 * 3. Attack type / skill (when needed)
 * 4. Weapon or bard spell (combat) / target
 * 5. Focus name (optional)
 */
(function () {
  'use strict';

  // Unified "outcomes" tab plus legacy section ids for old bookmarks/shortcuts.
  const WORKFLOW_SECTIONS = new Set([
    'outcomes', 'actions', 'criticalHits', 'criticalFailures', 'skillChecks',
  ]);

  const SKILL_NAMES = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival', 'Thieves\' Tools',
  ];

  /** Crit hit/fail: damage family first, then D&D 5.5e (2024) options. */
  const ATTACK_TYPES = [
    { id: 'slash', label: '⚔️ Slash' },
    { id: 'pierce', label: '🏹 Pierce' },
    { id: 'blunt', label: '🔨 Blunt' },
    { id: 'magic', label: '✨ Magic' },
  ];

  const FALLBACK_ATTACK_OPTIONS = {
    slash: [
      {
        label: 'Weapons',
        ids: [
          'Battleaxe', 'Greataxe', 'Handaxe', 'Longsword', 'Scimitar',
          'Greatsword', 'Glaive', 'Halberd', 'Sickle', 'Whip',
        ],
      },
    ],
    pierce: [
      {
        label: 'Weapons',
        ids: [
          'Dagger', 'Shortsword', 'Rapier', 'Spear', 'Javelin', 'Trident',
          'Pike', 'Morningstar', 'War Pick', 'Shortbow', 'Longbow',
          'Light Crossbow', 'Hand Crossbow', 'Heavy Crossbow', 'Dart',
        ],
      },
    ],
    blunt: [
      {
        label: 'Weapons',
        ids: [
          'Club', 'Greatclub', 'Mace', 'Light Hammer', 'Warhammer', 'Maul',
          'Flail', 'Quarterstaff', 'Sling',
        ],
      },
    ],
    magic: [
      {
        label: 'Bard Cantrips',
        ids: ['Vicious Mockery', 'Thunderclap', 'Starry Wisp', 'True Strike'],
      },
      {
        label: 'Bard Spells',
        ids: [
          'Dissonant Whispers', 'Thunderwave', 'Earth Tremor',
          'Cloud of Daggers', 'Shatter', 'Heat Metal', 'Phantasmal Force',
          'Phantasmal Killer', 'Synaptic Static',
        ],
      },
    ],
  };

  function uniqueIds(ids) {
    const seen = new Set();
    const out = [];
    (ids || []).forEach((id) => {
      const key = String(id || '').toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(id);
    });
    return out;
  }

  function cloneGroups(groups) {
    return (groups || []).map((g) => ({ label: g.label, ids: (g.ids || []).slice() }));
  }

  function getAttackOptions() {
    const fallback = FALLBACK_ATTACK_OPTIONS;
    const sheet = window.CharacterSheet;
    if (!sheet?.getWeaponsForAttackType && !sheet?.getMagicOptions) {
      return fallback;
    }

    const out = {
      slash: [],
      pierce: [],
      blunt: [],
      magic: [],
    };

    ['slash', 'pierce', 'blunt'].forEach((type) => {
      const kitIds = uniqueIds(
        (sheet.getWeaponsForAttackType(type) || []).map((w) => w.name).filter(Boolean)
      );
      const otherIds = (fallback[type] || []).flatMap((g) => g.ids || []);
      const otherFiltered = uniqueIds(
        otherIds.filter((id) => !kitIds.some((k) => k.toLowerCase() === String(id).toLowerCase()))
      );
      if (kitIds.length) out[type].push({ label: "Blingus's kit", ids: kitIds });
      if (otherFiltered.length) {
        out[type].push({
          label: type === 'blunt' && !kitIds.length ? 'Weapons' : 'Other weapons',
          ids: otherFiltered,
        });
      }
      if (!out[type].length) out[type] = cloneGroups(fallback[type]);
    });

    const magicGroups = sheet.getMagicOptions?.() || [];
    if (magicGroups.length) {
      out.magic = magicGroups
        .map((g) => ({ label: g.label, ids: uniqueIds(g.ids || []) }))
        .filter((g) => g.ids.length);
    }
    if (!out.magic.length) out.magic = cloneGroups(fallback.magic);
    return out;
  }

  const OUTCOME_MODS = [
    { id: 'roleplay', label: '🎭 Roleplay', group: 'scene' },
    { id: 'meanwhile', label: '🧚 Meanwhile', group: 'scene' },
    { id: 'hit', label: '⚔️ Crit Hit', group: 'scene' },
    { id: 'fail', label: '💥 Crit Fail', group: 'scene' },
    { id: 'success', label: '✅ Success', group: 'scene' },
    { id: 'failure', label: '❌ Failure', group: 'scene' },
    { id: 'battleCry', label: '📢 Battle Cry', group: 'speech' },
    { id: 'mockery', label: '🗡️ Vicious Mockery', group: 'speech' },
    { id: 'cuttingWords', label: '✂️ Cutting Words', group: 'speech' },
    { id: 'insult', label: '💬 Insult', group: 'speech' },
    { id: 'compliment', label: '💬 Compliment', group: 'speech' },
    { id: 'toast', label: '🥂 Toast', group: 'speech' },
    { id: 'introduction', label: '🎭 Chaucer Intro', group: 'speech' },
    { id: 'feyGambit', label: '🧚 Fey Gambit', group: 'speech' },
  ];

  const BATTLE_LINE_COUNT = 5;
  const ROLEPLAY_LINE_COUNT = 5;

  const PACE_OPTIONS = [
    { id: 'battle', label: '⚔️ In battle', hint: '~6s, 5 options' },
    { id: 'roleplay', label: '🎭 Out of battle', hint: 'longer 5-liners' },
  ];

  /** Outcome types available for each pace. Skills + insults appear in both. */
  const MODS_BY_PACE = {
    battle: ['hit', 'fail', 'success', 'failure', 'mockery', 'cuttingWords', 'battleCry', 'insult', 'toast'],
    roleplay: ['roleplay', 'meanwhile', 'success', 'failure', 'mockery', 'cuttingWords', 'insult', 'compliment', 'toast', 'introduction', 'feyGambit'],
  };

  const SPEECH_META = {
    battleCry: {
      section: 'outcomes',
      category: 'battleCries',
      metaLabel: 'Battle Cry',
      modalPrefix: '📢',
    },
    mockery: {
      section: 'outcomes',
      category: 'mockery',
      metaLabel: 'Vicious Mockery',
      modalPrefix: '🗡️',
    },
    cuttingWords: {
      section: 'outcomes',
      category: 'cuttingWords',
      metaLabel: 'Cutting Words',
      modalPrefix: '✂️',
    },
    feyGambit: {
      section: 'outcomes',
      category: 'feyGambits',
      metaLabel: 'Fey Gambit',
      modalPrefix: '🧚',
    },
    insult: {
      section: 'outcomes',
      category: 'insults',
      metaLabel: 'Insult',
      modalPrefix: '💬',
    },
    compliment: {
      section: 'outcomes',
      category: 'compliments',
      metaLabel: 'Compliment',
      modalPrefix: '💬',
    },
    toast: {
      section: 'outcomes',
      category: 'toasts',
      metaLabel: 'Toast',
      modalPrefix: '🥂',
    },
    introduction: {
      section: 'outcomes',
      category: 'introductions',
      metaLabel: 'Chaucer Introduction',
      modalPrefix: '🎭',
    },
  };

  /** Fallback roster; prefers live list from localStorage / script.js when present. */
  const DEFAULT_PARTY_MEMBERS = [
    { id: 'blingus', name: 'Blingus', label: '🧚 Blingus' },
    { id: 'brawn', name: "Brawn O'Neil", label: '💪 Brawn' },
    { id: 'puck', name: 'Puck Pinewhistle', label: '✨ Puck' },
    { id: 'vadania', name: 'Vadania Amakiir', label: '🏹 Vadania' },
    { id: 'bo', name: 'Bo', label: '🍺 Bo' },
  ];

  const PARTY_LABEL_ICONS = {
    blingus: '🧚',
    brawn: '💪',
    puck: '✨',
    puke: '✨',
    vadania: '🏹',
    vandan: '🏹',
    'van damme': '🎭',
    bo: '🍺',
  };

  // Canonical name is Vadania; nicknames still resolve for pills / party mode.
  const PARTY_NAME_ALIASES = {
    vadania: 'Vadania Amakiir',
    vandan: 'Vadania Amakiir',
    'van damme': 'Vadania Amakiir',
    vandamme: 'Vadania Amakiir',
    puke: 'Puck Pinewhistle',
  };

  function partyIconFor(name) {
    const key = String(name || '').trim().toLowerCase();
    if (PARTY_LABEL_ICONS[key]) return PARTY_LABEL_ICONS[key];
    const first = key.split(/\s+/)[0];
    return PARTY_LABEL_ICONS[first] || '🎲';
  }

  function getPartyMembers() {
    try {
      const raw = localStorage.getItem('blingusPartyMembersV1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed
            .filter((n) => typeof n === 'string' && n.trim())
            .map((name) => {
              const trimmed = name.trim();
              const canonical = PARTY_NAME_ALIASES[trimmed.toLowerCase()] || trimmed;
              const short = canonical.split(/\s+/)[0];
              return {
                id: short.toLowerCase().replace(/[^a-z0-9]+/g, ''),
                name: canonical,
                label: `${partyIconFor(canonical)} ${short}`,
              };
            });
        }
      }
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_PARTY_MEMBERS.slice();
  }

  const FEYWILD_PLACES = [
    { id: 'Carnival / Feywild (Wild Beyond The Witchlight)', label: '🎪 Carnival', setting: 'both', type: 'special', region: 'prismeer' },
    { id: 'Hither swamp', label: '🐸 Hither swamp', setting: 'outdoors', type: 'wilderness', region: 'prismeer' },
    { id: 'Downfall', label: '👑 Downfall', setting: 'outdoors', type: 'social', region: 'prismeer' },
    { id: "Bavlorna's hut", label: "🏚️ Bavlorna's hut", setting: 'indoors', type: 'adventure', region: 'prismeer' },
    { id: 'Walking Inn', label: '🐌 Walking Inn', setting: 'indoors', type: 'social', region: 'prismeer' },
    { id: 'Tellamy Hill', label: '⛰️ Tellamy Hill', setting: 'outdoors', type: 'wilderness', region: 'prismeer' },
    { id: "Jingle-Jangle's cave", label: "🔑 Jingle-Jangle's cave", setting: 'indoors', type: 'dungeon', region: 'prismeer' },
    { id: 'Thither woods', label: '🌲 Thither woods', setting: 'outdoors', type: 'wilderness', region: 'prismeer' },
    { id: 'Loomlurch', label: '🌳 Loomlurch', setting: 'both', type: 'adventure', region: 'prismeer' },
    { id: 'Wayward Pool', label: '💧 Wayward Pool', setting: 'outdoors', type: 'wilderness', region: 'prismeer' },
    { id: 'Old fortress', label: '🏰 Old fortress', setting: 'both', type: 'adventure', region: 'prismeer' },
    { id: 'Yon peaks', label: '🗻 Yon peaks', setting: 'outdoors', type: 'wilderness', region: 'prismeer' },
    { id: "Lamorna's lake", label: "🦄 Lamorna's lake", setting: 'outdoors', type: 'wilderness', region: 'prismeer' },
    { id: "Palace of Heart's Desire", label: "❄️ Palace of Heart's Desire", setting: 'indoors', type: 'special', region: 'prismeer' },
    { id: 'Puppet theater', label: '🎭 Puppet theater', setting: 'indoors', type: 'adventure', region: 'prismeer' },
    { id: 'Fey crossing', label: '🍄 Fey crossing', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Twilight market', label: '🌙 Twilight market', setting: 'outdoors', type: 'social', region: 'feywild' },
    { id: 'Pixie revel', label: '✨ Pixie revel', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Talking-tree grove', label: '🌳 Talking-tree grove', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Mirror pool', label: '🪞 Mirror pool', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Hedge maze', label: '🌿 Hedge maze', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Toadstool village', label: '🍄 Toadstool village', setting: 'outdoors', type: 'social', region: 'feywild' },
    { id: 'Goblin market', label: '🛒 Goblin market', setting: 'outdoors', type: 'social', region: 'feywild' },
    { id: 'Satyr camp', label: '🐐 Satyr camp', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Moonlit glade', label: '🌕 Moonlit glade', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Thornwall', label: '🥀 Thornwall', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: "Will-o'-wisp fen", label: "👻 Will-o'-wisp fen", setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Fey road', label: '🛤️ Fey road', setting: 'outdoors', type: 'wilderness', region: 'feywild' },
    { id: 'Crystal cave', label: '💎 Crystal cave', setting: 'indoors', type: 'dungeon', region: 'feywild' },
    { id: 'Hag hut', label: '🏚️ Hag hut', setting: 'indoors', type: 'adventure', region: 'feywild' },
  ];

  const FEYWILD_ENEMIES = [
    { id: 'bullywug', name: 'Bullywug', label: '🐸 Bullywug', group: 'prismeer' },
    { id: 'giant-snake', name: 'Giant snake', label: '🐍 Giant snake', group: 'prismeer' },
    { id: 'mud-muffin', name: 'Mud muffin', label: '🧁 Mud muffin', group: 'prismeer' },
    { id: 'will-o-wisp', name: "Will-o'-wisp", label: "👻 Will-o'-wisp", group: 'prismeer' },
    { id: 'shambling-mound', name: 'Shambling mound', label: '🌿 Shambling mound', group: 'prismeer' },
    { id: 'mimic-chair', name: 'Mimic chair', label: '🪑 Mimic chair', group: 'prismeer' },
    { id: 'marching-band', name: 'Marching band', label: '🎺 Marching band', group: 'prismeer' },
    { id: 'black-pudding', name: 'Black pudding', label: '⬛ Black pudding', group: 'prismeer' },
    { id: 'tree-creature', name: 'Tree creature', label: '🌲 Tree creature', group: 'prismeer' },
    { id: 'manticore', name: 'Manticore', label: '🦁 Manticore', group: 'prismeer' },
    { id: 'green-dragon', name: 'Green dragon', label: '🐉 Green dragon', group: 'prismeer' },
    { id: 'cloaked-assassin', name: 'Cloaked assassin', label: '🗡️ Cloaked assassin', group: 'prismeer' },
    { id: 'jabberwock', name: 'Jabberwock', label: '🐲 Jabberwock', group: 'prismeer' },
    { id: 'redcap', name: 'Redcap', label: '🧢 Redcap', group: 'feywild' },
    { id: 'quickling', name: 'Quickling', label: '⚡ Quickling', group: 'feywild' },
    { id: 'darkling', name: 'Darkling', label: '🌑 Darkling', group: 'feywild' },
    { id: 'meenlock', name: 'Meenlock', label: '🦞 Meenlock', group: 'feywild' },
    { id: 'displacer-beast', name: 'Displacer beast', label: '🐾 Displacer beast', group: 'feywild' },
    { id: 'blink-dog', name: 'Blink dog', label: '🐕 Blink dog', group: 'feywild' },
    { id: 'scarecrow', name: 'Scarecrow', label: '🌾 Scarecrow', group: 'feywild' },
    { id: 'boggle', name: 'Boggle', label: '🫧 Boggle', group: 'feywild' },
    { id: 'yeth-hound', name: 'Yeth hound', label: '🐺 Yeth hound', group: 'feywild' },
    { id: 'harengon', name: 'Harengon brigand', label: '🐇 Harengon', group: 'feywild' },
    { id: 'animated-toy', name: 'Animated toy', label: '🧸 Animated toy', group: 'feywild' },
    { id: 'giant-toad', name: 'Giant toad', label: '🐸 Giant toad', group: 'feywild' },
    { id: 'vine-blight', name: 'Vine blight', label: '🌱 Vine blight', group: 'feywild' },
    { id: 'twig-blight', name: 'Twig blight', label: '🪵 Twig blight', group: 'feywild' },
    { id: 'sprite-swarm', name: 'Sprite swarm', label: '🧚 Sprite swarm', group: 'feywild' },
    { id: 'satyr', name: 'Satyr', label: '🐐 Satyr', group: 'feywild' },
    { id: 'dryad', name: 'Hostile dryad', label: '🌳 Dryad', group: 'feywild' },
    { id: 'hag', name: 'Hag', label: '🧙 Hag', group: 'feywild' },
    { id: 'giant-spider', name: 'Giant spider', label: '🕷️ Giant spider', group: 'feywild' },
    { id: 'owlbear', name: 'Owlbear', label: '🦉 Owlbear', group: 'feywild' },
    { id: 'rust-monster', name: 'Rust monster', label: '🦀 Rust monster', group: 'inevitable' },
    { id: 'tarrasque', name: 'Tarrasque', label: '🦖 Tarrasque', group: 'inevitable' },
  ];

  const ENEMY_GROUPS = [
    { id: 'prismeer', label: 'Prismeer foes' },
    { id: 'feywild', label: 'Feywild foes' },
    { id: 'inevitable', label: 'Inevitable (he swears)' },
  ];

  const SCENE_GROUPS = [
    {
      id: 'town',
      label: 'Town & Social',
      ids: [
        'Village', 'Town Square', 'Tavern', 'Inn', 'Market', 'Shop',
        'Temple', 'Blacksmith', 'Listening for Rumors',
      ],
    },
    {
      id: 'adventure',
      label: 'Adventure Sites',
      ids: ['Castle', 'Dungeon', 'Ruins', 'Cave', 'Crypt', 'Tower', 'Fort', 'Sewers', 'Mine'],
    },
    {
      id: 'terrain',
      label: 'Terrain & Wilds',
      ids: [
        'Forest', 'Mountains', 'Hills', 'Desert', 'Jungle', 'Plains',
        'Swamp / Marsh', 'Coast', 'Tundra', 'Bad Weather',
        'Travelling / On the Trail', 'Camp',
      ],
    },
    {
      id: 'prismeer',
      label: 'Prismeer',
      ids: FEYWILD_PLACES.filter((p) => p.region === 'prismeer').map((p) => p.id),
    },
    {
      id: 'feywild',
      label: 'Feywild',
      ids: FEYWILD_PLACES.filter((p) => p.region === 'feywild').map((p) => p.id),
    },
  ];

  const SETTINGS = [
    { id: 'indoors', label: '🏠 Indoors' },
    { id: 'outdoors', label: '🌲 Outdoors' },
  ];

  /** Which preset places make sense for each setting. Custom typed places always allowed. */
  const SCENES_BY_SETTING = {
    indoors: new Set([
      'Tavern', 'Inn', 'Shop', 'Temple', 'Blacksmith', 'Castle', 'Dungeon',
      'Cave', 'Crypt', 'Tower', 'Fort', 'Sewers', 'Mine', 'Listening for Rumors',
      ...FEYWILD_PLACES.filter((p) => p.setting === 'indoors' || p.setting === 'both').map((p) => p.id),
    ]),
    outdoors: new Set([
      'Village', 'Town Square', 'Market', 'Ruins', 'Forest', 'Mountains', 'Hills',
      'Desert', 'Jungle', 'Plains', 'Swamp / Marsh', 'Coast', 'Tundra', 'Bad Weather',
      'Travelling / On the Trail', 'Camp',
      ...FEYWILD_PLACES.filter((p) => p.setting === 'outdoors' || p.setting === 'both').map((p) => p.id),
    ]),
  };

  const WEATHER_OPTIONS = [
    { id: 'clear', label: '☀️ Clear' },
    { id: 'overcast', label: '☁️ Overcast' },
    { id: 'rain', label: '🌧️ Rain' },
    { id: 'storm', label: '⛈️ Storm' },
    { id: 'fog', label: '🌫️ Fog' },
    { id: 'snow', label: '❄️ Snow' },
    { id: 'blizzard', label: '🌬️ Blizzard' },
    { id: 'sweltering', label: '🔥 Sweltering' },
    { id: 'windy', label: '🍃 Windy' },
    { id: 'weird', label: '✨ Magical weather' },
  ];

  const LIGHTING_OPTIONS = [
    { id: 'bright', label: '🔆 Bright' },
    { id: 'dim', label: '🌗 Dim' },
    { id: 'candlelight', label: '🕯️ Candlelight' },
    { id: 'torches', label: '🔥 Torches' },
    { id: 'hearth', label: '🪵 Hearth glow' },
    { id: 'magical', label: '✨ Magical light' },
    { id: 'darkness', label: '🌑 Darkness' },
    { id: 'flickering', label: '💫 Flickering' },
  ];

  const ENVIRONMENT_SHARED = [
    { id: 'crowded', label: 'Crowded' },
    { id: 'empty', label: 'Empty' },
    { id: 'noisy', label: 'Noisy' },
    { id: 'quiet', label: 'Quiet' },
    { id: 'smoky', label: 'Smoky' },
    { id: 'wet', label: 'Wet' },
    { id: 'slippery', label: 'Slippery' },
    { id: 'cramped', label: 'Cramped' },
    { id: 'echoey', label: 'Echoey' },
    { id: 'unstable', label: 'Unstable' },
    { id: 'magical', label: 'Magical aura' },
    { id: 'festive', label: 'Festive' },
    { id: 'hostile', label: 'Hostile mood' },
    { id: 'bloodied', label: 'Bloodied' },
    { id: 'onFire', label: 'On fire' },
    { id: 'flooded', label: 'Flooded' },
    { id: 'dusty', label: 'Dusty' },
    { id: 'stinking', label: 'Stinking' },
  ];

  const ENVIRONMENT_INDOORS = [
    { id: 'tightQuarters', label: 'Tight quarters' },
    { id: 'multiLevel', label: 'Multiple levels' },
    { id: 'hiddenDoors', label: 'Hidden doors' },
  ];

  const ENVIRONMENT_OUTDOORS = [
    { id: 'highGround', label: 'High ground' },
    { id: 'cover', label: 'Plenty of cover' },
    { id: 'openField', label: 'Open field' },
    { id: 'difficultTerrain', label: 'Difficult terrain' },
  ];

  const SCENE_LABELS = {
    'Village': '🏘️ Village',
    'Tavern': '🍺 Tavern',
    'Inn': '🛏️ Inn',
    'Dungeon': '🗡️ Dungeon',
    'Castle': '🏰 Castle',
    'Ruins': '🏚️ Ruins',
    'Cave': '🕳️ Cave',
    'Crypt': '⚰️ Crypt',
    'Tower': '🗼 Tower',
    'Fort': '🛡️ Fort',
    'Sewers': '🐀 Sewers',
    'Mine': '⛏️ Mine',
    'Listening for Rumors': '👂 Rumors',
    'Town Square': '🏛️ Town Square',
    'Camp': '⛺ Camp',
    'Shop': '🏪 Shop',
    'Temple': '⛪ Temple',
    'Blacksmith': '🔨 Blacksmith',
    'Market': '🛒 Market',
    'Travelling / On the Trail': '🥾 On the Trail',
    'Mountains': '⛰️ Mountains',
    'Hills': '🌄 Hills',
    'Jungle': '🌴 Jungle',
    'Plains': '🌾 Plains',
    'Forest': '🌲 Forest',
    'Bad Weather': '🌧️ Bad Weather',
    'Desert': '🏜️ Desert',
    'Coast': '🌊 Coast',
    'Tundra': '❄️ Tundra',
    'Swamp / Marsh': '🐸 Swamp',
    'Carnival / Feywild (Wild Beyond The Witchlight)': '🎪 Carnival',
    'Walking in a Dungeon': '🗡️ Dungeon',
  };
  FEYWILD_PLACES.forEach((place) => {
    if (!SCENE_LABELS[place.id]) SCENE_LABELS[place.id] = place.label;
  });

  const SCENE_PATTERNS = {
    'Village': [/village|farmer|elder|barn|well|livestock|chickens|fence|homestead/i],
    'Tavern': [/tavern|bar\b|bartender|drink|ale|patron|barmaid|barman|cards|arm-wrestling/i],
    'Inn': [/inn|innkeeper|\broom\b|bed\b|breakfast|guest|window lock/i],
    'Dungeon': [/dungeon|trap|corridor|secret door|ceiling|floor tile|pressure plate|marking/i],
    'Walking in a Dungeon': [/dungeon|trap|corridor|secret door|ceiling|floor tile|pressure plate|marking/i],
    'Castle': [/castle|great hall|battlements|courtyard|noble|steward|lord|throne|tapestry|guard at the gate/i],
    'Ruins': [/ruin|rubble|collapsed|inscription|crumbled|debris|fallen/i],
    'Cave': [/cave|cavern|underground pool|dripping|bat\b|echo|narrow passage/i],
    'Crypt': [/crypt|tomb|sarcophag|undead|burial|sepulch/i],
    'Tower': [/tower|spiral stair|arrow slit|murder hole|landing|rooftop/i],
    'Fort': [/fort|garrison|palisade|barracks|officer of the watch|siege/i],
    'Sewers': [/sewer|grate|runoff|effluent|underground tunnel|rat/i],
    'Mine': [/mine|shaft|ore|timber support|cart rail|tunnel/i],
    'Listening for Rumors': [/rumor|gossip|eavesdrop|information|tall tale|evasive/i],
    'Town Square': [/town square|\bsquare\b|notice board|stall|crowd|guard patrol|politic/i],
    'Camp': [/camp|tent|bedroll|watch|campfire|cooking|first watch/i],
    'Shop': [/shop|haggling|merchandise|sell your loot|quality of the work/i],
    'Temple': [/temple|clergy|pray|healing|donation|prophec/i],
    'Blacksmith': [/blacksmith|repair|fitted|forge|armor upgrade/i],
    'Market': [/market|vendor|stall|best deals|haggling over prices/i],
    'Travelling / On the Trail': [/trail|path ahead|travel|tracks|bandit|scout|route forward/i],
    'Mountains': [/mountain|cliff|avalanche|summit|pass through the mountains/i],
    'Hills': [/hill|ridge|valley|crest|high ground|sheep trail/i],
    'Jungle': [/jungle|undergrowth|quicksand|dense vegetation/i],
    'Plains': [/plain|horizon|grassland|open country|settlements ahead/i],
    'Forest': [/forest|trees|wildlife|woodland|clearing|underbrush/i],
    'Bad Weather': [/rain|storm|weather|shelter|flooding|lightning|blizzard/i],
    'Desert': [/desert|sand|oasis|sandstorm|blazing sun|dune/i],
    'Coast': [/coast|shore|sea|tide|cliff|gull|fisher|salt|harbor|beach/i],
    'Tundra': [/tundra|snow|ice|frost|whiteout|aurora|frozen/i],
    'Swamp / Marsh': [/swamp|marsh|mud|quicksand|murky|bog|fen/i],
    'Carnival / Feywild (Wild Beyond The Witchlight)': [/carnival|feywild|prismeer|witchlight|zybilna|ticket|rigged/i],
  };

  /** Which targets make sense for each outcome type. */
  const TARGETS_FOR_OUTCOME = {
    roleplay: ['any', 'enemy', 'ally', 'self', 'environment', 'npc', 'object'],
    meanwhile: ['any', 'self', 'ally', 'npc', 'environment', 'object'],
    hit: ['any', 'enemy', 'npc'],
    fail: ['any', 'self', 'ally', 'environment', 'object', 'enemy', 'npc'],
    success: ['any', 'self', 'ally', 'enemy', 'environment', 'npc', 'object'],
    failure: ['any', 'self', 'ally', 'environment', 'npc', 'object'],
    battleCry: ['any', 'enemy', 'ally', 'self', 'npc'],
    mockery: ['any', 'enemy', 'npc'],
    cuttingWords: ['any', 'enemy', 'npc'],
    insult: ['any', 'enemy', 'npc', 'ally', 'self'],
    compliment: ['any', 'ally', 'npc', 'self', 'enemy'],
    toast: ['any', 'ally', 'npc', 'self', 'enemy'],
    introduction: ['any', 'ally', 'self', 'npc', 'enemy'],
    feyGambit: ['any', 'npc', 'enemy', 'ally'],
  };

  const SITUATION_CHIPS = {
    roleplay: [
      'Busking', 'Haggling', 'Hovering nearby', 'Hanging back',
      'Short rest / tune up', 'Forgetting a name', 'Watching the chairs',
      'Eavesdropping', 'Spending Lucky',
    ],
    meanwhile: [
      'Busking', 'Haggling', 'Hovering nearby', 'Hanging back',
      'Short rest / tune up', 'Forgetting a name', 'Watching the chairs',
      'Eavesdropping', 'Spending Lucky',
    ],
    feyGambit: [
      'Rule of three', 'Reciprocity', 'True-name bluff', 'Octave / eight-day cycle',
    ],
  };

  const ENEMY_PATTERN = /\b(their|them|they|foe|foes|enemy|enemies|opponent|target|adversary|my target)\b/i;
  const SELF_HARM_PATTERN = /\b(myself|my own|my hand|my fingers|my feet|my face|my knees|my palm|cut myself|nearly hitting myself|nearly cuts my own|singed my own|backfires.*my own)\b/i;

  const TARGETS = [
    { id: 'any', label: 'Any', multi: false },
    { id: 'enemy', label: '👹 Enemy', patterns: [/\b(their|them|foe|foes|enemy|enemies|opponent|target|adversary)\b/i] },
    { id: 'ally', label: '🤝 Ally', patterns: [/\b(party|ally|allies|friend|companion|teammate|fellow adventurer)\b/i] },
    { id: 'self', label: '🧚 Self', patterns: [/\b(I|my|myself|me)\b/] },
    { id: 'environment', label: '🏔️ Environment', patterns: [/\b(ground|wall|walls|door|terrain|weather|path|tree|rock|floor|ceiling|mountain|forest|dungeon|room|camp|swamp|plain|jungle|desert|trail|obstacle|beam|undergrowth)\b/i] },
    { id: 'npc', label: '👥 NPC', patterns: [/\b(bartender|innkeeper|merchant|vendor|guard|clergy|local|patron|blacksmith|people|crowd|someone|stranger|creature|animal|beast)\b/i] },
    { id: 'object', label: '📦 Object', patterns: [/\b(equipment|gear|weapon|armor|item|coin|coins|drink|map|chest|bed|furniture|merchandise|bedroll|tent|daggers|arrow|bolt|blade)\b/i] },
  ];

  let state = {
    location: null,
    setting: null,
    weather: null,
    lighting: null,
    environment: [],
    pace: null,
    outcomeMod: null,
    attackType: null,
    subtype: null,
    targets: ['any'],
    focusName: '',
    situation: '',
  };

  let activeSection = 'outcomes';
  let onChangeCallback = null;
  let panelEl = null;
  let sceneSelectEl = null;
  let sceneSummaryEl = null;
  let sceneStepEl = null;
  let settingChipsEl = null;
  let placeBlockEl = null;
  let sceneGroupsEl = null;
  let sceneInputEl = null;
  let sceneInputBound = false;
  let conditionBlockEl = null;
  let weatherBlockEl = null;
  let weatherChipsEl = null;
  let lightingBlockEl = null;
  let lightingChipsEl = null;
  let environmentChipsEl = null;
  let moodStepEl = null;
  let moodSummaryEl = null;
  let outcomeStepEl = null;
  let outcomeSummaryEl = null;
  let outcomeLabelEl = null;
  let outcomeEl = null;
  let paceSummaryEl = null;
  let paceStepEl = null;
  let paceLabelEl = null;
  let paceChipsEl = null;
  let attackTypeStepEl = null;
  let attackTypeSummaryEl = null;
  let attackTypeLabelEl = null;
  let attackTypeChipsEl = null;
  let detailStepEl = null;
  let detailSummaryEl = null;
  let detailSelectEl = null;
  let detailChipsEl = null;
  let detailLabelEl = null;
  let roleplayHintEl = null;
  let targetStepEl = null;
  let targetSummaryEl = null;
  let targetLabelEl = null;
  let targetEl = null;
  let nameBlockEl = null;
  let situationLabelEl = null;
  let situationChipsEl = null;
  let partyChipsEl = null;
  let enemyGroupsEl = null;
  let nameInputEl = null;
  let nameInputBound = false;
  let summaryEl = null;
  let expandedStep = 'pace';
  let stepSummaryBound = false;

  function isWorkflowSection(section) {
    return WORKFLOW_SECTIONS.has(section);
  }

  function getSceneIds() {
    const fromActions = Object.keys(window.BlingusData?.characterActions || {});
    const fromTypes = Object.keys(window.BlingusData?.sceneTypes || {});
    const fey = FEYWILD_PLACES.map((p) => p.id);
    const extra = window.WorkflowCatalog?.getAddedPlaceIds?.() || [];
    const hidden = new Set(window.WorkflowCatalog?.getHiddenPlaceIds?.() || []);
    const base = (fromActions.length || fromTypes.length)
      ? uniqueIds(fromActions.concat(fromTypes, fey, extra))
      : uniqueIds(fey.concat(extra));
    return base.filter((id) => !hidden.has(id));
  }

  function normalizeLocationId(locationId) {
    if (locationId === 'Walking in a Dungeon') return 'Dungeon';
    return locationId;
  }

  function getSceneLabel(id) {
    const cat = window.WorkflowCatalog?.loadCatalog?.();
    const edited = cat?.places?.edited?.[id]?.label;
    if (edited) return edited;
    const added = (cat?.places?.added || []).find((p) => p.id === id);
    if (added?.label) return added.label;
    return SCENE_LABELS[id] || SCENE_LABELS[normalizeLocationId(id)] || id;
  }

  function placeAllowed(id, setting) {
    const meta = window.WorkflowCatalog?.getPlaceMeta?.(id);
    if (meta?.setting) {
      return meta.setting === 'both' || meta.setting === setting || !setting;
    }
    const allowed = SCENES_BY_SETTING[setting];
    if (!allowed || !setting) return true;
    return allowed.has(id);
  }

  function taggedEnvironmentDefaults() {
    return ENVIRONMENT_SHARED.map((o) => Object.assign({}, o, { scope: 'shared' }))
      .concat(ENVIRONMENT_INDOORS.map((o) => Object.assign({}, o, { scope: 'indoors' })))
      .concat(ENVIRONMENT_OUTDOORS.map((o) => Object.assign({}, o, { scope: 'outdoors' })));
  }

  function getCatalogDefaults() {
    return {
      placeGroups: SCENE_GROUPS,
      places: FEYWILD_PLACES,
      enemies: FEYWILD_ENEMIES,
      enemyGroups: ENEMY_GROUPS,
      lighting: LIGHTING_OPTIONS,
      environment: taggedEnvironmentDefaults(),
    };
  }

  function defaultLocation() {
    const scenes = getSceneIds();
    return scenes.includes('Tavern') ? 'Tavern' : (scenes[0] || null);
  }

  function isCombatMod(outcomeMod) {
    return outcomeMod === 'hit' || outcomeMod === 'fail';
  }

  function isSkillMod(outcomeMod) {
    return outcomeMod === 'success' || outcomeMod === 'failure';
  }

  function isSpeechMod(outcomeMod) {
    return Boolean(SPEECH_META[outcomeMod]);
  }

  function isSceneBeatMod(outcomeMod) {
    return outcomeMod === 'roleplay' || outcomeMod === 'meanwhile';
  }

  function needsDetail(outcomeMod) {
    return isCombatMod(outcomeMod) || isSkillMod(outcomeMod);
  }

  function needsAttackType(outcomeMod) {
    return isCombatMod(outcomeMod);
  }

  function defaultSubtype(outcomeMod) {
    if (isSkillMod(outcomeMod)) return SKILL_NAMES[0];
    return null;
  }

  function attackTypeLabel(attackType) {
    return ATTACK_TYPES.find((t) => t.id === attackType)?.label || attackType || '';
  }

  function defaultOutcomeMod(section = activeSection) {
    if (section === 'criticalHits') return 'hit';
    if (section === 'criticalFailures') return 'fail';
    if (section === 'skillChecks') return 'success';
    if (section === 'actions') return 'roleplay';
    // Unified outcomes wizard starts blank until the user picks.
    return null;
  }

  function getOutcomeModsForSection(section = activeSection) {
    let mods = OUTCOME_MODS;
    if (section === 'actions') mods = OUTCOME_MODS.filter((m) => m.id === 'roleplay');
    else if (section === 'criticalHits') mods = OUTCOME_MODS.filter((m) => m.id === 'hit');
    else if (section === 'criticalFailures') mods = OUTCOME_MODS.filter((m) => m.id === 'fail');
    else if (section === 'skillChecks') mods = OUTCOME_MODS.filter((m) => m.id === 'success' || m.id === 'failure');
    else if (section !== 'outcomes') mods = OUTCOME_MODS;

    const allowedIds = MODS_BY_PACE[state.pace];
    if (allowedIds) {
      const allow = new Set(allowedIds);
      mods = mods.filter((m) => allow.has(m.id));
    }
    return mods;
  }

  function clampOutcomeMod(outcomeMod = state.outcomeMod, section = activeSection) {
    if (!outcomeMod) return null;
    const allowed = getOutcomeModsForSection(section).map((m) => m.id);
    return allowed.includes(outcomeMod) ? outcomeMod : defaultOutcomeMod(section);
  }

  function applyTabPreset(section) {
    if (section === 'actions' || section === 'criticalHits'
      || section === 'criticalFailures' || section === 'skillChecks') {
      section = 'outcomes';
    }
    activeSection = section;
    // Fresh wizard each time you open Outcomes.
    resetWizardState();
    if (window.OutcomeGenerate?.clearLastResult) {
      window.OutcomeGenerate.clearLastResult();
    }
    renderPanel();
    notifyChange();
  }

  function resetWizardState() {
    state.pace = null;
    state.outcomeMod = null;
    state.setting = null;
    state.location = null;
    state.weather = null;
    state.lighting = null;
    state.environment = [];
    state.attackType = null;
    state.subtype = null;
    state.targets = ['any'];
    state.focusName = '';
    state.situation = '';
    expandedStep = 'pace';
  }

  function environmentOptionsFor(setting = state.setting) {
    if (window.WorkflowCatalog?.getEnvironment) {
      return window.WorkflowCatalog.getEnvironment(setting, taggedEnvironmentDefaults());
    }
    const shared = ENVIRONMENT_SHARED.slice();
    if (setting === 'indoors') return shared.concat(ENVIRONMENT_INDOORS);
    if (setting === 'outdoors') return shared.concat(ENVIRONMENT_OUTDOORS);
    return shared;
  }

  function lightingOptionsFor() {
    return window.WorkflowCatalog?.getLighting?.(LIGHTING_OPTIONS) || LIGHTING_OPTIONS;
  }

  function formatEnvironment(ids = state.environment) {
    const opts = environmentOptionsFor();
    return (ids || [])
      .map((id) => opts.find((o) => o.id === id)?.label || id)
      .filter(Boolean);
  }

  /** Payload for Claude generation from the current tree. */
  function getGenerateSelection() {
    const ctx = resolveOutcomeContext();
    if (!ctx.ready) {
      return { ready: false, reason: ctx.reason };
    }
    const targets = sanitizeTargets(state.outcomeMod, state.targets);
    const target = targets.includes('any') ? 'any' : targets.join(', ');
    const name = (state.focusName || '').trim();
    const mood = window.OutcomeGenerate?.getMood?.() || '';
    const rating = window.OutcomeGenerate?.getRating?.() || '';
    return {
      ready: true,
      scene: ctx.location,
      setting: state.setting || '',
      weather: state.weather || '',
      lighting: state.lighting || '',
      environment: formatEnvironment(),
      outcome: state.outcomeMod,
      attackType: (state.outcomeMod === 'mockery' || state.outcomeMod === 'cuttingWords') ? 'magic' : (state.attackType || ''),
      detail: state.outcomeMod === 'mockery' ? 'Vicious Mockery'
        : state.outcomeMod === 'cuttingWords' ? 'Cutting Words'
        : (state.subtype || ''),
      target,
      name,
      intent: (state.situation || '').trim(),
      partyMember: isPartyFocusName(name),
      mood,
      rating,
      pace: state.pace || '',
      combatRound: state.pace === 'battle',
      count: state.pace === 'battle' ? BATTLE_LINE_COUNT : ROLEPLAY_LINE_COUNT,
      summary: buildSummary(ctx),
      metaLabel: ctx.metaLabel,
      modalPrefix: ctx.modalPrefix,
      section: ctx.section,
      category: ctx.category,
    };
  }

  function isPartyFocusName(name) {
    const needle = String(name || '').trim().toLowerCase();
    if (!needle) return false;
    if (PARTY_NAME_ALIASES[needle]) return true;
    return getPartyMembers().some((member) => {
      const full = member.name.toLowerCase();
      const first = full.split(/\s+/)[0];
      return needle === full || needle === first || needle === member.id.toLowerCase();
    });
  }

  function showNamePicker(outcomeMod = state.outcomeMod, targets = state.targets) {
    if (isSpeechMod(outcomeMod) || isSceneBeatMod(outcomeMod)) return true;
    const personTargets = new Set(['ally', 'enemy', 'npc', 'self']);
    return sanitizeTargets(outcomeMod, targets).some((id) => personTargets.has(id));
  }

  function resolveOutcomeContext(workflowState = state) {
    const location = normalizeLocationId(workflowState.location);
    const { outcomeMod, subtype } = workflowState;

    if (!workflowState.pace) {
      return { ready: false, reason: 'In battle or out of battle first.' };
    }

    if (!outcomeMod) {
      return { ready: false, reason: 'Start with what happened — pick an outcome type.' };
    }

    if (!workflowState.setting) {
      return { ready: false, reason: 'Indoors or outdoors first.' };
    }

    if (!location) {
      return { ready: false, reason: 'Where exactly? Pick a place or type one.' };
    }

    if (isSceneBeatMod(outcomeMod)) {
      return {
        ready: true,
        section: 'actions',
        category: location,
        location,
        outcomeMod,
        metaLabel: outcomeMod === 'meanwhile' ? 'Meanwhile' : 'Action',
        modalPrefix: outcomeMod === 'meanwhile' ? '🧚' : '🎭',
      };
    }

    if (isSpeechMod(outcomeMod)) {
      const meta = SPEECH_META[outcomeMod];
      return {
        ready: true,
        section: meta.section,
        category: meta.category,
        location,
        outcomeMod,
        metaLabel: meta.metaLabel,
        modalPrefix: meta.modalPrefix,
      };
    }

    if (isCombatMod(outcomeMod) && !workflowState.attackType) {
      return { ready: false, reason: 'Attack type? Slash, pierce, blunt, or magic.' };
    }

    if (!subtype) {
      return {
        ready: false,
        reason: isCombatMod(outcomeMod)
          ? 'Which weapon or bard spell? Pick one below.'
          : 'Which skill? Pick one below.',
      };
    }

    if (outcomeMod === 'hit') {
      return {
        ready: true,
        section: 'criticalHits',
        category: subtype,
        location,
        outcomeMod,
        attackType: workflowState.attackType,
        metaLabel: 'Critical Hit',
        modalPrefix: '⚔️',
      };
    }

    if (outcomeMod === 'fail') {
      return {
        ready: true,
        section: 'criticalFailures',
        category: subtype,
        location,
        outcomeMod,
        attackType: workflowState.attackType,
        metaLabel: 'Critical Fail',
        modalPrefix: '💥',
      };
    }

    if (outcomeMod === 'success') {
      return {
        ready: true,
        section: 'skillChecks',
        category: `${subtype} - Success`,
        location,
        outcomeMod,
        metaLabel: 'Skill Check — Success',
        modalPrefix: '✅',
      };
    }

    if (outcomeMod === 'failure') {
      return {
        ready: true,
        section: 'skillChecks',
        category: `${subtype} - Failure`,
        location,
        outcomeMod,
        metaLabel: 'Skill Check — Failure',
        modalPrefix: '❌',
      };
    }

    return { ready: false, reason: 'Pick an outcome type above.' };
  }

  function getAllowedTargetIds(outcomeMod = state.outcomeMod) {
    return TARGETS_FOR_OUTCOME[outcomeMod] || ['any'];
  }

  function sanitizeTargets(outcomeMod = state.outcomeMod, targets = state.targets) {
    const allowed = new Set(getAllowedTargetIds(outcomeMod));
    const next = targets.filter((id) => allowed.has(id));
    if (!next.length || next.includes('any')) return ['any'];
    return next;
  }

  function getActiveTargets(workflowState = state) {
    const targets = sanitizeTargets(workflowState.outcomeMod, workflowState.targets);
    if (targets.includes('any')) return [];
    return targets;
  }

  function textMatchesTargetId(text, targetId) {
    const target = TARGETS.find((t) => t.id === targetId);
    if (!target?.patterns) return targetId === 'any';
    const haystack = String(text);
    return target.patterns.some((pattern) => pattern.test(haystack));
  }

  function textMatchesTargets(text, targetIds) {
    const active = targetIds.filter((id) => id !== 'any');
    if (!active.length) return false;
    return active.some((targetId) => textMatchesTargetId(text, targetId));
  }

  function textMatchesScene(text, locationId) {
    const normalized = normalizeLocationId(locationId);
    const patterns = SCENE_PATTERNS[normalized] || SCENE_PATTERNS[locationId];
    if (!patterns?.length) return false;
    const haystack = String(text);
    return patterns.some((pattern) => pattern.test(haystack));
  }

  function getSceneOutcomeLines(locationId, category) {
    const normalized = normalizeLocationId(locationId);
    const scenes = window.BlingusData?.sceneOutcomes || {};
    const lines = scenes[normalized]?.[category] || scenes[locationId]?.[category];
    if (lines) return lines;
    ensureSceneLoaded(locationId);
    return [];
  }

  const loadingScenes = new Set();

  /**
   * Lazy-load a scene's outcome file on demand. Scene lines are only needed when
   * a player drills into that scene, so we fetch js/data/scenes/<slug>.js the
   * first time it's referenced and re-render once it lands. Until then the
   * workflow falls back to generic pools (handled in buildWorkflowOutcomePool).
   */
  function ensureSceneLoaded(locationId) {
    if (!locationId) return;
    const normalized = normalizeLocationId(locationId);
    const data = window.BlingusData?.sceneOutcomes;
    if (!data) return;
    if (data[normalized] || data[locationId]) return;
    const manifest = window.BlingusData?.sceneOutcomesManifest || {};
    const slug = manifest[normalized] || manifest[locationId];
    if (!slug || loadingScenes.has(slug)) return;
    loadingScenes.add(slug);
    const version = window.BlingusSceneVersion;
    const script = document.createElement('script');
    script.src = `js/data/scenes/${slug}.js${version ? `?v=${version}` : ''}`;
    script.async = true;
    script.onload = () => {
      loadingScenes.delete(slug);
      notifyChange();
    };
    script.onerror = () => {
      loadingScenes.delete(slug);
    };
    document.head.appendChild(script);
  }

  function getSceneType(locationId) {
    const normalized = normalizeLocationId(locationId);
    const types = window.BlingusData?.sceneTypes || {};
    if (types[normalized] || types[locationId]) {
      return types[normalized] || types[locationId];
    }
    const fey = FEYWILD_PLACES.find((p) => p.id === normalized || p.id === locationId);
    return fey?.type || 'social';
  }

  function isGenericIncompatibleWithScene(text, locationId) {
    const stype = getSceneType(locationId);
    const patterns = window.BlingusData?.sceneIncompatiblePatterns?.[stype] || [];
    if (!patterns.length) return false;
    const haystack = String(text).toLowerCase();
    return patterns.some((pattern) => haystack.includes(String(pattern).toLowerCase()));
  }

  function getSceneCritCategory(context) {
    if (context.section === 'criticalHits') return `${context.category} - Crit Hit`;
    if (context.section === 'criticalFailures') return `${context.category} - Crit Fail`;
    return context.category;
  }

  /**
   * Merge scene-specific lines ahead of generic ones; drop generics that clash with the scene.
   * When scene lines exist, use them exclusively — generics were causing wrong-scene bleed.
   */
  function buildWorkflowOutcomePool(items, workflowState = state, context = null) {
    const ctx = context || resolveOutcomeContext(workflowState);
    if (!workflowState.location) return items;

    if (ctx?.section === 'skillChecks') {
      const sceneLines = getSceneOutcomeLines(workflowState.location, ctx.category);
      if (sceneLines.length) return sceneLines;
      return items.filter((text) => !isGenericIncompatibleWithScene(text, workflowState.location));
    }

    if (ctx?.section === 'criticalHits' || ctx?.section === 'criticalFailures') {
      const sceneKey = getSceneCritCategory(ctx);
      const sceneLines = getSceneOutcomeLines(workflowState.location, sceneKey);
      if (sceneLines.length) return sceneLines;
      return items.filter((text) => !isGenericIncompatibleWithScene(text, workflowState.location));
    }

    return items;
  }

  function sceneLinePassesTargets(haystack, workflowState, skipTargets) {
    if (skipTargets) return true;
    const activeTargets = getActiveTargets(workflowState);
    if (!activeTargets.length) return true;
    return activeTargets.some((targetId) => textMatchesTargetId(haystack, targetId));
  }

  function isOutcomeValid(text, workflowState = state, context = null, skipTargets = false) {
    const { outcomeMod } = workflowState;
    const haystack = String(text);
    const ctx = context || resolveOutcomeContext(workflowState);

    if (outcomeMod === 'hit') {
      if (workflowState.location && ctx?.section === 'criticalHits') {
        const sceneLines = getSceneOutcomeLines(workflowState.location, getSceneCritCategory(ctx));
        if (sceneLines.includes(text)) {
          if (SELF_HARM_PATTERN.test(haystack)) return false;
          return sceneLinePassesTargets(haystack, workflowState, skipTargets);
        }
        if (isGenericIncompatibleWithScene(text, workflowState.location)) return false;
      }
      if (!ENEMY_PATTERN.test(haystack)) return false;
      if (SELF_HARM_PATTERN.test(haystack)) return false;
    }

    if (outcomeMod === 'fail') {
      if (workflowState.location && ctx?.section === 'criticalFailures') {
        const sceneLines = getSceneOutcomeLines(workflowState.location, getSceneCritCategory(ctx));
        if (sceneLines.includes(text)) {
          return sceneLinePassesTargets(haystack, workflowState, skipTargets);
        }
        if (isGenericIncompatibleWithScene(text, workflowState.location)) return false;
      }

      const looksLikeHit = ENEMY_PATTERN.test(haystack) && !SELF_HARM_PATTERN.test(haystack)
        && !/\b(nearly hitting an ally|nearly hitting myself|bounces harmlessly|goes wide|miss|fizzles|backfires|stumble|trip|fumble|fail|pathetically|useless|empty air|sprawling|exposed|awkwardly|harmlessly|instead of my target|instead of my foe|instead of them|past my target|bury the point|instead$)\b/i.test(haystack);
      if (looksLikeHit) return false;
    }

    if (outcomeMod === 'success' && ctx?.section === 'skillChecks') {
      if (workflowState.location) {
        const sceneLines = getSceneOutcomeLines(workflowState.location, ctx.category);
        if (sceneLines.includes(text)) {
          return sceneLinePassesTargets(haystack, workflowState, skipTargets);
        }
        if (isGenericIncompatibleWithScene(text, workflowState.location)) return false;
      }
      if (/^I attempt .* but /i.test(haystack)) return false;
    }

    if (outcomeMod === 'failure' && ctx?.section === 'skillChecks') {
      if (workflowState.location) {
        const sceneLines = getSceneOutcomeLines(workflowState.location, ctx.category);
        if (sceneLines.includes(text)) {
          return sceneLinePassesTargets(haystack, workflowState, skipTargets);
        }
        if (isGenericIncompatibleWithScene(text, workflowState.location)) return false;
      }
      if (/^I gracefully |^My body moves like liquid|^The creature calms|^I recognize the magical/i.test(haystack)) return false;
    }

    if (!skipTargets) {
      const activeTargets = getActiveTargets(workflowState);
      if (activeTargets.length) {
        return activeTargets.some((targetId) => textMatchesTargetId(haystack, targetId));
      }
    }

    return true;
  }

  function filterValidOutcomes(items, workflowState = state, context = null) {
    const ctx = context || resolveOutcomeContext(workflowState);
    if (!ctx.ready) return [];

    const withoutTargets = items.filter((text) => isOutcomeValid(text, workflowState, ctx, true));
    const activeTargets = getActiveTargets(workflowState);
    if (!activeTargets.length) return withoutTargets;

    const narrowed = withoutTargets.filter((text) =>
      activeTargets.some((targetId) => textMatchesTargetId(String(text), targetId))
    );
    // Prefer target matches, but never leave the user with zero outcomes.
    return narrowed.length ? narrowed : withoutTargets;
  }

  function getEmptyOutcomeHint(workflowState, context, baseCount, validCount) {
    const sceneLabel = getSceneLabel(workflowState.location);
    const modLabel = OUTCOME_MODS.find((m) => m.id === workflowState.outcomeMod)?.label || workflowState.outcomeMod;
    const activeTargets = getActiveTargets(workflowState);

    if (!baseCount) {
      return 'No outcomes exist for this combination yet. Use Edit Items to add some.';
    }
    if (validCount) return '';

    if (activeTargets.length) {
      const targetLabels = activeTargets.map((id) => TARGETS.find((t) => t.id === id)?.label || id).join(', ');
      return `Nothing in this set fits ${sceneLabel} + ${modLabel}${workflowState.subtype ? ' (' + workflowState.subtype + ')' : ''} + ${targetLabels}. Try "Any" target or a different outcome.`;
    }

    if (workflowState.outcomeMod === 'hit') {
      return `No valid crit hits found for ${workflowState.subtype || 'this attack'}. Crit hits need lines that strike a foe.`;
    }

    return `No outcomes fit this selection. Try a different outcome type, target, or weapon/skill.`;
  }

  function filterByTargets(items, targetIds) {
    if (!items.length) return items;
    if (!targetIds.length || targetIds.includes('any')) return items;
    return items.filter((text) => textMatchesTargets(text, targetIds));
  }

  /** @deprecated use filterValidOutcomes */
  function filterByScene(items, locationId, outcomeMod) {
    if (!items.length || !locationId || isSceneBeatMod(outcomeMod)) {
      return { items, sceneFallback: false, preferred: items };
    }
    const preferred = items.filter((text) => textMatchesScene(text, locationId));
    if (preferred.length) {
      return { items, sceneFallback: false, preferred };
    }
    return { items, sceneFallback: true, preferred: items };
  }

  function getPreferredRandomPool(validTexts) {
    return validTexts.length ? validTexts : [];
  }

  function buildSummary(context) {
    if (!context.ready) return context.reason || 'Answer the questions above, then Generate.';
    const sceneLabel = getSceneLabel(state.location);
    const targetLabels = state.targets.includes('any')
      ? 'any focus'
      : state.targets.map((id) => TARGETS.find((t) => t.id === id)?.label || id).join(', ');

    const modLabel = OUTCOME_MODS.find((m) => m.id === state.outcomeMod)?.label || state.outcomeMod;
    let detail = '';
    if (isSceneBeatMod(state.outcomeMod) || isSpeechMod(state.outcomeMod)) {
      detail = null;
    } else if (isSkillMod(state.outcomeMod)) {
      detail = `${state.subtype} · ${state.outcomeMod === 'success' ? 'Success' : 'Failure'}`;
    } else {
      const atk = attackTypeLabel(state.attackType).replace(/^[^\s]+\s/, '');
      detail = `${atk} · ${state.subtype}`;
    }

    const settingLabel = SETTINGS.find((s) => s.id === state.setting)?.label || state.setting;
    const weatherLabel = WEATHER_OPTIONS.find((w) => w.id === state.weather)?.label;
    const lightingLabel = lightingOptionsFor().find((l) => l.id === state.lighting)?.label;
    const envLabels = formatEnvironment();

    const moodLabel = window.OutcomeGenerate?.getMoodMeta?.()?.label || '';
    const ratingMeta = window.OutcomeGenerate?.getRatingMeta?.();
    const ratingLabel = ratingMeta ? ratingMeta.label : '';
    const paceLabel = PACE_OPTIONS.find((p) => p.id === state.pace)?.label || '';
    const parts = [moodLabel, ratingLabel, paceLabel, modLabel, settingLabel, sceneLabel].filter(Boolean);
    if (weatherLabel) parts.push(weatherLabel);
    if (lightingLabel) parts.push(lightingLabel);
    if (envLabels.length) parts.push(envLabels.join(', '));
    if (detail) parts.push(detail);
    parts.push(targetLabels);
    if ((state.situation || '').trim()) parts.push(state.situation.trim());
    if ((state.focusName || '').trim()) parts.push(state.focusName.trim());
    return parts.join(' · ');
  }

  function syncCategorySelect(context) {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect || !context.ready) return;
    const hasOption = Array.from(categorySelect.options).some((opt) => opt.value === context.category);
    if (hasOption && categorySelect.value !== context.category) {
      categorySelect.value = context.category;
    }
  }

  function notifyChange() {
    const context = resolveOutcomeContext();
    syncCategorySelect(context);
    if (summaryEl) summaryEl.textContent = buildSummary(context);
    if (typeof onChangeCallback === 'function') {
      onChangeCallback(context, { ...state, targets: [...state.targets] });
    }
  }

  function setState(partial) {
    if (Object.prototype.hasOwnProperty.call(partial, 'location')) {
      const loc = String(partial.location || '').trim();
      partial.location = loc ? normalizeLocationId(loc) : null;
    }
    if (Object.prototype.hasOwnProperty.call(partial, 'outcomeMod') && partial.outcomeMod) {
      partial.outcomeMod = clampOutcomeMod(partial.outcomeMod);
    }

    const changingPace = Object.prototype.hasOwnProperty.call(partial, 'pace')
      && partial.pace !== state.pace;
    const changingOutcome = Object.prototype.hasOwnProperty.call(partial, 'outcomeMod')
      && partial.outcomeMod !== state.outcomeMod;
    const changingSetting = Object.prototype.hasOwnProperty.call(partial, 'setting')
      && partial.setting !== state.setting;
    const changingLocation = Object.prototype.hasOwnProperty.call(partial, 'location')
      && partial.location !== state.location;
    const changingAttackType = Object.prototype.hasOwnProperty.call(partial, 'attackType')
      && partial.attackType !== state.attackType;

    // Changing an earlier answer clears everything downstream.
    if (changingPace) {
      const allowed = new Set(MODS_BY_PACE[partial.pace] || []);
      if (state.outcomeMod && !allowed.has(state.outcomeMod)) {
        partial.outcomeMod = null;
      }
      if (!partial.outcomeMod && state.outcomeMod && allowed.has(state.outcomeMod)) {
        // keep current outcome if still valid
      }
      if (partial.outcomeMod === null || (state.outcomeMod && !allowed.has(state.outcomeMod))) {
        partial.setting = null;
        partial.location = null;
        partial.weather = null;
        partial.lighting = null;
        partial.environment = [];
        partial.attackType = null;
        partial.subtype = null;
        partial.targets = ['any'];
        partial.focusName = '';
        partial.situation = '';
      }
    } else if (changingOutcome) {
      partial.setting = null;
      partial.location = null;
      partial.weather = null;
      partial.lighting = null;
      partial.environment = [];
      partial.attackType = null;
      partial.subtype = null;
      partial.targets = (partial.outcomeMod === 'mockery' || partial.outcomeMod === 'cuttingWords') ? ['enemy'] : ['any'];
      partial.focusName = '';
      partial.situation = '';
    } else if (changingSetting) {
      partial.location = null;
      partial.weather = null;
      partial.lighting = null;
      partial.environment = [];
      partial.attackType = null;
      partial.subtype = null;
      partial.targets = ['any'];
      partial.focusName = '';
    } else if (changingLocation) {
      if (needsDetail(partial.outcomeMod || state.outcomeMod)) {
        partial.attackType = null;
        partial.subtype = null;
      }
      partial.targets = ['any'];
      partial.focusName = '';
    } else if (changingAttackType) {
      partial.subtype = null;
    }

    state = { ...state, ...partial };

    if (!needsDetail(state.outcomeMod)) {
      state.subtype = null;
      state.attackType = null;
    } else if (!needsAttackType(state.outcomeMod)) {
      state.attackType = null;
    }
    if (state.setting === 'indoors') state.weather = null;
    if (state.setting === 'outdoors') state.lighting = null;
    const allowedEnv = new Set(environmentOptionsFor().map((o) => o.id));
    state.environment = (state.environment || []).filter((id) => allowedEnv.has(id));
    state.targets = sanitizeTargets(state.outcomeMod, state.targets);
    if (!showNamePicker(state.outcomeMod, state.targets)) {
      state.focusName = '';
    }

    if (state.location) {
      ensureSceneLoaded(state.location);
    }
    if (window.OutcomeGenerate?.clearLastResult) {
      window.OutcomeGenerate.clearLastResult();
    }
    const advanceKeys = ['pace', 'outcomeMod', 'setting', 'location', 'attackType', 'subtype'];
    if (advanceKeys.some((key) => Object.prototype.hasOwnProperty.call(partial, key))) {
      advanceExpandedStep();
    }
    renderPanel();
    notifyChange();
  }

  function toggleEnvironment(envId) {
    const allowed = new Set(environmentOptionsFor().map((o) => o.id));
    if (!allowed.has(envId)) return;
    const set = new Set(state.environment || []);
    if (set.has(envId)) set.delete(envId);
    else set.add(envId);
    state.environment = [...set];
    if (window.OutcomeGenerate?.clearLastResult) {
      window.OutcomeGenerate.clearLastResult();
    }
    renderEnvironmentChips();
    notifyChange();
  }

  function toggleTarget(targetId) {
    if (!state.outcomeMod || !getAllowedTargetIds().includes(targetId)) return;

    if (targetId === 'any') {
      state.targets = ['any'];
      if (!isSpeechMod(state.outcomeMod)) state.focusName = '';
      renderPanel();
      notifyChange();
      return;
    }

    let next = sanitizeTargets(state.outcomeMod, state.targets).filter((id) => id !== 'any');
    if (next.includes(targetId)) {
      next = next.filter((id) => id !== targetId);
    } else {
      next.push(targetId);
    }
    state.targets = sanitizeTargets(state.outcomeMod, next.length ? next : ['any']);
    if (!showNamePicker(state.outcomeMod, state.targets)) {
      state.focusName = '';
    }
    renderPanel();
    notifyChange();
  }

  function setFocusName(name, { fromInput = false, asEnemy = false } = {}) {
    state.focusName = (name || '').trim();
    if (!fromInput && nameInputEl) {
      nameInputEl.value = state.focusName;
    }
    if (asEnemy && state.focusName) {
      const allowed = new Set(getAllowedTargetIds());
      if (allowed.has('enemy') && !state.targets.includes('enemy')) {
        state.targets = sanitizeTargets(state.outcomeMod, ['enemy']);
      }
    }
    if (window.OutcomeGenerate?.clearLastResult) {
      window.OutcomeGenerate.clearLastResult();
    }
    if (asEnemy) {
      renderPanel();
    } else {
      renderPartyChips();
      renderEnemyChips();
    }
    notifyChange();
  }

  function renderPartyChips() {
    if (!partyChipsEl) return;
    const current = (state.focusName || '').trim();
    partyChipsEl.innerHTML = '';
    renderChip(partyChipsEl, {
      id: 'none',
      label: 'None',
      active: !current,
      onClick: () => setFocusName(''),
    });
    getPartyMembers().forEach((member) => {
      renderChip(partyChipsEl, {
        id: member.id,
        label: member.label,
        active: current === member.name || current.toLowerCase() === member.name.toLowerCase(),
        onClick: () => setFocusName(member.name),
        manage: { kind: 'party', id: member.name },
      });
    });
    window.WorkflowCatalog?.appendAddChip?.(partyChipsEl, 'party');
  }

  function renderEnemyChips() {
    if (!enemyGroupsEl) return;
    enemyGroupsEl.innerHTML = '';
    const current = (state.focusName || '').trim().toLowerCase();
    const groups = window.WorkflowCatalog?.getEnemyGroups?.(ENEMY_GROUPS) || ENEMY_GROUPS;
    const foes = window.WorkflowCatalog?.getEnemies?.(FEYWILD_ENEMIES) || FEYWILD_ENEMIES;
    groups.forEach((group) => {
      const groupFoes = foes.filter((e) => e.group === group.id);
      if (!groupFoes.length) return;
      const block = document.createElement('div');
      block.className = 'workflow__scene-group';
      const heading = document.createElement('div');
      heading.className = 'workflow__scene-group-label';
      heading.textContent = group.label;
      block.appendChild(heading);
      const chips = document.createElement('div');
      chips.className = 'chips chips--pills';
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', group.label);
      groupFoes.forEach((foe) => {
        renderChip(chips, {
          id: foe.id,
          label: foe.label,
          active: current === foe.name.toLowerCase(),
          onClick: () => setFocusName(foe.name, { asEnemy: true }),
          manage: { kind: 'enemies', id: foe.id },
        });
      });
      window.WorkflowCatalog?.appendAddChip?.(chips, 'enemies');
      block.appendChild(chips);
      enemyGroupsEl.appendChild(block);
    });
  }

  function renderSituationChips() {
    if (!situationChipsEl) return;
    const chips = SITUATION_CHIPS[state.outcomeMod] || [];
    const show = chips.length > 0;
    if (situationLabelEl) situationLabelEl.hidden = !show;
    situationChipsEl.hidden = !show;
    situationChipsEl.innerHTML = '';
    if (!show) return;
    const current = (state.situation || '').trim();
    chips.forEach((label) => {
      renderChip(situationChipsEl, {
        id: label,
        label,
        active: current === label,
        onClick: () => {
          state.situation = current === label ? '' : label;
          renderSituationChips();
          notifyChange();
        },
      });
    });
  }

  function renderNamePicker() {
    if (!nameBlockEl) return;
    const show = detailReady() && showNamePicker();
    nameBlockEl.hidden = !show;
    if (!show) return;
    renderSituationChips();
    renderPartyChips();
    renderEnemyChips();
    if (nameInputEl && document.activeElement !== nameInputEl) {
      nameInputEl.value = state.focusName || '';
    }
  }

  function renderChip(container, { id, label, active, disabled, onClick, title, manage }) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip chip--pill'
      + (active ? ' chip--active' : '')
      + (disabled ? ' chip--disabled' : '');
    chip.textContent = label;
    chip.dataset.workflowId = id;
    chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (disabled) {
      chip.disabled = true;
      chip.title = title || 'Not applicable for this outcome type';
    } else if (title) {
      chip.title = title;
    }
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      if (!disabled) onClick();
    });
    container.appendChild(chip);
    if (manage && window.WorkflowCatalog?.decorateChip) {
      window.WorkflowCatalog.decorateChip(chip, manage.kind, manage.id, manage);
    }
  }

  function syncSceneInput() {
    if (!sceneInputEl || document.activeElement === sceneInputEl) return;
    sceneInputEl.value = state.location || '';
  }

  function setCustomLocation(value, { fromInput = false } = {}) {
    const loc = String(value || '').trim();
    const next = loc ? normalizeLocationId(loc) : null;
    const prev = state.location;
    if (next === prev) {
      if (!fromInput) syncSceneInput();
      return;
    }

    const known = new Set(getSceneIds());
    const leftKnown = Boolean(prev && known.has(normalizeLocationId(prev)));
    const enteredKnown = Boolean(next && known.has(next));
    // Typing a custom place should not wipe later answers on every keystroke.
    if (!next || leftKnown || enteredKnown) {
      if (needsDetail(state.outcomeMod)) {
        state.attackType = null;
        state.subtype = null;
      }
      state.targets = ['any'];
      state.focusName = '';
    }

    state.location = next;
    if (state.location) ensureSceneLoaded(state.location);
    if (window.OutcomeGenerate?.clearLastResult) {
      window.OutcomeGenerate.clearLastResult();
    }
    if (!fromInput && sceneInputEl) sceneInputEl.value = state.location || '';
    renderPanel();
    notifyChange();
  }

  function renderSettingChips() {
    if (!settingChipsEl) return;
    settingChipsEl.innerHTML = '';
    SETTINGS.forEach((setting) => {
      renderChip(settingChipsEl, {
        id: setting.id,
        label: setting.label,
        active: state.setting === setting.id,
        onClick: () => setState({ setting: setting.id }),
      });
    });
  }

  function renderWeatherChips() {
    if (!weatherChipsEl) return;
    weatherChipsEl.innerHTML = '';
    renderChip(weatherChipsEl, {
      id: 'none',
      label: 'Any',
      active: !state.weather,
      onClick: () => setState({ weather: null }),
    });
    WEATHER_OPTIONS.forEach((opt) => {
      renderChip(weatherChipsEl, {
        id: opt.id,
        label: opt.label,
        active: state.weather === opt.id,
        onClick: () => setState({ weather: opt.id }),
      });
    });
  }

  function renderLightingChips() {
    if (!lightingChipsEl) return;
    lightingChipsEl.innerHTML = '';
    renderChip(lightingChipsEl, {
      id: 'none',
      label: 'Any',
      active: !state.lighting,
      onClick: () => setState({ lighting: null }),
    });
    lightingOptionsFor().forEach((opt) => {
      renderChip(lightingChipsEl, {
        id: opt.id,
        label: opt.label,
        active: state.lighting === opt.id,
        onClick: () => setState({ lighting: opt.id }),
        manage: { kind: 'lighting', id: opt.id },
      });
    });
    window.WorkflowCatalog?.appendAddChip?.(lightingChipsEl, 'lighting');
  }

  function renderEnvironmentChips() {
    if (!environmentChipsEl) return;
    environmentChipsEl.innerHTML = '';
    environmentOptionsFor().forEach((opt) => {
      renderChip(environmentChipsEl, {
        id: opt.id,
        label: opt.label,
        active: (state.environment || []).includes(opt.id),
        onClick: () => toggleEnvironment(opt.id),
        manage: { kind: 'environment', id: opt.id },
      });
    });
    window.WorkflowCatalog?.appendAddChip?.(environmentChipsEl, 'environment');
  }

  function renderScenePills() {
    if (!sceneGroupsEl) return;
    sceneGroupsEl.innerHTML = '';
    const known = new Set(getSceneIds());
    const selected = normalizeLocationId(state.location);
    const selectedIsKnown = Boolean(selected && known.has(selected) && placeAllowed(selected, state.setting));

    const placeGroups = window.WorkflowCatalog?.getPlaceGroups?.(SCENE_GROUPS) || SCENE_GROUPS;
    placeGroups.forEach((group) => {
      const ids = (group.ids || []).filter((id) => known.has(id) && placeAllowed(id, state.setting));
      if (!ids.length) return;
      const block = document.createElement('div');
      block.className = 'workflow__scene-group';
      const heading = document.createElement('div');
      heading.className = 'workflow__scene-group-label';
      heading.textContent = group.label;
      block.appendChild(heading);
      const chips = document.createElement('div');
      chips.className = 'chips chips--pills';
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', group.label);
      ids.forEach((id) => {
        renderChip(chips, {
          id,
          label: getSceneLabel(id),
          active: selectedIsKnown && selected === id,
          onClick: () => setState({ location: id }),
          manage: { kind: 'places', id },
        });
      });
      window.WorkflowCatalog?.appendAddChip?.(chips, 'places');
      block.appendChild(chips);
      sceneGroupsEl.appendChild(block);
    });

    const grouped = new Set(placeGroups.flatMap((g) => g.ids || []));
    const orphans = getSceneIds().filter((id) => !grouped.has(id) && placeAllowed(id, state.setting));
    if (orphans.length) {
      const block = document.createElement('div');
      block.className = 'workflow__scene-group';
      const heading = document.createElement('div');
      heading.className = 'workflow__scene-group-label';
      heading.textContent = 'Other';
      block.appendChild(heading);
      const chips = document.createElement('div');
      chips.className = 'chips chips--pills';
      orphans.forEach((id) => {
        renderChip(chips, {
          id,
          label: getSceneLabel(id),
          active: selectedIsKnown && selected === id,
          onClick: () => setState({ location: id }),
          manage: { kind: 'places', id },
        });
      });
      block.appendChild(chips);
      sceneGroupsEl.appendChild(block);
    }

    if (sceneSelectEl && selectedIsKnown) {
      sceneSelectEl.value = selected;
    }
    syncSceneInput();
  }

  function renderAttackTypePills() {
    if (!attackTypeChipsEl) return;
    attackTypeChipsEl.innerHTML = '';
    ATTACK_TYPES.forEach((type) => {
      renderChip(attackTypeChipsEl, {
        id: type.id,
        label: type.label,
        active: state.attackType === type.id,
        onClick: () => setState({ attackType: type.id }),
      });
    });
  }

  function renderDetailPills() {
    if (!detailChipsEl) return;
    detailChipsEl.innerHTML = '';
    if (!needsDetail(state.outcomeMod) || !state.location) return;

    const groups = [];
    if (isCombatMod(state.outcomeMod)) {
      const attackOptions = getAttackOptions();
      if (!state.attackType || !attackOptions[state.attackType]) return;
      attackOptions[state.attackType].forEach((group) => groups.push(group));
    } else if (isSkillMod(state.outcomeMod)) {
      groups.push({ label: 'Skills', ids: SKILL_NAMES });
    }

    groups.forEach((group) => {
      const wrap = document.createElement('div');
      wrap.className = 'workflow__detail-group';
      if (groups.length > 1 || isCombatMod(state.outcomeMod)) {
        const heading = document.createElement('div');
        heading.className = 'workflow__scene-group-label';
        heading.textContent = group.label;
        wrap.appendChild(heading);
      }
      const chips = document.createElement('div');
      chips.className = 'chips chips--pills';
      group.ids.forEach((id) => {
        renderChip(chips, {
          id,
          label: id,
          active: state.subtype === id,
          onClick: () => setState({ subtype: id }),
        });
      });
      wrap.appendChild(chips);
      detailChipsEl.appendChild(wrap);
    });

    if (detailSelectEl && state.subtype) {
      detailSelectEl.value = state.subtype;
    }
  }

  function detailReady() {
    if (!state.outcomeMod || !state.setting || !state.location) return false;
    if (!needsDetail(state.outcomeMod)) return true;
    if (needsAttackType(state.outcomeMod) && !state.attackType) return false;
    return Boolean(state.subtype);
  }

  function nextIncompleteStep() {
    if (!state.pace) return 'pace';
    if (!state.outcomeMod) return 'outcome';
    if (!state.setting || !state.location) return 'scene';
    if (needsAttackType(state.outcomeMod) && !state.attackType) return 'attackType';
    if (needsDetail(state.outcomeMod) && !state.subtype) return 'detail';
    if (detailReady()) return 'target';
    return 'outcome';
  }

  function advanceExpandedStep() {
    expandedStep = nextIncompleteStep();
  }

  function collapseAllSteps() {
    expandedStep = 'done';
    applyCollapseUI();
  }

  function scrollContentIntoView() {
    const content = document.getElementById('content');
    if (!content) return;
    try {
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      content.scrollIntoView(true);
    }
  }

  function applyStepCollapsed(stepEl, summaryEl, collapsed, summaryText) {
    if (!stepEl) return;
    stepEl.classList.toggle('workflow__step--collapsed', collapsed);
    if (!summaryEl) return;
    summaryEl.hidden = !collapsed;
    summaryEl.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (collapsed) {
      summaryEl.textContent = summaryText;
      summaryEl.title = 'Edit this step';
    }
  }

  function moodSummaryText() {
    const mood = window.OutcomeGenerate?.getMoodMeta?.();
    const label = mood?.label || 'Playful';
    return `Mood · ${label}`;
  }

  function paceSummaryText() {
    const pace = PACE_OPTIONS.find((option) => option.id === state.pace);
    return `1. ${pace?.label || 'Pace'}`;
  }

  function outcomeSummaryText() {
    const mod = OUTCOME_MODS.find((m) => m.id === state.outcomeMod);
    return `2. ${mod?.label || state.outcomeMod || 'Outcome'}`;
  }

  function sceneSummaryText() {
    const settingLabel = SETTINGS.find((s) => s.id === state.setting)?.label || state.setting || '';
    const place = state.location ? getSceneLabel(state.location) : '';
    const bits = ['3. Where', settingLabel, place].filter(Boolean);
    const weatherLabel = WEATHER_OPTIONS.find((w) => w.id === state.weather)?.label;
    const lightingLabel = lightingOptionsFor().find((l) => l.id === state.lighting)?.label;
    const envLabels = formatEnvironment();
    if (weatherLabel) bits.push(weatherLabel);
    if (lightingLabel) bits.push(lightingLabel);
    if (envLabels.length) bits.push(envLabels.join(', '));
    return bits.join(' · ');
  }

  function attackTypeSummaryText() {
    return `4. ${attackTypeLabel(state.attackType) || 'Attack type'}`;
  }

  function detailSummaryText() {
    const n = needsAttackType(state.outcomeMod) ? 5 : 4;
    return `${n}. ${state.subtype || 'Detail'}`;
  }

  function targetSummaryText() {
    const bits = ['Focus'];
    if (state.situation) bits.push(state.situation);
    if ((state.focusName || '').trim()) bits.push(state.focusName.trim());
    else if (!state.targets.includes('any')) {
      bits.push(state.targets.map((id) => TARGETS.find((t) => t.id === id)?.label || id).join(', '));
    }
    return bits.join(' · ');
  }

  function applyCollapseUI() {
    const showOutcome = Boolean(state.pace);
    const showScene = Boolean(state.outcomeMod);
    const placeReady = Boolean(state.setting && state.location);
    const showAttackType = showScene && placeReady && needsAttackType(state.outcomeMod);
    const showDetail = showScene && placeReady && needsDetail(state.outcomeMod)
      && (!needsAttackType(state.outcomeMod) || Boolean(state.attackType));
    const showTarget = detailReady();

    if (expandedStep === 'outcome' && !showOutcome) expandedStep = 'pace';
    if (expandedStep === 'scene' && !showScene) expandedStep = nextIncompleteStep();
    if (expandedStep === 'attackType' && !showAttackType) expandedStep = nextIncompleteStep();
    if (expandedStep === 'detail' && !showDetail) expandedStep = nextIncompleteStep();
    if (expandedStep === 'target' && !showTarget) expandedStep = nextIncompleteStep();

    applyStepCollapsed(moodStepEl, moodSummaryEl, expandedStep !== 'mood', moodSummaryText());
    applyStepCollapsed(paceStepEl, paceSummaryEl, Boolean(state.pace) && expandedStep !== 'pace', paceSummaryText());
    applyStepCollapsed(
      outcomeStepEl,
      outcomeSummaryEl,
      Boolean(state.outcomeMod) && expandedStep !== 'outcome',
      outcomeSummaryText()
    );

    if (showScene) {
      applyStepCollapsed(sceneStepEl, sceneSummaryEl, placeReady && expandedStep !== 'scene', sceneSummaryText());
    } else if (sceneSummaryEl) {
      sceneSummaryEl.hidden = true;
      sceneStepEl?.classList.remove('workflow__step--collapsed');
    }

    if (showAttackType) {
      applyStepCollapsed(
        attackTypeStepEl,
        attackTypeSummaryEl,
        Boolean(state.attackType) && expandedStep !== 'attackType',
        attackTypeSummaryText()
      );
    } else if (attackTypeSummaryEl) {
      attackTypeSummaryEl.hidden = true;
      attackTypeStepEl?.classList.remove('workflow__step--collapsed');
    }

    if (showDetail) {
      applyStepCollapsed(
        detailStepEl,
        detailSummaryEl,
        Boolean(state.subtype) && expandedStep !== 'detail',
        detailSummaryText()
      );
    } else if (detailSummaryEl) {
      detailSummaryEl.hidden = true;
      detailStepEl?.classList.remove('workflow__step--collapsed');
    }

    if (showTarget) {
      applyStepCollapsed(targetStepEl, targetSummaryEl, expandedStep !== 'target', targetSummaryText());
    } else if (targetSummaryEl) {
      targetSummaryEl.hidden = true;
      targetStepEl?.classList.remove('workflow__step--collapsed');
    }
  }

  function expandStep(stepId) {
    expandedStep = stepId;
    renderPanel();
    notifyChange();
  }

  function bindStepSummaries() {
    if (stepSummaryBound) return;
    [
      [moodSummaryEl, 'mood'],
      [paceSummaryEl, 'pace'],
      [outcomeSummaryEl, 'outcome'],
      [sceneSummaryEl, 'scene'],
      [attackTypeSummaryEl, 'attackType'],
      [detailSummaryEl, 'detail'],
      [targetSummaryEl, 'target'],
    ].forEach(([el, id]) => {
      if (!el) return;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        expandStep(id);
      });
    });
    stepSummaryBound = true;
  }

  function renderPanel() {
    if (!panelEl || !outcomeEl) return;

    panelEl.classList.toggle('workflow--skills', isSkillMod(state.outcomeMod));
    if (window.OutcomeGenerate?.initMoodUI) {
      window.OutcomeGenerate.initMoodUI();
    }

    if (paceChipsEl) {
      paceChipsEl.innerHTML = '';
      PACE_OPTIONS.forEach((pace) => {
        renderChip(paceChipsEl, {
          id: pace.id,
          label: pace.label,
          active: state.pace === pace.id,
          title: pace.hint || '',
          onClick: () => setState({ pace: pace.id }),
        });
      });
    }

    const showOutcome = Boolean(state.pace);
    if (outcomeStepEl) outcomeStepEl.hidden = !showOutcome;
    if (outcomeLabelEl) {
      outcomeLabelEl.textContent = '2. What do you need?';
    }

    outcomeEl.innerHTML = '';
    if (!showOutcome) {
      if (sceneStepEl) sceneStepEl.hidden = true;
      if (attackTypeStepEl) attackTypeStepEl.hidden = true;
      if (detailStepEl) detailStepEl.hidden = true;
      if (targetStepEl) targetStepEl.hidden = true;
      applyCollapseUI();
      return;
    }

    const mods = getOutcomeModsForSection();
    const sceneMods = mods.filter((m) => m.group !== 'speech');
    const speechMods = mods.filter((m) => m.group === 'speech');

    function appendOutcomeGroup(label, groupMods) {
      if (!groupMods.length) return;
      const block = document.createElement('div');
      block.className = 'workflow__outcome-group';
      const heading = document.createElement('div');
      heading.className = 'workflow__scene-group-label';
      heading.textContent = label;
      block.appendChild(heading);
      const chips = document.createElement('div');
      chips.className = 'chips chips--pills';
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', label);
      groupMods.forEach((mod) => {
        renderChip(chips, {
          id: mod.id,
          label: mod.label,
          active: state.outcomeMod === mod.id,
          onClick: () => setState({ outcomeMod: mod.id }),
        });
      });
      block.appendChild(chips);
      outcomeEl.appendChild(block);
    }

    if (speechMods.length && sceneMods.length) {
      appendOutcomeGroup('Scene outcomes', sceneMods);
      appendOutcomeGroup('Spoken lines', speechMods);
    } else {
      mods.forEach((mod) => {
        renderChip(outcomeEl, {
          id: mod.id,
          label: mod.label,
          active: state.outcomeMod === mod.id,
          onClick: () => setState({ outcomeMod: mod.id }),
        });
      });
    }

    const showScene = Boolean(state.outcomeMod);
    if (sceneStepEl) sceneStepEl.hidden = !showScene;
    if (sceneStepEl && showScene) {
      const sceneLabel = document.getElementById('workflowSceneLabel');
      if (sceneLabel) sceneLabel.textContent = '3. Where are you?';
    }
    if (showScene) {
      renderSettingChips();
      const showPlace = Boolean(state.setting);
      if (placeBlockEl) placeBlockEl.hidden = !showPlace;
      if (showPlace) renderScenePills();
      const showConditions = showPlace && Boolean(state.location);
      if (conditionBlockEl) conditionBlockEl.hidden = !showConditions;
      if (weatherBlockEl) weatherBlockEl.hidden = !(showConditions && state.setting === 'outdoors');
      if (lightingBlockEl) lightingBlockEl.hidden = !(showConditions && state.setting === 'indoors');
      if (showConditions) {
        if (state.setting === 'outdoors') renderWeatherChips();
        if (state.setting === 'indoors') renderLightingChips();
        renderEnvironmentChips();
      }
    } else if (sceneInputEl && document.activeElement !== sceneInputEl) {
      sceneInputEl.value = '';
    }

    const placeReady = Boolean(state.setting && state.location);
    const showAttackType = showScene && placeReady && needsAttackType(state.outcomeMod);
    if (attackTypeStepEl) attackTypeStepEl.hidden = !showAttackType;
    if (attackTypeLabelEl) attackTypeLabelEl.textContent = '4. Attack type?';
    if (showAttackType) renderAttackTypePills();

    const showDetail = showScene && placeReady && needsDetail(state.outcomeMod)
      && (!needsAttackType(state.outcomeMod) || Boolean(state.attackType));
    if (detailStepEl) detailStepEl.hidden = !showDetail;
    if (detailLabelEl) {
      if (isCombatMod(state.outcomeMod)) {
        detailLabelEl.textContent = state.attackType === 'magic'
          ? '5. Which bard spell?'
          : '5. Which weapon?';
      } else if (isSkillMod(state.outcomeMod)) {
        detailLabelEl.textContent = '4. Which skill?';
      } else {
        detailLabelEl.textContent = '4. Which skill or weapon?';
      }
    }
    if (roleplayHintEl) roleplayHintEl.style.display = 'none';
    if (showDetail) renderDetailPills();

    const showTarget = detailReady();
    if (targetStepEl) targetStepEl.hidden = !showTarget;
    if (targetLabelEl) {
      let n = 4;
      if (isCombatMod(state.outcomeMod)) n = 6;
      else if (isSkillMod(state.outcomeMod)) n = 5;
      if (isSpeechMod(state.outcomeMod)) {
        targetLabelEl.innerHTML = `${n}. Who is this about? <span class="workflow__hint">(optional)</span>`;
      } else {
        targetLabelEl.innerHTML = `${n}. Who or what is the focus? <span class="workflow__hint">(optional)</span>`;
      }
    }
    if (targetEl) {
      targetEl.innerHTML = '';
      if (showTarget) {
        const allowedTargets = new Set(getAllowedTargetIds());
        TARGETS.forEach((target) => {
          const disabled = !allowedTargets.has(target.id);
          renderChip(targetEl, {
            id: target.id,
            label: target.label,
            active: state.targets.includes(target.id),
            disabled,
            title: disabled
              ? `Doesn't apply to ${OUTCOME_MODS.find((m) => m.id === state.outcomeMod)?.label || 'this outcome'}`
              : '',
            onClick: () => toggleTarget(target.id),
          });
        });
      }
    }
    if (showTarget) renderNamePicker();
    else if (nameBlockEl) nameBlockEl.hidden = true;

    applyCollapseUI();
  }

  function showPanel(show) {
    if (!panelEl) return;
    panelEl.style.display = show ? '' : 'none';
    const chipsRow = document.getElementById('categoryChipsRow');
    if (chipsRow) chipsRow.style.display = show ? 'none' : '';
    const searchRow = document.getElementById('searchToolbarRow');
    if (searchRow) searchRow.style.display = show ? 'none' : '';
    const filtersRow = document.getElementById('filtersToolbarRow');
    if (filtersRow && show) filtersRow.style.display = 'none';
  }

  function init(options = {}) {
    panelEl = document.getElementById('workflowPanel');
    sceneSelectEl = document.getElementById('workflowSceneSelect');
    moodStepEl = document.getElementById('workflowMoodStep');
    moodSummaryEl = document.getElementById('workflowMoodSummary');
    sceneStepEl = document.getElementById('workflowSceneStep');
    sceneSummaryEl = document.getElementById('workflowSceneSummary');
    settingChipsEl = document.getElementById('workflowSettingChips');
    placeBlockEl = document.getElementById('workflowPlaceBlock');
    sceneGroupsEl = document.getElementById('workflowSceneGroups');
    sceneInputEl = document.getElementById('workflowSceneInput');
    conditionBlockEl = document.getElementById('workflowConditionBlock');
    weatherBlockEl = document.getElementById('workflowWeatherBlock');
    weatherChipsEl = document.getElementById('workflowWeatherChips');
    lightingBlockEl = document.getElementById('workflowLightingBlock');
    lightingChipsEl = document.getElementById('workflowLightingChips');
    environmentChipsEl = document.getElementById('workflowEnvironmentChips');
    outcomeStepEl = document.getElementById('workflowOutcomeStep');
    outcomeSummaryEl = document.getElementById('workflowOutcomeSummary');
    outcomeLabelEl = document.getElementById('workflowOutcomeLabel');
    outcomeEl = document.getElementById('workflowOutcomeChips');
    paceStepEl = document.getElementById('workflowPaceStep');
    paceSummaryEl = document.getElementById('workflowPaceSummary');
    paceLabelEl = document.getElementById('workflowPaceLabel');
    paceChipsEl = document.getElementById('workflowPaceChips');
    attackTypeStepEl = document.getElementById('workflowAttackTypeStep');
    attackTypeSummaryEl = document.getElementById('workflowAttackTypeSummary');
    attackTypeLabelEl = document.getElementById('workflowAttackTypeLabel');
    attackTypeChipsEl = document.getElementById('workflowAttackTypeChips');
    detailStepEl = document.getElementById('workflowDetailStep');
    detailSummaryEl = document.getElementById('workflowDetailSummary');
    detailSelectEl = document.getElementById('workflowDetailSelect');
    detailChipsEl = document.getElementById('workflowDetailChips');
    detailLabelEl = document.getElementById('workflowDetailLabel');
    roleplayHintEl = document.getElementById('workflowRoleplayHint');
    targetStepEl = document.getElementById('workflowTargetStep');
    targetSummaryEl = document.getElementById('workflowTargetSummary');
    targetLabelEl = document.getElementById('workflowTargetLabel');
    targetEl = document.getElementById('workflowTargetChips');
    nameBlockEl = document.getElementById('workflowNameBlock');
    situationLabelEl = document.getElementById('workflowSituationLabel');
    situationChipsEl = document.getElementById('workflowSituationChips');
    partyChipsEl = document.getElementById('workflowPartyChips');
    enemyGroupsEl = document.getElementById('workflowEnemyGroups');
    nameInputEl = document.getElementById('workflowNameInput');
    summaryEl = document.getElementById('workflowSummary');
    onChangeCallback = options.onChange || null;

    if (!panelEl) return;

    if (sceneInputEl && !sceneInputBound) {
      sceneInputEl.addEventListener('input', () => {
        setCustomLocation(sceneInputEl.value, { fromInput: true });
      });
      sceneInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sceneInputEl.blur();
        }
      });
      sceneInputBound = true;
    }

    if (nameInputEl && !nameInputBound) {
      nameInputEl.addEventListener('input', () => {
        setFocusName(nameInputEl.value, { fromInput: true });
      });
      nameInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          nameInputEl.blur();
        }
      });
      nameInputBound = true;
    }

    bindStepSummaries();

    // Wizard starts blank — user answers questions top to bottom.
    resetWizardState();
    if (!window.__blingusMoodListenerBound) {
      const onSessionSettingChange = () => {
        if (window.OutcomeGenerate?.clearLastResult) {
          window.OutcomeGenerate.clearLastResult();
        }
        if (expandedStep === 'mood') advanceExpandedStep();
        applyCollapseUI();
        notifyChange();
      };
      window.addEventListener('blingus-mood-change', onSessionSettingChange);
      window.addEventListener('blingus-rating-change', onSessionSettingChange);
      window.__blingusMoodListenerBound = true;
    }
    if (!window.__blingusCatalogListenerBound) {
      window.addEventListener('workflow-catalog-change', () => {
        renderPanel();
        window.OutcomeGenerate?.renderMoodChips?.();
      });
      window.__blingusCatalogListenerBound = true;
    }
    if (!window.__blingusCharacterListenerBound) {
      window.addEventListener('blingus-character-change', () => {
        if (window.OutcomeGenerate?.clearLastResult) {
          window.OutcomeGenerate.clearLastResult();
        }
        renderPanel();
        notifyChange();
      });
      window.__blingusCharacterListenerBound = true;
    }
    renderPanel();
    notifyChange();
  }

  window.ActionWorkflow = {
    init,
    isWorkflowSection,
    applyTabPreset,
    resolveOutcomeContext,
    getGenerateSelection,
    collapseAllSteps,
    scrollContentIntoView,
    filterByTargets,
    filterByScene,
    filterValidOutcomes,
    buildWorkflowOutcomePool,
    isOutcomeValid,
    getEmptyOutcomeHint,
    getAllowedTargetIds,
    getPreferredRandomPool,
    getSceneLabel,
    getCatalogDefaults,
    refreshCatalog: renderPanel,
    getState: () => ({ ...state, targets: [...sanitizeTargets(state.outcomeMod, state.targets)] }),
    showPanel,
    WORKFLOW_SECTIONS: [...WORKFLOW_SECTIONS],
  };
})();
