"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./FluentLeadForm.module.css";
import type { FormDefinition, FormFieldDefinition } from "@/lib/forms/types";
import { obtainTurnstileToken, renderRecaptchaV2, type RecaptchaV2Widget } from "./captcha-client";

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

function usesRecaptchaV2(definition: FormDefinition) {
  return Boolean(
    definition.captcha?.enabled &&
      definition.captcha.provider === "recaptcha" &&
      definition.captcha.publicSiteKey,
  );
}

export function FluentLeadForm({ id = "contact-form", route, definition, className }: FluentLeadFormProps) {
  const fields = useMemo(() => visibleFields(definition), [definition]);
  const recaptchaEnabled = usesRecaptchaV2(definition);
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
  const captchaHostRef = useRef<HTMLDivElement>(null);
  const captchaWidgetRef = useRef<RecaptchaV2Widget | null>(null);

  useEffect(() => {
    if (!recaptchaEnabled || !definition.captcha?.publicSiteKey || !captchaHostRef.current) return;
    const host = captchaHostRef.current;
    let cancelled = false;

    renderRecaptchaV2({ container: host, siteKey: definition.captcha.publicSiteKey })
      .then((widget) => {
        if (cancelled) {
          widget.reset();
          return;
        }
        captchaWidgetRef.current = widget;
      })
      .catch(() => {
        if (!cancelled) captchaWidgetRef.current = null;
      });

    return () => {
      cancelled = true;
      captchaWidgetRef.current?.reset();
      captchaWidgetRef.current = null;
      host.replaceChildren();
    };
  }, [definition, recaptchaEnabled]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || status === "submitting") return;
    submittingRef.current = true;
    setStatus("submitting");
    setMessage("");
    setFieldErrors({});

    try {
      let captchaToken: string | undefined;
      if (recaptchaEnabled) {
        captchaToken = captchaWidgetRef.current?.getToken();
        if (!captchaToken) {
          setStatus("backend-error");
          setFieldErrors({ captcha: "CAPTCHA verification is required" });
          setMessage("CAPTCHA verification is required");
          return;
        }
      } else if (definition.captcha?.enabled && definition.captcha.provider === "turnstile" && definition.captcha.publicSiteKey) {
        captchaToken = await obtainTurnstileToken(definition.captcha.publicSiteKey);
      }

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
      captchaWidgetRef.current?.reset();
      setStatus((current) => (current === "submitting" ? "idle" : current));
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

      {recaptchaEnabled ? (
        <div className={styles.captcha} data-migration-field="captcha">
          <div ref={captchaHostRef} data-recaptcha-v2-host="true" />
          {fieldErrors.captcha ? (
            <span className={styles.error} role="alert">
              {fieldErrors.captcha}
            </span>
          ) : null}
        </div>
      ) : null}

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
