"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFormDefinitionForRoute } from "@/lib/forms/registry";
// Uses renderRecaptchaV2 deferred via setupDeferredRecaptcha
import {
  ensureHomepageRecaptchaHost,
  setupDeferredRecaptcha,
  type DeferredRecaptchaController,
} from "./captcha-client";

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
  host.style.color = status === "success" ? "#10b981" : "#ff4d4f";
  host.style.fontWeight = "500";
}

function clearFieldErrors(form: HTMLFormElement) {
  for (const control of form.querySelectorAll(".dgs-field-error")) {
    control.classList.remove("dgs-field-error");
  }
  for (const msg of form.querySelectorAll(".dgs-inline-error")) {
    msg.remove();
  }
}

function applyFieldErrors(form: HTMLFormElement, fieldErrors: Record<string, string>) {
  clearFieldErrors(form);
  for (const [fieldName, errorMsg] of Object.entries(fieldErrors)) {
    if (fieldName === "g-recaptcha-response" || fieldName === "captcha") continue;

    let control = form.querySelector<HTMLElement>(`[name="${fieldName}"]`);
    if (!control && !fieldName.endsWith("[]")) {
      control = form.querySelector<HTMLElement>(`[name="${fieldName}[]"]`);
    }
    if (!control) continue;

    control.classList.add("dgs-field-error");

    const group = control.closest(".ff-el-group") || control.parentElement;
    if (group && !group.querySelector(".dgs-inline-error")) {
      const errEl = document.createElement("div");
      errEl.className = "dgs-inline-error";
      errEl.textContent = errorMsg;
      errEl.style.color = "#ff4d4f";
      errEl.style.fontSize = "12px";
      errEl.style.marginTop = "4px";
      errEl.style.lineHeight = "1.3";
      group.appendChild(errEl);
    }

    const removeError = () => {
      control?.classList.remove("dgs-field-error");
      const err = group?.querySelector(".dgs-inline-error");
      if (err) err.remove();
      control?.removeEventListener("input", removeError);
      control?.removeEventListener("change", removeError);
    };

    control.addEventListener("input", removeError, { once: true });
    control.addEventListener("change", removeError, { once: true });
  }
}

function recaptchaHost(form: HTMLFormElement): HTMLElement {
  const existing = form.querySelector<HTMLElement>("[data-dgs-recaptcha-widget]");
  if (existing) return existing;
  const wpWidget = form.querySelector<HTMLElement>(".g-recaptcha, .ff-el-recaptcha, .cf-turnstile, .ff-el-turnstile");
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
    form.noValidate = true;

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

    const urlInput = form.querySelector<HTMLInputElement>("input[type='url'], input[name='url']");
    if (urlInput && !urlInput.placeholder) {
      urlInput.placeholder = "https://www.example.com";
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
    let deferredCaptcha: DeferredRecaptchaController | null = null;

    const recaptchaEnabled = Boolean(
      definition.captcha?.enabled && definition.captcha.provider === "recaptcha" && definition.captcha.publicSiteKey,
    );

    if (recaptchaEnabled && definition.captcha?.publicSiteKey) {
      const host = recaptchaHost(form);
      deferredCaptcha = setupDeferredRecaptcha({
        form,
        container: host,
        siteKey: definition.captcha.publicSiteKey,
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
      clearFieldErrors(form);
      setFeedback(form, "submitting", "");

      try {
        const fields: Record<string, string> = {};
        const data = new FormData(form);
        for (const [key, value] of data.entries()) {
          if (typeof value !== "string") continue;
          if (!visibleFieldNames.has(key)) continue;
          let val = value.trim();
          if (key === "url" && val && !/^https?:\/\//i.test(val)) {
            val = `https://${val}`;
          }
          fields[key] = val;
        }

        const clientErrors: Record<string, string> = {};
        for (const field of definition.fields) {
          if (field.hidden || field.type === "captcha") continue;
          const val = fields[field.name];
          if (field.required && (!val || !val.trim())) {
            clientErrors[field.name] = field.validationMessages?.required || `${field.label || "This field"} is required`;
          }
        }

        if (Object.keys(clientErrors).length > 0) {
          applyFieldErrors(form, clientErrors);
          setFeedback(form, "backend-error", "Please correct the highlighted fields and try again.");
          restoreSubmitChrome();
          return;
        }

        let captchaToken: string | undefined;
        if (recaptchaEnabled && deferredCaptcha) {
          const widget = await deferredCaptcha.getWidget();
          captchaToken = widget?.getToken();
          if (!captchaToken) {
            setFeedback(form, "backend-error", "CAPTCHA verification is required");
            restoreSubmitChrome();
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

        let result: { ok?: boolean; message?: string; fieldErrors?: Record<string, string> } = {};
        try {
          result = (await response.json()) as typeof result;
        } catch {
          setFeedback(form, "network-error", "Network error while submitting the form. Please try again.");
          return;
        }

        if (!response.ok || !result.ok) {
          if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
            applyFieldErrors(form, result.fieldErrors);
          }
          const state = response.status >= 500 ? "network-error" : "backend-error";
          setFeedback(form, state, result.message || definition.failureMessage || "Submission failed");
          return;
        }

        clearFieldErrors(form);
        setFeedback(form, "success", result.message || definition.confirmation?.message || "Thank you for your submission.");
        form.reset();
      } catch {
        setFeedback(form, "network-error", "Network error while submitting the form. Please try again.");
      } finally {
        if (deferredCaptcha) {
          deferredCaptcha.getWidget().then((w) => w?.reset()).catch(() => {});
        }
        restoreSubmitChrome();
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => {
      form.removeEventListener("submit", onSubmit);
      deferredCaptcha?.cleanup();
      delete form.dataset.dgsBridgeBound;
    };
  }, [pathname]);

  return null;
}
