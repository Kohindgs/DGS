export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "hidden"
  | "captcha";

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldDefinition = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: FormFieldOption[];
  validationMessages?: Record<string, string>;
  conditionalLogic?: {
    enabled: boolean;
    type?: string;
    conditions?: Array<{ field?: string; operator?: string; value?: unknown }>;
  };
  hidden?: boolean;
};

export type FormDefinition = {
  key: string;
  fluentFormId: number;
  title: string;
  shortcode: string;
  sourceRoutes: string[];
  /** @deprecated use sourceRoutes */
  sourceRoute?: string;
  approvalState: "AUTHENTICATED_INVENTORY_CAPTURED" | "HUMAN_APPROVAL_REQUIRED" | "APPROVED_FOR_IMPLEMENTATION";
  activationEnabled: boolean;
  fields: FormFieldDefinition[];
  allowedFieldKeys: string[];
  captcha?: {
    enabled: boolean;
    provider: "recaptcha" | "turnstile" | "hcaptcha" | null;
    publicSiteKey?: string | null;
    siteKeyEnvRef?: string | null;
    secretKeyEnvRef?: string | null;
  };
  submitButtonText?: string;
  confirmation?: {
    type?: string;
    message?: string;
    customUrlPresent?: boolean;
    samePageFormBehavior?: string;
  };
  failureMessage?: string;
  notifications?: {
    count: number;
    enabledCount: number;
    items: Array<{
      name: string;
      enabled: boolean;
      destinationType: string;
      recipientCount: number;
      recipientDomainClassification?: string | null;
      recipientEnvRef?: string | null;
    }>;
  };
  integrations?: {
    enabled: boolean;
    items: Array<{ type: string; enabled: boolean }>;
    envRefsOnly?: boolean;
  };
  backend: {
    adapter: "fluent-forms-wordpress";
    submissionEndpointClass: string;
    submissionEndpoint: string;
    submissionAction?: string;
    restFormSubmitEndpoint?: string;
    wordpressPageIds?: Record<string, number>;
  };
  provenance?: {
    source: string;
    retrievedAt: string;
    sourceExportSha256: string;
    accessMethod?: string;
  };
  anchorId?: string;
};

export type FormSubmissionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  submissionId?: string | number;
};

export interface FormBackendAdapter {
  submit(
    definition: FormDefinition,
    payload: Record<string, FormDataEntryValue | FormDataEntryValue[]>,
  ): Promise<FormSubmissionResult>;
}
