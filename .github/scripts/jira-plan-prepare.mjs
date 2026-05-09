/**
 * jira-plan-prepare.mjs
 *
 * Reads the requirements markdown already fetched by jira-requirements-source.mjs
 * and writes a planning prompt for Claude Code.
 *
 * Inputs (env vars):
 *   SOURCE_PATH   path to the requirements markdown (default: output/requirements-from-jira.md)
 *   PLAN_OUT      where Claude should write the JSON plan (default: output/generated-plan.json)
 *
 * Output:
 *   output/planning-prompt.md   the prompt file fed to claude-code-base-action
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const sourcePath = process.env.SOURCE_PATH || "output/requirements-from-jira.md";
const planOut = process.env.PLAN_OUT || "output/generated-plan.json";
const promptOut = "output/planning-prompt.md";

// Load the canonical planner prompt template and substitute placeholders.
// The template lives in prompts/planner.md and is the source of truth for
// planner behaviour — edit it there, not here.
const templateRaw = await readFile("prompts/planner.md", "utf8");

const prompt = templateRaw
  .replaceAll("{{SPEC_FILE}}", sourcePath)
  .replaceAll("{{PLAN_FILE}}", planOut)
  .replaceAll("{{TRANSCRIPT_FILE}}", "")   // no transcript on the requirements flow
  .replaceAll("{{TICKET_FOLDER}}", path.dirname(planOut));

// Append the actual requirements content so Claude doesn't have to read a
// separate file if the action sandbox restricts fs access, but leave the
// spec_file reference intact so Claude can re-read if needed.
const requirementsMarkdown = await readFile(sourcePath, "utf8");

const finalPrompt = [
  `Run mode: NEW`,
  ``,
  prompt,
  ``,
  `## Requirements content (from ${sourcePath})`,
  ``,
  requirementsMarkdown,
].join("\n");

await mkdir(path.dirname(promptOut), { recursive: true });
await writeFile(promptOut, finalPrompt, "utf8");

console.log(`Wrote planning prompt: ${promptOut}`);
console.log(`Plan output target:    ${planOut}`);
