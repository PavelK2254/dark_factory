# KAN-131: Apply responsive design, accessibility, and SEO hardening

Generated from Jira on 2026-05-09T18:13:52.597Z.

## Issue Details

| Field | Value |
|---|---|
| Key | KAN-131 |
| Title | Apply responsive design, accessibility, and SEO hardening |
| Type | Task |
| Status | To Do |
| Priority | Medium |
| Assignee | - |
| Reporter | Roland Abou Younes |
| Labels | dark-factory-generated, dfp-4f558b93d433 |
| Components | - |
| Created | 2026-05-09T20:04:31.326+0300 |
| Updated | 2026-05-09T20:04:31.486+0300 |

## Description

Polish the Scrum landing page to satisfy all non-functional requirements. Make the layout readable and navigable from 320px width upward with adequate tap targets on mobile (F5). Add basic print-friendly CSS so sections do not clip when printed or saved as PDF (F6). Verify semantic heading hierarchy (h1→h3), meaningful link text, and WCAG 2.1 AA color contrast (N1). Minimize render-blocking resources to target LCP under 2.5s for a static page (N2). Confirm <title> and meta description are in place (N3).

### Acceptance Criteria

- Page layout has no horizontal scroll on viewports from 320px to 1440px wide.
- Tap targets (links, nav items) are at least 44×44 CSS pixels on a 375px mobile viewport.
- Color contrast ratios meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) verified by Lighthouse or a contrast checker.
- Lighthouse or axe audit reports zero critical accessibility violations.
- No render-blocking scripts or stylesheets appear above the fold; LCP on simulated fast-3G throttle is under 2.5s or as low as the zero-dependency static page allows.

### Source Reference

- 4. Functional requirements
- 5. Non-functional requirements

### Dependencies

- Build Scrum landing page: scaffold, core content sections, and visual summary

Suggested priority: medium

Estimated complexity: small

## Comments (0)

_No comments._
