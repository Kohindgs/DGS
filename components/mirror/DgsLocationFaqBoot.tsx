"use client";

import { useEffect } from "react";

export function DgsLocationFaqBoot() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dgs-wp-mirror-inner") || document.body;
    const faqItems = root.querySelectorAll<HTMLElement>(".dgs-faq-item");
    if (!faqItems.length) return;

    // Initialize accessibility attributes on all FAQ questions
    for (const item of faqItems) {
      const q = item.querySelector<HTMLElement>(".dgs-faq-question");
      if (q) {
        if (!q.hasAttribute("role")) q.setAttribute("role", "button");
        if (!q.hasAttribute("tabindex")) q.setAttribute("tabindex", "0");
        const isActive = item.classList.contains("active");
        q.setAttribute("aria-expanded", String(isActive));
      }
    }

    const toggle = (question: HTMLElement) => {
      const item = question.closest<HTMLElement>(".dgs-faq-item");
      if (!item) return;

      const container = item.closest<HTMLElement>(".dgs-faq-container") || item.parentElement || root;
      const willOpen = !item.classList.contains("active");

      // Sibling closing: Close all other active items in this container
      for (const sibling of container.querySelectorAll<HTMLElement>(".dgs-faq-item.active")) {
        if (sibling !== item) {
          sibling.classList.remove("active");
          sibling.querySelector(".dgs-faq-question")?.setAttribute("aria-expanded", "false");
        }
      }

      // Toggle current item
      item.classList.toggle("active", willOpen);
      question.setAttribute("aria-expanded", String(willOpen));
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const q = target?.closest<HTMLElement>(".dgs-faq-question");
      if (!q || !root.contains(q)) return;
      event.preventDefault();
      toggle(q);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target as HTMLElement | null;
      const q = target?.closest<HTMLElement>(".dgs-faq-question");
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
