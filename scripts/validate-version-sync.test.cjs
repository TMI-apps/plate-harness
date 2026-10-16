const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { getLatestChangelogVersion } = require("./validate-version-sync.js");

// release-please node heading shape: version in brackets, compare link, date in parentheses.
// Source: googleapis/release-please CHANGELOG.md (written by release-please itself), checked 2026-10-16:
// "## [17.11.2](https://github.com/googleapis/release-please/compare/v17.11.1...v17.11.2) (2026-08-24)".
const RELEASE_PLEASE_HEADING =
  "## [0.40.0](https://github.com/TMI-apps/plate-harness/compare/v0.39.0...v0.40.0) (2026-10-20)";

describe("validate-version-sync", () => {
  test("should return the version when the heading is a finish-style release", () => {
    const content = "# Changelog\n\n## [0.39.0] - 2026-08-11\n\n### Added\n";
    assert.equal(getLatestChangelogVersion(content), "0.39.0");
  });

  test("should return the version when the heading is a release-please release", () => {
    const content = `# Changelog\n\n${RELEASE_PLEASE_HEADING}\n\n### Features\n`;
    assert.equal(getLatestChangelogVersion(content), "0.40.0");
  });

  test("should skip [Unreleased] when it comes before the first release", () => {
    const content = "# Changelog\n\n## [Unreleased]\n\n- wip\n\n## [0.39.0] - 2026-08-11\n";
    assert.equal(getLatestChangelogVersion(content), "0.39.0");
  });

  test("should return the newest release when release-please inserts above an older finish heading", () => {
    const content = `# Changelog\n\n${RELEASE_PLEASE_HEADING}\n\n## [0.39.0] - 2026-08-11\n`;
    assert.equal(getLatestChangelogVersion(content), "0.40.0");
  });

  test("should return null when there is no release heading", () => {
    assert.equal(getLatestChangelogVersion("# Changelog\n\n## [Unreleased]\n"), null);
  });
});
