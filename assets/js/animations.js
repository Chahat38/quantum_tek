/**
 * Quantum Tech Solutionz — Interactive Animations Engine
 * Lightweight, GPU-accelerated micro-interactions & Hero Mouse Pointer System
 */

'use strict';

(function () {
  // Check if reduced motion is requested
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // ============================================================
  // 1. HERO INTERACTIVE CANVAS (Particle / Fluid Wave Reaction)
  // ============================================================
  const heroSection = document.querySelector('.hero-section, #hero');
  const heroCanvas = document.getElementById('heroCanvas');

  if (heroSection && heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrameId = null;

    // Mouse coordinates relative to canvas
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 130,
      active: false
    };

    function resizeCanvas() {
      width = heroCanvas.width = heroSection.offsetWidth;
      height = heroCanvas.height = heroSection.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Particle class
    const PARTICLE_COUNT = Math.min(65, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.35 ? 'rgba(48, 130, 210, ' : 'rgba(255, 255, 255, ';
        this.alpha = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce at boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * 3;
            const directionY = forceDirectionY * force * 3;

            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.shadowColor = '#3082D2';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function renderConnections() {
      const maxDist = 95;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.16;
            ctx.strokeStyle = `rgba(48, 130, 210, ${opacity})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw faint mouse halo on canvas if cursor is active
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        glowGrad.addColorStop(0, 'rgba(48, 130, 210, 0.12)');
        glowGrad.addColorStop(0.5, 'rgba(17, 42, 79, 0.08)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      renderConnections();
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }

  // ============================================================
  // 2. HERO CUSTOM ANIMATED MOUSE POINTER FOLLOWER
  // ============================================================
  if (heroSection && window.matchMedia('(hover: hover)').matches) {
    const dot = document.createElement('div');
    dot.className = 'hero-cursor-dot';
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.className = 'hero-cursor-ring';
    document.body.appendChild(ring);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isInsideHero = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const heroRect = heroSection.getBoundingClientRect();
      const inHero = (
        e.clientX >= heroRect.left &&
        e.clientX <= heroRect.right &&
        e.clientY >= heroRect.top &&
        e.clientY <= heroRect.bottom
      );

      if (inHero && !isInsideHero) {
        isInsideHero = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      } else if (!inHero && isInsideHero) {
        isInsideHero = false;
        dot.style.opacity = '0';
        ring.style.opacity = '0';
      }
    });

    // Lerp loop for silky smooth pointer follow
    function renderCursor() {
      if (isInsideHero) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;

        // Smooth damping for the trailing ring
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expand pointer ring on hovering buttons, links & interactive cards
    const interactiveTargets = heroSection.querySelectorAll('a, button, .btn-qt, .hero-floating-card, .hero-mouse-scroll, .hero-play-circle, .hero-social-link-item');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('active-hover');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('active-hover');
      });
    });
  }

  // ============================================================
  // 3. SMOOTH SCROLL ON HERO MOUSE SCROLL CLICK
  // ============================================================
  const mouseScrollBtn = document.querySelector('.hero-mouse-scroll');
  if (mouseScrollBtn) {
    mouseScrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(mouseScrollBtn.getAttribute('href') || '#partners');
      if (target) {
        const offset = 80;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  }

  // ============================================================
  // 4. 3D TILT EFFECT ON FEATURE CARDS
  // ============================================================
  const tiltCards = document.querySelectorAll('.service-card, .project-card, .feature-card, .stat-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const rotateX = deltaY * -5;
      const rotateY = deltaX * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ============================================================
  // 5. STAGGERED REVEAL FOR GRID ELEMENTS
  // ============================================================
  const grids = document.querySelectorAll('.row');
  grids.forEach(grid => {
    const items = grid.querySelectorAll('.col-lg-3, .col-lg-4, .col-lg-6');
    items.forEach((item, index) => {
      if (!item.hasAttribute('data-aos-delay')) {
        item.setAttribute('data-aos-delay', (index % 4) * 100);
      }
    });
  });
})();
