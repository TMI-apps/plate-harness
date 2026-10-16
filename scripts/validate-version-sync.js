#!/usr/bin/env node
/**
 * Validates that package.json version matches the latest release entry in CHANGELOG.md.
 * Used by CI to enforce version/changelog consistency. Works for both version sources
 * (git-workflow/RULE.mdc § Mode behavior table): `finish` headings (`## [x.y.z] - date`)
 * and release-please headings (`## [x.y.z](compare-url) (date)`). `## [Unreleased]` is skipped.
 *
 * Exit 0 if consistent, 1 if mismatch.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkgPath = path.join(root, "package.json");
const changelogPath = path.join(root, "CHANGELOG.md");

/**
 * @param {string} content CHANGELOG.md text
 * @returns {string | null} first released version heading, or null when there is none
 */
function getLatestChangelogVersion(content) {
  const match = content.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  return match ? match[1] : null;
}

function main() {
  const pkgVersion = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
  const changelogVersion = getLatestChangelogVersion(fs.readFileSync(changelogPath, "utf8"));

  if (!changelogVersion) {
    console.error("validate-version-sync: No version block found in CHANGELOG.md");
    process.exit(1);
  }

  if (pkgVersion !== changelogVersion) {
    console.error(
      `validate-version-sync: Version mismatch - package.json has "${pkgVersion}" but CHANGELOG.md latest is "[${changelogVersion}]"`
    );
    process.exit(1);
  }

  console.log(`validate-version-sync: OK (${pkgVersion})`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { getLatestChangelogVersion };
