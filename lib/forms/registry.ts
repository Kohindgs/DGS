import definitions from "@/data/forms/definitions.approved.json";
import type { FormDefinition } from "./types";

const forms = definitions.forms as FormDefinition[];
const byKey = new Map(forms.map((form) => [form.key, form]));

export function getFormDefinition(key: string): FormDefinition {
  const definition = byKey.get(key);
  if (!definition) {
    throw new Error(
      `Form definition '${key}' is not approved. Authenticated Fluent Forms extraction is required before wiring this form.`,
    );
  }
  return definition;
}

export function listApprovedForms() {
  return [...forms];
}
