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

export type DeferredRecaptchaController = {
  getWidget: () => Promise<RecaptchaV2Widget>;
  cleanup: () => void;
};

/**
 * Defers reCAPTCHA script loading and rendering until:
 * 1) Form is within 300px of viewport, OR
 * 2) User interacts with any input in the form, OR
 * 3) Submit is triggered (await getWidget())
 */
export function setupDeferredRecaptcha(options: {
  form: HTMLElement;
  container: HTMLElement;
  siteKey: string;
  onToken?: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
}): DeferredRecaptchaController {
  const { form, container, siteKey, onToken, onExpired, onError } = options;
  let widgetPromise: Promise<RecaptchaV2Widget> | null = null;
  let activeWidget: RecaptchaV2Widget | null = null;
  let cleanedUp = false;
  let observer: IntersectionObserver | null = null;

  const triggerLoad = (): Promise<RecaptchaV2Widget> => {
    if (widgetPromise) return widgetPromise;
    cleanupTriggers();
    widgetPromise = renderRecaptchaV2({
      container,
      siteKey,
      onToken,
      onExpired,
      onError,
    }).then((w) => {
      if (cleanedUp) {
        w.reset();
        return w;
      }
      activeWidget = w;
      return w;
    });
    return widgetPromise;
  };

  const onInteraction = () => {
    triggerLoad();
  };

  const cleanupTriggers = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    form.removeEventListener("focusin", onInteraction);
    form.removeEventListener("pointerdown", onInteraction);
    form.removeEventListener("touchstart", onInteraction);
    form.removeEventListener("input", onInteraction);
  };

  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggerLoad();
            break;
          }
        }
      },
      { rootMargin: "80px" }
    );
    observer.observe(form);
  } else {
    triggerLoad();
  }

  form.addEventListener("focusin", onInteraction, { passive: true, once: true });
  form.addEventListener("pointerdown", onInteraction, { passive: true, once: true });
  form.addEventListener("touchstart", onInteraction, { passive: true, once: true });
  form.addEventListener("input", onInteraction, { passive: true, once: true });

  return {
    getWidget: () => triggerLoad(),
    cleanup: () => {
      cleanedUp = true;
      cleanupTriggers();
      if (activeWidget) {
        activeWidget.reset();
        activeWidget = null;
      }
      widgetPromise = null;
    },
  };
}

