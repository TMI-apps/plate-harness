#!/usr/bin/env node
/**
 * preinstall guard: the running Node.js major must be at least the one in `.node-version`
 * (SSOT for the Node version — local, CI and Cloudflare Workers Builds).
 *
 * Why: Workers Builds lets a `NODE_VERSION` build variable override `.node-version`. A stale
 * dashboard value (e.g. 20) silently builds on the wrong Node and only fails at deploy
 * (wrangler 4 needs Node 22+). This stops the build at install with the fix spelled out.
 */

const fs = require("fs");
const path = require("path");

/**
 * @param {string} raw contents of .node-version (e.g. "22", "v22.4.0")
 * @returns {number | null}
 */
function parseMajor(raw) {
  const match = String(raw).trim().match(/^v?(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * @param {{ required: number, current: string, env: Record<string, string | undefined> }} input
 * @returns {string | null} error message, or null when the version is fine
 */
function checkNodeVersion({ required, current, env }) {
  const currentMajor = parseMajor(current);
  if (currentMajor !== null && currentMajor >= required) return null;

  const lines = [
    `Node.js ${required}+ is required (.node-version), but this is ${current}.`,
  ];
  if (env.NODE_VERSION) {
    lines.push(
      `The NODE_VERSION environment variable is set to "${env.NODE_VERSION}" and overrides .node-version.`,
      "Cloudflare Workers Builds: delete NODE_VERSION in Workers & Pages → <worker> → Settings → Builds → Variables and secrets, on both the Production and the Previews tab (preview builds use the Previews tab), then retry the build.",
      ".node-version is the only place the Node version should be set."
    );
  } else if (env.WORKERS_CI) {
    lines.push(
      "Cloudflare Workers Builds did not pick up .node-version; check Settings → Builds → Variables and secrets (Production and Previews tabs) for a NODE_VERSION override."
    );
  } else {
    lines.push("Switch to the version in .node-version (e.g. `nvm use` / `fnm use`).");
  }
  return lines.join("\n");
}

function main() {
  const file = path.resolve(__dirname, "..", ".node-version");
  const required = parseMajor(fs.readFileSync(file, "utf8"));
  if (required === null) {
    process.stderr.write(`check-node-version: cannot read a version from ${file}\n`);
    process.exit(1);
  }
  const error = checkNodeVersion({ required, current: process.version, env: process.env });
  if (error) {
    process.stderr.write(`\n${error}\n\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseMajor, checkNodeVersion };
