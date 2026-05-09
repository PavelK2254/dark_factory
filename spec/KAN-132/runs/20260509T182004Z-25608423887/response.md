# KAN-132 — Myths and FAQ added to Scrum landing page

## What changed
Added two new sections to `docs/scrum/index.html` and extended the sticky anchor nav.

- **Myths** (`#myths`) — three myth-busting statements aligned with the 2020 Scrum Guide:
  - Scrum is not a methodology with fixed scope agreed up front.
  - The Scrum Master is not a project manager who assigns tasks.
  - The Daily Scrum is not a status meeting for managers.
- **FAQ** (`#faq`) — four items, covering the three required topics plus one bonus:
  - How does Scrum relate to Agile?
  - How is Scrum different from Kanban at a glance?
  - Who decides what is built? (Product Owner)
  - Can Scrum be used outside software?
- **Anchor nav** — appended `Myths` and `FAQ` after the existing `Roles · Events · Artifacts · Sprint` entries. Existing anchors are unchanged.

## Why
Implements the §3.2 nice-to-have content from the Scrum-landing-page spec. Wording is plain-language and consistent with the Scrum Guide. Sections slot into the existing structure (`section > h2 > grid/cards`) so the page's heading hierarchy and styling stay consistent with the surrounding content.

## Acceptance criteria
- ✅ Myths block contains 3 myth-busting statements consistent with the Scrum Guide (≥ 2 required).
- ✅ FAQ contains 4 items including Scrum vs. Agile, Scrum vs. Kanban, and who decides what is built.
- ✅ New sections reachable via two added nav entries; no existing anchors removed or renamed.
- ✅ No statement contradicts the Scrum Guide (cross-checked against accountabilities, events, and the framework-not-methodology stance).

## Verification
- Anchor `href`s and section `id`s cross-checked: every nav target resolves on the page.
- `<section>` and `<article>` tags balance.
- No CSS or JS changes; new content reuses existing `.grid` / `.card` / `.lede` classes.

## Risks
- Visual rendering not verified in CI — layout risk is low since new sections reuse existing styles, but the page is not screenshot-tested here.
- Sticky nav now has 6 entries; existing `flex-wrap` handles narrow viewports gracefully.

## Files touched
- `docs/scrum/index.html`
- `spec/KAN-132/plan.md` (implementation plan)
- `spec/KAN-132/response.md` (this file)
