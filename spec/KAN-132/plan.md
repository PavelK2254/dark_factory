# KAN-132 Implementation Plan

## Goal
Add a Myths block and a FAQ section to the Scrum landing page (`docs/scrum/index.html`) per §3.2 nice-to-have, without breaking existing anchor navigation or heading hierarchy.

## Scope of changes
Single file edit: `docs/scrum/index.html`.

### Anchor navigation
Add two new entries to `nav.anchors` after the existing four (`#roles`, `#events`, `#artifacts`, `#sprint`):
- `#myths` → "Myths"
- `#faq` → "FAQ"

Existing anchors are preserved (no renames), so any external links / fragments continue to resolve.

### New sections (appended in `<main>` after the Sprint section)

**Myths** (`<section id="myths">`, `h2`):
Three myth-busting statements aligned with the Scrum Guide:
1. "Scrum is not a methodology with fixed scope agreed up front." — Scrum is a lightweight framework that embraces changing requirements; the Product Backlog is ordered and refined over time.
2. "The Scrum Master is not a project manager who assigns tasks." — The Scrum Master is a true leader who serves the team and coaches the organization; Developers self-manage how they deliver the Sprint work.
3. "The Daily Scrum is not a status meeting for managers." — It is a 15-minute event for the Developers to inspect progress toward the Sprint Goal and adapt the plan for the next day.

Rendered as `.card` items inside a `.grid`, matching the existing style.

**FAQ** (`<section id="faq">`, `h2`):
Four items (within the 3–5 range required by AC), each as a small `<article>` with an `<h3>` question and `<p>` answer. Includes the three required topics plus one bonus on applicability beyond software:
- "How does Scrum relate to Agile?" — Agile is the broader mindset (the Agile Manifesto's values and principles). Scrum is one specific lightweight framework that embodies Agile; using Scrum well means living the Agile values, not just running the events.
- "How is Scrum different from Kanban at a glance?" — Scrum uses fixed-length Sprints, defined accountabilities, and a small set of events to inspect and adapt. Kanban focuses on visualizing flow and limiting work in progress, without prescribed roles or time-boxed iterations. Many teams blend the two.
- "Who decides what is built?" — The Product Owner. They are accountable for ordering the Product Backlog and maximizing the value of the product. Developers decide how to build it; stakeholders inform but do not direct the order.
- "Can Scrum be used outside software?" — Yes. Scrum is intentionally lightweight and applies to any complex work where empirical process control — transparency, inspection, and adaptation — helps.

Rendered as plain `<article>` blocks inside the section (no card grid) so it reads like an FAQ list.

## Quality checks
- Validate HTML opens cleanly (no broken tags, balanced sections).
- Verify all anchor `href`s resolve to existing `id`s on the page.
- Confirm heading hierarchy stays `h1 → h2 → h3` (no skips, no demotions in existing sections).
- Confirm no statement contradicts the 2020 Scrum Guide (myths and FAQ wording cross-checked against accountabilities, events, artifacts, and the framework-not-methodology stance).

## Risks
- Visual: new sections inherit existing CSS so layout risk is low; not rendered in CI, so unverified visually.
- Anchor nav row may wrap on narrow viewports with two extra items — existing CSS already uses `flex-wrap`, so this degrades gracefully.

## Out of scope
- No CSS changes.
- No JS additions.
- No content changes to existing sections.
