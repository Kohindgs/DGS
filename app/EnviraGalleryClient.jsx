"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function EnviraGalleryClient() {
  const [galleryNode, setGalleryNode] = useState(null);
  const [images, setImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9); // Initial load count
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    // Wait for the next tick to ensure the dangerouslySetInnerHTML has rendered
    const initGallery = () => {
      const node = document.querySelector(".envira-gallery-public");
      if (node) {
        setGalleryNode(node);
        const dataStr = node.getAttribute("data-gallery-images");
        if (dataStr) {
          try {
            const parsed = JSON.parse(dataStr);
            setImages(parsed);
            
            // Hide the WP loader since we're rendering it now
            const wrap = node.closest(".envira-gallery-wrap");
            if (wrap) {
              const loader = wrap.querySelector(".envira-loader");
              if (loader) loader.style.display = 'none';
            }
          } catch (e) {
            console.error("Failed to parse envira images", e);
          }
        }
      }
    };
    
    // Slight delay to ensure DOM is ready after React hydration
    setTimeout(initGallery, 100);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev + 1) % images.length);
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => prev + 9);
  };

  const openLightbox = (e, index) => {
    e.preventDefault();
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const galleryContent = (
    <div style={{ width: '100%' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '15px', 
        justifyContent: 'center',
        padding: '20px 0'
      }}>
        {images.slice(0, visibleCount).map((img, index) => (
          <a
            key={index}
            href={img.src}
            onClick={(e) => openLightbox(e, index)}
            style={{ display: 'block', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '4px' }}
          >
            <img 
              src={img.src} 
              alt={img.alt || img.title || "Portfolio item"} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
              loading="lazy"
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
        ))}
      </div>
      {visibleCount < images.length && (
        <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px', width: '100%' }}>
          <button 
            onClick={handleLoadMore}
            style={{
              padding: '12px 30px',
              backgroundColor: '#111',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '600',
              letterSpacing: '1px',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#111'}
          >
            LOAD MORE
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {galleryNode && createPortal(galleryContent, galleryNode)}
      
      {lightboxIndex !== null && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '40px', cursor: 'pointer', zIndex: 2 }}
            aria-label="Close lightbox"
          >
            &times;
          </button>
          
          <button 
            onClick={prevImage}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '40px', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
            aria-label="Previous image"
          >
            &#8249;
          </button>

          <div style={{ position: 'relative', maxWidth: '85%', maxHeight: '85vh', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={images[lightboxIndex].src} 
              alt={images[lightboxIndex].alt || "Portfolio item full size"} 
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', boxShadow: '0 5px 25px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()} 
            />
          </div>

          <button 
            onClick={nextImage}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '40px', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
            aria-label="Next image"
          >
            &#8250;
          </button>
          
          <div style={{ position: 'absolute', bottom: '20px', color: '#ccc', fontSize: '14px', letterSpacing: '1px' }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
