const { describe, test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { validateGitWorkflow, runCli } = require("./validate-git-workflow.cjs");

describe("validate-git-workflow", () => {
  /** @type {string} */
  let tmpRoot;
  /** @type {string} */
  let configDir;

  before(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "git-workflow-"));
    configDir = path.join(tmpRoot, "src", "config");
    fs.mkdirSync(configDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  /**
   * @param {string | null} contents
   */
  function writeConfig(contents) {
    const configPath = path.join(configDir, "git-workflow.json");
    if (contents === null) {
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
      return;
    }
    fs.writeFileSync(configPath, contents, "utf8");
  }

  test("should fail when config file is missing", () => {
    writeConfig(null);
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, false);
    assert.match(result.error, /Missing/);
  });

  test("should fail when JSON is invalid", () => {
    writeConfig("{not json");
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, false);
    assert.match(result.error, /Invalid JSON/);
  });

  test("should fail when mode key is missing", () => {
    writeConfig("{}");
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, false);
    assert.match(result.error, /Missing required key "mode"/);
  });

  test("should fail when mode is not allowed", () => {
    writeConfig(JSON.stringify({ mode: "model-z" }));
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, false);
    assert.match(result.error, /Invalid mode/);
  });

  test("should pass for model-a", () => {
    writeConfig(JSON.stringify({ mode: "model-a" }));
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, true);
    assert.equal(result.mode, "model-a");
  });

  test("should pass for model-b", () => {
    writeConfig(JSON.stringify({ mode: "model-b" }));
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, true);
    assert.equal(result.mode, "model-b");
  });

  test("should pass for model-c", () => {
    writeConfig(JSON.stringify({ mode: "model-c" }));
    const result = validateGitWorkflow(tmpRoot);
    assert.equal(result.ok, true);
    assert.equal(result.mode, "model-c");
  });

  /**
   * @param {string[]} argv
   */
  function runWithCapture(argv) {
    let out = "";
    let err = "";
    const code = runCli(argv, {
      rootDir: tmpRoot,
      stdout: (s) => (out += s),
      stderr: (s) => (err += s),
    });
    return { code, out, err };
  }

  test("should print only the mode when --print-mode and config is valid", () => {
    writeConfig(JSON.stringify({ mode: "model-c" }));
    const { code, out, err } = runWithCapture(["--print-mode"]);
    assert.equal(code, 0);
    assert.equal(out, "model-c\n");
    assert.equal(err, "");
  });

  test("should leave stdout empty and exit 1 when --print-mode and mode is invalid", () => {
    writeConfig(JSON.stringify({ mode: "model-z" }));
    const { code, out, err } = runWithCapture(["--print-mode"]);
    assert.equal(code, 1);
    assert.equal(out, "");
    assert.match(err, /Invalid mode/);
  });

  test("should leave stdout empty and exit 1 when --print-mode and config is missing", () => {
    writeConfig(null);
    const { code, out } = runWithCapture(["--print-mode"]);
    assert.equal(code, 1);
    assert.equal(out, "");
  });

  test("should print the repo mode when the script runs with --print-mode", () => {
    const script = path.join(__dirname, "validate-git-workflow.cjs");
    const run = spawnSync(process.execPath, [script, "--print-mode"], { encoding: "utf8" });
    const expected = validateGitWorkflow();
    assert.equal(run.status, expected.ok ? 0 : 1);
    assert.equal(run.stdout, expected.ok ? `${expected.mode}\n` : "");
  });
});
