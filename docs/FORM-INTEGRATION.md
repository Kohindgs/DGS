# DGS Form Integration

Status: backend mapping pending authenticated WordPress access

## Architecture

The public frontend moves to Next.js, but the existing WordPress/Fluent Forms backend remains the submission system unless a verified technical reason requires replacement.

Target flow:

`Next.js form UI -> WordPress Fluent Forms backend -> validation/CAPTCHA -> notifications -> CRM/webhooks -> analytics`

## Preserve

- existing form IDs
- field names and required state
- validation rules
- conditional logic
- CAPTCHA/spam protection
- email notifications
- CRM/webhook integrations
- success/error behavior
- conversion tracking

## Known page anchors from the legacy audit

- `#contact-form`
- `#dgs-performance-form`
- `#smm-form`
- `#bpContactModule`
- `#website-project-form`

These anchors identify frontend locations, not sufficient backend configuration.

## Access requirement

Public WordPress REST does not expose Fluent Forms configuration. Do not fabricate endpoints, IDs or field schemas. Integration remains `REQUIRES AUTHENTICATED WORDPRESS ACCESS` until the actual configuration is captured.

## Implementation rule

The Next.js UI can be redesigned later, but submission parity must be tested against the production WordPress form backend before launch.
