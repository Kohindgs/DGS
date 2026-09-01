"use client";

export const RECAPTCHA_EXPLICIT_SCRIPT = "https://www.google.com/recaptcha/api.js?render=explicit";
export const RECAPTCHA_EXPLICIT_SCRIPT_ID = "recaptcha-api-explicit";
export const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
export const TURNSTILE_SCRIPT_ID = "cf-turnstile-api";

type RecaptchaRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark";
};

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (el: HTMLElement | string, options: RecaptchaRenderOptions) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export type RecaptchaV2Widget = {
  widgetId: number;
  getToken: () => string;
  reset: () => void;
};

function loadScript(src: string, id: string) {
  if (typeof document === "undefined") return Promise.reject(new Error("No document"));
  const existing = document.getElementById(id);
  if (existing) {
    if (window.grecaptcha?.render || (id === TURNSTILE_SCRIPT_ID && window.turnstile?.render)) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    });
  }
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

export async function loadRecaptchaExplicit(): Promise<void> {
  await loadScript(RECAPTCHA_EXPLICIT_SCRIPT, RECAPTCHA_EXPLICIT_SCRIPT_ID);
  await new Promise<void>((resolve, reject) => {
    if (!window.grecaptcha?.ready) {
      reject(new Error("reCAPTCHA API unavailable"));
      return;
    }
    window.grecaptcha.ready(() => resolve());
  });
}

export async function renderRecaptchaV2(options: {
  container: HTMLElement;
  siteKey: string;
  onToken?: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
}): Promise<RecaptchaV2Widget> {
  const { container, siteKey, onToken, onExpired, onError } = options;
  await loadRecaptchaExplicit();
  if (!window.grecaptcha?.render) throw new Error("reCAPTCHA render unavailable");

  let token = "";
  container.replaceChildren();
  const widgetId = window.grecaptcha.render(container, {
    sitekey: siteKey,
    callback: (value: string) => {
      token = value || "";
      onToken?.(token);
    },
    "expired-callback": () => {
      token = "";
      onExpired?.();
    },
    "error-callback": () => {
      token = "";
      onError?.();
    },
  });

  return {
    widgetId,
    getToken: () => {
      try {
        return window.grecaptcha?.getResponse(widgetId) || token;
      } catch {
        return token;
      }
    },
    reset: () => {
      token = "";
      try {
        window.grecaptcha?.reset(widgetId);
      } catch {
        /* widget may already be gone */
      }
    },
  };
}

export async function obtainTurnstileToken(siteKey: string): Promise<string> {
  await loadScript(TURNSTILE_SCRIPT, TURNSTILE_SCRIPT_ID);
  return new Promise((resolve, reject) => {
    const host = document.createElement("div");
    host.style.display = "none";
    document.body.appendChild(host);
    const widgetId = window.turnstile?.render(host, {
      sitekey: siteKey,
      size: "invisible",
      callback: (value: string) => {
        host.remove();
        resolve(value);
      },
      "error-callback": () => {
        host.remove();
        reject(new Error("CAPTCHA failed"));
      },
    });
    if (!widgetId) {
      host.remove();
      reject(new Error("Turnstile unavailable"));
    }
  });
}

export function ensureHomepageRecaptchaHost(form: HTMLFormElement): HTMLElement {
  const existing = form.querySelector<HTMLElement>("[data-dgs-recaptcha-widget]");
  if (existing) return existing;

  const host = document.createElement("div");
  host.setAttribute("data-dgs-recaptcha-host", "true");
  host.className = "ff-el-group ff-el-recaptcha";
  const widget = document.createElement("div");
  widget.setAttribute("data-dgs-recaptcha-widget", "true");
  host.appendChild(widget);

  const submitWrap = form.querySelector(".ff_submit_btn_wrapper");
  if (submitWrap?.parentElement) submitWrap.parentElement.insertBefore(host, submitWrap);
  else form.appendChild(host);
  return widget;
}
