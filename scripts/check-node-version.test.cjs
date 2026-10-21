const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { parseMajor, checkNodeVersion } = require("./check-node-version.cjs");

describe("check-node-version", () => {
  test("should parse plain and v-prefixed versions", () => {
    assert.equal(parseMajor("22\n"), 22);
    assert.equal(parseMajor("v20.20.2"), 20);
    assert.equal(parseMajor("lts/*"), null);
  });

  test("should pass when the running major meets .node-version", () => {
    assert.equal(checkNodeVersion({ required: 22, current: "v22.4.0", env: {} }), null);
    assert.equal(checkNodeVersion({ required: 22, current: "v24.18.0", env: {} }), null);
  });

  test("should name the NODE_VERSION override and the dashboard fix when it is set", () => {
    const error = checkNodeVersion({
      required: 22,
      current: "v20.20.2",
      env: { NODE_VERSION: "20", WORKERS_CI: "1" },
    });
    assert.match(error, /Node\.js 22\+ is required/);
    assert.match(error, /NODE_VERSION environment variable is set to "20"/);
    assert.match(error, /Settings → Build → Variables and secrets/);
  });

  test("should point Workers Builds at the dashboard when no override is visible", () => {
    const error = checkNodeVersion({ required: 22, current: "v20.0.0", env: { WORKERS_CI: "1" } });
    assert.match(error, /Workers Builds did not pick up \.node-version/);
  });

  test("should suggest a version manager locally", () => {
    const error = checkNodeVersion({ required: 22, current: "v20.0.0", env: {} });
    assert.match(error, /nvm use/);
  });
});
