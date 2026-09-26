/**
 * Quantum Tech Solutionz — Main JavaScript
 * Navbar, IntersectionObserver, Counter, Mobile Menu, Misc
 */

'use strict';

// ============================================================
// NAVBAR SCROLL BEHAVIOR
// ============================================================
(function () {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ============================================================
// MOBILE HAMBURGER TOGGLE
// ============================================================
(function () {
  const nav = document.getElementById('mainNav');
  const toggler = document.getElementById('navToggler');
  const collapse = document.getElementById('navbarMain');
  if (!toggler || !collapse) return;

  toggler.addEventListener('click', () => {
    const expanded = toggler.getAttribute('aria-expanded') === 'true';
    toggler.setAttribute('aria-expanded', String(!expanded));
    toggler.classList.toggle('active');
    collapse.classList.toggle('show');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target)) {
      collapse.classList.remove('show');
      toggler.classList.remove('active');
      toggler.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ============================================================
// HERO SECTION — ADMIN-CONFIGURED LOOPING BACKGROUND
// Fetches /api/hero-settings.php and applies the configured
// background image / overlay / animation via CSS custom props.
// ============================================================

// Server-rendered frames use root-relative urls while the API returns
// absolute ones; compare them on the path so a matching list is a no-op.
function normalizeBg(url) {
  return String(url || '').replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '');
}

(async function () {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  // The slides themselves are rendered server-side from hero_bg_images, so
  // this only has to keep the live settings in sync for an operator who
  // changes them without the page being re-rendered from PHP.
  try {
    const res = await fetch('api/hero-settings.php');
    if (!res.ok) return;
    const payload = await res.json();
    if (!payload.success) return;
    const d = payload.data || {};
    if (!d.has_custom_bg) return;

    const slides = hero.querySelectorAll('.hero-loop-item');
    const urls = Array.isArray(d.hero_bg_image_urls) ? d.hero_bg_image_urls : [];

    // Compare the rendered frames against the configured list, so swapping a
    // photo while keeping the same frame count also repaints.
    const current = [];
    for (let i = 0; i < slides.length; i++) {
      const m = /url\(['"]?([^'")]+)['"]?\)/.exec(slides[i].style.backgroundImage || '');
      if (m) current.push(m[1]);
    }
    // The server renders the list twice for a seamless wrap.
    const firstPass = current.slice(0, current.length / 2);
    const changed = urls.length && (
      firstPass.length !== urls.length ||
      firstPass.some((u, i) => normalizeBg(u) !== normalizeBg(urls[i]))
    );

    if (changed) {
      const track = hero.querySelector('.hero-loop-track');
      if (track) {
        track.innerHTML = '';
        // Rendered twice so the -50% keyframe wraps without a seam.
        for (let pass = 0; pass < 2; pass++) {
          urls.forEach(function (u) {
            const item = document.createElement('div');
            item.className = 'hero-loop-item';
            item.style.backgroundImage = "url('" + u + "')";
            track.appendChild(item);
          });
        }
      }
    }

    hero.classList.add('hero-media-active');
    hero.style.setProperty('--hero-overlay-opacity', String(Math.max(0.5, d.overlay_opacity / 100)));
    hero.style.setProperty('--hero-anim-duration', d.animation_duration + 's');
    hero.dataset.heroStyle = d.hero_bg_style === 'tile' ? 'tile' : 'cover';
    if (d.animation_enabled !== '1') {
      hero.classList.add('hero-media-static');
    }
  } catch (e) {
    // Server-rendered slides stay on screen; nothing to do.
  }
})();

// ============================================================
// INTERSECTION OBSERVER — SCROLL REVEAL
// ============================================================
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
})();

// ============================================================
// ANIMATED COUNTERS
// ============================================================
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = prefersReduced ? 0 : 2000;
    const start = Date.now();

    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.round(target * ease);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString();
    };

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
})();

// ============================================================
// BACK TO TOP
// ============================================================
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============================================================
// COOKIE NOTICE
// ============================================================
(function () {
  const notice = document.getElementById('cookieNotice');
  if (!notice) return;

  if (!localStorage.getItem('qt_cookie_accepted')) {
    setTimeout(() => notice.classList.add('show'), 1500);
  }

  document.getElementById('acceptCookie')?.addEventListener('click', () => {
    localStorage.setItem('qt_cookie_accepted', '1');
    notice.classList.remove('show');
  });

  document.getElementById('declineCookie')?.addEventListener('click', () => {
    localStorage.setItem('qt_cookie_accepted', '0');
    notice.classList.remove('show');
  });
})();

// ============================================================
// PROJECT / PORTFOLIO FILTER
// ============================================================
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  const items = document.querySelectorAll('[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach(item => {
        const match = filter === '*' || item.dataset.category === filter;
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = match ? '1' : '0.2';
        item.style.transform = match ? 'scale(1)' : 'scale(0.96)';
        item.style.pointerEvents = match ? '' : 'none';
      });
    });
  });
})();

// ============================================================
// TESTIMONIALS SWIPER
// ============================================================
(function () {
  const el = document.querySelector('.testimonials-swiper');
  if (!el) return;

  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    breakpoints: {
      768: { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  });
})();

// ============================================================
// PARTNERS MARQUEE DUPLICATION (for seamless loop)
// ============================================================
(function () {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
})();

// ============================================================
// CONTACT FORM AJAX
// ============================================================
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const feedback = document.getElementById('formFeedback');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
      });
      const data = await response.json();

      if (feedback) {
        feedback.className = 'alert ' + (data.success ? 'alert-success' : 'alert-danger');
        feedback.textContent = data.message;
        feedback.style.display = 'block';
        if (data.success) form.reset();
      }
    } catch (err) {
      if (feedback) {
        feedback.className = 'alert alert-danger';
        feedback.textContent = 'Something went wrong. Please try again.';
        feedback.style.display = 'block';
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
})();

// ============================================================
// NEWSLETTER FORM AJAX
// ============================================================
(function () {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      const data = await response.json();
      btn.innerHTML = data.success ? '<i class="bi bi-check"></i>' : '<i class="bi bi-x"></i>';
      btn.style.background = data.success ? '#3fb950' : '#f85149';
      setTimeout(() => { btn.innerHTML = '<i class="bi bi-send"></i>'; btn.style.background = ''; }, 3000);
      if (data.success) form.reset();
    } catch (e) {
      btn.innerHTML = '<i class="bi bi-x"></i>';
    }
  });
})();

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
