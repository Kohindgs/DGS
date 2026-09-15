# Forms Plugin Exit Plan

## Current state (Phase 2A)

Homepage (`/`) and contact (`/contact-us/`) render Fluent Forms-compatible markup with `data-submission="disabled"`. This is intentional: display-only until backend delivery is verified.

## Required forms (Phase 2A scope)

| Route | Fluent Form ID | Public evidence | Backend approved |
|-------|----------------|-----------------|------------------|
| `/` | 1 | `data/migration/forms-public-evidence.json` | **No** |
| `/contact-us/` | 1 | `data/migration/forms-public-evidence.json` | **No** |

## Desired architecture

1. **Native Next.js form UI** — preserve current visual presentation (UI-locked homepage/contact).
2. **Controlled submission endpoint** — Next.js API route or server action with rate limiting and spam controls.
3. **Verified lead delivery** — email notification and/or CRM/webhook configured from authenticated WordPress Fluent Forms admin inventory.

Temporary acceptable path:

- Native Next UI
- Fluent Forms **backend only** (REST/admin-ajax submission endpoint, notifications, integrations)
- **No** Fluent Forms frontend JS/CSS/plugin presentation runtime in production

## Read-only WordPress inventory still required

Do **not** inspect real submissions or customer PII.

From authenticated Fluent Forms admin, document per required form:

- Field order, labels, names, required status
- Select choices and conditional rules
- Validation rules
- CAPTCHA/spam provider and keys (stored outside repo)
- Success/failure messages and redirects
- Email notification recipients
- Webhook/CRM integration endpoints

Populate `data/forms/definitions.approved.json` from that inventory.

## Activation blockers

1. `data/forms/definitions.approved.json` is empty — no authenticated backend configuration approved.
2. CAPTCHA provider credentials not available in this environment.
3. Staging dummy submission not tested — submissions remain disabled.

## Next steps (post-review)

1. Complete authenticated Fluent Forms inventory on WordPress (read-only).
2. Approve field definitions in `data/forms/definitions.approved.json`.
3. Implement native submission handler with Fluent backend adapter.
4. Test with dummy staging data only.
5. Re-run `npm run validate:forms` and `data/audit/forms-plugin-exit-audit.json` generation.
