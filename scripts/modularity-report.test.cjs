const {describe, test, before, after} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {spawnSync} = require("child_process");

const {
  longestFeatureKey,
  buildReport,
  formatMarkdown,
} = require("./modularity-report-lib.cjs");

describe("modularity-report-lib", () => {
  /** @type {string} */
  let tmpRoot;

  before(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "modularity-report-"));
    const billingHooks = path.join(
      tmpRoot,
      "src",
      "features",
      "admin",
      "billing",
      "hooks",
    );
    fs.mkdirSync(billingHooks, {recursive: true});
    fs.writeFileSync(path.join(billingHooks, "useBill.ts"), "export {};\n");
    const authHooks = path.join(tmpRoot, "src", "features", "auth", "hooks");
    fs.mkdirSync(authHooks, {recursive: true});
    fs.writeFileSync(path.join(authHooks, "useAuth.ts"), "export {};\n");
  });

  after(() => {
    fs.rmSync(tmpRoot, {recursive: true, force: true});
  });

  test("should attribute a module to admin/billing when that feature root exists", () => {
        const {discoverFeatureRoots} = require("./feature-size-lib.js");
    const roots = discoverFeatureRoots(tmpRoot);
    assert.ok(roots.includes("admin/billing"));
    assert.equal(
      longestFeatureKey(
        "src/features/admin/billing/hooks/useBill.ts",
        roots,
      ),
      "admin/billing",
    );
  });

  test("should count inbound when a page depends on a feature module", () => {
    const cruiseResult = {
      modules: [
        {
          source: "src/pages/tasks/TasksPage.tsx",
          dependencies: [
            {
              module: "@/features/admin/billing/hooks/useBill",
              resolved: "src/features/admin/billing/hooks/useBill.ts",
            },
          ],
        },
        {
          source: "src/features/admin/billing/hooks/useBill.ts",
          dependencies: [],
        },
      ],
    };
    const report = buildReport(cruiseResult, tmpRoot, null);
    const billing = report.features.find((row) => row.key === "admin/billing");
    assert.ok(billing);
    assert.equal(billing.inboundCount, 1);
    assert.equal(billing.wiringCount, 1);
    assert.deepEqual(billing.wiring, ["src/pages/tasks/TasksPage.tsx"]);
  });

  test("should list raw MUI file counts including adapter files when they import @mui", () => {
    const cruiseResult = {
      modules: [
        {
          source: "src/shared/theme/defaultTheme.ts",
          dependencies: [
            {
              module: "@mui/material/styles",
              resolved: "node_modules/@mui/material/styles/index.js",
            },
          ],
        },
        {
          source: "src/features/auth/components/SignInPanel.tsx",
          dependencies: [
            {
              module: "@mui/material",
              resolved: "node_modules/@mui/material/index.js",
            },
          ],
        },
      ],
    };
    const report = buildReport(cruiseResult, tmpRoot, null);
    const mui = report.stack.find((row) => row.id === "MUI");
    assert.ok(mui);
    assert.equal(mui.fileCount, 2);
    assert.ok(mui.files.includes("src/shared/theme/defaultTheme.ts"));
    assert.ok(mui.files.includes("src/features/auth/components/SignInPanel.tsx"));
  });

  test("should not blend feature and stack totals when formatting markdown", () => {
    const cruiseResult = {
      modules: [
        {
          source: "src/features/auth/hooks/useAuth.ts",
          dependencies: [
            {
              module: "@mui/material",
              resolved: "node_modules/@mui/material/index.js",
            },
          ],
        },
      ],
    };
    const report = buildReport(cruiseResult, tmpRoot, null);
    assert.equal(Object.hasOwn(report, "total"), false);
    assert.equal(Object.hasOwn(report, "composite"), false);
    const markdown = formatMarkdown(report);
    assert.match(markdown, /Score A/);
    assert.match(markdown, /Score B/);
    assert.equal(/composite/i.test(markdown), false);
  });

  test("should report an increase in MUI files versus baseline without a composite score", () => {
    const cruiseResult = {
      modules: [
        {
          source: "src/features/auth/components/A.tsx",
          dependencies: [
            {
              module: "@mui/material",
              resolved: "node_modules/@mui/material/index.js",
            },
          ],
        },
        {
          source: "src/features/auth/components/B.tsx",
          dependencies: [
            {
              module: "@mui/material",
              resolved: "node_modules/@mui/material/index.js",
            },
          ],
        },
      ],
    };
    const previous = {
      features: [],
      stack: [{id: "MUI", fileCount: 1}],
    };
    const report = buildReport(cruiseResult, tmpRoot, previous);
    const muiDelta = report.delta.stack.find((row) => row.id === "MUI");
    assert.ok(muiDelta);
    assert.equal(muiDelta.fileCount, 2);
    assert.equal(muiDelta.change, 1);
  });

  test("should score a vendor only when the cruise graph lists that package", () => {
    const cruiseResult = {
      modules: [
        {
          source: "src/features/auth/hooks/useAuth.ts",
          dependencies: [
            {
              module: "stripe",
              resolved: "node_modules/stripe/index.js",
            },
          ],
        },
      ],
    };
    const report = buildReport(cruiseResult, tmpRoot, null);
    const mui = report.stack.find((row) => row.id === "MUI");
    assert.equal(mui.fileCount, 0);
    const stripe = report.stack.find((row) => row.id === "stripe");
    assert.equal(stripe, undefined);
  });
});

describe("modularity-report CLI", () => {
  test("should exit 0 when stack file counts are high", () => {
    const libPath = require.resolve("./modularity-report-lib.cjs");
    const source = `
      const {buildReport} = require(${JSON.stringify(libPath)});
      const report = buildReport({
        modules: Array.from({length: 20}, (_, i) => ({
          source: "src/features/auth/c" + i + ".tsx",
          dependencies: [{
            module: "@mui/material",
            resolved: "node_modules/@mui/material/index.js",
          }],
        })),
      }, ${JSON.stringify(process.cwd())}, null);
      const mui = report.stack.find((row) => row.id === "MUI");
      if (!mui || mui.fileCount < 16) {
        throw new Error("expected high MUI count");
      }
      process.exit(0);
    `;
    const result = spawnSync(process.execPath, ["-e", source], {encoding: "utf8"});
    assert.equal(result.status, 0, result.stderr);
  });
});
