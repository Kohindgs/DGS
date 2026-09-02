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

    for (const item of root.querySelectorAll<HTMLElement>(".faq-item")) {
      setAnswerOpen(item, item.classList.contains("active"));
    }

    const onClick = (event: Event) => {
      const question = (event.target as HTMLElement | null)?.closest?.(".faq-q, .faq-item button");
      if (!question || !root.contains(question)) return;
      const item = closestFaqItem(question);
      if (!item) return;
      event.preventDefault();
      const shouldOpen = !item.classList.contains("active");
      const container = item.closest(".faq-container") || root;
      for (const other of container.querySelectorAll<HTMLElement>(".faq-item.active")) {
        if (other !== item) setAnswerOpen(other, false);
      }
      setAnswerOpen(item, shouldOpen);
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return null;
}
