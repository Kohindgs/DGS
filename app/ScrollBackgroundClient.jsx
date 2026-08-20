"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ScrollBackgroundClient() {
  const [bgNode, setBgNode] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Find the placeholder we left in body.html
    const node = document.getElementById("dgs-scroll-bg-root");
    if (node) {
      setBgNode(node);
    }

    // Lightweight scroll listener using requestAnimationFrame
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map scroll to 0-1 progress based on window height
  // You can tweak these values based on how fast you want the background to react
  const progress = Math.min(scrollY / (typeof window !== 'undefined' ? window.innerHeight * 2 : 1000), 1);
  
  // Calculate dynamic colors/positions based on scroll
  const gradient1Y = 50 + progress * 50; // Move down
  const gradient2Y = -20 + progress * 80; // Move down faster
  
  // Opacity fade out as you scroll deep into the page
  const opacity = Math.max(1 - progress * 0.8, 0.2);

  const bgContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      backgroundColor: '#08090a', // Deep dark theme background
      overflow: 'hidden',
      opacity: opacity,
      transition: 'opacity 0.1s linear'
    }}>
      {/* Orb 1: Soft Violet */}
      <div style={{
        position: 'absolute',
        top: `${gradient1Y}%`,
        left: '20%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(124, 92, 252, 0.15) 0%, rgba(124, 92, 252, 0) 70%)',
        transform: 'translate(-50%, -50%)',
        willChange: 'top',
        pointerEvents: 'none'
      }} />
      
      {/* Orb 2: Teal */}
      <div style={{
        position: 'absolute',
        top: `${gradient2Y}%`,
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(62, 207, 180, 0.12) 0%, rgba(62, 207, 180, 0) 70%)',
        transform: 'translate(0%, -50%)',
        willChange: 'top',
        pointerEvents: 'none'
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );

  // We add a global style to fade in the main body so there's no white flash
  const globalFadeIn = mounted ? null : (
    <style dangerouslySetInnerHTML={{__html: `
      .cmsmasters-main {
        animation: dgsFadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes dgsFadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      body {
        background-color: #08090a !important;
      }
    `}} />
  );

  return (
    <>
      {globalFadeIn}
      {bgNode && createPortal(bgContent, bgNode)}
    </>
  );
}
