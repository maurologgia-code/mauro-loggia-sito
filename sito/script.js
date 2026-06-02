/* ============================================================
   MAURO LOGGIA — SITO PERSONALE V1
   script.js — maggio 2026
   ============================================================ */

'use strict';

/* === NAVIGAZIONE STICKY === */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // stato iniziale
})();


/* === MENU HAMBURGER (mobile) === */
(function initHamburger() {
  const toggle = document.querySelector('.nav__toggle');
  const mobile = document.querySelector('.nav__mobile');
  const mobileLinks = document.querySelectorAll('.nav__mobile a');
  if (!toggle || !mobile) return;

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    mobile.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    mobile.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  // Chiude al click su link interni
  mobileLinks.forEach(link => link.addEventListener('click', close));

  // Chiude con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* === BIO ESPANDIBILE === */
(function initBioExpander() {
  const btn = document.querySelector('.about__expander-btn');
  const content = document.querySelector('.about__bio-extended');
  if (!btn || !content) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    content.classList.toggle('open', !expanded);

    const label = btn.querySelector('.expander-label');
    if (label) {
      label.textContent = expanded ? 'Leggi di più' : 'Leggi meno';
    }
  });
})();


/* === SCROLL REVEAL (Intersection Observer) === */
(function initScrollReveal() {
  // Non attivare se l'utente preferisce riduzione di movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima una sola volta
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* === FORM CONTATTI === */
(function initContactForm() {
  const form = document.querySelector('.contact__form form');
  if (!form) return;

  const feedback = form.querySelector('.form__feedback');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.querySelector('#nome')?.value.trim();
    const email   = form.querySelector('#email')?.value.trim();
    const message = form.querySelector('#messaggio')?.value.trim();

    // Validazione minimale
    if (!name || !email || !message) {
      showFeedback('error', 'Compila tutti i campi prima di inviare.');
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback('error', 'Inserisci un indirizzo email valido.');
      return;
    }

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
        showFeedback('success', 'Messaggio inviato. Ti risponderò al più presto.');
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Fallback: apre il client email
      const subject  = encodeURIComponent(`Contatto dal sito — ${name}`);
      const body     = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:mauro.loggia@gmail.com?subject=${subject}&body=${body}`;
      showFeedback('success', 'Stiamo aprendo il tuo client email come alternativa.');
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

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 6000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();


/* === GALLERIA — LIGHTBOX === */
(function initGalleryLightbox() {
  const grid     = document.querySelector('.gallery__grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const items = Array.from(grid.querySelectorAll('.gallery__item'));
  if (!items.length) return;

  const imgEl     = lightbox.querySelector('.lightbox__img');
  const captionEl = lightbox.querySelector('.lightbox__caption');
  const btnClose  = lightbox.querySelector('.lightbox__close');
  const btnPrev   = lightbox.querySelector('.lightbox__nav--prev');
  const btnNext   = lightbox.querySelector('.lightbox__nav--next');

  let current = 0;
  let lastFocused = null;

  const render = () => {
    const el = items[current];
    const caption = el.dataset.caption || '';
    imgEl.src = el.dataset.full;
    imgEl.alt = caption || 'Fotografia della galleria';
    captionEl.textContent = caption;
    captionEl.style.display = caption ? '' : 'none';
  };

  const open = (index) => {
    current = index;
    lastFocused = document.activeElement;
    render();
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; }, 280);
    if (lastFocused) lastFocused.focus();
  };

  const go = (dir) => {
    current = (current + dir + items.length) % items.length;
    render();
  };

  items.forEach((el, i) => el.addEventListener('click', () => open(i)));
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => go(-1));
  btnNext.addEventListener('click', () => go(1));

  // Chiude cliccando sullo sfondo (non sull'immagine o sui pulsanti)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox__figure')) {
      close();
    }
  });

  // Tastiera: Esc chiude, frecce navigano
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')          close();
    else if (e.key === 'ArrowLeft')  go(-1);
    else if (e.key === 'ArrowRight')  go(1);
  });
})();


/* === ACTIVE NAV LINK (scroll spy leggero) === */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${id}`;
            link.style.color = active ? 'var(--color-text)' : '';
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(s => observer.observe(s));
})();
