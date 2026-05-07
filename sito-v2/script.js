/* ============================================================
   MAURO LOGGIA — SITO PERSONALE V2 DARK TECH
   script.js — maggio 2026
   ============================================================ */

'use strict';


/* === NAVIGAZIONE STICKY === */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* === MENU HAMBURGER (mobile) === */
(function initHamburger() {
  const toggle  = document.querySelector('.nav__toggle');
  const mobile  = document.querySelector('.nav__mobile');
  const links   = document.querySelectorAll('.nav__mobile a');
  if (!toggle || !mobile) return;

  const open  = () => { toggle.setAttribute('aria-expanded', 'true');  mobile.classList.add('open');    document.body.style.overflow = 'hidden'; };
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); mobile.classList.remove('open'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', () => toggle.getAttribute('aria-expanded') === 'true' ? close() : open());
  links.forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* === BIO ESPANDIBILE === */
(function initBioExpander() {
  const btn     = document.querySelector('.about__expander-btn');
  const content = document.querySelector('.about__bio-extended');
  if (!btn || !content) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    content.classList.toggle('open', !expanded);
    const label = btn.querySelector('.expander-label');
    if (label) label.textContent = expanded ? 'Leggi di più' : 'Leggi meno';
  });
})();


/* === ANALIZZATORE EQ ANIMATO (hero right column) === */
(function initEQAnalyzer() {
  const wrap = document.querySelector('.eq-bars-wrap');
  if (!wrap) return;

  const NUM_BARS = 56;

  /* Pattern di frequenza per simulare uno spettro realistico:
     più energia nelle medie frequenze, meno nelle alte e bassissime */
  const getFreqProfile = (index, total) => {
    const pos = index / total;
    if (pos < 0.05) return { min: 5,  max: 30 };   // sub-bass
    if (pos < 0.15) return { min: 20, max: 75 };   // bass
    if (pos < 0.35) return { min: 35, max: 90 };   // low-mid
    if (pos < 0.55) return { min: 40, max: 95 };   // mid (picco)
    if (pos < 0.70) return { min: 25, max: 80 };   // upper-mid
    if (pos < 0.85) return { min: 10, max: 55 };   // presence
    return { min: 5, max: 30 };                     // air
  };

  /* Genera barre DOM */
  const bars = [];
  for (let i = 0; i < NUM_BARS; i++) {
    const bar = document.createElement('div');
    bar.className = 'eq-bar';
    bar.setAttribute('role', 'presentation');

    const profile = getFreqProfile(i, NUM_BARS);
    const duration = (0.5 + Math.random() * 1.6).toFixed(2);
    const delay    = (Math.random() * -2.5).toFixed(2);

    bar.style.setProperty('--min-h', profile.min + '%');
    bar.style.setProperty('--max-h', profile.max + '%');
    bar.style.animationDuration  = duration + 's';
    bar.style.animationDelay     = delay + 's';
    bar.style.animationName      = 'eq-pulse';
    bar.style.animationTimingFunction = 'ease-in-out';
    bar.style.animationIterationCount = 'infinite';
    bar.style.animationDirection = 'alternate';
    bar.style.height = profile.min + '%';

    wrap.appendChild(bar);
    bars.push(bar);
  }

  /* Aggiunge keyframe animation al foglio di stile */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes eq-pulse {
      from { height: var(--min-h, 10%); }
      to   { height: var(--max-h, 80%); }
    }
  `;
  document.head.appendChild(styleEl);

  /* Aggiorna occasionalmente qualche barra per effetto "live" */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      const idx = Math.floor(Math.random() * NUM_BARS);
      const bar = bars[idx];
      if (!bar) return;
      const profile = getFreqProfile(idx, NUM_BARS);
      const newMin = Math.max(2, profile.min + (Math.random() - 0.5) * 20);
      const newMax = Math.min(100, profile.max + (Math.random() - 0.5) * 20);
      bar.style.setProperty('--min-h', newMin.toFixed(0) + '%');
      bar.style.setProperty('--max-h', newMax.toFixed(0) + '%');
    }, 1200);
  }
})();


/* === SCROLL REVEAL (Intersection Observer) === */
(function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* === FORM CONTATTI === */
(function initContactForm() {
  const form      = document.querySelector('.contact__form form');
  if (!form) return;

  const feedback  = form.querySelector('.form__feedback');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.querySelector('#nome')?.value.trim();
    const email   = form.querySelector('#email')?.value.trim();
    const message = form.querySelector('#messaggio')?.value.trim();

    if (!name || !email || !message) { showFeedback('error', '// ERROR: tutti i campi sono obbligatori.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFeedback('error', '// ERROR: indirizzo email non valido.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = '// invio in corso…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        form.reset();
        showFeedback('success', '// OK: messaggio inviato. Risponderò al più presto.');
      } else {
        throw new Error('Server error');
      }
    } catch {
      const subject = encodeURIComponent(`Contatto dal sito — ${name}`);
      const body    = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:mauro.loggia@gmail.com?subject=${subject}&body=${body}`;
      showFeedback('success', '// OK: apertura client email…');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Invia messaggio';
    }
  });

  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.className = `form__feedback form__feedback--${type}`;
    feedback.textContent = message;
    feedback.style.display = 'block';
    feedback.setAttribute('role', 'alert');
    setTimeout(() => { feedback.style.display = 'none'; }, 6000);
  }
})();


/* === ACTIVE NAV LINK (scroll spy) === */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--color-text-bright)'
            : '';
        });
      }
    }),
    { threshold: 0.35 }
  );

  sections.forEach(s => observer.observe(s));
})();
