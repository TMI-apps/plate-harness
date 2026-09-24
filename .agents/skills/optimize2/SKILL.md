---
name: optimize2
description: >-
  Analyzes code for optimization across design, approach, efficiency, and complexity so fixes
  happen at the right level. Use when the user asks to optimize, reduce complexity, refactor
  thoughtfully, or assess whether code should be rewritten vs tweaked.
---

# optimize

## Purpose

Systematically analyze code for optimization opportunities across four levels: Design, Approach, Efficiency, and Complexity. This command ensures fixes happen at the **right level** to avoid wasted work—don't refactor code that should be rewritten, don't optimize code that should be deleted.

**Key Insight:** Fixing at the wrong level wastes effort. A complex function might need a design change (Level 1), not refactoring (Level 4). Always assess all levels before acting.

**SSOT:** `.eslintrc.json` (lines 65-70) is the single source of truth for complexity thresholds.

## Workflow Overview

```
ANALYZE (all 4 levels) → PRESENT OPTIONS → USER CHOOSES → EXECUTE → VERIFY
```

---

## Core Principles

### Rule of Three (MANDATORY for Extractions)

**For a novel abstraction inferred from duplicated business logic, don't extract/abstract until you have 3+ concrete use cases.** Two usages might be coincidental; wait for the third to prove the pattern.

**Why:** Every extraction adds indirection. Can you trace the feature without opening >5 files?

**Not governed by Rule of Three:**

1. **Names:** Category-based function/component/type/file names are mandatory on the first use; never wait for more callers before naming the capability correctly.
2. **Established primitives and patterns:** Reuse standard UI controls, design-system components, platform APIs, and existing repo abstractions immediately. A text input does not need three contextual copies before it can use `TextInput`.
3. **Thin project primitive with an existing contract:** A first-use wrapper is justified when it enforces an already-established project-wide contract such as theme, accessibility, validation, or error presentation. Otherwise use the underlying standard primitive directly; do not add a speculative passthrough wrapper.
4. **Composition and boundaries:** Keep context-specific labels, data, and behavior in props, the caller, or a thin contextual wrapper from day one. This is modular placement, not an abstraction inferred from duplication.

**Exceptions for novel extractions (Rare - document why overriding):**

1. **Architectural Violation:** Code in wrong layer (e.g., business logic in component) → Extract to correct layer even if single-use
2. **Testability Critical:** Function untestable as-is → Extract enables isolated testing
3. **Extreme Complexity:** Cognitive >25 AND cyclomatic >15 AND >150 lines → Extraction improves readability
4. **Level 2 Rewrite Side Effect:** Helper functions emerge naturally from algorithmic rewrite (2A/2B/2C)

**Default:** When in doubt → Follow Rule of Three (use 4E).

### Indirection Red Flags

Signs of too much abstraction (see also: [Over-Engineering Indicators](#over-engineering-indicators)):

- 🚩 **"Util" or "Helper" files growing endlessly** → Should stay inline or be colocated with feature
- 🚩 **Files with 1-2 exported functions** → Extracted too early, consider inlining
- 🚩 **Passthrough functions** → Functions that just call another function with same args
- 🚩 **Abstract base classes with one implementation** → Premature abstraction
- 🚩 **Interfaces with single implementers** → Abstraction without polymorphism
- 🚩 **"Future-proofing" comments** → "Extracted for future flexibility", "In case we need to swap"
- 🚩 **Can't answer "where does X happen?" quickly** → Feature scattered across too many files
- 🚩 **High fan-out (file imports 10+ things)** → Responsibilities scattered
- 🚩 **Wrapper functions that add nothing** → `logError = (msg) => console.error(msg)`
- 🚩 **Two similar business-logic functions** → Accept duplication until third proves the pattern

### Over-Engineering Indicators

When NOT to refactor (accept complexity instead):

- Creating files for single-use novel abstractions (unless [exception](#rule-of-three-mandatory-for-extractions) applies)
- Extracting novel shared helpers with <3 concrete use cases (violates [Rule of Three](#rule-of-three-mandatory-for-extractions))
- Breaking up cohesive functions that do one thing
- High statement count but low cognitive complexity
- Verbose operations inflating metrics (style copying, config objects, DOM manipulation)
- Abstraction layers with single implementations
- "Future-proofing" for requirements that don't exist
- Two similar business-logic functions that "could be" abstracted (wait for third use case)

**Remember:** The cure should not be worse than the disease. Prefer inline code over scattered micro-files.

### Complexity Metrics

**SSOT:** `.eslintrc.json` (lines 65-70)

| Metric | Threshold | ESLint Rule |
|--------|-----------|-------------|
| Cyclomatic Complexity | ≤ 10 | `complexity` |
| Cognitive Complexity | ≤ 15 | `sonarjs/cognitive-complexity` |
| Nesting Depth | ≤ 4 | `max-depth` |
| Function Length | ≤ 100 lines | `max-lines-per-function` |
| Parameters | ≤ 5 | `max-params` |
| Statements | ≤ 20 | `max-statements` |

---

## Phase 1: Analysis (All 4 Levels)

Analyze each hotspot through all four levels **before any changes**. This prevents fixing at the wrong level.

### Level 1: Design Review

**⚠️ CRITICAL: Design issues are the most expensive to fix later. Be ruthless and question everything.**

Ask these questions for each code area, using both **zoomed-out** (architectural) and **zoomed-in** (implementation) perspectives:

#### Zoomed-Out Questions (Architectural)

- **Does this code/feature need to exist?**
  - Is it used? Check for dead code with `grep`/`codebase_search`.
  - Could the requirement be eliminated entirely?
  - Is this solving the right problem, or a symptom?

- **Is this in the right layer?**
  - Is UI doing business logic? (Components should be presentation-only)
  - Is business logic in services? (Should be in hooks/services layer)
  - Are concerns properly separated? (Single Responsibility Principle)
  - Should this be a hook, service, or utility?
  - **Note:** Moving code to the correct layer (1C) takes precedence over [Rule of Three](#rule-of-three-mandatory-for-extractions). If code is in the wrong layer, extract it even if single-use (document as architectural exception).

- **Is there duplication or scattered logic?**
  - Is the same logic in multiple files? (DRY violation)
  - Are magic values/hardcoded data scattered? (Should be centralized)
  - Is configuration duplicated? (Should be single source of truth)

- **Could this be replaced entirely?**
  - Is there a library/built-in that does this better?
  - Is this reinventing the wheel?
  - Could a platform feature replace custom code?
  - Is this abstraction actually saving code, or adding complexity?

#### Zoomed-In Questions (Implementation)

- **Is the feature scope correct?**
  - Is this over-engineered for the actual need?
  - Are we handling edge cases that never occur?
  - Is there "just in case" code that adds complexity?

- **Are responsibilities mixed?**
  - Does one function/component do multiple unrelated things?
  - Is validation mixed with business logic?
  - Is error handling mixed with happy path?
  - Should this be split into smaller, focused units?

- **Is data flow correct?**
  - Is client-side validation duplicating server-side? (Server should be authoritative)
  - Are we fetching data that's already available?
  - Is state management appropriate? (Local vs global, derived vs stored)

- **Is the API/interface well-designed?**
  - Are there too many parameters? (>5 is a code smell)
  - Are parameters related? (Should be grouped into objects)
  - Is the return type clear and predictable?
  - Would a new developer understand this API?

#### Critical Red Flags

Watch for these design smells that indicate deeper problems:

- **Hardcoded values scattered across files** → Should be in config/database
- **UI components doing API calls** → Should use hooks/services
- **Business logic in components** → Should be in hooks/services
- **Duplicate validation** → Server should be authoritative, client is UX-only
- **No pagination for lists** → Will break at scale
- **Synchronous operations blocking UI** → Should be async/fire-and-forget
- **God functions/objects** → Doing too many things, split responsibilities
- **Feature flags/config in code** → Should be externalized
- **Magic numbers/strings** → Should be named constants

**Possible outcomes:**
- **1A - Delete:** Code is unused or unnecessary
- **1B - Replace with library/built-in:** Better solution exists
- **1C - Simplify scope:** Remove unnecessary edge case handling, split responsibilities, reduce API surface
- **1D - Keep design:** Design is sound, continue to Level 2

**⚠️ Default to skepticism:** If you're not sure, dig deeper. Check if features are actually used, if abstractions save code, if hardcoded values should be configurable.

**Investigation Techniques:**
- Verify usage: `grep -r "functionName\|ComponentName" src/ --include="*.ts" --include="*.tsx"`
- Check dead code: `codebase_search "Where is FeatureName used?"`
- Find hardcoded values: `grep -r "hardcoded\|magic\|12345" src/`
- Count abstraction cost: Lines saved vs lines of abstraction added
- Verify layer placement: Components (UI only) → Hooks (orchestration) → Services (business logic) → Utils (pure functions)

### Level 2: Approach Review

Assuming design is sound, evaluate the algorithmic approach:

- **Is the algorithm appropriate?**
  - O(n²) when O(n log n) exists?
  - Brute force when smarter solution available?
  - Recursive when iterative is simpler?
  - Sequential operations that could be parallelized?
  - Multiple passes over same data when single pass would work?

- **Is the data structure appropriate?**
  - Array when Set/Map would be O(1)?
  - Nested objects when flat structure works?
  - Storing derived data that could be computed?
  - Using wrong data structure for access patterns?
  - Missing indexes for frequent lookups?

- **Are there unnecessary abstractions? (Indirection Check)**
  - **Apply [Rule of Three](#rule-of-three-mandatory-for-extractions):** For novel abstractions inferred from duplicated business logic, don't abstract until you have 3+ concrete use cases
  - Over-abstracted for flexibility never used?
  - Indirection that adds overhead without benefit? (See [Indirection Red Flags](#indirection-red-flags))
  - Patterns used for pattern's sake?
  - Abstraction layers with single implementation?
  - "Future-proofing" for requirements that don't exist?
  - Passthrough functions that just call another function with same args?
  - Wrapper functions that add nothing (e.g., `logError = (msg) => console.error(msg)`)?
  - Can't answer "where does X happen?" without opening 5+ files?

- **Is the control flow appropriate?**
  - Complex state machines when simple conditionals work?
  - Callback hell when async/await would be clearer?
  - Event-driven when direct calls are simpler?
  - Polling when webhooks/streaming available?

**Investigation Techniques:**
- Count nested loops (O(n²) vs O(n))
- Check access patterns (frequent lookups → Map/Set)
- Count abstraction implementations (if only 1, premature)
- Trace feature end-to-end (if >5 files, too much indirection)

**Possible outcomes:**
- **2A - Rewrite with different algorithm:** Fundamental approach is wrong
- **2B - Change data structure:** Right algorithm, wrong data organization
- **2C - Remove abstractions:** Simplify by removing unnecessary layers
- **2D - Keep approach:** Approach is sound, continue to Level 3

### Level 3: Efficiency Review

Assuming approach is sound, evaluate runtime efficiency:

**React/Frontend Performance:**
- Missing `useMemo`/`useCallback` causing re-renders?
- Unnecessary re-renders from unstable references?
- Large component trees re-rendering unnecessarily?
- Missing React.memo on expensive child components?

**Data Fetching:**
- N+1 query problems?
- Missing caching strategies?
- Duplicate API calls?
- Fetching more data than needed?

**Memory & Resources:**
- Missing cleanup in useEffect?
- Event listener leaks?
- Large objects retained unnecessarily?
- Subscriptions not unsubscribed?

**Bundle & Loading:**
- Large dependencies that could be smaller?
- Missing code splitting opportunities?
- Unused imports increasing bundle size?

**Possible outcomes:**
- **3A - Add memoization/caching:** Performance fix without structural change
- **3B - Fix data fetching pattern:** Query optimization
- **3C - Fix resource cleanup:** Memory leak fixes
- **3D - Optimize bundle:** Code splitting, tree shaking
- **3E - Keep as-is:** Efficiency is acceptable, continue to Level 4

### Level 4: Complexity Review

Assuming efficiency is acceptable, evaluate structural complexity.

**Run ESLint complexity analysis:**
```bash
pnpm lint
```

**Check metrics against [Complexity Metrics](#complexity-metrics) thresholds.**

**Structural issues to identify:**
- High cyclomatic complexity (many branches)
- Deep nesting (pyramid of doom)
- Long functions/methods
- Long parameter lists
- God objects (too many responsibilities)

**Coupling issues:**
- High fan-in (many files depend on this)
- High fan-out (depends on many files)
- Circular dependencies

#### ⚠️ Proportionality Gate (BEFORE suggesting extraction)

**Don't optimize for metrics—optimize for maintainability.**

**Proportionality Check Questions:**

| Question | If NO → Default to 4E |
|----------|----------------------|
| Is this a novel abstraction inferred from duplicated business logic, and does it have 3+ concrete use cases? | <3 uses → keep inline, unless it is outside Rule of Three or an exception applies ([Rule of Three](#rule-of-three-mandatory-for-extractions)) |
| Would extracted helpers be reusable elsewhere? | Non-reusable → keep inline |
| Is cognitive complexity high (not just statement count)? | High statements + low cognitive = acceptable |
| Would a new developer understand it better after extraction? | Same/worse readability → keep together |
| Is the function doing multiple unrelated things? | Cohesive function → keep together |
| Can you trace the feature without opening >5 files? | Too scattered → don't add more indirection |

**Common cases where 4E (Accept) is correct:**
- High statement count from verbose but necessary operations (style copying, DOM manipulation, config objects)
- Single-purpose utility used in one place
- Function is cohesive and readable despite exceeding thresholds
- Extraction would create files with only 1-2 private helpers
- Two similar business-logic functions that "could be abstracted" but aren't proven to need it yet (wait for third)

**Possible outcomes:**
- **4A - Extract methods/functions:** Break down large functions *(for novel shared abstractions: only if ≥3 concrete use cases OR [exception](#rule-of-three-mandatory-for-extractions) applies)*
- **4B - Simplify conditionals:** Guard clauses, polymorphism
- **4C - Reduce coupling:** Extract interfaces, dependency injection
- **4D - Introduce parameter object:** Reduce parameter count
- **4E - Accept complexity:** Complexity is justified; document why:
  - `[cohesive]` Function does one thing well, just verbosely
  - `[single-use]` Code is used in one place, extraction adds indirection
  - `[readable]` Current structure is clear despite metrics
  - `[verbose-ops]` High statement count from necessary verbose operations

---

## Phase 2: Hotspot Identification

### Combine with Git Churn

```bash
# Files changed frequently in last 30 days
git log --since="30 days ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -20
```

### Deep Investigation Checklist

Before analyzing a hotspot, gather comprehensive context:

**Usage Analysis:**
- [ ] Search for all imports/usages: `grep -r "functionName\|ComponentName" src/`
- [ ] Check if feature is actually used in production (not just defined)
- [ ] Verify if "dead code" is actually dead or just rarely used
- [ ] Check if feature is behind a feature flag that's never enabled

**Dependency Analysis:**
- [ ] Count files that import this code (`grep` for imports)
- [ ] Check if high fan-in indicates this is a critical dependency
- [ ] Check if high fan-out indicates this is doing too much
- [ ] Look for circular dependencies

**Complexity Analysis:**
- [ ] Run ESLint complexity check: `pnpm lint | grep -i complexity`
- [ ] Count actual branches/conditions (not just lines)
- [ ] Identify deeply nested code blocks
- [ ] Check parameter count and if they're related

**Design Pattern Analysis:**
- [ ] Is this a "god object/function" doing multiple unrelated things?
- [ ] Is business logic mixed with presentation?
- [ ] Are there hardcoded values that should be configurable?
- [ ] Is validation duplicated (client + server)?
- [ ] Is error handling scattered or centralized?

**Performance Analysis:**
- [ ] Check for N+1 queries (multiple sequential API calls)
- [ ] Look for missing memoization in React components
- [ ] Check if large data structures are recreated unnecessarily
- [ ] Verify if expensive operations are cached

### Priority Scoring

```
Priority = (Level of Issue × 4) + (Churn × 2) + (Dependencies × 1)

Level weights:
- Level 1 issue (Design): 4 points
- Level 2 issue (Approach): 3 points
- Level 3 issue (Efficiency): 2 points
- Level 4 issue (Complexity): 1 point
```

Higher-level issues get priority because fixing them may eliminate lower-level issues.

**Additional Priority Factors:**
- High churn (>10 commits/month) suggests problematic code
- High dependencies (>5 files) means changes have wide impact
- Critical path code (used in hot paths) gets higher priority
- User-facing code gets higher priority than internal utilities

---

## Phase 3: Present Options to User

**⚠️ CRITICAL: Do not proceed without user input.**

For each hotspot, present findings and wait for user decision.

### Output Format

```
═══════════════════════════════════════════════════════════════════
HOTSPOT #1: [File/Function Name]
Location: `path/to/file.ts:line-start:line-end`
Churn: [X commits, Y contributors in last 30 days]
Dependencies: [Z files import this]
═══════════════════════════════════════════════════════════════════

LEVEL 1 - DESIGN:
├── Status: [Issue Found / OK]
├── Finding: [Description if issue found]
└── Options:
    [1A] Delete - [reason]
    [1B] Replace with [library/built-in] - [reason]
    [1C] Simplify scope - [what to remove]
    [1D] Keep design ✓

LEVEL 2 - APPROACH:
├── Status: [Issue Found / OK]
├── Finding: [Description if issue found]
└── Options:
    [2A] Rewrite with [algorithm] - [reason]
    [2B] Change to [data structure] - [reason]
    [2C] Remove [abstraction] - [reason]
    [2D] Keep approach ✓

LEVEL 3 - EFFICIENCY:
├── Status: [Issue Found / OK]
├── Finding: [Description if issue found]
└── Options:
    [3A] Add memoization - [where]
    [3B] Fix data fetching - [how]
    [3C] Fix resource cleanup - [what]
    [3D] Optimize bundle - [how]
    [3E] Keep as-is ✓

LEVEL 4 - COMPLEXITY:
├── Status: [Issue Found / OK]
├── Metrics:
│   ├── Cyclomatic: [X] (threshold: 10)
│   ├── Cognitive: [Y] (threshold: 15)
│   ├── Nesting: [Z] (threshold: 4)
│   ├── Lines: [W] (threshold: 100)
│   ├── Statements: [S] (threshold: 20)
│   └── Params: [N] (threshold: 5)
├── Proportionality Check:
│   ├── Novel abstraction with 3+ concrete use cases? [Yes/No] ([Rule of Three](#rule-of-three-mandatory-for-extractions))
│   │   └── Exception? [See Core Principles](#rule-of-three-mandatory-for-extractions)
│   ├── Cognitive complexity high? [Yes/No]
│   ├── Extraction improves readability? [Yes/No]
│   └── Function cohesive? [Yes/No]
└── Options:
    [4A] Extract methods - [which parts] (novel shared abstraction: ≥3 concrete use cases OR exception)
    [4B] Simplify conditionals - [how]
    [4C] Reduce coupling - [how]
    [4D] Parameter object - [which params]
    [4E] Accept complexity - [cohesive/single-use/readable/verbose-ops]

───────────────────────────────────────────────────────────────────
RECOMMENDED ACTION: [Primary recommendation based on highest-level issue]
───────────────────────────────────────────────────────────────────

Please choose options for each level (e.g., "1D 2D 3A 4B"):
> [WAIT FOR USER INPUT]
```

### Decision Rules

- If user selects Level 1 option (1A/1B/1C): Skip lower levels—they become irrelevant
- If user selects Level 2 option (2A/2B/2C): Skip Level 4—rewrite will address structure
- Options can be combined when they're independent (e.g., "3A 4B" for memoization + simplify conditionals)
- User can select "D/E" options to explicitly skip a level

---

## Phase 4: Execute Based on User Choice

### Common Steps for ANY Action

**Before making changes:**
1. **Write tests for current behavior** ⚠️ **MANDATORY** (see [Testing Requirements](#testing-requirements-by-action-type))
2. **Create performance baseline** (if applicable for efficiency fixes)

**After making changes:**
1. Verify tests pass
2. Verify performance improvement (if applicable)
3. Run linter: `pnpm lint` - fix any issues
4. Run type check: Ensure TypeScript compiles
5. Run architecture checks (if extracting code):
   - Folder structure: `pnpm validate:structure`
   - Import boundaries: `pnpm lint:arch`
6. Re-analyze complexity: Verify metrics improved (if refactoring)
7. Manual verification: Quick smoke test of affected features

### Action Type: DELETE (1A)

1. Verify code is truly unused (search for references)
2. Document what was removed and why
3. Remove code
4. Run tests to verify no breakage
5. Commit: Hand off to **`.agents/skills/finish/SKILL.md`** when the user wants to commit (do not commit inline during optimize2).

### Action Type: REPLACE (1B)

1. Identify replacement library/built-in
2. Implement replacement
3. Remove old implementation
4. Hand off to **`.agents/skills/finish/SKILL.md`** when the user wants to commit (do not commit inline during optimize2).

### Action Type: REWRITE (2A/2B/2C)

1. Document expected inputs/outputs
2. Implement new approach
   - **Note:** If the rewrite naturally requires extracting helper functions (even with <3 concrete use cases), this is acceptable as a "Level 2 rewrite side effect" [exception](#rule-of-three-mandatory-for-extractions). Document in commit message.
3. Remove old implementation
4. Run complexity analysis on new code
5. Hand off to **`.agents/skills/finish/SKILL.md`** when the user wants to commit (do not commit inline during optimize2).

### Action Type: OPTIMIZE (3A/3B/3C/3D)

1. **Create performance baseline:**
   - React: Note re-render count before
   - Queries: Note query count/time before
   - Bundle: Note size before
2. Implement optimization
3. **Verify performance improvement**
4. Hand off to **`.agents/skills/finish/SKILL.md`** when the user wants to commit (do not commit inline during optimize2).

### Action Type: REFACTOR (4A/4B/4C/4D)

1. **Confirm proportionality** (for 4A extractions—MANDATORY):
   - [ ] If proposing a novel shared abstraction: ≥3 concrete use cases OR [exception](#rule-of-three-mandatory-for-extractions) applies (document why)
   - [ ] Extraction improves readability/maintainability
   - [ ] Single responsibility, not creating micro-files
   - [ ] Feature traceable without opening >5 files
   - **If fails:** Use 4E instead
2. Check architecture compliance (see [Phase 5](#phase-5-architecture-compliance-for-refactoring))
3. Execute refactoring (extract methods, simplify conditionals, reduce coupling, parameter objects)
4. Run complexity analysis—verify metrics meet [thresholds](#complexity-metrics)
5. Hand off to **`.agents/skills/finish/SKILL.md`** when the user wants to commit (do not commit inline during optimize2).

---

## Phase 5: Architecture Compliance (For Refactoring)

**⚠️ All code extractions during refactoring MUST comply with architecture rules.**

### Code Placement (Layer Rules)

When extracting code, place in correct layer:
- **Pure calculation/logic?** → Extract to `@/utils/` (no React lifecycle)
- **API/data fetching?** → Extract to `@/services/` (business logic)
- **React lifecycle needed?** → Extract to `@/hooks/` (orchestration layer)
- **UI component?** → Keep in `@/components/` (but extract logic to hooks/services)
- **Never extract from components directly to services** - use hooks as bridge if React state/effects needed

### Path Aliases (REQUIRED)

- **Always use path aliases** (`@/utils/`, `@/services/`, `@/hooks/`) - NEVER relative parent imports (`../`)
- Example: `import { calculatePrice } from '@/utils/pricing'` ✅
- Example: `import { calculatePrice } from '../../utils/pricing'` ❌

### Folder Structure

- **Prefer existing folders** when extracting code
- **If new folder needed:** Update `projectStructure.config.cjs` FIRST
- **Never create unauthorized folders** - ESLint will error
- **Validate structure:** Run `pnpm validate:structure` to verify folder structure compliance

### Import Direction (Downward Only)

- `pages` → `components` → `hooks` → `services` → `utils` → `types`
- **Never create upward imports** (e.g., hooks cannot import from components)

### Architecture Checklist

- [ ] Code placed in correct layer
- [ ] Path aliases used (`@/` prefix)
- [ ] No upward imports
- [ ] Folder structure whitelist respected
- [ ] Folder structure validated (`pnpm validate:structure`)
- [ ] ESLint architecture rules pass (`pnpm lint:arch`)

---

## Testing Requirements by Action Type

| Action | Test Requirement |
|--------|------------------|
| Delete (1A) | Verify no test failures after removal |
| Replace (1B) | Tests for behavior before replacement |
| Rewrite (2A/2B/2C) | Tests for behavior (new impl must pass same tests) |
| Optimize (3A-3D) | Tests for behavior + performance baseline |
| Refactor (4A-4D) | Tests for behavior (same tests before/after) |

**Writing Tests Before Changes:**

```
Test File Location: `[path]/__tests__/[filename].test.ts`

Tests must cover:
- [ ] Happy path scenarios
- [ ] Edge cases
- [ ] Error conditions
- [ ] All branches (for complexity refactoring)
```

---

## Example Sessions

Detailed examples in this section show:
- Example 1: Multi-level optimization (calculatePricing)
- Example 2: When to accept complexity (4E)

---

## Important Notes

- **Assessment before action:** Always analyze all 4 levels before making changes
- **User decides:** Present options and wait for user input at decision points
- **Higher levels first:** Fixing design/approach issues may eliminate efficiency/complexity issues
- **Architecture compliance:** All extractions must follow [layer rules](#phase-5-architecture-compliance-for-refactoring)
- **Natural overlap:** When complexity IS the efficiency problem, it emerges naturally—user can select options that address both
- **Rule of Three:** See [Core Principles](#rule-of-three-mandatory-for-extractions)
- **Indirection cost:** See [Indirection Red Flags](#indirection-red-flags)
- **Over-engineering:** See [Over-Engineering Indicators](#over-engineering-indicators)

## Code Smell Reference

Common indicators for each level:

**Level 1 (Design):**
- Dead code, unused exports
- "Just in case" features
- Solving problems that don't exist

**Level 2 (Approach):**
- Nested loops that could be lookups
- Repeated traversals of same data
- Complex algorithms for simple problems

**Level 3 (Efficiency):**
- Re-renders without prop changes
- Multiple identical API calls
- Memory growing over time

**Level 4 (Complexity):**
- Functions > 100 lines
- Nesting > 4 levels
- Switch statements with many cases
- Functions with > 5 parameters

---

## Boundaries

| Not `optimize2` | Use instead |
|-----------------|-------------|
| Repo-wide duplication discovery | `consolidate` |
| Wrong layer / feature placement | `consolidate` § Semantic placement mode |
| Simplify whether feature should exist | `challenge` |
| Browser-measured perf (CWVs) | `web-perf` plugin skill |
| Commit / changelog | `finish` |

**Next:** User picks option → **`implement`** or **`quick-piv`** → **`validate`** → **`finish`**.
