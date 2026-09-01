"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFormDefinitionForRoute } from "@/lib/forms/registry";
import { ensureHomepageRecaptchaHost, renderRecaptchaV2, type RecaptchaV2Widget } from "./captcha-client";

function normalizeRoutePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
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

function recaptchaHost(form: HTMLFormElement): HTMLElement {
  const existing = form.querySelector<HTMLElement>("[data-dgs-recaptcha-widget]");
  if (existing) return existing;
  const wpWidget = form.querySelector<HTMLElement>(".g-recaptcha, .ff-el-recaptcha");
  if (wpWidget) {
    wpWidget.setAttribute("data-dgs-recaptcha-widget", "true");
    wpWidget.replaceChildren();
    return wpWidget;
  }
  return ensureHomepageRecaptchaHost(form);
}

/**
 * Binds WordPress Fluent Form markup on inner pages to the Next.js submit API.
 * Does not replace WP form HTML. Homepage service-label normalization is not applied.
 */
export function InnerFormBridge() {
  const pathname = usePathname();

  useEffect(() => {
    const route = normalizeRoutePath(pathname || "/");
    if (route === "/") return;

    const definition = getFormDefinitionForRoute(route);
    if (!definition?.activationEnabled) return;

    const form = document.getElementById(`fluentform_${definition.fluentFormId}`);
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.dgsBridgeBound === "1") return;
    form.dataset.dgsBridgeBound = "1";

    form.setAttribute("data-submission", "enabled");
    form.setAttribute("data-migration-form", "true");
    form.setAttribute("data-wordpress-form", String(definition.fluentFormId));
    form.setAttribute("data-route", route);
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

    const button = form.querySelector<HTMLButtonElement>(
      "button.ff-btn-submit, button[type='button'], button[type='submit']",
    );
    if (button) {
      button.disabled = false;
      button.removeAttribute("aria-disabled");
      button.type = "submit";
      button.textContent = definition.submitButtonText || button.textContent || "Submit Form";
    }

    const visibleFieldNames = new Set(
      definition.fields.filter((field) => !field.hidden && field.type !== "captcha").map((field) => field.name),
    );

    let submitting = false;
    let captchaWidget: RecaptchaV2Widget | null = null;
    let cancelled = false;

    const recaptchaEnabled = Boolean(
      definition.captcha?.enabled && definition.captcha.provider === "recaptcha" && definition.captcha.publicSiteKey,
    );

    if (recaptchaEnabled && definition.captcha?.publicSiteKey) {
      const host = recaptchaHost(form);
      renderRecaptchaV2({ container: host, siteKey: definition.captcha.publicSiteKey })
        .then((widget) => {
          if (cancelled) {
            widget.reset();
            return;
          }
          captchaWidget = widget;
        })
        .catch(() => {
          if (!cancelled) captchaWidget = null;
        });
    }

    const restoreSubmitChrome = () => {
      submitting = false;
      if (button) {
        button.disabled = false;
        button.textContent = definition.submitButtonText || "Submit Form";
      }
      if (form.getAttribute("data-form-status") === "submitting") {
        form.setAttribute("data-form-status", "idle");
      }
    };

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
          if (typeof value !== "string") continue;
          if (!visibleFieldNames.has(key)) continue;
          fields[key] = value;
        }

        let captchaToken: string | undefined;
        if (recaptchaEnabled) {
          captchaToken = captchaWidget?.getToken();
          if (!captchaToken) {
            setFeedback(form, "backend-error", "CAPTCHA verification is required");
            return;
          }
        }

        const response = await fetch("/api/forms/submit/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            fluentFormId: definition.fluentFormId,
            route,
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
        captchaWidget?.reset();
        restoreSubmitChrome();
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => {
      cancelled = true;
      form.removeEventListener("submit", onSubmit);
      captchaWidget?.reset();
      delete form.dataset.dgsBridgeBound;
    };
  }, [pathname]);

  return null;
}
