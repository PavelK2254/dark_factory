# KAN-124 Implementation Plan

## Goal
Deliver a single static Scrum landing page that satisfies the developer specification in `spec/KAN-124/spec.md` (KAN-124).

## Approach
- Add a self-contained static page at `site/scrum/index.html` — zero build, zero JS, embedded CSS, inline SVG for the visual summary. This keeps deps to a minimum (N2) and makes hosting on GitHub Pages / Netlify trivial (Tech constraint §7).
- One page, one file → "maintainable in one place" (N4 / AC #4). Sections are clearly delimited with semantic landmarks so future edits are localized.
- Add `site/scrum/README.md` documenting that the page is static (no build) and how to preview locally.

## Section coverage (§3.1 Must include)
| Spec item | Where |
|---|---|
| What Scrum is | `#what` section, one paragraph + Scrum Guide link |
| When it helps | `#when` section |
| Roles (accountabilities) | `#roles` — PO, Scrum Master, Developers |
| Events | `#events` — Sprint, Planning, Daily Scrum, Review, Retro |
| Artifacts + Definition of Done | `#artifacts` |
| Sprint | `#sprint` |
| Visual summary | `#overview` — inline SVG showing Roles → Events → Artifacts |
| Myths (nice to have §3.2) | `#myths` |
| FAQ (nice to have §3.2) | `#faq` |

## Functional requirements coverage
- F1 Single URL, no auth — static `index.html`.
- F2 Hero with headline + subheadline.
- F3 Anchor navigation linking to Roles / Events / Artifacts / Sprint (and others).
- F4 Footer with Scrum Guide link and "Last updated" date.
- F5 Responsive from 320px — fluid grid, `clamp()` typography, generous tap targets (min 44px).
- F6 Print-friendly — `@media print` rule hides nav, expands content, avoids page-break clipping.

## Non-functional requirements coverage
- N1 Accessibility: semantic `<header>/<main>/<nav>/<footer>`, single `<h1>`, then `h2`/`h3`; meaningful link text; high-contrast palette (dark text on light bg, ≥ 7:1 for body, ≥ 4.5:1 for accent); `:focus-visible` outlines preserved; `prefers-reduced-motion` respected.
- N2 Performance: no external CSS/JS/fonts; inline SVG; total weight well under typical LCP budget for a simple static page.
- N3 SEO: descriptive `<title>`, meta description, single `h1`, lang attribute.
- N4 Accuracy: terminology aligned with the current Scrum Guide (Product Owner, Scrum Master, Developers, accountabilities, commitments, Increment, Definition of Done).

## Acceptance criteria mapping
1. AC1 — All §3.1 items present, wording reviewed against the Scrum Guide (no contradictions).
2. AC2 — Mobile menu via plain anchor list (no horizontal scroll at 320px due to fluid layout).
3. AC3 — No critical accessibility issues by construction (semantics + contrast + focus). Cannot run axe/Lighthouse from this environment; risk noted below.
4. AC4 — Single HTML file with clearly-marked sections is the maintenance unit.

## Risks / unverified
- Cannot launch a browser or run Lighthouse/axe in this environment, so visual rendering and accessibility scores are not empirically verified. The HTML uses well-known patterns (semantic landmarks, sufficient contrast palette, no animation by default), so the risk is low.
- Color palette chosen for AA contrast on white background — designers may want to adjust to brand later (Open decision §9 — branding deferred).

## Files changed
- `site/scrum/index.html` (new)
- `site/scrum/README.md` (new)

## Out of scope (per §3.3)
- Agile manifesto history, scaling frameworks, tool-specific instructions, certification prep — none included.
