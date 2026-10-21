#!/usr/bin/env node
/**
 * Staged-path pre-commit test executor.
 * SSOT: scripts/change-classify.cjs; documentation/DOC_AGENT_WORKFLOW_LAYERS.md
 */

const {spawnSync} = require('child_process');
const fs = require('fs');
const {
  getStagedFiles,
  classifyChanges,
  classifyTestRun,
  getFullSuiteSrcThreshold,
} = require('./change-classify.cjs');

const isWin = process.platform === 'win32';

const NO_TEST_FILES_RE = /No test files found/i;

/**
 * @param {string[]} paths
 * @returns {string[]}
 */
function filterExistingPaths(paths) {
  return paths.filter((filePath) => fs.existsSync(filePath));
}

/**
 * @param {{ mode: string, reason: string, relatedPaths?: string[] }} plan
 * @returns {{ mode: string, reason: string, relatedPaths?: string[] }}
 */
function resolveRunPlan(plan) {
  if (plan.mode !== 'related' || !plan.relatedPaths) {
    return plan;
  }
  if (plan.relatedPaths.length > getFullSuiteSrcThreshold()) {
    return {mode: 'full', reason: 'related path count exceeds threshold'};
  }
  const existing = filterExistingPaths(plan.relatedPaths);
  if (existing.length === 0) {
    return {mode: 'full', reason: 'no related paths on disk'};
  }
  return {...plan, relatedPaths: existing};
}

/**
 * @param {string[]} vitestPaths
 * @returns {string[]}
 */
function buildVitestArgv(vitestPaths) {
  return ['exec', 'vitest', 'run', 'related', ...vitestPaths];
}

/**
 * @param {string} line
 */
function logMode(line) {
  process.stdout.write(`${line}\n`);
}

/**
 * @typedef {{
 *   spawnSync?: typeof spawnSync,
 *   runPnpm?: (args: string[], cwd?: string) => number,
 *   runVitestRelated?: (vitestPaths: string[]) => { status: number, output: string },
 *   runFullSuite?: () => number,
 * }} TestRunners
 */

/**
 * @param {TestRunners} [overrides]
 * @returns {Required<TestRunners>}
 */
function createRunners(overrides = {}) {
  const spawn = overrides.spawnSync ?? spawnSync;

  const runPnpm =
    overrides.runPnpm ??
    ((args, cwd = process.cwd()) => {
      const result = spawn('pnpm', args, {
        cwd,
        shell: isWin,
        stdio: 'inherit',
        env: process.env,
      });
      if (result.error) {
        throw result.error;
      }
      return result.status ?? 1;
    });

  const runVitestRelated =
    overrides.runVitestRelated ??
    ((vitestPaths) => {
      const result = spawn('pnpm', buildVitestArgv(vitestPaths), {
        shell: isWin,
        encoding: 'utf-8',
        env: process.env,
      });
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
      if (result.stdout) {
        process.stdout.write(result.stdout);
      }
      if (result.stderr) {
        process.stderr.write(result.stderr);
      }
      if (result.error) {
        throw result.error;
      }
      return {status: result.status ?? 1, output};
    });

  const runFullSuite =
    overrides.runFullSuite ??
    (() => {
      const classifyStatus = runPnpm(['test:classify']);
      if (classifyStatus !== 0) {
        return classifyStatus;
      }
      return runPnpm(['test:run']);
    });

  return {spawnSync: spawn, runPnpm, runVitestRelated, runFullSuite};
}

const defaultRunners = createRunners();

/**
 * @param {TestRunners} [overrides]
 * @returns {number}
 */
function runFullSuite(overrides = {}) {
  return createRunners(overrides).runFullSuite();
}

/**
 * @param {{ mode: string, reason: string, relatedPaths?: string[] }} plan
 * @param {{ dryRun: boolean, runners?: TestRunners }} options
 * @returns {number}
 */
function executePlan(plan, options) {
  const runners = createRunners(options.runners ?? {});
  logMode(`pre-commit: test mode=${plan.mode} (${plan.reason})`);
  if (plan.mode === 'related' && plan.relatedPaths?.length) {
    logMode(`pre-commit: related paths: ${plan.relatedPaths.join(', ')}`);
  }
  if (options.dryRun) {
    return 0;
  }

  if (plan.mode === 'skip-vitest') {
    return 0;
  }
  if (plan.mode === 'node-scripts-only') {
    return runners.runPnpm(['test:classify']);
  }
  if (plan.mode === 'full') {
    return runners.runFullSuite();
  }
  if (plan.mode === 'related' && plan.relatedPaths?.length) {
    const related = runners.runVitestRelated(plan.relatedPaths);
    // Vitest 4 exits 1 when no related tests exist, so check this before the status.
    if (NO_TEST_FILES_RE.test(related.output)) {
      logMode('pre-commit: no related tests found — falling back to full suite');
      return runners.runFullSuite();
    }
    return related.status;
  }
  return runners.runFullSuite();
}

/**
 * @param {{ dryRun?: boolean, staged?: string[] }} [options]
 * @returns {number}
 */
function runStagedTests(options = {}) {
  const dryRun = options.dryRun ?? process.argv.includes('--dry-run');
  const staged = options.staged ?? getStagedFiles();
  const light = classifyChanges(staged);
  if (light.light && light.kind) {
    logMode(
      `pre-commit: test mode=skip-vitest (light path: ${light.kind})`,
    );
    return 0;
  }

  const initial = classifyTestRun(staged);
  const plan = resolveRunPlan(initial);
  return executePlan(plan, {dryRun});
}

if (require.main === module) {
  const code = runStagedTests();
  process.exit(code);
}

module.exports = {
  NO_TEST_FILES_RE,
  filterExistingPaths,
  resolveRunPlan,
  buildVitestArgv,
  createRunners,
  executePlan,
  runStagedTests,
  runFullSuite,
  defaultRunners,
};
