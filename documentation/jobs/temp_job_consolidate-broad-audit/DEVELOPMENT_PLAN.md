# Development plan: Consolidate broad-target audit

## Summary

- **Goal:** Align `consolidate` (and sibling pointers) with `DECISIONS.md` D1–D9: named Target, audit-then-stop, warrant rubric, **broad sweep / focused report**, 1-hop import neighborhood, execute in-focus pattern files only.
- **Why:** Landed skill still says “scan only Target”; ledger says the opposite for discovery vs focus.
- **Complexity:** S — skill/docs only; no app code, schema, or auth.
- **Plan review:** Not required
- **Scope / constraints:** `.agents/skills/consolidate/**`, thin `router` / `improve` / `warrant-rubric` lines. No `src/` product code. No discovery-budget cap, no semantic-placement deepening lens (D3). Product locks: sibling `DECISIONS.md` (do not duplicate).

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Patch consolidate (+ warrant/router/improve) to D5–D9 sweep/focus/execute | Skill text matches ledger; no silent whole-`src/` Target; warrant Frequency = all hits | Done |

## Conflict & compliance

- Applicable rules: `file-placement/RULE.mdc` (skills under `.agents/skills/<name>/`, `references/` ok); `agent-behavior/RULE.mdc` (protected skills — user “proceed” after “patch skill” = consent); `workflow/RULE.mdc` (no changelog here); `git-workflow/RULE.mdc` Model B (`src/config/git-workflow.json`).
- File placements: edit existing `SKILL.md`, `references/warrant-rubric.md`; no new skill folders; job docs already under `documentation/jobs/temp_job_consolidate-broad-audit/`.
- Reuse / packages: skipped — bespoke agent procedure, not a library subsystem.
- Risks: agents still treat Target as exclusive scan if wording stays “scan only”; 1-hop neighborhood can be large — D8 forbids transitive.
- Open questions: none (ledger closed).
- Standards diversions: none. Audit-then-stop matches existing Phase 5 gate.

## Pattern & precedent

**Pattern review:** skipped — Complexity S; no user-facing app contract. Agent-skill scan/focus is internal procedure.

## Phase 1: Sweep / focus / execute wording

### Goal

`consolidate` discovers with a **broad `src/` sweep**, reports and executes on **Target ∪ 1-hop callers/callees**, scores Frequency on **all** same-pattern hits, leaves leftover hits out-of-focus.

### Steps

1. Update `.agents/skills/consolidate/SKILL.md`:
   - Required Input: Target = focus root, **not** exclusive search root. Missing Target → ask once (unchanged).
   - After Target resolve: build **Focus set** = Target files ∪ 1-hop `src/` importers ∪ 1-hop `src/` importees (`@/` / project files only; not `node_modules`; **not** transitive — D8).
   - Phase 1: derive candidate shapes from Target; **sweep `src/`** for more copies (D5). Tag each occurrence **in-focus** vs **out-of-focus**.
   - Phase 5 template: list in-focus first; out-of-focus as “also exists (not migrated unless you expand)”.
   - Phase 6: migrate **in-focus files that contain the pattern** (D7). Do not migrate out-of-focus without a new Target/expand ask.
   - Anti-patterns: replace “never search outside Target” with “never treat whole `src/` as the Target” and “never skip the broad sweep after Target is named”.
2. Update `.agents/skills/consolidate/references/warrant-rubric.md`: Frequency/gates count **all** same-pattern sites from the sweep (D9); focus/execute still Focus set.
3. Keep `router` Target language; add one line that audit = sweep + 1-hop focus, not exclusive-path scan.
4. `improve` handoff “Remove repeated work”: pass Target; child uses sweep + focus (not silent full-repo Target).

### Gate

- `SKILL.md` + warrant no longer say exclusive Target scan.
- D5–D9 each have a matching paragraph (Focus set, 1-hop, sweep, execute in-focus, Frequency = all hits).
- D3 non-goals still absent (no budget cap, no deepening lens).

## Notes during development

- 2026-09-18 — Phase 1: patched `consolidate/SKILL.md`, `warrant-rubric.md`, `router` overlap, `improve` handoff. No app `src/` changes.

## Decisions made

Impl-time only (`implement` fills). Product/scope forks → sibling `DECISIONS.md`.

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
| 1 | Edit protected `.agents/skills/**` | User “proceed” after “next: plan then patch skill” | Yes — explicit this thread |
| 2 | 1-hop = direct import edges under `src/` only | Matches D8; not tests-only, not node_modules | No (ledger) |