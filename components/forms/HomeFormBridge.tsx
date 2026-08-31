"use client";

import { useEffect } from "react";
import { getFormDefinitionForRoute } from "@/lib/forms/registry";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render?: (el: HTMLElement, options: Record<string, unknown>) => number;
    };
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function obtainRecaptchaToken(siteKey: string) {
  await loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`, "recaptcha-api");
  await new Promise<void>((resolve) => window.grecaptcha?.ready(() => resolve()));
  return window.grecaptcha?.execute(siteKey, { action: "fluentform_submit" });
}

function ensureFeedback(form: HTMLFormElement) {
  let node = form.querySelector<HTMLElement>("[data-form-feedback-host]");
  if (!node) {
    node = document.createElement("div");
    node.setAttribute("data-form-feedback-host", "true");
    node.style.margin = "0.75rem 0";
    const submitWrap = form.querySelector(".ff_submit_btn_wrapper");
    if (submitWrap?.parentElement) submitWrap.parentElement.insertBefore(node, submitWrap);
    else form.appendChild(node);
  }
  return node;
}

function setFeedback(form: HTMLFormElement, status: string, message: string) {
  form.setAttribute("data-form-status", status);
  const host = ensureFeedback(form);
  host.textContent = message;
  host.setAttribute("role", status === "success" ? "status" : "alert");
  host.style.color = status === "success" ? "#0a7a3e" : "#b00020";
}

/**
 * Activates the UI-locked homepage Fluent Form chrome without replacing its markup.
 * Preserves visual-source integrity while enabling same-origin submission.
 */
export function HomeFormBridge() {
  useEffect(() => {
    const definition = getFormDefinitionForRoute("/");
    if (!definition?.activationEnabled) return;

    const form = document.getElementById("fluentform_1");
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.dgsBridgeBound === "1") return;
    form.dataset.dgsBridgeBound = "1";

    form.setAttribute("data-submission", "enabled");
    form.setAttribute("data-migration-form", "true");
    form.setAttribute("data-wordpress-form", String(definition.fluentFormId));
    form.setAttribute("data-route", "/");
    form.setAttribute("data-form-status", "idle");
    form.removeAttribute("readonly");

    for (const control of form.querySelectorAll("input, textarea, select")) {
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
        control.readOnly = false;
      }
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLTextAreaElement ||
        control instanceof HTMLSelectElement
      ) {
        control.disabled = false;
      }
    }

    const button = form.querySelector<HTMLButtonElement>("button.ff-btn-submit, button[type='button'], button[type='submit']");
    if (button) {
      button.disabled = false;
      button.removeAttribute("aria-disabled");
      button.type = "submit";
      button.textContent = definition.submitButtonText || button.textContent || "Submit Form";
    }

    let submitting = false;

    const onSubmit = async (event: Event) => {
      event.preventDefault();
      if (submitting || form.getAttribute("data-form-status") === "submitting") return;
      submitting = true;
      form.setAttribute("data-form-status", "submitting");
      if (button) {
        button.disabled = true;
        button.textContent = "Submitting…";
      }
      setFeedback(form, "submitting", "");

      try {
        const fields: Record<string, string> = {};
        const data = new FormData(form);
        for (const [key, value] of data.entries()) {
          if (typeof value === "string") fields[key] = value;
        }
        for (const field of definition.fields) {
          if (field.hidden && field.defaultValue && !fields[field.name]) {
            fields[field.name] = field.defaultValue;
          }
        }

        let captchaToken: string | undefined;
        if (definition.captcha?.enabled && definition.captcha.publicSiteKey) {
          captchaToken = await obtainRecaptchaToken(definition.captcha.publicSiteKey);
        }

        const response = await fetch("/api/forms/submit/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            fluentFormId: definition.fluentFormId,
            route: "/",
            fields,
            captchaToken,
          }),
        });

        let result: { ok?: boolean; message?: string } = {};
        try {
          result = (await response.json()) as typeof result;
        } catch {
          setFeedback(form, "network-error", "Network error while submitting the form. Please try again.");
          return;
        }

        if (!response.ok || !result.ok) {
          const state = response.status >= 500 ? "network-error" : "backend-error";
          setFeedback(form, state, result.message || definition.failureMessage || "Submission failed");
          return;
        }

        setFeedback(form, "success", result.message || definition.confirmation?.message || "Thank you for your submission.");
        form.reset();
      } catch {
        setFeedback(form, "network-error", "Network error while submitting the form. Please try again.");
      } finally {
        submitting = false;
        if (button) {
          button.disabled = false;
          button.textContent = definition.submitButtonText || "Submit Form";
        }
        if (form.getAttribute("data-form-status") === "submitting") {
          form.setAttribute("data-form-status", "idle");
        }
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => {
      form.removeEventListener("submit", onSubmit);
      delete form.dataset.dgsBridgeBound;
    };
  }, []);

  return null;
}
