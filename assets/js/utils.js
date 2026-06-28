// Shared starfield background — twinkling stars that react to the cursor
function initParticles(canvasId, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const palette = colors || ['#6C63FF', '#1DB88A', '#EF9F27', '#D85A30', '#D4537E', '#ffffff'];
  let particles = [];
  const mouse = { x: -9999, y: -9999, active: false };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; mouse.active = true; }
  }, { passive: true });

  const count = window.innerWidth < 600 ? 90 : 160;
  for (let i = 0; i < count; i++) {
    particles.push({
      baseX: Math.random() * canvas.width,
      baseY: Math.random() * canvas.height,
      x: 0, y: 0,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      color: palette[Math.floor(Math.random() * palette.length)],
      baseAlpha: Math.random() * 0.6 + 0.15,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2
    });
    particles[i].x = particles[i].baseX;
    particles[i].y = particles[i].baseY;
  }

  const REPEL_RADIUS = 140;

  function tick(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.baseX += p.vx;
      p.baseY += p.vy;
      if (p.baseX < 0) p.baseX = canvas.width;
      if (p.baseX > canvas.width) p.baseX = 0;
      if (p.baseY < 0) p.baseY = canvas.height;
      if (p.baseY > canvas.height) p.baseY = 0;

      let tx = p.baseX, ty = p.baseY;

      if (mouse.active) {
        const dx = p.baseX - mouse.x;
        const dy = p.baseY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS) {
          const force = (1 - dist / REPEL_RADIUS) * 28;
          const angle = Math.atan2(dy, dx);
          tx += Math.cos(angle) * force;
          ty += Math.sin(angle) * force;
        }
      }

      // smooth follow toward target position
      p.x += (tx - p.x) * 0.12;
      p.y += (ty - p.y) * 0.12;

      const twinkle = (Math.sin(t * p.twinkleSpeed + p.twinklePhase) + 1) / 2;
      const alpha = p.baseAlpha * (0.4 + twinkle * 0.6);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Progress storage
const Progress = {
  key(chapterId) { return `progress:${chapterId}`; },
  get(chapterId) {
    try { return JSON.parse(localStorage.getItem(this.key(chapterId))) || {}; }
    catch (e) { return {}; }
  },
  save(chapterId, data) {
    const current = this.get(chapterId);
    localStorage.setItem(this.key(chapterId), JSON.stringify({ ...current, ...data }));
  }
};

// Vertical scroll-snap scene navigator with keyboard + swipe support
function createSceneNavigator({ container, onChange }) {
  const scenes = Array.from(container.querySelectorAll('.scene'));
  let index = 0;

  function go(i) {
    if (i < 0 || i >= scenes.length) return;
    index = i;
    scenes[index].scrollIntoView({ behavior: 'smooth' });
    if (onChange) onChange(index, scenes.length);
  }

  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); go(index - 1); }
  });

  let touchStartY = null;
  container.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
  container.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) go(dy > 0 ? index + 1 : index - 1);
    touchStartY = null;
  }, { passive: true });

  let scrollTimeout;
  container.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const top = container.scrollTop;
      let closest = 0, min = Infinity;
      scenes.forEach((s, i) => {
        const d = Math.abs(s.offsetTop - top);
        if (d < min) { min = d; closest = i; }
      });
      if (closest !== index) {
        index = closest;
        if (onChange) onChange(index, scenes.length);
      }
    }, 100);
  });

  return { go, next: () => go(index + 1), prev: () => go(index - 1), get index() { return index; }, total: scenes.length };
}

// Tiny beep via Web Audio API (no audio files needed)
function playBeep(freq = 440, duration = 0.12, type = 'sine') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* audio not available */ }
}
