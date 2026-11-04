/* ---------- Animaciones al hacer scroll ----------
   Se ejecuta de inmediato (el script está al final del <body>) para ocultar
   el contenido antes del primer pintado. Texto: sube desde abajo.
   Fotos y paneles: entran desde la derecha. Grillas: en cascada. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  // [selector, dirección, cascada]. El orden importa: un elemento no se anima
  // si un ancestro ya está marcado (evita animaciones anidadas).
  const rules = [
    ['.hero-content > *', 'up', true],
    ['.page-hero .container > *', 'up', true],
    ['.condo-hero .container > *', 'up', true],
    ['.section-head', 'up'],
    ['.photo-panel, .blueprint-panel, .statement-card', 'right'],
    ['.photo-row > *', 'right', true],
    ['.icon-grid > *', 'up', true],
    ['.module-grid > *', 'up', true],
    ['.offer-grid > *', 'up', true],
    ['.value-grid > *', 'up', true],
    ['.condo-grid > *', 'up', true],
    ['.service-grid > *', 'up', true],
    ['.split > *', 'up', true],
    ['.pull-quote, .stat-table, .form-card', 'up'],
    ['.cta-banner .container > *', 'up', true],
    ['.portal-banner', 'up'],
    ['.footer-main > *', 'up', true],
  ];

  const marked = [];
  rules.forEach(([sel, dir, stagger]) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.hasAttribute('data-reveal') || el.parentElement.closest('[data-reveal]')) return;
      el.setAttribute('data-reveal', dir);
      if (stagger) {
        const i = [...el.parentElement.children].indexOf(el);
        el.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 90}ms`);
      }
      marked.push(el);
    });
  });
  if (!marked.length) return;
  document.documentElement.classList.add('reveal-on');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      el.classList.add('is-revealed');
      // Al terminar, se quitan las marcas para que vuelvan los hover propios de cada tarjeta
      const delay = parseInt(el.style.getPropertyValue('--reveal-delay') || '0', 10);
      setTimeout(() => {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-revealed');
        el.style.removeProperty('--reveal-delay');
      }, delay + 1000);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  marked.forEach((el) => io.observe(el));
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-mobile');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('siac-theme', next); } catch (e) {}
    });
  }

  /* ---------- Barra de anuncios rotativa ---------- */
  const announce = document.querySelector('[data-announce]');
  if (announce) {
    const items = [...announce.querySelectorAll('.announce-item')];
    let idx = 0;
    let timer = null;
    const show = (next, dir) => {
      if (next === idx || items.length < 2) return;
      announce.dataset.dir = dir;
      const prev = items[idx];
      const incoming = items[next];
      items.forEach((el) => el.classList.remove('is-leaving'));
      // Colocar el entrante en su lado de partida sin transición, luego animar
      incoming.style.transition = 'none';
      incoming.classList.remove('is-active');
      void incoming.offsetWidth;
      incoming.style.transition = '';
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      incoming.classList.add('is-active');
      prev.setAttribute('aria-hidden', 'true');
      incoming.removeAttribute('aria-hidden');
      prev.querySelector('a')?.setAttribute('tabindex', '-1');
      incoming.querySelector('a')?.removeAttribute('tabindex');
      idx = next;
    };
    const step = (d) => show((idx + d + items.length) % items.length, d > 0 ? 'next' : 'prev');
    const start = () => { stop(); timer = setInterval(() => step(1), 5000); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    announce.querySelector('[data-announce-next]')?.addEventListener('click', () => { step(1); start(); });
    announce.querySelector('[data-announce-prev]')?.addEventListener('click', () => { step(-1); start(); });
    announce.addEventListener('mouseenter', stop);
    announce.addEventListener('mouseleave', start);
    announce.addEventListener('focusin', stop);
    announce.addEventListener('focusout', start);
    start();
  }

  /* ---------- Header transparente → sólido al hacer scroll ---------- */
  const header = document.querySelector('[data-header]');
  if (header && header.classList.contains('is-overlay')) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menú desplegable de servicios (clic / teclado) ---------- */
  document.querySelectorAll('.nav-drop').forEach((drop) => {
    const btn = drop.querySelector('.nav-drop-btn');
    btn.addEventListener('click', () => {
      const open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!drop.contains(e.target)) { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
    drop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  });

  /* ---------- Modal de contacto ---------- */
  const modal = document.getElementById('contact-modal');
  const openModal = (prefill) => {
    if (!modal) return;
    if (prefill) {
      Object.entries(prefill).forEach(([name, value]) => {
        const field = modal.querySelector(`[name="${name}"]`);
        if (field && value) field.value = value;
      });
    }
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    const first = modal.querySelector('input');
    if (first) first.focus();
  };
  const closeModal = () => { if (modal) modal.close ? modal.close() : modal.removeAttribute('open'); };

  document.querySelectorAll('[data-contact-open]').forEach((btn) =>
    btn.addEventListener('click', () => openModal()));
  document.querySelectorAll('[data-contact-close]').forEach((btn) =>
    btn.addEventListener('click', closeModal));
  if (modal) {
    // Cerrar al hacer clic fuera del contenido (sobre el backdrop)
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }

  /* ---------- Pestaña lateral de invitación ---------- */
  const invite = document.getElementById('invite-tab');
  if (invite) {
    try { if (sessionStorage.getItem('siac-invite-hidden') === '1') invite.classList.add('is-hidden'); } catch (e) {}
    const closeBtn = invite.querySelector('[data-invite-close]');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      invite.classList.add('is-hidden');
      try { sessionStorage.setItem('siac-invite-hidden', '1'); } catch (e) {}
    });
  }

  /* ---------- Formulario del footer → abre el modal con el correo ---------- */
  document.querySelectorAll('[data-footer-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      openModal({ email: form.elements.email.value });
    });
  });

  /* ---------- Formularios de contacto → WhatsApp ---------- */
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (n) => (form.elements[n] && form.elements[n].value.trim()) || '';
      const lines = [
        'Hola SIAC, quisiera solicitar una propuesta.',
        '',
        `*Nombre:* ${v('nombre')}`,
        `*Correo:* ${v('email')}`,
        v('telefono') ? `*Teléfono:* ${v('telefono')}` : null,
        v('condominio') ? `*Condominio/edificio:* ${v('condominio')}` : null,
        `*Servicio:* ${v('servicio')}`,
        v('mensaje') ? `*Mensaje:* ${v('mensaje')}` : null,
      ].filter((l) => l !== null);
      const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      if (modal && modal.contains(form)) closeModal();
      form.reset();
    });
  });
});
