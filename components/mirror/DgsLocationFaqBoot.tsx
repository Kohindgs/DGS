"use client";

import { useEffect } from "react";

export function DgsLocationFaqBoot() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dgs-wp-mirror-inner") || document.body;
    const faqItems = root.querySelectorAll<HTMLElement>(".dgs-faq-item");
    if (!faqItems.length) return;

    // Initialize accessibility attributes on all FAQ questions (both .dgs-faq-question and .dgs-faq-q)
    for (const item of faqItems) {
      const q = item.querySelector<HTMLElement>(".dgs-faq-question, .dgs-faq-q");
      if (q) {
        if (!q.hasAttribute("role")) q.setAttribute("role", "button");
        if (!q.hasAttribute("tabindex")) q.setAttribute("tabindex", "0");
        const isOpen = item.classList.contains("active") || item.classList.contains("on");
        q.setAttribute("aria-expanded", String(isOpen));
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
        }
      }

      // Toggle current item (supports both active and on classes for both variants)
      item.classList.toggle("active", willOpen);
      item.classList.toggle("on", willOpen);
      question.setAttribute("aria-expanded", String(willOpen));
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

    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);

    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
