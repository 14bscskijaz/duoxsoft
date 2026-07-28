(function () {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    gsap.set('.reveal-section, .reveal-stagger > *, .hero-eyebrow, .hero h1, .hero-actions, .stat-card', { opacity: 1, y: 0, scale: 1 });
    document.querySelectorAll('.testi-track').forEach(t => t.style.animation = 'none');
    return;
  }

  /* ── HERO — entrance timeline, plays on load ── */
  const heroTl = gsap.timeline({ delay: 0.15 });
  heroTl
    .from('.hero-eyebrow', { opacity: 0, y: 34, duration: 0.7, ease: 'power3.out' })
    .from('.hero h1', { opacity: 0, y: 65, scale: 0.97, duration: 1, ease: 'power4.out' }, '-=0.45')
    .from('.hero-actions', { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out' }, '-=0.55')
    .from('.stat-card', { opacity: 0, y: 60, scale: 0.9, rotate: 2, duration: 0.9, ease: 'power4.out' }, '-=0.6')
    .from('.stat-block', { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, '-=0.45');

  /* ── SECTION REVEAL — one-off elements (titles, paragraphs, header blocks) ── */
  gsap.utils.toArray('.reveal-section').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  /* ── STAGGERED CHILDREN — grids/lists (process cards etc.) ── */
  gsap.utils.toArray('.reveal-stagger').forEach(group => {
    gsap.from(group.children, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: group, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  /* ── SERVICES — expanding image panel gallery (hover on desktop, tap on mobile) ── */
  (function servicesPanels() {
    const panels = document.querySelectorAll('.svc-panel');
    if (!panels.length) return;

    const isDesktop = () => window.matchMedia('(min-width: 960px)').matches;
    const EASE = 'power3.inOut';
    const DUR = 0.7;

    function setActive(panel) {
      panels.forEach(p => p.classList.toggle('is-active', p === panel));

      panels.forEach(p => {
        const active = p.classList.contains('is-active');

        if (isDesktop()) {
          gsap.to(p, { flexGrow: active ? 5 : 1, duration: DUR, ease: EASE, overwrite: true });
        } else {
          gsap.to(p, { height: active ? 300 : 130, duration: DUR, ease: EASE, overwrite: true });
        }

        gsap.to(p.querySelector('.svc-panel-content'), {
          opacity: active ? 1 : 0,
          y: active ? 0 : 8,
          duration: active ? 0.45 : 0.25,
          delay: active ? 0.2 : 0,
          ease: 'power2.out',
          overwrite: true
        });
        gsap.to(p.querySelector('.svc-panel-label'), {
          opacity: active ? 0 : 1,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
      });
    }

    panels.forEach(panel => {
      panel.addEventListener('mouseenter', () => { if (isDesktop()) setActive(panel); });
      panel.addEventListener('click', () => { if (!isDesktop()) setActive(panel); });
      panel.addEventListener('focus', () => setActive(panel));
    });

    setActive(panels[0]);

    let lastIsDesktop = isDesktop();
    window.addEventListener('resize', () => {
      const nowDesktop = isDesktop();
      if (nowDesktop !== lastIsDesktop) {
        lastIsDesktop = nowDesktop;
        panels.forEach(p => gsap.set(p, { clearProps: 'flexGrow,height' }));
        setActive(document.querySelector('.svc-panel.is-active') || panels[0]);
      }
    });
  })();

  /* ── CASE STUDY SPOTLIGHT — switcher with autoplay reel ── */
  (function caseSpotlight() {
    const items = document.querySelectorAll('.case-item');
    const media = document.querySelectorAll('.case-visual-media');
    const outcomeEl = document.getElementById('caseOutcome');
    if (!items.length || !media.length) return;

    const outcomes = [
      'Zero wrong-item dispatches after deployment',
      'Single source of truth for all warehouse operations',
      'Hours of weekly catalog admin eliminated'
    ];

    const INTERVAL = 5000;
    const DUR = 0.7;
    const EASE = 'power3.inOut';

    let active = 0;
    let timer = null;
    let progressTween = null;

    function refreshActiveHeight() {
      const activeItem = items[active];
      if (!activeItem) return;
      gsap.set(activeItem.querySelector('.case-item-body'), { height: 'auto' });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshActiveHeight);
    window.addEventListener('resize', refreshActiveHeight);

    function setActiveItem(index, animate = true) {
      active = index;

      items.forEach(item => {
        const isActive = Number(item.dataset.case) === index;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive);

        const body = item.querySelector('.case-item-body');
        if (!animate) {
          body.style.height = isActive ? 'auto' : '0';
          body.style.opacity = isActive ? '1' : '0';
          return;
        }

        if (isActive) {
          gsap.set(body, { height: 'auto' });
          const h = body.offsetHeight;
          gsap.fromTo(body,
            { height: 0, opacity: 0 },
            {
              height: h, opacity: 1, duration: DUR, ease: EASE, overwrite: true,
              onComplete: () => gsap.set(body, { height: 'auto' })
            }
          );
        } else {
          gsap.to(body, { height: 0, opacity: 0, duration: DUR, ease: EASE, overwrite: true });
        }
      });

      // crossfade visuals
      media.forEach(m => {
        const isActive = Number(m.dataset.case) === index;
        gsap.to(m, { opacity: isActive ? 1 : 0, duration: DUR, ease: EASE, overwrite: true });
        if (isActive) gsap.fromTo(m, { scale: 1.1 }, { scale: 1.04, duration: 6, ease: 'sine.out', overwrite: 'auto' });
        if (m.tagName === 'VIDEO') isActive ? m.play().catch(() => { }) : m.pause();
      });

      // outcome text — small delayed fade
      if (outcomeEl) {
        gsap.to(outcomeEl, {
          opacity: 0, y: -6, duration: 0.25, ease: 'power2.out',
          onComplete: () => {
            outcomeEl.textContent = outcomes[index];
            gsap.fromTo(outcomeEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' });
          }
        });
      }
    }

    function playProgress(index) {
      if (progressTween) progressTween.kill();
      items.forEach(item => {
        const fill = item.querySelector('.case-item-progress-fill');
        if (fill) fill.style.width = '0%';
      });
      const activeFill = items[index].querySelector('.case-item-progress-fill');
      if (activeFill) progressTween = gsap.to(activeFill, { width: '100%', duration: INTERVAL / 1000, ease: 'linear' });
    }

    function goTo(index, animate = true) {
      setActiveItem(index, animate);
      playProgress(index);
    }

    function next() { goTo((active + 1) % items.length); }

    function startAutoplay() { stopAutoplay(); timer = setInterval(next, INTERVAL); }
    function stopAutoplay() { if (timer) clearInterval(timer); timer = null; }

    items.forEach(item => {
      item.addEventListener('click', () => { goTo(Number(item.dataset.case)); startAutoplay(); });
    });

    const spotlight = document.getElementById('caseSpotlight');
    if (spotlight) {
      spotlight.addEventListener('mouseenter', stopAutoplay);
      spotlight.addEventListener('mouseleave', startAutoplay);
    }

    goTo(0, false);
    startAutoplay();
  })();

  /* ── PROCESS — wide card tag cascade on scroll ── */
  (function processTags() {
    const wide = document.getElementById('processWide');
    const tags = document.querySelectorAll('#processWideTags .tag');
    if (!wide || !tags.length) return;

    gsap.to(tags, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
      stagger: 0.06,
      scrollTrigger: { trigger: wide, start: 'top 80%', toggleActions: 'play none none none' }
    });
  })();

  /* ── TECH STACK — magnetic hub ── */
  (function techStackHub() {
    const hub = document.getElementById('tstackHub');
    if (!hub || !window.matchMedia('(hover: hover)').matches) return;

    const core = hub.querySelector('.tstack-hub-core');
    const moveX = gsap.quickTo(core, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(core, 'y', { duration: 0.5, ease: 'power3.out' });

    hub.addEventListener('mousemove', (e) => {
      const rect = hub.getBoundingClientRect();
      moveX((e.clientX - rect.left - rect.width / 2) * 0.2);
      moveY((e.clientY - rect.top - rect.height / 2) * 0.2);
    });
    hub.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
  })();

  /* ── TESTIMONIALS — steps one card at a time, autoplay, pauses on hover/focus ── */
  (function testimonialsCarousel() {
    const viewport = document.getElementById('testiViewport');
    const track = document.getElementById('testiTrack');
    if (!viewport || !track) return;

    const REAL_CARDS = 5;
    const INTERVAL = 4000;

    let index = 0;
    let timer = null;

    function step(x, animate = true) {
      if (!animate) {
        track.style.transition = 'none';
        track.style.transform = `translateX(${x}px)`;
        return;
      }
      gsap.to(track, { x, duration: 0.7, ease: 'power3.inOut', overwrite: true });
    }

    function cardStep() {
      const card = track.children[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function next() {
      index++;
      step(-index * cardStep());

      if (index === REAL_CARDS) {
        setTimeout(() => {
          index = 0;
          step(0, false);
        }, 720);
      }
    }

    function play() { stop(); timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', play);
    viewport.addEventListener('focusin', stop);
    viewport.addEventListener('focusout', play);

    play();
  })();

  /* ── CTA — floating gradient orbs + magnetic submit button ── */
  (function ctaEffects() {
    gsap.utils.toArray('.cta-orb').forEach((orb, i) => {
      gsap.to(orb, {
        x: i % 2 === 0 ? 40 : -30,
        y: i % 2 === 0 ? -30 : 40,
        duration: 6 + i * 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    });

    const btn = document.getElementById('cf-submit');
    if (btn && window.matchMedia('(hover: hover)').matches) {
      const moveX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      const moveY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
        moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
      });
      btn.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
    }
  })();

})();