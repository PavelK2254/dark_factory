# KAN-131 Implementation Plan

## Goal
Harden `docs/scrum/index.html` (delivered in KAN-130) for responsive design, accessibility, print, and SEO so it satisfies §4 F5/F6 and §5 N1–N3 of the requirements.

## Audit of current state
The page is a single self-contained file with inline CSS, no scripts, no external requests. Already correct: viewport meta, `<title>`, `<meta name="description">`, `lang="en"`, semantic `h1→h2→h3` hierarchy, meaningful link text in the footer, responsive grid (`minmax(220px, 1fr)`), responsive SVG (`width: 100%`).

Gaps to close:
- **Tap targets (F5):** sticky-nav links use `padding: 0.25rem 0.5rem` — visible target ~24–28 px tall on a 375 px viewport, below the 44×44 minimum.
- **Print (F6):** no `@media print` rules — the sticky nav, gradient hero, and card borders waste ink and the cards/figure can break across pages.
- **Keyboard a11y (N1):** no visible `:focus` / `:focus-visible` styles, and no skip-link to bypass the sticky nav.
- **Reduced motion:** `html { scroll-behavior: smooth }` is unconditional; should be gated by `prefers-reduced-motion`.
- **SEO (N3):** title and description are present; Open Graph / Twitter / theme-color / robots metadata is missing — useful for shareability without adding requests.
- **Robustness:** `nav.anchors ul` has two `margin` declarations (the second clobbers the centering); minor to fix while editing.

LCP / render-blocking (N2) is already at the floor for a static file — CSS is inline, there are no scripts, no web fonts, no remote images. Nothing to remove.

## Changes (single file: `docs/scrum/index.html`)

### `<head>` additions
- `<meta name="theme-color" content="#1a5fb4">`
- `<meta name="color-scheme" content="light">`
- `<meta name="robots" content="index,follow">`
- Open Graph: `og:title`, `og:description`, `og:type=article`, `og:locale=en_US`
- `<meta name="twitter:card" content="summary">`

### CSS additions (kept inline so nothing becomes render-blocking)
- `.skip-link` — visually hidden until focused, then anchored top-left over the sticky nav.
- `:focus-visible` outline rule for `a` so keyboard users see focus.
- `nav.anchors a` — `min-height: 44px`, `display: inline-flex`, `align-items: center`, larger padding, so each link meets WCAG 2.5.5 target size on mobile.
- `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }`.
- `@media print { … }` — hides sticky nav and skip-link, drops the hero gradient, forces black ink on white, expands external link URLs after the link text, and uses `break-inside: avoid` on `section`, `.card`, and `figure.flow` so they don't split.
- Fix the duplicate `margin` declaration on `nav.anchors ul`.

### Body additions
- `<a class="skip-link" href="#main">Skip to main content</a>` immediately inside `<body>`.
- Add `id="main"` to the existing `<main class="wrap">` so the skip-link target exists.

## Acceptance-criteria mapping
- **No horizontal scroll 320–1440 px:** existing layout already wraps; we don't add any fixed-width content. Re-checked widths: at 320 px the wrap leaves 280 px content area, the grid `minmax(220px, 1fr)` collapses to a single column, the SVG (`width: 100%`) scales, and the new sticky-nav links wrap because `nav.anchors ul` is `flex-wrap: wrap`.
- **44×44 tap targets at 375 px:** `nav.anchors a` enforced via `min-height: 44px` plus padding. Footer links are inline within paragraph text, where 44 px is not required by 2.5.5.
- **WCAG AA contrast:** colors unchanged. Spot-checked against the existing palette — `#1d1d1f` on `#fdfdfc` ≈ 17:1, `#555` on `#fdfdfc` ≈ 7:1, `#1a5fb4` on `#fdfdfc` ≈ 6.2:1, `#555` on `#eaf2fb` ≈ 6:1 — all pass 4.5:1 normal-text.
- **Zero critical a11y violations:** added skip-link, visible focus, larger nav targets; pre-existing `aria-label` on nav and `aria-labelledby`/`role="img"` on the SVG retained.
- **No render-blocking above the fold / LCP:** still zero scripts, zero remote stylesheets/fonts/images. CSS stays inline.
- **F6 print-friendly:** new `@media print` block with `break-inside: avoid` on cards/sections/figure and URL expansion for external links.

## Risks / unverified
- Lighthouse / axe were not run in CI; the contrast and a11y checks above are by inspection.
- Print output was not visually rendered; the rules follow common print-CSS patterns but exact pagination is browser-dependent.
- LCP under fast-3G was not measured — the page has no external dependencies, so the realistic floor is hit, but no real-device number is recorded.

## Verification performed
- HTML parsed with Python `html.parser` after edits — no errors.
- `grep` for the new meta tags, the `.skip-link` element, the `min-height: 44px` rule on `nav.anchors a`, and the `@media print` block.
- Confirmed exactly one `<h1>`, one `<title>`, one `<meta name="description">`, and that section ids `#roles #events #artifacts #sprint` and `#main` all resolve.
