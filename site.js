(() => {
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.home-hero, .page-hero');
  const header = document.querySelector('.site-header');

  // Coalesce scroll/layout reads to one per frame; also refresh on resize and bfcache restore.
  if (header) {
    let frame = 0;
    const syncHeader = () => {
      frame = 0;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      header.classList.toggle('on-dark', !!hero && hero.getBoundingClientRect().bottom > header.offsetHeight / 2);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty('--scroll-progress', String(scrollable > 0 ? window.scrollY / scrollable : 0));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(syncHeader); };
    syncHeader();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
  }

  // A pointer-following light is purely decorative and only updates on mouse
  // movement; touch and reduced-motion devices keep the static background.
  if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let lightFrame = 0;
    window.addEventListener('pointermove', event => {
      const x = event.clientX, y = event.clientY;
      if (lightFrame) return;
      lightFrame = requestAnimationFrame(() => {
        lightFrame = 0;
        document.documentElement.style.setProperty('--cursor-x', `${x}px`);
        document.documentElement.style.setProperty('--cursor-y', `${y}px`);
      });
    }, { passive: true });
  }

  const canHover = !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Magnetic motion is restricted to large, primary anchors. CSS owns the
  // return spring; pointer events only write a handful of composited variables.
  if (canHover) {
    document.querySelectorAll('a.btn-gold, .hero-actions a.btn-outline, .donate-option a.btn, .notice a.btn, .wide-cta a.btn').forEach(button => {
      if (button.closest('form')) return;
      button.classList.add('magnetic-control');
      const label = button.querySelector('.btn-label');
      let baseRect = null;
      button.addEventListener('pointerenter', () => { baseRect = button.getBoundingClientRect(); }, { passive: true });
      button.addEventListener('pointermove', event => {
        const rect = baseRect || button.getBoundingClientRect();
        const dx = Math.max(-5, Math.min(5, (event.clientX - rect.left - rect.width / 2) * 0.12));
        const dy = Math.max(-5, Math.min(5, (event.clientY - rect.top - rect.height / 2) * 0.12));
        button.style.setProperty('--mag-x', `${dx}px`);
        button.style.setProperty('--mag-y', `${dy}px`);
        button.style.setProperty('--reflect-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        button.style.setProperty('--reflect-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
        if (label) {
          label.style.setProperty('--label-x', `${dx * 0.24}px`);
          label.style.setProperty('--label-y', `${dy * 0.24}px`);
        }
      }, { passive: true });
      button.addEventListener('pointerleave', () => {
        baseRect = null;
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
        if (label) {
          label.style.setProperty('--label-x', '0px');
          label.style.setProperty('--label-y', '0px');
        }
      }, { passive: true });
    });

    // Card reflections are a CSS radial highlight; no layout reads or React
    // updates occur after the initial pointer event.
    const cards = document.querySelectorAll('.feature-card, .event-card, .program-tile, .surface-panel, .step, .donate-option, .contact-card, .direction-panel, .notice');
    cards.forEach(card => {
      card.classList.add('spotlight-card');
      const light = document.createElement('span');
      light.className = 'card-spotlight';
      light.setAttribute('aria-hidden', 'true');
      card.prepend(light);
      let baseRect = null;
      card.addEventListener('pointerenter', () => { baseRect = card.getBoundingClientRect(); card.classList.add('is-lit'); }, { passive: true });
      card.addEventListener('pointerleave', () => { baseRect = null; card.classList.remove('is-lit'); }, { passive: true });
      card.addEventListener('pointermove', event => {
        const rect = baseRect || card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  // Decorative geometry, rays, and arch strokes play only near the viewport.
  const ornaments = [...document.querySelectorAll('[data-motion-geometry], [data-arch-draw], .architecture-light')];
  if (ornaments.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      ornaments.forEach(el => el.classList.add('is-visible', 'is-drawn'));
    } else {
      const ornamentObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const el = entry.target;
          el.classList.toggle('is-visible', entry.isIntersecting);
          if (entry.isIntersecting && el.hasAttribute('data-arch-draw')) {
            el.classList.add('is-drawn');
            ornamentObserver.unobserve(el); // draw once; leave the completed arch in place
          }
        });
      }, { rootMargin: '80px 0px', threshold: 0.01 });
      ornaments.forEach(el => ornamentObserver.observe(el));
    }
  }

  // One low-frequency scroll RAF drives only the few visible ornament layers;
  // the original hero canvas and text are deliberately not parallax targets.
  const parallaxNodes = [...document.querySelectorAll('[data-parallax]')];
  if (!reducedMotion && canHover && parallaxNodes.length && 'IntersectionObserver' in window) {
    const visibleParallax = new Set();
    let parallaxFrame = 0;
    const paintParallax = () => {
      parallaxFrame = 0;
      visibleParallax.forEach(el => {
        const rect = el.getBoundingClientRect();
        const progress = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) / Math.max(window.innerHeight, 1);
        const offset = Math.max(-10, Math.min(10, progress * 20));
        el.style.setProperty('--parallax-y', `${offset}px`);
      });
    };
    const scheduleParallax = () => {
      if (visibleParallax.size && !parallaxFrame) parallaxFrame = requestAnimationFrame(paintParallax);
    };
    const parallaxObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleParallax.add(entry.target);
        else { visibleParallax.delete(entry.target); entry.target.style.removeProperty('--parallax-y'); }
      });
      scheduleParallax();
    }, { rootMargin: '60px 0px' });
    parallaxNodes.forEach(el => parallaxObserver.observe(el));
    window.addEventListener('scroll', scheduleParallax, { passive: true });
    window.addEventListener('resize', scheduleParallax, { passive: true });
    window.addEventListener('pagehide', () => {
      parallaxObserver.disconnect();
      window.removeEventListener('scroll', scheduleParallax);
      window.removeEventListener('resize', scheduleParallax);
      cancelAnimationFrame(parallaxFrame);
    }, { once: true });
  }

  // Major headings use one intact semantic node. Without JS or with reduced
  // motion, they remain fully visible and in normal document flow.
  const cinematicHeadings = [...document.querySelectorAll('.home-hero h1, .page-hero h1, .section-heading h2, .architecture-light h2, .wide-cta h2, .dark-panel h2')];
  if (cinematicHeadings.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      cinematicHeadings.forEach(el => el.classList.add('is-visible'));
    } else {
      document.documentElement.classList.add('cinematic-ready');
      const headingObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          headingObserver.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -28px 0px' });
      cinematicHeadings.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-visible');
        else headingObserver.observe(el);
      });
    }
  }

  // CSS glow runs only while its hero is visible. No observer in older browsers.
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      hero.classList.toggle('is-paused', !entry.isIntersecting);
    }).observe(hero);
  }

  // Page links use native navigation. Keep below-fold content visible even if an
  // observer never fires (full-page captures, print, unsupported browsers).
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => {
      if (/\bdelay-\d\b/.test(el.className)) return;
      const siblings = [...el.parentElement.children].filter(child => child.classList.contains('reveal'));
      el.style.setProperty('--i', String(Math.min(siblings.indexOf(el), 5)));
    });
    elements.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * .95) el.classList.add('in-view', 'no-anim');
    });
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .05, rootMargin: '0px 0px -20px 0px' });
    elements.forEach(el => { if (!el.classList.contains('in-view')) observer.observe(el); });
  }

  // Animate only visible program tiles. Cancel our own in-flight FLIP animations
  // before a rapid re-filter so hidden tiles cannot linger in old positions.
  const filters = document.querySelectorAll('[data-filter]');
  const tiles = [...document.querySelectorAll('[data-category]')];
  const tileAnimations = new WeakMap();
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    tiles.forEach(tile => {
      tileAnimations.get(tile)?.cancel();
      tileAnimations.delete(tile);
    });
    const animate = !reducedMotion && typeof Element.prototype.animate === 'function';
    const before = animate ? new Map(tiles.filter(tile => !tile.hidden).map(tile => [tile, tile.getBoundingClientRect()])) : null;
    tiles.forEach(tile => { tile.hidden = selected !== 'all' && tile.dataset.category !== selected; });
    if (!animate) return;
    tiles.forEach(tile => {
      if (tile.hidden) return;
      const first = before.get(tile);
      const last = tile.getBoundingClientRect();
      let frames;
      if (!first) frames = [{ opacity: 0, transform: 'translateY(8px) scale(.97)' }, { opacity: 1, transform: 'none' }];
      else if (first.left !== last.left || first.top !== last.top)
        frames = [{ transform: `translate(${first.left - last.left}px, ${first.top - last.top}px)` }, { transform: 'none' }];
      if (frames) tileAnimations.set(tile, tile.animate(frames, { duration: 300, easing: 'cubic-bezier(.22,.9,.25,1)' }));
    });
  }));

  const copyButton = document.querySelector('[data-copy-address]');
  if (copyButton) {
    const originalLabel = copyButton.textContent;
    let resetTimer = 0;
    let latestClick = 0;
    copyButton.addEventListener('click', async () => {
      const click = ++latestClick;
      const address = '3031 Preston Avenue, Roanoke, VA 24012';
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(address);
          copied = true;
        }
      } catch { /* Try the legacy copy method below. */ }
      if (!copied) {
        const input = document.createElement('textarea');
        input.value = address;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.append(input);
        input.select();
        try { copied = document.execCommand('copy'); } catch { /* The address remains visible for manual selection. */ }
        input.remove();
      }
      if (click !== latestClick) return;
      copyButton.textContent = copied ? 'Address copied!' : 'Select the address above to copy';
      copyButton.classList.toggle('is-copied', copied);
      if (!reducedMotion && copyButton.animate) {
        copyButton.animate([{ opacity: .7, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
      }
      const status = document.getElementById('copy-status');
      if (status) status.textContent = copied ? 'Address copied to clipboard.' : 'Copy unavailable. Select the address above.';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyButton.textContent = originalLabel;
        copyButton.classList.remove('is-copied');
      }, 3000);
    });
  }

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const topic = String(data.get('topic'));
    const name = String(data.get('name')).trim();
    const message = String(data.get('message')).trim();
    const subject = encodeURIComponent(`${topic} — Jaffery Center website`);
    const body = encodeURIComponent(`Hello Jaffery Center,\n\n${message}\n\nFrom,\n${name}`);
    const status = document.getElementById('form-status');
    if (status) status.textContent = 'Opening an email draft. Please review and send it in your email app; nothing has been sent yet.';
    // Do not disable the button: a visitor with no mail handler must be able to retry.
    const submit = contactForm.querySelector('button[type="submit"]');
    if (submit && !reducedMotion) {
      submit.animate([{ transform: 'scale(.98)' }, { transform: 'none' }], { duration: 200 });
    }
    window.location.href = `mailto:jafferycenter@gmail.com?subject=${subject}&body=${body}`;
  });
})();
