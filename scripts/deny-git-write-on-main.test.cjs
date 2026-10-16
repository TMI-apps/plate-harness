const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { decide, tokenize } = require("./deny-git-write-on-main.cjs");

const ROOT = path.resolve("/repo");
const OTHER = path.resolve("/repo/other");

/**
 * @param {Record<string, string | null>} branches dir → checked-out branch
 */
const branchesAt = (branches) => (dir) => (dir in branches ? branches[dir] : "feature/x");

const hookInput = (command, cwd = ROOT) =>
  JSON.stringify({
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    cwd,
    tool_input: { command },
  });

const onMain = branchesAt({ [ROOT]: "main" });
const onFeature = branchesAt({ [ROOT]: "feature/x" });

describe("deny-git-write-on-main", () => {
  test("should block git commit when main is checked out", () => {
    assert.equal(decide(hookInput('git commit -m "x"'), onMain).block, true);
  });

  test("should allow git commit on a feature branch", () => {
    assert.equal(decide(hookInput('git commit -m "x"'), onFeature).block, false);
  });

  test("should allow git commit when HEAD is detached", () => {
    assert.equal(decide(hookInput("git commit -m x"), branchesAt({ [ROOT]: null })).block, false);
  });

  test("should block git -C <dir> commit when that dir is on main", () => {
    const get = branchesAt({ [ROOT]: "feature/x", [OTHER]: "main" });
    assert.equal(decide(hookInput("git -C other commit -m x"), get).block, true);
  });

  test("should skip -c key=value options before the subcommand", () => {
    assert.equal(decide(hookInput("git -c user.name=a commit -m x"), onMain).block, true);
  });

  test("should block a commit chained after other commands", () => {
    assert.equal(decide(hookInput("pnpm lint && git commit -m x"), onMain).block, true);
    assert.equal(decide(hookInput("pnpm lint; git commit -m x"), onMain).block, true);
  });

  test("should follow cd before a chained commit", () => {
    const get = branchesAt({ [ROOT]: "feature/x", [OTHER]: "main" });
    assert.equal(decide(hookInput("cd other && git commit -m x"), get).block, true);
  });

  test("should block push to main from a feature branch via refspec", () => {
    assert.equal(decide(hookInput("git push origin HEAD:main"), onFeature).block, true);
    assert.equal(
      decide(hookInput("git push origin feature/x:refs/heads/main"), onFeature).block,
      true
    );
    assert.equal(decide(hookInput("git push -f origin +feature/x:main"), onFeature).block, true);
  });

  test("should block a bare push or HEAD push while main is checked out", () => {
    assert.equal(decide(hookInput("git push"), onMain).block, true);
    assert.equal(decide(hookInput("git push origin HEAD"), onMain).block, true);
    assert.equal(decide(hookInput("git push origin main"), onFeature).block, true);
  });

  test("should block push --all and --mirror", () => {
    assert.equal(decide(hookInput("git push --all origin"), onFeature).block, true);
    assert.equal(decide(hookInput("git push --mirror origin"), onFeature).block, true);
  });

  test("should allow pushing a feature branch", () => {
    assert.equal(decide(hookInput("git push -u origin HEAD"), onFeature).block, false);
    assert.equal(decide(hookInput("git push origin feature/x"), onMain).block, false);
  });

  test("should re-scan bash -c strings", () => {
    assert.equal(decide(hookInput('bash -c "git push origin HEAD:main"'), onFeature).block, true);
  });

  test("should see through env prefixes", () => {
    assert.equal(decide(hookInput("GIT_TRACE=1 git commit -m x"), onMain).block, true);
  });

  test("should allow non-git and read-only git commands", () => {
    assert.equal(decide(hookInput("pnpm test && git status"), onMain).block, false);
    assert.equal(decide(hookInput("echo 'git commit'"), onMain).block, false);
  });

  test("should block when input is unreadable and mentions git", () => {
    assert.equal(decide("{not json git commit", onFeature).block, true);
  });

  test("should allow when input is empty or unreadable without git", () => {
    assert.equal(decide("", onMain).block, false);
    assert.equal(decide("{broken", onMain).block, false);
  });

  test("should keep quoted strings as single tokens", () => {
    assert.deepEqual(tokenize('git commit -m "a && b"'), ["git", "commit", "-m", "a && b"]);
  });
});
