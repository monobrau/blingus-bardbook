/**
 * Ranger trail artifacts for Vadania only.
 * Arrows, falling leaves, and woodland critters that peek or dash across.
 * Pointer-events none. Stops when another character is active.
 */
(function () {
  'use strict';

  const LEAF = ['#6b7a32', '#8a6a2f', '#c27a2a', '#556b2f', '#a38b3a'];
  const FUR = {
    fox: '#c36a2a',
    squirrel: '#8a5a2a',
    rabbit: '#c9b89a',
    owl: '#7a6240',
    raccoon: '#6a655c',
    hedgehog: '#5a4a38',
  };
  const SPECIES = Object.keys(FUR);
  const MAX_PARTICLES = 70;
  const TICK_MIN = 4200;
  const TICK_SPAN = 8500;

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

  function isVadania() {
    const locked = window.BlingusSite?.lockedCharacterId?.();
    if (locked) return locked === 'vadania';
    return (window.CharacterSheet?.getActiveId?.() || '') === 'vadania';
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
    canvas.id = 'vadaniaFxLayer';
    canvas.className = 'party-fx-layer vadania-fx-layer';
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

  function fallingLeaves(count) {
    const n = count || (8 + Math.floor(Math.random() * 8));
    for (let i = 0; i < n; i += 1) {
      addParticle({
        kind: 'leaf',
        x: rand(0, window.innerWidth),
        y: rand(-50, 10),
        vx: rand(-0.35, 0.45),
        vy: rand(0.35, 1.05),
        life: rand(1400, 2600),
        age: 0,
        size: rand(4.5, 8.5),
        spin: rand(-0.08, 0.08),
        rot: rand(0, Math.PI),
        color: pick(LEAF),
        gravity: 0.003,
        wander: true,
      });
    }
  }

  function flyArrow(fromX, fromY) {
    const left = fromX == null ? Math.random() < 0.5 : fromX < window.innerWidth * 0.5;
    const y = fromY != null ? fromY : rand(70, window.innerHeight * 0.62);
    const x = left ? -40 : window.innerWidth + 40;
    const speed = rand(7.5, 11.5);
    const vx = left ? speed : -speed;
    const vy = rand(-0.35, 0.55);
    addParticle({
      kind: 'arrow',
      x, y, vx, vy,
      life: rand(900, 1400),
      age: 0,
      size: rand(22, 30),
      rot: Math.atan2(vy, vx),
      spin: 0,
      color: '#3a2a16',
      gravity: 0.006,
    });
  }

  function runCritter() {
    const left = Math.random() < 0.5;
    const species = pick(SPECIES);
    const y = rand(window.innerHeight * 0.68, window.innerHeight - 36);
    addParticle({
      kind: 'run',
      species,
      x: left ? -30 : window.innerWidth + 30,
      y,
      vx: left ? rand(2.1, 3.4) : -rand(2.1, 3.4),
      vy: 0,
      life: rand(2200, 3400),
      age: 0,
      size: species === 'hedgehog' || species === 'squirrel' ? rand(11, 14) : rand(13, 17),
      rot: 0,
      spin: 0,
      color: FUR[species],
      gravity: 0,
    });
  }

  function peekCritter(nearX) {
    const side = nearX != null
      ? (nearX < window.innerWidth * 0.5 ? 'left' : 'right')
      : (Math.random() < 0.5 ? 'left' : 'right');
    const species = pick(SPECIES);
    const size = species === 'owl' ? rand(26, 34) : rand(20, 28);
    const y = rand(110, window.innerHeight * 0.72);
    addParticle({
      kind: 'peek',
      species,
      side,
      x: side === 'left' ? -size * 2 : window.innerWidth + size * 2,
      y,
      vx: 0,
      vy: 0,
      life: rand(3400, 5600),
      age: 0,
      size,
      rot: 0,
      spin: 0,
      color: FUR[species],
      gravity: 0,
      blinkAt: rand(0.42, 0.7),
    });
  }

  function playRandom() {
    const roll = Math.random();
    if (roll < 0.34) peekCritter();
    else if (roll < 0.56) runCritter();
    else if (roll < 0.78) flyArrow();
    else fallingLeaves();
  }

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function peekProgress(p) {
    const t = p.age / p.life;
    if (t < 0.2) return ease(t / 0.2);
    if (t < 0.78) return 1;
    return 1 - ease((t - 0.78) / 0.22);
  }

  function drawLeaf(p) {
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.7, -p.size * 0.15, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.7, -p.size * 0.15, 0, -p.size);
    ctx.fill();
    ctx.strokeStyle = 'rgba(42, 29, 15, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.7);
    ctx.lineTo(0, p.size * 0.55);
    ctx.stroke();
  }

  function drawArrow(p) {
    const len = p.size;
    ctx.strokeStyle = p.color;
    ctx.fillStyle = '#6b4a24';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(len * 0.35, 0);
    ctx.stroke();
    ctx.fillStyle = '#8a8f7a';
    ctx.beginPath();
    ctx.moveTo(len * 0.35, 0);
    ctx.lineTo(len * 0.12, -3.4);
    ctx.lineTo(len * 0.55, 0);
    ctx.lineTo(len * 0.12, 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9b07a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(-len * 0.32, -3.6);
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(-len * 0.32, 3.6);
    ctx.stroke();
  }

  function drawEyes(s, look, blink, owl) {
    const eyes = [
      { x: s * 0.16, y: -s * 0.06, r: owl ? s * 0.22 : s * 0.155 },
      { x: -s * 0.2, y: -s * 0.05, r: owl ? s * 0.19 : s * 0.13 },
    ];
    eyes.forEach((e) => {
      ctx.fillStyle = '#f6f0de';
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.r, e.r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(42, 29, 15, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      if (blink > 0.5) {
        ctx.strokeStyle = '#2a1d0f';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(e.x - e.r * 0.85, e.y);
        ctx.lineTo(e.x + e.r * 0.85, e.y);
        ctx.stroke();
        return;
      }
      const pr = e.r * 0.42;
      ctx.fillStyle = '#1b140c';
      ctx.beginPath();
      ctx.arc(e.x + look * e.r * 0.48, e.y + e.r * 0.08, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(e.x + look * e.r * 0.28, e.y - pr * 0.25, pr * 0.24, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawFaceExtras(species, s, color) {
    ctx.fillStyle = color;
    if (species === 'fox' || species === 'squirrel') {
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.55);
      ctx.lineTo(-s * 0.02, -s * 0.9);
      ctx.lineTo(s * 0.16, -s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.28, -s * 0.42);
      ctx.lineTo(s * 0.48, -s * 0.82);
      ctx.lineTo(s * 0.55, -s * 0.32);
      ctx.closePath();
      ctx.fill();
    } else if (species === 'rabbit') {
      ctx.beginPath();
      ctx.ellipse(-s * 0.08, -s * 0.95, s * 0.12, s * 0.42, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(s * 0.22, -s * 0.92, s * 0.11, s * 0.4, 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (species === 'owl') {
      ctx.beginPath();
      ctx.moveTo(-s * 0.28, -s * 0.55);
      ctx.lineTo(-s * 0.42, -s * 0.95);
      ctx.lineTo(-s * 0.02, -s * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.5);
      ctx.lineTo(s * 0.42, -s * 0.95);
      ctx.lineTo(s * 0.48, -s * 0.42);
      ctx.closePath();
      ctx.fill();
    } else if (species === 'hedgehog') {
      for (let i = 0; i < 6; i += 1) {
        const a = -Math.PI * 0.9 + i * 0.32;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.35, Math.sin(a) * s * 0.35 - s * 0.1);
        ctx.lineTo(Math.cos(a) * s * 0.85, Math.sin(a) * s * 0.85 - s * 0.15);
        ctx.lineTo(Math.cos(a + 0.16) * s * 0.35, Math.sin(a + 0.16) * s * 0.35 - s * 0.1);
        ctx.fill();
      }
    }
    if (species === 'raccoon') {
      ctx.fillStyle = 'rgba(20, 16, 12, 0.55)';
      ctx.beginPath();
      ctx.ellipse(s * 0.08, -s * 0.02, s * 0.42, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (species === 'fox') {
      ctx.fillStyle = '#f3e6c8';
      ctx.beginPath();
      ctx.moveTo(s * 0.55, s * 0.12);
      ctx.lineTo(s * 0.95, s * 0.22);
      ctx.lineTo(s * 0.48, s * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    if (species === 'owl') {
      ctx.fillStyle = '#d4a24a';
      ctx.beginPath();
      ctx.moveTo(s * 0.42, s * 0.08);
      ctx.lineTo(s * 0.72, s * 0.18);
      ctx.lineTo(s * 0.4, s * 0.26);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawPeek(p, alpha, look, blink) {
    const facing = p.side === 'left' ? 1 : -1;
    const shown = peekProgress(p);
    const inset = p.size * 0.55;
    const from = p.side === 'left' ? -p.size * 2.2 : window.innerWidth + p.size * 2.2;
    const to = p.side === 'left' ? inset : window.innerWidth - inset;
    const x = from + (to - from) * shown;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, p.y);
    ctx.scale(facing, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, p.size * 0.12, p.size * 0.78, p.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-p.size * 0.05, 0, p.size * 0.62, p.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(p.size * 0.1, p.size * 0.22, p.size * 0.45, p.size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    drawFaceExtras(p.species, p.size, p.color);
    drawEyes(p.size, look, blink, p.species === 'owl');
    ctx.restore();
  }

  function drawRun(p, alpha) {
    const facing = p.vx >= 0 ? 1 : -1;
    const bob = Math.sin(p.age * 0.02) * 2.4;
    const gait = Math.sin(p.age * 0.028);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y + bob);
    ctx.scale(facing, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.95, p.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.size * 0.7, -p.size * 0.15, p.size * 0.38, 0, Math.PI * 2);
    ctx.fill();
    if (p.species === 'squirrel' || p.species === 'fox') {
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.7, 0);
      ctx.quadraticCurveTo(-p.size * 1.6, -p.size * 0.9, -p.size * 0.4, -p.size * 0.35);
      ctx.fill();
    }
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-p.size * 0.25, p.size * 0.35);
    ctx.lineTo(-p.size * 0.15 + gait * 4, p.size * 0.85);
    ctx.moveTo(p.size * 0.25, p.size * 0.35);
    ctx.lineTo(p.size * 0.2 - gait * 4, p.size * 0.85);
    ctx.stroke();
    ctx.fillStyle = '#f6f0de';
    ctx.beginPath();
    ctx.arc(p.size * 0.82, -p.size * 0.18, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b140c';
    ctx.beginPath();
    ctx.arc(p.size * 0.9, -p.size * 0.16, 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticle(p, alpha) {
    if (p.kind === 'peek') {
      const t = p.age / p.life;
      const look = t < 0.28 ? 0.15 : Math.min(1, (t - 0.28) / 0.22);
      const blink = Math.abs(t - p.blinkAt) < 0.018 ? 1 : 0;
      drawPeek(p, alpha, look, blink);
      return;
    }
    if (p.kind === 'run') {
      drawRun(p, alpha);
      return;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot || 0);
    if (p.kind === 'leaf') drawLeaf(p);
    else if (p.kind === 'arrow') drawArrow(p);
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
      if (p.kind === 'peek') {
        const t = p.age / p.life;
        const alpha = t < 0.08 ? t / 0.08 : t > 0.9 ? (1 - t) / 0.1 : 1;
        drawParticle(p, Math.max(0, alpha));
        continue;
      }
      if (p.wander) {
        p.vx += rand(-0.03, 0.03);
      }
      p.vy += p.gravity || 0;
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.rot += p.spin || 0;
      if (p.kind === 'arrow') p.rot = Math.atan2(p.vy, p.vx);
      const t = p.age / p.life;
      const alpha = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
      drawParticle(p, Math.max(0, alpha));
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
    document.body.classList.add('vadania-book');
    last = 0;
    fallingLeaves(10);
    peekCritter();
    raf = window.requestAnimationFrame(tick);
    schedule();
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(raf);
    window.clearTimeout(timer);
    particles.length = 0;
    document.body.classList.remove('vadania-book');
    if (window.BlingusSite?.applyTheme) window.BlingusSite.applyTheme();
    if (ctx && canvas) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function fxAllowed() {
    if (reducedMotion()) return false;
    if (window.BlingusSite?.fxEnabled && !window.BlingusSite.fxEnabled()) return false;
    return true;
  }

  function sync() {
    if (isVadania() && fxAllowed()) start();
    else stop();
  }

  function onPointer(ev) {
    if (!running || ev.button) return;
    if (Math.random() > 0.28) return;
    if (Math.random() < 0.55) peekCritter(ev.clientX);
    else flyArrow(ev.clientX, ev.clientY);
  }

  document.addEventListener('blingus-character-change', sync);
  document.addEventListener('blingus-fx-toggle', sync);
  document.addEventListener('click', onPointer, true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  window.VadaniaFx = { sync, playRandom, peek: peekCritter };
})();
