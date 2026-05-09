#!/usr/bin/env node
// E2E verification for the Scrum landing page (docs/scrum/index.html).
// Produces full-page screenshots at desktop (1280) and mobile (375) viewports,
// captures an anchor-navigation screenshot sequence, and runs an axe-core audit.
//
// Usage:
//   node spec/KAN-133/e2e/scripts/run-e2e.mjs
//
// Env:
//   CHROMIUM_PATH  — chromium executable (default /usr/bin/chromium)
//   PORT           — static server port (default 8765)

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

// puppeteer-core / axe-core are installed in a scratch directory outside the repo
// (see plan.md) so they are not part of repository package.json. Resolve them via
// a require anchored to that scratch dir.
const e2eNodeModules = process.env.E2E_NODE_MODULES || '/tmp/e2e-deps/node_modules';
const e2eRequire = createRequire(resolve(e2eNodeModules, '..') + '/');
const puppeteer = e2eRequire('puppeteer-core');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..', '..', '..', '..');
const docRoot = resolve(repoRoot, 'docs', 'scrum');
const outDir = resolve(__dirname, '..');
const shotDir = resolve(outDir, 'screenshots');
const port = Number(process.env.PORT || 8765);
const chromiumPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const axeSource = await readFile(resolve(e2eNodeModules, 'axe-core/axe.min.js'), 'utf8');

await mkdir(shotDir, { recursive: true });

// 1. Start a static HTTP server.
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: docRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stderr.on('data', () => {}); // ignore noisy access logs
process.on('exit', () => server.kill('SIGTERM'));
await sleep(400);

const baseUrl = `http://127.0.0.1:${port}/`;

// 2. Launch headless Chromium.
const browser = await puppeteer.launch({
  executablePath: chromiumPath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});

const findings = {
  startedAt: new Date().toISOString(),
  baseUrl,
  desktop: {},
  mobile: {},
  anchors: {},
  axe: null,
};

try {
  // ---- Desktop pass ----
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await desktop.goto(baseUrl, { waitUntil: 'networkidle0' });

  findings.desktop.title = await desktop.title();
  findings.desktop.h1Count = await desktop.$$eval('h1', (els) => els.length);
  findings.desktop.metaDescription = await desktop.$eval(
    'meta[name="description"]',
    (m) => m.content,
  );
  findings.desktop.scrollWidth = await desktop.evaluate(() => document.documentElement.scrollWidth);
  findings.desktop.clientWidth = await desktop.evaluate(() => document.documentElement.clientWidth);
  findings.desktop.hasHero = await desktop.evaluate(() => !!document.querySelector('header.hero h1'));
  findings.desktop.hasFlow = await desktop.evaluate(() => !!document.querySelector('figure.flow svg'));
  findings.desktop.hasFooter = await desktop.evaluate(() => !!document.querySelector('footer'));
  findings.desktop.scrumGuideLinkText = await desktop
    .$eval('footer a[href*="scrumguides.org"]', (a) => a.textContent.trim())
    .catch(() => null);

  await desktop.screenshot({
    path: resolve(shotDir, 'desktop-full.png'),
    fullPage: true,
  });

  // Anchor navigation sequence (still desktop viewport).
  const anchors = ['roles', 'events', 'artifacts', 'sprint'];
  for (const id of anchors) {
    await desktop.evaluate(() => window.scrollTo(0, 0));
    await desktop.click(`nav.anchors a[href="#${id}"]`);
    // Wait for smooth-scroll to settle.
    await sleep(700);
    const targetTop = await desktop.evaluate((sel) => {
      const el = document.getElementById(sel);
      return el ? el.getBoundingClientRect().top : null;
    }, id);
    findings.anchors[id] = {
      hash: await desktop.evaluate(() => location.hash),
      targetRectTop: targetTop,
      // Heuristic: after smooth scroll, target should be near top of viewport (sticky nav offset tolerated).
      inView: targetTop !== null && targetTop > -20 && targetTop < 200,
    };
    await desktop.screenshot({
      path: resolve(shotDir, `anchor-${id}.png`),
      fullPage: false,
    });
  }

  // ---- axe-core audit (desktop) ----
  await desktop.goto(baseUrl, { waitUntil: 'networkidle0' });
  await desktop.evaluate(axeSource);
  const axeResult = await desktop.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
      resultTypes: ['violations', 'incomplete', 'passes'],
    });
  });
  findings.axe = {
    violations: axeResult.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      nodes: v.nodes.length,
    })),
    incomplete: axeResult.incomplete.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
    })),
    passCount: axeResult.passes.length,
    criticalCount: axeResult.violations.filter((v) => v.impact === 'critical').length,
    seriousCount: axeResult.violations.filter((v) => v.impact === 'serious').length,
  };

  await writeFile(
    resolve(outDir, 'accessibility-report.json'),
    JSON.stringify(axeResult, null, 2),
  );

  await desktop.close();

  // ---- Mobile pass ----
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: 'networkidle0' });
  findings.mobile.scrollWidth = await mobile.evaluate(() => document.documentElement.scrollWidth);
  findings.mobile.clientWidth = await mobile.evaluate(() => document.documentElement.clientWidth);
  findings.mobile.bodyScrollWidth = await mobile.evaluate(() => document.body.scrollWidth);
  findings.mobile.minTapTargetPx = await mobile.evaluate(() => {
    const links = Array.from(document.querySelectorAll('nav.anchors a'));
    return links.reduce((min, a) => {
      const r = a.getBoundingClientRect();
      const v = Math.min(r.width, r.height);
      return v < min ? v : min;
    }, Infinity);
  });
  await mobile.screenshot({
    path: resolve(shotDir, 'mobile-full.png'),
    fullPage: true,
  });
  // Mobile anchor sanity (just one for evidence).
  await mobile.click(`nav.anchors a[href="#events"]`);
  await sleep(700);
  await mobile.screenshot({
    path: resolve(shotDir, 'mobile-anchor-events.png'),
    fullPage: false,
  });
  await mobile.close();

  findings.completedAt = new Date().toISOString();
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

await writeFile(resolve(outDir, 'findings.json'), JSON.stringify(findings, null, 2));

// Build a short markdown digest of axe results.
const axe = findings.axe;
const lines = [];
lines.push('# Accessibility audit (axe-core) — summary');
lines.push('');
lines.push(`- Source: \`spec/KAN-133/e2e/accessibility-report.json\``);
lines.push(`- Tags: WCAG 2.0 / 2.1 A & AA + best-practice`);
lines.push(`- Passes: **${axe.passCount}**`);
lines.push(`- Violations: **${axe.violations.length}** (critical: **${axe.criticalCount}**, serious: **${axe.seriousCount}**)`);
lines.push(`- Incomplete (manual review suggested): **${axe.incomplete.length}**`);
lines.push('');
if (axe.violations.length === 0) {
  lines.push('No violations reported.');
} else {
  lines.push('| Rule | Impact | Nodes | Help |');
  lines.push('|---|---|---|---|');
  for (const v of axe.violations) {
    lines.push(`| \`${v.id}\` | ${v.impact ?? '-'} | ${v.nodes} | ${v.help} |`);
  }
}
if (axe.incomplete.length > 0) {
  lines.push('');
  lines.push('## Incomplete (review manually)');
  lines.push('');
  for (const v of axe.incomplete) {
    lines.push(`- \`${v.id}\` (${v.nodes} nodes) — ${v.description}`);
  }
}
await writeFile(resolve(outDir, 'accessibility-summary.md'), lines.join('\n') + '\n');

// Print a tiny console summary for the run log.
console.log(JSON.stringify({
  desktop: findings.desktop,
  mobile: findings.mobile,
  anchors: findings.anchors,
  axe: {
    violations: axe.violations.length,
    critical: axe.criticalCount,
    serious: axe.seriousCount,
    passes: axe.passCount,
    incomplete: axe.incomplete.length,
  },
}, null, 2));
