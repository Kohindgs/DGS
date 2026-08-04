'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';

export default function GsapClient() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reveals = gsap.utils.toArray('.bh-reveal');
      if (reveals.length) {
        gsap.fromTo(
          reveals,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out',
            delay: 0.15,
          }
        );
      }

      gsap.fromTo(
        '.bh-heart-stage',
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 1.25, ease: 'power3.out', delay: 0.25 }
      );

      gsap.fromTo(
        '.bh-float',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power2.out', delay: 0.55 }
      );

      gsap.to('.bh-heart-img', {
        y: -14,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.bh-float', {
        y: '-=8',
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.4, from: 'random' },
      });

      gsap.to('.bh-orbit-ring', {
        rotate: 360,
        duration: 18,
        repeat: -1,
        ease: 'none',
      });

      gsap.to('.bh-orb--cyan', {
        x: 40,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.bh-orb--magenta', {
        x: -35,
        y: 25,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
