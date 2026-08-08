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
    'Sleight of Hand', 'Stealth', 'Survival',
  ];

  /** Crit hit/fail: damage family first, then D&D 5.5e (2024) options. */
  const ATTACK_TYPES = [
    { id: 'slash', label: '⚔️ Slash' },
    { id: 'pierce', label: '🏹 Pierce' },
    { id: 'blunt', label: '🔨 Blunt' },
    { id: 'magic', label: '✨ Magic' },
  ];

  const ATTACK_OPTIONS = {
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

  const OUTCOME_MODS = [
    { id: 'roleplay', label: '🎭 Roleplay', group: 'scene' },
    { id: 'hit', label: '⚔️ Crit Hit', group: 'scene' },
    { id: 'fail', label: '💥 Crit Fail', group: 'scene' },
    { id: 'success', label: '✅ Success', group: 'scene' },
    { id: 'failure', label: '❌ Failure', group: 'scene' },
    { id: 'battleCry', label: '📢 Battle Cry', group: 'speech' },
    { id: 'insult', label: '🗡️ Insult', group: 'speech' },
    { id: 'compliment', label: '💬 Compliment', group: 'speech' },
    { id: 'introduction', label: '🎭 Chaucer Intro', group: 'speech' },
  ];

  const SPEECH_META = {
    battleCry: {
      section: 'outcomes',
      category: 'battleCries',
      metaLabel: 'Battle Cry',
      modalPrefix: '📢',
    },
    insult: {
      section: 'outcomes',
      category: 'insults',
      metaLabel: 'Insult',
      modalPrefix: '🗡️',
    },
    compliment: {
      section: 'outcomes',
      category: 'compliments',
      metaLabel: 'Compliment',
      modalPrefix: '💬',
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

  const SCENE_GROUPS = [
    {
      label: 'Town & Social',
      ids: [
        'Village', 'Town Square', 'Tavern', 'Inn', 'Market', 'Shop',
        'Temple', 'Blacksmith', 'Listening for Rumors',
      ],
    },
    {
      label: 'Adventure Sites',
      ids: ['Castle', 'Dungeon', 'Ruins', 'Cave', 'Crypt', 'Tower', 'Fort', 'Sewers', 'Mine'],
    },
    {
      label: 'Terrain & Wilds',
      ids: [
        'Forest', 'Mountains', 'Hills', 'Desert', 'Jungle', 'Plains',
        'Swamp / Marsh', 'Coast', 'Tundra', 'Bad Weather',
        'Travelling / On the Trail', 'Camp',
      ],
    },
    {
      label: 'Special',
      ids: ['Carnival / Feywild (Wild Beyond The Witchlight)'],
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
      'Carnival / Feywild (Wild Beyond The Witchlight)',
    ]),
    outdoors: new Set([
      'Village', 'Town Square', 'Market', 'Ruins', 'Forest', 'Mountains', 'Hills',
      'Desert', 'Jungle', 'Plains', 'Swamp / Marsh', 'Coast', 'Tundra', 'Bad Weather',
      'Travelling / On the Trail', 'Camp',
      'Carnival / Feywild (Wild Beyond The Witchlight)',
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
    hit: ['any', 'enemy', 'npc'],
    fail: ['any', 'self', 'ally', 'environment', 'object', 'enemy', 'npc'],
    success: ['any', 'self', 'ally', 'enemy', 'environment', 'npc', 'object'],
    failure: ['any', 'self', 'ally', 'environment', 'npc', 'object'],
    battleCry: ['any', 'enemy', 'ally', 'self', 'npc'],
    insult: ['any', 'enemy', 'npc', 'ally', 'self'],
    compliment: ['any', 'ally', 'npc', 'self', 'enemy'],
    introduction: ['any', 'ally', 'self', 'npc', 'enemy'],
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
    outcomeMod: null,
    attackType: null,
    subtype: null,
    targets: ['any'],
    focusName: '',
  };

  let activeSection = 'outcomes';
  let onChangeCallback = null;
  let panelEl = null;
  let sceneSelectEl = null;
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
  let outcomeStepEl = null;
  let outcomeLabelEl = null;
  let outcomeEl = null;
  let attackTypeStepEl = null;
  let attackTypeLabelEl = null;
  let attackTypeChipsEl = null;
  let detailStepEl = null;
  let detailSelectEl = null;
  let detailChipsEl = null;
  let detailLabelEl = null;
  let roleplayHintEl = null;
  let targetStepEl = null;
  let targetLabelEl = null;
  let targetEl = null;
  let nameBlockEl = null;
  let partyChipsEl = null;
  let nameInputEl = null;
  let nameInputBound = false;
  let summaryEl = null;

  function isWorkflowSection(section) {
    return WORKFLOW_SECTIONS.has(section);
  }

  function getSceneIds() {
    const fromActions = Object.keys(window.BlingusData?.characterActions || {});
    if (fromActions.length) return fromActions;
    const types = window.BlingusData?.sceneTypes || {};
    return Object.keys(types);
  }

  function normalizeLocationId(locationId) {
    if (locationId === 'Walking in a Dungeon') return 'Dungeon';
    return locationId;
  }

  function getSceneLabel(id) {
    return SCENE_LABELS[id] || SCENE_LABELS[normalizeLocationId(id)] || id;
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
    if (section === 'outcomes') return OUTCOME_MODS;
    if (section === 'actions') return OUTCOME_MODS.filter((m) => m.id === 'roleplay');
    if (section === 'criticalHits') return OUTCOME_MODS.filter((m) => m.id === 'hit');
    if (section === 'criticalFailures') return OUTCOME_MODS.filter((m) => m.id === 'fail');
    if (section === 'skillChecks') return OUTCOME_MODS.filter((m) => m.id === 'success' || m.id === 'failure');
    return OUTCOME_MODS;
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
  }

  function environmentOptionsFor(setting = state.setting) {
    const shared = ENVIRONMENT_SHARED.slice();
    if (setting === 'indoors') return shared.concat(ENVIRONMENT_INDOORS);
    if (setting === 'outdoors') return shared.concat(ENVIRONMENT_OUTDOORS);
    return shared;
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
    return {
      ready: true,
      scene: ctx.location,
      setting: state.setting || '',
      weather: state.weather || '',
      lighting: state.lighting || '',
      environment: formatEnvironment(),
      outcome: state.outcomeMod,
      attackType: state.attackType || '',
      detail: state.subtype || '',
      target,
      name,
      partyMember: isPartyFocusName(name),
      mood,
      count: 5,
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
    if (isSpeechMod(outcomeMod)) return true;
    const personTargets = new Set(['ally', 'enemy', 'npc', 'self']);
    return sanitizeTargets(outcomeMod, targets).some((id) => personTargets.has(id));
  }

  function resolveOutcomeContext(workflowState = state) {
    const location = normalizeLocationId(workflowState.location);
    const { outcomeMod, subtype } = workflowState;

    if (!outcomeMod) {
      return { ready: false, reason: 'Start with what happened — pick an outcome type.' };
    }

    if (!workflowState.setting) {
      return { ready: false, reason: 'Indoors or outdoors first.' };
    }

    if (!location) {
      return { ready: false, reason: 'Where exactly? Pick a place or type one.' };
    }

    if (outcomeMod === 'roleplay') {
      return {
        ready: true,
        section: 'actions',
        category: location,
        location,
        outcomeMod,
        metaLabel: 'Action',
        modalPrefix: '🎭',
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
    return types[normalized] || types[locationId] || 'social';
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
    if (!items.length || !locationId || outcomeMod === 'roleplay') {
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
    if (state.outcomeMod === 'roleplay' || isSpeechMod(state.outcomeMod)) {
      detail = null;
    } else if (isSkillMod(state.outcomeMod)) {
      detail = `${state.subtype} · ${state.outcomeMod === 'success' ? 'Success' : 'Failure'}`;
    } else {
      const atk = attackTypeLabel(state.attackType).replace(/^[^\s]+\s/, '');
      detail = `${atk} · ${state.subtype}`;
    }

    const settingLabel = SETTINGS.find((s) => s.id === state.setting)?.label || state.setting;
    const weatherLabel = WEATHER_OPTIONS.find((w) => w.id === state.weather)?.label;
    const lightingLabel = LIGHTING_OPTIONS.find((l) => l.id === state.lighting)?.label;
    const envLabels = formatEnvironment();

    const moodLabel = window.OutcomeGenerate?.getMoodMeta?.()?.label || '';
    const parts = [moodLabel, modLabel, settingLabel, sceneLabel].filter(Boolean);
    if (weatherLabel) parts.push(weatherLabel);
    if (lightingLabel) parts.push(lightingLabel);
    if (envLabels.length) parts.push(envLabels.join(', '));
    if (detail) parts.push(detail);
    parts.push(targetLabels);
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

    const changingOutcome = Object.prototype.hasOwnProperty.call(partial, 'outcomeMod')
      && partial.outcomeMod !== state.outcomeMod;
    const changingSetting = Object.prototype.hasOwnProperty.call(partial, 'setting')
      && partial.setting !== state.setting;
    const changingLocation = Object.prototype.hasOwnProperty.call(partial, 'location')
      && partial.location !== state.location;
    const changingAttackType = Object.prototype.hasOwnProperty.call(partial, 'attackType')
      && partial.attackType !== state.attackType;

    // Changing an earlier answer clears everything downstream.
    if (changingOutcome) {
      partial.setting = null;
      partial.location = null;
      partial.weather = null;
      partial.lighting = null;
      partial.environment = [];
      partial.attackType = null;
      partial.subtype = null;
      partial.targets = ['any'];
      partial.focusName = '';
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

  function setFocusName(name, { fromInput = false } = {}) {
    state.focusName = (name || '').trim();
    if (!fromInput && nameInputEl) {
      nameInputEl.value = state.focusName;
    }
    if (window.OutcomeGenerate?.clearLastResult) {
      window.OutcomeGenerate.clearLastResult();
    }
    renderPartyChips();
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
      });
    });
  }

  function renderNamePicker() {
    if (!nameBlockEl) return;
    const show = detailReady() && showNamePicker();
    nameBlockEl.hidden = !show;
    if (!show) return;
    renderPartyChips();
    if (nameInputEl && document.activeElement !== nameInputEl) {
      nameInputEl.value = state.focusName || '';
    }
  }

  function renderChip(container, { id, label, active, disabled, onClick, title }) {
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
    LIGHTING_OPTIONS.forEach((opt) => {
      renderChip(lightingChipsEl, {
        id: opt.id,
        label: opt.label,
        active: state.lighting === opt.id,
        onClick: () => setState({ lighting: opt.id }),
      });
    });
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
      });
    });
  }

  function renderScenePills() {
    if (!sceneGroupsEl) return;
    sceneGroupsEl.innerHTML = '';
    const known = new Set(getSceneIds());
    const allowed = SCENES_BY_SETTING[state.setting] || known;
    const selected = normalizeLocationId(state.location);
    const selectedIsKnown = Boolean(selected && known.has(selected) && allowed.has(selected));

    SCENE_GROUPS.forEach((group) => {
      const ids = group.ids.filter((id) => known.has(id) && allowed.has(id));
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
        });
      });
      block.appendChild(chips);
      sceneGroupsEl.appendChild(block);
    });

    const grouped = new Set(SCENE_GROUPS.flatMap((g) => g.ids));
    const orphans = getSceneIds().filter((id) => !grouped.has(id) && allowed.has(id));
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
      if (!state.attackType || !ATTACK_OPTIONS[state.attackType]) return;
      ATTACK_OPTIONS[state.attackType].forEach((group) => groups.push(group));
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

  function renderPanel() {
    if (!panelEl || !outcomeEl) return;

    panelEl.classList.toggle('workflow--skills', isSkillMod(state.outcomeMod));
    if (window.OutcomeGenerate?.initMoodUI) {
      window.OutcomeGenerate.initMoodUI();
    }

    if (outcomeLabelEl) {
      outcomeLabelEl.textContent = '1. What do you need?';
    }

    outcomeEl.innerHTML = '';
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
      appendOutcomeGroup('Lines & quips', speechMods);
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
    if (attackTypeLabelEl) attackTypeLabelEl.textContent = '3. Attack type?';
    if (showAttackType) renderAttackTypePills();

    const showDetail = showScene && placeReady && needsDetail(state.outcomeMod)
      && (!needsAttackType(state.outcomeMod) || Boolean(state.attackType));
    if (detailStepEl) detailStepEl.hidden = !showDetail;
    if (detailLabelEl) {
      if (isCombatMod(state.outcomeMod)) {
        const n = 4;
        detailLabelEl.textContent = state.attackType === 'magic'
          ? `${n}. Which bard spell?`
          : `${n}. Which weapon?`;
      } else if (isSkillMod(state.outcomeMod)) {
        detailLabelEl.textContent = '3. Which skill?';
      } else {
        detailLabelEl.textContent = '3. Which skill or weapon?';
      }
    }
    if (roleplayHintEl) roleplayHintEl.style.display = 'none';
    if (showDetail) renderDetailPills();

    const showTarget = detailReady();
    if (targetStepEl) targetStepEl.hidden = !showTarget;
    if (targetLabelEl) {
      let n = 3;
      if (isCombatMod(state.outcomeMod)) n = 5;
      else if (isSkillMod(state.outcomeMod)) n = 4;
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
    sceneStepEl = document.getElementById('workflowSceneStep');
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
    outcomeLabelEl = document.getElementById('workflowOutcomeLabel');
    outcomeEl = document.getElementById('workflowOutcomeChips');
    attackTypeStepEl = document.getElementById('workflowAttackTypeStep');
    attackTypeLabelEl = document.getElementById('workflowAttackTypeLabel');
    attackTypeChipsEl = document.getElementById('workflowAttackTypeChips');
    detailStepEl = document.getElementById('workflowDetailStep');
    detailSelectEl = document.getElementById('workflowDetailSelect');
    detailChipsEl = document.getElementById('workflowDetailChips');
    detailLabelEl = document.getElementById('workflowDetailLabel');
    roleplayHintEl = document.getElementById('workflowRoleplayHint');
    targetStepEl = document.getElementById('workflowTargetStep');
    targetLabelEl = document.getElementById('workflowTargetLabel');
    targetEl = document.getElementById('workflowTargetChips');
    nameBlockEl = document.getElementById('workflowNameBlock');
    partyChipsEl = document.getElementById('workflowPartyChips');
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

    // Wizard starts blank — user answers questions top to bottom.
    resetWizardState();
    if (!window.__blingusMoodListenerBound) {
      window.addEventListener('blingus-mood-change', () => {
        if (window.OutcomeGenerate?.clearLastResult) {
          window.OutcomeGenerate.clearLastResult();
        }
        notifyChange();
      });
      window.__blingusMoodListenerBound = true;
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
    filterByTargets,
    filterByScene,
    filterValidOutcomes,
    buildWorkflowOutcomePool,
    isOutcomeValid,
    getEmptyOutcomeHint,
    getAllowedTargetIds,
    getPreferredRandomPool,
    getSceneLabel,
    getState: () => ({ ...state, targets: [...sanitizeTargets(state.outcomeMod, state.targets)] }),
    showPanel,
    WORKFLOW_SECTIONS: [...WORKFLOW_SECTIONS],
  };
})();
