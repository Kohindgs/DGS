'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GsapClient() {
  useEffect(() => {
    // --- Nav scroll state ---
    const nav = document.querySelector('.dgs-nav');
    if (nav) {
      const handleScroll = () => {
        if (window.scrollY > 40) {
          nav.classList.add('dgs-nav--scrolled');
        } else {
          nav.classList.remove('dgs-nav--scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // --- Reveal Animations ---
    const reveals = document.querySelectorAll('.dgs-reveal');
    reveals.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // --- Staggered grid reveals ---
    const grids = document.querySelectorAll('.dgs-stagger-grid');
    grids.forEach((grid) => {
      const children = grid.children;
      gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // --- Subtle card hover tilt (desktop only) ---
    if (window.matchMedia('(hover: hover)').matches) {
      const cards = document.querySelectorAll('.dgs-tilt');
      cards.forEach((card) => {
        const handleMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateY: x * 4,
            rotateX: -y * 4,
            duration: 0.4,
            ease: 'power2.out',
          });
        };
        const handleLeave = () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.6,
            ease: 'power2.out',
          });
        };
        card.style.transformStyle = 'preserve-3d';
        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
      });
    }

    // --- Magnetic button hover ---
    const magBtns = document.querySelectorAll('.dgs-btn-primary');
    magBtns.forEach((btn) => {
      const handleMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.15,
          y: y * 0.15,
          duration: 0.3,
          ease: 'power2.out',
        });
      };
      const handleLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
        });
      };
      btn.addEventListener('mousemove', handleMove);
      btn.addEventListener('mouseleave', handleLeave);
    });

    // --- Counter animation for stats ---
    const statNums = document.querySelectorAll('.dgs-stat-number');
    statNums.forEach((el) => {
      const target = el.getAttribute('data-value');
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const numericTarget = parseFloat(target);

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            { val: 0 },
            { val: numericTarget },
            {
              val: numericTarget,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                const current = this.targets()[0].val;
                if (Number.isInteger(numericTarget)) {
                  el.textContent = prefix + Math.round(current) + suffix;
                } else {
                  el.textContent = prefix + current.toFixed(1) + suffix;
                }
              },
            }
          );
        },
      });
    });

    // --- Mobile nav toggle ---
    const toggle = document.querySelector('.dgs-nav-toggle');
    const mobileMenu = document.querySelector('.dgs-nav-links');
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('dgs-nav-links--open');
        toggle.classList.toggle('dgs-nav-toggle--active');
      });
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('dgs-nav-links--open');
          toggle.classList.remove('dgs-nav-toggle--active');
        });
      });
    }
  }, []);

  return null;
}
