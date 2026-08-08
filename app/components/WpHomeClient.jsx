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

function whenIdle(cb, timeout = 2500) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(cb, { timeout });
  } else {
    setTimeout(cb, Math.min(timeout, 1200));
  }
}

function waitForLcpImage(timeoutMs = 1500) {
  const robot = document.getElementById('dgs-v1215-robot');
  if (!robot || robot.complete) return Promise.resolve();
  return Promise.race([
    new Promise((resolve) => {
      robot.addEventListener('load', resolve, { once: true });
      robot.addEventListener('error', resolve, { once: true });
    }),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function waitForNearViewport(selector, { rootMargin = '320px 0px', timeoutMs = 6000 } = {}) {
  const el = document.querySelector(selector);
  if (!el || typeof IntersectionObserver === 'undefined') {
    return new Promise((resolve) => whenIdle(resolve, Math.min(timeoutMs, 3000)));
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        io.disconnect();
      } catch (_) {
        /* ignore */
      }
      resolve();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) finish();
      },
      { rootMargin }
    );
    io.observe(el);
    whenIdle(finish, timeoutMs);
    setTimeout(finish, timeoutMs);
  });
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

function ensureAboutVideo() {
  document.querySelectorAll('.dgs-about-video[data-dgs-yt]').forEach((btn) => {
    if (btn.dataset.dgsBound === '1') return;
    btn.dataset.dgsBound = '1';
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-dgs-yt');
      if (!id) return;
      const wrap = btn.parentElement || btn;
      const iframe = document.createElement('iframe');
      // nocookie + rel=0 keeps playback on-site and suppresses "play next" queue.
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        id
      )}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1&fs=1&iv_load_policy=3&disablekb=0`;
      iframe.title = "D'Genius Solutions anthem video";
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('frameborder', '0');
      iframe.className = 'dgs-about-video-frame';
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
    });
  });
}

function ensurePortfolioMedia() {
  const items = Array.from(document.querySelectorAll('.gallery-item, .case-study-item'));
  if (!items.length) return;

  // Prefer visible text as the accessible name (no conflicting aria-label).
  items.forEach((item) => {
    if (item.hasAttribute('aria-label')) item.removeAttribute('aria-label');
  });

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
      // Below-fold case screenshots must not compete with the hero LCP image.
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
      img.decoding = 'async';
      img.style.setProperty('opacity', '1', 'important');
      img.style.setProperty('visibility', 'visible', 'important');
      img.style.setProperty('display', 'block', 'important');
      img.style.setProperty('object-position', 'top center', 'important');

      // Prefer proxy-resized variants when the HTML still points at a huge master.
      const src = img.getAttribute('src') || '';
      if (
        src &&
        /\/api\/wp-media\//i.test(src) &&
        !/[?&]dgs_w=/.test(src) &&
        img.dataset.dgsCaseCompact !== '1'
      ) {
        img.dataset.dgsCaseCompact = '1';
        img.setAttribute('data-dgs-full-src', src);
        const join = src.includes('?') ? '&' : '?';
        img.setAttribute(
          'srcset',
          `${src}${join}dgs_w=640 640w, ${src}${join}dgs_w=960 960w, ${src} 1600w`
        );
        img.setAttribute('sizes', '(max-width: 900px) 92vw, 560px');
        img.src = `${src}${join}dgs_w=640`;
      }

      img.addEventListener(
        'error',
        () => {
          const full = img.getAttribute('data-dgs-full-src') || img.getAttribute('src') || '';
          if (!full || img.dataset.dgsRetry === '1') return;
          img.dataset.dgsRetry = '1';
          img.removeAttribute('srcset');
          img.src = full.includes('dgs_w=')
            ? full.replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '')
            : full;
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
      const img = link.querySelector('img');
      const visible =
        link.querySelector('.envira-title, .envira-gallery-title, figcaption')?.textContent ||
        img?.getAttribute('alt') ||
        link.getAttribute('title') ||
        img?.getAttribute('data-caption') ||
        '';
      const cleaned = String(visible).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!cleaned) return;
      // Accessible name must match visible label (PSI label-content-name-mismatch).
      link.setAttribute('aria-label', cleaned);
      const item = link.closest('.envira-gallery-item, .gallery-item');
      if (item) item.setAttribute('aria-label', cleaned);
    });

  // Logo tiles: keep accessible name aligned with alt / visible text.
  document.querySelectorAll('.dgs-v1215-logo-tile img[alt]').forEach((img) => {
    const alt = (img.getAttribute('alt') || '').trim();
    if (!alt) return;
    const tile = img.closest('.dgs-v1215-logo-tile');
    if (tile?.hasAttribute('aria-label') && tile.getAttribute('aria-label') !== alt) {
      tile.setAttribute('aria-label', alt);
    }
  });
  document.querySelectorAll('a.dgs-v1215-logo-text, a.dgs-v1215-logo-tile').forEach((el) => {
    const visible = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (visible) el.setAttribute('aria-label', visible);
  });
}

/** Keep Envira tiles on proxy-resized URLs; only fall back to the master on error. */
function bindEnviraCompactFallbacks() {
  const compactSrc = (img) => {
    const full = img.getAttribute('data-dgs-full-src');
    if (!full || !/\/api\/wp-media\//i.test(full)) return null;
    const bare = full.replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '');
    const join = bare.includes('?') ? '&' : '?';
    const small = `${bare}${join}dgs_w=320`;
    const mid = `${bare}${join}dgs_w=640`;
    return { small, mid, srcset: `${small} 320w, ${mid} 640w` };
  };

  const assertCompact = (img) => {
    if (img.dataset.dgsCompactFallback === '1') return;
    const c = compactSrc(img);
    if (!c) return;
    const src = img.getAttribute('src') || '';
    // If Envira/lazyload swapped back to a master (no dgs_w), restore compact.
    if (src && /\/api\/wp-media\//i.test(src) && !/[?&]dgs_w=/.test(src)) {
      img.setAttribute('src', c.small);
      img.setAttribute('srcset', c.srcset);
      img.setAttribute('data-envira-src', c.small);
      img.setAttribute('data-envira-srcset', c.srcset);
      img.setAttribute('sizes', img.getAttribute('sizes') || '(max-width: 900px) 46vw, 320px');
    }
  };

  document.querySelectorAll('img.envira-gallery-image[data-dgs-full-src]').forEach((img) => {
    assertCompact(img);
    if (img.dataset.dgsCompactBound === '1') return;
    img.dataset.dgsCompactBound = '1';
    img.addEventListener(
      'error',
      () => {
        const full = img.getAttribute('data-dgs-full-src');
        if (!full || img.dataset.dgsCompactFallback === '1') return;
        img.dataset.dgsCompactFallback = '1';
        img.removeAttribute('srcset');
        img.setAttribute('src', full);
      },
      { once: true }
    );
  });

  // Re-assert after Envira justified layout mutates attributes.
  const root = document.querySelector('.envira-gallery-public');
  if (root && !root.dataset.dgsCompactGuard) {
    root.dataset.dgsCompactGuard = '1';
    const mo = new MutationObserver(() => {
      root.querySelectorAll('img.envira-gallery-image[data-dgs-full-src]').forEach(assertCompact);
    });
    mo.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'data-envira-src', 'data-envira-srcset'],
    });
  }
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

    // Always clear SW + Cache Storage so an old Hostinger/Framer shell cannot
    // keep controlling this origin after deploys.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    if (window.caches?.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }

    // If a stale document somehow loaded without our mirror root, force one
    // hard reload with a cache-buster (prevents loops via session flag).
    if (
      !document.getElementById('dgs-wp-home-mirror') &&
      !sessionStorage.getItem('dgs-force-reload')
    ) {
      sessionStorage.setItem('dgs-force-reload', '1');
      const url = new URL(window.location.href);
      url.searchParams.set('_dgs', String(Date.now()));
      window.location.replace(url.toString());
      return () => {};
    }
    sessionStorage.removeItem('dgs-force-reload');

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

    const isPlaceholder = (url) =>
      !url ||
      url.startsWith('data:image/svg') ||
      /^data:image\/gif;base64,/i.test(url);

    // Promote Smush/LiteSpeed placeholders. Leave Envira tiles alone when they
    // already have real src/srcset — loading=lazy + Envira refresh handles them.
    document
      .querySelectorAll(
        'img[data-src], img[data-lazy-src], img[data-envira-src], img.envira-gallery-image, source[data-src], video[data-src]'
      )
      .forEach((el) => {
        const isEnviraImg =
          el.tagName === 'IMG' && el.classList.contains('envira-gallery-image');
        const real =
          el.getAttribute('data-envira-src') ||
          el.getAttribute('data-src') ||
          el.getAttribute('data-lazy-src');
        const srcNow = el.getAttribute('src');
        if (real && !isPlaceholder(real) && isPlaceholder(srcNow)) {
          el.setAttribute('src', real);
        } else if (real && !isPlaceholder(real) && !srcNow) {
          el.setAttribute('src', real);
        }

        const realSrcset =
          el.getAttribute('data-envira-srcset') ||
          el.getAttribute('data-srcset') ||
          el.getAttribute('data-lazy-srcset');
        const srcsetNow = el.getAttribute('srcset') || '';
        if (realSrcset && !isPlaceholder(realSrcset.split(/\s/)[0] || '')) {
          el.setAttribute('srcset', realSrcset);
        } else if (isPlaceholder(srcsetNow.split(/\s/)[0] || '')) {
          el.removeAttribute('srcset');
        }

        el.classList.remove('lazyload', 'lazyloading');
        if (!isEnviraImg) {
          el.classList.remove('envira-lazy');
          el.classList.add('lazyloaded');
        }
      });
    document.querySelectorAll('[data-bg], [data-background]').forEach((el) => {
      const bg = el.getAttribute('data-bg') || el.getAttribute('data-background');
      if (bg) el.style.backgroundImage = `url(${bg})`;
    });

    // Agent a11y + flatten case gradients ASAP (before portfolio scripts boot)
    try {
      ensureAgentFriendlyMarkup();
      bindEnviraCompactFallbacks();
      ensureCaseStudyImages();
      ensureAboutVideo();
    } catch (_) {
      /* ignore */
    }

    async function boot() {
      // 1) Let the hero LCP image finish (or time out) before any heavy JS.
      await waitForLcpImage(1500);
      if (cancelled) return;

      // Lightweight particles after LCP so canvas work does not steal the first paint.
      try {
        stopBackground =
          startDgsFastBackground(document.querySelector('.dgs-v1215')) || (() => {});
      } catch (err) {
        console.warn('Fast background failed', err);
      }

      // 2) Wait for a quiet frame before jQuery / Envira / GSAP.
      await new Promise((resolve) => whenIdle(resolve, 2000));
      if (cancelled) return;

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
      // reCAPTCHA is hidden on the demo host and skipped by the WP mu-plugin —
      // never download ~330KB×2 of unused gstatic JS on first paint.
      const motionScripts = [...byKind('motion'), ...byKind('lib')];

      for (const src of jqueryScripts) {
        if (cancelled) return;
        await loadScript(src);
      }
      // If proxy-served jQuery truncated/failed, fall back to a known-good CDN build.
      if (!window.jQuery) {
        console.warn('DGS jQuery missing after WP scripts; loading CDN fallback');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js');
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

      // Portfolio / motion scripts only matter below the fold — wait until near viewport.
      await waitForNearViewport(
        '.envira-gallery-public, #dgs-v1215-work, #dgs-v1215-portfolio, #dgs-v1215-services',
        { rootMargin: '400px 0px', timeoutMs: 5500 }
      );
      if (cancelled) return;

      const loadEnvira = (async () => {
        for (const src of enviraScripts) {
          if (cancelled) return;
          await loadScript(src);
        }
      })();
      const loadMotion = (async () => {
        for (const src of motionScripts) {
          if (cancelled) return;
          await loadScript(src);
        }
      })();
      await Promise.all([loadEnvira, loadMotion]);

      appInlines.forEach((code, i) => {
        if (cancelled) return;
        try {
          runInline(code, `dgs-inline-${i}`);
        } catch (err) {
          console.warn('DGS inline script failed', i, err);
        }
      });

      // FluentForm only matters for the talk/contact popup — defer until idle
      // or until the user opens a talk/contact control.
      const bootFluent = async () => {
        if (cancelled || window.__dgsFluentBooted) return;
        window.__dgsFluentBooted = true;
        fluentInlines.forEach((code, i) => {
          if (cancelled) return;
          try {
            runInline(code, `dgs-fluent-cfg-${i}`);
          } catch (err) {
            console.warn('DGS fluent config failed', i, err);
          }
        });
        for (const src of fluentScripts) {
          if (cancelled) return;
          await loadScript(src);
        }
      };
      const maybeFluentFromEvent = (event) => {
        const t = event.target?.closest?.(
          'a, button, [role="button"], .dgs-talk-open, [data-dgs-talk], #dgsTrig'
        );
        if (!t) return;
        const hay = `${t.id || ''} ${t.className || ''} ${t.getAttribute?.('aria-label') || ''} ${t.textContent || ''}`;
        if (/talk|contact|fluent|let'?s talk|get in touch|enquire|inquiry/i.test(hay)) {
          bootFluent();
        }
      };
      document.addEventListener('pointerdown', maybeFluentFromEvent, true);
      document.addEventListener('focusin', maybeFluentFromEvent, true);
      window.__dgsFluentBootHandlers = { maybeFluentFromEvent };
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => bootFluent(), { timeout: 8000 });
      } else {
        setTimeout(() => bootFluent(), 5000);
      }

      // Envira justified galleries need a resize/relayout after images + scripts settle.
      const refreshEnvira = () => {
        try {
          if (!window.jQuery || !document.querySelector('.envira-gallery-public')) return;
          const $ = window.jQuery;
          $(window).trigger('resize');
          $(window).trigger('envira');
          $('.envira-gallery-justified-public, .envira-gallery-public').each(function () {
            const $g = $(this);
            try {
              if ($.fn.justifiedGallery && $g.data('jg.rowHeight')) {
                $g.justifiedGallery('norewind');
              } else if ($.fn.justifiedGallery) {
                $g.justifiedGallery();
              }
            } catch (_) {
              /* ignore */
            }
          });
          // Envira sometimes rewrites src to the master — put compact URLs back.
          bindEnviraCompactFallbacks();
        } catch (_) {
          /* ignore */
        }
      };
      refreshEnvira();
      setTimeout(refreshEnvira, 400);
      setTimeout(refreshEnvira, 1200);
      window.addEventListener('load', refreshEnvira, { once: true });
      // Lazy Envira tiles: relayout as images arrive instead of stampeding all at once.
      document.querySelectorAll('img.envira-gallery-image').forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', refreshEnvira, { once: true });
      });
      const enviraRoot = document.querySelector('.envira-gallery-public');
      if (enviraRoot && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              refreshEnvira();
              io.disconnect();
            }
          },
          { rootMargin: '200px 0px' }
        );
        io.observe(enviraRoot);
      }

      try {
        ensureAgentFriendlyMarkup();
        bindEnviraCompactFallbacks();
        ensureCaseStudyImages();
        ensureAboutVideo();
        ensureCaseStudyModal();
        ensurePortfolioMedia();
        // Portfolio cards are injected async by WP scripts — observe and bind.
        const portfolioRoot =
          document.querySelector('#portfolio, .dgs-v1215-portfolio, .portfolio-gallery, #work') ||
          document.getElementById('dgs-wp-home-mirror');
        if (portfolioRoot && !portfolioRoot.dataset.dgsPortfolioObserved) {
          portfolioRoot.dataset.dgsPortfolioObserved = '1';
          const mo = new MutationObserver(() => {
            ensurePortfolioMedia();
            ensureAgentFriendlyMarkup();
          });
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
        const handlers = window.__dgsFluentBootHandlers;
        if (handlers?.maybeFluentFromEvent) {
          document.removeEventListener('pointerdown', handlers.maybeFluentFromEvent, true);
          document.removeEventListener('focusin', handlers.maybeFluentFromEvent, true);
          delete window.__dgsFluentBootHandlers;
        }
      } catch (_) {
        /* ignore */
      }
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
