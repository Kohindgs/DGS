import fs from "fs";
import { getFormDefinitionById, listApprovedForms } from "./lib/forms/registry.ts";
import { submitNativeLeadForm } from "./lib/forms/native/submit.ts";

async function main() {
  console.log("=== RUNNING FULL SYNTHETIC QA ON ALL APPROVED FORMS ===");
  const forms = listApprovedForms();
  console.log(`Loaded ${forms.length} approved form definitions.\n`);

  const results = [];

  for (const form of forms) {
    const routes = form.sourceRoutes || (form.sourceRoute ? [form.sourceRoute] : []);
    const targetRoute = routes[0] || "/";

    // Build fields matching definition
    const fields = {};
    for (const field of form.fields) {
      if (field.hidden) {
        if (field.defaultValue) fields[field.name] = String(field.defaultValue);
        continue;
      }
      if (field.type === "captcha") continue;

      const lower = field.name.toLowerCase();
      const labelLower = field.label.toLowerCase();

      if (field.type === "email" || lower.includes("email")) {
        fields[field.name] = "business@dgeniussolutions.com";
      } else if (field.type === "tel" || lower.includes("phone") || labelLower.includes("phone") || labelLower.includes("mobile")) {
        fields[field.name] = "+91 99879 22901";
      } else if (field.type === "url" || lower.includes("url") || labelLower.includes("website")) {
        fields[field.name] = "https://www.dgeniussolutions.com";
      } else if (field.type === "select" || field.type === "radio") {
        const opt = field.options?.[0]?.value || field.options?.[0]?.label || "General";
        fields[field.name] = String(opt);
      } else if (field.type === "checkbox") {
        const opt = field.options?.[0]?.value || "1";
        fields[field.name] = String(opt);
      } else if (field.type === "textarea" || lower.includes("message") || lower.includes("tell") || lower.includes("requirement") || lower.includes("description")) {
        fields[field.name] = "Automated production form QA synthetic submission — safe to ignore";
      } else if (lower.includes("company") || labelLower.includes("company") || labelLower.includes("brand")) {
        fields[field.name] = "DGS INTERNAL QA";
      } else if (lower.includes("name") || labelLower.includes("name")) {
        fields[field.name] = "DGS FORM QA TEST";
      } else {
        fields[field.name] = "QA Input";
      }
    }

    if (form.fields.some((f) => f.name === "names[first_name]")) fields["names[first_name]"] = "DGS FORM QA";
    if (form.fields.some((f) => f.name === "names[last_name]")) fields["names[last_name]"] = "TEST";
    if (form.fields.some((f) => f.name === "full_name[first_name]")) fields["full_name[first_name]"] = "DGS FORM QA";
    if (form.fields.some((f) => f.name === "full_name[last_name]")) fields["full_name[last_name]"] = "TEST";
    if (form.fields.some((f) => f.name === "input_text_1")) fields["input_text_1"] = "DGS FORM QA";

    try {
      const res = await submitNativeLeadForm({
        definition: form,
        route: targetRoute,
        sanitizedFields: fields,
        skipCaptcha: true,
      });

      const pass = res.ok && Boolean(res.leadId);
      console.log(
        `[FORM #${String(form.fluentFormId).padStart(2)}] ${form.key.padEnd(16)} on ${targetRoute.padEnd(42)} -> ok: ${res.ok} | leadId: ${String(res.leadId).slice(0, 8)}... | msg: ${res.message.slice(0, 30)}... : ${pass ? "PASS" : "FAIL"}`
      );
      results.push({ formId: form.fluentFormId, key: form.key, route: targetRoute, ok: res.ok, leadId: res.leadId, pass });
    } catch (err) {
      console.log(
        `[FORM #${String(form.fluentFormId).padStart(2)}] ${form.key.padEnd(16)} on ${targetRoute} -> ERROR: ${err.message} : FAIL`
      );
      results.push({ formId: form.fluentFormId, key: form.key, route: targetRoute, ok: false, error: err.message, pass: false });
    }
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} / ${forms.length} FORMS PASSED VERIFICATION`);
  console.log(`==================================================`);
}

main().catch(console.error);
