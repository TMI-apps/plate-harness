---
name: consolidate
description: >-
  Systematically audit a named target (folder, feature, layer, glob, or whole src/)
  for consolidation, abstraction, and redundancy. Sweeps src/ for copies; focuses
  report and execute on Target plus 1-hop import neighborhood. Use when the user
  asks to find duplication, consolidate code, audit for redundancy, reduce repetition,
  identify shared patterns, audit a path/feature for overlap, asks what would warrant
  consolidation, or asks for a consolidation rubric. Default is audit-then-stop.
  Never invent a chat-only warrant rubric — use references/warrant-rubric.md.
---

# Consolidate - Cross-Codebase Redundancy Audit

## Purpose

Discover, classify, and prioritize opportunities to unify repeated code patterns **around a named Target**. This skill owns the **discovery** phase - systematically finding what is duplicated - and produces an actionable consolidation plan. Default outcome is an **audit report** (Phase 5). Execute (Phase 6) only after the user chooses candidates.

**Scope:** **Broad sweep** of `src/` for copies; **focus** = Target ∪ 1-hop import neighborhood (not whole `src/` as the Target unless asked). For per-hotspot optimization use `optimize2`. For single-feature simplification use `challenge`. For **semantic placement / wrong-layer repair** (after tooling is green), use this skill's **Semantic placement mode** below. For **proactive workaround detection during implementation**, use [`layer-consistency-check`](../layer-consistency-check/SKILL.md) (always-on via `architecture/RULE.mdc` § Layer consistency).

## Modes

- **Default — Redundancy audit:** the discovery → classify → prioritize → present workflow below (what repeats **around** the Target?). Stop after present unless the user already approved execute.
- **Semantic placement repair:** is code in the **wrong layer/feature**, or does it mix concerns? Moves and refactors behind a gate, **after** `validate` (gate depth)/tooling is green. Full procedure: [`references/semantic-placement.md`](references/semantic-placement.md). (Formerly the `architecture-repair2` skill.) Apply to the **same Target** when that is the ask.

## Triggers

- User asks to "find duplication", "consolidate code", "audit for redundancy", "reduce repetition"
- User asks "what can be shared/unified/abstracted?"
- User points at a **broad target** (folder, feature, layer, glob, `src/`) and wants an overlap/redundancy **audit**
- User asks what would **warrant** consolidation, or asks for a consolidation **rubric**
- User names a refactor/cleanup that is about shared patterns across features
- `improve` / router handoff: “Remove repeated work” with a Target

Do not auto-trigger solely because “a major refactor is coming” or “features grew organically” without an explicit duplication/unify/audit ask.

If the ask is only “what warrants consolidation / make a rubric,” read [`references/warrant-rubric.md`](references/warrant-rubric.md), answer from it, and do not invent a parallel scoring table in chat.

---

## Core Principles

### Rule of Three (Inherited from optimize2)

For a **novel abstraction inferred from duplicated business logic**, do not extract/abstract until you have **3+ concrete use cases**. This does not delay category-based naming, established standard primitives, or existing repo patterns. Full scope and exceptions: **`.agents/skills/optimize2/SKILL.md`** § Rule of Three.

### Consolidation != Abstraction

Not every repeated pattern needs a shared abstraction. Sometimes the right answer is:
- **Accept duplication** - the copies will diverge
- **Standardize the pattern** - document it as a convention without extracting
- **Extract a utility** - simple shared function
- **Create a configurable abstraction** - parameterized hook/component (highest cost)

Always prefer the lowest-cost option that solves the actual problem.

### Warrant SSOT

Go/no-go, hard gates, and scoring: [`references/warrant-rubric.md`](references/warrant-rubric.md). Never invent a parallel chat-only rubric.

### Indirection Budget

Every extraction adds indirection. Before proposing consolidation, answer:
- Can a developer still trace a feature without opening >5 files?
- Does the abstraction save more code than it adds?
- Would a new developer understand the abstraction faster than the duplicated copies?

If any answer is "no", reconsider.

---

## Required Input — Target

Resolve **before Phase 1**. Target is the **focus root**, not the exclusive search root. Do not treat whole `src/` as the Target unless the user asked for a full audit.

| Kind | Example | When |
|------|---------|------|
| **Path / glob** | `src/features/auth`, `src/features/**/hooks` | User named a folder or pattern |
| **Feature / pair** | `auth`, `auth` + `billing` | After copying a feature or comparing two |
| **Layer** | all hooks, all services, all components **under Target** | Standardizing one layer |
| **Pattern** | “table models” inside Target | Known repeated shape |
| **Full `src/`** | entire application tree as Target **and** focus | User said full / repo-wide / all features |

**Default:** named subtree, feature, layer, or glob from the message or from `improve`/router handoff.

**Whole repo as Target:** only if the user (or handoff) explicitly asks for full / `src/` / all features.

If Target is missing, ask **once** and wait. Do not start with “Target = `src/`” to fill the gap.

**Focus set (D6, D8):** Target files ∪ 1-hop **callers** (other `src/` files that import a Target file) ∪ 1-hop **callees** (`src/` files a Target file imports via `@/` or project paths). Exclude `node_modules`. **Not transitive** — do not walk callers-of-callers.

**Sweep vs focus (D5, D9):** After Target is set, **sweep `src/`** for more copies of patterns found in Target. Report and (if approved) execute **in-focus** hits. List **out-of-focus** hits as “also exists”; do not migrate them unless the user expands Target.

**Audit vs execute:** “audit / find duplication / what overlaps” → stop after Phase 5. Phase 6 only when the user picks candidates (or the opening message already said implement those).

---

## Workflow

```
RESOLVE TARGET -> DISCOVER -> CLASSIFY -> ANALYZE -> PRIORITIZE -> PRESENT -> (USER CHOOSES) -> EXECUTE
```

### Phase 1: Discovery

Build the **Focus set**, then run all applicable lenses. Do not stop after the first pattern.

1. List Target files.
2. Add 1-hop callers and callees under `src/` (Focus set).
3. Derive candidate **shapes** from Target (names, signatures, import clusters).
4. **Broad sweep:** search those shapes across `src/` (not only Target). Tag each hit **in-focus** (path in Focus set) or **out-of-focus**.
5. Phase 3D still checks existing `src/shared/`, `src/components/common/`, `src/lib/` (those files are in-focus if they are 1-hop callees; otherwise still valid shared-home candidates).

#### 1A. Structural Similarity Scan

Find files with similar names or roles across features:

```bash
# PowerShell example: similar file names across feature folders
Get-ChildItem -Path <Target> -Recurse -File | Where-Object { $_.FullName -match "\\(components|hooks|services)\\" }
```

**What to look for:**
- Files with matching suffixes: `use*TableModel.ts`, `*Page.tsx`, `*Filters.tsx`, `*Service.ts`
- Files with matching structure: similar exports, similar hook signatures, similar component props
- Feature folders with parallel internal structure (same sub-files in each)

#### 1B. Import Cluster Analysis

Find groups of imports that appear together repeatedly:

```bash
# Find files that import the same set of dependencies
rg "^import.*from" <Target> --type ts --type tsx
```

**What to look for:**
- 3+ files importing the same 3+ modules together -> likely a shared pattern waiting to be extracted
- Features importing the same set of shared utilities -> those utilities might need a higher-level wrapper

#### 1C. Pattern Repetition Scan

Search for repeated code shapes:

```bash
# Derive shapes from Target, then sweep src/ (Frequency = all hits)
rg "export (const|function) (use|create|build|get|format|parse|transform)" <Target> --type ts
rg "export (const|function) (use|create|build|get|format|parse|transform)" src/ --type ts

# Repeated hook patterns (fetch + state + error)
rg "useQuery|useMutation|useState.*loading|useState.*error" <Target> --type ts
rg "useQuery|useMutation|useState.*loading|useState.*error" src/ --type ts
```

**What to look for:**
- Functions with similar signatures doing similar things in different features
- Hook patterns: fetch -> transform -> expose (repeated per feature)
- Component patterns: loading/error/empty state handling repeated per page
- Service patterns: Supabase query -> map -> return (repeated per entity)

#### 1D. Convention Inconsistency Scan

Find places where the same logical operation is done differently:

**What to look for:**
- Same concern handled by different mechanisms (e.g., two date-formatting approaches)
- Same UI pattern built with different components (e.g., filter bars)
- Same data transformation done inline in some files, via utility in others
- Shared components/hooks that exist but are not used everywhere they could be

#### 1E. Git Churn Correlation

Files that change together often share a hidden coupling:

```bash
# PowerShell example: files frequently changed in last 60 days
git log --since="60 days ago" --name-only --pretty=format: | rg "\S" | sort | Get-Unique
```

**What to look for:**
- Feature files that always change in lockstep -> shared concern not yet extracted
- Utility files that change whenever a feature changes -> leaky abstraction

> Use PowerShell-compatible commands in this repo. Avoid Unix-only command idioms.

---

### Phase 2: Classification

Categorize every finding into one of four redundancy types:

| Type | Definition | Example | Typical fix |
|------|-----------|---------|-------------|
| **Literal** | Copy-pasted code, near-identical functions | Same `formatDate()` in two features | Extract to `src/shared/utils/` |
| **Structural** | Different code following the same *shape* repeatedly | Every feature has a `use*TableModel` with fetch/filter/sort | Configurable factory or shared base hook |
| **Conceptual** | Multiple mechanisms solving the same problem | Some features use a filter bar component, others inline filter logic | Standardize on one approach |
| **Inconsistent usage** | A shared utility exists but is not used everywhere | `src/shared/utils/formatDate` exists but 3 features still inline date formatting | Adopt existing utility |

**For each finding, record:**
1. **What:** Description of the repeated pattern
2. **Where:** File paths (all occurrences), each tagged in-focus / out-of-focus
3. **Type:** Literal / Structural / Conceptual / Inconsistent usage
4. **Frequency:** Count of **all** same-pattern hits from the `src/` sweep (in-focus + out-of-focus)
5. **Variance:** What differs between occurrences (the parameterizable parts)

---

### Phase 3: Analysis

For each classified finding, assess consolidation viability:

#### 3A. Divergence Likelihood

Ask: "Will these copies need to evolve differently?"

- **High divergence** -> Accept duplication, document as intentional
- **Low divergence** -> Strong consolidation candidate

#### 3B. Coupling Cost

Ask: "What does the shared abstraction couple together?"

- If consolidation creates a dependency between features that were independent -> high cost
- If consolidation only extracts to a lower shared layer -> low cost

#### 3C. Abstraction Complexity

Ask: "How complex is the shared abstraction?"

- **Simple extraction** (copy to shared, update imports) -> low complexity
- **Parameterized utility** (extract with config options) -> medium complexity
- **Configurable factory/builder** (generate variants from config) -> high complexity

Prefer simpler forms. If the abstraction needs 5+ parameters to cover all variants, it may not be worth it.

#### 3D. Existing Shared Infrastructure

Check what already exists in `src/shared/`, `src/components/common/`, and `src/lib/`:
- Is there already a utility that handles this concern partially?
- Can an existing shared hook/component be extended rather than creating a new one?
- Would the consolidation conflict with or duplicate existing shared code?

#### 3E. Ambiguity and Standards Check

Before recommending consolidation, ask:
- Is it ambiguous whether these repeated implementations are meant to serve the same user journey or different app usage contexts?
- Would the proposed consolidation diverge from industry standards, framework best practices, or established repo conventions?

If usage intent is ambiguous, stop and ask the user a question about how the app will be used so the answer determines whether to consolidate, standardize, or intentionally keep duplication.

If a recommendation would preserve or introduce a standards diversion, ask whether the diversion is intentional or whether to align the plan with best practices.

---

### Phase 4: Prioritization

**SSOT:** [`references/warrant-rubric.md`](references/warrant-rubric.md) — wrong-tool routing, hard gates, scoring, do-not list.

Always apply **hard gates** from that file before scoring. Fail a gate → accepted duplication; do not invent a chat-only rubric.

```
Score = 2×Frequency + 2×Stability + 2×Simplicity + 3×Sameness + 2×SharedBoundary
```

Each factor is **0–2** where **2 = good for sharing**. Range **0–22**. Factor table, boosters, and verdict bands: warrant rubric.

**Priority tiers:**
- **Score ≥12:** Strong candidate — consolidate
- **Score 8–11:** Moderate — consolidate if extraction is simple, otherwise document
- **Score ≤7:** Weak — accept duplication, document as intentional

Never score with `− (Divergence × 3) − (Coupling × 2)` while treating those columns’ **2** as “good for consolidation.”

---

### Phase 5: Present Findings

**CRITICAL: Do not implement without user approval.**

Present the audit as a consolidation map, organized by priority tier.

#### Output Format

```
===============================================================
CONSOLIDATION AUDIT - [Target]
===============================================================

Summary: X findings across Y files
- Strong candidates: N
- Moderate candidates: N
- Accepted duplication: N

---------------------------------------------------------------
STRONG CANDIDATES (Score ≥12)
---------------------------------------------------------------

#1. [Pattern Name] - [Type: Literal/Structural/Conceptual/Inconsistent]
    Score: X | Frequency: N files | Variance: [what differs]

    Occurrences (in-focus):
    - `path/to/file1.ts` (lines X-Y) [Target]
    - `path/to/file2.ts` (lines X-Y) [1-hop]

    Also exists (out-of-focus — not migrated unless you expand):
    - `path/to/other.ts` (lines X-Y)

    What is repeated:
    [Concise description of the shared pattern]

    What varies:
    [Concise description of what is different between copies]

    Proposed consolidation:
    - Target: `path/to/shared/newFile.ts`
    - Approach: [Simple extraction / Parameterized utility / Configurable factory]
    - Estimated scope: [files to modify, lines saved]
    - Risk: [Low/Medium/High - what could break]
    - Usage ambiguity: [None / user question needed / user-confirmed reason]
    - Standards alignment: [Aligned / confirmed intentional diversion / should realign]

    Architecture compliance:
    - Layer: [utils/services/hooks/components per architecture/RULE.mdc]
    - Path alias: [the @/ import path]

---------------------------------------------------------------
MODERATE CANDIDATES (Score 8–11)
---------------------------------------------------------------

[Same format, briefer]

---------------------------------------------------------------
ACCEPTED DUPLICATION (Score ≤7)
---------------------------------------------------------------

[Brief list with reason for acceptance]

===============================================================
RECOMMENDED EXECUTION ORDER:
1. [Quick wins first - simple extractions, inconsistent usage fixes]
2. [Medium scope - parameterized utilities]
3. [Larger scope - structural consolidations]
===============================================================

Which candidates should I implement? (e.g., "#1, #3, #5" or "all strong")
```

**Decision gate:** Wait for user to choose which consolidations to execute. This is the **default stop** for a broad-target audit.

If any finding has unresolved usage ambiguity or an unconfirmed standards diversion, ask that question before asking which candidates to implement.

---

### Phase 6: Execute

Skip this phase on audit-only invocations. For each **user-approved** consolidation, migrate **in-focus files that contain the pattern** (Target ∪ 1-hop neighborhood). Do not rewrite out-of-focus copies unless the user expands Target.

#### 6.1 Pre-flight

- [ ] Verify target location against `architecture/RULE.mdc` layer rules
- [ ] Check `projectStructure.config.cjs` whitelist for target folder
- [ ] Verify no circular dependencies would be created
- [ ] All imports will use path aliases (`@/` prefix)
- [ ] If any protected file must be changed (`.cursor/**`, `projectStructure.config.cjs`, lint/ts config, etc.), stop and get explicit user approval first

#### 6.2 Implementation

1. **Create the shared abstraction** in the correct layer
2. **Migrate consumers one at a time** - each migration is a self-contained change
3. **Verify after each migration** - run lint and type-check
4. **Remove old copies** only after all consumers are migrated

#### 6.3 Post-flight

- [ ] `pnpm validate:all` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm validate:structure` passes
- [ ] `pnpm lint:arch` passes (layer boundaries)
- [ ] No new circular dependencies
- [ ] All imports use `@/` path aliases
- [ ] Feature traceability preserved (can trace any feature in <=5 files)
- [ ] Feature README updated when any `src/features/*` code changed; `pnpm validate:feature-docs:staged` passes for staged changes

#### 6.4 Documentation

- Do **not** edit `CHANGELOG.md` or bump versions here — route to [`finish`](../finish/SKILL.md) after validate when the user wants a commit.
- Update `ARCHITECTURE.md` if new shared patterns are introduced (product/architecture contract, not changelog).

---

## Scoping Options

The user may request different scopes:

| Scope | What to scan | When to use |
|-------|-------------|-------------|
| **Path / glob** | Named folder or glob | Default when user points at an area |
| **Full audit** | Entire `src/` | User asked repo-wide / all features |
| **Feature pair** | Two specific features | After copying a feature as template |
| **Layer audit** | All hooks, all services, or all components under Target | Standardizing one layer |
| **Pattern audit** | One specific pattern (e.g., "table models") inside Target | Known repeated pattern |

Default to the **named Target**. Use **Full audit** (`src/`) only when the user or handoff explicitly asks for repo-wide.

---

## Symbiotic Relationships

This skill is independently complete but works best in concert with sibling skills:

| Sibling | How it complements this skill |
|---------|------------------------------|
| **`optimize2`** | After consolidation identifies a shared abstraction, use optimize2 to ensure it is well-designed (4-level analysis). Optimize2's Rule of Three and Indirection Red Flags are embedded in this skill's Core Principles. |
| **Semantic placement mode** | After consolidation creates new shared code, the [semantic placement mode](references/semantic-placement.md) verifies it is in the correct location. This skill's Phase 6 pre-flight uses those placement rules inline. |
| **`challenge`** | Challenge simplifies a single feature's implementation. Consolidate finds patterns *across* features. Run challenge first to simplify each feature, then consolidate to unify what is left. |
| **`standards-align`** | When the question is industry should/how (not only redundancy), run standards-align first; consolidate after align if cross-feature duplication remains. |
| **`review`** | Review Section F3 scores "Reuse and duplication" per component. Consolidate provides the **Target-wide** perspective that review lacks. |

**Recommended workflow for major cleanup:**
1. `standards-align` when industry alignment is in scope; else `challenge` individual features (simplify each)
2. `consolidate` across features (unify patterns) <- this skill
3. Semantic placement mode (verify everything is in the right place — `references/semantic-placement.md`)
4. `optimize2` on any remaining hotspots (per-function polish)

---

## Anti-Patterns

- **Premature abstraction:** Extracting after seeing only 2 occurrences without checking if they will diverge
- **God utilities:** Creating a single shared file with 20+ exports - keep shared code focused
- **Abstraction for abstraction's sake:** If the shared version is harder to understand than the copies, keep the copies
- **Ignoring variance:** Forcing different things into one abstraction by adding flags/modes - creates complexity
- **Big-bang consolidation:** Migrating all consumers at once - migrate one at a time, verify each step
- **Target = whole `src/`:** Starting with Target = `src/` because the user named one folder
- **Exclusive Target scan:** Never sweeping `src/` for extra copies (blinds Rule of Three)
- **Transitive neighborhood:** Walking callers-of-callers until the audit is the whole app
- **Silent out-of-focus migrate:** Rewriting files outside the Focus set without expanding Target
- **Skipping the discovery phase:** Jumping to "let me extract this" without sweeping for all occurrences first

---

## Boundaries

- Default stop after Phase 5 for audit asks. **Phase 6** only after the user picks candidates (migrate in-focus consumers one at a time). Do not invent a parallel `implement` pass for the same items.
- This skill does not run broad performance optimization (use `optimize2`).
- For architectural *location* correctness beyond placement of new shared code, use this skill's **Semantic placement mode** (`references/semantic-placement.md`).
- This skill does not simplify individual feature workflows (use `challenge`).
- Never claim success without user testing confirmation.
- **Commit only via `finish`** when the user requests a commit.

**Next:** After Phase 6 + checks → **`validate`** → **`finish`** when the user wants a commit; hotspot follow-up → **`optimize2`**.
