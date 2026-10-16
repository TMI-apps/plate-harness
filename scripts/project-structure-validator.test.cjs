const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { createGitIgnoredChecker } = require("./project-structure-validator.js");

const ROOT = path.resolve("/repo");
const at = (...parts) => path.join(ROOT, ...parts);

/**
 * Fake `git ls-files -z --others --ignored ... --directory` output.
 * @param {string[]} entries
 */
const gitListing =
  (entries, status = 0) =>
  () => ({ status, stdout: entries.map((e) => `${e}\0`).join("") });

describe("project-structure-validator createGitIgnoredChecker", () => {
  test("should skip an ignored untracked file", () => {
    const isIgnored = createGitIgnoredChecker(ROOT, gitListing([".claude/scheduled_tasks.lock"]));
    assert.equal(isIgnored(at(".claude", "scheduled_tasks.lock")), true);
  });

  test("should skip files inside an ignored directory", () => {
    const isIgnored = createGitIgnoredChecker(ROOT, gitListing([".claude/worktrees/"]));
    assert.equal(isIgnored(at(".claude", "worktrees")), true);
    assert.equal(isIgnored(at(".claude", "worktrees", "s1", "src", "App.tsx")), true);
  });

  test("should still validate tracked or non-ignored paths", () => {
    const isIgnored = createGitIgnoredChecker(ROOT, gitListing([".claude/worktrees/"]));
    assert.equal(isIgnored(at(".claude", "settings.json")), false);
    assert.equal(isIgnored(at("src", "App.tsx")), false);
  });

  test("should validate a force-added file even when it matches .gitignore", () => {
    // git lists only untracked ignored paths; a tracked (force-added) file never appears.
    const isIgnored = createGitIgnoredChecker(ROOT, gitListing(["logs/"]));
    assert.equal(isIgnored(at("debug.log")), false);
  });

  test("should fall back to nothing ignored when git fails", () => {
    const isIgnored = createGitIgnoredChecker(ROOT, gitListing([".claude/worktrees/"], 128));
    assert.equal(isIgnored(at(".claude", "worktrees", "x")), false);
  });

  test("should pass only tracked .gitignore rules to git (no personal excludes)", () => {
    let seenArgs = [];
    createGitIgnoredChecker(ROOT, (args) => ((seenArgs = args), { status: 0, stdout: "" }));
    assert.ok(seenArgs.includes("--exclude-per-directory=.gitignore"));
    assert.ok(!seenArgs.includes("--exclude-standard"));
  });
});
