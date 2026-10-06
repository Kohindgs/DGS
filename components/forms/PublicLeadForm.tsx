"use client";

import { useMemo } from "react";
import { FluentLeadForm } from "./FluentLeadForm";
import { getFormDefinitionById } from "@/lib/forms/registry";

type PublicLeadFormProps = {
  id?: string;
  route?: string;
  className?: string;
};

export function PublicLeadForm({ id = "contact-form", route = "/", className }: PublicLeadFormProps) {
  const definition = useMemo(() => getFormDefinitionById(1), []);
  if (!definition) {
    return (
      <div data-migration-form data-submission="disabled">
        <p>Form configuration error.</p>
      </div>
    );
  }

  return (
    <FluentLeadForm
      id={id}
      route={route}
      definition={definition}
      className={className}
    />
  );
}
