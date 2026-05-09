import {
  initJira,
  fetchJson,
  transitionToCategory,
  transitionToInProgress,
  getJiraContext,
} from "./jira-dispatch.mjs";

const env = process.env;

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const mode = process.argv[2];
  if (!mode) {
    console.error("Usage: epic-runner.mjs <kickoff|advance>");
    process.exit(1);
  }
  run(mode).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

async function run(mode) {
  if (mode === "kickoff") return kickoff();
  if (mode === "advance") return advance();
  throw new Error(`Unknown mode: ${mode}`);
}

async function kickoff() {
  initJira();
  const epicKey = normalizeIssueKey(requireEnv("EPIC_KEY"));
  const epic = await fetchIssue(epicKey, "summary,status,issuetype");

  const issuetype = lower(epic?.fields?.issuetype?.name);
  if (issuetype !== "epic") {
    console.warn(`[kickoff] ${epicKey} issuetype is "${issuetype}", not Epic. Continuing anyway.`);
  }

  const epicCategory = lower(epic?.fields?.status?.statusCategory?.key);
  if (epicCategory === "done") {
    console.log(`[kickoff] Epic ${epicKey} is already Done; nothing to do.`);
    return;
  }

  await transitionToInProgress(epicKey, epic);

  const children = await fetchEpicChildren(epicKey);
  console.log(`[kickoff] Epic ${epicKey} has ${children.length} child(ren).`);

  if (children.length === 0) {
    await postJiraComment(
      epicKey,
      "Dark Factory: epic has no actionable children. Transitioning to In Review.",
    );
    await transitionToInReview(epicKey, epic);
    return;
  }

  const next = findNextActionableChild(children);
  if (!next) {
    await postJiraComment(
      epicKey,
      "Dark Factory: all children already Done. Transitioning epic to In Review.",
    );
    await transitionToInReview(epicKey, epic);
    return;
  }

  const nextCategory = lower(next?.fields?.status?.statusCategory?.key);
  if (nextCategory === "indeterminate") {
    await postJiraComment(
      epicKey,
      `Dark Factory: epic already in flight on ${next.key}; not redispatching.`,
    );
    console.log(`[kickoff] Idempotency guard: ${next.key} is already In Progress.`);
    return;
  }

  console.log(`[kickoff] Dispatching ${next.key} via jira_manual_button.`);
  await dispatchManualButton(next.key);
}

async function advance() {
  initJira();
  const mergedKey = normalizeIssueKey(requireEnv("MERGED_ISSUE_KEY"));

  const merged = await fetchIssue(mergedKey, "summary,status,issuetype,parent,created");

  const parent = merged?.fields?.parent;
  if (!parent?.key) {
    console.log(`[advance] ${mergedKey} has no parent epic; chain ends here.`);
    return;
  }

  const parentType = lower(parent?.fields?.issuetype?.name);
  if (parentType && parentType !== "epic") {
    console.log(`[advance] ${mergedKey} parent ${parent.key} is "${parentType}", not Epic; chain ends here.`);
    return;
  }

  const epicKey = parent.key;
  const mergedCreated = merged?.fields?.created;

  const children = await fetchEpicChildren(epicKey);
  console.log(`[advance] Epic ${epicKey} has ${children.length} child(ren).`);

  const next = findNextActionableChild(children, mergedCreated);
  if (!next) {
    console.log(`[advance] No actionable siblings remain in ${epicKey}; transitioning epic to In Review.`);
    const epic = await fetchIssue(epicKey, "summary,status");
    await transitionToInReview(epicKey, epic);
    return;
  }

  const nextCategory = lower(next?.fields?.status?.statusCategory?.key);
  if (nextCategory === "indeterminate") {
    console.log(`[advance] ${next.key} is already In Progress; not redispatching.`);
    return;
  }

  console.log(`[advance] Dispatching ${next.key} via jira_manual_button.`);
  await dispatchManualButton(next.key);
}

function buildEpicChildrenQuery(epicKey) {
  const safeKey = epicKey.replace(/"/g, "");
  return {
    jql: `parent = "${safeKey}"`,
    fields: ["summary", "status", "issuetype", "parent", "created"],
    maxResults: 200,
  };
}

async function fetchEpicChildren(epicKey) {
  const { baseUrl, headers } = getJiraContext();
  const body = buildEpicChildrenQuery(epicKey);
  const data = await fetchJson(`${baseUrl}/rest/api/3/search/jql`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const issues = Array.isArray(data?.issues) ? data.issues : [];
  return issues.slice().sort(byCreatedAsc);
}

function byCreatedAsc(a, b) {
  const ac = a?.fields?.created ?? "";
  const bc = b?.fields?.created ?? "";
  if (ac === bc) return 0;
  return ac < bc ? -1 : 1;
}

function findNextActionableChild(children, afterCreated) {
  for (const child of children) {
    const cat = lower(child?.fields?.status?.statusCategory?.key);
    if (cat === "done") continue;
    if (afterCreated) {
      const created = child?.fields?.created ?? "";
      if (created <= afterCreated) continue;
    }
    return child;
  }
  if (afterCreated) {
    return findNextActionableChild(children);
  }
  return undefined;
}

async function fetchIssue(key, fields) {
  const { baseUrl, headers } = getJiraContext();
  const url = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(key)}?fields=${encodeURIComponent(fields)}`;
  return fetchJson(url, { headers });
}

async function transitionToInReview(key, issue) {
  return transitionToCategory(key, issue, {
    skipCategories: [],
    categoryKey: "__no_category_match__",
    nameMatchers: ["in review", "code review", "review", "ready for review"],
    label: "In Review",
  });
}

async function postJiraComment(key, text) {
  const { baseUrl, headers } = getJiraContext();
  const adf = {
    body: {
      type: "doc",
      version: 1,
      content: [
        { type: "paragraph", content: [{ type: "text", text }] },
      ],
    },
  };
  try {
    const response = await fetch(
      `${baseUrl}/rest/api/3/issue/${encodeURIComponent(key)}/comment`,
      { method: "POST", headers, body: JSON.stringify(adf) },
    );
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(`[comment] Failed to post comment on ${key}: HTTP ${response.status} ${body}`);
    }
  } catch (err) {
    console.warn(`[comment] Failed to post comment on ${key}: ${err.message}`);
  }
}

async function dispatchManualButton(issueKey) {
  const pat = env.DISPATCH_PAT;
  const owner = requireEnv("REPO_OWNER");
  const repo = requireEnv("REPO_NAME");

  if (!pat) {
    console.log(`[skip] DISPATCH_PAT empty; would dispatch jira_manual_button for ${issueKey}.`);
    return;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
  const body = JSON.stringify({
    event_type: "jira_manual_button",
    client_payload: { issue_key: issueKey },
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body,
  });
  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Dispatch failed for ${issueKey}: HTTP ${response.status} ${errBody}`);
  }
  console.log(`[dispatch] Fired jira_manual_button for ${issueKey} (HTTP ${response.status}).`);
}

function requireEnv(name) {
  const v = env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function lower(s) {
  return String(s ?? "").toLowerCase();
}

function normalizeIssueKey(key) {
  const normalized = String(key || "").trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9]+-\d+$/.test(normalized)) {
    throw new Error(`Invalid Jira issue key: ${key}`);
  }
  return normalized;
}

export { buildEpicChildrenQuery, findNextActionableChild, byCreatedAsc };
