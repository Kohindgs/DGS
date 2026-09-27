# Legacy Assessments & Candidate Test Routes Archive

## Overview
This directory preserves legacy candidate assessments, test pages, and unmigrated job evaluation routes that were previously accessible on public URLs. In DGS v8.8, these routes were retired from public routing with HTTP 410 Gone status.

The authoritative candidate assessment and evaluation functionality is now powered directly by the **Native CMS HR Pipeline** (`/admin/hr-pipeline/` and `/admin/assessment/`), which generates secure, token-protected, dynamic assessment links rather than exposing public URLs.

## Archived Routes Inventory

| Legacy Route | Original Purpose | Replacement / Authoritative Location |
| :--- | :--- | :--- |
| `/seo-executive-assessment/` | SEO Executive test page | Native CMS Assessment OS (`/admin/assessment/`) |
| `/seo-manager-assessment/` | SEO Manager test page | Native CMS Assessment OS (`/admin/assessment/`) |
| `/ai-motion-graphic-designer/` | AI Motion Graphic Designer assessment | Native CMS HR Pipeline (`/admin/hr-pipeline/`) |
| `/social-media-executive/` | Social Media Executive test page | Native CMS HR Pipeline (`/admin/hr-pipeline/`) |
| `/indriya-test/` | Single-candidate internal test page | Native CMS HR Pipeline Candidate Token Link |
| `/motion-graphics/` | Mistakenly served Motion Graphic Designer assessment | Retired with 410 Gone; Motion Graphics services under creative production |
| `/wp-file-download-search/` | Legacy WordPress plugin search route | Retired with 410 Gone |

## Restoration Instructions
If any legacy assessment route needs to be temporarily restored or its questions referenced:
1. Individual assessment question definitions remain available in `lib/assessments/definitions.ts`.
2. Static mirror payloads are archived in this directory (`*.json`).
3. React page implementations are preserved in `seo-executive-assessment.page.tsx.bak` and `seo-manager-assessment.page.tsx.bak`.
4. To un-retire a route, remove its entry from `data/migration/retired-routes.approved.json`.
