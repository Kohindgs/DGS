"use client";

import { FluentLeadForm } from "@/components/forms/FluentLeadForm";
import { getFormDefinitionById, getFormDefinitionForRoute } from "@/lib/forms/registry";

type RouteFormBlockProps = {
  route: string;
  fluentFormId?: number;
};

export function RouteFormBlock({ route, fluentFormId }: RouteFormBlockProps) {
  const definition =
    (typeof fluentFormId === "number" ? getFormDefinitionById(fluentFormId) : null) ||
    getFormDefinitionForRoute(route);

  if (!definition || !definition.activationEnabled) {
    return (
      <div data-migration-form data-submission="disabled">
        <p>This form is temporarily unavailable.</p>
      </div>
    );
  }

  if (fluentFormId && Number(definition.fluentFormId) !== Number(fluentFormId)) {
    return (
      <div data-migration-form data-submission="disabled">
        <p>Form configuration mismatch for this route.</p>
      </div>
    );
  }

  return (
    <FluentLeadForm
      id={`fluentform_${definition.fluentFormId}`}
      route={route}
      definition={definition}
    />
  );
}
