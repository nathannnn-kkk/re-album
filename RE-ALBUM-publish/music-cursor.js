(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.createElement('div');
  root.className = 'music-cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<span class="music-cursor__head"><span class="music-cursor__glyph">🎵</span></span><span class="music-cursor__trail"></span>';
  document.body.append(root);
  document.body.classList.add('has-music-cursor');

  const head = root.querySelector('.music-cursor__head');
  const trail = root.querySelector('.music-cursor__trail');
  const notes = [];
  const point = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
  const spacing = 34;
  const maxNotes = 8;
  const lifespan = 620;
  let lastStamp = null;
  let raf = 0;
  let lastFrame = 0;
  let clock = 0;

  const addNote = (x, y, now) => {
    if (notes.length >= maxNotes) {
      notes.shift().element.remove();
    }
    const element = document.createElement('span');
    element.className = 'music-cursor__note';
    element.textContent = notes.length % 3 === 1 ? '♪' : '♫';
    trail.append(element);
    notes.push({ element, x, y, born: now, seed: Math.random() * Math.PI * 2 });
  };

  const frame = now => {
    raf = 0;
    const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0);
    lastFrame = now;
    clock += dt;
    if (point.active) {
      const smoothing = reducedMotion ? 1 : 1 - Math.exp(-dt / 0.045);
      point.x += (point.targetX - point.x) * smoothing;
      point.y += (point.targetY - point.y) * smoothing;
      head.style.transform = `translate3d(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px, 0) translate(-3px, -4px)`;
    }

    let live = false;
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      const age = (now - note.born) / lifespan;
      if (age >= 1) {
        note.element.remove();
        notes.splice(i, 1);
        continue;
      }
      const rank = (i + 1) / Math.max(1, notes.length);
      const sway = reducedMotion ? 0 : Math.sin(clock * 2.1 + note.seed) * 2.5;
      const scale = 0.82 - rank * 0.36;
      note.element.style.transform = `translate3d(${(note.x + sway).toFixed(2)}px, ${(note.y - age * 9).toFixed(2)}px, 0) translate(-50%, -50%) rotate(${(Math.sin(note.seed) * 9).toFixed(1)}deg) scale(${scale.toFixed(2)})`;
      note.element.style.opacity = String((1 - age) * (0.58 - rank * 0.24));
      live = true;
    }
    if (live || (point.active && (Math.abs(point.targetX - point.x) > 0.1 || Math.abs(point.targetY - point.y) > 0.1))) {
      raf = requestAnimationFrame(frame);
    }
  };

  const wake = () => {
    if (raf) return;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  };

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const now = performance.now();
    point.targetX = event.clientX;
    point.targetY = event.clientY;
    if (!point.active) {
      point.x = event.clientX;
      point.y = event.clientY;
      point.active = true;
      head.classList.add('is-visible');
    }

    if (!reducedMotion) {
      if (!lastStamp) {
        addNote(event.clientX, event.clientY, now);
        lastStamp = { x: event.clientX, y: event.clientY };
      } else {
        let dx = event.clientX - lastStamp.x;
        let dy = event.clientY - lastStamp.y;
        let distance = Math.hypot(dx, dy);
        while (distance >= spacing) {
          lastStamp = { x: lastStamp.x + (dx / distance) * spacing, y: lastStamp.y + (dy / distance) * spacing };
          addNote(lastStamp.x, lastStamp.y, now);
          dx = event.clientX - lastStamp.x;
          dy = event.clientY - lastStamp.y;
          distance = Math.hypot(dx, dy);
        }
      }
    }
    const interactive = event.target instanceof Element && event.target.closest('a,button,[role="button"],input,select,textarea,label');
    head.classList.toggle('is-interactive', Boolean(interactive));
    wake();
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    point.active = false;
    lastStamp = null;
    head.classList.remove('is-visible', 'is-interactive');
  });
})();
