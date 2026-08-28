"use client";

import { useChrome } from "@/components/layout/ChromeProvider";
import { useBodyScrollLock, useFocusTrap } from "@/components/layout/useFocusTrap";
import { PublicLeadForm } from "@/components/forms/PublicLeadForm";
import styles from "./LetsTalkModal.module.css";

export function LetsTalkModal() {
  const { letsTalkOpen, closeLetsTalk } = useChrome();
  const trapRef = useFocusTrap(letsTalkOpen, closeLetsTalk);
  useBodyScrollLock(letsTalkOpen);

  if (!letsTalkOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={closeLetsTalk}>
      <div
        ref={trapRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lets-talk-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.closeBtn} onClick={closeLetsTalk} aria-label="Close dialog">
          ×
        </button>
        <p className={styles.eyebrow}>Start a Conversation</p>
        <h2 id="lets-talk-title">Let&apos;s Talk Growth</h2>
        <p className={styles.lead}>
          Tell us what you want to build, improve, or scale. Our team will get back with the next best step.
        </p>
        <PublicLeadForm id="lets-talk-form" route="/" />
      </div>
    </div>
  );
}
