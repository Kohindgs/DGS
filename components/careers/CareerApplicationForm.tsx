"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    jQuery?: unknown;
    $?: unknown;
    fluentFormVars?: Record<string, unknown>;
    fluentform_submission_messages_global?: Record<string, string>;
    fluentform_address_messages_global?: Record<string, string>;
    [key: string]: unknown;
  }
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    document.body.appendChild(script);
  });
}

export function CareerApplicationForm() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const response = await fetch("/api/career/form", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok || !payload?.ok || typeof payload.html !== "string") {
          throw new Error(payload?.message || "Career form unavailable.");
        }

        if (cancelled || !mountRef.current) return;

        let html = payload.html;
        const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1] || "");
        html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

        mountRef.current.innerHTML = html;

        const position = new URLSearchParams(window.location.search).get("position");
        if (position) {
          const select = mountRef.current.querySelector<HTMLSelectElement>('select[name="dropdown"]');
          if (select && [...select.options].some((option) => option.value === position)) {
            select.value = position;
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }

        window.fluentFormVars = {
          ajaxUrl: "/api/career/fluent",
          forms: [],
          step_text: "Step %activeStep% of %totalStep% - %stepTitle%",
          step_completed_text: "Completed",
          is_rtl: false,
          date_i18n: {},
          pro_version: false,
          fluentform_version: "career-headless",
          force_init: true,
          stepAnimationDuration: 350,
          upload_completed_txt: "100% Completed",
          upload_start_txt: "0% Completed",
          uploading_txt: "Uploading",
          choice_js_vars: {
            noResultsText: "No results found",
            loadingText: "Loading...",
            noChoicesText: "No choices to choose from",
            itemSelectText: "Press to select",
            maxItemTextSingular: "Only %%maxItemCount%% option can be added",
            maxItemTextPlural: "Only %%maxItemCount%% options can be added",
          },
          input_mask_vars: { clearIfNotMatch: false },
          nonce: "",
          file_delete_nonce: "",
          form_id: 15,
          step_change_focus: true,
          has_cleantalk: false,
          pro_payment_script_compatible: false,
        };
        window.fluentform_submission_messages_global = {
          javascript_handler_failed:
            "Javascript handler could not be loaded. Form submission has failed. Reload the page and try again.",
        };
        window.fluentform_address_messages_global = {
          please_wait: "Please wait ...",
          location_not_determined: "Could not determine address from location.",
          address_fetch_failed: "Failed to fetch address from coordinates.",
          geolocation_failed: "Geolocation failed or was denied.",
          geolocation_not_supported: "Geolocation is not supported by this browser.",
        };
        window.fluentform_upload_messages_15 = {
          drag_drop_text: "Drag & Drop files here or click to browse",
          upload_text: "Choose File",
          max_file_error: "Maximum file size exceeded",
          file_type_error: "Invalid file type",
          file_size_error: "File size too large",
          upload_failed_text: "Sorry! The upload failed for some unknown reason.",
          upload_error_text: "Something is wrong when uploading the file! Please try again",
        };

        for (const source of scripts) {
          if (!source.trim()) continue;
          const patched = source
            .replaceAll("https://wp-origin.dgeniussolutions.com/wp-admin/admin-ajax.php", "/api/career/fluent")
            .replaceAll("https:\/\/wp-origin.dgeniussolutions.com\/wp-admin\/admin-ajax.php", "\/api\/career\/fluent");
          (0, eval)(patched);
        }

        await loadScript("/vendor/fluentforms/jquery.min.js", "dgs-career-jquery");
        await loadScript("/vendor/fluentforms/jquery.ui.widget.js", "dgs-career-uploader-widget");
        await loadScript("/vendor/fluentforms/jquery.iframe-transport.js", "dgs-career-uploader-transport");
        await loadScript("/vendor/fluentforms/jquery.fileupload.js", "dgs-career-uploader");
        await loadScript("/vendor/fluentforms/fluentform-advanced.js", "dgs-career-fluent-advanced");
        await loadScript("/vendor/fluentforms/form-submission.js", "dgs-career-fluent-submit");

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Career form unavailable.");
          setLoading(false);
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div>
      {loading ? <p aria-live="polite">Loading application form…</p> : null}
      {error ? (
        <p role="alert">
          {error} Please email your CV to hr@dgeniussolutions.com.
        </p>
      ) : null}
      <div ref={mountRef} />
    </div>
  );
}
