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

    // 3. SEO Services Lightbox (#seo-lb)
    const seolb = document.getElementById("seo-lb");
    const seolbImg = document.getElementById("seo-lbimg") as HTMLImageElement | null;
    const seolbTtl = document.getElementById("seo-lbttl");
    const seolbPill = document.getElementById("seo-lbpill");
    const seolbCount = document.getElementById("seo-lbcount");
    const seolbPrev = document.getElementById("seo-lbprev");
    const seolbNext = document.getElementById("seo-lbnext");
    const seolbClose = document.getElementById("seo-lbx");

    let cleanupSeoLb: (() => void) | undefined;
    if (seolb && seolbImg) {
      const bentoItems = Array.from(
        root.querySelectorAll<HTMLElement>(
          ".dgs-case-image-link, .dgs-results-image a, .dgs-bento .dgs-bi",
        ),
      );
      let currentIndex = 0;

      const setSeoImage = (index: number) => {
        if (!bentoItems.length) return;
        currentIndex = (index + bentoItems.length) % bentoItems.length;
        const item = bentoItems[currentIndex];
        const img = item.querySelector<HTMLImageElement>("img");
        const card = item.closest<HTMLElement>(".dgs-results-card, .dgs-case-card, .dgs-bi");
        const pill = card?.querySelector<HTMLElement>(".dgs-case-tag, .dgs-bipill");
        const title = card?.querySelector<HTMLElement>(".dgs-case-title, .dgs-bittl");

        const src = item.getAttribute("href") || img?.getAttribute("data-src") || img?.currentSrc || img?.src || "";
        if (src) seolbImg.src = src;
        if (seolbPill && pill) seolbPill.textContent = pill.textContent;
        if (seolbTtl && title) seolbTtl.textContent = title.textContent;
        if (seolbCount) seolbCount.textContent = `${currentIndex + 1} / ${bentoItems.length}`;
      };

      const openSeoLb = (index: number) => {
        setSeoImage(index);
        seolb.classList.add("on");
        seolb.removeAttribute("inert");
        seolb.setAttribute("aria-hidden", "false");
      };

      const closeSeoLb = () => {
        seolb.classList.remove("on");
        seolb.setAttribute("inert", "");
        seolb.setAttribute("aria-hidden", "true");
      };

      const cleanups: (() => void)[] = [];
      bentoItems.forEach((item, idx) => {
        const onBentoClick = (e: MouseEvent) => {
          e.preventDefault();
          openSeoLb(idx);
        };
        item.addEventListener("click", onBentoClick);
        cleanups.push(() => item.removeEventListener("click", onBentoClick));
      });

      const onPrev = (e: MouseEvent) => {
        e.stopPropagation();
        setSeoImage(currentIndex - 1);
      };
      const onNext = (e: MouseEvent) => {
        e.stopPropagation();
        setSeoImage(currentIndex + 1);
      };
      const onClose = () => closeSeoLb();
      const onKey = (e: KeyboardEvent) => {
        if (!seolb.classList.contains("on")) return;
        if (e.key === "Escape") closeSeoLb();
        if (e.key === "ArrowLeft") setSeoImage(currentIndex - 1);
        if (e.key === "ArrowRight") setSeoImage(currentIndex + 1);
      };

      seolbPrev?.addEventListener("click", onPrev);
      seolbNext?.addEventListener("click", onNext);
      seolbClose?.addEventListener("click", onClose);
      document.addEventListener("keydown", onKey);

      cleanupSeoLb = () => {
        cleanups.forEach((fn) => fn());
        seolbPrev?.removeEventListener("click", onPrev);
        seolbNext?.removeEventListener("click", onNext);
        seolbClose?.removeEventListener("click", onClose);
        document.removeEventListener("keydown", onKey);
      };
    }

    // 4. LLM SEO Lightbox (#llm-lb)
    const llmlb = document.getElementById("llm-lb");
    const llmlbImg = document.getElementById("llm-lbimg") as HTMLImageElement | null;
    const llmlbTtl = document.getElementById("llm-lbttl");
    const llmlbPill = document.getElementById("llm-lbpill");
    const llmlbCount = document.getElementById("llm-lbcount");
    const llmlbPrev = document.getElementById("llm-lbprev");
    const llmlbNext = document.getElementById("llm-lbnext");
    const llmlbClose = document.getElementById("llm-lbx");

    let cleanupLlmLb: (() => void) | undefined;
    if (llmlb && llmlbImg) {
      const bentoItems = Array.from(root.querySelectorAll<HTMLElement>(".bento-row .bi"));
      let currentIndex = 0;

      const setLlmImage = (index: number) => {
        if (!bentoItems.length) return;
        currentIndex = (index + bentoItems.length) % bentoItems.length;
        const item = bentoItems[currentIndex];
        const img = item.querySelector<HTMLImageElement>("img");
        const pill = item.querySelector<HTMLElement>(".bipill");
        const title = item.querySelector<HTMLElement>(".bittl");

        const src = img?.getAttribute("data-src") || img?.currentSrc || img?.src || "";
        if (src) llmlbImg.src = src;
        if (llmlbPill && pill) llmlbPill.textContent = pill.textContent;
        if (llmlbTtl && title) llmlbTtl.textContent = title.textContent;
        if (llmlbCount) llmlbCount.textContent = `${currentIndex + 1} / ${bentoItems.length}`;
      };

      const openLlmLb = (index: number) => {
        setLlmImage(index);
        llmlb.classList.add("on");
        llmlb.setAttribute("aria-hidden", "false");
      };

      const closeLlmLb = () => {
        llmlb.classList.remove("on");
        llmlb.setAttribute("aria-hidden", "true");
      };

      (window as unknown as { llmOpenLb?: (idx: number) => void }).llmOpenLb = openLlmLb;
      (window as unknown as { llmCloseLb?: () => void }).llmCloseLb = closeLlmLb;

      const cleanups: (() => void)[] = [];
      bentoItems.forEach((item, idx) => {
        const onBiClick = () => openLlmLb(idx);
        item.addEventListener("click", onBiClick);
        cleanups.push(() => item.removeEventListener("click", onBiClick));
      });

      const onPrev = (e: MouseEvent) => {
        e.stopPropagation();
        setLlmImage(currentIndex - 1);
      };
      const onNext = (e: MouseEvent) => {
        e.stopPropagation();
        setLlmImage(currentIndex + 1);
      };
      const onClose = () => closeLlmLb();
      const onKey = (e: KeyboardEvent) => {
        if (!llmlb.classList.contains("on")) return;
        if (e.key === "Escape") closeLlmLb();
        if (e.key === "ArrowLeft") setLlmImage(currentIndex - 1);
        if (e.key === "ArrowRight") setLlmImage(currentIndex + 1);
      };

      llmlbPrev?.addEventListener("click", onPrev);
      llmlbNext?.addEventListener("click", onNext);
      llmlbClose?.addEventListener("click", onClose);
      document.addEventListener("keydown", onKey);

      cleanupLlmLb = () => {
        cleanups.forEach((fn) => fn());
        llmlbPrev?.removeEventListener("click", onPrev);
        llmlbNext?.removeEventListener("click", onNext);
        llmlbClose?.removeEventListener("click", onClose);
        document.removeEventListener("keydown", onKey);
      };
    }

    // 5. Branding Image Viewer Modal (#bpImageModal)
    const bpModal = document.getElementById("bpImageModal");
    const bpImage = document.getElementById("bpImageFrame") as HTMLImageElement | null;
    const bpCaption = document.getElementById("bpImageCaption");
    const bpClose = bpModal?.querySelector<HTMLElement>(".bp-image-close");
    const bpOverlay = bpModal?.querySelector<HTMLElement>(".bp-image-modal-overlay");

    let cleanupBpModal: (() => void) | undefined;
    if (bpModal && bpImage) {
      const galleryItems = Array.from(
        root.querySelectorAll<HTMLElement>(
          ".bp-pm-gallery-item:not([data-media-type='pdf']):not([data-media-type='ppt'])",
        ),
      );

      const openBpImage = (item: HTMLElement) => {
        const img = item.querySelector<HTMLImageElement>("img");
        const label = item.querySelector<HTMLElement>(".bp-pm-label")?.textContent || img?.alt || "";
        const src = img?.getAttribute("data-src") || img?.currentSrc || img?.src || "";
        if (src) bpImage.src = src;
        if (bpCaption) bpCaption.textContent = label;
        bpModal.style.display = "flex";
      };

      const closeBpImage = () => {
        bpModal.style.display = "none";
      };

      const cleanups: (() => void)[] = [];
      galleryItems.forEach((item) => {
        const onGalleryClick = () => openBpImage(item);
        item.addEventListener("click", onGalleryClick);
        cleanups.push(() => item.removeEventListener("click", onGalleryClick));
      });

      const onClose = () => closeBpImage();
      const onKey = (e: KeyboardEvent) => {
        if (bpModal.style.display !== "flex") return;
        if (e.key === "Escape") closeBpImage();
      };

      bpClose?.addEventListener("click", onClose);
      bpOverlay?.addEventListener("click", onClose);
      document.addEventListener("keydown", onKey);

      cleanupBpModal = () => {
        cleanups.forEach((fn) => fn());
        bpClose?.removeEventListener("click", onClose);
        bpOverlay?.removeEventListener("click", onClose);
        document.removeEventListener("keydown", onKey);
      };
    }

    return () => {
      root.removeEventListener("click", onClick);
      cleanupLightbox?.();
      cleanupSeoLb?.();
      cleanupLlmLb?.();
      cleanupBpModal?.();
    };
  }, []);

  return null;
}
