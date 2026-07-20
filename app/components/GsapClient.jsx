'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GsapClient() {
  useEffect(() => {
    // 1. Reveal Animations with Stagger & Smooth Easing
    const reveals = document.querySelectorAll('.dgs-v1215-reveal');
    reveals.forEach((element) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 50,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // 2. 3D Card Tilt Micro-Interactions on MouseMove
    const tiltCards = document.querySelectorAll(
      '.dgs-v1215-award-card, .dgs-v1215-service-menu article, .dgs-v1215-case-visual-card, .dgs-v1215-authority-card, .dgs-v1215-testimonial-card'
    );

    tiltCards.forEach((card) => {
      card.style.transformStyle = 'preserve-3d';
      card.style.perspective = '1000px';

      const handleCardMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = (-y / (rect.height / 2)) * 6; // Max 6 deg tilt
        const rotateY = (x / (rect.width / 2)) * 6;

        gsap.to(card, {
          rotateX,
          rotateY,
          duration: 0.3,
          ease: 'power1.out',
        });
      };

      const handleCardLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mousemove', handleCardMove);
      card.addEventListener('mouseleave', handleCardLeave);

      return () => {
        card.removeEventListener('mousemove', handleCardMove);
        card.removeEventListener('mouseleave', handleCardLeave);
      };
    });

    // 3. Magnetic Hover Effect on Primary Buttons
    const magButtons = document.querySelectorAll('.dgs-v1215-btn-primary');
    magButtons.forEach((btn) => {
      const handleMagMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMagLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
        });
      };

      btn.addEventListener('mousemove', handleMagMove);
      btn.addEventListener('mouseleave', handleMagLeave);
    });

    // 4. Parallax Scroll effect for floating UI chips
    gsap.to('.dgs-v1215-chip-one', {
      y: -30,
      scrollTrigger: {
        trigger: '.dgs-v1215-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to('.dgs-v1215-chip-two', {
      y: -50,
      scrollTrigger: {
        trigger: '.dgs-v1215-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to('.dgs-v1215-chip-three', {
      y: -20,
      scrollTrigger: {
        trigger: '.dgs-v1215-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return null;
}
