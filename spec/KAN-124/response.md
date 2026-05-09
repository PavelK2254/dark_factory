## KAN-124 — Scrum landing page

Implemented the spec as a single self-contained static page.

### What changed
- `site/scrum/index.html` — one-file landing page (HTML + inline CSS + inline SVG; no JS, no external assets).
- `site/scrum/README.md` — preview/host instructions and a note on where content lives for future edits.

### Spec coverage
- §3.1 Must include — all present: What Scrum is, When it helps, Roles (PO / Scrum Master / Developers), Events (Sprint, Planning, Daily Scrum, Review, Retrospective), Artifacts (Product Backlog / Sprint Backlog / Increment + Definition of Done), Sprint, and an inline-SVG visual summary showing Roles → Events → Artifacts inside a Sprint.
- §3.2 Nice to have — Myths block and 5-question FAQ included.
- F1–F4 — single static URL, hero with headline + subheadline, anchor nav, footer with Scrum Guide link and "Last updated 2026-05-09".
- F5–F6 — fluid layout (clamp typography, 320px-safe), `@media print` rules avoid clipping.
- N1 — semantic landmarks, single `<h1>`, h2/h3 only below it, AA-friendly palette (body text > 16:1, accent > 7:1 on white), visible focus rings, `prefers-reduced-motion` respected, `aria-labelledby` on each section.
- N2 — zero external CSS/JS/fonts, ~16 KB total.
- N3 — descriptive `<title>`, meta description, `lang="en"`, single `<h1>`.
- N4 — wording mirrors the current Scrum Guide (accountabilities, Product Goal, Definition of Done, etc.).

### Acceptance criteria
1. All §3.1 items present; wording reviewed against the Scrum Guide.
2. Layout is fluid; nav is plain anchor links — no horizontal scroll at 320px.
3. No critical accessibility issues by construction (semantics + contrast + focus). See risk below.
4. Single HTML file with marked sections — easy to update in one place.

### Risks / unverified
- I cannot run a browser, axe, or Lighthouse from this environment, so the AA pass and LCP target are reasoned-about rather than measured. Recommend running Lighthouse / axe once the page is hosted.
- Branding (logo, colours) intentionally left as neutral defaults — this was an open decision in §9.

Plan and full coverage matrix: `spec/KAN-124/plan.md`.
