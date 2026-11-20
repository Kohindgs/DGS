"use client";

import { useEffect, useState } from "react";
import { useChrome } from "@/components/layout/ChromeProvider";
import { useBodyScrollLock, useFocusTrap } from "@/components/layout/useFocusTrap";
import { PublicLeadForm } from "@/components/forms/PublicLeadForm";
import styles from "./LetsTalkModal.module.css";

export function LetsTalkModal() {
  const { letsTalkOpen, openLetsTalk, closeLetsTalk } = useChrome();
  const trapRef = useFocusTrap(letsTalkOpen, closeLetsTalk);
  useBodyScrollLock(letsTalkOpen);
  const [currentRoute, setCurrentRoute] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentRoute(window.location.pathname || "/");
    }
  }, [letsTalkOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      dgsOpenTalkPopup?: (event?: Event) => void;
      dgsCloseTalkPopup?: () => void;
      dgsUnlockScroll?: () => void;
    };

    const handleOpen = (event?: Event) => {
      if (event) event.preventDefault();
      const nav = document.getElementById("dgsNav");
      const label = document.getElementById("dgsTrigLabel");
      if (nav && nav.classList.contains("nav-open")) {
        nav.classList.remove("nav-open");
        if (label) label.textContent = "MENU";
        if (typeof w.dgsUnlockScroll === "function") w.dgsUnlockScroll();
      }
      openLetsTalk();
    };

    const handleClose = () => {
      closeLetsTalk();
    };

    w.dgsOpenTalkPopup = handleOpen;
    w.dgsCloseTalkPopup = handleClose;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".dgs-talk-trigger")) {
        handleOpen(e);
      } else if (target.closest("[data-dgs-talk-close]")) {
        handleClose();
      }
    };

    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("click", onDocClick);
    };
  }, [openLetsTalk, closeLetsTalk]);

  return (
    <div
      id="dgsTalkPopup"
      className={`${styles.overlay} ${letsTalkOpen ? "is-open" : ""}`}
      role="presentation"
      aria-hidden={!letsTalkOpen}
      data-dgs-talk-close="true"
      onClick={closeLetsTalk}
    >
      <div
        ref={trapRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lets-talk-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          data-dgs-talk-close="true"
          onClick={closeLetsTalk}
          aria-label="Close dialog"
        >
          ×
        </button>
        <p className={styles.eyebrow}>Start a Conversation</p>
        <h2 id="lets-talk-title">Let&apos;s Talk Growth</h2>
        <p className={styles.lead}>
          Tell us what you want to build, improve, or scale. Our team will get back with the next best step.
        </p>
        <PublicLeadForm id="lets-talk-form" route={currentRoute} className={styles.modalForm} />
      </div>
    </div>
  );
}
