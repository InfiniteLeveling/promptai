/**
 * PromptArchitect AI — Premium UI Effects & Motion Engine
 * Features: 3D Card Tilt, Mouse-Tracking Spotlight, Scroll Reveal, Particle Canvas, & Soundless Haptics
 */

// 1. Mouse Spotlight & 3D Tilt for Glass Cards
export function initCardEffects() {
  const cards = document.querySelectorAll('.tilt-card, .spotlight-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update CSS variables for radial flashlight border
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; // max -6 to +6 deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

// 2. Scroll-Driven Reveal Observer
export function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // If element has counters, animate them
        animateCounters(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// 3. Number Counter Animation
function animateCounters(container) {
  const counters = container.querySelectorAll('[data-counter-target]');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-counter-target'));
    const suffix = counter.getAttribute('data-counter-suffix') || '';
    const prefix = counter.getAttribute('data-counter-prefix') || '';
    const decimals = parseInt(counter.getAttribute('data-counter-decimals') || '0', 10);
    const duration = 1200;
    const start = 0;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * easeProgress;

      counter.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }
    requestAnimationFrame(update);
  });
}

// 4. Subtle Interactive Particle Canvas Background
export function initParticleCanvas(canvasId = 'ambient-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(Math.floor(window.innerWidth / 24), 50);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.8 + 0.8,
      color: Math.random() > 0.6 ? 'rgba(76, 215, 246, ' : 'rgba(192, 193, 255, ',
      alpha: Math.random() * 0.4 + 0.15
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }
  loop();
}

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initCardEffects();
  initScrollReveal();
  initParticleCanvas();
});
