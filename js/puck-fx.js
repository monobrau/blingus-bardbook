/**
 * Wild Magic visual artifacts for Puck only.
 * Pointer-events none. Stops when another character is active.
 */
(function () {
  'use strict';

  const COLORS = ['#ff4dcc', '#7af5ff', '#ffe566', '#b388ff', '#7dffb3', '#ff8a5b', '#fff7d6'];
  const MAX_PARTICLES = 90;
  const TICK_MIN = 3500;
  const TICK_SPAN = 7000;

  let canvas = null;
  let ctx = null;
  let veil = null;
  let raf = 0;
  let timer = 0;
  let running = false;
  let last = 0;
  const particles = [];

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function isPuck() {
    const locked = window.BlingusSite?.lockedCharacterId?.();
    if (locked) return locked === 'puck';
    return (window.CharacterSheet?.getActiveId?.() || '') === 'puck';
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
    canvas.id = 'puckFxLayer';
    canvas.className = 'puck-fx-layer';
    canvas.setAttribute('aria-hidden', 'true');
    veil = document.createElement('div');
    veil.className = 'puck-fx-veil';
    veil.setAttribute('aria-hidden', 'true');
    document.body.appendChild(veil);
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
  }

  function addParticle(spec) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push(spec);
  }

  function glitterBurst(x, y, count, speed) {
    const n = count || 18;
    const v = speed || 2.4;
    for (let i = 0; i < n; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const mag = rand(0.4, v);
      addParticle({
        kind: Math.random() < 0.35 ? 'diamond' : 'mote',
        x, y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag - rand(0.2, 1.1),
        life: rand(420, 980),
        age: 0,
        size: rand(1.4, 3.6),
        spin: rand(-0.2, 0.2),
        rot: rand(0, Math.PI),
        color: pick(COLORS),
        gravity: 0.012,
      });
    }
  }

  function fallingGlitter() {
    const n = 16 + Math.floor(Math.random() * 12);
    for (let i = 0; i < n; i += 1) {
      addParticle({
        kind: 'diamond',
        x: rand(0, window.innerWidth),
        y: rand(-40, 20),
        vx: rand(-0.25, 0.35),
        vy: rand(0.6, 1.6),
        life: rand(900, 1800),
        age: 0,
        size: rand(1.6, 3.2),
        spin: rand(-0.08, 0.08),
        rot: rand(0, Math.PI),
        color: pick(COLORS),
        gravity: 0.004,
      });
    }
  }

  function fireflies() {
    const n = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i += 1) {
      addParticle({
        kind: 'glow',
        x: rand(40, window.innerWidth - 40),
        y: rand(80, window.innerHeight - 80),
        vx: rand(-0.35, 0.35),
        vy: rand(-0.28, 0.28),
        life: rand(1600, 2800),
        age: 0,
        size: rand(3.2, 5.5),
        spin: 0,
        rot: 0,
        color: pick(['#ffe566', '#ff4dcc', '#7af5ff', '#b388ff']),
        gravity: 0,
        wander: true,
      });
    }
  }

  function chaosSparks() {
    const x = rand(40, window.innerWidth - 40);
    const y = rand(60, window.innerHeight * 0.55);
    for (let i = 0; i < 10; i += 1) {
      addParticle({
        kind: 'spark',
        x, y,
        vx: rand(-3.2, 3.2),
        vy: rand(-2.8, 1.2),
        life: rand(280, 620),
        age: 0,
        size: rand(1.2, 2.2),
        spin: 0,
        rot: 0,
        color: pick(['#fff7d6', '#7af5ff', '#ffe566']),
        gravity: 0.02,
      });
    }
  }

  function weaveFlash(x, y) {
    if (!veil) return;
    const px = ((x || window.innerWidth * 0.5) / window.innerWidth) * 100;
    const py = ((y || window.innerHeight * 0.28) / window.innerHeight) * 100;
    veil.style.setProperty('--puck-x', px.toFixed(1) + '%');
    veil.style.setProperty('--puck-y', py.toFixed(1) + '%');
    document.body.classList.add('puck-fx--weave');
    window.setTimeout(() => document.body.classList.remove('puck-fx--weave'), 720);
  }

  function sneeze() {
    const x = rand(window.innerWidth * 0.2, window.innerWidth * 0.8);
    const y = rand(70, 180);
    glitterBurst(x, y, 26, 3.1);
    weaveFlash(x, y);
  }

  function playRandom() {
    const roll = Math.random();
    if (roll < 0.28) fallingGlitter();
    else if (roll < 0.5) fireflies();
    else if (roll < 0.7) chaosSparks();
    else if (roll < 0.88) sneeze();
    else {
      glitterBurst(rand(40, window.innerWidth - 40), rand(80, window.innerHeight - 80), 20, 2.2);
      if (Math.random() < 0.45) weaveFlash();
    }
  }

  function drawParticle(p, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot || 0);
    if (p.kind === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.7, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size * 0.7, 0);
      ctx.closePath();
      ctx.fill();
    } else if (p.kind === 'glow') {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2.4);
      g.addColorStop(0, p.color);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'spark') {
      ctx.fillRect(-p.size * 2.2, -0.6, p.size * 4.4, 1.2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
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
      if (p.wander) {
        p.vx += rand(-0.04, 0.04);
        p.vy += rand(-0.04, 0.04);
      }
      p.vy += p.gravity || 0;
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.rot += p.spin || 0;
      const t = p.age / p.life;
      const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
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
    document.body.classList.add('puck-book');
    last = 0;
    fallingGlitter();
    fireflies();
    raf = window.requestAnimationFrame(tick);
    schedule();
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(raf);
    window.clearTimeout(timer);
    particles.length = 0;
    document.body.classList.remove('puck-book', 'puck-fx--weave');
    if (window.BlingusSite?.applyTheme) window.BlingusSite.applyTheme();
    if (ctx && canvas) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function fxAllowed() {
    if (reducedMotion()) return false;
    if (window.BlingusSite?.fxEnabled && !window.BlingusSite.fxEnabled()) return false;
    return true;
  }

  function sync() {
    if (isPuck() && fxAllowed()) start();
    else stop();
  }

  function onPointer(ev) {
    if (!running || ev.button) return;
    if (Math.random() > 0.22) return;
    glitterBurst(ev.clientX, ev.clientY, 10, 1.8);
  }

  document.addEventListener('blingus-character-change', sync);
  document.addEventListener('blingus-fx-toggle', sync);
  document.addEventListener('click', onPointer, true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }

  window.PuckFx = { sync, burst: glitterBurst, playRandom };
})();
