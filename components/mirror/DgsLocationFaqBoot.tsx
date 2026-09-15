"use client";

import { useEffect } from "react";

export function DgsLocationFaqBoot() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dgs-wp-mirror-inner");
    if (!root || !root.querySelector(".dgs-faq-item")) return;

    const toggle = (question: HTMLElement) => {
      const item = question.closest<HTMLElement>(".dgs-faq-item");
      if (!item) return;
      const group = item.closest(".dgs-faq") || root;
      const open = !item.classList.contains("on");
      for (const other of group.querySelectorAll<HTMLElement>(".dgs-faq-item.on")) {
        if (other !== item) {
          other.classList.remove("on");
          other.querySelector(".dgs-faq-q")?.setAttribute("aria-expanded", "false");
        }
      }
      item.classList.toggle("on", open);
      question.setAttribute("aria-expanded", String(open));
    };

    const onClick = (event: Event) => {
      const q = (event.target as HTMLElement | null)?.closest<HTMLElement>(".dgs-faq-q");
      if (!q || !root.contains(q)) return;
      event.preventDefault();
      toggle(q);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const q = (event.target as HTMLElement | null)?.closest<HTMLElement>(".dgs-faq-q");
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
