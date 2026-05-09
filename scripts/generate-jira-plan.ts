#!/usr/bin/env node
/**
 * generate-jira-plan.ts
 *
 * Previously a thin shim around `dark-factory.ts plan`.
 * Plan generation is now done by Claude Code via jira-requirements-dispatch.yml.
 * This file is kept as a placeholder so existing references don't break.
 */
console.error(
  "Plan generation has moved to Claude Code.\n" +
    "Trigger the workflow: .github/workflows/jira-requirements-dispatch.yml\n" +
    "or use: dark-factory apply <plan.json> --project <KEY> to apply an existing plan.",
);
process.exit(1);
