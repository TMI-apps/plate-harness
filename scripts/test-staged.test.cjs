const {describe, test} = require('node:test');
const assert = require('node:assert/strict');
const {getFullSuiteSrcThreshold} = require('./change-classify.cjs');
const {
  buildVitestArgv,
  resolveRunPlan,
  executePlan,
  runStagedTests,
  runFullSuite,
  NO_TEST_FILES_RE,
} = require('./test-staged.cjs');

describe('test-staged executor', () => {
  describe('buildVitestArgv', () => {
    test('should include related mode and staged paths', () => {
      assert.deepEqual(buildVitestArgv(['src/a.ts', 'src/b.ts']), [
        'exec',
        'vitest',
        'run',
        'related',
        'src/a.ts',
        'src/b.ts',
      ]);
    });
  });

  describe('resolveRunPlan', () => {
    test('should upgrade to full when no related paths exist on disk', () => {
      assert.deepEqual(
        resolveRunPlan({
          mode: 'related',
          reason: 'staged src files',
          relatedPaths: ['src/does-not-exist.ts'],
        }),
        {mode: 'full', reason: 'no related paths on disk'},
      );
    });

    test('should upgrade to full when related path count exceeds threshold', () => {
      const relatedPaths = Array.from(
        {length: getFullSuiteSrcThreshold() + 1},
        (_, i) => `src/features/example/f${i}.ts`,
      );
      assert.deepEqual(
        resolveRunPlan({
          mode: 'related',
          reason: 'staged src files',
          relatedPaths,
        }),
        {mode: 'full', reason: 'related path count exceeds threshold'},
      );
    });
  });

  describe('executePlan', () => {
    test('should not run tests in dry-run mode', () => {
      let pnpmCalls = 0;
      const code = executePlan(
        {
          mode: 'related',
          reason: 'staged src files',
          relatedPaths: ['src/a.ts'],
        },
        {
          dryRun: true,
          runners: {
            runPnpm: () => {
              pnpmCalls += 1;
              return 0;
            },
          },
        },
      );
      assert.equal(code, 0);
      assert.equal(pnpmCalls, 0);
    });

    test('should exit 0 for skip-vitest mode', () => {
      assert.equal(
        executePlan({mode: 'skip-vitest', reason: 'no app test surface'}, {
          dryRun: false,
          runners: {
            runPnpm: () => {
              throw new Error('should not run pnpm');
            },
          },
        }),
        0,
      );
    });

    test('should run test:classify only for node-scripts-only mode', () => {
      const calls = [];
      const code = executePlan(
        {mode: 'node-scripts-only', reason: 'scripts only'},
        {
          dryRun: false,
          runners: {
            runPnpm: (args) => {
              calls.push(args);
              return 0;
            },
          },
        },
      );
      assert.equal(code, 0);
      assert.deepEqual(calls, [['test:classify']]);
    });

    test('should run test:classify before test:run in full mode', () => {
      const order = [];
      const code = executePlan(
        {mode: 'full', reason: 'test-infra file'},
        {
          dryRun: false,
          runners: {
            runPnpm: (args) => {
              order.push(args[0]);
              return 0;
            },
          },
        },
      );
      assert.equal(code, 0);
      assert.deepEqual(order, ['test:classify', 'test:run']);
    });

    test('should fall back to full suite when related exits 1 with no test files', () => {
      let fullCalls = 0;
      const code = executePlan(
        {
          mode: 'related',
          reason: 'staged src files',
          relatedPaths: ['src/shared/utils/userUtils.ts'],
        },
        {
          dryRun: false,
          runners: {
            runVitestRelated: () => ({
              status: 1,
              output: 'No test files found, exiting with code 1',
            }),
            runFullSuite: () => {
              fullCalls += 1;
              return 0;
            },
          },
        },
      );
      assert.equal(code, 0);
      assert.equal(fullCalls, 1);
    });

    test('should fall back to full suite when related finds no test files', () => {
      let fullCalls = 0;
      const code = executePlan(
        {
          mode: 'related',
          reason: 'staged src files',
          relatedPaths: ['src/features/auth/services/authService.ts'],
        },
        {
          dryRun: false,
          runners: {
            runVitestRelated: () => ({
              status: 0,
              output: 'No test files found, exiting with code 0',
            }),
            runFullSuite: () => {
              fullCalls += 1;
              return 0;
            },
          },
        },
      );
      assert.equal(code, 0);
      assert.equal(fullCalls, 1);
    });
  });

  describe('runFullSuite', () => {
    test('should run test:classify before test:run', () => {
      const order = [];
      const code = runFullSuite({
        runPnpm: (args) => {
          order.push(args[0]);
          return 0;
        },
      });
      assert.equal(code, 0);
      assert.deepEqual(order, ['test:classify', 'test:run']);
    });

    test('should stop when test:classify fails', () => {
      const order = [];
      const code = runFullSuite({
        runPnpm: (args) => {
          order.push(args[0]);
          return args[0] === 'test:classify' ? 1 : 0;
        },
      });
      assert.equal(code, 1);
      assert.deepEqual(order, ['test:classify']);
    });
  });

  describe('runStagedTests', () => {
    test('should skip vitest on light path', () => {
      const code = runStagedTests({
        dryRun: true,
        staged: ['CHANGELOG.md'],
      });
      assert.equal(code, 0);
    });

    test('should classify related src files in dry-run', () => {
      const code = runStagedTests({
        dryRun: true,
        staged: ['src/features/auth/services/authService.ts'],
      });
      assert.equal(code, 0);
    });
  });

  describe('NO_TEST_FILES_RE', () => {
    test('should match vitest no-test-files message', () => {
      assert.match(
        'No test files found, exiting with code 0',
        NO_TEST_FILES_RE,
      );
    });
  });
});
