
'use client';

import React from 'react';

export default function Footer() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `/* ========================================
   FOOTER - LIGHTWEIGHT & SEXY DESIGN
   ======================================== */

.dgs-footer-wrapper * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dgs-footer-wrapper {
  position: relative;
  background: transparent;
  padding: 0;
  margin: 0;
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.dgs-footer {
  position: relative;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 40px) 0;
  color: #fff;
  overflow: hidden;
}

.dgs-footer-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.dgs-footer-grid {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: clamp(30px, 4vw, 40px);
  margin-bottom: clamp(40px, 5vw, 55px);
}

.dgs-footer-column {
  display: flex;
  flex-direction: column;
}

.dgs-footer-logo-column {
  max-width: 280px;
}

.dgs-footer-logo {
  display: block;
  width: clamp(130px, 15vw, 160px);
  height: auto;
  margin-bottom: 22px;
  transition: transform 0.4s ease;
  opacity: 0.95;
}

.dgs-footer-logo:hover {
  transform: scale(1.03);
  opacity: 1;
}

.dgs-footer-tagline {
  font-size: clamp(0.8rem, 1.2vw, 0.88rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;
  margin-top: 0;
  margin-bottom: 22px;
  line-height: 1.7;
}

.dgs-footer-column-title {
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: clamp(16px, 2vw, 20px);
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  width: fit-content;
}

.dgs-footer-column-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
  border-radius: 10px;
  opacity: 0.6;
}

.dgs-footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dgs-footer-link-item {
  margin-bottom: 8px;
}

.dgs-footer-link {
  display: inline-block;
  font-size: clamp(0.82rem, 1.2vw, 0.9rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
  letter-spacing: 0.3px;
}

.dgs-footer-link::before {
  content: '→';
  position: absolute;
  left: -18px;
  opacity: 0;
  color: #FF6B35;
  transition: all 0.3s ease;
  font-weight: 300;
}

.dgs-footer-link:hover {
  color: rgba(255, 255, 255, 0.95);
  padding-left: 18px;
}

.dgs-footer-link:hover::before {
  opacity: 1;
  left: 0;
}

.dgs-footer-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  font-size: clamp(0.82rem, 1.2vw, 0.9rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
}

.dgs-footer-contact-item div {
  text-align: left;
}

.dgs-footer-contact-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 3px;
  opacity: 1;
  background: transparent !important;
}

.dgs-footer-contact-icon path {
  fill: none !important;
  background: none !important;
}

.dgs-footer-contact-item strong {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
}

.dgs-footer-contact-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
  margin-bottom: 6px;
  font-weight: 300;
}

.dgs-footer-contact-link:hover {
  color: rgba(255, 255, 255, 0.95);
  padding-left: 6px;
}

.dgs-footer-map-container {
  margin-top: 12px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.5s ease;
  border-radius: 12px;
}

.dgs-footer-map-container.active {
  max-height: 350px;
  opacity: 1;
  margin-top: 16px;
}

.dgs-footer-map-container iframe {
  width: 100%;
  height: 300px;
  border: 0;
  border-radius: 12px;
  display: block;
}

.dgs-footer-address-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.dgs-footer-address-clickable:hover {
  color: rgba(255, 255, 255, 0.95);
}

.dgs-footer-address-clickable strong {
  position: relative;
  display: inline-block;
}

.dgs-footer-address-clickable strong::after {
  content: ' ↗';
  font-size: 0.85em;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.dgs-footer-address-clickable:hover strong::after {
  opacity: 1;
  transform: translateX(2px) translateY(-2px);
}

.dgs-footer-social {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 0;
}

.dgs-footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.4s ease;
}

.dgs-footer-social-link:hover {
  background: transparent;
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.15);
  color: rgba(255, 255, 255, 0.95);
}

.dgs-footer-social-icon {
  width: 18px;
  height: 18px;
}

.dgs-footer-stalk-box {
  margin-top: 18px;
  width: 100%;
}

.dgs-footer-stalk-title {
  font-size: clamp(0.82rem, 1.2vw, 0.92rem);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.3px;
  margin-bottom: 12px;
  line-height: 1.35;
}

.dgs-footer-contact-column .dgs-footer-social {
  justify-content: flex-start;
}

.dgs-footer-contact-column .dgs-footer-social-link {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.035);
}

/* AI Summary Shortcut Icons - Latest Brand Icons */
.dgs-footer-ai-summary {
  margin: 0 0 22px;
  width: 100%;
}

.dgs-footer-ai-heading {
  font-size: clamp(0.76rem, 1.1vw, 0.84rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.25px;
  margin-bottom: 10px;
  line-height: 1.45;
}

.dgs-footer-ai-icons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dgs-footer-ai-link {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.065);
  text-decoration: none;
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dgs-footer-ai-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(255, 0, 220, 0.14), rgba(255, 107, 53, 0.18));
  opacity: 0;
  transition: opacity 0.35s ease;
}

.dgs-footer-ai-link:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 107, 53, 0.55);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.18);
}

.dgs-footer-ai-link:hover::before {
  opacity: 1;
}

.dgs-footer-ai-icon {
  position: relative;
  z-index: 1;
  width: 19px;
  height: 19px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.22));
}

.dgs-footer-ai-fallback {
  position: relative;
  z-index: 1;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.2px;
}

.dgs-ai-prompt-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%) translateY(20px);
  z-index: 999999;
  max-width: min(92vw, 420px);
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(10, 10, 14, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.82rem;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease, transform 0.28s ease;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dgs-ai-prompt-toast.active {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}


.dgs-footer-ai-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 0 clamp(32px, 4vw, 45px);
  padding: 16px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.11);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.18);
}

.dgs-footer-ai-top .dgs-footer-ai-heading {
  margin-bottom: 0;
  text-align: center;
}


.dgs-footer-trust-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 22px;
}

.dgs-footer-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  max-width: 100%;
  min-height: 58px;
  padding: 9px 14px 9px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  transition: all 0.35s ease;
}

.dgs-footer-trust-badge:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.45);
  box-shadow: 0 12px 30px rgba(255, 107, 53, 0.18);
}

.dgs-footer-trust-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 42px;
  padding: 4px 6px;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
  flex-shrink: 0;
}

.dgs-footer-trust-logo-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dgs-footer-trust-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.15;
  text-align: left;
}

.dgs-footer-trust-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 0.2px;
  margin-bottom: 3px;
}

.dgs-footer-trust-stars {
  font-size: 0.82rem;
  font-weight: 500;
  color: #ff6b35;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}

.dgs-footer-trust-subtext {
  font-size: 0.68rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.58);
  letter-spacing: 0.25px;
}

.dgs-footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(20px, 3vw, 28px) 0;
  text-align: center;
}

.dgs-footer-copyright {
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.dgs-footer-copyright-gradient {
  background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientSlideFooter 8s linear infinite;
  font-weight: 400;
}

.dgs-footer-legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.dgs-footer-legal-link {
  font-size: clamp(0.75rem, 1.2vw, 0.82rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.dgs-footer-legal-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.dgs-footer-legal-divider {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 300;
}

@keyframes gradientSlideFooter {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@media (max-width: 1100px) {
  .dgs-footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(28px, 4vw, 35px);
  }

  .dgs-footer-trust-badges {
    justify-content: center;
  }

  .dgs-footer-logo-column {
    grid-column: 1 / -1;
    max-width: 100%;
    text-align: center;
    align-items: center;
  }

  .dgs-footer-logo {
    margin-left: auto;
    margin-right: auto;
  }

  .dgs-footer-social {
    justify-content: center;
  }

  .dgs-footer-ai-summary {
    text-align: center;
  }

  .dgs-footer-ai-icons {
    justify-content: center;
  }
}

@media (max-width: 968px) {
  .dgs-footer {
    padding: clamp(50px, 7vw, 70px) clamp(20px, 4vw, 30px) 0 !important;
  }

  .dgs-footer-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
  }

  .dgs-footer-column {
    text-align: center;
    align-items: center;
  }

  .dgs-footer-column-title::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .dgs-footer-link::before {
    display: none;
  }

  .dgs-footer-link:hover {
    padding-left: 0;
  }

  .dgs-footer-contact-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  .dgs-footer-contact-item div {
    text-align: center;
  }

  .dgs-footer-contact-icon {
    margin-top: 0;
  }

  .dgs-footer-social {
    justify-content: center;
  }
}


  .dgs-footer-contact-column .dgs-footer-social {
    justify-content: center;
  }

  .dgs-footer-stalk-box {
    text-align: center;
  }

@media (max-width: 580px) {
  .dgs-footer {
    padding: 45px 20px 0 !important;
  }

  .dgs-footer-trust-badges {
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .dgs-footer-trust-badge {
    padding: 9px 12px 9px 9px;
    gap: 10px;
  }

  .dgs-footer-trust-logo-wrap {
    width: 68px;
    height: 40px;
  }

  .dgs-footer-trust-title {
    font-size: 0.74rem;
  }

  .dgs-footer-trust-stars {
    font-size: 0.78rem;
  }

  .dgs-footer-trust-subtext {
    font-size: 0.64rem;
  }

  .dgs-footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .dgs-footer-legal-links {
    flex-direction: column;
    gap: 10px;
  }

  .dgs-footer-legal-divider {
    display: none;
  }



  .dgs-footer-ai-top {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 30px;
    padding: 16px;
  }
  .dgs-footer-map-container iframe {
    height: 250px;
  }
}` }} />
      <div dangerouslySetInnerHTML={{ __html: `<footer data-elementor-type="footer" data-elementor-id="61373" class="elementor elementor-61373 elementor-location-footer" data-elementor-post-type="elementor_library"><div class="elementor-element elementor-element-2efa958a e-con-full e-flex cmsmasters-block-default e-con e-parent" data-id="2efa958a" data-element_type="container" data-e-type="container"><div class="elementor-element elementor-element-7c4676d cmsmasters-block-default cmsmasters-sticky-default elementor-widget elementor-widget-html" data-id="7c4676d" data-element_type="widget" data-e-type="widget" data-widget_type="html.default"><style>/* ========================================
   FOOTER - LIGHTWEIGHT & SEXY DESIGN
   ======================================== */

.dgs-footer-wrapper * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dgs-footer-wrapper {
  position: relative;
  background: transparent;
  padding: 0;
  margin: 0;
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.dgs-footer {
  position: relative;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 40px) 0;
  color: #fff;
  overflow: hidden;
}

.dgs-footer-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.dgs-footer-grid {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: clamp(30px, 4vw, 40px);
  margin-bottom: clamp(40px, 5vw, 55px);
}

.dgs-footer-column {
  display: flex;
  flex-direction: column;
}

.dgs-footer-logo-column {
  max-width: 280px;
}

.dgs-footer-logo {
  display: block;
  width: clamp(130px, 15vw, 160px);
  height: auto;
  margin-bottom: 22px;
  transition: transform 0.4s ease;
  opacity: 0.95;
}

.dgs-footer-logo:hover {
  transform: scale(1.03);
  opacity: 1;
}

.dgs-footer-tagline {
  font-size: clamp(0.8rem, 1.2vw, 0.88rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;
  margin-top: 0;
  margin-bottom: 22px;
  line-height: 1.7;
}

.dgs-footer-column-title {
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: clamp(16px, 2vw, 20px);
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  width: fit-content;
}

.dgs-footer-column-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
  border-radius: 10px;
  opacity: 0.6;
}

.dgs-footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dgs-footer-link-item {
  margin-bottom: 8px;
}

.dgs-footer-link {
  display: inline-block;
  font-size: clamp(0.82rem, 1.2vw, 0.9rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
  letter-spacing: 0.3px;
}

.dgs-footer-link::before {
  content: '→';
  position: absolute;
  left: -18px;
  opacity: 0;
  color: #FF6B35;
  transition: all 0.3s ease;
  font-weight: 300;
}

.dgs-footer-link:hover {
  color: rgba(255, 255, 255, 0.95);
  padding-left: 18px;
}

.dgs-footer-link:hover::before {
  opacity: 1;
  left: 0;
}

.dgs-footer-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  font-size: clamp(0.82rem, 1.2vw, 0.9rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
}

.dgs-footer-contact-item div {
  text-align: left;
}

.dgs-footer-contact-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 3px;
  opacity: 1;
  background: transparent !important;
}

.dgs-footer-contact-icon path {
  fill: none !important;
  background: none !important;
}

.dgs-footer-contact-item strong {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
}

.dgs-footer-contact-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
  margin-bottom: 6px;
  font-weight: 300;
}

.dgs-footer-contact-link:hover {
  color: rgba(255, 255, 255, 0.95);
  padding-left: 6px;
}

.dgs-footer-map-container {
  margin-top: 12px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.5s ease;
  border-radius: 12px;
}

.dgs-footer-map-container.active {
  max-height: 350px;
  opacity: 1;
  margin-top: 16px;
}

.dgs-footer-map-container iframe {
  width: 100%;
  height: 300px;
  border: 0;
  border-radius: 12px;
  display: block;
}

.dgs-footer-address-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.dgs-footer-address-clickable:hover {
  color: rgba(255, 255, 255, 0.95);
}

.dgs-footer-address-clickable strong {
  position: relative;
  display: inline-block;
}

.dgs-footer-address-clickable strong::after {
  content: ' ↗';
  font-size: 0.85em;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.dgs-footer-address-clickable:hover strong::after {
  opacity: 1;
  transform: translateX(2px) translateY(-2px);
}

.dgs-footer-social {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 0;
}

.dgs-footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.4s ease;
}

.dgs-footer-social-link:hover {
  background: transparent;
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.15);
  color: rgba(255, 255, 255, 0.95);
}

.dgs-footer-social-icon {
  width: 18px;
  height: 18px;
}

.dgs-footer-stalk-box {
  margin-top: 18px;
  width: 100%;
}

.dgs-footer-stalk-title {
  font-size: clamp(0.82rem, 1.2vw, 0.92rem);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.3px;
  margin-bottom: 12px;
  line-height: 1.35;
}

.dgs-footer-contact-column .dgs-footer-social {
  justify-content: flex-start;
}

.dgs-footer-contact-column .dgs-footer-social-link {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.035);
}

/* AI Summary Shortcut Icons - Latest Brand Icons */
.dgs-footer-ai-summary {
  margin: 0 0 22px;
  width: 100%;
}

.dgs-footer-ai-heading {
  font-size: clamp(0.76rem, 1.1vw, 0.84rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.25px;
  margin-bottom: 10px;
  line-height: 1.45;
}

.dgs-footer-ai-icons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dgs-footer-ai-link {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.065);
  text-decoration: none;
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dgs-footer-ai-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(255, 0, 220, 0.14), rgba(255, 107, 53, 0.18));
  opacity: 0;
  transition: opacity 0.35s ease;
}

.dgs-footer-ai-link:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 107, 53, 0.55);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.18);
}

.dgs-footer-ai-link:hover::before {
  opacity: 1;
}

.dgs-footer-ai-icon {
  position: relative;
  z-index: 1;
  width: 19px;
  height: 19px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.22));
}

.dgs-footer-ai-fallback {
  position: relative;
  z-index: 1;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.2px;
}

.dgs-ai-prompt-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%) translateY(20px);
  z-index: 999999;
  max-width: min(92vw, 420px);
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(10, 10, 14, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.82rem;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease, transform 0.28s ease;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dgs-ai-prompt-toast.active {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}


.dgs-footer-ai-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 0 clamp(32px, 4vw, 45px);
  padding: 16px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.11);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.18);
}

.dgs-footer-ai-top .dgs-footer-ai-heading {
  margin-bottom: 0;
  text-align: center;
}


.dgs-footer-trust-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 22px;
}

.dgs-footer-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  max-width: 100%;
  min-height: 58px;
  padding: 9px 14px 9px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  transition: all 0.35s ease;
}

.dgs-footer-trust-badge:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.45);
  box-shadow: 0 12px 30px rgba(255, 107, 53, 0.18);
}

.dgs-footer-trust-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 42px;
  padding: 4px 6px;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
  flex-shrink: 0;
}

.dgs-footer-trust-logo-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dgs-footer-trust-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.15;
  text-align: left;
}

.dgs-footer-trust-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 0.2px;
  margin-bottom: 3px;
}

.dgs-footer-trust-stars {
  font-size: 0.82rem;
  font-weight: 500;
  color: #ff6b35;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}

.dgs-footer-trust-subtext {
  font-size: 0.68rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.58);
  letter-spacing: 0.25px;
}

.dgs-footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(20px, 3vw, 28px) 0;
  text-align: center;
}

.dgs-footer-copyright {
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.dgs-footer-copyright-gradient {
  background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientSlideFooter 8s linear infinite;
  font-weight: 400;
}

.dgs-footer-legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.dgs-footer-legal-link {
  font-size: clamp(0.75rem, 1.2vw, 0.82rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.dgs-footer-legal-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.dgs-footer-legal-divider {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 300;
}

@keyframes gradientSlideFooter {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@media (max-width: 1100px) {
  .dgs-footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(28px, 4vw, 35px);
  }

  .dgs-footer-trust-badges {
    justify-content: center;
  }

  .dgs-footer-logo-column {
    grid-column: 1 / -1;
    max-width: 100%;
    text-align: center;
    align-items: center;
  }

  .dgs-footer-logo {
    margin-left: auto;
    margin-right: auto;
  }

  .dgs-footer-social {
    justify-content: center;
  }

  .dgs-footer-ai-summary {
    text-align: center;
  }

  .dgs-footer-ai-icons {
    justify-content: center;
  }
}

@media (max-width: 968px) {
  .dgs-footer {
    padding: clamp(50px, 7vw, 70px) clamp(20px, 4vw, 30px) 0 !important;
  }

  .dgs-footer-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
  }

  .dgs-footer-column {
    text-align: center;
    align-items: center;
  }

  .dgs-footer-column-title::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .dgs-footer-link::before {
    display: none;
  }

  .dgs-footer-link:hover {
    padding-left: 0;
  }

  .dgs-footer-contact-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  .dgs-footer-contact-item div {
    text-align: center;
  }

  .dgs-footer-contact-icon {
    margin-top: 0;
  }

  .dgs-footer-social {
    justify-content: center;
  }
}


  .dgs-footer-contact-column .dgs-footer-social {
    justify-content: center;
  }

  .dgs-footer-stalk-box {
    text-align: center;
  }

@media (max-width: 580px) {
  .dgs-footer {
    padding: 45px 20px 0 !important;
  }

  .dgs-footer-trust-badges {
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .dgs-footer-trust-badge {
    padding: 9px 12px 9px 9px;
    gap: 10px;
  }

  .dgs-footer-trust-logo-wrap {
    width: 68px;
    height: 40px;
  }

  .dgs-footer-trust-title {
    font-size: 0.74rem;
  }

  .dgs-footer-trust-stars {
    font-size: 0.78rem;
  }

  .dgs-footer-trust-subtext {
    font-size: 0.64rem;
  }

  .dgs-footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .dgs-footer-legal-links {
    flex-direction: column;
    gap: 10px;
  }

  .dgs-footer-legal-divider {
    display: none;
  }



  .dgs-footer-ai-top {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 30px;
    padding: 16px;
  }
  .dgs-footer-map-container iframe {
    height: 250px;
  }
}</style>
<svg width="0" height="0" style="position: absolute;" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="footer-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#00D4FF;stop-opacity:1" />
<stop offset="50%" style="stop-color:#FF00DC;stop-opacity:1" />
<stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
</linearGradient>
</defs>
</svg><footer class="dgs-footer-wrapper"><div class="dgs-footer"><div class="dgs-footer-container"><div class="dgs-footer-ai-summary dgs-footer-ai-top" aria-label="Ask AI for summary of D'Genius Solutions"><p class="dgs-footer-ai-heading">Ask AI for summary of D'Genius Solutions:</p><div class="dgs-footer-ai-icons">
<a class="dgs-footer-ai-link" href="#" data-ai-platform="chatgpt" onclick="return dgsRunAiPrompt(event, this);" target="_blank" rel="noopener" aria-label="Ask ChatGPT to summarize D'Genius Solutions" title="Ask ChatGPT">
<img class="dgs-footer-ai-icon" src="https://cdn.simpleicons.org/openai/FFFFFF" alt="ChatGPT" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
<span class="dgs-footer-ai-fallback" aria-hidden="true">GPT</span>
</a><a class="dgs-footer-ai-link" href="#" data-ai-platform="perplexity" onclick="return dgsRunAiPrompt(event, this);" target="_blank" rel="noopener" aria-label="Ask Perplexity to summarize D'Genius Solutions" title="Ask Perplexity">
<img class="dgs-footer-ai-icon" src="https://cdn.simpleicons.org/perplexity/FFFFFF" alt="Perplexity" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
<span class="dgs-footer-ai-fallback" aria-hidden="true">PX</span>
</a><a class="dgs-footer-ai-link" href="#" data-ai-platform="gemini" onclick="return dgsRunAiPrompt(event, this);" target="_blank" rel="noopener" aria-label="Ask Gemini to summarize D'Genius Solutions" title="Ask Gemini">
<img class="dgs-footer-ai-icon" src="https://cdn.simpleicons.org/googlegemini/FFFFFF" alt="Gemini" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
<span class="dgs-footer-ai-fallback" aria-hidden="true">GM</span>
</a><a class="dgs-footer-ai-link" href="#" data-ai-platform="claude" onclick="return dgsRunAiPrompt(event, this);" target="_blank" rel="noopener" aria-label="Ask Claude to summarize D'Genius Solutions" title="Ask Claude">
<img class="dgs-footer-ai-icon" src="https://cdn.simpleicons.org/anthropic/FFFFFF" alt="Claude" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
<span class="dgs-footer-ai-fallback" aria-hidden="true">CL</span>
</a><a class="dgs-footer-ai-link" href="#" data-ai-platform="copilot" onclick="return dgsRunAiPrompt(event, this);" target="_blank" rel="noopener" aria-label="Ask Microsoft Copilot to summarize D'Genius Solutions" title="Ask Copilot">
<img class="dgs-footer-ai-icon" src="https://cdn.simpleicons.org/microsoftcopilot/FFFFFF" alt="Copilot" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';">
<span class="dgs-footer-ai-fallback" aria-hidden="true">CO</span>
</a></div></div><div class="dgs-footer-grid"><div class="dgs-footer-column dgs-footer-logo-column">
<img src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO.png" alt="D'Genius Solutions digital marketing agency logo" class="dgs-footer-logo" width="160" height="80" loading="lazy" decoding="async"><p class="dgs-footer-tagline">Your growth-focused digital partner for SEO, AI search, branding, content, social media, websites, and performance-led marketing.</p><div class="dgs-footer-trust-badges" aria-label="D'Genius Solutions Clutch rating proof"><div class="dgs-footer-trust-badge" aria-label="D'Genius Solutions Clutch 5-star rating proof">
<span class="dgs-footer-trust-logo-wrap">
<img width="379" height="283" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/t_clutch-5-star3208.logowik.com_.webp" alt="Clutch 5-star rating badge" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 379px; --smush-placeholder-aspect-ratio: 379/283;">
</span>
<span class="dgs-footer-trust-copy">
<span class="dgs-footer-trust-title">Clutch Rated</span>
<span class="dgs-footer-trust-stars">★★★★★</span>
<span class="dgs-footer-trust-subtext">Trusted client reviews</span>
</span></div></div></div><div class="dgs-footer-column"><div class="dgs-footer-column-title" role="presentation">Quick Links</div><ul class="dgs-footer-links"><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/" class="dgs-footer-link">Home</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/about-us/" class="dgs-footer-link">About Us</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/blogs/" class="dgs-footer-link">Blogs</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/career/" class="dgs-footer-link">Career</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/portfolio/" class="dgs-footer-link">Portfolio</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/contact-us/" class="dgs-footer-link">Contact</a></li></ul></div><div class="dgs-footer-column"><div class="dgs-footer-column-title" role="presentation">Services</div><ul class="dgs-footer-links"><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/seo-services-in-mumbai/" class="dgs-footer-link">SEO Services</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/website-development-amc/" class="dgs-footer-link">Website Development</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/social-media-marketing/" class="dgs-footer-link">Social Media Marketing</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/performance-marketing/" class="dgs-footer-link">Performance Marketing</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/ai-video-production-agency/" class="dgs-footer-link">AI Video Production</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/content-creation/" class="dgs-footer-link">Content Creation</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/branding/" class="dgs-footer-link">Branding</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/" class="dgs-footer-link">AEO Services</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/geo/" class="dgs-footer-link">GEO Services</a></li><li class="dgs-footer-link-item"><a href="https://www.dgeniussolutions.com/services/llm-seo-service/" class="dgs-footer-link">LLM SEO Services</a></li></ul></div><div class="dgs-footer-column dgs-footer-contact-column"><div class="dgs-footer-column-title" role="presentation">Contact Us</div><div class="dgs-footer-contact-item dgs-footer-address-clickable" onclick="toggleFooterMap()">
<svg class="dgs-footer-contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="url(#footer-icon-gradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="url(#footer-icon-gradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg><div>
<strong>The Digital Lab</strong><br>
Unit 202, Amore Edge, Swami Vivekanand Rd,<br>
Govind Dham, Khar West, Mumbai 400052<div class="dgs-footer-map-container" id="footerMapEmbed">
<iframe
data-src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.9443055813304!2d72.83493657520516!3d19.06618618213635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9bfeca795fd%3A0xa3bda380c79caf89!2sD&#39;Genius%20Solutions!5e0!3m2!1sen!2sin!4v1770902787312!5m2!1sen!2sin"
allowfullscreen=""
referrerpolicy="no-referrer-when-downgrade"
title="D'Genius Solutions Google Map" src="about:blank" class="lazyload" data-load-mode="0">
</iframe></div></div></div><div class="dgs-footer-contact-item">
<svg class="dgs-footer-contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="url(#footer-icon-gradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg><div>
<a href="tel:+919987922901" class="dgs-footer-contact-link">+91 99879 22901</a>
<a href="tel:+918591950238" class="dgs-footer-contact-link">+91 85919 50238</a></div></div><div class="dgs-footer-contact-item">
<svg class="dgs-footer-contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="url(#footer-icon-gradient)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg><div>
<a href="mailto:business@dgeniussolutions.com" class="dgs-footer-contact-link">business@dgeniussolutions.com</a></div></div><div class="dgs-footer-stalk-box" aria-label="D'Genius Solutions social media links"><p class="dgs-footer-stalk-title">Stalk us below</p><div class="dgs-footer-social">
<a href="https://www.linkedin.com/company/d-genius-solutions/" class="dgs-footer-social-link" aria-label="LinkedIn" target="_blank" rel="noopener">
<svg class="dgs-footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
</svg>
</a><a href="https://www.facebook.com/DGeniussolutions/" class="dgs-footer-social-link" aria-label="Facebook" target="_blank" rel="noopener">
<svg class="dgs-footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>
</a><a href="https://www.instagram.com/dgenius_solutions/" class="dgs-footer-social-link" aria-label="Instagram" target="_blank" rel="noopener">
<svg class="dgs-footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
</svg>
</a><a href="https://in.pinterest.com/dgeniussolutions/" class="dgs-footer-social-link" aria-label="Pinterest" target="_blank" rel="noopener">
<svg class="dgs-footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
</svg>
</a><a href="https://www.youtube.com/@dgeniussolutionspvtltd4060" class="dgs-footer-social-link" aria-label="YouTube" target="_blank" rel="noopener">
<svg class="dgs-footer-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
</svg>
</a></div></div></div></div><div class="dgs-footer-bottom"><p class="dgs-footer-copyright">
© 2026 <span class="dgs-footer-copyright-gradient">D'Genius Solutions</span>. All Rights Reserved.</p><div class="dgs-footer-legal-links">
<a href="https://www.dgeniussolutions.com/privacy-policy/" class="dgs-footer-legal-link">Privacy Policy</a>
<span class="dgs-footer-legal-divider">•</span>
<a href="https://www.dgeniussolutions.com/sitemap/" class="dgs-footer-legal-link">Sitemap</a></div></div></div></div></footer>` }} />
    </>
  );
}
