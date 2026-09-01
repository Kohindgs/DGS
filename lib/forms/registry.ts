import definitions from "@/data/forms/definitions.approved.json";
import type { FormDefinition } from "./types";

const forms = ((definitions as { forms?: unknown }).forms || []) as unknown as FormDefinition[];
const byKey = new Map(forms.map((form) => [form.key, form]));
const byId = new Map(forms.map((form) => [Number(form.fluentFormId), form]));
const byRoute = new Map<string, FormDefinition>();

for (const form of forms) {
  const routes = form.sourceRoutes?.length ? form.sourceRoutes : form.sourceRoute ? [form.sourceRoute] : [];
  for (const route of routes) {
    byRoute.set(route, form);
  }
}

export const APPROVED_FORM_IDS = forms.map((form) => Number(form.fluentFormId));

export function listApprovedForms(): FormDefinition[] {
  return [...forms];
}

export function getFormDefinition(key: string): FormDefinition {
  const definition = byKey.get(key);
  if (!definition) {
    throw new Error(
      `Form definition '${key}' is not approved. Authenticated Fluent Forms extraction is required before wiring this form.`,
    );
  }
  return definition;
}

export function getFormDefinitionById(fluentFormId: number): FormDefinition | null {
  return byId.get(Number(fluentFormId)) || null;
}

export function getFormDefinitionForRoute(route: string): FormDefinition | null {
  return byRoute.get(route) || null;
}

export function isApprovedFormId(fluentFormId: number): boolean {
  return byId.has(Number(fluentFormId));
}

export function assertRouteFormMapping(route: string, fluentFormId: number): FormDefinition {
  const definition = getFormDefinitionForRoute(route);
  if (!definition) {
    throw new Error(`No approved form mapped to route ${route}`);
  }
  if (Number(definition.fluentFormId) !== Number(fluentFormId)) {
    throw new Error(
      `Route ${route} is mapped to Fluent Form ${definition.fluentFormId}, not ${fluentFormId}`,
    );
  }
  if (!definition.activationEnabled || definition.approvalState !== "APPROVED_FOR_IMPLEMENTATION") {
    throw new Error(`Form ${fluentFormId} is not approved for activation`);
  }
  return definition;
}
