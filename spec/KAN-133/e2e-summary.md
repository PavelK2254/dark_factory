# KAN-133 — §8 acceptance-criteria checklist

End-to-end verification of `docs/scrum/index.html`. Run on 2026-05-09 against headless Chromium 147 driven by `puppeteer-core`, with axe-core 4 used for the accessibility audit.

> Note: the Jira description references `spec/KAN-124/`. That key does not exist in this repository — every other ticket in this batch (KAN-130, KAN-131, KAN-132, KAN-135, KAN-136) lives under `spec/<key>/`, so evidence is committed under the actual ticket folder, `spec/KAN-133/`. The acceptance-criteria text is reproduced verbatim below; only the path differs.

| # | Acceptance criterion (verbatim) | Result | Evidence |
|---|---|---|---|
| 1 | Screenshot shows hero, all §3.1 content sections, visual summary, and footer on a 1280px desktop viewport with no layout breakage or overflow. | **PASS** | `e2e/screenshots/desktop-full.png` shows hero + What/When/Roles/Events/Artifacts/Sprint (with the Roles→Events→Artifacts SVG visual summary) + Myths + FAQ + footer. `findings.json` confirms `documentElement.scrollWidth = clientWidth = 1280` (no horizontal overflow). |
| 2 | Screenshot shows all content navigable on a 375px mobile viewport with no horizontal scroll. | **PASS** | `e2e/screenshots/mobile-full.png` (full-page, 375×812 viewport, `isMobile`). `findings.mobile`: `scrollWidth = bodyScrollWidth = clientWidth = 375`. Tap targets in the anchor nav measure 44px minimum on the short axis (matches WCAG 2.5.5 target size guidance). |
| 3 | Anchor navigation links (Roles, Events, Artifacts, Sprint) each scroll to the correct section — confirmed by a screenshot sequence or recorded run. | **PASS** | One screenshot per anchor: `e2e/screenshots/anchor-roles.png`, `anchor-events.png`, `anchor-artifacts.png`, `anchor-sprint.png`. `findings.anchors` records `location.hash` updating to `#roles` / `#events` / `#artifacts` / `#sprint` and the target section's `getBoundingClientRect().top` resolving within ±20–200 px of the viewport top after the smooth scroll settles (sticky nav offset accounted for). |
| 4 | Lighthouse or axe report shows zero critical accessibility violations; the report file is committed to spec/KAN-124/. | **PASS** | axe-core 4 audit, ruleset `wcag2a + wcag2aa + wcag21a + wcag21aa + best-practice`: **0 violations** (0 critical, 0 serious), 36 passes. Full JSON: `e2e/accessibility-report.json`. Markdown digest: `e2e/accessibility-summary.md`. One `incomplete` result (`color-contrast`, 17 nodes) is the standard axe outcome when foreground sits on a CSS gradient — manual spot-check confirms `--ink #1d1d1f` on `--bg #fdfdfc` is well above 4.5:1; the gradient hero band darkens toward white, never below the flat-`--bg` contrast already passed. Report committed under `spec/KAN-133/` per the path note above. |
| 5 | spec/KAN-124/e2e-summary.md maps all four §8 acceptance criteria to pass/fail with a one-line evidence note for each. | **PASS** | This file (`spec/KAN-133/e2e-summary.md`). |

## How to reproduce

```bash
# Install once into a scratch dir (kept outside the repo so package.json stays clean):
mkdir -p /tmp/e2e-deps && cd /tmp/e2e-deps && npm init -y >/dev/null \
  && npm install puppeteer-core@22 axe-core@4

# From the repo root:
node spec/KAN-133/e2e/scripts/run-e2e.mjs
```

Environment used for the committed evidence: Ubuntu (GitHub Actions hosted runner), Chromium 147.0.7727.0 at `/usr/bin/chromium`, Node 18.20.8, `puppeteer-core` 22, `axe-core` 4. The script serves `docs/scrum/` over `python3 -m http.server` on `127.0.0.1:8765`.

## Files
- `e2e/scripts/run-e2e.mjs` — runner.
- `e2e/screenshots/desktop-full.png` — AC1.
- `e2e/screenshots/mobile-full.png`, `mobile-anchor-events.png` — AC2.
- `e2e/screenshots/anchor-{roles,events,artifacts,sprint}.png` — AC3.
- `e2e/accessibility-report.json`, `e2e/accessibility-summary.md` — AC4.
- `e2e/findings.json` — raw structured assertions for every numeric check above.
