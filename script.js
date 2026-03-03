/* ═══════════════════════════════════════════════════════════════
   SCRIPT.JS — Portfolio interactions & animations
   Written in vanilla JS · Zero dependencies
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     DOM REFERENCES
  ───────────────────────────────────────────── */
  const DOM = {
    cursorDot: document.getElementById('cursorDot'),
    cursorRing: document.getElementById('cursorRing'),
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.getElementById('navLinks'),
    yearEl: document.getElementById('currentYear'),
    langBtnPT: document.getElementById('langBtnPT'),
    langBtnEN: document.getElementById('langBtnEN'),
    heroPhotoContainer: document.getElementById('heroPhotoContainer'),
    heroPhoto: document.getElementById('heroPhoto'),
    heroPhotoPlaceholder: document.getElementById('heroPhotoPlaceholder'),
    photoUpload: document.getElementById('photoUpload'),
  };


  /* ─────────────────────────────────────────────
     1. CUSTOM CURSOR
     Smooth follow with lerp (linear interpolation)
  ───────────────────────────────────────────── */
  const cursor = { x: 0, y: 0, ringX: 0, ringY: 0 };
  const LERP_FACTOR = 0.15; // lower = more "float"

  /** Track mouse position */
  function onMouseMove(e) {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
  }

  /** Update ring position with smooth lerp */
  function animateCursor() {
    cursor.ringX += (cursor.x - cursor.ringX) * LERP_FACTOR;
    cursor.ringY += (cursor.y - cursor.ringY) * LERP_FACTOR;

    DOM.cursorDot.style.left = cursor.x + 'px';
    DOM.cursorDot.style.top = cursor.y + 'px';
    DOM.cursorRing.style.left = cursor.ringX + 'px';
    DOM.cursorRing.style.top = cursor.ringY + 'px';

    requestAnimationFrame(animateCursor);
  }

  /** Expand ring when hovering interactive elements */
  function initCursorHoverEffects() {
    const targets = document.querySelectorAll(
      'a, button, .btn, .project-card, .contact-card, .badge'
    );

    targets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        DOM.cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', function () {
        DOM.cursorRing.classList.remove('hover');
      });
    });
  }

  // Only init cursor on non-touch devices
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', onMouseMove);
    requestAnimationFrame(animateCursor);
    initCursorHoverEffects();
  }


  /* ─────────────────────────────────────────────
     2. NAVBAR — Scroll effects
  ───────────────────────────────────────────── */
  let lastScroll = 0;

  function handleNavScroll() {
    const currentScroll = window.scrollY;

    // Add glass background after scrolling past 60px
    if (currentScroll > 60) {
      DOM.navbar.classList.add('scrolled');
    } else {
      DOM.navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }


  /* ─────────────────────────────────────────────
     3. MOBILE NAVIGATION
  ───────────────────────────────────────────── */
  function toggleMobileNav() {
    DOM.navToggle.classList.toggle('active');
    DOM.navLinks.classList.toggle('open');
    document.body.style.overflow = DOM.navLinks.classList.contains('open')
      ? 'hidden' : '';
  }

  /** Close mobile nav when clicking a link */
  function closeMobileNavOnClick() {
    DOM.navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (DOM.navLinks.classList.contains('open')) {
          toggleMobileNav();
        }
      });
    });
  }


  /* ─────────────────────────────────────────────
     4. REVEAL ON SCROLL — IntersectionObserver
  ───────────────────────────────────────────── */
  function initReveal() {
    const elements = document.querySelectorAll('.reveal');

    // Fallback: if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }


  /* ─────────────────────────────────────────────
     5. SMOOTH SCROLL for nav links
     (enhances default scroll-behavior: smooth)
  ───────────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = DOM.navbar.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }


  /* ─────────────────────────────────────────────
     6. ACTIVE NAV LINK HIGHLIGHT
  ───────────────────────────────────────────── */
  function initActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -40% 0px',
      }
    );

    sections.forEach(function (sec) { observer.observe(sec); });
  }


  /* ─────────────────────────────────────────────
     7. PARTICLES — Subtle floating dots
     Lightweight canvas for space/tech feel
  ───────────────────────────────────────────── */
  function initParticles() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 40;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
      };
    }

    function initAll() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108, 99, 255, ' + p.opacity + ')';
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    initAll();
    draw();

    window.addEventListener('resize', function () {
      resize();
    });
  }


  /* ─────────────────────────────────────────────
     8. YEAR — Auto-update footer year
  ───────────────────────────────────────────── */
  function setYear() {
    if (DOM.yearEl) {
      DOM.yearEl.textContent = new Date().getFullYear();
    }
  }


  /* ─────────────────────────────────────────────
     9. TITLE TYPING ANIMATION
     Subtle character-by-character reveal
  ───────────────────────────────────────────── */
  function initTitleAnimation() {
    const titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;

    // Wait for hero reveal, then add a subtle glow pulse
    setTimeout(function () {
      const highlightEl = titleEl.querySelector('.highlight');
      if (highlightEl) {
        highlightEl.style.animation = 'nameGlow 3s ease-in-out infinite alternate';
      }
    }, 1200);
  }


  /* ─────────────────────────────────────────────
     10. LANGUAGE SWITCHER
  ───────────────────────────────────────────── */
  var currentLang = 'pt';

  function setLanguage(lang) {
    currentLang = lang;

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Toggle active class on buttons
    DOM.langBtnPT.classList.toggle('active', lang === 'pt');
    DOM.langBtnEN.classList.toggle('active', lang === 'en');

    // Swap page title
    var titleEl = document.getElementById('pageTitle');
    if (titleEl && titleEl.dataset[lang]) {
      document.title = titleEl.dataset[lang];
    }

    // Swap meta description
    var metaEl = document.getElementById('metaDescription');
    if (metaEl && metaEl.dataset[lang]) {
      metaEl.setAttribute('content', metaEl.dataset[lang]);
    }

    // Translate all elements with data-pt / data-en
    // innerHTML: elements whose translation contains HTML markup
    var translatableHTML = document.querySelectorAll(
      '.title-line[data-pt][data-en], ' +
      '.about-lead[data-pt][data-en], ' +
      'p[data-pt][data-en]'
    );
    translatableHTML.forEach(function (el) {
      var val = el.dataset[lang];
      if (val !== undefined) { el.innerHTML = val; }
    });

    // textContent: elements whose translation is plain text (no HTML tags inside)
    var translatableText = document.querySelectorAll(
      'a[data-pt][data-en], ' +
      'h2[data-pt][data-en], ' +
      'h3[data-pt][data-en], ' +
      '.hero-tag > span[data-pt][data-en], ' +
      '.stat-label[data-pt][data-en], ' +
      '.placeholder-text[data-pt][data-en], ' +
      '.placeholder-hint[data-pt][data-en], ' +
      '.photo-overlay > span[data-pt][data-en], ' +
      '.btn span[data-pt][data-en]'
    );
    translatableText.forEach(function (el) {
      var val = el.dataset[lang];
      if (val !== undefined) { el.textContent = val; }
    });

    // Save preference
    try { localStorage.setItem('portfolio_lang', lang); } catch (e) { }
  }

  function initLanguageSwitcher() {
    if (!DOM.langBtnPT || !DOM.langBtnEN) return;

    // Restore saved preference
    var savedLang = 'pt';
    try { savedLang = localStorage.getItem('portfolio_lang') || 'pt'; } catch (e) { }

    // Set initial state
    setLanguage(savedLang);

    DOM.langBtnPT.addEventListener('click', function () { setLanguage('pt'); });
    DOM.langBtnEN.addEventListener('click', function () { setLanguage('en'); });
  }


  /* ─────────────────────────────────────────────
     11. PROFILE PHOTO UPLOAD
  ───────────────────────────────────────────── */
  function initPhotoUpload() {
    var container = DOM.heroPhotoContainer;
    var photo = DOM.heroPhoto;
    var placeholder = DOM.heroPhotoPlaceholder;
    var input = DOM.photoUpload;

    if (!container || !photo || !input) return;

    // Click photo container to trigger file input
    container.addEventListener('click', function () {
      input.click();
    });

    // Handle file selection
    input.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      var reader = new FileReader();
      reader.onload = function (evt) {
        photo.src = evt.target.result;
        photo.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';

        // Save to localStorage (base64)
        try { localStorage.setItem('portfolio_photo', evt.target.result); } catch (e) { }
      };
      reader.readAsDataURL(file);
    });

    // Restore saved photo
    try {
      var saved = localStorage.getItem('portfolio_photo');
      if (saved) {
        photo.src = saved;
        photo.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      }
    } catch (e) { }
  }

  // Inject the keyframes for name glow
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes nameGlow {
      0%   { filter: drop-shadow(0 0 6px rgba(108, 99, 255, 0.3)); }
      100% { filter: drop-shadow(0 0 16px rgba(108, 99, 255, 0.6)); }
    }
  `;
  document.head.appendChild(styleSheet);


  /* ─────────────────────────────────────────────
     INIT — Wire everything up
  ───────────────────────────────────────────── */
  function init() {
    setYear();
    initReveal();
    initSmoothScroll();
    initActiveNav();
    initParticles();
    initTitleAnimation();
    initLanguageSwitcher();
    initPhotoUpload();
    closeMobileNavOnClick();

    // Event listeners
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    DOM.navToggle.addEventListener('click', toggleMobileNav);

    // Initial scroll check
    handleNavScroll();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
