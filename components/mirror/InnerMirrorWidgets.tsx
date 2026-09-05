"use client";

import { useEffect } from "react";

function closestFaqItem(target: EventTarget | null): HTMLElement | null {
  return (target as HTMLElement | null)?.closest?.(".faq-item") ?? null;
}

function setAnswerOpen(item: HTMLElement, open: boolean) {
  const answer = item.querySelector<HTMLElement>(".faq-a");
  item.classList.toggle("active", open);
  if (!answer) return;
  if (open) {
    answer.style.maxHeight = `${Math.max(answer.scrollHeight, 1)}px`;
  } else {
    answer.style.maxHeight = "0px";
  }
}

/**
 * Native stand-ins for WordPress widget JS that was stripped with plugin runtime:
 * FAQ accordion open/close. Video portfolio boot is handled separately.
 */
export function InnerMirrorWidgets() {
  useEffect(() => {
    const root = document.querySelector(".dgs-wp-mirror-inner");
    if (!root) return;

    // 1. FAQ Accordions (.faq-item)
    for (const item of root.querySelectorAll<HTMLElement>(".faq-item")) {
      setAnswerOpen(item, item.classList.contains("active"));
    }

    const onClick = (event: Event) => {
      const target = event.target as HTMLElement | null;

      // Standard .faq-item
      const question = target?.closest?.(".faq-q, .faq-item button");
      if (question && root.contains(question)) {
        const item = closestFaqItem(question);
        if (item) {
          event.preventDefault();
          const shouldOpen = !item.classList.contains("active");
          const container = item.closest(".faq-container") || root;
          for (const other of container.querySelectorAll<HTMLElement>(".faq-item.active")) {
            if (other !== item) setAnswerOpen(other, false);
          }
          setAnswerOpen(item, shouldOpen);
          return;
        }
      }

      // Shirdi / Case Study FAQ (.case-faq-trigger)
      const faqTrigger = target?.closest?.(".case-faq-trigger");
      if (faqTrigger && root.contains(faqTrigger)) {
        const card = faqTrigger.closest<HTMLElement>(".case-faq-card");
        if (card) {
          event.preventDefault();
          const isOpen = card.classList.contains("is-open");
          const list = card.closest(".case-faq-list") || root;
          for (const other of list.querySelectorAll<HTMLElement>(".case-faq-card.is-open")) {
            if (other !== card) {
              other.classList.remove("is-open");
              other.querySelector(".case-faq-trigger")?.setAttribute("aria-expanded", "false");
            }
          }
          card.classList.toggle("is-open", !isOpen);
          faqTrigger.setAttribute("aria-expanded", String(!isOpen));
          return;
        }
      }
    };

    root.addEventListener("click", onClick);

    // 2. AI Avatar Video Gallery & Lightbox
    const gallery = root.querySelector<HTMLElement>("#ai-avatar-gallery");
    const lightbox = document.getElementById("lightbox");
    const player = document.getElementById("lightbox-player") as HTMLVideoElement | null;
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    let cleanupLightbox: (() => void) | undefined;

    if (gallery && lightbox && player) {
      const items = Array.from(gallery.querySelectorAll<HTMLElement>(".case-study-item"));
      let currentIndex = 0;

      const getCardVideoSrc = (item: HTMLElement): string => {
        return (
          item.dataset.videoSrc ||
          item.querySelector("source")?.getAttribute("src")?.split("#")[0] ||
          ""
        );
      };

      const setPlayerSource = (src: string) => {
        player.pause();
        while (player.firstChild) {
          player.removeChild(player.firstChild);
        }
        player.removeAttribute("src");
        if (!src) return;
        const source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";
        player.appendChild(source);
        player.load();
        player.play().catch(() => {});
      };

      const openLightbox = (index: number) => {
        if (index < 0 || index >= items.length) return;
        currentIndex = index;
        const src = getCardVideoSrc(items[currentIndex]);
        setPlayerSource(src);
        lightbox.style.display = "flex";
        requestAnimationFrame(() => {
          lightbox.classList.add("is-open");
        });
        document.body.classList.add("lightbox-open");
      };

      const closeLightbox = () => {
        player.pause();
        while (player.firstChild) {
          player.removeChild(player.firstChild);
        }
        player.removeAttribute("src");
        try {
          player.load();
        } catch {}
        lightbox.classList.remove("is-open");
        setTimeout(() => {
          lightbox.style.display = "";
          document.body.classList.remove("lightbox-open");
        }, 240);
      };

      const stepLightbox = (dir: number) => {
        if (!items.length) return;
        currentIndex = (currentIndex + dir + items.length) % items.length;
        const src = getCardVideoSrc(items[currentIndex]);
        setPlayerSource(src);
      };

      const itemCleanups: (() => void)[] = [];
      items.forEach((item, idx) => {
        const onCardClick = () => openLightbox(idx);
        const onCardKey = (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(idx);
          }
        };
        item.addEventListener("click", onCardClick);
        item.addEventListener("keydown", onCardKey);
        itemCleanups.push(() => {
          item.removeEventListener("click", onCardClick);
          item.removeEventListener("keydown", onCardKey);
        });

        // Initialize thumbnail video preview frame
        const thumbVideo = item.querySelector<HTMLVideoElement>(".thumb-video");
        if (thumbVideo) {
          const markReady = () => thumbVideo.classList.add("is-ready");
          thumbVideo.addEventListener("loadeddata", markReady, { once: true });
          thumbVideo.addEventListener("canplay", markReady, { once: true });
          if (thumbVideo.readyState >= 2) markReady();
        }
      });

      const onCloseClick = () => closeLightbox();
      const onPrevClick = (e: MouseEvent) => {
        e.stopPropagation();
        stepLightbox(-1);
      };
      const onNextClick = (e: MouseEvent) => {
        e.stopPropagation();
        stepLightbox(1);
      };
      const onLightboxClick = (e: MouseEvent) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") stepLightbox(-1);
        if (e.key === "ArrowRight") stepLightbox(1);
      };

      closeBtn?.addEventListener("click", onCloseClick);
      prevBtn?.addEventListener("click", onPrevClick);
      nextBtn?.addEventListener("click", onNextClick);
      lightbox.addEventListener("click", onLightboxClick);
      document.addEventListener("keydown", onKeyDown);

      cleanupLightbox = () => {
        itemCleanups.forEach((fn) => fn());
        closeBtn?.removeEventListener("click", onCloseClick);
        prevBtn?.removeEventListener("click", onPrevClick);
        nextBtn?.removeEventListener("click", onNextClick);
        lightbox.removeEventListener("click", onLightboxClick);
        document.removeEventListener("keydown", onKeyDown);
      };
    }

    return () => {
      root.removeEventListener("click", onClick);
      cleanupLightbox?.();
    };
  }, []);

  return null;
}
