const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { needsInstall, resolveTargetTree, run } = require("./ensure-deps-installed.cjs");

describe("ensure-deps-installed", () => {
  /** @type {string} */
  let tree;

  before(() => {
    tree = fs.mkdtempSync(path.join(os.tmpdir(), "ensure-deps-"));
  });

  after(() => {
    fs.rmSync(tree, { recursive: true, force: true });
  });

  /**
   * Fake git: `tree` is a work tree of the project when sameRepo, else of another repo.
   * @param {{sameRepo?: boolean, insideTree?: boolean}} [opts]
   */
  function fakeGit({ sameRepo = true, insideTree = true } = {}) {
    return (args, cwd) => {
      if (!insideTree && cwd === tree) return { status: 128, stdout: "" };
      if (args[1] === "--show-toplevel") return { status: 0, stdout: `${cwd}\n` };
      const common = cwd === tree && !sameRepo ? "/other/.git" : "/project/.git";
      return { status: 0, stdout: `${common}\n` };
    };
  }

  const input = (cwd) =>
    JSON.stringify({ hook_event_name: "SessionStart", source: "startup", cwd });

  test("should report present and not install when node_modules and husky exist", () => {
    let installs = 0;
    const result = run(input(tree), {
      projectDir: "/project",
      runGit: fakeGit(),
      exists: () => true,
      runInstall: () => (installs++, { status: 0 }),
    });
    assert.equal(result, "present");
    assert.equal(installs, 0);
  });

  test("should install in the stdin cwd when dependencies are missing", () => {
    let installedIn = null;
    const result = run(input(tree), {
      projectDir: "/project",
      runGit: fakeGit(),
      exists: () => false,
      runInstall: (cwd) => ((installedIn = cwd), { status: 0 }),
    });
    assert.equal(result, "installed");
    assert.equal(installedIn, tree);
  });

  test("should warn once and still return when the install fails", () => {
    const lines = [];
    const result = run(input(tree), {
      projectDir: "/project",
      runGit: fakeGit(),
      exists: () => false,
      runInstall: () => ({ status: 1 }),
      log: (s) => lines.push(s),
    });
    assert.equal(result, "failed");
    assert.equal(lines.length, 1);
    assert.match(lines[0], /pnpm install --frozen-lockfile failed/);
  });

  test("should skip when cwd belongs to a different repository", () => {
    const result = run(input(tree), {
      projectDir: "/project",
      runGit: fakeGit({ sameRepo: false }),
      exists: () => false,
      runInstall: () => assert.fail("must not install"),
    });
    assert.equal(result, "skipped");
  });

  test("should skip when cwd is relative, missing, or not a work tree", () => {
    const deps = {
      projectDir: "/project",
      runGit: fakeGit({ insideTree: false }),
      exists: () => false,
    };
    assert.equal(run(input("relative/dir"), deps), "skipped");
    assert.equal(run(input(path.join(tree, "nope")), deps), "skipped");
    assert.equal(run(input(tree), deps), "skipped");
  });

  test("should skip when stdin is empty or not JSON", () => {
    const deps = { projectDir: "/project", runGit: fakeGit(), exists: () => false };
    assert.equal(run("", deps), "skipped");
    assert.equal(run("{not json", deps), "skipped");
  });

  test("should need an install when only one of the two markers exists", () => {
    const onlyModules = (p) => p.endsWith(".modules.yaml");
    assert.equal(needsInstall(tree, onlyModules), true);
    assert.equal(
      needsInstall(tree, () => true),
      false
    );
  });

  test("should resolve the work tree root when cwd shares the project's git dir", () => {
    assert.equal(resolveTargetTree(tree, "/project", fakeGit()), tree);
  });
});
