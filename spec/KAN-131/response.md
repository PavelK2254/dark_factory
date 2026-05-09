# KAN-131 Summary

Hardened `docs/scrum/index.html` (delivered in KAN-130) for responsive design, accessibility, print, and SEO. Single-file edit — still zero build, zero scripts, zero remote stylesheets.

## What changed
- **`<head>` SEO/social metadata.** Added `theme-color`, `color-scheme`, `robots=index,follow`, `og:title`, `og:description`, `og:type=article`, `og:locale=en_US`, and `twitter:card=summary`. Existing `<title>` and `<meta name="description">` retained.
- **Tap targets (F5).** Sticky-nav anchors now use `display: inline-flex; min-height: 44px; padding: 0.5rem 0.75rem`, satisfying WCAG 2.5.5 on a 375 px viewport. Also collapsed a duplicate `margin` declaration on `nav.anchors ul`.
- **Skip link (a11y).** New `.skip-link` ("Skip to main content") that jumps to `#main` (added to `<main>`); visually hidden until focused, then anchored top-left over the sticky nav.
- **Visible keyboard focus.** `a:focus-visible` outline rule using the existing accent color.
- **Reduced motion.** `@media (prefers-reduced-motion: reduce)` disables the previously unconditional `scroll-behavior: smooth`.
- **Print stylesheet (F6).** New `@media print` block: hides sticky nav and skip-link, drops the hero gradient, forces black-on-white, expands external link URLs after the link text, and uses `break-inside: avoid` on `section`, `.card`, and `figure.flow` so cards and the diagram don't split across pages.

## How it satisfies the acceptance criteria
- **No horizontal scroll 320–1440 px:** layout already wraps and the SVG is fluid; new nav rules use `flex-wrap: wrap` so the larger tap targets reflow rather than overflow.
- **44×44 tap targets at 375 px:** enforced on every sticky-nav link via `min-height: 44px` plus padding.
- **WCAG AA contrast:** palette unchanged. Spot-checked: `#1d1d1f` on `#fdfdfc` ≈ 17:1, `#555` on `#fdfdfc` ≈ 7:1, `#1a5fb4` on `#fdfdfc` ≈ 6.2:1, `#555` on `#eaf2fb` ≈ 6:1 — all clear of the 4.5:1 normal-text threshold.
- **Zero critical a11y violations:** added skip-link, visible focus, larger nav targets; existing `aria-label` on nav and `role="img"`/`aria-labelledby` on the diagram retained.
- **No render-blocking / LCP target:** still no scripts, no remote stylesheets, no web fonts, no remote images. CSS stays inline; the only network reference is the pre-existing footer link to scrumguides.org (below the fold).

## Why
KAN-130 shipped the content; KAN-131 is the non-functional polish — F5/F6 plus N1–N3. Constraint was to keep the page zero-build and dependency-free, so all changes stayed inside the existing inline `<style>` and `<head>`.

## Risks
- Lighthouse / axe were not executed in CI; contrast and a11y checks above are by inspection.
- Print pagination was not visually verified — the rules use standard `break-inside: avoid` patterns but exact behavior is browser-dependent.
- LCP under fast-3G throttling was not measured; the page has no external dependencies, so it sits at the realistic floor for a static document, but no real-device number is recorded.
