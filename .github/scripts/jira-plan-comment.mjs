/**
 * jira-plan-comment.mjs
 *
 * Posts a summary of the generated plan (and applied issues if any) back to the Jira ticket.
 *
 * Inputs (env vars):
 *   ISSUE_KEY           Jira issue key (e.g. TDS-17)
 *   JIRA_BASE_URL       https://<site>.atlassian.net
 *   JIRA_EMAIL          Atlassian account email
 *   JIRA_API_TOKEN      Atlassian API token
 *   PLAN_OUT            path to the generated JSON plan
 *   LEDGER_OUT          path to the applied-issues ledger (only when APPLY_APPROVE=true)
 *   APPLY_APPROVE       "true" | "false"
 *   GITHUB_REPOSITORY   owner/repo (for run link)
 *   GITHUB_RUN_ID       numeric run id
 */

import { readFile } from "node:fs/promises";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function p(text) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function link(label, href) {
  return {
    type: "paragraph",
    content: [
      { type: "text", text: `${label}: ` },
      { type: "text", text: href, marks: [{ type: "link", attrs: { href } }] },
    ],
  };
}

const issueKey = requireEnv("ISSUE_KEY");
const jiraBaseUrl = requireEnv("JIRA_BASE_URL").replace(/\/+$/, "");
const jiraEmail = requireEnv("JIRA_EMAIL");
const jiraToken = requireEnv("JIRA_API_TOKEN");
const planOut = process.env.PLAN_OUT || "output/generated-plan.json";
const ledgerOut = process.env.LEDGER_OUT || "output/applied-issues.json";
const applyApprove = process.env.APPLY_APPROVE === "true";
const repo = process.env.GITHUB_REPOSITORY || "";
const runId = process.env.GITHUB_RUN_ID || "";

const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64")}`;
const headers = {
  Authorization: authHeader,
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function readJsonSafe(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

const plan = await readJsonSafe(planOut);
const ledger = applyApprove ? await readJsonSafe(ledgerOut) : null;

const content = [];

if (!plan) {
  content.push(p(`[TDF-bot] Plan generation failed — Claude did not write a valid JSON plan to ${planOut}.`));
  if (repo && runId) {
    content.push(link("Workflow run", `https://github.com/${repo}/actions/runs/${runId}`));
  }
} else {
  const epicCount = plan.epics?.length ?? 0;
  const taskCount = (plan.epics ?? []).reduce((s, e) => s + (e.tasks?.length ?? 0), 0);
  const subtaskCount = (plan.epics ?? []).reduce(
    (s, e) => s + (e.tasks ?? []).reduce((ts, t) => ts + (t.subtasks?.length ?? 0), 0),
    0,
  );

  content.push(
    p(`[TDF-bot] Claude generated a plan: ${epicCount} epic(s), ${taskCount} task(s), ${subtaskCount} subtask(s).`),
  );

  if (plan.summary) {
    content.push(p(plan.summary));
  }

  if (applyApprove && ledger) {
    const created = ledger.created ?? [];
    content.push(p(`Applied to Jira: ${created.length} issue(s) created.`));
    for (const issue of created.slice(0, 15)) {
      content.push(p(`  ${issue.type} ${issue.key}: ${issue.title}`));
    }
    if (created.length > 15) {
      content.push(p(`  … and ${created.length - 15} more.`));
    }
  } else if (!applyApprove) {
    content.push(p("Dry run — no Jira issues written. Trigger again with apply_approve=true to create them."));
  }

  if ((plan.open_questions ?? []).length > 0) {
    content.push(p("Open questions:"));
    for (const q of plan.open_questions) {
      content.push(p(`  • ${q}`));
    }
  }

  if (repo && runId) {
    content.push(link("Workflow run", `https://github.com/${repo}/actions/runs/${runId}`));
  }
}

const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`, {
  method: "POST",
  headers,
  body: JSON.stringify({ body: { type: "doc", version: 1, content } }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Failed to post Jira comment: HTTP ${response.status} ${body}`);
}

console.log(`Posted plan summary comment to ${issueKey}`);
