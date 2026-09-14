/**
 * Format a dependency-cruiser JSON result into replaceability tables.
 * Does not parse TypeScript. Does not blend feature and stack totals.
 *
 * @relatedFiles
 * - scripts/modularity-report.cjs
 * - scripts/feature-size-lib.js
 */

const {discoverFeatureRoots} = require("./feature-size-lib.js");

const TEST_FILE = /\.test\.[jt]sx?$/;
const WIRING_PREFIXES = ["src/pages/", "src/layouts/", "src/routes/"];

const STACK_SLOTS = [
  {id: "MUI", test: (spec, resolved) => matchesHay(spec, resolved, /@mui\//)},
  {
    id: "Supabase",
    test: (spec, resolved) => matchesHay(spec, resolved, /@supabase\//),
  },
  {
    id: "Airtable",
    test: (spec, resolved) =>
      spec === "airtable" || /node_modules\/airtable(?:\/|$)/.test(resolved),
  },
];

/**
 * @param {string} spec
 * @param {string} resolved
 * @param {RegExp} re
 * @returns {boolean}
 */
function matchesHay(spec, resolved, re) {
  return re.test(spec) || re.test(resolved);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

/**
 * @param {string} filePath
 * @param {string[]} featureRoots
 * @returns {string | null}
 */
function longestFeatureKey(filePath, featureRoots) {
  const normalized = normalizePath(filePath);
  if (!normalized.startsWith("src/features/")) {
    return null;
  }
  const rest = normalized.slice("src/features/".length);
  const sorted = [...featureRoots].sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    if (rest === key || rest.startsWith(`${key}/`)) {
      return key;
    }
  }
  return null;
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isSrcModule(filePath) {
  const normalized = normalizePath(filePath);
  return normalized.startsWith("src/") && !TEST_FILE.test(normalized);
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isWiring(filePath) {
  const normalized = normalizePath(filePath);
  return WIRING_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/**
 * @param {number} count
 * @returns {"low" | "medium" | "high" | "none"}
 */
function busyworkBand(count) {
  if (count <= 0) {
    return "none";
  }
  if (count <= 3) {
    return "low";
  }
  if (count <= 15) {
    return "medium";
  }
  return "high";
}

/**
 * @param {{ module?: string, resolved?: string, path?: string }} dep
 * @returns {string[]}
 */
function stackSlotsForDep(dep) {
  const spec = String(dep.module || dep.path || "");
  const resolved = normalizePath(dep.resolved || dep.module || "");
  return STACK_SLOTS.filter((slot) => slot.test(spec, resolved)).map(
    (slot) => slot.id,
  );
}

/**
 * @param {object} cruiseResult
 * @param {string} [cwd]
 * @param {object | null} [previous]
 * @returns {object}
 */
function buildReport(cruiseResult, cwd = process.cwd(), previous = null) {
  const featureRoots = discoverFeatureRoots(cwd);
  const modules = Array.isArray(cruiseResult && cruiseResult.modules)
    ? cruiseResult.modules
    : [];

  /** @type {Record<string, { inbound: Set<string>, wiring: Set<string>, outboundFeatures: Set<string>, outboundStack: Set<string> }>} */
  const perFeature = {};
  for (const key of featureRoots) {
    perFeature[key] = {
      inbound: new Set(),
      wiring: new Set(),
      outboundFeatures: new Set(),
      outboundStack: new Set(),
    };
  }

  /** @type {Record<string, Set<string>>} */
  const stackFiles = {};
  for (const slot of STACK_SLOTS) {
    stackFiles[slot.id] = new Set();
  }

  for (const mod of modules) {
    const source = normalizePath(mod.source);
    if (!isSrcModule(source)) {
      continue;
    }
    const sourceFeature = longestFeatureKey(source, featureRoots);
    const deps = Array.isArray(mod.dependencies) ? mod.dependencies : [];

    for (const dep of deps) {
      const target = normalizePath(dep.resolved || dep.module || "");
      const slots = stackSlotsForDep(dep);
      for (const slot of slots) {
        stackFiles[slot].add(source);
        if (sourceFeature && perFeature[sourceFeature]) {
          perFeature[sourceFeature].outboundStack.add(slot);
        }
      }

      const targetFeature = longestFeatureKey(target, featureRoots);
      if (targetFeature && perFeature[targetFeature] && sourceFeature !== targetFeature) {
        perFeature[targetFeature].inbound.add(source);
        if (isWiring(source)) {
          perFeature[targetFeature].wiring.add(source);
        }
        if (sourceFeature && perFeature[sourceFeature]) {
          perFeature[sourceFeature].outboundFeatures.add(targetFeature);
        }
      }
    }
  }

  const features = featureRoots.map((key) => {
    const row = perFeature[key];
    const inbound = [...row.inbound].sort();
    const wiring = [...row.wiring].sort();
    return {
      key,
      inboundCount: inbound.length,
      wiringCount: wiring.length,
      inbound,
      wiring,
      outboundFeatures: [...row.outboundFeatures].sort(),
      outboundStack: [...row.outboundStack].sort(),
    };
  });

  const stack = STACK_SLOTS.map((slot) => {
    const files = [...stackFiles[slot.id]].sort();
    return {
      id: slot.id,
      fileCount: files.length,
      busywork: busyworkBand(files.length),
      files,
    };
  });

  const delta = previous ? computeDelta(features, stack, previous) : null;

  return {
    features,
    stack,
    delta,
    notes: [
      "Vite is not scored from the graph; import.meta.env is app-wide and not gated.",
      "Stack file counts are raw (files that know the secret). Gates grandfather existing edges.",
    ],
  };
}

/**
 * @param {object[]} features
 * @param {object[]} stack
 * @param {object} previous
 * @returns {object}
 */
function computeDelta(features, stack, previous) {
  /** @type {object[]} */
  const featureDelta = [];
  const prevFeatures = Array.isArray(previous.features) ? previous.features : [];
  const prevByKey = new Map(prevFeatures.map((row) => [row.key, row]));

  for (const row of features) {
    const before = prevByKey.get(row.key);
    if (!before) {
      featureDelta.push({key: row.key, inboundCount: row.inboundCount, change: "new"});
      continue;
    }
    const diff = row.inboundCount - Number(before.inboundCount || 0);
    if (diff !== 0) {
      featureDelta.push({key: row.key, inboundCount: row.inboundCount, change: diff});
    }
  }

  /** @type {object[]} */
  const stackDelta = [];
  const prevStack = Array.isArray(previous.stack) ? previous.stack : [];
  const prevStackById = new Map(prevStack.map((row) => [row.id, row]));
  for (const row of stack) {
    const before = prevStackById.get(row.id);
    const prevCount = before ? Number(before.fileCount || 0) : 0;
    const diff = row.fileCount - prevCount;
    if (!before || diff !== 0) {
      stackDelta.push({
        id: row.id,
        fileCount: row.fileCount,
        change: before ? diff : "new",
      });
    }
  }

  return {features: featureDelta, stack: stackDelta};
}

/**
 * @param {object} report
 * @returns {string}
 */
function formatMarkdown(report) {
  const lines = [
    "# Replaceability report",
    "",
    "## Score A — product features",
    "",
    "| Feature | Inbound | Wiring | Outbound features | Outbound stack |",
    "|---------|---------|--------|-------------------|----------------|",
  ];

  for (const row of report.features) {
    lines.push(
      `| ${row.key} | ${row.inboundCount} | ${row.wiringCount} | ${row.outboundFeatures.join(", ") || "—"} | ${row.outboundStack.join(", ") || "—"} |`,
    );
  }

  lines.push(
    "",
    "## Score B — stack slots",
    "",
    "| Slot | Files that know the secret | Busywork |",
    "|------|----------------------------|----------|",
  );

  for (const row of report.stack) {
    lines.push(`| ${row.id} | ${row.fileCount} | ${row.busywork} |`);
  }

  if (report.delta) {
    lines.push("", "## Delta vs informational baseline", "");
    if (report.delta.features.length === 0 && report.delta.stack.length === 0) {
      lines.push("No inbound or stack-count changes.");
    } else {
      for (const row of report.delta.features) {
        lines.push(`- Feature \`${row.key}\`: inbound ${row.inboundCount} (${row.change})`);
      }
      for (const row of report.delta.stack) {
        lines.push(`- Stack \`${row.id}\`: ${row.fileCount} files (${row.change})`);
      }
    }
  }

  lines.push("", "## Notes", "");
  for (const note of report.notes) {
    lines.push(`- ${note}`);
  }
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  WIRING_PREFIXES,
  STACK_SLOTS,
  longestFeatureKey,
  buildReport,
  formatMarkdown,
  busyworkBand,
  computeDelta,
};
