/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // === CIRCULAR DEPENDENCY RULES ===
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies cause runtime issues and make code untestable",
      from: {},
      to: { circular: true },
    },

    // === LAYER VIOLATION RULES ===
    // Aligned with ESLint boundaries/element-types rules

    // Pages cannot be imported by components or routes (downward-only)
    {
      name: "no-pages-in-components",
      severity: "error",
      comment: "Components cannot import from pages - violates downward-only dependency rule",
      from: { path: "^src/components" },
      to: { path: "^src/pages" },
    },
    {
      name: "no-pages-in-features",
      severity: "error",
      comment: "Features cannot import from pages - violates downward-only dependency rule",
      from: { path: "^src/features" },
      to: { path: "^src/pages" },
    },
    {
      name: "no-pages-in-layouts",
      severity: "error",
      comment: "Layouts cannot import from pages - violates downward-only dependency rule",
      from: { path: "^src/layouts" },
      to: { path: "^src/pages" },
    },

    // Routes cannot be imported by components or features
    {
      name: "no-routes-in-components",
      severity: "error",
      comment: "Components cannot import from routes",
      from: { path: "^src/components" },
      to: { path: "^src/routes" },
    },
    {
      name: "no-routes-in-features",
      severity: "error",
      comment: "Features cannot import from routes",
      from: { path: "^src/features" },
      to: { path: "^src/routes" },
    },

    // Hooks cannot import from UI layers (components, features/components, layouts)
    {
      name: "no-components-in-hooks",
      severity: "error",
      comment: "Hooks cannot import from components - hooks provide logic, not UI",
      from: { path: "^src/shared/hooks" },
      to: { path: "^src/components" },
    },
    {
      name: "no-feature-components-in-hooks",
      severity: "error",
      comment: "Hooks cannot import from feature components - hooks orchestrate services, not UI",
      from: { path: "^src/shared/hooks" },
      to: { path: "^src/features/.*/components" },
    },
    {
      name: "no-layouts-in-hooks",
      severity: "error",
      comment: "Hooks cannot import from layouts",
      from: { path: "^src/shared/hooks" },
      to: { path: "^src/layouts" },
    },
    {
      name: "no-pages-in-hooks",
      severity: "error",
      comment: "Hooks cannot import from pages",
      from: { path: "^src/shared/hooks" },
      to: { path: "^src/pages" },
    },

    // Feature hooks follow same rules as shared hooks
    {
      name: "no-components-in-feature-hooks",
      severity: "error",
      comment: "Feature hooks cannot import from components - hooks orchestrate services, not UI",
      from: { path: "^src/features/.*/hooks" },
      to: { path: "^src/components" },
    },
    {
      name: "no-pages-in-feature-hooks",
      severity: "error",
      comment: "Feature hooks cannot import from pages",
      from: { path: "^src/features/.*/hooks" },
      to: { path: "^src/pages" },
    },
    {
      name: "no-routes-in-feature-hooks",
      severity: "error",
      comment: "Feature hooks cannot import from routes",
      from: { path: "^src/features/.*/hooks" },
      to: { path: "^src/routes" },
    },

    // Services cannot import from UI layers or hooks
    {
      name: "no-hooks-in-services",
      severity: "error",
      comment: "Services cannot import from hooks - services are pure business logic",
      from: { path: "^src/(shared|features)/.*/services" },
      to: { path: "^src/(shared|features)/.*/hooks" },
    },
    {
      name: "no-components-in-services",
      severity: "error",
      comment: "Services cannot import from components",
      from: { path: "^src/(shared|features)/.*/services" },
      to: { path: "^src/components" },
    },
    {
      name: "no-feature-components-in-services",
      severity: "error",
      comment: "Services cannot import from feature components",
      from: { path: "^src/(shared|features)/.*/services" },
      to: { path: "^src/features/.*/components" },
    },
    {
      name: "no-layouts-in-services",
      severity: "error",
      comment: "Services cannot import from layouts",
      from: { path: "^src/(shared|features)/.*/services" },
      to: { path: "^src/layouts" },
    },
    {
      name: "no-pages-in-services",
      severity: "error",
      comment: "Services cannot import from pages",
      from: { path: "^src/(shared|features)/.*/services" },
      to: { path: "^src/pages" },
    },

    // Utils can import services (aligned with ESLint rule)
    // Removed: no-services-in-utils (ESLint allows utils → services)
    {
      name: "no-hooks-in-utils",
      severity: "error",
      comment: "Utils cannot use React hooks",
      from: { path: "^src/(shared|features)/.*/utils" },
      to: { path: "^src/(shared|features)/.*/hooks" },
    },
    {
      name: "no-components-in-utils",
      severity: "error",
      comment: "Utils cannot import from components",
      from: { path: "^src/(shared|features)/.*/utils" },
      to: { path: "^src/components" },
    },
    {
      name: "no-feature-components-in-utils",
      severity: "error",
      comment: "Utils cannot import from feature components",
      from: { path: "^src/(shared|features)/.*/utils" },
      to: { path: "^src/features/.*/components" },
    },
    {
      name: "no-layouts-in-utils",
      severity: "error",
      comment: "Utils cannot import from layouts",
      from: { path: "^src/(shared|features)/.*/utils" },
      to: { path: "^src/layouts" },
    },
    {
      name: "no-pages-in-utils",
      severity: "error",
      comment: "Utils cannot import from pages",
      from: { path: "^src/(shared|features)/.*/utils" },
      to: { path: "^src/pages" },
    },

    // Types can only import types (and features per ESLint)
    // Note: Path aliases (@/types) resolve to src/shared/types, which is allowed
    {
      name: "no-non-types-in-types",
      severity: "error",
      comment: "Types can only import other types - no runtime code dependencies",
      from: { path: "^src/(shared|features)/.*/types" },
      to: {
        pathNot: [
          "^src/(shared|features)/.*/types",
          "^src/shared/types", // Allow direct imports from shared/types directory
          "^src/ai-capabilities/types",
          "^src/types",
          "^@/types", // Path alias for src/shared/types
          "\\.d\\.ts$",
        ],
      },
    },

    // Config can only import types (constants are allowed as they're compile-time)
    {
      name: "no-runtime-code-in-config",
      severity: "error",
      comment: "Config can only import types and constants - no runtime code dependencies",
      from: { path: "^src/config" },
      to: {
        pathNot: [
          "^src/(shared|features|ai-capabilities)/.*/types",
          "^src/types",
          "^src/shared/constants",
          "\\.d\\.ts$",
        ],
      },
    },

    // === FEATURE BOUNDARY RULES ===
    {
      name: "no-cross-feature-internals",
      severity: "error",
      comment:
        "Features must consume other features via their public barrel (index.ts/api), not deep-import internals. Forces real bounded-context seams.",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/([^/]+)/(components|hooks|services|store|context|types)/",
        pathNot: "^src/features/$1/",
      },
    },
    {
      name: "no-cross-feature-internals-nested",
      severity: "error",
      comment:
        "Nested features must not deep-import sibling nested feature internals; use public barrels or shared/.",
      from: { path: "^src/features/([^/]+)/([^/]+)/" },
      to: {
        path: "^src/features/([^/]+)/([^/]+)/(components|hooks|services|store|context|types)/",
        pathNot: "^src/features/$1/$2/",
      },
    },

    // === DIRECT SERVICE ACCESS PREVENTION ===
    {
      name: "no-direct-service-in-components",
      severity: "warn",
      comment: "Prefer accessing services through hooks for better testability",
      from: { path: "^src/components" },
      to: { path: "^src/(shared|features)/.*/services" },
    },
    {
      name: "no-direct-service-in-feature-components",
      severity: "warn",
      comment: "Prefer accessing services through hooks for better testability",
      from: { path: "^src/features/.*/components" },
      to: { path: "^src/(shared|features)/.*/services" },
    },

    // === STACK PORTS (replaceability ratchet) ===
    // New vendor imports outside nominated adapters fail. Existing edges are
    // grandfathered in .dependency-cruiser-baseline.json (`pnpm arch:baseline`).
    {
      name: "stack-port-mui",
      severity: "error",
      comment:
        "MUI is a stack secret. New imports from features/pages/layouts must go through src/components/common or src/shared/theme.",
      from: {path: "^src/(features|pages|layouts)/"},
      to: {path: "node_modules/@mui/"},
    },
    {
      name: "stack-port-supabase",
      severity: "error",
      comment:
        "Supabase client is a stack secret. New imports must go through src/shared/services/supabaseService.ts.",
      from: {
        pathNot:
          "(^src/shared/services/supabaseService\\.ts$)|(\\.test\\.[jt]sx?$)",
      },
      to: {path: "node_modules/@supabase/"},
    },
    {
      name: "stack-port-airtable",
      severity: "error",
      comment:
        "Airtable is a stack secret. New imports must go through src/shared/services/airtableService.ts.",
      from: {
        pathNot:
          "(^src/shared/services/airtableService\\.ts$)|(\\.test\\.[jt]sx?$)",
      },
      to: {path: "node_modules/airtable"},
    },

    // === EXTERNAL DEPENDENCY RULES ===
    {
      name: "no-deprecated-packages",
      severity: "warn",
      comment: "Avoid using deprecated npm packages",
      from: {},
      to: { dependencyTypes: ["deprecated"] },
    },
    {
      name: "no-orphan-modules",
      severity: "info",
      comment: "Modules should be imported somewhere",
      from: {
        orphan: true,
        pathNot: ["\\.d\\.ts$", "(^|/)index\\.[jt]sx?$", "\\.test\\.[jt]sx?$"],
      },
      to: {},
    },
  ],

  options: {
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: [
        "dist",
        "build",
        "coverage",
        "\\.test\\.[jt]sx?$",
        "\\.spec\\.[jt]sx?$",
        "__tests__",
        "__mocks__",
        "migrations",
        "src/_reference", // Reference files excluded
      ],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/(@[^/]+/[^/]+|[^/]+)",
      },
      archi: {
        collapsePattern: "^(node_modules|packages|src/shared|src/features)/[^/]+",
        theme: {
          graph: { splines: "ortho" },
          modules: [
            {
              criteria: { source: "^src/pages" },
              attributes: { fillcolor: "#ffcccc" },
            },
            {
              criteria: { source: "^src/routes" },
              attributes: { fillcolor: "#ffe6cc" },
            },
            {
              criteria: { source: "^src/layouts" },
              attributes: { fillcolor: "#ffffcc" },
            },
            {
              criteria: { source: "^src/components" },
              attributes: { fillcolor: "#ccffcc" },
            },
            {
              criteria: { source: "^src/features" },
              attributes: { fillcolor: "#ccffff" },
            },
            {
              criteria: { source: "^src/shared/hooks" },
              attributes: { fillcolor: "#ccccff" },
            },
            {
              criteria: { source: "^src/shared/services" },
              attributes: { fillcolor: "#ffccff" },
            },
            {
              criteria: { source: "^src/shared/utils" },
              attributes: { fillcolor: "#ff99cc" },
            },
            {
              criteria: { source: "^src/ai-capabilities" },
              attributes: { fillcolor: "#cc99ff" },
            },
          ],
        },
      },
    },
    cache: false,
    progress: {type: "none"},
  },
};
