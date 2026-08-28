export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "hidden";

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
  options?: FormFieldOption[];
  autocomplete?: string;
};

export type FormDefinition = {
  key: string;
  fluentFormId: number;
  sourceRoute: string;
  anchorId?: string;
  fields: FormFieldDefinition[];
  captcha?: {
    provider: "recaptcha" | "turnstile";
    siteKey?: string;
  };
  backend: {
    adapter: "fluent-forms-wordpress";
    submissionEndpoint: string;
  };
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
