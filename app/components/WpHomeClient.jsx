'use client';

import { useEffect } from 'react';

const DEMO_ORIGIN = 'https://dimgrey-goat-473970.hostingersite.com';

function loadScript(src, timeoutMs = 15000) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-dgs-src="${src}"]`)) {
      resolve(true);
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.dataset.dgsSrc = src;
    const timer = setTimeout(() => resolve(false), timeoutMs);
    s.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    s.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    document.body.appendChild(s);
  });
}

function runInline(code, id) {
  if (!code) return;
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.text = code;
  document.body.appendChild(s);
}

function ensureCaseStudyModal() {
  if (document.getElementById('dgs-case-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'dgs-case-modal';
  modal.className = 'dgs-case-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Case study details');
  modal.innerHTML = `
    <button type="button" class="dgs-case-modal-close" aria-label="Close case study">×</button>
    <button type="button" class="dgs-case-modal-nav dgs-case-modal-prev" aria-label="Previous case study">‹</button>
    <div class="dgs-case-modal-panel">
      <div class="dgs-case-modal-media"></div>
      <div class="dgs-case-modal-body"></div>
    </div>
    <button type="button" class="dgs-case-modal-nav dgs-case-modal-next" aria-label="Next case study">›</button>
  `;
  document.body.appendChild(modal);

  const cards = () =>
    Array.from(document.querySelectorAll('#case-studies .dgs-v1215-case-visual-card, #case-studies .dgs-v1215-case-mini'));

  let index = 0;

  function close() {
    modal.classList.remove('is-open');
    document.body.classList.remove('dgs-case-modal-active');
  }

  function openAt(i) {
    const list = cards();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    const card = list[index];
    const media = modal.querySelector('.dgs-case-modal-media');
    const body = modal.querySelector('.dgs-case-modal-body');
    const img = card.querySelector('img');
    const kicker = card.querySelector('span')?.textContent?.trim() || '';
    const title = card.querySelector('h3')?.textContent?.trim() || '';
    const copy = card.querySelector('p')?.textContent?.trim() || '';
    const metrics = card.querySelector('.dgs-v1215-case-metrics')?.innerHTML || '';

    media.innerHTML = img
      ? `<img src="${img.currentSrc || img.src}" alt="${img.alt || title}" />`
      : '';
    body.innerHTML = `
      ${kicker ? `<span class="dgs-case-modal-kicker">${kicker}</span>` : ''}
      ${title ? `<h3>${title}</h3>` : ''}
      ${copy ? `<p>${copy}</p>` : ''}
      ${metrics ? `<div class="dgs-case-modal-metrics">${metrics}</div>` : ''}
    `;
    modal.classList.add('is-open');
    document.body.classList.add('dgs-case-modal-active');
  }

  cards().forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openAt(i);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(i);
      }
    });
  });

  modal.querySelector('.dgs-case-modal-close')?.addEventListener('click', close);
  modal.querySelector('.dgs-case-modal-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openAt(index - 1);
  });
  modal.querySelector('.dgs-case-modal-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openAt(index + 1);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') openAt(index - 1);
    if (e.key === 'ArrowRight') openAt(index + 1);
  });
}

/**
 * Restores WP homepage interactivity (menu, services dropdown, case lightbox,
 * WebGL background, FluentForm) without loading the full LiteSpeed script storm.
 */
export default function WpHomeClient({
  bodyId,
  bodyClass,
  externalScripts = [],
  inlineScripts = [],
  demoOrigin = DEMO_ORIGIN,
}) {
  useEffect(() => {
    let cancelled = false;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    if (window.caches?.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }

    const prevId = document.body.id;
    const prevClass = document.body.className;
    const prevHtmlClass = document.documentElement.className;

    document.body.id = bodyId || 'cmsmasters_body';
    const cleaned = (bodyClass || '')
      .replace(/\bdgs-talk-popup-active\b/g, '')
      .replace(/\bnav-open\b/g, '');
    document.body.className = cleaned;
    document.documentElement.className = prevHtmlClass
      .replace(/\bno-js\b/g, 'js')
      .replace(/\bdgs-talk-popup-active\b/g, '');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    const logo = document.getElementById('dgsLogo');
    if (logo) logo.setAttribute('href', `${demoOrigin.replace(/\/$/, '')}/`);

    document.querySelectorAll('img[data-src], img[data-lazy-src], source[data-src], video[data-src]').forEach((el) => {
      const src = el.getAttribute('data-src') || el.getAttribute('data-lazy-src');
      if (src && !src.startsWith('data:image/svg')) {
        el.setAttribute('src', src);
        el.removeAttribute('data-src');
        el.removeAttribute('data-lazy-src');
      }
      el.classList.remove('lazyload', 'lazyloading');
      el.classList.add('lazyloaded');
    });
    document.querySelectorAll('[data-bg], [data-background]').forEach((el) => {
      const bg = el.getAttribute('data-bg') || el.getAttribute('data-background');
      if (bg) el.style.backgroundImage = `url(${bg})`;
    });

    async function boot() {
      if (!window.envira_gallery) {
        window.envira_gallery = {
          debug: '',
          ll_delay: '500',
          ll_initial: 'false',
          ll: '1',
          mobile: '0',
        };
      }

      // Normalize: support legacy string[] or [{src, kind}]
      const scripts = externalScripts.map((item) =>
        typeof item === 'string' ? { src: item, kind: 'lib', id: '' } : item
      );

      const byKind = (kind) => scripts.filter((s) => s.kind === kind).map((s) => s.src);
      const jqueryScripts = byKind('jquery');
      const enviraScripts = byKind('envira');
      const fluentScripts = byKind('fluent');
      const recaptchaScripts = byKind('recaptcha');
      const motionScripts = [...byKind('motion'), ...byKind('lib')];

      for (const src of jqueryScripts) {
        if (cancelled) return;
        await loadScript(src);
      }

      const configInlines = [];
      const fluentInlines = [];
      const appInlines = [];
      inlineScripts.forEach((code) => {
        if (
          /^\s*var\s+envira_gallery\s*=/.test(code) ||
          (/envira_gallery\s*=/.test(code) && code.length < 500)
        ) {
          configInlines.push(code);
        } else if (/fluentFormVars|fluent_form_ff_form_instance|fluentformElementor/i.test(code)) {
          fluentInlines.push(code);
        } else {
          appInlines.push(code);
        }
      });

      configInlines.forEach((code, i) => {
        if (cancelled) return;
        try {
          runInline(code, `dgs-envira-cfg-${i}`);
        } catch (err) {
          console.warn('DGS envira config failed', i, err);
        }
      });

      for (const src of enviraScripts) {
        if (cancelled) return;
        await loadScript(src);
      }

      for (const src of motionScripts) {
        if (cancelled) return;
        await loadScript(src);
      }

      // FluentForm: configs → recaptcha → submission/elementor bundles
      fluentInlines.forEach((code, i) => {
        if (cancelled) return;
        try {
          runInline(code, `dgs-fluent-cfg-${i}`);
        } catch (err) {
          console.warn('DGS fluent config failed', i, err);
        }
      });

      for (const src of recaptchaScripts) {
        if (cancelled) return;
        await loadScript(src);
      }
      for (const src of fluentScripts) {
        if (cancelled) return;
        await loadScript(src);
      }

      appInlines.forEach((code, i) => {
        if (cancelled) return;
        try {
          runInline(code, `dgs-inline-${i}`);
        } catch (err) {
          console.warn('DGS inline script failed', i, err);
        }
      });

      try {
        if (window.jQuery && document.querySelector('.envira-gallery-public')) {
          window.jQuery(window).trigger('resize');
        }
      } catch (_) {
        /* ignore */
      }

      try {
        ensureCaseStudyModal();
      } catch (err) {
        console.warn('Case study modal init failed', err);
      }

      const fixLightboxControls = () => {
        ['lightbox-close', 'lightbox-prev', 'lightbox-next'].forEach((id) => {
          const btn = document.getElementById(id);
          if (!btn) return;
          btn.style.setProperty('display', 'flex', 'important');
          btn.style.setProperty('visibility', 'visible', 'important');
          btn.style.setProperty('opacity', '1', 'important');
          btn.style.setProperty('z-index', '2147483647', 'important');
          btn.style.setProperty('pointer-events', 'auto', 'important');
          if (id === 'lightbox-close') {
            btn.style.setProperty('position', 'fixed', 'important');
            btn.style.setProperty('top', '20px', 'important');
            btn.style.setProperty('right', '20px', 'important');
          }
        });
      };
      fixLightboxControls();
      const lb = document.getElementById('lightbox');
      if (lb) {
        const mo = new MutationObserver(fixLightboxControls);
        mo.observe(lb, { attributes: true, attributeFilter: ['class', 'style'] });
      }

      const root = document.querySelector('#dgs-v1215, .dgs-v1215');
      if (root && !root.dataset.dgsV1215Booted) {
        root.classList.remove('motion-ready');
        root.classList.add('gsap-active');
        document.querySelectorAll('.dgs-v1215-reveal').forEach((el) => {
          el.classList.add('is-visible');
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }

      if (typeof window.dgsUnlockScroll === 'function') {
        window.dgsUnlockScroll();
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
      }
      document.getElementById('dgsNav')?.classList.remove('nav-open');
      document.body.classList.remove('dgs-talk-popup-active');
      document.documentElement.classList.remove('dgs-talk-popup-active');
    }

    boot();

    return () => {
      cancelled = true;
      document.body.id = prevId;
      document.body.className = prevClass;
      document.documentElement.className = prevHtmlClass;
      if (typeof window.dgsUnlockScroll === 'function') window.dgsUnlockScroll();
    };
  }, [bodyId, bodyClass, externalScripts, inlineScripts, demoOrigin]);

  return null;
}
