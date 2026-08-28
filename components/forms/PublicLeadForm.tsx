"use client";

import styles from "./PublicLeadForm.module.css";

const FIELD_LABELS: Record<string, string> = {
  "names[first_name]": "Full Name",
  email: "Email",
  phone: "Phone/Mobile",
  input_text: "Company Name",
  dropdown_1: "How did you hear about us ?",
  subject: "Subject",
  dropdown: "Service",
  message: "Your Message",
};

const HOMEPAGE_FIELDS = [
  "names[first_name]",
  "email",
  "phone",
  "input_text",
  "dropdown_1",
  "subject",
  "dropdown",
  "message",
] as const;

type PublicLeadFormProps = {
  id?: string;
  route: "/" | "/contact-us/";
};

export function PublicLeadForm({ id = "contact-form", route }: PublicLeadFormProps) {
  return (
    <form
      id={id}
      className={styles.form}
      data-migration-form
      data-wordpress-form="1"
      data-route={route}
      data-submission="disabled"
      onSubmit={(event) => event.preventDefault()}
    >
      <p className={styles.notice}>
        Form preview only. Fluent Forms submission remains disabled until authenticated backend configuration is available.
      </p>

      {HOMEPAGE_FIELDS.map((name) => {
        const label = FIELD_LABELS[name] || name;
        const isTextarea = name === "message";
        const isSelect = name === "dropdown_1" || name === "dropdown";

        return (
          <label key={name} className={styles.field} data-migration-field={name}>
            <span className={styles.label}>{label}</span>
            {isTextarea ? (
              <textarea name={name} rows={5} readOnly aria-readonly="true" />
            ) : isSelect ? (
              <select name={name} disabled aria-disabled="true" defaultValue="">
                <option value="">{label}</option>
              </select>
            ) : (
              <input
                type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                name={name}
                readOnly
                aria-readonly="true"
              />
            )}
          </label>
        );
      })}

      <button type="submit" className={styles.submit} disabled>
        Submit Form
      </button>
    </form>
  );
}
