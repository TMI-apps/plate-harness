# Development plan: Replaceability modularity (hybrid)

## Summary

- **Goal:** Make **add / remove / replace** cheaper as the app grows: measure replaceability on the **existing dependency-cruiser graph**, **stop new stack secrets** outside nominated adapters (grandfather today), and keep a **`modularity-review` skill** that reads those gates — not a second dashboard.
- **Why:** Inform-only scores do not cut busywork. A custom import walker would duplicate depcruise. Port allowlists + baseline ratchet match how this repo already treats architecture (`arch:check`, feature-size).
- **Complexity:** M
- **Plan review:** Waived 2026-09-11 — owner asked implement after hybrid rewrite (second `/review-dev-plan` skipped)
- **Scope / constraints:** No `src/` unwrap. No Vite `import.meta.env` fail rule. Two scores never blended. Protected-file edits limited to cruiser + ESLint + skills (D11, D12). Ledger: sibling `DECISIONS.md`.

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Score definitions + nominated adapters + ratchet vs measure split | Doc classifies a new feature file importing `@mui` as **gate fail**, and a theme file as **allowed** | Done |
| 2 | Thin report CLI wrapping **depcruise JSON/metrics** (no own walker) + tests on **fixture JSON** | CLI prints two tables from depcruise output; adding a fixture feature folder is discovered via `discoverFeatureRoots`; exit 0 for the *report*; tests do not parse raw TS with regex | Done |
| 3 | First human report + **write cruiser/ESLint port rules** + **regenerate depcruise baseline** so current leakage is grandfathered | `pnpm arch:check` green on current tree; a **new** `@mui` import under `src/features/` fails; no production unwrap | Done |
| 4 | `modularity-review` skill + router + `feature` / `plan` / **`implement`** / **`quick-piv`** hooks | Skill tells agent to run `arch:check` + report CLI; boundaries vs `validate`; no second graph | Done |

## Conflict & compliance

- **Applicable rules:** `architecture/RULE.mdc`, `file-placement/RULE.mdc`, `testing/RULE.mdc`, `agent-behavior/RULE.mdc` (D11/D12 are explicit approval to touch `.dependency-cruiser.cjs`, `.dependency-cruiser-baseline.json`, `.eslintrc.json`, `.agents/skills/**`), `git-workflow/RULE.mdc` (Model B), `code-style/RULE.mdc`, `workflow/RULE.mdc`.
- **File placements:**
  - `documentation/jobs/temp_job_codebase-modularity/SCORE_DEFINITIONS.md`
  - `documentation/jobs/temp_job_codebase-modularity/MODULARITY_REPORT.md`
  - `scripts/modularity-report-lib.cjs` — format depcruise JSON + `discoverFeatureRoots` into two tables + delta vs previous JSON snapshot (optional `scripts/modularity-baseline.json` for *informational* feature inbound counts — stack **enforcement** uses cruiser baseline)
  - `scripts/modularity-report.cjs` — spawn `depcruise --output-type json --metrics` with existing config
  - `scripts/modularity-report.test.cjs` — **temp-dir / fixture JSON only** (pattern: `validate-git-workflow.test.cjs`)
  - `package.json` — `modularity:report`; add test to `test:classify`
  - `.dependency-cruiser.cjs` — forbidden: `@mui/*` / `@supabase/*` / `airtable` from `src/features`, `src/pages`, `src/layouts` except nominated adapters
  - `.dependency-cruiser-baseline.json` — regenerate after rules so **today’s** edges are ignored
  - `.eslintrc.json` — `no-restricted-imports` for `@mui/*` in `src/features/**` (overrides: allow `src/components/common/**`, `src/shared/theme/**`) so the IDE fails fast; same grandfather problem: use **overrides per existing files** only if cruiser baseline is insufficient for IDE — **prefer cruiser baseline as SSOT**; ESLint only if it can target `src/features/**` without failing current files. If current feature files would fail ESLint immediately, **do not** add ESLint until unwrap — **cruiser+baseline only** for v1 ratchet. Decide in Phase 3: if ESLint cannot grandfather cheaply, skip ESLint (protected-file minimization).
  - `.agents/skills/modularity-review/SKILL.md` + router + hooks
- **Reuse / packages:** **Ride dependency-cruiser.** Reuse `discoverFeatureRoots`. No madge/skott/regex import graph. `dont-reinvent-the-wheel`: already covered by in-repo depcruise.
- **Risks:** Regenerating cruiser baseline is a protected, easy-to-get-wrong file. Vite remains unenforceable. ESLint vs cruiser double-gate if both added. Skill must not be confused with `validate`.
- **Standards:** Hybrid = Ford fitness function **ratchet** (industry) + grandfather (this repo’s existing baseline pattern). Inform-only leftover only for Vite qualitative line and feature inbound *counts*.
- **Feature decomposition:** No new `src/features/*`.
- **Database / security / UI:** None. No unwrap.

## Pattern & precedent

| Field | Value |
|-------|--------|
| **Capability** | Replaceability measurement + **new-leakage fitness function** |
| **Precedents** | Parnas information hiding; hexagonal ports; Neal Ford fitness functions **in CI**; **dependency-cruiser** (this stack’s graph + baseline); NDepend-style coupling as *readout*, not a second engine |
| **Aspects reviewed** | Coupling, operability (ratchet vs dashboard), extensibility (new feature discovered; new vendor = new forbidden `to.path`) |
| **Findings** | Aligns with repo `arch:check` culture. Diverges from “block until MUI-free.” Vite not gated. D10: score raw, gate allowlisted. |
| **Verdict** | `Aligns with precedent` for stack ratchet; `Acceptable product-specific` for grandfather + no Vite rule |
| **If non-standard: options** | N/A — owner picked hybrid after rebel weigh |

## Method

**Secret** = knowledge you must touch to replace a module.

### Score A — features (measure, mostly not fail)

Discover via `discoverFeatureRoots` (nested keys, longest prefix). From depcruise modules:

- **Inbound:** files outside the feature that depend on it (pages/layouts expected = **wiring**, listed separately).
- **Outbound:** feature → other features (already `no-cross-feature-internals`) or → stack packages.
- **Size vs budget:** existing `feature-size-lib` — optional column, not the grade.

High inbound to *internals* = hard to delete. Wiring-only inbound = expected.

### Score B — stack slots (measure + ratchet)

| Slot | Measure | v1 ratchet |
|------|---------|------------|
| **MUI** | files importing `@mui/*` | **Yes** — new deps from features/pages/layouts except `src/components/common/**` and `src/shared/theme/**` |
| **Supabase** | files importing `@supabase/*` | **Yes** — new deps except `src/shared/services/supabaseService.ts` (and existing grandfathered files) |
| **Airtable** | `airtable` package | **Yes** — only `src/shared/services/airtableService.ts` (likely already unique; rule still documents the port) |
| **Vite** | `import.meta.env` / `hot` / `glob` in `src/` if visible in graph | **No** — qualitative in report only |

**Score** stays raw file counts (honest busywork). **Gate** uses nominated adapters for *new* edges. Existing violations → `.dependency-cruiser-baseline.json` after adding rules (`pnpm arch:baseline` or project equivalent).

### Composite

None.

### Growth

- New feature folder → appears in Score A next report; must not import `@mui` / `@supabase` (ratchet).
- New vendor → skill asks “add a forbidden `to.path`?” — not auto-score every npm package.
- No custom slots JSON scorer; cruiser rules **are** the slot list.

## Existing functionality

- `pnpm arch:check`, `.dependency-cruiser.cjs`, `.dependency-cruiser-baseline.json`
- `discoverFeatureRoots` / feature-size
- Partial ports: `supabaseService.ts`, `airtableService.ts`, theme + `components/common` (MUI kit, not exclusive)
- `no-restricted-imports` already used for `../` and `internal/`

## Scope / out-of-scope

**In:** definitions, depcruise-backed report CLI, port rules + baseline regen, first `MODULARITY_REPORT.md`, skill + router + implement/quick-piv hooks.

**Out:** Moving `@mui` imports; Vite fail rule; custom regex walker; blended index; Husky edits; permanent `DOC_*` unless later asked.

## Phase 1 — Definitions

**Steps**

1. Write `SCORE_DEFINITIONS.md`: Score A/B, wiring vs inbound, adapters list, grandfather meaning, Vite not gated.
2. Example: new `src/features/foo/components/X.tsx` importing `@mui/material` → **error**. `src/shared/theme/defaultTheme.ts` → **allowed**.

**Gate:** Those two examples are unambiguous in the doc.

## Phase 2 — Report CLI (formatter, not a graph)

**Steps**

1. Spawn existing `depcruise --config .dependency-cruiser.cjs --output-type json --metrics src` (or equivalent API).
2. Map modules to feature keys via `discoverFeatureRoots` + longest prefix.
3. Print markdown + `--format=json` two tables; optional informational delta vs `scripts/modularity-baseline.json` (feature inbound counts). **Exit 0 always** for this CLI — **failures live in `arch:check`**.
4. Tests: fixture **depcruise-like JSON** in temp dir; `should attribute a module to admin/billing when that feature root exists`; `should not count a baseline-grandfathered MUI edge as a new ratchet in the *report* (report still lists raw count)`; `should not blend totals`; `should exit 0 when stack file counts are high`.
5. `pnpm modularity:report` + `test:classify`.

**Gate:** Tests pass; real-tree CLI lists discovered features with **no** `auth`/`tasks` string literals in the scorer.

## Phase 3 — Report + ratchet

**Steps**

1. Run report; write `MODULARITY_REPORT.md` (busywork, opportunities **deferred** — no unwrap).
2. Add cruiser `forbidden` rules per D9 ratchet. **Do not** fail the current tree: regenerate `.dependency-cruiser-baseline.json`.
3. ESLint: only if `src/features/**` restriction can apply to **new** files without red-lighting grandfathered files (e.g. not feasible → skip ESLint, cruiser-only). Document the choice in Notes during development.
4. Prove: add a throwaway import in a scratch thought-test or unit-style path assertion; **do not leave** a violating file. Manual: `arch:check` green now; implementing a new feature with `@mui` would fail.

**Gate:** `pnpm arch:check` passes on HEAD; rule names exist in `.dependency-cruiser.cjs`; report numbers match CLI.

## Phase 4 — Skill

**Steps**

1. `modularity-review/SKILL.md` (create-skill): trigger on new feature, new UI/data vendor, replace-MUI questions. **Do:** `pnpm arch:check` + `pnpm modularity:report`. **Do not:** unwrap; blend scores; invent matchers; treat as `validate`. Tiebreak: `dont-reinvent-the-wheel` first on new packages, then this skill if a dep is added; `validate` = rule pass/fail including these new cruiser rules; this skill = **explain replaceability + whether a new slot rule is needed**.
2. Router situation + index + overlap vs `validate` / `review-dev-plan` “modularity” lens / `layer-consistency-check`.
3. Hooks: `plan` Investigate; `feature` after module named; **`implement` after creating a feature folder**; **`quick-piv` before finish** if `src/features` or new vendor.
4. No `AGENTS.md` body dump.

**Gate:** Router row exists; SKILL.md states ratchet (D4) vs report (inform counts); implement hook location is a real heading/step in `implement/SKILL.md`.

## Notes during development

- Plan review waived (owner said implement after hybrid rewrite).
- `pnpm exec depcruise` + `shell: true` — package `exports` block `require.resolve` of the depcruise bin.
- Removed `node_modules` from cruiser `exclude.path` so pnpm nested `@mui` edges exist. Do not restore.
- `cache: false` on cruiser — content cache returned empty graphs (`report: from cache`) and hid npm deps.
- `progress: { type: "none" }` so `arch:baseline` stdout stays JSON.
- `arch:check` / `arch:check:ci` now pass `--ignore-known .dependency-cruiser-baseline.json` (was unwired).
- ESLint `no-restricted-imports` for `@mui` in features **skipped** — current feature/page files would go red; cruiser+baseline is v1 SSOT.
- Score B Supabase often **0** in graph (type-only / service file cruise without a visible `@supabase` npm edge). Ratchet still matches `node_modules/@supabase/`.
- Informational snapshot: `scripts/modularity-baseline.json`. Enforcement snapshot: `.dependency-cruiser-baseline.json` (64 known violations ignored after regen).
- `pnpm arch:check` green after baseline: 147 modules, 319 deps, 64 known ignored.
- Throwaway `temp_stack_port_probe.tsx` importing `@mui/material/Box` from `src/features/tasks` failed `stack-port-mui` (then deleted).

## Decisions made

Impl-time only (`implement` fills). Product/scope → `DECISIONS.md`.

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
| I1 | ESLint dual-gate | Skip ESLint for v1; cruiser+baseline only | Plan Phase 3: skip if grandfather not cheap |
| I2 | Graph visibility | Do not exclude `node_modules`; disable cruiser cache | Needed for pnpm nested vendor paths |
| I3 | Second plan review | Waived | Owner implement after hybrid rewrite |
