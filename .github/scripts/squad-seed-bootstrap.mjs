/**
 * After squad init (+ optional --preset default for agent pack), align Squad state with CI inputs:
 * - Jira key + summary -> Squad README-style text in .squad/.init-prompt (SDK casting description)
 * - Same text reflected in **Building:** and .squad/identity/now.md
 * - When ## Members has no roster rows, populate from each .squad/agents/<agent>/charter.md
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

function escYamlScalar(s) {
  return String(s).replace(/\r\n/g, "\n").trim();
}

function escapeRegExp(s) {
  return s.replace(/[|\\^$*+?.()[\]{}]/g, "\\$&");
}

/** Double-quoted YAML scalar for one line (focus_area). */
function yamlDoubleQuotedOneLine(s) {
  const one = escYamlScalar(s).replace(/\n/g, " ");
  return JSON.stringify(one);
}

function effectiveBuilding() {
  const key = escYamlScalar(process.env.BOOTSTRAP_ISSUE_KEY || "");
  const b = escYamlScalar(process.env.BOOTSTRAP_BUILDING || "");
  if (!key) return b;
  if (!b) return key;
  const prefixed =
    b.startsWith(key + ":") ||
    b.startsWith(key + " -") ||
    new RegExp("^" + escapeRegExp(key) + "\\s*[-:\u2014\u2013]").test(b);
  if (prefixed || b.startsWith(key)) return b;
  return key + ": " + b;
}

function membersSectionNeedsSeed(teamMd) {
  const m = teamMd.match(/## Members\r?\n([\s\S]*?)(?=\r?\n## |\r?\n*$)/);
  if (!m) return true;
  const body = m[1];
  const lines = body.split(/\r?\n/);
  const dataRows = lines.filter((l) => {
    const t = l.trim();
    if (!t.startsWith("|")) return false;
    if (/^\|\s*[-:]/.test(t)) return false;
    if (/^\|\s*Name\s*\|/.test(t)) return false;
    return true;
  });
  return dataRows.length === 0;
}

/** First markdown H1 Title - Role heading in charter.md */
function parseCharterHeading(charterRaw, fallbackSlug) {
  const m = charterRaw.match(/^#\s*(.+?)\s*[\u2014\u2013\-]\s*(.+)$/m);
  if (m) {
    return { displayName: m[1].trim(), role: m[2].trim() };
  }
  return { displayName: fallbackSlug, role: "Agent" };
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function syncRosterFromAgents(teamPath) {
  if (!(await pathExists(teamPath))) {
    console.warn("Missing " + teamPath + "; skipping roster sync.");
    return;
  }
  const squadRoot = path.dirname(teamPath);
  const agentsDir = path.join(squadRoot, "agents");
  if (!(await pathExists(agentsDir))) return;

  let teamMd = await readFile(teamPath, "utf8");
  const forceMembersSync = process.env.BOOTSTRAP_FORCE_MEMBERS_SYNC === "true";
  if (!forceMembersSync && !membersSectionNeedsSeed(teamMd)) {
    console.log("team.md ## Members already has rows; skipping roster sync.");
    return;
  }
  if (forceMembersSync) {
    console.log("BOOTSTRAP_FORCE_MEMBERS_SYNC: rewriting ## Members from .squad/agents.");
  }

  const entries = await readdir(agentsDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name);
  /** @type {{ slug: string; displayName: string; role: string }[]} */
  const rows = [];

  for (const slug of dirs) {
    const charterPath = path.join(agentsDir, slug, "charter.md");
    if (!(await pathExists(charterPath))) continue;
    const charterRaw = await readFile(charterPath, "utf8");
    const { displayName, role } = parseCharterHeading(charterRaw, slug);
    rows.push({ slug, displayName, role });
  }

  const tail = new Set(["scribe", "ralph"]);
  rows.sort((a, b) => {
    const at = tail.has(a.slug) ? 1 : 0;
    const bt = tail.has(b.slug) ? 1 : 0;
    if (at !== bt) return at - bt;
    return a.slug.localeCompare(b.slug);
  });

  if (rows.length === 0) {
    console.log("No agent charters found; skipping roster sync.");
    return;
  }

  const rowLines = rows.map((r) => {
    const charterCell = "[charter](agents/" + r.slug + "/charter.md)";
    return "| " + r.displayName + " | " + r.role + " | " + charterCell + " | active |";
  });

  const tableLines = ["## Members", "", "| Name | Role | Charter | Status |", "|------|------|---------|--------|", ...rowLines, ""];
  const replacement = tableLines.join("\n");

  if (/## Members\r?\n/.test(teamMd)) {
    // Prefer stopping at ## Project Context so we never swallow or duplicate following sections.
    if (/\r?\n## Project Context\r?\n/.test(teamMd)) {
      teamMd = teamMd.replace(
        /## Members\r?\n[\s\S]*?(?=\r?\n## Project Context\r?\n)/m,
        replacement.trimEnd() + "\n\n",
      );
    } else {
      teamMd = teamMd.replace(/## Members\r?\n[\s\S]*?(?=\r?\n## |\r?\n*$)/m, replacement.trimEnd());
    }
  } else {
    teamMd += "\n" + replacement;
  }

  await writeFile(teamPath, teamMd, "utf8");
  console.log("Synced team.md ## Members (" + rows.length + " agents).");
}

/** Squad README quick-start shape; stored as .init-prompt for coordinator / REPL casting. */
function readmeQuickStartPrompt(building) {
  return ["I'm starting a new project. Set up the team.", "Here's what I'm building: " + building].join("\n");
}

async function writeInitPrompt(building) {
  const promptPath = path.join(".squad", ".init-prompt");
  const body = readmeQuickStartPrompt(building);
  await writeFile(promptPath, body + "\n", "utf8");
  console.log("Wrote " + promptPath + " (Jira-driven project description).");
}

async function seedBuildingAndIdentity(building) {
  await writeInitPrompt(building);

  const teamPath = ".squad/team.md";
  let team;
  try {
    team = await readFile(teamPath, "utf8");
  } catch {
    console.warn("Missing " + teamPath + "; skipping Building / identity seed.");
    return;
  }

  const buildingBullet = "- **Building:** " + building;

  if (/^- \*\*Building:\*\* /m.test(team)) {
    team = team.replace(/^- \*\*Building:\*\* .*$/m, buildingBullet);
  } else if (/^- \*\*Project:\*\* /m.test(team)) {
    team = team.replace(/^(- \*\*Project:\*\* .*\n)/m, (_, g1) => g1 + buildingBullet + "\n");
  } else if (team.includes("## Project Context")) {
    team = team.replace(/(## Project Context\n+)/, (_, g1) => g1 + buildingBullet + "\n");
  } else {
    team += "\n## Project Context\n\n" + buildingBullet + "\n";
  }
  await writeFile(teamPath, team, "utf8");
  console.log("Updated " + teamPath + " with Building.");

  const nowPath = ".squad/identity/now.md";
  const iso = new Date().toISOString();
  const focusBody = building.length > 200 ? building.slice(0, 197) + "..." : building;
  const focusLine = "New project \u2014 " + focusBody;

  let now;
  try {
    now = await readFile(nowPath, "utf8");
  } catch {
    now = "---\nupdated_at: \nfocus_area: \nactive_issues: []\n---\n\n# What We're Focused On\n";
  }

  now = now.replace(/^updated_at:.*$/m, "updated_at: " + iso);
  now = now.replace(/^focus_area:.*$/m, "focus_area: " + yamlDoubleQuotedOneLine(focusLine));

  const readmeAligned = readmeQuickStartPrompt(building);

  const section = ["# What We're Focused On", "", readmeAligned, "", "(Seeded from CI; see Squad README quick start at github.com/PavelK2254/squad)", ""].join("\n");

  if (/# What We're Focused On/i.test(now)) {
    now = now.replace(/# What We're Focused On[\s\S]*/m, section.trimEnd());
  } else {
    now += "\n" + section;
  }

  await writeFile(nowPath, now, "utf8");
  console.log("Updated " + nowPath + " for new-project bootstrap.");
}

async function main() {
  const building = effectiveBuilding();

  await syncRosterFromAgents(".squad/team.md");

  if (!building) {
    console.log("No BOOTSTRAP_BUILDING / BOOTSTRAP_ISSUE_KEY; skipping Building + identity seed.");
    return;
  }

  await seedBuildingAndIdentity(building);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
