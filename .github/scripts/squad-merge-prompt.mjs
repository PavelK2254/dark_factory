import { readFile, writeFile, appendFile } from "node:fs/promises";

const squadDoc = [
  "## Squad coordination (Dark Factory CI)",
  "",
  "Operate as a **Squad-style** coordinator for this repo: align with `.squad/team.md`, `.squad/routing.md`, `.squad/decisions.md`, and relevant `agents/*/charter.md` before changing code.",
  "Use the team's routing and escalation ideas when splitting work logically, even though you run as a single session here.",
  "",
  "**Jira artefacts** (canonical):",
  "",
].join("\n");

async function appendGithubEnv(pairs) {
  const file = process.env.GITHUB_ENV;
  if (!file) return;
  let body = "";
  for (const [k, v] of Object.entries(pairs)) {
    const s = String(v ?? "");
    if (s.includes("\n")) body += `${k}<<EOF_${k}\n${s}\nEOF_${k}\n`;
    else body += `${k}=${s}\n`;
  }
  await appendFile(file, body);
}

async function main() {
  const runDir = process.env.RUN_DIR || "";
  const promptFile = process.env.PROMPT_FILE || "";
  const specFile = process.env.SPEC_FILE || "";

  if (!runDir || !promptFile) {
    throw new Error("squad-merge-prompt.mjs requires RUN_DIR and PROMPT_FILE");
  }

  const outPath = `${runDir.replace(/\/+$/, "")}/squad-prompt.md`;

  const basePrompt = await readFile(promptFile, "utf8");
  const specPointer = specFile
    ? [`**Spec path:** read the live file at \`${specFile}\` (also referenced in the task prompt below).`, ""].join("\n")
    : "";

  const merged = [squadDoc, specPointer, "---", "", "### Claude task prompt", "", basePrompt, ""].join("\n");
  await writeFile(outPath, merged, "utf8");
  await appendGithubEnv({ SQUAD_PROMPT_FILE: outPath });
  console.log(`Wrote Squad-aware prompt: ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
