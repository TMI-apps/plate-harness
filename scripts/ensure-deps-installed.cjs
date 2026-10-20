#!/usr/bin/env node
/**
 * Claude Code SessionStart hook: make sure the session's working tree has dependencies and
 * husky hooks, so the pre-commit split (DOC_AGENT_WORKFLOW_LAYERS § Local git) runs in every
 * worktree session too.
 *
 * Why stdin `cwd`: in desktop worktree sessions the hook process starts in the main checkout;
 * only the hook input's `cwd` points at the session's worktree.
 *
 * Contract: always exit 0 so the session starts. Silent when nothing is needed or the install
 * succeeds; one warning line on stdout otherwise (SessionStart stdout reaches Claude's context).
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const INSTALL_TIMEOUT_MS = 280_000;

/**
 * Second copy of the hook-input reader — the other is in scripts/deny-git-write-on-main.cjs.
 * A third hook script should extract both into scripts/hook-input.cjs (name-the-mechanism F2).
 * @param {string} raw
 * @returns {{cwd?: string} | null}
 */
function parseHookInput(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * @param {string[]} args git arguments that print one path
 * @param {string} cwd
 * @param {(args: string[], cwd: string) => {status: number | null, stdout: string}} runGit
 * @returns {string | null} absolute path, or null when cwd is not inside a work tree
 */
function gitPath(args, cwd, runGit) {
  const res = runGit(args, cwd);
  if (res.status !== 0) return null;
  const out = res.stdout.trim();
  return out ? path.resolve(cwd, out) : null;
}

/**
 * Accept only a work tree of the same repository as the project (main checkout or any of its
 * worktrees, wherever the app put them).
 * @param {string} cwd
 * @param {string} projectDir
 * @param {Function} runGit
 * @returns {string | null} work tree root to install into
 */
function resolveTargetTree(cwd, projectDir, runGit) {
  if (!cwd || !path.isAbsolute(cwd) || !fs.existsSync(cwd)) return null;
  const top = gitPath(["rev-parse", "--show-toplevel"], cwd, runGit);
  const common = gitPath(["rev-parse", "--git-common-dir"], cwd, runGit);
  const projectCommon = gitPath(["rev-parse", "--git-common-dir"], projectDir, runGit);
  if (!top || !common || !projectCommon) return null;
  return path.normalize(common) === path.normalize(projectCommon) ? top : null;
}

/**
 * @param {string} treeDir
 * @param {(p: string) => boolean} exists
 * @returns {boolean}
 */
function needsInstall(treeDir, exists = fs.existsSync) {
  return (
    !exists(path.join(treeDir, "node_modules", ".modules.yaml")) ||
    !exists(path.join(treeDir, ".husky", "_"))
  );
}

/** @type {(args: string[], cwd: string) => {status: number | null, stdout: string}} */
function defaultRunGit(args, cwd) {
  const res = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: res.status, stdout: res.stdout || "" };
}

/** pnpm is a .cmd shim on Windows, which spawn cannot start without a shell. Args are static. */
function defaultRunInstall(cwd) {
  const res = spawnSync("pnpm", ["install", "--frozen-lockfile"], {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: INSTALL_TIMEOUT_MS,
  });
  return { status: res.status, error: res.error };
}

/**
 * @param {string} raw stdin text
 * @param {{projectDir: string, runGit?: Function, runInstall?: Function, exists?: Function, log?: (s: string) => void}} deps
 * @returns {"skipped" | "present" | "installed" | "failed"}
 */
function run(raw, deps) {
  const log = deps.log || ((s) => process.stdout.write(s));
  const runGit = deps.runGit || defaultRunGit;
  const input = parseHookInput(raw);
  const tree = input && resolveTargetTree(input.cwd, deps.projectDir, runGit);
  if (!tree) return "skipped";
  if (!needsInstall(tree, deps.exists)) return "present";

  const res = (deps.runInstall || defaultRunInstall)(tree);
  if (res.status === 0) return "installed";
  log(
    `ensure-deps-installed: pnpm install --frozen-lockfile failed in ${tree} — git hooks will not run until dependencies are installed.\n`
  );
  return "failed";
}

if (require.main === module) {
  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    try {
      run(raw, { projectDir: process.env.CLAUDE_PROJECT_DIR || process.cwd() });
    } catch (err) {
      process.stdout.write(`ensure-deps-installed: skipped (${err.message})\n`);
    }
    process.exit(0);
  });
}

module.exports = { parseHookInput, resolveTargetTree, needsInstall, run };
