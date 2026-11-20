"use client";

import { useEffect } from "react";

export function DgsLocationFaqBoot() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dgs-wp-mirror-inner") || document.body;
    const faqItems = root.querySelectorAll<HTMLElement>(".dgs-faq-item");

    if (faqItems.length) {
      // Initialize accessibility attributes on all FAQ questions
      for (const item of faqItems) {
        const q = item.querySelector<HTMLElement>(".dgs-faq-question, .dgs-faq-q");
        if (q) {
          if (!q.hasAttribute("role")) q.setAttribute("role", "button");
          if (!q.hasAttribute("tabindex")) q.setAttribute("tabindex", "0");
          const isOpen = item.classList.contains("active") || item.classList.contains("on");
          q.setAttribute("aria-expanded", String(isOpen));
        }
      }
    }

    const toggle = (question: HTMLElement) => {
      const item = question.closest<HTMLElement>(".dgs-faq-item");
      if (!item) return;

      const container = item.closest<HTMLElement>(".dgs-faq-container, .dgs-faq") || item.parentElement || root;
      const willOpen = !(item.classList.contains("active") || item.classList.contains("on"));

      // Sibling closing: Close all other active/on items in this container
      for (const sibling of container.querySelectorAll<HTMLElement>(".dgs-faq-item")) {
        if (sibling !== item) {
          sibling.classList.remove("active", "on");
          sibling.querySelector(".dgs-faq-question, .dgs-faq-q")?.setAttribute("aria-expanded", "false");
          const ans = sibling.querySelector<HTMLElement>(".dgs-faq-answer, .dgs-faq-a");
          if (ans) ans.style.maxHeight = "0px";
        }
      }

      // Toggle current item (supports both active and on classes for both variants)
      item.classList.toggle("active", willOpen);
      item.classList.toggle("on", willOpen);
      question.setAttribute("aria-expanded", String(willOpen));
      const ans = item.querySelector<HTMLElement>(".dgs-faq-answer, .dgs-faq-a");
      if (ans) {
        ans.style.maxHeight = willOpen ? `${ans.scrollHeight + 40}px` : "0px";
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const q = target?.closest<HTMLElement>(".dgs-faq-question, .dgs-faq-q");
      if (!q || !root.contains(q)) return;
      event.preventDefault();
      toggle(q);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target as HTMLElement | null;
      const q = target?.closest<HTMLElement>(".dgs-faq-question, .dgs-faq-q");
      if (!q || !root.contains(q)) return;
      event.preventDefault();
      toggle(q);
    };

    const syncPreviewScrollDistance = (wImg: HTMLElement) => {
      const img = wImg.querySelector<HTMLImageElement>(".live-preview-image");
      if (img && img.naturalHeight && img.naturalWidth && wImg.clientWidth > 0) {
        const renderedH = (img.naturalHeight / img.naturalWidth) * wImg.clientWidth;
        const maxScroll = Math.max(0, renderedH - wImg.clientHeight);
        wImg.style.setProperty("--preview-max-scroll", `-${maxScroll.toFixed(2)}px`);
      }
    };

    const allPreviewContainers = Array.from(root.querySelectorAll<HTMLElement>(".work-project-row .w-img"));
    for (const wImg of allPreviewContainers) {
      const img = wImg.querySelector<HTMLImageElement>(".live-preview-image");
      if (img) {
        if (img.complete && img.naturalWidth > 0) {
          syncPreviewScrollDistance(wImg);
        } else {
          img.addEventListener("load", () => syncPreviewScrollDistance(wImg), { once: true });
        }
      }
    }

    const onPreviewHover = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const row = target?.closest<HTMLElement>(".work-project-row");
      const wImg = row?.querySelector<HTMLElement>(".w-img") || target?.closest<HTMLElement>(".w-img");
      if (wImg && root.contains(wImg)) {
        syncPreviewScrollDistance(wImg);
      }
    };

    const onPreviewClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const pill = target?.closest<HTMLElement>(".preview-scroll-pill");
      if (!pill || !root.contains(pill)) return;
      event.preventDefault();
      event.stopPropagation();
      const wImg = pill.closest<HTMLElement>(".w-img");
      if (wImg) {
        const isScrolling = wImg.classList.toggle("is-scrolling");
        pill.innerHTML = isScrolling ? "<span>❚❚</span> Reset" : "<span>▶</span> Preview Scroll";
        syncPreviewScrollDistance(wImg);
      }
    };

    root.addEventListener("click", onClick);
    root.addEventListener("click", onPreviewClick);
    root.addEventListener("mouseover", onPreviewHover);
    root.addEventListener("focusin", onPreviewHover);
    root.addEventListener("keydown", onKey);

    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("click", onPreviewClick);
      root.removeEventListener("mouseover", onPreviewHover);
      root.removeEventListener("focusin", onPreviewHover);
      root.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
