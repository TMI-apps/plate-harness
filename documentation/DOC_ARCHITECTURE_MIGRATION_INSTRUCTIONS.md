# Architecture Enforcement Migration Instructions

## Purpose
This document provides step-by-step instructions for copying the full architectural restrictiveness system from this repository to another repository on the same machine.

## Prerequisites
- Both repositories are on the same machine (replace `[PROJECT_ROOT]` with your base path, e.g. `C:\Users\you\Documents\` or `/home/you/projects/`)
- Source repository: this harness (`plate-harness`)
- Target repository: `[TARGET_REPO_NAME]` (to be specified)
- Both repositories use Node.js/pnpm
- Target repository has TypeScript configured

---

## Step 1: Identify Target Repository

**Action:** Determine the target repository name and confirm its location.

**Expected location:** `[PROJECT_ROOT][TARGET_REPO_NAME]/`

**Verification:**
- Confirm the target repository exists
- Confirm it has a `package.json` file
- Confirm it has a `src/` directory (or equivalent source directory)

---

## Step 2: Copy Core Configuration Files

Copy these files from source to target repository:

### 2.1 ESLint Configuration
**Source:** `[PROJECT_ROOT]plate-harness/eslint.config.js`  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/eslint.config.js`

**Note:** This harness uses ESLint flat config (`eslint.config.js`). If target repo uses legacy `.eslintrc.*`, migrate to flat config or merge rules accordingly.

### 2.2 Project Structure Configuration
**Source:** `[PROJECT_ROOT]plate-harness/projectStructure.config.cjs`  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/projectStructure.config.cjs`

**Action Required:** This file MUST be customized for the target repository's folder structure (see Step 4).

### 2.3 Dependency Cruiser Configuration
**Source:** `[PROJECT_ROOT]plate-harness/.dependency-cruiser.cjs`  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/.dependency-cruiser.cjs`

**Action Required:** Update path patterns to match target repository structure (see Step 5).

### 2.4 TypeScript Configuration (Update Existing)
**Source:** `[PROJECT_ROOT]plate-harness/tsconfig.json`  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/tsconfig.json`

**Action Required:** Merge path aliases into existing `tsconfig.json` (see Step 6).

---

## Step 3: Install Required Dependencies

**Action:** Add these dev dependencies to the target repository's `package.json`:

```json
{
  "devDependencies": {
    "eslint-plugin-boundaries": "^5.3.1",
    "eslint-plugin-project-structure": "^3.14.1",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-unused-imports": "^4.3.0",
    "eslint-import-resolver-typescript": "^3.6.1",
    "dependency-cruiser": "^17.3.6"
  }
}
```

**Command:**
```powershell
cd [PROJECT_ROOT][TARGET_REPO_NAME]
pnpm add -D eslint-plugin-boundaries eslint-plugin-import eslint-plugin-unused-imports eslint-import-resolver-typescript dependency-cruiser
```

**Note:** If using npm or yarn, adjust the command accordingly.

---

## Step 4: Customize Project Structure Configuration

**File:** `projectStructure.config.cjs`

**Action:** Update the `structure` array to match the target repository's actual folder structure.

**Process:**
1. Examine the target repository's folder structure
2. Map each folder to the whitelist structure
3. Update `projectStructure.config.js` to include:
   - All root-level folders (e.g., `src/`, `public/`, `documentation/`)
   - All subfolders within `src/` (e.g., `pages/`, `components/`, `shared/`)
   - File naming patterns per folder (e.g., `*.tsx`, `*.ts`, `index.ts`)
   - Any project-specific folders

**Example Structure:**
```javascript
module.exports = {
  structure: [
    {
      name: "src",
      children: [
        {
          name: "pages",
          children: [
            { name: "*.tsx" },
            { name: "index.ts" }
          ]
        },
        // ... add all folders in src/
      ]
    },
    // ... add root-level folders
  ]
};
```

**Important:** 
- Any folder NOT in this whitelist will trigger ESLint errors
- Start with a minimal whitelist and expand as needed
- Use wildcards (`*`) for dynamic folder names

---

## Step 5: Customize Dependency Cruiser Configuration

**File:** `.dependency-cruiser.cjs`

**Action:** Update path patterns to match target repository structure.

**Key Updates:**
1. **Layer Path Patterns:** Update `from` and `to` path patterns:
   ```javascript
   // Example: If target repo uses src/app/pages instead of src/pages
   from: { path: "^src/app/pages" },  // Update this
   to: { path: "^src/app/components" }  // Update this
   ```

2. **Exclude Patterns:** Update `exclude.path` array if target repo has different build/test folders:
   ```javascript
   exclude: {
     path: [
       "node_modules",
       "dist",
       "build",
       "coverage",
       "\\.test\\.[jt]sx?$",
       // ... add target-specific exclusions
     ]
   }
   ```

3. **Visual Theme:** Update `archi.modules` criteria if folder structure differs:
   ```javascript
   modules: [
     {
       criteria: { source: "^src/app/pages" },  // Update paths
       attributes: { fillcolor: "#ffcccc" }
     },
     // ... update all layer paths
   ]
   ```

---

## Step 6: Update TypeScript Path Aliases

**File:** `tsconfig.json`

**Action:** Merge path aliases from source into target repository's existing `tsconfig.json`.

**Source Path Aliases:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/shared/hooks/*"],
      "@/services/*": ["src/shared/services/*"],
      "@/utils/*": ["src/shared/utils/*"],
      "@/types/*": ["src/shared/types/*"],
      "@/config/*": ["src/config/*"],
      "@/context/*": ["src/shared/context/*"],
      "@/theme/*": ["src/shared/theme/*"],
      "@/routes/*": ["src/routes/*"],
      "@/lib/*": ["src/lib/*"],
      "@/ai-capabilities/*": ["src/ai-capabilities/*"]
    }
  }
}
```

**Process:**
1. Open target repository's `tsconfig.json`
2. Add `baseUrl: "."` if not present
3. Add `paths` object with aliases matching target repository structure
4. Adjust paths to match actual folder locations (e.g., if hooks are in `src/hooks` instead of `src/shared/hooks`, update accordingly)

---

## Step 7: Update ESLint Configuration

**File:** `eslint.config.js` (flat config)

**Action:** Update layer element patterns to match target repository structure. This harness uses ESLint flat config; adjust boundaries and import resolver to match target paths.

---

## Step 8: Add Package.json Scripts

**File:** `package.json`

**Action:** Add architecture checking scripts to the `scripts` section:

```json
{
  "scripts": {
    "arch:check": "depcruise --config .dependency-cruiser.cjs src",
    "arch:check:ci": "depcruise --config .dependency-cruiser.cjs --output-type err-long src",
    "arch:graph": "depcruise --config .dependency-cruiser.cjs --output-type dot src | dot -T svg > architecture-graph.svg",
    "arch:graph:html": "depcruise --config .dependency-cruiser.cjs --output-type html src > architecture-report.html",
    "arch:validate": "pnpm lint && pnpm arch:check",
    "arch:baseline": "depcruise --config .dependency-cruiser.cjs --output-type baseline src > .dependency-cruiser-baseline.json",
    "lint:arch": "eslint src --rule 'boundaries/element-types: error'"
  }
}
```

**Note:** 
- Update `src` to match target repository's source directory (e.g., `src/app`, `app`, etc.)
- Ensure `dot` command is available for graph generation (install Graphviz if needed)

---

## Step 9: Copy Documentation Files (Optional but Recommended)

### 9.1 Architecture Rules Documentation
**Source:** `[PROJECT_ROOT]plate-harness/.cursor/rules/architecture/RULE.mdc`  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/.cursor/rules/architecture/RULE.mdc`

**Action:** Create `.cursor/rules/architecture/` directory if it doesn't exist.

### 9.2 Architecture Guide
**Source:** `[PROJECT_ROOT]plate-harness/ARCHITECTURE.md`  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/ARCHITECTURE.md` (root)

**Action:** Keep `ARCHITECTURE.md` in project root (required by architecture rules).

### 9.3 Complexity Reduction Guide (Optional)
**Source:** `[PROJECT_ROOT]plate-harness/.cursor/rules/architecture/RULE.mdc` (complexity section)  
**Destination:** `[PROJECT_ROOT][TARGET_REPO_NAME]/.cursor/rules/architecture/RULE.mdc`

---

## Step 10: Create Baseline (For Existing Projects)

**Action:** If the target repository has existing code with violations, create a baseline:

```powershell
cd [PROJECT_ROOT][TARGET_REPO_NAME]
pnpm arch:baseline
```

**Result:** Creates `.dependency-cruiser-baseline.json` that tracks existing violations.

**Note:** This allows gradual remediation - new violations will be flagged, but existing ones are ignored until fixed.

---

## Step 11: Verification

Run these commands to verify the setup:

### 11.1 Verify Dependencies Installed
```powershell
cd [PROJECT_ROOT][TARGET_REPO_NAME]
pnpm list eslint-plugin-boundaries dependency-cruiser
```

### 11.2 Test ESLint Architecture Rules
```powershell
pnpm lint:arch
```

**Expected:** Should run without errors (or show existing violations if baseline created).

### 11.3 Test Dependency Cruiser
```powershell
pnpm arch:check
```

**Expected:** Should analyze dependencies and report violations (or pass if baseline created).

### 11.4 Test Full Lint
```powershell
pnpm lint
```

**Expected:** Should run ESLint including architecture rules.

### 11.5 Verify IDE Integration
**Action:** Open a TypeScript/TSX file in the target repository and:
1. Try importing from a forbidden layer (e.g., import component in a hook)
2. Verify ESLint shows red squiggles with error message
3. Verify error message explains the violation

---

## Step 12: Common Customization Scenarios

### Scenario A: Different Source Directory
If target repo uses `app/` instead of `src/`:

**Updates Needed:**
- `eslint.config.js`: Update all `src/**` patterns to `app/**`
- `.dependency-cruiser.cjs`: Update all `^src/` patterns to `^app/`
- `tsconfig.json`: Update path aliases (e.g., `"@/*": ["app/*"]`)
- `package.json` scripts: Update `src` to `app` in arch commands
- `projectStructure.config.cjs`: Change root folder from `src` to `app`

### Scenario B: Different Folder Names
If target repo uses `features/` instead of `pages/`:

**Updates Needed:**
- `eslint.config.js`: Add `features` as a new element type in boundaries
- `.dependency-cruiser.cjs`: Add rules for `features` layer
- `projectStructure.config.cjs`: Add `features` folder structure
- Update layer rules to include `features` in import hierarchy

### Scenario C: No Shared Folder
If target repo doesn't have `src/shared/`:

**Updates Needed:**
- `eslint.config.js`: Update patterns (e.g., `src/hooks/**` instead of `src/shared/hooks/**`)
- `.dependency-cruiser.cjs`: Update path patterns
- `tsconfig.json`: Update path aliases (e.g., `"@/hooks/*": ["src/hooks/*"]`)
- `projectStructure.config.cjs`: Update folder structure

---

## Step 13: Troubleshooting

### Issue: ESLint Can't Find projectStructure.config.cjs
**Solution:** Ensure `eslint.config.js` or project structure validator loads the config correctly. Check `scripts/project-structure-validator.js` and `validate-staged.js` for correct paths.

### Issue: Path Aliases Not Resolving
**Solution:** 
1. Verify `tsconfig.json` has correct `baseUrl` and `paths`
2. Verify `vite.config.ts` (or build config) has path alias plugin
3. Restart IDE/TypeScript server

### Issue: Dependency Cruiser Fails
**Solution:**
1. Verify `tsconfig.json` path in `.dependency-cruiser.cjs` options
2. Check that source directory exists
3. Verify TypeScript is installed

### Issue: Too Many Violations
**Solution:**
1. Create baseline: `pnpm arch:baseline`
2. Fix violations incrementally
3. Remove from baseline as fixed

---

## Step 14: Final Checklist

Before considering migration complete:

- [ ] All configuration files copied
- [ ] Dependencies installed
- [ ] `projectStructure.config.cjs` customized for target structure
- [ ] `.dependency-cruiser.cjs` paths updated
- [ ] `tsconfig.json` path aliases configured
- [ ] `eslint.config.js` layer patterns updated
- [ ] Package.json scripts added
- [ ] Baseline created (if needed)
- [ ] `pnpm lint:arch` runs successfully
- [ ] `pnpm arch:check` runs successfully
- [ ] IDE shows ESLint errors for violations
- [ ] Documentation files copied (optional)

---

## Quick Reference: File Locations

### Source Repository (plate-harness)
```
[PROJECT_ROOT]plate-harness/
├── eslint.config.js
├── .dependency-cruiser.cjs
├── projectStructure.config.cjs
├── tsconfig.json
├── .cursor/rules/architecture/RULE.mdc
└── ARCHITECTURE.md
```

### Target Repository (to be created/updated)
```
[PROJECT_ROOT][TARGET_REPO_NAME]/
├── eslint.config.js                ← Copy & customize
├── .dependency-cruiser.cjs         ← Copy & customize
├── projectStructure.config.cjs     ← Copy & customize
├── tsconfig.json                   ← Merge path aliases
├── package.json                    ← Add scripts & deps
├── .cursor/rules/architecture/RULE.mdc  ← Copy (optional)
└── ARCHITECTURE.md                 ← Copy (optional)
```

---

## Notes for AI Assistants

When executing this migration:

1. **Always verify** the target repository structure before copying files
2. **Customize** configuration files to match target structure - don't copy blindly
3. **Test** after each major step (dependencies, configs, scripts)
4. **Create baseline** if target repo has existing code
5. **Document** any target-specific customizations made
6. **Verify** IDE integration works (real-time ESLint errors)

---

## Support

If issues arise during migration:
1. Check `ARCHITECTURE.md` and `.cursor/rules/architecture/RULE.mdc` for detailed explanations
2. Review source repository's working configuration
3. Verify all paths match target repository structure
4. Ensure all dependencies are installed correctly

---

**Last Updated:** 2026-02-22  
**Source Repository:** plate-harness  
**Target Repository:** [To be specified]

