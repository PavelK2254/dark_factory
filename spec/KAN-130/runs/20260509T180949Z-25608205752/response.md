# KAN-130 Summary

Added a zero-build static Scrum landing page at `docs/scrum/index.html`.

## What changed
- New file: `docs/scrum/index.html` — single self-contained page with inline CSS and an inline SVG diagram. No build step.

## How it satisfies the ticket
- **Hero (F2):** one `<h1>` "Scrum, in one page" plus a subheadline identifying the page as a Scrum overview.
- **Anchor nav (F3):** sticky in-page links to Roles, Events, Artifacts, Sprint — pure CSS smooth scroll, no full-page reload.
- **§3.1 must-include content:** sections for *What Scrum is*, *When it helps*, *Roles* (Product Owner, Scrum Master, Developers — one line each), all five *Events* (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective — one-sentence purpose each), *Artifacts* (Product Backlog, Sprint Backlog, Increment, Definition of Done), and a *Sprint as time-boxed container* paragraph.
- **Visual summary:** inline `<svg>` with three lanes Roles → Events → Artifacts and connecting arrows, wrapped in `<figure>`/`<figcaption>`.
- **Footer (F4):** descriptive link to https://scrumguides.org/ plus a `<time>` last-updated date.
- **Head requirements (N3):** exactly one `<h1>`, a `<title>`, and a `<meta name="description">`.
- **Semantic structure (N4):** `h1` → `h2` → `h3` only; copy uses current Scrum Guide terminology.

## Why
The ticket calls for the smallest correct static page satisfying §3.1, F2–F4, N3, N4, and §7's preference for zero-build output. A single self-contained HTML file with inline CSS and SVG meets all of that without introducing any tooling.

## Risks
- SVG diagram layout was hand-checked, not opened in a real browser inside CI — visual rendering across browsers is unverified.
- Section copy is paraphrased plain-language aligned with the Scrum Guide; it intentionally is not a verbatim quote from scrumguides.org.
