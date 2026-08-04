'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';

export default function GsapClient() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const reveals = gsap.utils.toArray('.bh-reveal');
      if (reveals.length) {
        gsap.fromTo(
          reveals,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: prefersReduced ? 0.01 : 1,
            stagger: prefersReduced ? 0 : 0.12,
            ease: 'power3.out',
            delay: prefersReduced ? 0 : 0.15,
          }
        );
      }

      gsap.fromTo(
        '.bh-heart-stage',
        { opacity: 0, scale: 0.92, y: 24 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: prefersReduced ? 0.01 : 1.25,
          ease: 'power3.out',
          delay: prefersReduced ? 0 : 0.25,
        }
      );

      gsap.fromTo(
        '.bh-float',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: prefersReduced ? 0.01 : 0.9,
          stagger: prefersReduced ? 0 : 0.15,
          ease: 'power2.out',
          delay: prefersReduced ? 0 : 0.55,
        }
      );

      if (prefersReduced) return;

      gsap.to('.bh-heart-img', {
        y: -12,
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

      gsap.to('.bh-orbit-heart', {
        scale: 1.06,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Play button pulse rings (matches Figma play affordance)
      gsap.to('.bh-play-ring', {
        scale: 1.35,
        opacity: 0,
        duration: 1.8,
        repeat: -1,
        ease: 'power1.out',
      });

      gsap.to('.bh-play', {
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.16), 0 16px 48px rgba(0,0,0,0.4), 0 0 36px rgba(92,240,255,0.35)',
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Gauge draw
      const gauge = document.querySelector('.bh-gauge-progress');
      if (gauge) {
        const length = gauge.getTotalLength?.() || 120;
        gsap.set(gauge, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(gauge, {
          strokeDashoffset: length * 0.18,
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.8,
        });
      }

      // Sparkline draw
      const spark = document.querySelector('.bh-spark-path');
      if (spark) {
        const length = spark.getTotalLength?.() || 200;
        gsap.set(spark, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(spark, {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: 'power2.out',
          delay: 1,
        });
      }

      // Ambient orbs
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

      // Headline word cascade glow
      gsap.fromTo(
        '.bh-headline span',
        { opacity: 0, y: 20, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return null;
}
