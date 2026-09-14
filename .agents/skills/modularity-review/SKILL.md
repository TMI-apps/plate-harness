---
name: modularity-review
description: >-
  Review replaceability of product features and stack slots (MUI, Supabase, Airtable).
  Use whenever a new src/features folder appears, a UI/data vendor is added, the user
  asks how hard it is to replace MUI/Vite/Supabase, or mentions modularity / ports /
  stack leakage — even if they do not say modularity-review. Run pnpm arch:check and
  pnpm modularity:report. Do not unwrap production imports unless the user asks.
---

# modularity-review

Measure **replaceability** (busywork to add/remove/swap a module). **Do not** treat this as `validate` (pass/fail of all repo rules) and **do not** blend the two scores into one number.

## Do

1. `pnpm arch:check` — stack-port ratchet (`stack-port-mui`, `stack-port-supabase`, `stack-port-airtable`). Existing leaks are ignored via `.dependency-cruiser-baseline.json`.
2. `pnpm modularity:report` — Score A (features) and Score B (stack file counts). Exit 0 always.
3. If a **new npm UI/data client** landed and is not a port rule yet: propose a `forbidden` row in `.dependency-cruiser.cjs` (owner must approve protected-file edits). Do not invent matchers without an import in `src/`.
4. If a new `src/features/<key>/` folder exists but Score A omits it: treat as a scorer/`discoverFeatureRoots` bug.

## Do not

- Unwrap `@mui` / swap Vite / move imports unless the user asked for that job.
- Fail CI yourself; `arch:check` already fails on **new** leakage.
- Overwrite `.dependency-cruiser-baseline.json` or `scripts/modularity-baseline.json` unless the owner accepts a new shape (`pnpm arch:baseline` / `pnpm modularity:report --write-baseline`).
- Use a custom import regex walker.
- Gate Vite `import.meta.env`.

## Tiebreak

| Neighbor | This skill vs that |
|----------|-------------------|
| `validate` | `validate` = all rules including these ports. This skill **explains** replaceability and whether a **new slot rule** is needed. |
| `dont-reinvent-the-wheel` | Package search **first**. If a dependency is added, **then** this skill. |
| `review-dev-plan` “modularity” lens | Plan critique, not `src/` scores. |
| `layer-consistency-check` | Before writing a workaround. This skill **after** a module/vendor exists. |
| `consolidate` / `optimize2` | They change code. Score first; refactor only if the user asks. |

## Output

Two tables (or a short summary of them) + worse/better vs last informational baseline if present + optional deferred opportunities. No composite score.

Definitions: `documentation/jobs/temp_job_codebase-modularity/SCORE_DEFINITIONS.md`.
