'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GsapClient() {
  useEffect(() => {
    // 1. Reveal Animations for sections & elements
    const reveals = document.querySelectorAll('.dgs-v1215-reveal');
    reveals.forEach((element) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // 2. Continuous horizontal marquee animation for capabilities rail
    // (If CSS marquee is not used, GSAP can animate the rail-track)
    // We will let CSS handle the infinite loop ticker since it's more performant (60fps), 
    // but GSAP can do parallax elements!
    
    // 3. Parallax effect on the background sphere / canvas
    gsap.to('#dgs-v1215-canvas', {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    // 4. Smooth scroll animations for client logos
    const logoTiles = document.querySelectorAll('.dgs-v1215-logo-tile');
    if (logoTiles.length > 0) {
      gsap.from(logoTiles, {
        opacity: 0,
        scale: 0.8,
        stagger: 0.05,
        duration: 0.6,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.dgs-v1215-logo-marquee',
          start: 'top 90%',
        },
      });
    }

    // 5. Awards cards stagger reveal
    const awardCards = document.querySelectorAll('.dgs-v1215-award-card');
    if (awardCards.length > 0) {
      gsap.from(awardCards, {
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.dgs-v1215-awards-grid',
          start: 'top 80%',
        },
      });
    }
  }, []);

  return null; // This component doesn't render HTML, it only runs animations
}
