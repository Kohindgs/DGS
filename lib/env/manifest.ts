export interface ProductionEnvRule {
  name: string;
  description: string;
  required: boolean;
  secret: boolean;
  validate: (val?: string) => { valid: boolean; error?: string };
}

export const PRODUCTION_REQUIRED_ENV_MANIFEST: ProductionEnvRule[] = [
  {
    name: "DGS_PUBLIC_INDEXING",
    description: "Fail-closed indexing flag. Must equal exactly 'true' in public production.",
    required: true,
    secret: false,
    validate: (val) => {
      if (val !== "true") {
        return { valid: false, error: "Must equal exactly 'true' (received: " + (val || "MISSING") + ")" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_CRON_SECRET",
    description: "Dedicated Bearer token secret for internal cron and automated monitors.",
    required: true,
    secret: true,
    validate: (val) => {
      if (!val || val.trim().length < 32) {
        return { valid: false, error: "Must be a non-empty string of at least 32 characters" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_MYSQL_HOST",
    description: "MySQL database hostname or socket address.",
    required: true,
    secret: false,
    validate: (val) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: "Must be non-empty" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_MYSQL_USER",
    description: "MySQL database username for CMS operations.",
    required: true,
    secret: false,
    validate: (val) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: "Must be non-empty" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_MYSQL_PASSWORD",
    description: "MySQL database user password.",
    required: true,
    secret: true,
    validate: (val) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: "Must be non-empty" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_MYSQL_DATABASE",
    description: "MySQL target database name.",
    required: true,
    secret: false,
    validate: (val) => {
      if (!val || val.trim().length === 0) {
        return { valid: false, error: "Must be non-empty" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_ADMIN_ENABLED",
    description: "Admin portal enablement flag. Must be 'true' in production CMS.",
    required: true,
    secret: false,
    validate: (val) => {
      if (val !== "true") {
        return { valid: false, error: "Must equal 'true'" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_ADMIN_EMAIL",
    description: "Primary administrator login email.",
    required: true,
    secret: false,
    validate: (val) => {
      if (!val || !val.includes("@")) {
        return { valid: false, error: "Must be a valid email address" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_ADMIN_PASSWORD",
    description: "Administrator scrypt hash / credential.",
    required: true,
    secret: true,
    validate: (val) => {
      if (!val || val.trim().length < 8) {
        return { valid: false, error: "Must be non-empty and secure" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_ADMIN_SESSION_SECRET",
    description: "Session cookie signing key for authenticated CMS sessions.",
    required: true,
    secret: true,
    validate: (val) => {
      if (!val || val.trim().length < 32) {
        return { valid: false, error: "Must be at least 32 characters" };
      }
      return { valid: true };
    },
  },
  {
    name: "DGS_ENCRYPTION_KEY",
    description: "Symmetric key for database-level sensitive field encryption.",
    required: true,
    secret: true,
    validate: (val) => {
      if (!val || val.trim().length < 32) {
        return { valid: false, error: "Must be at least 32 characters" };
      }
      return { valid: true };
    },
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    description: "Canonical site base URL for metadata, canonicals, and sitemap.",
    required: true,
    secret: false,
    validate: (val) => {
      if (!val || !val.startsWith("https://")) {
        return { valid: false, error: "Must be a secure HTTPS URL" };
      }
      return { valid: true };
    },
  },
];

export function validateProductionEnvironment(envMap: Record<string, string | undefined>): {
  valid: boolean;
  missing: string[];
  invalid: { name: string; error: string }[];
} {
  const missing: string[] = [];
  const invalid: { name: string; error: string }[] = [];

  for (const rule of PRODUCTION_REQUIRED_ENV_MANIFEST) {
    const val = envMap[rule.name];
    if (val === undefined || val === null) {
      if (rule.required) missing.push(rule.name);
    } else {
      const res = rule.validate(val);
      if (!res.valid) {
        invalid.push({ name: rule.name, error: res.error || "Validation failed" });
      }
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}
