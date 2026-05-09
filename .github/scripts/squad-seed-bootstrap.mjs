/**
 * After `squad init`, optionally seed Project Context + identity focus from CI inputs.
 * When BOOTSTRAP_BUILDING is unset or empty, exits 0 without changes.
 */
import { readFile, writeFile } from "node:fs/promises";

function escYamlScalar(s) {
  return String(s).replace(/\r\n/g, "\n").trim();
}

/** Double-quoted YAML scalar for one line (focus_area). */
function yamlDoubleQuotedOneLine(s) {
  const one = escYamlScalar(s).replace(/\n/g, " ");
  return JSON.stringify(one);
}

async function main() {
  const building = escYamlScalar(process.env.BOOTSTRAP_BUILDING || "");
  if (!building) {
    console.log("No BOOTSTRAP_BUILDING set; skipping Squad bootstrap seed.");
    return;
  }

  const teamPath = ".squad/team.md";
  let team;
  try {
    team = await readFile(teamPath, "utf8");
  } catch {
    console.warn(`Missing ${teamPath}; skipping team.md seed.`);
    team = null;
  }

  const buildingBullet = `- **Building:** ${building}`;

  if (team) {
    if (/^- \*\*Building:\*\* /m.test(team)) {
      team = team.replace(/^- \*\*Building:\*\* .*$/m, buildingBullet);
    } else if (/^- \*\*Project:\*\* /m.test(team)) {
      team = team.replace(/^(- \*\*Project:\*\* .*\n)/m, `$1${buildingBullet}\n`);
    } else if (team.includes("## Project Context")) {
      team = team.replace(/(## Project Context\n+)/, `$1${buildingBullet}\n`);
    } else {
      team += `\n## Project Context\n\n${buildingBullet}\n`;
    }
    await writeFile(teamPath, team, "utf8");
    console.log(`Updated ${teamPath} with Building.`);
  }

  const nowPath = ".squad/identity/now.md";
  const iso = new Date().toISOString();
  const focusLine = `New project — ${
    building.length > 200 ? `${building.slice(0, 197)}...` : building
  }`;

  let now;
  try {
    now = await readFile(nowPath, "utf8");
  } catch {
    now = "---\nupdated_at: \nfocus_area: \nactive_issues: []\n---\n\n# What We're Focused On\n";
  }

  now = now.replace(/^updated_at:.*$/m, `updated_at: ${iso}`);
  now = now.replace(/^focus_area:.*$/m, `focus_area: ${yamlDoubleQuotedOneLine(focusLine)}`);

  const section = [
    `# What We're Focused On`,
    ``,
    `Starting a new project. Set up the team.`,
    ``,
    `**Building:** ${building}`,
    ``,
    `Coordinator should run Init Mode per \`.github/agents/squad.agent.md\` until the roster is confirmed.`,
    ``,
  ].join("\n");

  if (/# What We're Focused On/i.test(now)) {
    now = now.replace(/# What We're Focused On[\s\S]*/m, section.trimEnd());
  } else {
    now += `\n${section}`;
  }

  await writeFile(nowPath, now, "utf8");
  console.log(`Updated ${nowPath} for new-project bootstrap.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
