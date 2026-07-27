// interactions.js — page-level UI behavior (scroll bar, nav, stat count-up, contact form)
(function () {

  /* ── Scroll progress bar ── */
  const scrollBar = document.getElementById('scrollBar');
  function updateScrollProgress() {
    if (!scrollBar) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollBar.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ── Mobile nav toggle ── */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navScrim = document.getElementById('navScrim');
  const navLinks = document.getElementById('navLinks');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleNav() {
    const isOpen = document.body.classList.toggle('nav-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  }
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleNav);
  if (navScrim) navScrim.addEventListener('click', closeNav);
  if (navLinks) navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* ── Count-up stat numbers, plays once when hero stats enter view ── */
  const countEls = document.querySelectorAll('.count-up');
  if (countEls.length) {
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1100;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObs.unobserve(el);
      });
    }, { threshold: 0.4 });
    countEls.forEach(el => countObs.observe(el));
  }

  /* ── Contact form — validation + mailto submission ── */
  const cfFieldIds = ['cf-name', 'cf-company', 'cf-email', 'cf-msg'];

  function validateField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const row = el.closest('.form-row');
    const value = el.value.trim();
    let valid = true;

    if (!value) {
      valid = false;
    } else if (id === 'cf-email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      valid = emailPattern.test(value);
    }

    if (row) row.classList.toggle('has-error', !valid);
    return valid;
  }

  // clear error as soon as the visitor starts fixing the field
  cfFieldIds.forEach(id => {
    const field = document.getElementById(id);
    if (field) field.addEventListener('input', () => validateField(id));
  });

  const cfSubmit = document.getElementById('cf-submit');
  if (cfSubmit) {
    cfSubmit.addEventListener('click', function () {
      const results = cfFieldIds.map(validateField);
      if (results.includes(false)) return;

      const name = document.getElementById('cf-name').value.trim();
      const company = document.getElementById('cf-company').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const msg = document.getElementById('cf-msg').value.trim();

      const subject = `New inquiry from ${name} — ${company}`;
      const body =
        `Name: ${name}\n` +
        `Company & Country: ${company}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${msg}`;
      const mailtoLink = `mailto:hello@duoxsoft.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // swap to the success state and play the checkmark draw
      const fields = document.getElementById('cfFields');
      const success = document.getElementById('cfSuccess');
      fields.style.display = 'none';
      success.classList.add('is-visible');

      if (typeof gsap !== 'undefined') {
        gsap.fromTo('.cf-check-circle', { strokeDashoffset: 151 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo('.cf-check-mark', { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.35, delay: 0.4, ease: 'power2.out' });
        gsap.from('.cf-success', { opacity: 0, y: 10, duration: 0.4 });
      }

      setTimeout(() => { window.location.href = mailtoLink; }, 1100);
    });
  }

})();

