#!/usr/bin/env node
/**
 * Claude Code PreToolUse (Bash) hook: agents never write to `main` in any git workflow mode
 * (git-workflow/RULE.mdc § Mode behavior table invariants; temp_job_git-workflow-model-c D25/D26).
 * Blocks `git commit` while `main` is checked out, and any `git push` whose destination is `main`.
 * No override: the user runs bootstrap/emergency commands on `main` themselves.
 *
 * Contract: exit 2 + reason on stderr blocks the tool call; exit 0 with no output = no decision.
 * Malformed input fails closed only when the raw text mentions git.
 */

const path = require("path");
const { spawnSync } = require("child_process");

const PROTECTED_BRANCH = "main";
const SEPARATORS = new Set(["&&", "||", ";", "|", "&", "\n"]);
const GIT_OPTS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace"]);
const REASON =
  "Blocked: agents never commit or push to `main` (git-workflow/RULE.mdc § Mode behavior table). " +
  "Work on a branch and open a PR; if this is a bootstrap or emergency step, the user runs the command themselves.";

/**
 * Second copy of the hook-input reader — the other is in scripts/ensure-deps-installed.cjs.
 * A third hook script should extract both into scripts/hook-input.cjs (name-the-mechanism F2).
 * @param {string} raw
 * @returns {{cwd?: string, tool_input?: {command?: string}} | null}
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
 * Shell-ish tokenizer: whitespace split with single/double quotes; separators become tokens.
 * @param {string} command
 * @returns {string[]}
 */
function tokenize(command) {
  const re = /'([^']*)'|"((?:\\.|[^"\\])*)"|(&&|\|\||[;|&\n])|([^\s'";|&]+)/g;
  const tokens = [];
  let m;
  while ((m = re.exec(command)) !== null) {
    tokens.push(m[1] ?? m[2] ?? m[3] ?? m[4]);
  }
  return tokens;
}

/**
 * @param {string[]} tokens
 * @returns {string[][]} simple commands between separators
 */
function splitSegments(tokens) {
  const segments = [[]];
  for (const t of tokens) {
    if (SEPARATORS.has(t)) segments.push([]);
    else segments[segments.length - 1].push(t);
  }
  return segments.filter((s) => s.length > 0);
}

/** Drop leading `VAR=value` assignments and `command`/`exec` wrappers. */
function stripPrefixes(segment) {
  let i = 0;
  while (
    i < segment.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(segment[i]) || ["command", "exec"].includes(segment[i]))
  )
    i++;
  return segment.slice(i);
}

/**
 * @param {string[]} args tokens after `git`
 * @param {string} dir directory the command runs in
 * @returns {{dir: string, sub: string | undefined, rest: string[]}}
 */
function parseGitInvocation(args, dir) {
  let i = 0;
  let effectiveDir = dir;
  while (i < args.length && args[i].startsWith("-")) {
    const opt = args[i];
    if (opt === "-C") effectiveDir = path.resolve(effectiveDir, args[i + 1] || ".");
    i += GIT_OPTS_WITH_VALUE.has(opt) ? 2 : 1;
  }
  return { dir: effectiveDir, sub: args[i], rest: args.slice(i + 1) };
}

/**
 * @param {string} refspec
 * @param {string | null} currentBranch
 * @returns {boolean}
 */
function refspecTargetsMain(refspec, currentBranch) {
  const spec = refspec.replace(/^\+/, "");
  const dst = spec.includes(":") ? spec.slice(spec.indexOf(":") + 1) : spec;
  const name = dst === "HEAD" ? currentBranch : dst.replace(/^refs\/heads\//, "");
  return name === PROTECTED_BRANCH;
}

/**
 * @param {string[]} rest tokens after `push`
 * @param {string | null} currentBranch
 * @returns {boolean}
 */
function pushTargetsMain(rest, currentBranch) {
  if (rest.some((a) => a === "--all" || a === "--mirror")) return true;
  const positional = rest.filter((a) => !a.startsWith("-"));
  const refspecs = positional.slice(1);
  if (refspecs.length === 0) return currentBranch === PROTECTED_BRANCH;
  return refspecs.some((r) => refspecTargetsMain(r, currentBranch));
}

/**
 * @param {string[]} segment one simple command
 * @param {string} dir
 * @param {(dir: string) => string | null} getBranch
 * @returns {boolean} true when this command writes to `main`
 */
function segmentWritesMain(segment, dir, getBranch) {
  const words = stripPrefixes(segment);
  if (["bash", "sh"].includes(path.basename(words[0] || "")) && words[1] === "-c") {
    return commandWritesMain(words[2] || "", dir, getBranch);
  }
  if (path.basename(words[0] || "").replace(/\.exe$/, "") !== "git") return false;
  const git = parseGitInvocation(words.slice(1), dir);
  if (git.sub === "commit") return getBranch(git.dir) === PROTECTED_BRANCH;
  if (git.sub === "push") return pushTargetsMain(git.rest, getBranch(git.dir));
  return false;
}

/**
 * @param {string} command full Bash command
 * @param {string} cwd
 * @param {(dir: string) => string | null} getBranch current branch name, or null when detached
 * @returns {boolean}
 */
function commandWritesMain(command, cwd, getBranch) {
  let dir = cwd;
  for (const segment of splitSegments(tokenize(command))) {
    const words = stripPrefixes(segment);
    if (words[0] === "cd" && words[1]) {
      dir = path.resolve(dir, words[1]);
      continue;
    }
    if (segmentWritesMain(segment, dir, getBranch)) return true;
  }
  return false;
}

/** @type {(dir: string) => string | null} */
function defaultGetBranch(dir) {
  const res = spawnSync("git", ["symbolic-ref", "--short", "-q", "HEAD"], {
    cwd: dir,
    encoding: "utf8",
  });
  return res.status === 0 ? res.stdout.trim() : null;
}

/**
 * @param {string} raw stdin text
 * @param {(dir: string) => string | null} [getBranch]
 * @returns {{block: boolean, reason?: string}}
 */
function decide(raw, getBranch = defaultGetBranch) {
  const input = parseHookInput(raw);
  const command = input && input.tool_input && input.tool_input.command;
  if (typeof command !== "string" || typeof input.cwd !== "string") {
    return /\bgit\b/.test(raw)
      ? { block: true, reason: `${REASON} (hook input unreadable)` }
      : { block: false };
  }
  return commandWritesMain(command, input.cwd, getBranch)
    ? { block: true, reason: REASON }
    : { block: false };
}

if (require.main === module) {
  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    const result = decide(raw);
    if (result.block) {
      process.stderr.write(`${result.reason}\n`);
      process.exit(2);
    }
    process.exit(0);
  });
}

module.exports = { tokenize, commandWritesMain, decide };
