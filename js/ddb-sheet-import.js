/**
 * Import a D&D Beyond character PDF (fillable form or printed text) or DDB JSON.
 * PDFs are layout-based so some spell/feature detail may be missing; JSON is richer.
 */
(function () {
  'use strict';

  const PDFJS_VERSION = '3.11.174';
  const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.min.js';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.worker.min.js';

  const SKILL_FIELDS = [
    ['Acrobatics', 'Acrobatics'],
    ['Animal', 'Animal Handling'],
    ['Animal Handling', 'Animal Handling'],
    ['Arcana', 'Arcana'],
    ['Athletics', 'Athletics'],
    ['Deception', 'Deception'],
    ['History', 'History'],
    ['Insight', 'Insight'],
    ['Intimidation', 'Intimidation'],
    ['Investigation', 'Investigation'],
    ['Medicine', 'Medicine'],
    ['Nature', 'Nature'],
    ['Perception', 'Perception'],
    ['Performance', 'Performance'],
    ['Persuasion', 'Persuasion'],
    ['Religion', 'Religion'],
    ['SleightofHand', 'Sleight of Hand'],
    ['Sleight of Hand', 'Sleight of Hand'],
    ['Stealth', 'Stealth'],
    ['Survival', 'Survival'],
  ];

  const WEAPON_HINT = /\b(dagger|shortbow|longbow|crossbow|rapier|shortsword|longsword|greatsword|greataxe|battleaxe|handaxe|javelin|spear|quarterstaff|mace|warhammer|maul|club|sling|dart|scimitar|trident|whip|pike|halberd|lance|morningstar|flail|net|unarmed|fist)\b/i;
  const ARMOR_HINT = /\b(padded|leather|studded|hide|chain shirt|scale mail|breastplate|half plate|ring mail|chain mail|splint|plate|shield)\b/i;
  const DDB_STAT = { 1: 'str', 2: 'dex', 3: 'con', 4: 'int', 5: 'wis', 6: 'cha' };
  const DDB_STAT_SUB = {
    1: 'strength-score',
    2: 'dexterity-score',
    3: 'constitution-score',
    4: 'intelligence-score',
    5: 'wisdom-score',
    6: 'charisma-score',
  };
  const DDB_ALIGN = {
    1: 'Lawful Good',
    2: 'Neutral Good',
    3: 'Chaotic Good',
    4: 'Lawful Neutral',
    5: 'Neutral',
    6: 'Chaotic Neutral',
    7: 'Lawful Evil',
    8: 'Neutral Evil',
    9: 'Chaotic Evil',
  };

  function uid(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }

  function item(name, extras) {
    return Object.assign({ id: uid('i'), name: String(name || 'Untitled').trim() || 'Untitled', notes: '' }, extras || {});
  }

  function clean(value) {
    return String(value == null ? '' : value)
      .replace(/[^\S\n]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function fieldValue(fields, names) {
    const list = Array.isArray(names) ? names : [names];
    for (let i = 0; i < list.length; i++) {
      const key = list[i];
      const hit = fields[key] || fields[key.toLowerCase()] || fields[normalizeKey(key)];
      if (hit == null || hit === '') continue;
      return clean(hit);
    }
    return '';
  }

  function normalizeKey(name) {
    return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function toInt(value, fallback) {
    const n = parseInt(String(value || '').replace(/[+,]/g, ''), 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function signedBonus(value) {
    const n = parseInt(String(value || '').replace(/[+,]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  }

  function setField(fields, name, value) {
    const text = clean(Array.isArray(value) ? value.join(', ') : value);
    if (!name || !text || text === '--') return;
    const trimmed = String(name).replace(/\s+/g, ' ').trim();
    fields[name] = text;
    fields[trimmed] = text;
    fields[normalizeKey(name)] = text;
  }

  function flattenFieldMap(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object') return out;
    Object.keys(raw).forEach((name) => {
      const entries = raw[name];
      let value = '';
      if (Array.isArray(entries)) {
        value = entries.map((e) => (e && e.value != null ? e.value : e)).filter((v) => v !== '' && v != null).join('\n');
      } else if (entries && typeof entries === 'object' && entries.value != null) {
        value = entries.value;
      } else {
        value = entries;
      }
      setField(out, name, value);
    });
    return out;
  }

  function collectAnnotation(fields, annot) {
    if (!annot || typeof annot !== 'object') return;
    const name = annot.fieldName || annot.title || annot.alternativeText || annot.id || '';
    const value = annot.fieldValue != null ? annot.fieldValue
      : (annot.buttonValue != null ? annot.buttonValue
        : (annot.contents != null ? annot.contents : ''));
    setField(fields, name, value);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src="' + src + '"]') && window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = () => resolve(window.pdfjsLib);
      el.onerror = () => reject(new Error('Could not load PDF reader (need a network connection the first time).'));
      document.head.appendChild(el);
    });
  }

  async function ensurePdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    const lib = await loadScript(PDFJS_SRC);
    if (!lib) throw new Error('PDF reader failed to load.');
    lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    return lib;
  }

  async function extractPdf(buffer) {
    const pdfjsLib = await ensurePdfJs();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fields = {};
    try {
      fields = flattenFieldMap(await pdf.getFieldObjects());
    } catch (e) {
      fields = {};
    }
    const textItems = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      (content.items || []).forEach((it) => {
        const str = clean(it.str);
        if (!str) return;
        const t = it.transform || [1, 0, 0, 1, 0, 0];
        textItems.push({ str: str, x: t[4] || 0, y: t[5] || 0, page: p });
      });
      try {
        const annots = await page.getAnnotations({ intent: 'any' });
        (annots || []).forEach((a) => collectAnnotation(fields, a));
      } catch (e) {
        try {
          const annots = await page.getAnnotations();
          (annots || []).forEach((a) => collectAnnotation(fields, a));
        } catch (err) {
          /* ignore */
        }
      }
    }
    return { fields: fields, textItems: textItems, pageCount: pdf.numPages };
  }

  function linesFromItems(items) {
    const rows = items.slice().sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      if (Math.abs(b.y - a.y) > 4) return b.y - a.y;
      return a.x - b.x;
    });
    const lines = [];
    rows.forEach((it) => {
      const last = lines[lines.length - 1];
      if (last && last.page === it.page && Math.abs(last.y - it.y) <= 4) {
        last.parts.push(it.str);
        last.text = last.parts.join(' ');
      } else {
        lines.push({ page: it.page, y: it.y, parts: [it.str], text: it.str });
      }
    });
    return lines.map((l) => clean(l.text)).filter(Boolean);
  }

  function valueAfterLabel(lines, labels) {
    const wanted = labels.map((l) => normalizeKey(l));
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const key = normalizeKey(line);
      for (let w = 0; w < wanted.length; w++) {
        if (key === wanted[w]) {
          const next = lines[i + 1];
          if (next && wanted.indexOf(normalizeKey(next)) === -1) return next;
        }
        if (key.indexOf(wanted[w]) === 0 && key.length > wanted[w].length) {
          return clean(line.replace(new RegExp('^' + labels[w] + '\\s*[:.]?\\s*', 'i'), ''));
        }
      }
    }
    return '';
  }

  function splitList(text) {
    return String(text || '')
      .split(/\n+|;\s+|\s{2,}/)
      .map((s) => clean(s.replace(/^[-•*]\s*/, '')))
      .filter((s) => s && s.length < 240 && !/^(features|traits|equipment|attacks|spellcasting|treasure)$/i.test(s));
  }

  function parseClassLevel(text) {
    const raw = clean(text);
    if (!raw) return { className: '', level: 0 };
    let level = 0;
    raw.replace(/\b(\d{1,2})\b/g, (_, n) => {
      level += Number(n);
      return _;
    });
    const className = raw.replace(/\b\d{1,2}(st|nd|rd|th)?\b/gi, '').replace(/\s+/g, ' ').trim();
    return { className: className, level: level || 0 };
  }

  function attackTypeForWeapon(name) {
    const n = String(name || '').toLowerCase();
    if (/\b(bow|crossbow|dart|javelin|spear|dagger|rapier|shortsword|arrow|bolt)\b/.test(n)) return 'pierce';
    if (/\b(mace|club|staff|quarterstaff|hammer|maul|flail|sling)\b/.test(n)) return 'blunt';
    return 'slash';
  }

  function emptySheet() {
    return {
      version: 2,
      identity: { name: '', aka: '', level: 1, className: '', race: '', alignment: '', background: '' },
      abilities: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      combat: { proficiency: 0, ac: 0, hpCurrent: 0, hpMax: 0, hitDice: '', speed: '' },
      skills: [],
      features: [],
      armor: [],
      weapons: [],
      gear: [],
      spells: [],
      languages: [],
      notes: '',
    };
  }

  function indexedField(fields, prefixes, index) {
    const names = [];
    prefixes.forEach((prefix) => {
      names.push(prefix + index);
      names.push(prefix + ' ' + index);
    });
    return fieldValue(fields, names);
  }

  function collectIndexed(fields, prefixes, max) {
    const out = [];
    const limit = max || 80;
    for (let i = 0; i < limit; i++) {
      const value = indexedField(fields, prefixes, i);
      if (value) out.push({ index: i, value: value });
    }
    return out;
  }

  function blobSection(blob, header) {
    const re = new RegExp('===\\s*' + header + '\\s*===\\s*([\\s\\S]*?)(?=====|$)', 'i');
    const match = String(blob || '').match(re);
    return match ? clean(match[1]) : '';
  }

  function parseFeatureStars(blob) {
    const out = [];
    const seen = {};
    const text = String(blob || '');
    const re = /\*\s+([^•*\n]+?)(?=\s+[•·]\s+|\s+\*|$)/g;
    let match;
    while ((match = re.exec(text))) {
      const name = clean(match[1]);
      const key = name.toLowerCase();
      if (!name || name.length > 80 || seen[key]) continue;
      if (/^===/.test(name)) continue;
      if (/^(languages|creature type|size|bard subclass|core bard traits|ability score improvements?|wayfarer ability score improvements?)$/i.test(name)) continue;
      seen[key] = true;
      out.push(name);
    }
    return out;
  }

  function skillProfLabel(flag) {
    const f = clean(flag).toUpperCase();
    if (f === 'E') return 'Expertise';
    if (f === 'P' || f === '•') return 'proficient';
    if (f === 'H') return 'Jack of All Trades';
    return '';
  }

  function sheetFromFieldsAndText(fields, lines, warnings) {
    const sheet = emptySheet();
    const after = (labels, fieldNames) => fieldValue(fields, fieldNames) || valueAfterLabel(lines, labels);

    sheet.identity.name = after(['CHARACTER NAME', 'Character Name'], ['CharacterName', 'CharacterName2', 'character-name']);
    const classLevel = parseClassLevel(after(
      ['CLASS & LEVEL', 'CLASS AND LEVEL', 'Class Level'],
      ['CLASS  LEVEL', 'ClassLevel', 'CLASS  LEVEL2', 'class-level']
    ));
    sheet.identity.className = classLevel.className;
    sheet.identity.level = classLevel.level || 1;
    sheet.identity.background = after(['BACKGROUND'], ['Background', 'BACKGROUND']);
    sheet.identity.race = after(['RACE', 'SPECIES'], ['Race', 'RACE', 'Species']);
    sheet.identity.alignment = after(['ALIGNMENT'], ['Alignment', 'ALIGNMENT']);
    if (sheet.identity.name) {
      sheet.identity.aka = sheet.identity.name.split(/\s+/)[0];
    }

    sheet.abilities.str = toInt(fieldValue(fields, ['STR', 'Strength']), 0);
    sheet.abilities.dex = toInt(fieldValue(fields, ['DEX', 'Dexterity']), 0);
    sheet.abilities.con = toInt(fieldValue(fields, ['CON', 'Constitution']), 0);
    sheet.abilities.int = toInt(fieldValue(fields, ['INT', 'Intelligence']), 0);
    sheet.abilities.wis = toInt(fieldValue(fields, ['WIS', 'Wisdom']), 0);
    sheet.abilities.cha = toInt(fieldValue(fields, ['CHA', 'Charisma']), 0);

    if (!sheet.abilities.str) {
      ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].forEach((ab) => {
        const line = lines.find((l) => new RegExp('^' + ab + '\\s+\\d{1,2}\\b', 'i').test(l));
        if (line) sheet.abilities[ab.toLowerCase()] = toInt(line.replace(/^[A-Z]+/i, ''), 0);
      });
    }

    sheet.combat.ac = toInt(after(['ARMOR CLASS', 'AC'], ['AC', 'ArmorClass']), 0);
    sheet.combat.speed = after(['SPEED'], ['Speed']);
    sheet.combat.proficiency = Math.abs(toInt(after(['PROFICIENCY BONUS'], ['ProfBonus', 'ProficiencyBonus']), 0));
    if (!sheet.combat.proficiency && sheet.identity.level) {
      sheet.combat.proficiency = Math.ceil(sheet.identity.level / 4) + 1;
    }
    sheet.combat.hpMax = toInt(after(['HIT POINT MAXIMUM', 'Max HP', 'HP Maximum'], ['MaxHP', 'HPMax', 'HPMaximum']), 0);
    sheet.combat.hpCurrent = toInt(after(['CURRENT HIT POINTS', 'Current HP'], ['CurrentHP', 'HPCurrent']), sheet.combat.hpMax);
    sheet.combat.hitDice = after(['HIT DICE'], ['Total', 'HDTotal', 'HD']) || (sheet.identity.level ? String(sheet.identity.level) : '');

    SKILL_FIELDS.forEach((pair) => {
      const bonus = fieldValue(fields, [pair[0]]);
      if (bonus === '') return;
      const flag = fieldValue(fields, [pair[1].replace(/\s+/g, '') + 'Prof', pair[0] + 'Prof', pair[1] + 'Prof']);
      const tag = skillProfLabel(flag);
      const num = (signedBonus(bonus) >= 0 ? '+' : '') + signedBonus(bonus);
      sheet.skills.push(item(pair[1], {
        notes: tag ? tag + ' ' + num : num,
        bonus: signedBonus(bonus),
      }));
    });
    for (let i = 1; i <= 6; i++) {
      const custom = fieldValue(fields, ['CustomSkill' + i, 'Custom Skill ' + i]);
      if (!custom) continue;
      const bonus = fieldValue(fields, ['Custom Skill Bonus ' + i, 'CustomSkillBonus' + i]);
      sheet.skills.push(item(custom, {
        notes: (bonus ? ((signedBonus(bonus) >= 0 ? '+' : '') + signedBonus(bonus)) : 'proficient'),
        bonus: signedBonus(bonus),
      }));
    }

    const seenWeapons = {};
    for (let n = 1; n <= 6; n++) {
      const name = fieldValue(fields, n === 1 ? ['Wpn Name', 'WpnName'] : ['Wpn Name ' + n, 'Wpn Name' + n, 'WpnName' + n]);
      if (!name || seenWeapons[name.toLowerCase()]) continue;
      seenWeapons[name.toLowerCase()] = true;
      const atk = fieldValue(fields, ['Wpn' + n + ' AtkBonus', 'Wpn' + n + 'AtkBonus']);
      const dmg = fieldValue(fields, ['Wpn' + n + ' Damage', 'Wpn' + n + 'Damage']);
      const extra = fieldValue(fields, ['Wpn Notes ' + n, 'WpnNotes' + n]);
      const notes = [atk ? atk + ' to hit' : '', dmg, extra].filter(Boolean).join('; ');
      sheet.weapons.push(item(name, {
        notes: notes,
        attackType: attackTypeForWeapon(name),
        bonus: signedBonus(atk),
      }));
    }

    const featureBlob = collectIndexed(fields, ['FeaturesTraits', 'Features and Traits'], 20)
      .map((row) => row.value)
      .concat([
        fieldValue(fields, ['Features and Traits', 'Feat+Traits', 'Additional Features and Traits']),
        fieldValue(fields, ['Actions2']),
      ])
      .filter(Boolean)
      .join('\n');
    parseFeatureStars(featureBlob).forEach((name) => {
      sheet.features.push(item(name));
    });
    if (!sheet.features.length) {
      splitList(featureBlob).slice(0, 20).forEach((name) => sheet.features.push(item(name)));
    }

    const attuned = {};
    collectIndexed(fields, ['Attuned Name', 'AttunedName'], 8).forEach((row) => {
      attuned[row.value.toLowerCase()] = true;
    });
    collectIndexed(fields, ['Eq Name', 'EqName'], 60).forEach((row) => {
      const name = row.value;
      const qty = indexedField(fields, ['Eq Qty', 'EqQty'], row.index);
      const notes = [
        qty && qty !== '1' ? 'x' + qty : '',
        attuned[name.toLowerCase()] ? 'attuned' : '',
      ].filter(Boolean).join('; ');
      if (ARMOR_HINT.test(name)) {
        if (!sheet.armor.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
          sheet.armor.push(item(name, { notes: notes }));
        }
      } else if (WEAPON_HINT.test(name) || seenWeapons[name.toLowerCase()]) {
        /* already on the attack list */
      } else if (!sheet.gear.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
        sheet.gear.push(item(name, { notes: notes }));
      }
    });

    const langBlob = fieldValue(fields, ['ProficienciesLang', 'Proficiencies and Languages']);
    const langs = blobSection(langBlob, 'LANGUAGES') || ((langBlob.match(/languages?:\s*([^\n=]+)/i) || [])[1] || '');
    if (langs) {
      sheet.languages = langs.split(/,|\/|;/).map(clean).filter(Boolean);
    }

    const seenSpells = {};
    for (let i = 0; i < 60; i++) {
      const name = indexedField(fields, ['spellName'], i);
      if (!name || seenSpells[name.toLowerCase()]) continue;
      seenSpells[name.toLowerCase()] = true;
      const bits = [
        indexedField(fields, ['spellSource'], i),
        indexedField(fields, ['spellSaveHit'], i),
        indexedField(fields, ['spellRange'], i),
        indexedField(fields, ['spellCastingTime'], i),
        indexedField(fields, ['spellNotes'], i),
      ].filter((part) => part && part !== '--');
      sheet.spells.push(item(name, { notes: bits.join('; ') }));
    }

    const extraNotes = [
      fieldValue(fields, ['Backstory', 'CharacterBackstory']),
      fieldValue(fields, ['AlliesOrganizations', 'Allies']),
      fieldValue(fields, ['PersonalityTraits']),
      fieldValue(fields, ['Ideals']),
      fieldValue(fields, ['Bonds']),
      fieldValue(fields, ['Flaws']),
    ].filter(Boolean);
    const gp = fieldValue(fields, ['GP']);
    if (gp && gp !== '0') extraNotes.push(gp + ' gp.');
    if (extraNotes.length) sheet.notes = extraNotes.join('\n');

    if (!sheet.identity.name) warnings.push('No character name found. This may not be a D&D Beyond / 5e fillable sheet.');
    if (!sheet.abilities.str && !sheet.combat.hpMax) {
      warnings.push('Could not read ability scores or HP. Use the D&D Beyond Export / Print PDF (not a screenshot).');
    }
    return sheet;
  }

  function flattenDdbModifiers(mods) {
    if (!mods) return [];
    if (Array.isArray(mods)) return mods;
    return Object.keys(mods).reduce((acc, key) => acc.concat(mods[key] || []), []);
  }

  function ddbScore(data, id) {
    const ov = (data.overrideStats || []).find((s) => s.id === id);
    if (ov && ov.value != null) return ov.value;
    const base = ((data.stats || []).find((s) => s.id === id) || {}).value || 0;
    const bonus = ((data.bonusStats || []).find((s) => s.id === id) || {}).value || 0;
    const extra = flattenDdbModifiers(data.modifiers).reduce((sum, m) => {
      if (!m || m.subType !== DDB_STAT_SUB[id]) return sum;
      if (m.type !== 'bonus' && m.type !== 'set') return sum;
      return sum + (Number(m.value) || 0);
    }, 0);
    return base + bonus + extra;
  }

  function stripHtml(html) {
    return clean(String(html || '').replace(/<[^>]+>/g, ' '));
  }

  function parseDdbJson(raw) {
    const data = raw.data && raw.data.id ? raw.data : raw;
    if (!data || typeof data !== 'object' || (!data.name && !data.classes && !data.stats)) {
      return null;
    }
    const sheet = emptySheet();
    const classes = Array.isArray(data.classes) ? data.classes : [];
    const level = classes.reduce((n, c) => n + (Number(c.level) || 0), 0) || Number(data.level) || 1;
    const className = classes.map((c) => {
      const name = (c.definition && c.definition.name) || c.name || 'Class';
      const sub = (c.subclassDefinition && c.subclassDefinition.name) || '';
      return sub ? name + ' (' + sub + ')' : name;
    }).join(' / ');

    sheet.identity.name = clean(data.name);
    sheet.identity.aka = sheet.identity.name.split(/\s+/)[0] || '';
    sheet.identity.level = level;
    sheet.identity.className = className;
    sheet.identity.race = clean((data.race && (data.race.fullName || data.race.baseName || data.race.baseRaceName)) || data.species || '');
    sheet.identity.alignment = DDB_ALIGN[data.alignmentId] || clean(data.alignment) || '';
    sheet.identity.background = clean(
      (data.background && ((data.background.definition && data.background.definition.name) || data.background.name)) || ''
    );

    Object.keys(DDB_STAT).forEach((id) => {
      sheet.abilities[DDB_STAT[id]] = ddbScore(data, Number(id));
    });

    const conMod = Math.floor((sheet.abilities.con - 10) / 2);
    const hpMax = data.overrideHitPoints != null
      ? Number(data.overrideHitPoints)
      : (Number(data.baseHitPoints) || 0) + (Number(data.bonusHitPoints) || 0) + Math.max(0, conMod) * level;
    sheet.combat.hpMax = hpMax;
    sheet.combat.hpCurrent = Math.max(0, hpMax - (Number(data.removedHitPoints) || 0));
    sheet.combat.proficiency = Math.ceil(level / 4) + 1;
    sheet.combat.ac = Number((data.armor && data.armor.ac) || data.armorClass) || 0;
    if (!sheet.combat.ac && data.inventory) {
      /* leave 0; user can fill. Some DDB payloads include decorators elsewhere. */
    }
    const walk = data.race && data.race.weightSpeeds && data.race.weightSpeeds.normal;
    if (walk) {
      const parts = [];
      if (walk.walk) parts.push(walk.walk + ' ft walk');
      if (walk.fly) parts.push(walk.fly + ' ft fly');
      if (walk.swim) parts.push(walk.swim + ' ft swim');
      sheet.combat.speed = parts.join(', ');
    }
    const hitDie = classes.map((c) => {
      const die = (c.definition && c.definition.hitDice) || 8;
      return (c.level || 1) + 'd' + die;
    }).join('+');
    sheet.combat.hitDice = hitDie;

    flattenDdbModifiers(data.modifiers).forEach((m) => {
      if (!m) return;
      if (m.type === 'language' && m.friendlySubtypeName) {
        const lang = clean(m.friendlySubtypeName.replace(/^language:\s*/i, ''));
        if (lang && sheet.languages.indexOf(lang) === -1) sheet.languages.push(lang);
      }
      if (m.type === 'proficiency' && /skill/i.test(m.subType || '') && m.friendlySubtypeName) {
        const name = clean(m.friendlySubtypeName.replace(/\s+skill$/i, ''));
        if (name && !sheet.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
          sheet.skills.push(item(name, { notes: 'proficient' }));
        }
      }
      if (m.type === 'expertise' && m.friendlySubtypeName) {
        const name = clean(m.friendlySubtypeName.replace(/\s+skill$/i, ''));
        const hit = sheet.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
        if (hit) hit.notes = 'Expertise';
        else if (name) sheet.skills.push(item(name, { notes: 'Expertise' }));
      }
    });

    (data.inventory || []).forEach((row) => {
      const def = row.definition || {};
      const name = clean(def.name);
      if (!name) return;
      const qty = Number(row.quantity) || 1;
      const notes = [qty > 1 ? 'x' + qty : '', row.equipped ? 'equipped' : '', row.isAttuned ? 'attuned' : '', stripHtml(def.description).slice(0, 180)]
        .filter(Boolean).join('; ');
      const filter = String(def.filterType || def.type || '').toLowerCase();
      if (filter === 'weapon' || def.damage) {
        sheet.weapons.push(item(name, { notes: notes, attackType: attackTypeForWeapon(name) }));
      } else if (filter === 'armor' || def.armorTypeId || ARMOR_HINT.test(name)) {
        sheet.armor.push(item(name, { notes: notes }));
      } else {
        sheet.gear.push(item(name, { notes: notes }));
      }
    });

    const addSpell = (sp) => {
      const def = (sp && sp.definition) || sp || {};
      const name = clean(def.name);
      if (!name || sheet.spells.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
      const level = def.level === 0 ? 'cantrip' : (def.level != null ? def.level + (def.level === 1 ? 'st' : def.level === 2 ? 'nd' : def.level === 3 ? 'rd' : 'th') : '');
      sheet.spells.push(item(name, { notes: level }));
    };
    (data.classSpells || []).forEach((block) => (block.spells || []).forEach(addSpell));
    const bucket = data.spells || {};
    ['race', 'class', 'item', 'feat'].forEach((key) => {
      const group = bucket[key];
      if (Array.isArray(group)) group.forEach(addSpell);
      else if (group && Array.isArray(group.spells)) group.spells.forEach(addSpell);
    });

    (classes || []).forEach((c) => {
      (c.classFeatures || []).forEach((f) => {
        const def = f.definition || f;
        const name = clean(def.name);
        if (name) sheet.features.push(item(name, { notes: stripHtml(def.description).slice(0, 200) }));
      });
    });
    ((data.race && data.race.racialTraits) || []).forEach((f) => {
      const def = f.definition || f;
      const name = clean(def.name);
      if (name) sheet.features.push(item(name, { notes: stripHtml(def.description).slice(0, 200), magicUse: /magic|spell|fairy/i.test(name + (def.description || '')) }));
    });
    (data.feats || []).forEach((f) => {
      const def = f.definition || f;
      const name = clean(def.name);
      if (name) sheet.features.push(item(name, { notes: stripHtml(def.description).slice(0, 200) }));
    });

    const notes = data.notes || {};
    const bits = [notes.backstory, notes.otherNotes, notes.allies].map(stripHtml).filter(Boolean);
    if (data.id) bits.unshift('D&D Beyond sheet (id ' + data.id + ').');
    sheet.notes = bits.join('\n');
    return sheet;
  }

  function isOurSheet(obj) {
    return obj && obj.identity && obj.abilities && (obj.combat || obj.skills);
  }

  function sheetLooksPopulated(sheet) {
    if (!sheet || typeof sheet !== 'object') return false;
    const scores = sheet.abilities || {};
    const hasScores = ['str', 'dex', 'con', 'int', 'wis', 'cha'].some((k) => Number(scores[k]) > 0);
    const hasHp = !!(sheet.combat && Number(sheet.combat.hpMax));
    const hasLists = ['skills', 'features', 'weapons', 'gear', 'spells', 'armor']
      .some((k) => Array.isArray(sheet[k]) && sheet[k].length > 0);
    return hasScores || hasHp || hasLists;
  }

  function guessRosterId(sheet) {
    const blob = ((sheet && sheet.identity && (sheet.identity.name + ' ' + sheet.identity.aka)) || '').toLowerCase();
    if (/blingus/.test(blob)) return 'blingus';
    if (/vadania|amakiir|van damme|vandan/.test(blob)) return 'vadania';
    if (/bruck|brawn|o['’]?neil|o['’]?neal/.test(blob)) return 'bruck';
    if (/puck|pinewhistle/.test(blob)) return 'puck';
    return '';
  }

  async function parseFile(file) {
    const name = (file && file.name) || 'sheet';
    const warnings = [];
    if (/\.json$/i.test(name) || (file && file.type === 'application/json')) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.character && isOurSheet(parsed.character)) {
        return { sheet: parsed.character, source: 'bardbook-export', warnings: warnings, fileName: name };
      }
      if (isOurSheet(parsed)) {
        return { sheet: parsed, source: 'bardbook-sheet', warnings: warnings, fileName: name };
      }
      const ddb = parseDdbJson(parsed);
      if (!ddb) throw new Error('JSON was not a D&D Beyond character or a Bardbook sheet.');
      return { sheet: ddb, source: 'ddb-json', warnings: warnings, fileName: name };
    }

    const buffer = await file.arrayBuffer();
    const extracted = await extractPdf(buffer);
    const lines = linesFromItems(extracted.textItems);
    const sheet = sheetFromFieldsAndText(extracted.fields, lines, warnings);
    if (!Object.keys(extracted.fields).length) {
      warnings.push('This PDF has no fillable fields. Read what printed text we could; spells and gear may be incomplete.');
    }
    if (!sheetLooksPopulated(sheet)) {
      throw new Error('This D&D Beyond PDF is a printout. The numbers live in the page image, so they cannot be read. On D&D Beyond open the character, export JSON, and import that file instead.');
    }
    return {
      sheet: sheet,
      source: Object.keys(extracted.fields).length ? 'ddb-pdf-fields' : 'ddb-pdf-text',
      warnings: warnings,
      fileName: name,
      pageCount: extracted.pageCount,
    };
  }

  window.DdbSheetImport = {
    parseFile: parseFile,
    parseDdbJson: parseDdbJson,
    guessRosterId: guessRosterId,
    isOurSheet: isOurSheet,
    sheetLooksPopulated: sheetLooksPopulated,
    sheetFromFields: function (fields) {
      return sheetFromFieldsAndText(fields || {}, [], []);
    },
  };
})();
