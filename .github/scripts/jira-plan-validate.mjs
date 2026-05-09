/**
 * jira-plan-validate.mjs
 *
 * Hard gate that runs after Claude generates the plan and before Jira issues
 * are created. Three checks:
 *
 *   1. The plan file exists and is valid JSON.
 *   2. The plan validates against schemas/jira-plan.schema.json (AJV).
 *   3. Every Epic contains at least one Task whose title starts with "E2E:"
 *      (case-insensitive, leading whitespace tolerated).
 *
 * Any failure exits non-zero so the workflow stops before the apply step.
 *
 * Inputs (env vars):
 *   PLAN_OUT   path to the generated plan JSON (default: output/generated-plan.json)
 */

import { readFile } from "node:fs/promises";
import { Ajv } from "ajv";

const planOut = process.env.PLAN_OUT || "output/generated-plan.json";

let raw;
try {
  raw = await readFile(planOut, "utf8");
} catch (err) {
  console.error(`FAIL: Could not read plan file at ${planOut}: ${err.message}`);
  process.exit(1);
}

let plan;
try {
  plan = JSON.parse(raw);
} catch (err) {
  console.error(`FAIL: Plan file at ${planOut} is not valid JSON: ${err.message}`);
  process.exit(1);
}

const schema = JSON.parse(await readFile("schemas/jira-plan.schema.json", "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(plan)) {
  console.error("FAIL: Plan does not validate against schemas/jira-plan.schema.json");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "/"} ${err.message}`);
  }
  process.exit(1);
}

const E2E_TITLE_RE = /^\s*e2e:/i;

const epicsMissingE2E = [];
for (const epic of plan.epics ?? []) {
  const hasE2E = (epic.tasks ?? []).some((task) => E2E_TITLE_RE.test(task.title ?? ""));
  if (!hasE2E) {
    epicsMissingE2E.push(epic.title ?? "<untitled epic>");
  }
}

if (epicsMissingE2E.length > 0) {
  console.error("FAIL: Every Epic must contain at least one Task whose title starts with 'E2E:'.");
  console.error("Epics missing an E2E Task:");
  for (const title of epicsMissingE2E) {
    console.error(`  - ${title}`);
  }
  console.error(
    "\nFix: rerun the planner. The prompt at prompts/planner.md mandates one E2E Task per Epic.",
  );
  process.exit(1);
}

const epicCount = plan.epics?.length ?? 0;
const taskCount = (plan.epics ?? []).reduce((s, e) => s + (e.tasks?.length ?? 0), 0);
const subtaskCount = (plan.epics ?? []).reduce(
  (s, e) => s + (e.tasks ?? []).reduce((ts, t) => ts + (t.subtasks?.length ?? 0), 0),
  0,
);
const e2eCount = (plan.epics ?? []).reduce(
  (s, e) => s + (e.tasks ?? []).filter((t) => E2E_TITLE_RE.test(t.title ?? "")).length,
  0,
);

console.log("Plan validation passed.");
console.log(`  Epics:    ${epicCount}`);
console.log(`  Tasks:    ${taskCount} (of which ${e2eCount} are E2E)`);
console.log(`  Subtasks: ${subtaskCount}`);
