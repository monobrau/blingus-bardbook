/**
 * Monk strike artifacts for Brawn / Bruck only.
 * Fists, dwarven runes, impact rings, dust, and amber ki motes.
 * Pointer-events none. Stops when another character is active.
 */
(function () {
  'use strict';

  const FIST = '#3a2a1c';
  const SKIN = '#c48a5a';
  const SPARK = ['#e8c36a', '#ffd27a', '#fff4d6', '#c9a227'];
  const DUST = ['#8a6a42', '#5b371f', '#c9b07a', '#4a3a2a'];
  const RUNE_GOLD = ['#e8c36a', '#c9a227', '#fff1c2', '#d4a24a'];
  const RUNE_STROKES = [
    [[0, -1], [0, 1], [0, -0.2], [0.7, 0.35]],
    [[0, -1], [0, 1], [-0.65, -0.35], [0.65, -0.35]],
    [[-0.55, -1], [0.55, -1], [0.55, -1], [0, 1]],
    [[0, -1], [0, 1], [0, -1], [0.7, -0.1], [0, 0.05], [0.7, 0.7]],
    [[-0.15, -1], [0.6, 0], [-0.15, 1], [0.6, 0]],
    [[0, -1], [0, 1], [-0.6, 0.85], [0.6, 0.85]],
    [[-0.55, -1], [0, 0], [0.55, -1], [0, 0], [0, 0], [0, 1]],
    [[-0.5, -0.9], [0.5, 0.9], [0.5, -0.9], [-0.5, 0.9]],
  ];
  const MAX_PARTICLES = 80;
  const TICK_MIN = 3800;
  const TICK_SPAN = 7800;

  let canvas = null;
  let ctx = null;
  let raf = 0;
  let timer = 0;
  let running = false;
  let last = 0;
  const particles = [];

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function isBrawn() {
    const locked = window.BlingusSite?.lockedCharacterId?.();
    if (locked) return locked === 'bruck';
    return (window.CharacterSheet?.getActiveId?.() || '') === 'bruck';
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function sizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ensureLayer() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'brawnFxLayer';
    canvas.className = 'party-fx-layer brawn-fx-layer';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
  }

  function addParticle(spec) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push(spec);
  }

  function kiWisps() {
    const n = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i += 1) {
      addParticle({
        kind: 'ki',
        x: rand(50, window.innerWidth - 50),
        y: rand(window.innerHeight * 0.35, window.innerHeight - 70),
        vx: rand(-0.2, 0.2),
        vy: rand(-0.85, -0.25),
        life: rand(1400, 2400),
        age: 0,
        size: rand(3.4, 6.2),
        spin: 0,
        rot: 0,
        color: pick(['#e8c36a', '#ffb347', '#fff1c2']),
        gravity: -0.004,
        wander: true,
      });
    }
  }

  function impact(x, y, heavy) {
    const rings = heavy ? 3 : 2;
    for (let i = 0; i < rings; i += 1) {
      addParticle({
        kind: 'ring',
        x, y,
        vx: 0,
        vy: 0,
        life: rand(280, 520) + i * 80,
        age: 0,
        size: 14 + i * 8,
        grow: heavy ? 3.6 : 2.8,
        spin: 0,
        rot: 0,
        color: i === 0 ? '#fff4d6' : '#c45c26',
        gravity: 0,
      });
    }
    const sparks = heavy ? 16 : 10;
    for (let i = 0; i < sparks; i += 1) {
      const a = rand(0, Math.PI * 2);
      const mag = rand(1.4, heavy ? 5.2 : 3.4);
      addParticle({
        kind: 'spark',
        x, y,
        vx: Math.cos(a) * mag,
        vy: Math.sin(a) * mag - rand(0.2, 1.4),
        life: rand(240, 620),
        age: 0,
        size: rand(1.2, 2.4),
        spin: 0,
        rot: a,
        color: pick(SPARK),
        gravity: 0.03,
      });
    }
    const dust = heavy ? 10 : 6;
    for (let i = 0; i < dust; i += 1) {
      addParticle({
        kind: 'dust',
        x: x + rand(-8, 8),
        y: y + rand(-4, 8),
        vx: rand(-1.6, 1.6),
        vy: rand(-1.8, 0.4),
        life: rand(380, 820),
        age: 0,
        size: rand(2.2, 4.6),
        spin: rand(-0.1, 0.1),
        rot: rand(0, Math.PI),
        color: pick(DUST),
        gravity: 0.018,
      });
    }
    spawnRunes(x, y, heavy ? 5 : 3);
    addParticle({
      kind: 'star',
      x, y,
      vx: 0,
      vy: 0,
      life: heavy ? 420 : 320,
      age: 0,
      size: heavy ? 28 : 20,
      spin: 0.18,
      rot: rand(0, Math.PI),
      color: '#fff4d6',
      gravity: 0,
    });
  }

  function punchAt(x, y, fromLeft) {
    const left = fromLeft != null ? fromLeft : x < window.innerWidth * 0.5;
    const startX = left ? -110 : window.innerWidth + 110;
    const startY = y + rand(-36, 36);
    addParticle({
      kind: 'fist',
      x: startX,
      y: startY,
      tx: x,
      ty: y,
      vx: (x - startX) / 18,
      vy: (y - startY) / 18,
      life: 1200,
      age: 0,
      size: rand(58, 78),
      spin: left ? 0.04 : -0.04,
      rot: left ? -0.28 : 0.28,
      color: SKIN,
      gravity: 0,
      hit: false,
      facing: left ? 1 : -1,
      heavy: Math.random() < 0.4,
    });
  }

  function randomPunch() {
    const x = rand(window.innerWidth * 0.18, window.innerWidth * 0.82);
    const y = rand(90, window.innerHeight * 0.7);
    punchAt(x, y);
    if (Math.random() < 0.4) {
      window.setTimeout(() => {
        if (running) punchAt(x + rand(-50, 50), y + rand(-36, 36), x < window.innerWidth * 0.5);
      }, 160);
    }
  }

  function spawnRunes(x, y, count) {
    const n = count || 3;
    for (let i = 0; i < n; i += 1) {
      addParticle({
        kind: 'rune',
        glyph: Math.floor(Math.random() * RUNE_STROKES.length),
        x: x + rand(-28, 28),
        y: y + rand(-24, 24),
        vx: rand(-0.45, 0.45),
        vy: rand(-1.4, -0.25),
        life: rand(700, 1400),
        age: 0,
        size: rand(16, 26),
        spin: rand(-0.03, 0.03),
        rot: rand(-0.2, 0.2),
        color: pick(RUNE_GOLD),
        gravity: -0.006,
      });
    }
  }

  function driftingRunes() {
    const n = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i += 1) {
      addParticle({
        kind: 'rune',
        glyph: Math.floor(Math.random() * RUNE_STROKES.length),
        x: rand(40, window.innerWidth - 40),
        y: window.innerHeight + rand(10, 50),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.7, -0.28),
        life: rand(1800, 3200),
        age: 0,
        size: rand(18, 32),
        spin: rand(-0.015, 0.015),
        rot: rand(-0.15, 0.15),
        color: pick(RUNE_GOLD),
        gravity: -0.002,
      });
    }
  }

  function playRandom() {
    const roll = Math.random();
    if (roll < 0.42) randomPunch();
    else if (roll < 0.68) driftingRunes();
    else if (roll < 0.86) {
      impact(rand(80, window.innerWidth - 80), rand(90, window.innerHeight * 0.65), false);
      kiWisps();
    } else kiWisps();
  }

  function drawRune(p) {
    const strokes = RUNE_STROKES[p.glyph] || RUNE_STROKES[0];
    const s = p.size;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = Math.max(2.2, s * 0.12);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let i = 0; i < strokes.length; i += 2) {
      const a = strokes[i];
      const b = strokes[i + 1];
      if (!a || !b) break;
      ctx.moveTo(a[0] * s, a[1] * s);
      ctx.lineTo(b[0] * s, b[1] * s);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawFist(p) {
    const s = p.size;
    const line = Math.max(2.4, s * 0.045);
    ctx.scale(p.facing || 1, 1);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = FIST;
    ctx.lineWidth = line;

    ctx.fillStyle = '#4a3424';
    roundRect(-s * 1.2, -s * 0.3, s * 0.95, s * 0.6, s * 0.12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e8c36a';
    roundRect(-s * 0.42, -s * 0.32, s * 0.24, s * 0.64, s * 0.08);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = p.color || SKIN;
    roundRect(-s * 0.28, -s * 0.58, s * 1.12, s * 1.16, s * 0.2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 4; i += 1) {
      const y = -s * 0.4 + i * (s * 0.25);
      ctx.fillStyle = '#d4a06a';
      ctx.beginPath();
      ctx.ellipse(s * 0.78, y, s * 0.24, s * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 244, 214, 0.35)';
      ctx.beginPath();
      ctx.ellipse(s * 0.72, y - s * 0.03, s * 0.09, s * 0.045, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = p.color || SKIN;
    ctx.beginPath();
    ctx.ellipse(-s * 0.02, s * 0.48, s * 0.3, s * 0.2, -0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawStar(size) {
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? size * 0.38 : size;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawParticle(p, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot || 0);
    if (p.kind === 'fist') {
      drawFist(p);
    } else if (p.kind === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === 'star') {
      ctx.fillStyle = p.color;
      drawStar(p.size);
    } else if (p.kind === 'spark') {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size * 2.4, -0.7, p.size * 4.8, 1.4);
    } else if (p.kind === 'dust') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'rune') {
      drawRune(p);
    } else if (p.kind === 'ki') {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.3);
      g.addColorStop(0, p.color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function tick(ts) {
    if (!running) return;
    const dt = last ? Math.min(32, ts - last) : 16;
    last = ts;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      if (p.kind === 'fist' && !p.hit) {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        if (dx * dx + dy * dy < p.size * p.size * 0.35) {
          p.hit = true;
          impact(p.tx, p.ty, p.heavy);
          p.vx *= 0.08;
          p.vy *= 0.08;
          p.life = p.age + 420;
        }
      }
      if (p.kind === 'ring') p.size += (p.grow || 2) * (dt / 16);
      if (p.wander) {
        p.vx += rand(-0.03, 0.03);
        p.vy += rand(-0.02, 0.02);
      }
      p.vy += p.gravity || 0;
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.rot += p.spin || 0;
      const t = p.age / p.life;
      const fade = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
      drawParticle(p, Math.max(0, fade));
    }
    raf = window.requestAnimationFrame(tick);
  }

  function schedule() {
    window.clearTimeout(timer);
    if (!running) return;
    timer = window.setTimeout(() => {
      if (!running) return;
      playRandom();
      schedule();
    }, TICK_MIN + Math.random() * TICK_SPAN);
  }

  function start() {
    if (running || !fxAllowed()) return;
    ensureLayer();
    running = true;
    document.body.classList.add('brawn-book');
    last = 0;
    kiWisps();
    driftingRunes();
    randomPunch();
    raf = window.requestAnimationFrame(tick);
    schedule();
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(raf);
    window.clearTimeout(timer);
    particles.length = 0;
    document.body.classList.remove('brawn-book');
    if (window.BlingusSite?.applyTheme) window.BlingusSite.applyTheme();
    if (ctx && canvas) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function fxAllowed() {
    if (reducedMotion()) return false;
    if (window.BlingusSite?.fxEnabled && !window.BlingusSite.fxEnabled()) return false;
    return true;
  }

  function sync() {
    if (isBrawn() && fxAllowed()) start();
    else stop();
  }

  function onPointer(ev) {
    if (!running || ev.button) return;
    if (Math.random() > 0.26) return;
    punchAt(ev.clientX, ev.clientY);
  }

  document.addEventListener('blingus-character-change', sync);
  document.addEventListener('blingus-fx-toggle', sync);
  document.addEventListener('click', onPointer, true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  window.BrawnFx = { sync, playRandom, punch: punchAt };
})();
