/* ============================================================
   MAURO LOGGIA — SITO PERSONALE V3 PREMIUM EDITORIAL
   script.js — maggio 2026
   ============================================================ */

'use strict';


/* === NAVIGAZIONE STICKY === */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* === MENU HAMBURGER (mobile) === */
(function initHamburger() {
  const toggle = document.querySelector('.nav__toggle');
  const mobile = document.querySelector('.nav__mobile');
  const links  = document.querySelectorAll('.nav__mobile a');
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


/* === CONTATORI ANIMATI === */
(function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuart(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* === MARQUEE — pausa su hover/focus === */
(function initMarquee() {
  const track = document.querySelector('.marquee__track');
  if (!track) return;

  const pause  = () => track.style.animationPlayState = 'paused';
  const resume = () => track.style.animationPlayState = '';

  track.parentElement.addEventListener('mouseenter', pause);
  track.parentElement.addEventListener('mouseleave', resume);
  track.parentElement.addEventListener('focusin',    pause);
  track.parentElement.addEventListener('focusout',   resume);
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
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* === FORM CONTATTI === */
(function initContactForm() {
  const form = document.querySelector('.contact__form form');
  if (!form) return;

  const feedback  = form.querySelector('.form__feedback');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.querySelector('#nome')?.value.trim();
    const email   = form.querySelector('#email')?.value.trim();
    const message = form.querySelector('#messaggio')?.value.trim();

    if (!name || !email || !message) { showFeedback('error', 'Tutti i campi sono obbligatori.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFeedback('error', 'Indirizzo email non valido.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Invio in corso…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        form.reset();
        showFeedback('success', 'Messaggio inviato. Risponderò al più presto.');
      } else {
        throw new Error('Server error');
      }
    } catch {
      const subject = encodeURIComponent(`Contatto dal sito — ${name}`);
      const body    = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:mauro.loggia@gmail.com?subject=${subject}&body=${body}`;
      showFeedback('success', 'Apertura client email in corso…');
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
    setTimeout(() => { feedback.style.display = 'none'; }, 7000);
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
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    }),
    { threshold: 0.35 }
  );

  sections.forEach(s => observer.observe(s));
})();
