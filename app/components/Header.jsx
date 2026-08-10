
'use client';

import React, { useEffect } from 'react';

export default function Header() {
  useEffect(() => {
    window.dgsScrollY = 0;
    window.dgsLockScroll = function() {
      window.dgsScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + window.dgsScrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    };
    window.dgsUnlockScroll = function() {
      var y = window.dgsScrollY || 0;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, y);
    };
    window.dgsToggle = function() {
      var nav = document.getElementById('dgsNav');
      var label = document.getElementById('dgsTrigLabel');
      if (!nav) return;
      var opening = !nav.classList.contains('nav-open');
      nav.classList.toggle('nav-open', opening);
      if (opening) {
        window.dgsLockScroll();
      } else {
        window.dgsUnlockScroll();
      }
      if (label) label.textContent = opening ? 'CLOSE' : 'MENU';
    };
    window.dgsSvc = function() {
      var item = document.getElementById('dgsSvcItem');
      var sub = document.getElementById('dgsSub');
      if (!item || !sub) return;
      var opening = !item.classList.contains('svc-open');
      item.classList.toggle('svc-open', opening);
      sub.classList.toggle('open', opening);
    };
    window.dgsOpenTalkPopup = function(event) {
      if (event) event.preventDefault();
      var popup = document.getElementById('dgsTalkPopup');
      var nav = document.getElementById('dgsNav');
      var label = document.getElementById('dgsTrigLabel');
      if (!popup) return;
      if (nav && nav.classList.contains('nav-open')) {
        nav.classList.remove('nav-open');
        if (label) label.textContent = 'MENU';
        window.dgsUnlockScroll();
      }
      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('dgs-talk-popup-active');
      document.body.classList.add('dgs-talk-popup-active');
    };
    window.dgsCloseTalkPopup = function() {
      var popup = document.getElementById('dgsTalkPopup');
      if (!popup) return;
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('dgs-talk-popup-active');
      document.body.classList.remove('dgs-talk-popup-active');
    };

    const handleScroll = () => {
      var bar = document.getElementById('dgsBar');
      if (bar) bar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleClick = (e) => {
      var talkTrigger = e.target.closest('.dgs-talk-trigger');
      var talkClose = e.target.closest('[data-dgs-talk-close]');
      if (talkTrigger) {
        window.dgsOpenTalkPopup(e);
      }
      if (talkClose) {
        window.dgsCloseTalkPopup();
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <div dangerouslySetInnerHTML={{ __html: `#dgsNav,
#dgsNav *,
#dgsNav *::before,
#dgsNav *::after {
  box-sizing: border-box !important;
  -webkit-font-smoothing: antialiased !important;
}

#dgsNav a,
#dgsNav a:hover,
#dgsNav a:visited,
#dgsNav a:focus,
#dgsNav a:active {
  text-decoration: none !important;
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

#dgsNav {
  --acc: #FD5C62;
  --blk: #080808;
  --bdr: rgba(255,255,255,0.08);
  --mut: rgba(255,255,255,0.35);
  --bar: 100px;
}

#dgsBar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: var(--bar) !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 48px !important;
  background: transparent !important;
  background-image: none !important;
  transition: background-color .4s ease !important;
}

#dgsBar.scrolled,
#dgsNav.nav-open #dgsBar {
  background-color: rgba(8,8,8,.93) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

#dgsLogo {
  display: flex !important;
  align-items: center !important;
  height: var(--bar) !important;
  flex-shrink: 0 !important;
  text-decoration: none !important;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}

#dgsLogo img {
  height: 117px !important;
  width: 117px !important;
  object-fit: contain !important;
  display: block !important;
}

#dgsRight {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
}

#dgsPill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: .12em !important;
  text-transform: uppercase !important;
  color: #fff !important;
  background-color: #FD5C62 !important;
  background-image: none !important;
  padding: 11px 22px !important;
  border-radius: 100px !important;
  border: none !important;
  box-shadow: none !important;
  white-space: nowrap !important;
  cursor: pointer !important;
  transition: transform .3s ease, box-shadow .3s ease !important;
}

#dgsPill:hover {
  transform: scale(1.04) !important;
  box-shadow: 0 0 22px rgba(253,92,98,.5) !important;
  color: #fff !important;
}

#dgsPill svg {
  width: 13px;
  height: 13px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
  flex-shrink: 0;
}

#dgsTrig {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 1px solid rgba(255,255,255,.22) !important;
  border-radius: 100px !important;
  padding: 10px 18px !important;
  cursor: pointer !important;
  box-shadow: none !important;
  outline: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  transition: border-color .3s, background-color .3s !important;
}

#dgsTrig:hover {
  background-color: rgba(255,255,255,.06) !important;
  border-color: rgba(255,255,255,.4) !important;
}

#dgsLines {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  width: 20px !important;
  pointer-events: none !important;
}

#dgsLines em {
  display: block !important;
  height: 1.5px !important;
  width: 100% !important;
  background-color: #ffffff !important;
  border-radius: 2px !important;
  font-style: normal !important;
  transition: transform .42s cubic-bezier(.76,0,.24,1),
              opacity .42s ease,
              width .42s ease !important;
}

#dgsLines em:nth-child(2) {
  width: 65% !important;
}

#dgsNav.nav-open #dgsLines em:nth-child(1) {
  transform: translateY(5.5px) rotate(45deg) !important;
  width: 100% !important;
}

#dgsNav.nav-open #dgsLines em:nth-child(2) {
  opacity: 0 !important;
  transform: scaleX(0) !important;
}

#dgsNav.nav-open #dgsLines em:nth-child(3) {
  transform: translateY(-5.5px) rotate(-45deg) !important;
}

#dgsTrigLabel {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: .18em !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  min-width: 38px !important;
  pointer-events: none !important;
  line-height: 1 !important;
}

#dgsOverlay {
  position: fixed !important;
  top: var(--bar) !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: calc(100vh - var(--bar)) !important;
  height: calc(100dvh - var(--bar)) !important;
  z-index: 99998 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  overflow: hidden !important;
  max-width: 100vw !important;
  overscroll-behavior: contain !important;
}

#dgsNav.nav-open #dgsOverlay {
  visibility: visible !important;
  pointer-events: auto !important;
}

#dgsPanel {
  position: absolute !important;
  inset: 0 !important;
  height: 100% !important;
  background-color: #080808 !important;
  background-image: none !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  max-width: 100vw !important;
  transform: translateY(-100%) !important;
  transition: transform .8s cubic-bezier(.76,0,.24,1) !important;
}

#dgsNav.nav-open #dgsPanel {
  transform: translateY(0%) !important;
}

#dgsPanelBody {
  flex: 1 !important;
  display: grid !important;
  grid-template-columns: 1fr 300px !important;
  min-height: 0 !important;
  overflow: hidden !important;
  max-width: 100vw !important;
}

#dgsLinks {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  padding: 36px 48px 28px !important;
  border-right: 1px solid var(--bdr) !important;
  overflow: hidden !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

.dg-item {
  border-bottom: 1px solid var(--bdr) !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  position: relative !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

#dgsNav.nav-open .dg-item:nth-child(1) .dg-row {
  animation: dgSlideIn .5s .38s both;
}

#dgsNav.nav-open .dg-item:nth-child(2) .dg-row {
  animation: dgSlideIn .5s .43s both;
}

#dgsNav.nav-open .dg-item:nth-child(3) .dg-row {
  animation: dgSlideIn .5s .48s both;
}

#dgsNav.nav-open .dg-item:nth-child(4) .dg-row {
  animation: dgSlideIn .5s .53s both;
}

#dgsNav.nav-open .dg-item:nth-child(5) .dg-row {
  animation: dgSlideIn .5s .58s both;
}

#dgsNav.nav-open .dg-item:nth-child(6) .dg-row {
  animation: dgSlideIn .5s .63s both;
}

#dgsNav.nav-open .dg-item:nth-child(7) .dg-row {
  animation: dgSlideIn .5s .68s both;
}

#dgsNav.nav-open .dg-item:nth-child(8) .dg-row {
  animation: dgSlideIn .5s .73s both;
}

@keyframes dgSlideIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dg-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 11px 0 !important;
  cursor: pointer !important;
  text-decoration: none !important;
  background: none !important;
  background-image: none !important;
  border: none !important;
  color: #fff !important;
  width: 100% !important;
  position: relative !important;
}

.dg-lbl {
  font-family: 'Syne', sans-serif !important;
  font-size: clamp(26px, 4vw, 56px) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  letter-spacing: -.02em !important;
  line-height: 1 !important;
  pointer-events: none !important;
  transition: color .28s ease, transform .32s ease !important;
}

.dg-item:hover .dg-lbl {
  color: #FD5C62 !important;
  transform: translateX(5px) !important;
}

.dg-badge {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  border-radius: 50% !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: background-color .28s ease, border-color .28s ease !important;
}

.dg-badge svg {
  width: 12px !important;
  height: 12px !important;
  stroke: rgba(255,255,255,.45) !important;
  fill: none !important;
  stroke-width: 1.8 !important;
  pointer-events: none !important;
  transition: stroke .28s ease, transform .35s cubic-bezier(.76,0,.24,1) !important;
}

.dg-item:hover .dg-badge,
.dg-item.svc-open .dg-badge {
  background-color: #FD5C62 !important;
  border-color: #FD5C62 !important;
}

.dg-item:hover .dg-badge svg,
.dg-item.svc-open .dg-badge svg {
  stroke: #fff !important;
  transform: rotate(45deg) !important;
}

.dg-mq {
  overflow: hidden !important;
  height: 0 !important;
  pointer-events: none !important;
  transition: height .38s cubic-bezier(.76,0,.24,1) !important;
}

.dg-item:hover .dg-mq {
  height: 20px !important;
}

.dg-mq-t {
  display: flex !important;
  white-space: nowrap !important;
  animation: dgRun 12s linear infinite !important;
}

.dg-mq-t span {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .2em !important;
  text-transform: uppercase !important;
  color: #FD5C62 !important;
  padding-right: 40px !important;
  flex-shrink: 0 !important;
  opacity: .85 !important;
}

@keyframes dgRun {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

#dgsSvcItem .dg-badge {
  background-color: rgba(253,92,98,0.12) !important;
  border-color: #FD5C62 !important;
  width: auto !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
  gap: 4px !important;
}

#dgsSvcItem .dg-badge svg {
  stroke: #FD5C62 !important;
}

#dgsSvcItem .dg-badge::after {
  content: 'TAP TO EXPAND' !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 8px !important;
  font-weight: 600 !important;
  letter-spacing: .12em !important;
  color: #FD5C62 !important;
  white-space: nowrap !important;
  display: block !important;
}

#dgsSvcItem.svc-open .dg-badge {
  background-color: #FD5C62 !important;
  border-color: #FD5C62 !important;
}

#dgsSvcItem.svc-open .dg-badge svg {
  stroke: #ffffff !important;
  transform: rotate(180deg) !important;
}

#dgsSvcItem.svc-open .dg-badge::after {
  color: #ffffff !important;
}

.dg-sub {
  display: grid !important;
  grid-template-columns: repeat(3,1fr) !important;
  gap: 4px 12px !important;
  max-height: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
  transform: translateY(-6px) !important;
  transition: max-height .45s cubic-bezier(.76,0,.24,1),
              opacity .25s ease,
              padding .35s ease,
              transform .35s ease !important;
}

.dg-sub.open {
  max-height: 260px !important;
  opacity: 1 !important;
  padding: 4px 0 14px !important;
  transform: translateY(0) !important;
}

.dg-sub a {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: rgba(255,255,255,.6) !important;
  text-decoration: none !important;
  padding: 6px 0 !important;
  letter-spacing: .02em !important;
  transition: color .2s !important;
  display: block !important;
}

.dg-sub a:hover {
  color: #fff !important;
}

#dgsInfo {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  padding: 32px !important;
  overflow-y: auto !important;
  background-color: #080808 !important;
}

#dgsNav.nav-open .dg-ib:nth-child(1) {
  animation: dgFadeUp .5s .5s both;
}

#dgsNav.nav-open .dg-ib:nth-child(2) {
  animation: dgFadeUp .5s .56s both;
}

#dgsNav.nav-open .dg-ib:nth-child(3) {
  animation: dgFadeUp .5s .62s both;
}

#dgsNav.nav-open #dgsCtaBtn {
  animation: dgFadeUp .5s .68s both;
}

@keyframes dgFadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dg-ib {
  margin-bottom: 26px !important;
}

.dg-lbl2 {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .22em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.28) !important;
  margin-bottom: 10px !important;
  display: block !important;
}

.dg-cl {
  display: block !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  color: #fff !important;
  text-decoration: none !important;
  line-height: 1.9 !important;
  transition: color .2s !important;
}

.dg-cl:hover {
  color: #FD5C62 !important;
}

.dg-addr {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 12px !important;
  color: rgba(255,255,255,.38) !important;
  line-height: 1.8 !important;
}

.dg-socrow {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}

.dg-soc {
  display: inline-flex !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .12em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.38) !important;
  text-decoration: none !important;
  border: 1px solid rgba(255,255,255,.1) !important;
  padding: 6px 12px !important;
  border-radius: 100px !important;
  background: transparent !important;
  background-image: none !important;
  transition: color .25s, background-color .25s, border-color .25s !important;
}

.dg-soc:hover {
  color: #fff !important;
  background-color: #FD5C62 !important;
  border-color: #FD5C62 !important;
}

#dgsCtaBtn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  font-family: 'Syne', sans-serif !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  letter-spacing: .1em !important;
  text-transform: uppercase !important;
  color: #fff !important;
  background-color: #FD5C62 !important;
  background-image: none !important;
  padding: 16px 20px !important;
  border-radius: 12px !important;
  text-decoration: none !important;
  border: none !important;
  box-shadow: none !important;
  width: 100% !important;
  transition: transform .3s, box-shadow .3s !important;
}

#dgsCtaBtn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 28px rgba(253,92,98,.4) !important;
  color: #fff !important;
}

#dgsCtaBtn svg {
  width: 14px;
  height: 14px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
  flex-shrink: 0;
}

#dgsFoot {
  flex-shrink: 0 !important;
  border-top: 1px solid var(--bdr) !important;
  padding: 14px 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background-color: #080808 !important;
}

#dgsFoot span {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important;
  color: rgba(255,255,255,.28) !important;
}

.dg-fl {
  display: flex !important;
  gap: 20px !important;
}

.dg-fl a {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  letter-spacing: .1em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.28) !important;
  text-decoration: none !important;
  transition: color .2s !important;
}

.dg-fl a:hover {
  color: #fff !important;
}

@media (max-height: 760px) and (min-width: 861px) {
  #dgsPanelBody {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #dgsLinks {
    justify-content: flex-start !important;
    overflow: visible !important;
    padding-top: 30px !important;
  }

  .dg-lbl {
    font-size: clamp(24px, 3.1vw, 42px) !important;
  }

  .dg-row {
    padding: 8px 0 !important;
  }

  #dgsInfo {
    padding: 24px !important;
  }
}

@media (max-width: 860px) {
  #dgsNav {
    --bar: 72px;
  }

  #dgsBar {
    padding: 0 16px !important;
    height: 72px !important;
    max-width: 100vw !important;
  }

  #dgsLogo {
    height: 72px !important;
  }

  #dgsLogo img {
    height: 58px !important;
    width: 58px !important;
  }

  #dgsPill {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    pointer-events: none !important;
  }

  #dgsTrig {
    padding: 9px 14px !important;
    gap: 8px !important;
  }

  #dgsPanelBody {
    grid-template-columns: 1fr !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    max-width: 100vw !important;
    height: 100% !important;
  }

  #dgsLinks {
    padding: 14px 16px 6px !important;
    border-right: none !important;
    border-bottom: 1px solid var(--bdr) !important;
    justify-content: flex-start !important;
    overflow: visible !important;
    max-width: 100vw !important;
    min-width: 0 !important;
  }

  .dg-mq {
    display: none !important;
  }

  .dg-lbl {
    font-size: clamp(24px, 6.2vw, 34px) !important;
  }

  .dg-row {
    padding: 6px 0 !important;
  }

  .dg-sub {
    grid-template-columns: repeat(2,1fr) !important;
    gap: 2px 10px !important;
  }

  .dg-sub.open {
    max-height: 300px !important;
    padding: 2px 0 10px !important;
  }

  .dg-sub a {
    font-size: 12px !important;
    line-height: 1.35 !important;
    padding: 4px 0 !important;
  }

  #dgsSvcItem .dg-badge::after {
    display: none !important;
  }

  #dgsSvcItem .dg-badge {
    padding: 0 10px !important;
    width: auto !important;
    min-width: 36px !important;
  }

  #dgsInfo {
    padding: 12px 16px 14px !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .dg-ib {
    margin-bottom: 10px !important;
  }

  .dg-lbl2 {
    margin-bottom: 5px !important;
    font-size: 9px !important;
  }

  .dg-cl {
    font-size: 12px !important;
    line-height: 1.45 !important;
    word-break: break-word !important;
  }

  .dg-addr {
    font-size: 11px !important;
    line-height: 1.45 !important;
    margin: 0 !important;
  }

  .dg-socrow {
    gap: 5px !important;
    flex-wrap: wrap !important;
    max-width: 100% !important;
  }

  .dg-soc {
    font-size: 9px !important;
    padding: 5px 10px !important;
  }

  #dgsCtaBtn {
    padding: 11px 16px !important;
    font-size: 11px !important;
    letter-spacing: .08em !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 4px !important;
    border-radius: 10px !important;
  }

  #dgsFoot {
    padding: 8px 16px !important;
    flex-direction: column !important;
    gap: 4px !important;
    align-items: flex-start !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  #dgsFoot span {
    font-size: 10px !important;
  }

  .dg-fl {
    gap: 12px !important;
  }

  .dg-fl a {
    font-size: 10px !important;
  }
}

@media (max-width: 480px) {
  #dgsTrigLabel {
    display: none !important;
  }

  #dgsTrig {
    padding: 10px 12px !important;
    gap: 0 !important;
  }

  #dgsRight {
    gap: 8px !important;
  }

  .dg-lbl {
    font-size: clamp(23px, 6vw, 32px) !important;
  }

  .dg-sub a {
    font-size: 12px !important;
  }

  #dgsInfo {
    padding-top: 10px !important;
  }
}

@media (max-width: 420px) and (max-height: 740px) {
  .dg-lbl {
    font-size: clamp(21px, 5.6vw, 28px) !important;
  }

  .dg-row {
    padding: 5px 0 !important;
  }

  #dgsLinks {
    padding: 10px 14px 4px !important;
  }

  #dgsInfo {
    padding: 9px 14px 10px !important;
  }

  .dg-ib {
    margin-bottom: 8px !important;
  }

  .dg-cl {
    font-size: 11px !important;
    line-height: 1.35 !important;
  }

  .dg-addr {
    font-size: 10.5px !important;
    line-height: 1.35 !important;
  }

  .dg-soc {
    font-size: 8px !important;
    padding: 4px 8px !important;
  }

  #dgsCtaBtn {
    padding: 9px 14px !important;
  }

  #dgsFoot {
    padding: 6px 14px !important;
  }

  #dgsFoot span,
  .dg-fl a {
    font-size: 9px !important;
  }
}


/* DGS Let's Talk Popup Form - scoped and responsive */
#dgsTalkPopup,
#dgsTalkPopup *,
#dgsTalkPopup *::before,
#dgsTalkPopup *::after {
  box-sizing: border-box !important;
  -webkit-font-smoothing: antialiased !important;
}

#dgsTalkPopup {
  position: fixed !important;
  inset: 0 !important;
  z-index: 1000000 !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 22px !important;
  font-family: 'DM Sans', sans-serif !important;
}

#dgsTalkPopup.is-open {
  display: flex !important;
}

.dgs-talk-backdrop {
  position: absolute !important;
  inset: 0 !important;
  background:
    radial-gradient(circle at 22% 18%, rgba(253,92,98,.20), transparent 34%),
    radial-gradient(circle at 80% 78%, rgba(253,92,98,.14), transparent 32%),
    rgba(8,8,8,.84) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  opacity: 0 !important;
  transition: opacity .28s ease !important;
}

#dgsTalkPopup.is-open .dgs-talk-backdrop {
  opacity: 1 !important;
}

.dgs-talk-box {
  position: relative !important;
  z-index: 2 !important;
  width: min(100%, 540px) !important;
  max-height: 88vh !important;
  overflow-y: auto !important;
  background: rgba(8,8,8,.94) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
  border-radius: 22px !important;
  color: #fff !important;
  box-shadow: 0 34px 100px rgba(0,0,0,.72), 0 0 46px rgba(253,92,98,.16) !important;
  transform: translateY(18px) scale(.97) !important;
  opacity: 0 !important;
  transition: transform .32s cubic-bezier(.76,0,.24,1), opacity .28s ease !important;
}

#dgsTalkPopup.is-open .dgs-talk-box {
  transform: translateY(0) scale(1) !important;
  opacity: 1 !important;
}

.dgs-talk-box::before {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: 0 !important;
  height: 3px !important;
  border-radius: 22px 22px 0 0 !important;
  background: linear-gradient(90deg, #FD5C62, #ff8a75, #FD5C62) !important;
}

.dgs-talk-head {
  position: sticky !important;
  top: 0 !important;
  z-index: 3 !important;
  padding: 28px 64px 20px 28px !important;
  background: rgba(8,8,8,.96) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border-bottom: 1px solid rgba(255,255,255,.08) !important;
  border-radius: 22px 22px 0 0 !important;
}

.dgs-talk-kicker {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-bottom: 10px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: .18em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.55) !important;
}

.dgs-talk-kicker::before {
  content: '' !important;
  width: 7px !important;
  height: 7px !important;
  border-radius: 999px !important;
  background: #FD5C62 !important;
  box-shadow: 0 0 18px rgba(253,92,98,.85) !important;
}

.dgs-talk-title {
  margin: 0 0 8px !important;
  font-family: 'Syne', sans-serif !important;
  font-size: clamp(27px, 4vw, 36px) !important;
  line-height: 1.05 !important;
  font-weight: 800 !important;
  letter-spacing: -.04em !important;
  color: #fff !important;
  text-transform: uppercase !important;
}

.dgs-talk-title span {
  color: #FD5C62 !important;
}

.dgs-talk-subtitle {
  margin: 0 !important;
  font-size: 14.5px !important;
  line-height: 1.65 !important;
  color: rgba(255,255,255,.62) !important;
}

.dgs-talk-close {
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
  width: 38px !important;
  height: 38px !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 999px !important;
  background: rgba(255,255,255,.06) !important;
  color: #fff !important;
  font-size: 22px !important;
  line-height: 1 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all .25s ease !important;
}

.dgs-talk-close:hover {
  border-color: #FD5C62 !important;
  background: rgba(253,92,98,.16) !important;
  transform: rotate(90deg) !important;
}

.dgs-talk-body {
  padding: 26px 28px 30px !important;
}

.dgs-talk-form .fluentform,
.dgs-talk-form form {
  text-align: left !important;
}

.dgs-talk-form .ff-el-group {
  margin-bottom: 16px !important;
}

.dgs-talk-form label,
.dgs-talk-form .ff-el-input--label label {
  color: rgba(255,255,255,.82) !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  margin-bottom: 7px !important;
}

.dgs-talk-form input,
.dgs-talk-form textarea,
.dgs-talk-form select,
.dgs-talk-form .ff-el-form-control {
  width: 100% !important;
  min-height: 48px !important;
  padding: 13px 15px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  background: rgba(255,255,255,.055) !important;
  color: #fff !important;
  box-shadow: none !important;
  outline: none !important;
}

.dgs-talk-form textarea,
.dgs-talk-form textarea.ff-el-form-control {
  min-height: 112px !important;
  resize: vertical !important;
}

.dgs-talk-form input::placeholder,
.dgs-talk-form textarea::placeholder {
  color: rgba(255,255,255,.38) !important;
}

.dgs-talk-form input:focus,
.dgs-talk-form textarea:focus,
.dgs-talk-form select:focus,
.dgs-talk-form .ff-el-form-control:focus {
  border-color: #FD5C62 !important;
  box-shadow: 0 0 0 3px rgba(253,92,98,.15) !important;
}

.dgs-talk-form .ff-btn-submit,
.dgs-talk-form button[type="submit"],
.dgs-talk-form input[type="submit"] {
  width: 100% !important;
  min-height: 52px !important;
  border: 0 !important;
  border-radius: 12px !important;
  background: #FD5C62 !important;
  color: #fff !important;
  font-family: 'Syne', sans-serif !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  letter-spacing: .08em !important;
  text-transform: uppercase !important;
  cursor: pointer !important;
  box-shadow: 0 10px 34px rgba(253,92,98,.32) !important;
  transition: transform .25s ease, box-shadow .25s ease !important;
}

.dgs-talk-form .ff-btn-submit:hover,
.dgs-talk-form button[type="submit"]:hover,
.dgs-talk-form input[type="submit"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 14px 42px rgba(253,92,98,.42) !important;
}

.dgs-talk-form .ff_form_title,
.dgs-talk-form .fluentform .ff-form-title {
  display: none !important;
}

html.dgs-talk-popup-active,
body.dgs-talk-popup-active {
  overflow: hidden !important;
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    align-items: flex-end !important;
    padding: 12px !important;
  }

  .dgs-talk-box {
    width: 100% !important;
    max-height: 92vh !important;
    border-radius: 20px !important;
  }

  .dgs-talk-box::before,
  .dgs-talk-head {
    border-radius: 20px 20px 0 0 !important;
  }

  .dgs-talk-head {
    padding: 24px 58px 18px 20px !important;
  }

  .dgs-talk-body {
    padding: 22px 20px 24px !important;
  }

  .dgs-talk-title {
    font-size: 27px !important;
  }

  .dgs-talk-subtitle {
    font-size: 14px !important;
  }

  .dgs-talk-close {
    top: 18px !important;
    right: 18px !important;
    width: 36px !important;
    height: 36px !important;
  }
}

@media (max-width: 420px) {
  #dgsTalkPopup {
    padding: 8px !important;
  }

  .dgs-talk-head {
    padding: 22px 54px 16px 18px !important;
  }

  .dgs-talk-body {
    padding: 20px 18px 22px !important;
  }
}



/* DGS Popup v2 fixes: no desktop inner scrollbar, no orange top accent, captcha-safe sizing */
#dgsTalkPopup {
  overflow: hidden !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: rgba(0, 0, 0, 0.72) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
}

#dgsTalkPopup .dgs-talk-box {
  width: min(92vw, 640px) !important;
  max-height: none !important;
  overflow: visible !important;
  border-color: rgba(255,255,255,.10) !important;
}

#dgsTalkPopup .dgs-talk-box::before {
  display: none !important;
}

#dgsTalkPopup .dgs-talk-kicker::before {
  background: rgba(255,255,255,.42) !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-close {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 50% !important;
  background: rgba(255,255,255,.06) !important;
  background-image: none !important;
  box-shadow: none !important;
  color: #fff !important;
  appearance: none !important;
  -webkit-appearance: none !important;
}

#dgsTalkPopup .dgs-talk-form .g-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-hcaptcha,
#dgsTalkPopup .dgs-talk-form .cf-turnstile {
  position: relative !important;
  z-index: 4 !important;
  max-width: 100% !important;
  overflow: visible !important;
}

#dgsTalkPopup .dgs-talk-form iframe[src*="recaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="google.com/recaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="hcaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="challenges.cloudflare"] {
  max-width: 100% !important;
}

.grecaptcha-badge,
div[style*="z-index: 2000000000"],
iframe[src*="google.com/recaptcha"] {
  z-index: 2147483647 !important;
}

@media (min-width: 768px) {
  #dgsTalkPopup .dgs-talk-head {
    position: relative !important;
    top: auto !important;
  }

  #dgsTalkPopup .dgs-talk-body {
    overflow: visible !important;
  }
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    overflow: hidden !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    width: 100% !important;
    max-height: 92vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #dgsTalkPopup .dgs-talk-form iframe[src*="recaptcha"],
  #dgsTalkPopup .dgs-talk-form iframe[src*="google.com/recaptcha"] {
    max-width: 100% !important;
  }
}

@media (max-width: 360px) {
  #dgsTalkPopup .dgs-talk-body {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  #dgsTalkPopup .dgs-talk-form .g-recaptcha,
  #dgsTalkPopup .dgs-talk-form .ff-el-recaptcha {
    transform: scale(.92) !important;
    transform-origin: left top !important;
    margin-bottom: -22px !important;
  }
}


/* DGS Popup v3 hard fixes: select dropdown visibility + remove all accent artifacts */
#dgsTalkPopup,
#dgsTalkPopup * {
  scrollbar-width: none !important;
}

@media (min-width: 768px) {
  #dgsTalkPopup,
  #dgsTalkPopup .dgs-talk-box,
  #dgsTalkPopup .dgs-talk-body,
  #dgsTalkPopup .dgs-talk-form,
  #dgsTalkPopup .fluentform,
  #dgsTalkPopup form {
    overflow: visible !important;
  }

  #dgsTalkPopup ::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
  }
}

@media (max-width: 767px) {
  #dgsTalkPopup .dgs-talk-box {
    scrollbar-width: thin !important;
  }
}

#dgsTalkPopup .dgs-talk-box,
#dgsTalkPopup .dgs-talk-head {
  border-top-color: rgba(255,255,255,.10) !important;
  box-shadow: 0 34px 100px rgba(0,0,0,.72) !important;
}

#dgsTalkPopup .dgs-talk-box::before,
#dgsTalkPopup .dgs-talk-box::after,
#dgsTalkPopup .dgs-talk-head::before,
#dgsTalkPopup .dgs-talk-head::after {
  content: none !important;
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-kicker::before {
  background: rgba(255,255,255,.45) !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-title span {
  color: #fff !important;
}

#dgsTalkPopup .dgs-talk-form select,
#dgsTalkPopup .dgs-talk-form select.ff-el-form-control {
  color: #ffffff !important;
  background-color: rgba(255,255,255,.055) !important;
  background-image: none !important;
  -webkit-text-fill-color: #ffffff !important;
  appearance: auto !important;
  -webkit-appearance: menulist !important;
}

#dgsTalkPopup .dgs-talk-form select option,
#dgsTalkPopup .dgs-talk-form select optgroup {
  color: #111111 !important;
  background-color: #ffffff !important;
  -webkit-text-fill-color: #111111 !important;
}

#dgsTalkPopup .dgs-talk-form select option:checked,
#dgsTalkPopup .dgs-talk-form select option:hover,
#dgsTalkPopup .dgs-talk-form select option:focus {
  color: #ffffff !important;
  background-color: #FD5C62 !important;
  -webkit-text-fill-color: #ffffff !important;
}

#dgsTalkPopup .dgs-talk-form .ff-el-input--content,
#dgsTalkPopup .dgs-talk-form .ff-el-form-check,
#dgsTalkPopup .dgs-talk-form .ff-el-form-check-label {
  color: rgba(255,255,255,.82) !important;
}

#dgsTalkPopup .dgs-talk-form .ff-el-form-control:disabled,
#dgsTalkPopup .dgs-talk-form .ff-el-form-control[readonly] {
  color: rgba(255,255,255,.70) !important;
  -webkit-text-fill-color: rgba(255,255,255,.70) !important;
}

/* Keep captcha visible without forcing the popup to scroll on desktop */
@media (min-width: 768px) {
  #dgsTalkPopup .dgs-talk-box {
    width: min(92vw, 660px) !important;
  }

  #dgsTalkPopup .dgs-talk-form .g-recaptcha,
  #dgsTalkPopup .dgs-talk-form .ff-el-recaptcha,
  #dgsTalkPopup .dgs-talk-form .cf-turnstile {
    transform: none !important;
    transform-origin: left top !important;
  }
}


/* DGS Popup v4: no page overlay background + hard select/dropdown visibility override */
#dgsTalkPopup {
  background: transparent !important;
  pointer-events: none !important;
  padding: 18px !important;
}

#dgsTalkPopup.is-open {
  pointer-events: auto !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#dgsTalkPopup .dgs-talk-box {
  background: rgba(8,8,8,.98) !important;
  box-shadow: 0 32px 90px rgba(0,0,0,.72) !important;
  border-color: rgba(255,255,255,.14) !important;
}

/* Remove remaining red/orange decorative artifacts from popup top area */
#dgsTalkPopup .dgs-talk-kicker::before {
  display: none !important;
  content: none !important;
}

#dgsTalkPopup .dgs-talk-title span {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* Keep desktop popup clean with no visible inner scrollbar */
@media (min-width: 768px) {
  #dgsTalkPopup .dgs-talk-box {
    width: min(92vw, 620px) !important;
    max-height: calc(100vh - 36px) !important;
    overflow: hidden !important;
  }

  #dgsTalkPopup .dgs-talk-head {
    position: relative !important;
  }

  #dgsTalkPopup .dgs-talk-body {
    max-height: calc(100vh - 250px) !important;
    overflow: visible !important;
  }
}

/* Hard override for theme/plugin dropdown colors */
body #dgsTalkPopup .dgs-talk-form select,
body #dgsTalkPopup .dgs-talk-form select.ff-el-form-control,
body #dgsTalkPopup .dgs-talk-form .ff-el-form-control[type="select"],
body #dgsTalkPopup .dgs-talk-form .ff-el-input--content select,
body #dgsTalkPopup .fluentform select,
body #dgsTalkPopup form select {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #151515 !important;
  background-color: #151515 !important;
  background-image: none !important;
  border-color: rgba(255,255,255,.18) !important;
  text-shadow: none !important;
  forced-color-adjust: none !important;
  opacity: 1 !important;
}

body #dgsTalkPopup .dgs-talk-form select option,
body #dgsTalkPopup .dgs-talk-form select optgroup,
body #dgsTalkPopup .dgs-talk-form .ff-el-form-control option,
body #dgsTalkPopup .fluentform select option,
body #dgsTalkPopup form select option,
body #dgsTalkPopup option {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #111111 !important;
  background-color: #111111 !important;
  text-shadow: none !important;
  forced-color-adjust: none !important;
  opacity: 1 !important;
}

body #dgsTalkPopup .dgs-talk-form select option:checked,
body #dgsTalkPopup .dgs-talk-form select option:hover,
body #dgsTalkPopup .dgs-talk-form select option:focus,
body #dgsTalkPopup .dgs-talk-form select option:active,
body #dgsTalkPopup option:checked,
body #dgsTalkPopup option:hover {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #FD5C62 !important;
  background-color: #FD5C62 !important;
}

/* Fluent Forms can add select2/nice-select wrappers depending on settings */
body #dgsTalkPopup .select2-container,
body #dgsTalkPopup .select2-dropdown,
body #dgsTalkPopup .select2-results,
body #dgsTalkPopup .select2-results__options,
body #dgsTalkPopup .nice-select,
body #dgsTalkPopup .nice-select .list {
  background: #111111 !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,.18) !important;
  z-index: 2147483647 !important;
}

body #dgsTalkPopup .select2-results__option,
body #dgsTalkPopup .nice-select .option {
  background: #111111 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

body #dgsTalkPopup .select2-results__option--highlighted,
body #dgsTalkPopup .select2-results__option[aria-selected="true"],
body #dgsTalkPopup .nice-select .option:hover,
body #dgsTalkPopup .nice-select .option.focus,
body #dgsTalkPopup .nice-select .option.selected {
  background: #FD5C62 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* Mobile remains scrollable only when needed */
@media (max-width: 767px) {
  #dgsTalkPopup {
    padding: 8px !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    max-height: 92vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }

  #dgsTalkPopup .dgs-talk-body {
    max-height: none !important;
  }
}


/* === DGS POPUP HARD OVERRIDES - no overlay background, no desktop internal scrollbar, fixed select dropdown === */
#dgsTalkPopup {
  background: transparent !important;
  pointer-events: none !important;
}

#dgsTalkPopup.is-open {
  pointer-events: auto !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
}

#dgsTalkPopup .dgs-talk-box {
  max-height: none !important;
  overflow: visible !important;
  width: min(100%, 560px) !important;
  background: #080808 !important;
}

#dgsTalkPopup .dgs-talk-box::before,
#dgsTalkPopup .dgs-talk-kicker::before {
  content: none !important;
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-kicker {
  gap: 0 !important;
}

#dgsTalkPopup .dgs-talk-head {
  position: relative !important;
  top: auto !important;
  background: #080808 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#dgsTalkPopup .dgs-talk-form select,
#dgsTalkPopup .dgs-talk-form select.ff-el-form-control,
#dgsTalkPopup .dgs-talk-form .ff-el-form-control[type="select"] {
  color: #ffffff !important;
  background-color: #171717 !important;
  background-image: none !important;
  -webkit-text-fill-color: #ffffff !important;
  appearance: auto !important;
  -webkit-appearance: auto !important;
}

#dgsTalkPopup .dgs-talk-form select option,
#dgsTalkPopup .dgs-talk-form select optgroup,
#dgsTalkPopup .dgs-talk-form .ff-el-form-control option {
  color: #111111 !important;
  background-color: #ffffff !important;
  -webkit-text-fill-color: #111111 !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
}

#dgsTalkPopup .dgs-talk-form select option:checked,
#dgsTalkPopup .dgs-talk-form select option:hover {
  color: #ffffff !important;
  background-color: #FD5C62 !important;
  -webkit-text-fill-color: #ffffff !important;
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    align-items: flex-end !important;
    padding: 8px !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    width: 100% !important;
    max-height: 92dvh !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #dgsTalkPopup .dgs-talk-head {
    position: sticky !important;
    top: 0 !important;
  }
}


/* === DGS FINAL POPUP SCROLL FIX ===
   Shows the full Fluent Form inside the popup with a branded gradient scrollbar.
   Keeps the page behind the popup untouched: no dark overlay, no blur background. */
#dgsTalkPopup {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  overflow: hidden !important;
  pointer-events: none !important;
  padding: 16px !important;
  align-items: flex-start !important;
  justify-content: center !important;
}

#dgsTalkPopup.is-open {
  pointer-events: auto !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
}

#dgsTalkPopup .dgs-talk-box {
  width: min(92vw, 640px) !important;
  max-height: calc(100dvh - 32px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: #080808 !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 22px !important;
  box-shadow: 0 32px 90px rgba(0,0,0,.72) !important;
  scrollbar-width: thin !important;
  scrollbar-color: #FD5C62 rgba(255,255,255,.08) !important;
  -webkit-overflow-scrolling: touch !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar {
  width: 10px !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar-track {
  background: rgba(255,255,255,.07) !important;
  border-radius: 999px !important;
  margin: 16px 0 !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #FD5C62 0%, #E91E8C 52%, #FF6B35 100%) !important;
  border-radius: 999px !important;
  border: 2px solid #080808 !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FF6B35 0%, #E91E8C 52%, #FD5C62 100%) !important;
}

#dgsTalkPopup .dgs-talk-head {
  position: sticky !important;
  top: 0 !important;
  z-index: 5 !important;
  background: #080808 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#dgsTalkPopup .dgs-talk-body {
  max-height: none !important;
  overflow: visible !important;
}

#dgsTalkPopup .dgs-talk-box::before,
#dgsTalkPopup .dgs-talk-box::after,
#dgsTalkPopup .dgs-talk-head::before,
#dgsTalkPopup .dgs-talk-head::after,
#dgsTalkPopup .dgs-talk-kicker::before {
  content: none !important;
  display: none !important;
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
}

#dgsTalkPopup .dgs-talk-kicker {
  gap: 0 !important;
}

/* Theme/plugin select dropdown visibility override */
body #dgsTalkPopup .dgs-talk-form select,
body #dgsTalkPopup .dgs-talk-form select.ff-el-form-control,
body #dgsTalkPopup .dgs-talk-form .ff-el-input--content select,
body #dgsTalkPopup .fluentform select,
body #dgsTalkPopup form select {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #171717 !important;
  background-color: #171717 !important;
  background-image: none !important;
  border-color: rgba(255,255,255,.18) !important;
  opacity: 1 !important;
  appearance: auto !important;
  -webkit-appearance: auto !important;
}

body #dgsTalkPopup .dgs-talk-form select option,
body #dgsTalkPopup .dgs-talk-form select optgroup,
body #dgsTalkPopup .dgs-talk-form .ff-el-form-control option,
body #dgsTalkPopup .fluentform select option,
body #dgsTalkPopup form select option,
body #dgsTalkPopup option {
  color: #111111 !important;
  -webkit-text-fill-color: #111111 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  opacity: 1 !important;
}

body #dgsTalkPopup .dgs-talk-form select option:checked,
body #dgsTalkPopup .dgs-talk-form select option:hover,
body #dgsTalkPopup option:checked,
body #dgsTalkPopup option:hover {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #FD5C62 !important;
  background-color: #FD5C62 !important;
}

/* ReCAPTCHA / Turnstile stays visible inside the scrollable popup */
#dgsTalkPopup .dgs-talk-form .g-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-hcaptcha,
#dgsTalkPopup .dgs-talk-form .cf-turnstile,
#dgsTalkPopup .dgs-talk-form iframe[src*="recaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="hcaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="challenges.cloudflare"] {
  max-width: 100% !important;
  position: relative !important;
  z-index: 6 !important;
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    align-items: flex-end !important;
    padding: 8px !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    width: 100% !important;
    max-height: 92dvh !important;
    border-radius: 20px !important;
  }

  #dgsTalkPopup .dgs-talk-box::-webkit-scrollbar {
    width: 7px !important;
  }
}` }} />
      <div dangerouslySetInnerHTML={{ __html: `<div id="dgsNav"><nav id="dgsBar">
<a href="https://www.dgeniussolutions.com/" id="dgsLogo">
<img width="117" height="117" src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/DGS-LOGO-3.webp" alt="D'Genius Solutions" loading="eager">
</a><div id="dgsRight">
<a href="#" id="dgsPill" class="dgs-talk-trigger">
<svg viewBox="0 0 14 14"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg>
Let's Talk
</a><div id="dgsTrig"
onclick="dgsToggle()"
role="button"
tabindex="0"
onkeydown="if(event.key==='Enter'||event.key===' ')dgsToggle()"
style="background:transparent;background-color:transparent;background-image:none;border:1px solid rgba(255,255,255,0.22);border-radius:100px;padding:10px 18px;cursor:pointer;display:flex;align-items:center;gap:10px;box-shadow:none;outline:none;"><div id="dgsLines">
<em></em><em></em><em></em></div>
<span id="dgsTrigLabel">MENU</span></div></div></nav><div id="dgsOverlay"><div id="dgsPanel"><div id="dgsPanelBody"><div id="dgsLinks"><div class="dg-item">
<a href="https://www.dgeniussolutions.com/" class="dg-row dg-nl">
<span class="dg-lbl">Home</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>AI Marketing Agency •&nbsp;</span><span>Digital Excellence •&nbsp;</span><span>Mumbai Based •&nbsp;</span><span>Founded 2021 •&nbsp;</span><span>AI Marketing Agency •&nbsp;</span><span>Digital Excellence •&nbsp;</span><span>Mumbai Based •&nbsp;</span><span>Founded 2021 •&nbsp;</span></div></div></div><div class="dg-item">
<a href="https://www.dgeniussolutions.com/about-us/" class="dg-row dg-nl">
<span class="dg-lbl">About Us</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>Sneha & Kohin Bellara •&nbsp;</span><span>Tribe of Creators •&nbsp;</span><span>Strategists •&nbsp;</span><span>Tech Enthusiasts •&nbsp;</span><span>Sneha & Kohin Bellara •&nbsp;</span><span>Tribe of Creators •&nbsp;</span><span>Strategists •&nbsp;</span><span>Tech Enthusiasts •&nbsp;</span></div></div></div><div class="dg-item" id="dgsSvcItem"><div class="dg-row" onclick="dgsSvc()" role="button" tabindex="0" onkeydown="if(event.key==='Enter')dgsSvc()" style="cursor:pointer;background:none;border:none;width:100%;outline:none;">
<span class="dg-lbl">Our Services</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M2 4l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><div class="dg-mq"><div class="dg-mq-t"><span>AI Video Production •&nbsp;</span><span>SEO •&nbsp;</span><span>AEO •&nbsp;</span><span>GEO •&nbsp;</span><span>LLM SEO •&nbsp;</span><span>Social Media •&nbsp;</span><span>Performance Marketing •&nbsp;</span><span>Web Dev •&nbsp;</span><span>Branding •&nbsp;</span><span>Content •&nbsp;</span><span>AI Video Production •&nbsp;</span><span>SEO •&nbsp;</span><span>AEO •&nbsp;</span><span>GEO •&nbsp;</span><span>LLM SEO •&nbsp;</span><span>Social Media •&nbsp;</span><span>Performance Marketing •&nbsp;</span><span>Web Dev •&nbsp;</span><span>Branding •&nbsp;</span><span>Content •&nbsp;</span></div></div><div class="dg-sub" id="dgsSub">
<a href="https://www.dgeniussolutions.com/services/ai-video-production-agency/" class="dg-nl">AI Video Production</a>
<a href="https://www.dgeniussolutions.com/services/seo-services-in-mumbai/" class="dg-nl">SEO</a>
<a href="https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/" class="dg-nl">AEO</a>
<a href="https://www.dgeniussolutions.com/services/geo/" class="dg-nl">GEO</a>
<a href="https://www.dgeniussolutions.com/services/llm-seo-service/" class="dg-nl">LLM SEO</a>
<a href="https://www.dgeniussolutions.com/services/social-media-marketing/" class="dg-nl">Social Media</a>
<a href="https://www.dgeniussolutions.com/services/performance-marketing/" class="dg-nl">Performance Marketing</a>
<a href="https://www.dgeniussolutions.com/services/website-development-amc/" class="dg-nl">Website Dev</a>
<a href="https://www.dgeniussolutions.com/services/branding/" class="dg-nl">Branding</a>
<a href="https://www.dgeniussolutions.com/services/content-creation/" class="dg-nl">Content Creation</a></div></div><div class="dg-item">
<a href="https://www.dgeniussolutions.com/portfolio/" class="dg-row dg-nl">
<span class="dg-lbl">Portfolio</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>200+ Brands •&nbsp;</span><span>Our Best Work •&nbsp;</span><span>Case Studies •&nbsp;</span><span>Proven Results •&nbsp;</span><span>200+ Brands •&nbsp;</span><span>Our Best Work •&nbsp;</span><span>Case Studies •&nbsp;</span><span>Proven Results •&nbsp;</span></div></div></div><div class="dg-item">
<a href="https://www.dgeniussolutions.com/case_studies/" class="dg-row dg-nl">
<span class="dg-lbl">Case Studies</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>Real Results •&nbsp;</span><span>Client Success Stories •&nbsp;</span><span>SEO • AEO • GEO •&nbsp;</span><span>AI Video Production •&nbsp;</span><span>Website Development •&nbsp;</span><span>Real Results •&nbsp;</span><span>Client Success Stories •&nbsp;</span><span>SEO • AEO • GEO •&nbsp;</span><span>AI Video Production •&nbsp;</span><span>Website Development •&nbsp;</span></div></div></div><div class="dg-item">
<a href="https://www.dgeniussolutions.com/blogs/" class="dg-row dg-nl">
<span class="dg-lbl">Blogs</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>Insights •&nbsp;</span><span>AI Strategy •&nbsp;</span><span>SEO Tips •&nbsp;</span><span>Marketing Ideas •&nbsp;</span><span>Insights •&nbsp;</span><span>AI Strategy •&nbsp;</span><span>SEO Tips •&nbsp;</span><span>Marketing Ideas •&nbsp;</span></div></div></div><div class="dg-item">
<a href="https://www.dgeniussolutions.com/career/" class="dg-row dg-nl">
<span class="dg-lbl">Careers</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>Join The Tribe •&nbsp;</span><span>We're Hiring •&nbsp;</span><span>Creative Minds •&nbsp;</span><span>Grow With Us •&nbsp;</span><span>Join The Tribe •&nbsp;</span><span>We're Hiring •&nbsp;</span><span>Creative Minds •&nbsp;</span><span>Grow With Us •&nbsp;</span></div></div></div><div class="dg-item">
<a href="https://www.dgeniussolutions.com/contact-us/" class="dg-row dg-nl">
<span class="dg-lbl">Contact Us</span><div class="dg-badge"><svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H5M13 1v8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
</a><div class="dg-mq"><div class="dg-mq-t"><span>Let's Build Together •&nbsp;</span><span>Every Project Starts With A Conversation •&nbsp;</span><span>Let's Build Together •&nbsp;</span><span>Every Project Starts With A Conversation •&nbsp;</span></div></div></div></div><div id="dgsInfo"><div><div class="dg-ib">
<span class="dg-lbl2">Reach Us</span>
<a href="tel:+919987922901" class="dg-cl">+91 99879 22901</a>
<a href="tel:+918591950238" class="dg-cl">+91 85919 50238</a>
<a href="mailto:business@dgeniussolutions.com" class="dg-cl">business@dgeniussolutions.com</a></div><div class="dg-ib">
<span class="dg-lbl2">The Digital Lab</span><p class="dg-addr">Unit 202, Amore Edge,<br>Swami Vivekanand Rd,<br>Khar West, Mumbai 400052</p></div><div class="dg-ib">
<span class="dg-lbl2">Follow Us</span><div class="dg-socrow">
<a href="https://www.linkedin.com/company/d-genius-solutions/" class="dg-soc" target="_blank" rel="noopener">LinkedIn</a>
<a href="https://www.instagram.com/dgeniussolutions/" class="dg-soc" target="_blank" rel="noopener">Instagram</a>
<a href="https://www.facebook.com/DGeniussolutions/" class="dg-soc" target="_blank" rel="noopener">Facebook</a>
<a href="https://www.youtube.com/@dgeniussolutionspvtltd4060" class="dg-soc" target="_blank" rel="noopener">YouTube</a>
<a href="https://in.pinterest.com/dgeniussolutions/" class="dg-soc" target="_blank" rel="noopener">Pinterest</a></div></div></div><a href="#" id="dgsCtaBtn" class="dgs-talk-trigger">
<svg viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke-linecap="round" stroke-linejoin="round"/></svg>
Start a Project
</a></div></div><div id="dgsFoot">
<span>© 2026 D'Genius Solutions. All Rights Reserved.</span><div class="dg-fl">
<a href="https://www.dgeniussolutions.com/privacy-policy/">Privacy Policy</a>
<a href="https://www.dgeniussolutions.com/sitemap/">Sitemap</a></div></div></div></div></div><div id="dgsTalkPopup" aria-hidden="true"><div class="dgs-talk-backdrop" data-dgs-talk-close></div><div class="dgs-talk-box" role="dialog" aria-modal="true" aria-labelledby="dgsTalkTitle"><div class="dgs-talk-head">
<button class="dgs-talk-close" type="button" aria-label="Close popup" data-dgs-talk-close>×</button><div class="dgs-talk-kicker">Start a Conversation</div><div class="dgs-talk-title" id="dgsTalkTitle">Let's Talk <span>Growth</span></div><p class="dgs-talk-subtitle">Tell us what you want to build, improve, or scale. Our team will get back with the next best step.</p></div><div class="dgs-talk-body"><div class="dgs-talk-form"><div class='fluentform ff-default fluentform_wrapper_1 ffs_default_wrap'><form data-form_id="1" id="fluentform_1" class="frm-fluent-form fluent_form_1 ff-el-form-top ff_form_instance_1_1 ff-form-loading ffs_default" data-form_instance="ff_form_instance_1_1" method="POST" ><fieldset  style="border: none!important;margin: 0!important;padding: 0!important;background-color: transparent!important;box-shadow: none!important;outline: none!important; min-inline-size: 100%;"><legend class="ff_screen_reader_title" style="display: block; margin: 0!important;padding: 0!important;height: 0!important;text-indent: -999999px;width: 0!important;overflow:hidden;">Home Page Form</legend><input type='hidden' name='__fluent_form_embded_post_id' value='63505' /><input type="hidden" id="_fluentform_1_fluentformnonce" name="_fluentform_1_fluentformnonce" value="dfa1cac356" /><input type="hidden" name="_wp_http_referer" value="/?utm_source=openai" /><div data-type="name-element" data-name="names" class=" ff-field_container ff-name-field-wrapper" ><div class='ff-t-container'><div class='ff-t-cell '><div class='ff-el-group ff-el-form-top'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_names_first_name_' id='label_ff_1_names_first_name_' >Full Name</label></div><div class='ff-el-input--content'><input type="text" name="names[first_name]" id="ff_1_names_first_name_" class="ff-el-form-control" placeholder="Enter Your First Name" aria-invalid="false" aria-required=true></div></div></div></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_email' id='label_ff_1_email' aria-label="Email">Email</label></div><div class='ff-el-input--content'><input type="email" name="email" id="ff_1_email" class="ff-el-form-control" placeholder="Email Address" data-name="email"  aria-invalid="false" aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_phone' id='label_ff_1_phone' aria-label="Phone/Mobile">Phone/Mobile</label></div><div class='ff-el-input--content'><input name="phone" class="ff-el-form-control ff-el-phone" type="tel" placeholder="Mobile Number" data-name="phone" id="ff_1_phone" inputmode="tel"  aria-invalid='false' aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_input_text' id='label_ff_1_input_text' aria-label="Company Name">Company Name</label></div><div class='ff-el-input--content'><input type="text" name="input_text" class="ff-el-form-control" data-name="input_text" id="ff_1_input_text"  aria-invalid="false" aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_dropdown_1' id='label_ff_1_dropdown_1' aria-label="How did you hear about us ?">How did you hear about us ?</label></div><div class='ff-el-input--content'><select name="dropdown_1" id="ff_1_dropdown_1" class="ff-el-form-control" data-name="dropdown_1" data-calc_value="0"  aria-invalid="false" aria-required="true" aria-labelledby="label_ff_1_dropdown_1"><option value="">- Select -</option><option value="Google Ads"  >Google Ads</option><option value="Google Search"  >Google Search</option><option value="Friend / Colleague"  >Friend / Colleague</option><option value="Twitter"  >Twitter</option><option value="Youtube"  >Youtube</option><option value="Instagram"  >Instagram</option><option value="Facebook"  >Facebook</option><option value="LinkedIn"  >LinkedIn</option><option value="Podcast"  >Podcast</option><option value="Blog / Article"  >Blog / Article</option><option value="Other"  >Other</option></select></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_subject' id='label_ff_1_subject' aria-label="Subject">Subject</label></div><div class='ff-el-input--content'><input type="text" name="subject" class="ff-el-form-control" placeholder="Subject" data-name="subject" id="ff_1_subject"  aria-invalid="false" aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_dropdown' id='label_ff_1_dropdown' aria-label="Service">Service</label></div><div class='ff-el-input--content'><select name="dropdown" id="ff_1_dropdown" class="ff-el-form-control" data-name="dropdown" data-calc_value="0"  aria-invalid="false" aria-required="true" aria-labelledby="label_ff_1_dropdown"><option value="">- Select -</option><option value="Generative AI"  >Generative AI</option><option value="GEO"  >GEO</option><option value="Search Engine Optimization"  >Search Engine Optimization</option><option value="AEO "  >AEO</option><option value="Social Media Marketing"  >Social Media Marketing</option><option value="Website Design &amp; Development"  >Website Design & Development</option><option value="Content Writing"  >Content Writing</option><option value="Blog Writing"  >Blog Writing</option><option value="Graphic Designing"  >Graphic Designing</option><option value="Influencer Marketing"  >Influencer Marketing</option><option value="Branding"  >Branding</option><option value="Employer Branding"  >Employer Branding</option><option value="LinkedIn Marketing"  >LinkedIn Marketing</option><option value="Video Production"  >Video Production</option><option value="LLM"  >LLM</option></select></div></div><div class='ff-el-group'><div class="ff-el-input--label asterisk-right"><label for='ff_1_message' id='label_ff_1_message' aria-label="Your Message">Your Message</label></div><div class='ff-el-input--content'><textarea aria-required="false" aria-labelledby="label_ff_1_message" name="message" id="ff_1_message" class="ff-el-form-control" placeholder="Your Message" rows="4" cols="2" data-name="message" ></textarea></div></div><input type="hidden" name="Home_Page" data-name="Home_Page" ><div class='ff-el-group ' ><div class='ff-el-input--content'><div data-fluent_id='1' name='g-recaptcha-response'><div
data-sitekey='6LfK6VgsAAAAAFeLVFPu7qFDLc4phIeAPApUFy-k'
id='fluentform-recaptcha-1-1'
class='ff-el-recaptcha g-recaptcha'
data-callback='fluentFormrecaptchaSuccessCallback'></div></div></div></div><input type="hidden" name="Home_Page_form" data-name="Home_Page_form" ><div class='ff-el-group ff-text-left ff_submit_btn_wrapper'><button type="submit" class="ff-btn ff-btn-submit ff-btn-md ff_btn_style"  aria-label="Submit Form">Submit Form</button></div></fieldset></form><div id='fluentform_1_errors' class='ff-errors-in-stack ff_form_instance_1_1 ff-form-loading_errors ff_form_instance_1_1_errors'></div></div> <script type="text/javascript" src="data:text/javascript;base64,d2luZG93LmZsdWVudF9mb3JtX2ZmX2Zvcm1faW5zdGFuY2VfMV8xPXsiaWQiOiIxIiwiYWpheFVybCI6Imh0dHBzOlwvXC93d3cuZGdlbml1c3NvbHV0aW9ucy5jb21cL3dwLWFkbWluXC9hZG1pbi1hamF4LnBocCIsInNldHRpbmdzIjp7ImxheW91dCI6eyJsYWJlbFBsYWNlbWVudCI6InRvcCIsImhlbHBNZXNzYWdlUGxhY2VtZW50Ijoid2l0aF9sYWJlbCIsImVycm9yTWVzc2FnZVBsYWNlbWVudCI6ImlubGluZSIsImNzc0NsYXNzTmFtZSI6IiIsImFzdGVyaXNrUGxhY2VtZW50IjoiYXN0ZXJpc2stcmlnaHQifSwicmVzdHJpY3Rpb25zIjp7ImRlbnlFbXB0eVN1Ym1pc3Npb24iOnsiZW5hYmxlZCI6ITF9fX0sImZvcm1faW5zdGFuY2UiOiJmZl9mb3JtX2luc3RhbmNlXzFfMSIsImZvcm1faWRfc2VsZWN0b3IiOiJmbHVlbnRmb3JtXzEiLCJydWxlcyI6eyJuYW1lc1tmaXJzdF9uYW1lXSI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITAsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMH19LCJuYW1lc1ttaWRkbGVfbmFtZV0iOnsicmVxdWlyZWQiOnsidmFsdWUiOiExLCJtZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbF9tZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbCI6ITB9fSwibmFtZXNbbGFzdF9uYW1lXSI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITEsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMH19LCJlbWFpbCI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITAsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMSwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIn0sImVtYWlsIjp7InZhbHVlIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgbXVzdCBjb250YWluIGEgdmFsaWQgZW1haWwiLCJnbG9iYWwiOiExLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgbXVzdCBjb250YWluIGEgdmFsaWQgZW1haWwifX0sInBob25lIjp7InJlcXVpcmVkIjp7InZhbHVlIjohMCwiZ2xvYmFsIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQifSwidmFsaWRfcGhvbmVfbnVtYmVyIjp7InZhbHVlIjohMSwiZ2xvYmFsIjohMCwibWVzc2FnZSI6IlBob25lIG51bWJlciBpcyBub3QgdmFsaWQiLCJnbG9iYWxfbWVzc2FnZSI6IlBob25lIG51bWJlciBpcyBub3QgdmFsaWQifX0sImlucHV0X3RleHQiOnsicmVxdWlyZWQiOnsidmFsdWUiOiEwLCJtZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbF9tZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbCI6ITB9fSwiZHJvcGRvd25fMSI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITAsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMH19LCJzdWJqZWN0Ijp7InJlcXVpcmVkIjp7InZhbHVlIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWwiOiExLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQifX0sImRyb3Bkb3duIjp7InJlcXVpcmVkIjp7InZhbHVlIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWwiOiEwfX0sIm1lc3NhZ2UiOnsicmVxdWlyZWQiOnsidmFsdWUiOiExLCJtZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbCI6ITEsImdsb2JhbF9tZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCJ9fSwiZy1yZWNhcHRjaGEtcmVzcG9uc2UiOltdfSwiZGVib3VuY2VfdGltZSI6MzAwLCJmaWxlX3VwbG9hZF9zZXR0aW5ncyI6W119" defer></script> </div></div></div></div> <script src="data:text/javascript;base64,d2luZG93LmRnc1Njcm9sbFk9MDt3aW5kb3cuZGdzTG9ja1Njcm9sbD1mdW5jdGlvbigpe3dpbmRvdy5kZ3NTY3JvbGxZPXdpbmRvdy5zY3JvbGxZfHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wfHwwO2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5vdmVyZmxvdz0naGlkZGVuJztkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93PSdoaWRkZW4nO2RvY3VtZW50LmJvZHkuc3R5bGUucG9zaXRpb249J2ZpeGVkJztkb2N1bWVudC5ib2R5LnN0eWxlLnRvcD0nLScrd2luZG93LmRnc1Njcm9sbFkrJ3B4Jztkb2N1bWVudC5ib2R5LnN0eWxlLmxlZnQ9JzAnO2RvY3VtZW50LmJvZHkuc3R5bGUucmlnaHQ9JzAnO2RvY3VtZW50LmJvZHkuc3R5bGUud2lkdGg9JzEwMCUnfTt3aW5kb3cuZGdzVW5sb2NrU2Nyb2xsPWZ1bmN0aW9uKCl7dmFyIHk9d2luZG93LmRnc1Njcm9sbFl8fDA7ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLm92ZXJmbG93PScnO2RvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3c9Jyc7ZG9jdW1lbnQuYm9keS5zdHlsZS5wb3NpdGlvbj0nJztkb2N1bWVudC5ib2R5LnN0eWxlLnRvcD0nJztkb2N1bWVudC5ib2R5LnN0eWxlLmxlZnQ9Jyc7ZG9jdW1lbnQuYm9keS5zdHlsZS5yaWdodD0nJztkb2N1bWVudC5ib2R5LnN0eWxlLndpZHRoPScnO3dpbmRvdy5zY3JvbGxUbygwLHkpfTt3aW5kb3cuZGdzVG9nZ2xlPWZ1bmN0aW9uKCl7dmFyIG5hdj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGdzTmF2Jyk7dmFyIGxhYmVsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZ3NUcmlnTGFiZWwnKTtpZighbmF2KXJldHVybjt2YXIgb3BlbmluZz0hbmF2LmNsYXNzTGlzdC5jb250YWlucygnbmF2LW9wZW4nKTtuYXYuY2xhc3NMaXN0LnRvZ2dsZSgnbmF2LW9wZW4nLG9wZW5pbmcpO2lmKG9wZW5pbmcpe3dpbmRvdy5kZ3NMb2NrU2Nyb2xsKCl9ZWxzZXt3aW5kb3cuZGdzVW5sb2NrU2Nyb2xsKCl9CmlmKGxhYmVsKWxhYmVsLnRleHRDb250ZW50PW9wZW5pbmc/J0NMT1NFJzonTUVOVSd9O3dpbmRvdy5kZ3NTdmM9ZnVuY3Rpb24oKXt2YXIgaXRlbT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGdzU3ZjSXRlbScpO3ZhciBzdWI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rnc1N1YicpO2lmKCFpdGVtfHwhc3ViKXJldHVybjt2YXIgb3BlbmluZz0haXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ3N2Yy1vcGVuJyk7aXRlbS5jbGFzc0xpc3QudG9nZ2xlKCdzdmMtb3Blbicsb3BlbmluZyk7c3ViLmNsYXNzTGlzdC50b2dnbGUoJ29wZW4nLG9wZW5pbmcpfTtkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZnVuY3Rpb24oZSl7dmFyIGVsPWUudGFyZ2V0LmNsb3Nlc3QoJy5kZy1ubCcpO2lmKGVsKXt2YXIgbmF2PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZ3NOYXYnKTt2YXIgbGFiZWw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rnc1RyaWdMYWJlbCcpO2lmKG5hdiYmbmF2LmNsYXNzTGlzdC5jb250YWlucygnbmF2LW9wZW4nKSl7bmF2LmNsYXNzTGlzdC5yZW1vdmUoJ25hdi1vcGVuJyk7d2luZG93LmRnc1VubG9ja1Njcm9sbCgpfQppZihsYWJlbClsYWJlbC50ZXh0Q29udGVudD0nTUVOVSd9fSk7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsZnVuY3Rpb24oKXt2YXIgYmFyPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZ3NCYXInKTtpZihiYXIpYmFyLmNsYXNzTGlzdC50b2dnbGUoJ3Njcm9sbGVkJyx3aW5kb3cuc2Nyb2xsWT40MCk7fSx7cGFzc2l2ZTohMH0pO3dpbmRvdy5kZ3NPcGVuVGFsa1BvcHVwPWZ1bmN0aW9uKGV2ZW50KXtpZihldmVudClldmVudC5wcmV2ZW50RGVmYXVsdCgpO3ZhciBwb3B1cD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGdzVGFsa1BvcHVwJyk7dmFyIG5hdj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGdzTmF2Jyk7dmFyIGxhYmVsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZ3NUcmlnTGFiZWwnKTtpZighcG9wdXApcmV0dXJuO2lmKG5hdiYmbmF2LmNsYXNzTGlzdC5jb250YWlucygnbmF2LW9wZW4nKSl7bmF2LmNsYXNzTGlzdC5yZW1vdmUoJ25hdi1vcGVuJyk7aWYobGFiZWwpbGFiZWwudGV4dENvbnRlbnQ9J01FTlUnO3dpbmRvdy5kZ3NVbmxvY2tTY3JvbGwoKX0KcG9wdXAuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO3BvcHVwLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCdmYWxzZScpO2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkZ3MtdGFsay1wb3B1cC1hY3RpdmUnKTtkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2Rncy10YWxrLXBvcHVwLWFjdGl2ZScpO3ZhciBmaXJzdEZpZWxkPXBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0Jyk7aWYoZmlyc3RGaWVsZCl7c2V0VGltZW91dChmdW5jdGlvbigpe2ZpcnN0RmllbGQuZm9jdXMoKX0sMTgwKX19O3dpbmRvdy5kZ3NDbG9zZVRhbGtQb3B1cD1mdW5jdGlvbigpe3ZhciBwb3B1cD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGdzVGFsa1BvcHVwJyk7aWYoIXBvcHVwKXJldHVybjtwb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7cG9wdXAuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsJ3RydWUnKTtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZGdzLXRhbGstcG9wdXAtYWN0aXZlJyk7ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdkZ3MtdGFsay1wb3B1cC1hY3RpdmUnKX07ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmN0aW9uKGUpe3ZhciB0YWxrVHJpZ2dlcj1lLnRhcmdldC5jbG9zZXN0KCcuZGdzLXRhbGstdHJpZ2dlcicpO3ZhciB0YWxrQ2xvc2U9ZS50YXJnZXQuY2xvc2VzdCgnW2RhdGEtZGdzLXRhbGstY2xvc2VdJyk7aWYodGFsa1RyaWdnZXIpe3dpbmRvdy5kZ3NPcGVuVGFsa1BvcHVwKGUpfQppZih0YWxrQ2xvc2Upe3dpbmRvdy5kZ3NDbG9zZVRhbGtQb3B1cCgpfX0pO2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLGZ1bmN0aW9uKGUpe2lmKGUua2V5PT09J0VzY2FwZScpe3dpbmRvdy5kZ3NDbG9zZVRhbGtQb3B1cCgpO3ZhciBuYXY9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rnc05hdicpO3ZhciBsYWJlbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGdzVHJpZ0xhYmVsJyk7aWYobmF2JiZuYXYuY2xhc3NMaXN0LmNvbnRhaW5zKCduYXYtb3BlbicpKXtuYXYuY2xhc3NMaXN0LnJlbW92ZSgnbmF2LW9wZW4nKTt3aW5kb3cuZGdzVW5sb2NrU2Nyb2xsKCk7aWYobGFiZWwpbGFiZWwudGV4dENvbnRlbnQ9J01FTlUnfX19KQ==" defer></script> </div></div></header>` }} />
    </>
  );
}
