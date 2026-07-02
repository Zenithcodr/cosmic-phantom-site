/* =============================================
   COSMIC PHANTOM — SITE JAVASCRIPT
   =============================================
   Handles: Hero slideshow, ember particles,
   scroll reveals, sticky CTA, Discord copy,
   hero click-through, entrance animations.
   ============================================= */

(function () {
  'use strict';

  // ---- CONFIG ----
  const SLIDE_INTERVAL = 10000;    // 10 seconds per slide
  const EMBER_COUNT = 45;          // number of ember particles
  const REVEAL_THRESHOLD = 0.15;   // IntersectionObserver threshold

  // ---- DOM REFS ----
  const heroSection = document.getElementById('hero');
  const heroCTA = document.getElementById('hero-cta-btn');
  const slides = document.querySelectorAll('.hero-slide');
  const slideTitles = document.querySelectorAll('.slide-title');
  const dots = document.querySelectorAll('.dot');
  const stickyCTA = document.getElementById('sticky-cta');
  const discordCard = document.getElementById('discord-copy');
  const toast = document.getElementById('toast');
  const heroArrowPrev = document.getElementById('hero-prev');
  const heroArrowNext = document.getElementById('hero-next');
  const canvas = document.getElementById('ember-canvas');
  const ctx = canvas.getContext('2d');

  let currentSlide = 0;
  let slideTimer = null;


  /* =============================================
     1. HERO SLIDESHOW
     ============================================= */
  function goToSlide(index) {
    // Deactivate current
    slides[currentSlide].classList.remove('active');
    slideTitles[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // Activate new
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    slideTitles[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }

  function startSlideshow() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, SLIDE_INTERVAL);
  }

  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev);
  }

  // Dot click handlers
  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(i);
      startSlideshow();
    });
  });

  // Arrow click handlers
  heroArrowPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
    startSlideshow();
  });

  heroArrowNext.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
    startSlideshow();
  });

  startSlideshow();


  /* =============================================
     2. HERO CLICK → PATREON
     ============================================= */
  heroSection.addEventListener('click', (e) => {
    // Don't double-fire if clicking the CTA button, dots, or scroll indicator
    const target = e.target;
    if (
      target.closest('.cta-button') ||
      target.closest('.slide-dots') ||
      target.closest('.scroll-indicator') ||
      target.closest('.hero-arrow')
    ) {
      return;
    }
    window.open('https://patreon.com/Cosmicphantom19', '_blank', 'noopener');
  });


  /* =============================================
     3. ENTRANCE ANIMATIONS (Hero content)
     ============================================= */
  function triggerHeroEntrance() {
    const animItems = document.querySelectorAll('.animate-in');
    animItems.forEach((el) => {
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => {
        el.classList.add('visible');
      }, 300 + delay * 180);
    });
  }

  // Trigger after fonts & images start loading
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(triggerHeroEntrance, 100);
  });


  /* =============================================
     4. SCROLL REVEAL (IntersectionObserver)
     ============================================= */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: REVEAL_THRESHOLD, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });


  /* =============================================
     5. STICKY CTA (Show after scrolling past hero)
     ============================================= */
  const stickyObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        stickyCTA.classList.add('visible');
      } else {
        stickyCTA.classList.remove('visible');
      }
    },
    { threshold: 0.1 }
  );

  stickyObserver.observe(heroSection);


  /* =============================================
     6. DISCORD COPY TO CLIPBOARD
     ============================================= */
  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  discordCard.addEventListener('click', () => {
    const discordId = 'zenith__04';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(discordId).then(showToast).catch(() => {
        fallbackCopy(discordId);
      });
    } else {
      fallbackCopy(discordId);
    }
  });

  discordCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      discordCard.click();
    }
  });

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast();
    } catch (err) {
      console.warn('Copy failed', err);
    }
    document.body.removeChild(textarea);
  }


  /* =============================================
     7. EMBER PARTICLE SYSTEM (Canvas)
     ============================================= */
  let embers = [];
  let animFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Ember {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial
        ? Math.random() * canvas.height
        : canvas.height + Math.random() * 60;
      this.size = Math.random() * 2.5 + 0.5;

      // Movement
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = -(Math.random() * 1.2 + 0.3);
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
      this.wobbleAmp = Math.random() * 0.8 + 0.3;
      this.wobbleOffset = Math.random() * Math.PI * 2;

      // Appearance
      this.opacity = Math.random() * 0.5 + 0.15;
      this.maxOpacity = this.opacity;
      this.fadeRate = Math.random() * 0.002 + 0.0008;

      // Color: warm hues (orange/amber/gold)
      const hue = Math.random() * 35 + 15; // 15-50
      const sat = Math.random() * 30 + 70;  // 70-100%
      const light = Math.random() * 25 + 50; // 50-75%
      this.color = `hsl(${hue}, ${sat}%, ${light}%)`;

      this.life = 0;
    }

    update() {
      this.life++;
      this.x += this.speedX + Math.sin(this.life * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp;
      this.y += this.speedY;
      this.opacity -= this.fadeRate;

      if (this.opacity <= 0 || this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initEmbers() {
    embers = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push(new Ember());
    }
  }

  function animateEmbers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ember of embers) {
      ember.update();
      ember.draw();
    }

    animFrameId = requestAnimationFrame(animateEmbers);
  }

  // Visibility API: pause when tab not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    } else {
      if (!animFrameId) {
        animateEmbers();
      }
    }
  });

  // Resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 150);
  });

  // Init particles
  resizeCanvas();
  initEmbers();
  animateEmbers();


  /* =============================================
     8. PERFORMANCE: Reduce particles on mobile
     ============================================= */
  if (window.innerWidth < 768) {
    // Halve the ember count on mobile
    embers.splice(Math.floor(EMBER_COUNT / 2));
  }

})();
