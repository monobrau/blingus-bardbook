/**
 * Multi-step workflow for actions, critical hits/fails, and skill checks.
 * Step 1: Location / scene
 * Step 2: Outcome (roleplay, crit hit/fail, skill success/failure — always all five)
 * Step 3: Weapon, magic type, or skill (when the outcome needs it)
 * Step 4: Target filter (narrows/highlighting only — never hides outcomes)
 */
(function () {
  'use strict';

  const WORKFLOW_SECTIONS = new Set(['actions', 'criticalHits', 'criticalFailures', 'skillChecks']);

  const WEAPON_CATEGORIES = [
    'Arrows', 'Crossbolts', 'Swords', 'Polearms', 'Knives',
    'Blunt Weapons', 'Axes and Hammers', 'Other Weapons',
  ];

  const MAGIC_CATEGORIES = [
    'Fire', 'Cold', 'Lightning', 'Thunder', 'Psychic',
    'Force', 'Necrotic', 'Radiant', 'Acid',
  ];

  const SKILL_NAMES = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival',
  ];

  const OUTCOME_MODS = [
    { id: 'roleplay', label: '🎭 Roleplay' },
    { id: 'hit', label: '⚔️ Crit Hit' },
    { id: 'fail', label: '💥 Crit Fail' },
    { id: 'success', label: '✅ Success' },
    { id: 'failure', label: '❌ Failure' },
  ];

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
    outcomeMod: 'roleplay',
    subtype: null,
    targets: ['any'],
  };

  let activeSection = 'actions';
  let onChangeCallback = null;
  let panelEl = null;
  let sceneSelectEl = null;
  let outcomeStepEl = null;
  let outcomeLabelEl = null;
  let outcomeEl = null;
  let detailStepEl = null;
  let detailSelectEl = null;
  let detailLabelEl = null;
  let roleplayHintEl = null;
  let targetEl = null;
  let summaryEl = null;
  let sceneSelectBuilt = false;
  let detailSelectBound = false;
  let lastDetailOutcomeMod = null;
  let lastDetailSection = null;

  function isWorkflowSection(section) {
    return WORKFLOW_SECTIONS.has(section);
  }

  function getSceneIds() {
    return Object.keys(window.BlingusData?.characterActions || {});
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

  function needsDetail(outcomeMod) {
    return outcomeMod !== 'roleplay';
  }

  function defaultSubtype(outcomeMod) {
    if (isCombatMod(outcomeMod)) return WEAPON_CATEGORIES[0];
    if (isSkillMod(outcomeMod)) return SKILL_NAMES[0];
    return null;
  }

  function defaultOutcomeMod(section = activeSection) {
    if (section === 'criticalHits') return 'hit';
    if (section === 'criticalFailures') return 'fail';
    if (section === 'skillChecks') return 'success';
    return 'roleplay';
  }

  function getOutcomeModsForSection(section = activeSection) {
    if (section === 'actions') return OUTCOME_MODS.filter((m) => m.id === 'roleplay');
    if (section === 'criticalHits') return OUTCOME_MODS.filter((m) => m.id === 'hit');
    if (section === 'criticalFailures') return OUTCOME_MODS.filter((m) => m.id === 'fail');
    if (section === 'skillChecks') return OUTCOME_MODS.filter((m) => m.id === 'success' || m.id === 'failure');
    return OUTCOME_MODS;
  }

  function clampOutcomeMod(outcomeMod = state.outcomeMod, section = activeSection) {
    const allowed = getOutcomeModsForSection(section).map((m) => m.id);
    return allowed.includes(outcomeMod) ? outcomeMod : defaultOutcomeMod(section);
  }

  function applyTabPreset(section) {
    activeSection = section;
    state.outcomeMod = clampOutcomeMod(defaultOutcomeMod(section), section);
    state.subtype = needsDetail(state.outcomeMod) ? defaultSubtype(state.outcomeMod) : null;
    if (!state.location) state.location = defaultLocation();
    if (!state.targets.length) state.targets = ['any'];
    state.targets = sanitizeTargets(state.outcomeMod, state.targets);
    renderPanel();
    notifyChange();
  }

  function resolveOutcomeContext(workflowState = state) {
    const location = normalizeLocationId(workflowState.location);
    const { outcomeMod, subtype } = workflowState;

    if (!location) {
      return { ready: false, reason: 'Pick where Blingus is first — location and scene matter!' };
    }

    if (outcomeMod === 'roleplay') {
      if (!getSceneIds().includes(location)) {
        return { ready: false, reason: 'Pick a valid location or scene above.' };
      }
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

    if (!subtype) {
      return { ready: false, reason: 'Pick a weapon, magic type, or skill for this outcome.' };
    }

    if (outcomeMod === 'hit') {
      return {
        ready: true,
        section: 'criticalHits',
        category: subtype,
        location,
        outcomeMod,
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
    if (!context.ready) return context.reason || 'Complete the steps above to see outcomes.';
    const sceneLabel = getSceneLabel(state.location);
    const targetLabels = state.targets.includes('any')
      ? 'any target'
      : state.targets.map((id) => TARGETS.find((t) => t.id === id)?.label || id).join(', ');

    const modLabel = OUTCOME_MODS.find((m) => m.id === state.outcomeMod)?.label || state.outcomeMod;
    let detail = '';
    if (state.outcomeMod === 'roleplay') {
      detail = 'roleplay actions';
    } else if (isSkillMod(state.outcomeMod)) {
      detail = `${state.subtype} · ${state.outcomeMod === 'success' ? 'Success' : 'Failure'}`;
    } else {
      detail = `${state.subtype} · ${modLabel}`;
    }

    return `${sceneLabel} · ${detail} · ${targetLabels}`;
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
    if (partial.location) {
      partial.location = normalizeLocationId(partial.location);
    }
    if (partial.outcomeMod) {
      partial.outcomeMod = clampOutcomeMod(partial.outcomeMod);
    }
    const prevOutcomeMod = state.outcomeMod;
    state = { ...state, ...partial };
    if (partial.outcomeMod) {
      const prevKind = isCombatMod(prevOutcomeMod) ? 'combat'
        : isSkillMod(prevOutcomeMod) ? 'skill' : null;
      const nextKind = isCombatMod(state.outcomeMod) ? 'combat'
        : isSkillMod(state.outcomeMod) ? 'skill' : null;
      if (!needsDetail(state.outcomeMod)) {
        state.subtype = null;
      } else if (prevKind !== nextKind || !state.subtype) {
        state.subtype = defaultSubtype(state.outcomeMod);
      }
      state.targets = sanitizeTargets(state.outcomeMod, state.targets);
    }
    if (partial.targets) {
      state.targets = sanitizeTargets(state.outcomeMod, partial.targets);
    }
    if (partial.location) {
      ensureSceneLoaded(state.location);
    }
    renderPanel();
    notifyChange();
  }

  function toggleTarget(targetId) {
    if (!getAllowedTargetIds().includes(targetId)) return;

    if (targetId === 'any') {
      state.targets = ['any'];
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
    renderPanel();
    notifyChange();
  }

  function renderChip(container, { id, label, active, disabled, onClick, title, compact }) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip'
      + (compact ? ' chip--compact' : '')
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

  function appendSelectOptions(selectEl, groupLabel, ids, labelFn) {
    if (!ids.length) return;
    const group = document.createElement('optgroup');
    group.label = groupLabel;
    ids.forEach((id) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = labelFn ? labelFn(id) : id;
      group.appendChild(option);
    });
    selectEl.appendChild(group);
  }

  function buildSceneSelect() {
    if (!sceneSelectEl || sceneSelectBuilt) return;

    SCENE_GROUPS.forEach((group) => {
      const ids = group.ids.filter((id) => getSceneIds().includes(id));
      appendSelectOptions(sceneSelectEl, group.label, ids, getSceneLabel);
    });

    const grouped = new Set(SCENE_GROUPS.flatMap((g) => g.ids));
    const orphans = getSceneIds().filter((id) => !grouped.has(id));
    appendSelectOptions(sceneSelectEl, 'Other', orphans, getSceneLabel);

    sceneSelectEl.addEventListener('change', () => {
      if (sceneSelectEl.value) setState({ location: sceneSelectEl.value });
    });

    sceneSelectBuilt = true;
  }

  function syncSceneSelect() {
    if (!sceneSelectEl) return;
    buildSceneSelect();
    const loc = normalizeLocationId(state.location);
    if (loc && Array.from(sceneSelectEl.options).some((opt) => opt.value === loc)) {
      sceneSelectEl.value = loc;
    }
  }

  function syncDetailSelect() {
    if (!detailSelectEl || !detailStepEl) return;

    const showDetail = needsDetail(state.outcomeMod);
    detailStepEl.style.display = showDetail ? '' : 'none';
    if (detailLabelEl) {
      if (isCombatMod(state.outcomeMod)) detailLabelEl.textContent = 'Weapon / magic';
      else if (isSkillMod(state.outcomeMod)) detailLabelEl.textContent = 'Skill';
      else detailLabelEl.textContent = 'Weapon / skill';
    }

    if (!showDetail) return;

    const rebuildDetail = lastDetailOutcomeMod !== state.outcomeMod
      || (isSkillMod(state.outcomeMod) && lastDetailSection !== activeSection);
    if (rebuildDetail) {
      detailSelectEl.innerHTML = '';
      if (isCombatMod(state.outcomeMod)) {
        appendSelectOptions(detailSelectEl, 'Weapons', WEAPON_CATEGORIES);
        appendSelectOptions(detailSelectEl, 'Magic', MAGIC_CATEGORIES);
      } else if (isSkillMod(state.outcomeMod)) {
        appendSelectOptions(detailSelectEl, 'Skills', SKILL_NAMES);
      }
      lastDetailOutcomeMod = state.outcomeMod;
      lastDetailSection = activeSection;
    }

    const options = Array.from(detailSelectEl.options);
    if (state.subtype && options.some((opt) => opt.value === state.subtype)) {
      detailSelectEl.value = state.subtype;
    } else {
      const fallback = defaultSubtype(state.outcomeMod);
      detailSelectEl.value = fallback;
      state.subtype = fallback;
    }
  }

  function renderPanel() {
    if (!panelEl) return;

    panelEl.classList.toggle('workflow--skills', activeSection === 'skillChecks');

    if (roleplayHintEl) {
      roleplayHintEl.style.display = state.outcomeMod === 'roleplay' ? '' : 'none';
    }

    syncSceneSelect();
    syncDetailSelect();

    const outcomeMods = getOutcomeModsForSection();
    const showOutcomeStep = outcomeMods.length > 1;
    if (outcomeStepEl) outcomeStepEl.hidden = !showOutcomeStep;
    if (outcomeLabelEl) {
      if (activeSection === 'skillChecks') {
        outcomeLabelEl.innerHTML = 'Result <span class="workflow__hint">(Success or Failure category)</span>';
      } else {
        outcomeLabelEl.textContent = 'Outcome';
      }
    }

    outcomeEl.innerHTML = '';
    outcomeMods.forEach((mod) => {
      renderChip(outcomeEl, {
        id: mod.id,
        label: mod.label,
        active: state.outcomeMod === mod.id,
        compact: true,
        onClick: () => setState({ outcomeMod: mod.id }),
      });
    });

    targetEl.innerHTML = '';
    const allowedTargets = new Set(getAllowedTargetIds());
    TARGETS.forEach((target) => {
      const disabled = !allowedTargets.has(target.id);
      renderChip(targetEl, {
        id: target.id,
        label: target.label,
        active: state.targets.includes(target.id),
        compact: true,
        disabled,
        title: disabled ? `Doesn't apply to ${OUTCOME_MODS.find((m) => m.id === state.outcomeMod)?.label || 'this outcome'}` : '',
        onClick: () => toggleTarget(target.id),
      });
    });
  }

  function showPanel(show) {
    if (!panelEl) return;
    panelEl.style.display = show ? '' : 'none';
    const chipsRow = document.getElementById('categoryChipsRow');
    if (chipsRow) chipsRow.style.display = show ? 'none' : '';
  }

  function init(options = {}) {
    panelEl = document.getElementById('workflowPanel');
    sceneSelectEl = document.getElementById('workflowSceneSelect');
    outcomeStepEl = document.getElementById('workflowOutcomeStep');
    outcomeLabelEl = document.getElementById('workflowOutcomeLabel');
    outcomeEl = document.getElementById('workflowOutcomeChips');
    detailStepEl = document.getElementById('workflowDetailStep');
    detailSelectEl = document.getElementById('workflowDetailSelect');
    detailLabelEl = document.getElementById('workflowDetailLabel');
    roleplayHintEl = document.getElementById('workflowRoleplayHint');
    targetEl = document.getElementById('workflowTargetChips');
    summaryEl = document.getElementById('workflowSummary');
    onChangeCallback = options.onChange || null;

    if (!panelEl) return;

    if (detailSelectEl && !detailSelectBound) {
      detailSelectEl.addEventListener('change', () => {
        if (detailSelectEl.value) setState({ subtype: detailSelectEl.value });
      });
      detailSelectBound = true;
    }

    state.location = normalizeLocationId(state.location || defaultLocation());
    if (needsDetail(state.outcomeMod)) {
      state.subtype = state.subtype || defaultSubtype(state.outcomeMod);
    }
    state.targets = sanitizeTargets(state.outcomeMod, state.targets);
    ensureSceneLoaded(state.location);
    renderPanel();
    notifyChange();
  }

  window.ActionWorkflow = {
    init,
    isWorkflowSection,
    applyTabPreset,
    resolveOutcomeContext,
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
