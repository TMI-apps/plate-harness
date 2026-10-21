# Semantic placement repair (consolidate mode)

Complement automated architecture enforcement by identifying **semantic** violations and code-organization issues that scripts cannot detect, and by guiding refactoring **moves**. Focuses on architectural intent and refactoring execution, not duplicate checks already covered by tooling. (Formerly the `architecture-repair2` skill.)

**Prerequisite:** Run **`.agents/skills/validate/SKILL.md`** (gate depth) first (or confirm `pnpm validate:structure`, `pnpm arch:check` are green). This mode assumes tool-caught violations are already fixed; it focuses on what tools miss.

---

## Phase A: Semantic analysis (what tools miss)

After automated checks pass, analyze violations that require human judgment:

### A.1 Misplaced concerns (code organization)
- **Business logic in UI components:** components containing API calls, complex calculations, or data transformations.
- **UI logic in utilities:** utils containing React-specific code or DOM manipulation.
- **Service logic in hooks:** hooks containing business rules instead of orchestration.
- **Detection:** read file contents; analyze imports and function complexity. Tools check import paths, not semantic content.

### A.2 Missing abstractions (code duplication)
- Duplicated logic across files; functions that should live in `shared/utils/`; API/data access duplicated across features.
- **Detection:** pattern matching / similarity. (This overlaps the main consolidate discovery phases — reuse them; tools don't detect semantic duplication.)

### A.3 Feature boundary violations
- Cross-feature dependencies (features importing other features' internals); shared code placed in a single feature.
- **Detection:** analyze import paths between features. ESLint boundaries catch some, not all.

### A.4 Architectural intent violations
- Files in technically valid but semantically wrong locations (e.g. utility in `components/helpers/` instead of `shared/utils/`; feature-specific hook in `shared/hooks/` instead of `features/[feature]/hooks/`).
- **Detection:** analyze file purpose vs location and import patterns. Tools validate structure, not semantic correctness.

---

## Phase B: Refactoring impact analysis

For each violation:

### B.1 Dependency analysis
- Count dependents (how many files import this); list import locations; check whether a move would create circular dependencies (complement dependency-cruiser). Use grep / codebase search.

### B.2 Move complexity
- **Simple:** file move only, no import updates (rare).
- **Medium:** file move + import path updates (most common).
- **Complex:** file move + import updates + refactoring (extract logic, split files).
- **Risk:** Low (few dependents, isolated) / Medium (moderate dependents, cross-cutting) / High (many dependents, core functionality, or needs refactoring).

### B.3 Path alias compliance
- All imports use `@/` prefix (ESLint-enforced; verify during move). Convert relative imports to aliases during the move.

---

## Phase C: Prioritization

Rank by:
- **Impact score:** (dependency count × risk level) − move complexity.
- **Quick wins:** low complexity, high architectural benefit.
- **Foundation fixes:** core structural issues blocking other improvements.
- **Group related moves:** files that should move together to minimize import updates.

---

## Phase D: Recommendations (chat output, no files)

For each top priority (top 5–10):

- **Current location:** full path.
- **Intended location:** per architecture (must exist in `projectStructure.config.cjs` whitelist).
- **Reason:** why it violates architectural intent (semantic).
- **Impact:** files importing it, import statements to update, risk, complexity.
- **Recommended approach:**
  - **Option A — Manual move (preferred if Cursor auto-updates imports):** move in IDE; verify imports; run `pnpm validate:structure && pnpm lint:arch`.
  - **Option B — Agent move (if manual doesn't auto-update):** agent moves file and updates all imports (list affected files; all `@/` aliases).
- **Dependencies to check:** importing files to verify after move.

Output template:

```
# Architecture Repair Analysis

## Automated Checks Status
✅ Project structure validation: [PASS/FAIL - X violations]
✅ ESLint architecture rules: [PASS/FAIL - X violations]
✅ Dependency-cruiser analysis: [PASS/FAIL - X violations]

## Semantic Architecture Violations

### 1. [Violation Name] - [Risk Level]
**Current:** `path/to/current/file.ts`
**Should be:** `path/to/intended/file.ts` (validated against projectStructure.config.cjs whitelist)
**Reason:** [semantic violation]
**Type:** [Misplaced Concerns / Missing Abstraction / Feature Boundary / Intent Violation]
**Impact:** [X] files import this; [Y] import statements; Risk [L/M/H]; Complexity [Simple/Medium/Complex]
**Recommended Approach:** [Option A or B with details]
**Files to verify after move:** [list]
```

---

## Phase E: Move execution

**When the user requests a move:**

1. **Pre-flight:** intended location in whitelist; no new cycles; imports will use `@/`; confirm with user.
2. **Manual (Option A):** give exact "move file X to Y"; after move run `pnpm validate:structure`, `pnpm arch:check`; if imports not auto-updated, switch to Option B.
3. **Agent (Option B):** move file; grep all imports; update paths to `@/` aliases (never relative parent), update barrel `index.ts`, preserve `import type`; verify with `validate:structure`, `lint:arch`, `arch:check`, and type-check (`tsc --noEmit`).

**Batch moves:** group by domain/feature; move dependencies before dependents; update all imports; run all validation after the batch.

**Documentation after significant changes:** update `ARCHITECTURE.md` if present; record refactoring in `CHANGELOG.md` (via `finish`); update path references only in affected contract docs; do not create new deep docs without explicit user approval.

---

## Important notes

- **Complementary, not duplicate:** semantic violations tools cannot detect.
- **Run tools first:** `pnpm validate:structure`, `pnpm arch:check` before this mode.
- **Path aliases required** (`@/`); **whitelist compliance** — never modify the whitelist to accommodate a violation.
- **Baseline respect:** existing violations in `.dependency-cruiser-baseline.json` are ignored; focus on new ones.
- **Architecture rules immutable:** violations mean code is wrong, not the rules.
- **Cursor IDE:** manual moves may auto-update imports but not guaranteed — always verify. **Agent moves:** imports are NOT auto-updated; update explicitly.
- **Type safety / testing:** run type-check after moves; recommend tests if available. **Incremental:** fix highest priority first, then re-run analysis.
- **Commit:** route commits through `.agents/skills/finish/SKILL.md` (no inline commits here).

### Already automated (do not re-report)
Folder/file location, layer boundaries, relative imports, circular deps, orphaned modules, file naming — covered by `project-structure-validator.js`, ESLint boundaries, and dependency-cruiser.
