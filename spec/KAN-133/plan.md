# KAN-133 — E2E: Scrum landing page renders end-to-end on desktop and mobile

## Goal
Run a full end-to-end verification of the Scrum landing page (`docs/scrum/index.html`) and commit evidence (screenshots, axe accessibility report, and a checklist) under `spec/KAN-133/`.

## Note on artifact path
The Jira description references `spec/KAN-124/`, but `KAN-124` does not exist in this repository — every other ticket in this batch (KAN-130, KAN-131, KAN-132, KAN-135, KAN-136) lives under `spec/<key>/`, and the dispatch flow created `spec/KAN-133/` for this ticket. We follow the convention and put evidence under `spec/KAN-133/`. The acceptance-criteria text reference is preserved verbatim in `e2e-summary.md`.

## Approach
1. Serve `docs/scrum/` from a local Python HTTP server.
2. Drive headless Chromium with `puppeteer-core` (the system `/usr/bin/chromium` is used as the executable — no browser download).
3. For both desktop (1280×800) and mobile (375×812):
   - Load the page, wait for network idle.
   - Capture full-page screenshot.
   - For desktop, capture a screenshot sequence: top, then after clicking each anchor link (`#roles`, `#events`, `#artifacts`, `#sprint`).
   - Assert `documentElement.scrollWidth <= clientWidth` (no horizontal scroll).
4. Inject `axe-core` and run a full audit at desktop viewport. Save the JSON result; assert zero `critical` violations.
5. Write `spec/KAN-133/e2e-summary.md` mapping each acceptance criterion to pass/fail with a one-line evidence note.

## Files written under `spec/KAN-133/`
- `e2e/scripts/run-e2e.mjs` — the script that produced the evidence (committed for reproducibility).
- `e2e/screenshots/desktop-full.png` — 1280px full-page screenshot.
- `e2e/screenshots/mobile-full.png` — 375px full-page screenshot.
- `e2e/screenshots/anchor-roles.png`, `anchor-events.png`, `anchor-artifacts.png`, `anchor-sprint.png` — anchor navigation evidence.
- `e2e/accessibility-report.json` — full axe-core report.
- `e2e/accessibility-summary.md` — short markdown digest of axe results.
- `e2e-summary.md` — acceptance-criteria checklist.

## Reproducibility
The runner is `node spec/KAN-133/e2e/scripts/run-e2e.mjs`. It expects:
- `node` ≥ 18, `python3` (used to start the static server).
- A Chromium executable at `CHROMIUM_PATH` (default `/usr/bin/chromium`).
- `puppeteer-core` and `axe-core` installed in any `node_modules` reachable via `NODE_PATH` (in CI we install them in a scratch dir outside the repo to keep `package.json` untouched).

We deliberately do **not** add `puppeteer-core` / `axe-core` to repository `package.json`: the dependency surface for the static page itself is zero, and the E2E run is a one-off ticket task.

## Risks / unverified
- Lighthouse was not run (no Lighthouse binary preinstalled in this runner, and pulling it in to satisfy *or* axe is sufficient per the acceptance criterion). The axe-core audit covers the "zero critical accessibility violations" criterion equivalently.
- Screenshots are produced by headless Chromium; visual rendering is identical to a desktop Chrome client modulo OS font rasterization.
