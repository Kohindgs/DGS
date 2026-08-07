'use client';

import { useEffect } from 'react';
import { startDgsFastBackground } from './DgsFastBackground';

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

function paintFlatControl(el) {
  if (!el) return;
  el.style.setProperty('background', '#111', 'important');
  el.style.setProperty('background-image', 'none', 'important');
  el.style.setProperty('background-color', '#111', 'important');
  el.style.setProperty('box-shadow', 'none', 'important');
  el.style.setProperty('filter', 'none', 'important');
  el.style.setProperty('border', '1px solid rgba(255,255,255,.35)', 'important');
  el.style.setProperty('border-radius', '999px', 'important');
  el.style.setProperty('color', '#fff', 'important');
  el.style.setProperty('opacity', '1', 'important');
  el.style.setProperty('visibility', 'visible', 'important');
}

function caseCardTitle(card) {
  const title =
    card.querySelector('.dgs-v1215-case-visual-title, h3, h2, h4')?.textContent?.trim() ||
    'Case study';
  const kicker =
    card.querySelector('.dgs-v1215-case-visual-kicker, span')?.textContent?.trim() || '';
  return kicker ? `${kicker}: ${title}` : title;
}

function ensurePortfolioMedia() {
  const items = Array.from(document.querySelectorAll('.gallery-item, .case-study-item'));
  if (!items.length) return;

  // Cap concurrent video metadata fetches so case-study images can load.
  const MAX_CONCURRENT = 3;
  let active = 0;
  const queue = [];

  const runNext = () => {
    while (active < MAX_CONCURRENT && queue.length) {
      const job = queue.shift();
      active += 1;
      Promise.resolve()
        .then(job)
        .catch(() => {})
        .finally(() => {
          active -= 1;
          runNext();
        });
    }
  };

  const enqueue = (job) => {
    queue.push(job);
    runNext();
  };

  const activateVideo = (item, video) => {
    if (!video || video.dataset.dgsActivated === '1') return;
    video.dataset.dgsActivated = '1';

    enqueue(() => {
      const sources = video.querySelectorAll('source[data-src]');
      sources.forEach((source) => {
        const src = source.getAttribute('data-src');
        if (src) {
          source.setAttribute('src', src);
          source.removeAttribute('data-src');
        }
      });
      // Also support src parked on the video element itself
      const parked = video.getAttribute('data-src');
      if (parked && !video.getAttribute('src')) {
        video.setAttribute('src', parked);
        video.removeAttribute('data-src');
      }

      video.preload = 'metadata';
      const markReady = () => item.classList.add('video-ready');
      const markFailed = () => {
        item.classList.add('thumb-failed');
        item.classList.remove('video-ready');
      };
      video.addEventListener('loadeddata', markReady, { once: true });
      video.addEventListener('loadedmetadata', markReady, { once: true });
      video.addEventListener('error', markFailed, { once: true });

      try {
        video.load();
        // Seek a hair forward so a frame paints without playing audio.
        const paint = () => {
          try {
            if (video.readyState >= 1) {
              video.currentTime = Math.min(0.12, (video.duration || 1) * 0.01);
            }
          } catch (_) {
            /* ignore */
          }
        };
        video.addEventListener('loadedmetadata', paint, { once: true });
      } catch (_) {
        markFailed();
      }
    });
  };

  items.forEach((item) => {
    if (item.dataset.dgsPortfolioBound === '1') return;
    item.dataset.dgsPortfolioBound = '1';

    const video = item.querySelector('video.thumb-video');
    const poster = item.querySelector('img.thumb-poster, img.thumb-img');

    // Park any eager source so IO controls loading.
    if (video) {
      video.preload = 'none';
      video.querySelectorAll('source[src]').forEach((source) => {
        if (!source.getAttribute('data-src')) {
          source.setAttribute('data-src', source.getAttribute('src'));
          source.removeAttribute('src');
        }
      });
      if (video.getAttribute('src') && !video.getAttribute('data-src')) {
        video.setAttribute('data-src', video.getAttribute('src'));
        video.removeAttribute('src');
      }
      try {
        video.load(); // reset with empty sources
      } catch (_) {
        /* ignore */
      }
    }

    if (poster) {
      const onPosterError = () => {
        poster.style.display = 'none';
        poster.removeAttribute('src');
        item.classList.add('awaiting-frame');
      };
      poster.addEventListener('error', onPosterError);
      if (poster.complete && poster.naturalWidth === 0 && poster.getAttribute('src')) {
        onPosterError();
      }
      if (poster.complete && poster.naturalWidth > 0) {
        item.classList.add('video-ready');
      } else {
        poster.addEventListener('load', () => item.classList.add('video-ready'), {
          once: true,
        });
      }
    } else {
      item.classList.add('awaiting-frame');
    }

    if (!video) return;

    if (typeof IntersectionObserver === 'undefined') {
      activateVideo(item, video);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          activateVideo(item, video);
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    io.observe(item);
  });
}

function ensureCaseStudyImages() {
  // Last-paint CSS kill — WP outline ::after must not become a full gradient slab.
  if (!document.getElementById('dgs-case-flat-fix')) {
    const style = document.createElement('style');
    style.id = 'dgs-case-flat-fix';
    style.textContent = `
      html body .dgs-v1215-case-visual-card::before,
      html body .dgs-v1215-case-visual-card::after,
      html body .dgs-v1215-case-mini::before,
      html body .dgs-v1215-case-mini::after {
        content: none !important;
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        background: transparent !important;
        background-image: none !important;
        pointer-events: none !important;
      }
      html body .dgs-v1215-case-visual-card,
      html body .dgs-v1215-case-mini {
        background: #111 !important;
        background-image: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        isolation: auto !important;
      }
      html body .dgs-v1215-case-media img,
      html body .dgs-weavings-case-media img {
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        object-position: top center !important;
      }
      html body .dgs-case-open-btn {
        background: transparent !important;
        background-image: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  document
    .querySelectorAll('.dgs-v1215-case-media img, .dgs-weavings-case-media img')
    .forEach((img) => {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
      img.style.setProperty('opacity', '1', 'important');
      img.style.setProperty('visibility', 'visible', 'important');
      img.style.setProperty('display', 'block', 'important');
      img.style.setProperty('object-position', 'top center', 'important');
      // Retry once through proxy if the browser aborted under load.
      img.addEventListener(
        'error',
        () => {
          const src = img.currentSrc || img.getAttribute('src') || '';
          if (!src || img.dataset.dgsRetry === '1') return;
          img.dataset.dgsRetry = '1';
          const bump = src.includes('?') ? `&_r=${Date.now()}` : `?_r=${Date.now()}`;
          img.src = `${src}${bump}`;
        },
        { once: true }
      );
    });
}

function ensureAgentFriendlyMarkup() {
  // Menu trigger must be a named command for agentic browsing / AT.
  const trig = document.getElementById('dgsTrig');
  if (trig) {
    if (!trig.getAttribute('aria-label')) {
      trig.setAttribute('aria-label', 'Open menu');
    }
    if (!trig.hasAttribute('aria-expanded')) {
      trig.setAttribute('aria-expanded', 'false');
    }
    if (!trig.hasAttribute('aria-controls')) {
      const panel =
        document.getElementById('dgsPanel') ||
        document.querySelector('#dgsNav .dgs-panel, #dgsNav [id]');
      if (panel?.id) trig.setAttribute('aria-controls', panel.id);
    }
    trig.setAttribute('role', 'button');
    if (!trig.hasAttribute('tabindex')) trig.tabIndex = 0;
  }

  const nav = document.getElementById('dgsNav');
  if (nav && trig) {
    const syncExpanded = () => {
      const open = nav.classList.contains('nav-open');
      trig.setAttribute('aria-expanded', open ? 'true' : 'false');
      trig.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    syncExpanded();
    const mo = new MutationObserver(syncExpanded);
    mo.observe(nav, { attributes: true, attributeFilter: ['class'] });
  }

  // Strip invalid role=button from articles (may arrive from earlier client boots).
  document
    .querySelectorAll('article.dgs-v1215-case-visual-card[role="button"], article.dgs-v1215-case-mini[role="button"]')
    .forEach((card) => {
      card.removeAttribute('role');
      card.removeAttribute('tabindex');
    });

  // Envira imgs: empty alt + tabindex=-1 is inconsistent for presentational nodes.
  // Prefer a real name from caption/title; otherwise keep decorative and drop tabindex.
  document
    .querySelectorAll(
      'img.envira-gallery-image[alt=""], img.envira-gallery-image:not([alt])'
    )
    .forEach((img) => {
      const caption =
        img.getAttribute('data-caption') ||
        img.getAttribute('title') ||
        img.closest('[data-caption]')?.getAttribute('data-caption') ||
        img.closest('a')?.getAttribute('title') ||
        '';
      const cleaned = String(caption).replace(/<[^>]+>/g, '').trim();
      if (cleaned) {
        img.setAttribute('alt', cleaned);
        img.removeAttribute('aria-hidden');
        img.removeAttribute('role');
        img.removeAttribute('tabindex');
      } else if (img.getAttribute('alt') === '') {
        img.removeAttribute('tabindex');
        img.setAttribute('aria-hidden', 'true');
      }
    });

  document
    .querySelectorAll("a.envira-gallery-link, a[class*='envira-gallery-']")
    .forEach((link) => {
      if (link.getAttribute('aria-label')) return;
      const img = link.querySelector('img');
      const name =
        img?.getAttribute('alt') ||
        link.getAttribute('title') ||
        img?.getAttribute('data-caption') ||
        '';
      const cleaned = String(name).replace(/<[^>]+>/g, '').trim();
      if (cleaned) link.setAttribute('aria-label', `View image: ${cleaned}`);
    });
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

  function flattenControls() {
    modal
      .querySelectorAll('.dgs-case-modal-close, .dgs-case-modal-nav')
      .forEach(paintFlatControl);
    document
      .querySelectorAll(
        '#lightbox-close, #lightbox-prev, #lightbox-next, .portfolio-lightbox-btn, .envirabox-button, .envirabox-button--close, .envirabox-close, .envirabox-nav, .envirabox-arrow'
      )
      .forEach(paintFlatControl);
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.classList.remove('dgs-case-modal-active');
    if (typeof window.dgsUnlockScroll === 'function') window.dgsUnlockScroll();
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
    flattenControls();
  }

  cards().forEach((card, i) => {
    // Keep <article> as an article — no role="button".
    // Expose a real <button> so agents/AT get a named command.
    card.removeAttribute('role');
    card.removeAttribute('tabindex');
    card.style.cursor = 'pointer';

    let openBtn = card.querySelector('.dgs-case-open-btn');
    if (!openBtn) {
      openBtn = document.createElement('button');
      openBtn.type = 'button';
      openBtn.className = 'dgs-case-open-btn';
      card.appendChild(openBtn);
    }
    openBtn.setAttribute('aria-label', `Open case study: ${caseCardTitle(card)}`);

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openAt(i);
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('a,button')) return;
      e.preventDefault();
      openAt(i);
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

  flattenControls();
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
    let stopBackground = () => {};

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

    // Agent a11y: name the menu command + fix presentational gallery imgs ASAP
    try {
      ensureAgentFriendlyMarkup();
    } catch (_) {
      /* ignore */
    }

    // Start lightweight particle bg immediately (no Three.js wait)
    try {
      stopBackground = startDgsFastBackground(document.querySelector('.dgs-v1215')) || (() => {});
    } catch (err) {
      console.warn('Fast background failed', err);
    }

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
        ensureAgentFriendlyMarkup();
        ensureCaseStudyImages();
        ensureCaseStudyModal();
        ensurePortfolioMedia();
        // Portfolio cards are injected async by WP scripts — observe and bind.
        const portfolioRoot =
          document.querySelector('#portfolio, .dgs-v1215-portfolio, .portfolio-gallery, #work') ||
          document.getElementById('dgs-wp-home-mirror');
        if (portfolioRoot && !portfolioRoot.dataset.dgsPortfolioObserved) {
          portfolioRoot.dataset.dgsPortfolioObserved = '1';
          const mo = new MutationObserver(() => ensurePortfolioMedia());
          mo.observe(portfolioRoot, { childList: true, subtree: true });
        }
      } catch (err) {
        console.warn('Case study / portfolio / agent a11y init failed', err);
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

      // Last-paint Syne + flat lightbox controls
      if (!document.getElementById('dgs-syne-weight')) {
        const syne = document.createElement('style');
        syne.id = 'dgs-syne-weight';
        syne.textContent = `
          html body, html body #dgs-wp-home-mirror {
            font-family: "Syne", sans-serif !important;
          }
          html body .dgs-v1215 h1,
          html body .dgs-v1215 h2,
          html body .dgs-v1215 h3,
          html body .dgs-v1215 .dgs-v1215-section-head h2,
          html body .dgs-talk-popup h2,
          html body .fluentform .ff-btn-submit {
            font-family: "Syne", sans-serif !important;
            font-weight: 500 !important;
          }
          html body .dgs-v1215 h1 { font-weight: 600 !important; }
          #lightbox-close, #lightbox-prev, #lightbox-next,
          .portfolio-lightbox-btn, .dgs-case-modal-close, .dgs-case-modal-nav,
          .envirabox-button, .envirabox-button--close, .envirabox-close,
          .envirabox-nav, .envirabox-arrow {
            background: #111 !important;
            background-image: none !important;
            box-shadow: none !important;
            filter: none !important;
          }
        `;
        document.head.appendChild(syne);
      }

      // Ensure unlock helpers exist even if WP script failed to patch
      if (typeof window.dgsUnlockScroll !== 'function') {
        window.dgsScrollY = window.dgsScrollY || 0;
        window.dgsUnlockScroll = function () {
          const y = window.dgsScrollY || 0;
          document.documentElement.classList.remove('dgs-scroll-locked');
          document.body.classList.remove('dgs-scroll-locked');
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.width = '';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => window.scrollTo(0, y));
          });
        };
      }

      if (typeof window.dgsUnlockScroll === 'function') {
        window.dgsUnlockScroll();
      }
      document.getElementById('dgsNav')?.classList.remove('nav-open');
      document.body.classList.remove('dgs-talk-popup-active', 'dgs-scroll-locked');
      document.documentElement.classList.remove('dgs-talk-popup-active', 'dgs-scroll-locked');
    }

    boot();

    return () => {
      cancelled = true;
      try {
        stopBackground();
      } catch (_) {
        /* ignore */
      }
      document.body.id = prevId;
      document.body.className = prevClass;
      document.documentElement.className = prevHtmlClass;
      if (typeof window.dgsUnlockScroll === 'function') window.dgsUnlockScroll();
    };
  }, [bodyId, bodyClass, externalScripts, inlineScripts, demoOrigin]);

  return null;
}
