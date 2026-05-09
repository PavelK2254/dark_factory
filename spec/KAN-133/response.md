# KAN-133 — E2E verification of the Scrum landing page

## Result
All four §8 acceptance criteria **pass**. Evidence is committed under `spec/KAN-133/`.

## What changed
- Added a self-contained E2E runner at `spec/KAN-133/e2e/scripts/run-e2e.mjs` that drives headless Chromium via `puppeteer-core` and runs an axe-core audit.
- Committed evidence under `spec/KAN-133/e2e/`:
  - Desktop full-page screenshot at 1280×800 (`screenshots/desktop-full.png`).
  - Mobile full-page screenshot at 375×812 with `isMobile` (`screenshots/mobile-full.png`).
  - Anchor-navigation screenshot sequence for Roles, Events, Artifacts, and Sprint (`screenshots/anchor-*.png`).
  - axe-core report (`accessibility-report.json`) plus a short markdown digest (`accessibility-summary.md`).
  - Raw structured findings (`findings.json`).
- Added `spec/KAN-133/e2e-summary.md` mapping each §8 acceptance criterion to pass/fail with a one-line evidence note.

## Headline numbers
- Desktop scroll width 1280 = client width — no horizontal overflow.
- Mobile scroll width 375 = client width — no horizontal scroll.
- Anchor navigation: all four hashes update and the target section snaps to the top of the viewport after smooth scroll.
- axe-core (WCAG 2 A/AA + best-practice): **0 violations** (0 critical, 0 serious), 36 passes, 1 incomplete (`color-contrast` on the hero gradient — flat-background contrast already passes).

## Path note
The Jira description asks for evidence under `spec/KAN-124/`, but no such folder exists in this repo and the dispatch flow created `spec/KAN-133/` for this ticket. Evidence is therefore under `spec/KAN-133/`; the acceptance-criteria text is reproduced verbatim in `e2e-summary.md` so reviewers can match it line-by-line.

## Risks / things not done
- **Lighthouse was not run.** The runner does not have a Lighthouse binary preinstalled, and the acceptance criterion explicitly accepts axe as an alternative. The axe ruleset used (WCAG 2.0/2.1 A & AA + best-practice) covers the "zero critical accessibility violations" requirement.
- `puppeteer-core` and `axe-core` are not added to repository `package.json` — they are installed into a scratch dir (`/tmp/e2e-deps`) outside the repo. The runner's header documents the install steps; the static page itself remains zero-dependency.
- Headless Chromium font rendering may differ subtly from a desktop Chrome client; layout, overflow, and contrast assertions are robust to this.
