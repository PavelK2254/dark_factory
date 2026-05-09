# KAN-130 Implementation Plan

## Goal
Ship a zero-build static Scrum landing page that satisfies the §3.1 must-include content, anchor navigation, hero, visual summary, and footer with Scrum Guide link and last-updated date.

## Location
- `docs/scrum/index.html` — sits alongside the existing `docs/smoke/` and `docs/chain-test/` content. No build step; the file is the deployable artifact.

## Structure of the page
1. `<head>`: `<title>`, `<meta name="description">`, viewport meta, inline CSS — keeps the page to a single file (zero build).
2. Hero (F2): one `<h1>` ("Scrum, in one page") plus a subheadline identifying the page as a Scrum overview.
3. Sticky anchor nav (F3): in-page links to `#roles`, `#events`, `#artifacts`, `#sprint`. Smooth-scroll via `html { scroll-behavior: smooth }` so resolution is in-page only — no full reload.
4. §3.1 must-include sections, each with semantic `h2`/`h3`:
   - **What Scrum is** — one short paragraph.
   - **When it helps** — one short paragraph framing fit (complex/uncertain work, cadence).
   - **Roles** — Product Owner, Scrum Master, Developers, one line each.
   - **Events** — all five (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective), one-sentence purpose each.
   - **Artifacts** — Product Backlog, Sprint Backlog, Increment, plus Definition of Done as the quality standard.
   - **Sprint as time-boxed container** — paragraph framing the Sprint as the heartbeat that holds the other events.
5. Visual summary: inline `<svg>` with three labelled lanes (Roles → Events → Artifacts) and arrows between them, wrapped in `<figure>`/`<figcaption>`. Implementer's choice per ticket.
6. Footer (F4): meaningful link text to `https://scrumguides.org/` plus a `<time datetime="2026-05-09">` last-updated date.

## Why this shape
- One self-contained HTML file is the smallest correct change and matches §7's "prefer zero-build static output" — no README build steps required.
- Inline SVG keeps the diagram responsive and accessible (role="img", aria-label, figcaption) without adding image assets.
- Sticky in-page nav satisfies F3 without any JS.

## Acceptance-criteria mapping
- All seven §3.1 items present with current Scrum Guide terminology — verified via grep for the 12 listed terms (all appear ≥ once).
- Hero has clear headline + subheadline identifying the page as a Scrum overview.
- Anchor nav targets exist (`#roles`, `#events`, `#artifacts`, `#sprint`) — confirmed.
- Footer links to `scrumguides.org` with descriptive text plus a last-updated date.
- Exactly one `<h1>`, one `<title>`, one `<meta name="description">` — confirmed.
- Visual summary maps Roles → Events → Artifacts in a single SVG diagram.

## Risks / unverified
- Visual rendering of the SVG was not opened in a real browser inside CI; layout was hand-checked but actual pixel rendering across browsers is unverified.
- Wording is paraphrased plain-language and intentionally not a verbatim copy from scrumguides.org.

## Verification performed
- Python `html.parser` parsed the document without errors.
- Grep checks: 1 `<h1>`, 1 `<title>`, 1 `<meta name="description">`, all 12 required terms present, all four anchor section ids present, `scrumguides.org` linked, last-updated date present.
