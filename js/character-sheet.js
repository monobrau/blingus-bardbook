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
        item('Amulet of Proof against Detection and Location', { notes: 'attuned' }),
        item('Witchlight Carnival cloth wings', { notes: '' }),
        item('Woodland pixies whistle', { notes: 'summon 3 pixies for 1 hour' }),
        item('Granny Nightshade\'s iron ring', { notes: 'loot from Skabatha' }),
        item('Mirror of Flattering', { notes: '' }),
        item('Conductor\'s baton', { notes: '' }),
        item('Pass without trace seed', { notes: 'limited uses' }),
        item('Hag Eye', { notes: 'can damage the hag coven; in a bag of holding' }),
        item('Cracked mirror-shard locket', { notes: 'disadvantage 1/long rest; appearance inversion' }),
        item('Button-eye charm', { notes: '+1 Perception; attunable' }),
        item('Potion of Heroism', { notes: 'x2' }),
        item('Beetle candy from Thither', { notes: '' }),
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
        'D&D Beyond sheet (id 142037960). Player: Thindary. Initiative +3. Passive Insight 13, Investigation 16. 106 gp. Light armor, simple weapons.',
        'Slots: 4 first, 3 second, 2 third. Do not invent 4th-level spells or medium/heavy armor flight.',
        '',
        'TABLE-KNOWN WITCHLIGHT (do not invent unpublished spoilers):',
        'Wild Beyond the Witchlight / Prismeer. DM Geoe. Party: Puck Pinewhistle (wild magic sorcerer fairy), Brawn O\'Neil/O\'Neal (dwarven monk; has the Crown of Remembrance), Vadania Amakiir (elven ranger; Vandan / Van Damme), Bo (toad-cauldron era, enlarge, dragon breath at Granny).',
        'Hither: Sir Talavar the fairy dragon in a cage; snakes; Glim the goblin pizza-dude / Sir Whats-his-face; Walking Inn druid wants Zybilna back, spits at Bavlorna; mud muffins; drowned will-o-wisps; Clapperclaw the scarecrow guide; bullywug Stinky Court; note "Spittlespew"; Wittershin\'s = run in place counter-clockwise.',
        'Thither: Loomlurch / Granny Nightshade (Skabatha) defeated, incinerated in her oven; key in her back shows mood; children making nightmare toys; Will of the Feywild / Getaway Gang / Little Oak; marching-band near-wipe; mimic chairs; Scorching Ray hit Vadania; Bo turned from toad after cauldron food; hag portraits include Bavlorna, Endelyn, Tasha.',
        'Coven: Bavlorna Blightstraw (Hither) still alive, party needs her yarn. Skabatha defeated. Endelyn Moongrave (Yon) vulnerable during a (symbolic) eclipse. Zybilna/Tasha frozen in the Palace of Heart\'s Desire by Igwil\'s cauldron.',
        'Session 3: island / Lamorna the unicorn, mate Elidon; his stolen horn is the key to freeing Zybilna; Jabberwock prowls but mist around the lake keeps it off; Amadore the dandelion in Yon can guide to the palace; cloaked assassin with a unicorn horn attacked Lamorna and was KO\'d; blood-soaked token found.',
        'Blingus backstory (his telling): never fit the High Forest fairies; wanderlust louder than a maybe-family; found purpose under Bo, a warlock bound to Zybilna who went silent over a year. Motto: the world\'s a big place, and big problems don\'t solve themselves.',
      ].join('\n'),
    };
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
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
    return out;
  }

  function normalizeList(list, extras) {
    if (!Array.isArray(list)) return [];
    return list.map((row) => normalizeItem(row, extras));
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
      skills: normalizeList(raw.skills),
      features: normalizeList(raw.features),
      armor: normalizeList(raw.armor),
      weapons: normalizeList(raw.weapons, { attackType: 'slash' }),
      gear: normalizeList(raw.gear),
      spells: splitCombinedEnlargeReduce(normalizeList(raw.spells)),
      languages: Array.isArray(raw.languages)
        ? raw.languages.map((l) => String(l || '').trim()).filter(Boolean)
        : base.languages.slice(),
      notes: String(raw.notes || ''),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        sheet = normalize(JSON.parse(raw));
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
    if (/thunderwave/.test(n)) return '1st: thunder cone shove. Not a weapon.';
    if (/earth tremor/.test(n)) return '1st: ground shake, prone. Not a weapon.';
    if (/cloud of daggers/.test(n)) return '2nd: hovering magic daggers in a cube. Not a held dagger stab.';
    if (/shatter/.test(n)) return '2nd: thunder burst. Not a weapon.';
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

  function getMagicOptions() {
    const c = get();
    const groups = [];
    const sheetNames = new Set(c.spells.map((s) => String(s.name || '').trim().toLowerCase()).filter(Boolean));
    if (sheetNames.has('enlarge/reduce')) {
      sheetNames.add('enlarge');
      sheetNames.add('reduce');
    }
    const tree = window.BlingusData?.getSpellTree?.() || [];
    if (tree.length) {
      tree.forEach((group) => {
        const ids = uniqueNames((group.ids || []).filter((n) => sheetNames.has(String(n).toLowerCase())));
        if (ids.length) groups.push({ label: group.label, ids });
      });
    } else {
      const spellNames = c.spells.map((s) => s.name).filter(Boolean);
      if (spellNames.length) groups.push({ label: 'Spells', ids: uniqueNames(spellNames) });
    }
    return groups;
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
      sheet[key].push(item(options.defaultName || 'New item', extras));
      saveImmediate(sheet);
      if (renderHost) render(renderHost);
    });
    head.appendChild(addBtn);
    section.appendChild(head);

    const list = el('div', 'sheet-list');
    if (!sheet[key].length) {
      list.appendChild(el('p', 'sheet-empty', 'None yet. Add one.'));
    }
    sheet[key].forEach((row, index) => {
      const rowEl = el('div', 'sheet-row');
      const name = textInput(row.name, () => {});
      name.classList.add('sheet-input--name');
      bindText(name, (v) => { sheet[key][index].name = v.trim() || 'Untitled'; });
      const notes = textInput(row.notes, () => {}, 'Notes');
      notes.classList.add('sheet-input--notes');
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
      rowEl.appendChild(del);
      list.appendChild(rowEl);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  function render(host) {
    if (!host) return;
    renderHost = host;
    load();
    host.innerHTML = '';

    const root = el('div', 'character-sheet');
    const toolbar = el('div', 'character-sheet__toolbar');
    toolbar.appendChild(el('h2', 'character-sheet__heading', 'Character'));
    const hint = el('p', 'character-sheet__hint', 'Live sheet for Outcomes and Claude. Edit freely; changes save automatically.');
    const actions = el('div', 'character-sheet__actions');
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
    renderListSection(colRight, 'Spells', 'spells', { defaultName: 'Spell' });
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
    getWeapons,
    getWeaponsForAttackType,
    getSpells,
    getMagicOptions,
    matchDetail,
    detailBrief,
    render,
  };
})();
