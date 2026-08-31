"use client";

import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react";
import styles from "./FluentLeadForm.module.css";
import type { FormDefinition, FormFieldDefinition } from "@/lib/forms/types";

type FluentLeadFormProps = {
  id?: string;
  route: string;
  definition: FormDefinition;
  className?: string;
  compact?: boolean;
};

function visibleFields(definition: FormDefinition): FormFieldDefinition[] {
  return definition.fields.filter((field) => !field.hidden && field.type !== "captcha");
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

async function obtainCaptchaToken(definition: FormDefinition): Promise<string | undefined> {
  if (!definition.captcha?.enabled || !definition.captcha.publicSiteKey) return undefined;
  const siteKey = definition.captcha.publicSiteKey;
  if (definition.captcha.provider === "turnstile") {
    await loadScript("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", "cf-turnstile-api");
    return new Promise((resolve, reject) => {
      const host = document.createElement("div");
      host.style.display = "none";
      document.body.appendChild(host);
      const widgetId = window.turnstile?.render(host, {
        sitekey: siteKey,
        size: "invisible",
        callback: (token: string) => {
          host.remove();
          resolve(token);
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

  await loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`, "recaptcha-api");
  await new Promise<void>((resolve) => window.grecaptcha?.ready(() => resolve()));
  return window.grecaptcha?.execute(siteKey, { action: "fluentform_submit" });
}

export function FluentLeadForm({ id = "contact-form", route, definition, className }: FluentLeadFormProps) {
  const fields = useMemo(() => visibleFields(definition), [definition]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of definition.fields) {
      if (field.defaultValue) initial[field.name] = field.defaultValue;
    }
    return initial;
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "backend-error" | "network-error"
  >("idle");
  const [message, setMessage] = useState("");
  const submittingRef = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Duplicate-click / in-flight guard
    if (submittingRef.current || status === "submitting") return;
    submittingRef.current = true;
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});

    try {
      const captchaToken = await obtainCaptchaToken(definition);
      const payloadFields: Record<string, string> = {};
      for (const field of fields) {
        payloadFields[field.name] = values[field.name] || "";
      }

      const response = await fetch("/api/forms/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          fluentFormId: definition.fluentFormId,
          route,
          fields: payloadFields,
          captchaToken,
        }),
      });

      let result: {
        ok?: boolean;
        message?: string;
        fieldErrors?: Record<string, string>;
      } = {};
      try {
        result = (await response.json()) as typeof result;
      } catch {
        setStatus("network-error");
        setMessage("Network error while submitting the form. Please try again.");
        return;
      }

      if (!response.ok || !result.ok) {
        const isNetwork = response.status >= 500 || response.status === 0;
        setStatus(isNetwork ? "network-error" : "backend-error");
        setMessage(result.message || definition.failureMessage || "Submission failed");
        setFieldErrors(result.fieldErrors || {});
        return;
      }

      setStatus("success");
      setMessage(result.message || definition.confirmation?.message || "Thank you for your submission.");
      setValues((current) => {
        const next = { ...current };
        for (const field of fields) next[field.name] = "";
        return next;
      });
    } catch {
      setStatus("network-error");
      setMessage("Network error while submitting the form. Please try again.");
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form
      id={id}
      className={className || styles.form}
      data-migration-form
      data-wordpress-form={String(definition.fluentFormId)}
      data-route={route}
      data-submission="enabled"
      data-form-status={status}
      onSubmit={onSubmit}
      noValidate
    >
      {fields.map((field) => {
        const error = fieldErrors[field.name];
        const inputId = `${id}-${field.name.replace(/[^a-z0-9]+/gi, "-")}`;
        const common = {
          id: inputId,
          name: field.name,
          value: values[field.name] || "",
          required: field.required,
          "aria-required": field.required || undefined,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${inputId}-error` : undefined,
          placeholder: field.placeholder || field.label,
          onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setValues((current) => ({ ...current, [field.name]: event.target.value })),
        };

        return (
          <label key={field.name} className={styles.field} data-migration-field={field.name}>
            <span className={styles.label}>
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.type === "textarea" ? (
              <textarea {...common} rows={5} />
            ) : field.type === "select" ? (
              <select {...common}>
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...common}
                type={field.type === "tel" ? "tel" : field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
              />
            )}
            {error ? (
              <span id={`${inputId}-error`} className={styles.error} role="alert">
                {error}
              </span>
            ) : null}
          </label>
        );
      })}

      {status === "success" ? (
        <p className={styles.success} role="status" data-form-feedback="success">
          {message}
        </p>
      ) : null}
      {(status === "backend-error" || status === "network-error") && message ? (
        <p className={styles.errorBanner} role="alert" data-form-feedback={status}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
        aria-disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting…" : definition.submitButtonText || "Submit Form"}
      </button>
    </form>
  );
}
