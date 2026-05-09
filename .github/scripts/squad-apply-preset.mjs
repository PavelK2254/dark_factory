/**
 * Apply a Squad SDK preset deterministically in CI.
 *
 * The Squad CLI wires `squad init --preset <name>` as a `.then()` after `runInit()`
 * without awaiting the chain; the Node process can exit before `applyPreset` runs,
 * so only init agents (e.g. scribe, ralph) appear. This script applies the preset
 * in a dedicated Node invocation so it always completes.
 *
 * Requires SQUAD_FORK_ROOT = path to cloned PavelK2254/squad repo after `npm run build`.
 * Optional: PRESET_NAME (default: default). Runs only when APPLY_PRESET === "true".
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

function forkModule(rel) {
  const root = process.env.SQUAD_FORK_ROOT || "";
  if (!root) {
    throw new Error("SQUAD_FORK_ROOT must point to the built squad fork clone");
  }
  const abs = path.join(root, ...rel.split("/"));
  return pathToFileURL(abs).href;
}

async function main() {
  if (process.env.APPLY_PRESET !== "true") {
    console.log("APPLY_PRESET is not true; skipping preset apply.");
    return;
  }

  const presetName = process.env.PRESET_NAME || "default";
  const teamRoot = process.cwd();
  const agentsDir = path.join(teamRoot, ".squad", "agents");

  const { seedBuiltinPresets, applyPreset } = await import(forkModule("packages/squad-sdk/dist/presets/index.js"));
  const { resolvePresetsDir, ensureSquadHome } = await import(forkModule("packages/squad-sdk/dist/resolution.js"));

  if (!resolvePresetsDir()) {
    console.log("No presets dir — ensuring squad home and seeding built-ins...");
    ensureSquadHome();
  }
  seedBuiltinPresets();

  const results = applyPreset(presetName, agentsDir);
  console.log(JSON.stringify(results, null, 2));

  const installed = results.filter((r) => r.status === "installed");
  const skipped = results.filter((r) => r.status === "skipped");
  const errors = results.filter((r) => r.status === "error");

  if (errors.length > 0 && installed.length === 0 && skipped.length === 0) {
    console.error("Preset apply failed:", errors.map((e) => e.reason || e.agent).join("; "));
    process.exit(1);
  }

  if (installed.length > 0) {
    console.log("Installed " + installed.length + " preset agent(s).");
  }
  if (skipped.length > 0) {
    console.log("Skipped " + skipped.length + " agent(s) (already present).");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
