'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function HeroVideo() {
  const [open, setOpen] = useState(false);
  const modalVideoRef = useRef(null);
  const ambientRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
  }, []);

  const openStory = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    const playBtn = document.querySelector('.bh-play');
    if (!playBtn) return undefined;
    const onClick = (e) => {
      e.preventDefault();
      openStory();
    };
    playBtn.addEventListener('click', onClick);
    return () => playBtn.removeEventListener('click', onClick);
  }, [openStory]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = requestAnimationFrame(() => {
      modalVideoRef.current?.play().catch(() => {});
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      cancelAnimationFrame(t);
    };
  }, [open, close]);

  useEffect(() => {
    const video = ambientRef.current;
    if (!video) return undefined;
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    tryPlay();
    const onVis = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <>
      <div className="bh-video-layer" aria-hidden="true">
        <video
          ref={ambientRef}
          className="bh-ambient-video"
          src="/figma/video/heart-ambient.mp4"
          poster="/figma/heart-visual-web.png"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
        <div className="bh-ambient-veil" />
      </div>

      {open ? (
        <div className="bh-modal" role="dialog" aria-modal="true" aria-label="Story video">
          <button type="button" className="bh-modal-backdrop" aria-label="Close video" onClick={close} />
          <div className="bh-modal-panel">
            <button type="button" className="bh-modal-close" onClick={close} aria-label="Close">
              ×
            </button>
            <video
              ref={modalVideoRef}
              className="bh-modal-video"
              src="/figma/video/story.mp4"
              poster="/figma/video/story-poster.jpg"
              controls
              playsInline
              autoPlay
              preload="metadata"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
