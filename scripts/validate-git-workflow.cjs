#!/usr/bin/env node
/**
 * Validates src/config/git-workflow.json — mode enum SSOT for Model A / B / C.
 * The only code that reads the mode; CI and hooks call `--print-mode` instead of
 * parsing the JSON themselves (behavior per mode: git-workflow/RULE.mdc § Mode behavior table).
 *
 * Usage:
 *   node scripts/validate-git-workflow.cjs               → "validate-git-workflow: OK (mode=…)", exit 0 | error, exit 1
 *   node scripts/validate-git-workflow.cjs --print-mode  → mode only on stdout, exit 0 | nothing on stdout, error on stderr, exit 1
 */

const fs = require("fs");
const path = require("path");

const ALLOWED_MODES = new Set(["model-a", "model-b", "model-c"]);

/**
 * @param {string} [rootDir]
 * @returns {{ok: true, mode: string} | {ok: false, error: string}}
 */
function validateGitWorkflow(rootDir = path.resolve(__dirname, "..")) {
  const configPath = path.join(rootDir, "src", "config", "git-workflow.json");

  if (!fs.existsSync(configPath)) {
    return { ok: false, error: `Missing ${path.relative(rootDir, configPath)}` };
  }

  let raw;
  try {
    raw = fs.readFileSync(configPath, "utf8");
  } catch (err) {
    return { ok: false, error: `Cannot read config: ${err.message}` };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: `Invalid JSON: ${err.message}` };
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "Config must be a JSON object" };
  }

  if (!Object.prototype.hasOwnProperty.call(parsed, "mode")) {
    return { ok: false, error: 'Missing required key "mode"' };
  }

  const { mode } = parsed;
  if (typeof mode !== "string" || !ALLOWED_MODES.has(mode)) {
    return {
      ok: false,
      error: `Invalid mode ${JSON.stringify(mode)}; allowed: ${[...ALLOWED_MODES].join(" | ")}`,
    };
  }

  return { ok: true, mode };
}

/**
 * CLI entry, injectable for tests. `--print-mode` writes only the mode so CI can
 * redirect it into $GITHUB_OUTPUT; on error stdout stays empty.
 * @param {string[]} argv
 * @param {{rootDir?: string, stdout?: (s: string) => void, stderr?: (s: string) => void}} [io]
 * @returns {number} exit code
 */
function runCli(argv, io = {}) {
  const stdout = io.stdout || ((s) => process.stdout.write(s));
  const stderr = io.stderr || ((s) => process.stderr.write(s));
  const result = validateGitWorkflow(io.rootDir);

  if (!result.ok) {
    stderr(`validate-git-workflow: ${result.error}\n`);
    return 1;
  }
  if (argv.includes("--print-mode")) {
    stdout(`${result.mode}\n`);
    return 0;
  }
  stdout(`validate-git-workflow: OK (mode=${result.mode})\n`);
  return 0;
}

if (require.main === module) {
  process.exit(runCli(process.argv.slice(2)));
}

module.exports = { validateGitWorkflow, runCli, ALLOWED_MODES };
