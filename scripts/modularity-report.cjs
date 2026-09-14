#!/usr/bin/env node
/**
 * Prints replaceability tables from dependency-cruiser JSON (no custom walker).
 * Always exits 0. Enforcement lives in `pnpm arch:check`.
 *
 * @relatedFiles
 * - scripts/modularity-report-lib.cjs
 */

const fs = require("fs");
const path = require("path");
const {spawnSync} = require("child_process");

const {buildReport, formatMarkdown} = require("./modularity-report-lib.cjs");

const BASELINE_PATH = path.join("scripts", "modularity-baseline.json");

/**
 * @returns {object}
 */
function runCruise() {
  const result = spawnSync(
    "pnpm exec depcruise --config .dependency-cruiser.cjs --output-type json --metrics src",
    {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      cwd: process.cwd(),
      shell: true,
    },
  );

  if (result.error) {
    throw result.error;
  }

  const stdout = result.stdout || "";
  const jsonStart = stdout.indexOf("{");
  if (jsonStart < 0) {
    const errText = result.stderr || stdout || "depcruise produced no JSON";
    throw new Error(errText.slice(0, 2000));
  }

  return JSON.parse(stdout.slice(jsonStart));
}

/**
 * @returns {object | null}
 */
function loadPrevious() {
  if (!fs.existsSync(BASELINE_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--format=json");
  const writeBaseline = args.includes("--write-baseline");
  const cruiseResult = runCruise();
  const previous = loadPrevious();
  const report = buildReport(cruiseResult, process.cwd(), previous);

  if (writeBaseline) {
    const snapshot = {features: report.features, stack: report.stack};
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  }

  if (asJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(formatMarkdown(report));
  }

  process.exit(0);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

module.exports = {runCruise, loadPrevious, BASELINE_PATH};
