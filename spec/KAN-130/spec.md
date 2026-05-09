# KAN-130: Build Scrum landing page: scaffold, core content sections, and visual summary

Generated from Jira on 2026-05-09T18:09:49.152Z.

## Issue Details

| Field | Value |
|---|---|
| Key | KAN-130 |
| Title | Build Scrum landing page: scaffold, core content sections, and visual summary |
| Type | Task |
| Status | To Do |
| Priority | Medium |
| Assignee | - |
| Reporter | Roland Abou Younes |
| Labels | dark-factory-generated, dfp-1000ccca7a46 |
| Components | - |
| Created | 2026-05-09T20:04:29.751+0300 |
| Updated | 2026-05-09T20:04:30.005+0300 |

## Description

Create a static HTML/CSS page at a single primary URL with no login requirement. Implement: hero section (headline + subheadline explaining what the page is, F2), anchor navigation to Roles/Events/Artifacts/Sprint sections (F3), all §3.1 must-include content (What Scrum Is, When It Helps, Roles/accountabilities with one line each, all five Events with one-sentence purpose each, Artifacts including Definition of Done, Sprint as time-boxed container), a visual summary showing Roles→Events→Artifacts (inline SVG or structured HTML, implementer's choice), and a footer with a Scrum Guide link and last-updated date (F4). Include <title>, meta description, and one clear h1 (N3). Use semantic headings (h1→h3) and plain-language copy aligned with Scrum Guide terminology (N4). Prefer zero-build static output; document build steps in README only if a build step is required (§7).

### Acceptance Criteria

- All seven §3.1 must-include content items are present with terminology matching the current Scrum Guide: Product Owner, Scrum Master, Developers, Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective, Product Backlog, Sprint Backlog, Increment, Definition of Done.
- Hero section displays a clear headline and subheadline identifying this as a Scrum overview.
- Anchor navigation links resolve correctly to Roles, Events, Artifacts, and Sprint sections without full-page reload.
- Footer contains a link to scrumguides.org with meaningful link text and a last-updated or content version date.
- Page has exactly one h1, a <title>, and a meta description.
- Visual summary accurately maps Roles, Events, and Artifacts in a single diagram or structured element.

### Source Reference

- 1. Goal
- 2. Audience and tone
- 3.1 Must include (accurate, high level)
- 4. Functional requirements
- 6. UX and UI guidance
- 7. Technical constraints

### Dependencies

None

Suggested priority: high

Estimated complexity: medium

## Comments (0)

_No comments._
